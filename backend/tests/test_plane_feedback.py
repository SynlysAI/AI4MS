"""真实隔离 MongoDB/GridFS 验证 Plane 请求、截图和范围契约。"""

import base64
import hashlib
import hmac
import io
import json
import os
import time
import uuid

import httpx
import pytest
from fastapi.testclient import TestClient
from PIL import Image

os.environ.setdefault("AUTH_ENABLED", "false")
os.environ.setdefault("MONGODB_URI", "mongodb://127.0.0.1:27118")
os.environ.setdefault("MONGODB_DB", "ai4ms_feedback_contract_tests")
os.environ.setdefault(
    "PLANE_FEEDBACK_SECRET", "isolated-feedback-test-key-0000000000000000"
)

from app.core.config import settings
from app.infra.mongo import get_feedback_database, get_feedbacks_collection
from app.main import app


@pytest.fixture
def client():
    """启动隔离数据库连接，每例清理反馈、nonce 与截图。"""
    with TestClient(app) as instance:
        database = get_feedback_database()
        for name in (
            "feedbacks",
            "feedback_nonces",
            "feedback_screenshots.files",
            "feedback_screenshots.chunks",
        ):
            database[name].delete_many({})
        yield instance


def principal(user="student", scope="self", units=None, workspace="workspace-1"):
    """构造可信 BFF 签发的测试授权。"""
    return {
        "workspace_id": workspace,
        "user_id": user,
        "username": user,
        "scope": scope,
        "org_unit_id": "group-1",
        "org_unit_ids": units or [],
        "permissions": ["submit", "read", "manage"],
    }


def send(
    client,
    method,
    target,
    actor=None,
    body=b"",
    content_type="application/json",
    timestamp=None,
):
    """对完整请求签名，包括 multipart 的实际字节。"""
    identity = base64.urlsafe_b64encode(
        json.dumps(actor or principal(), separators=(",", ":")).encode()
    ).decode()
    stamp = str(timestamp or int(time.time()))
    nonce = uuid.uuid4().hex
    material = "\n".join(
        [method, target, stamp, nonce, identity, hashlib.sha256(body).hexdigest()]
    )
    headers = {
        "X-Plane-Timestamp": stamp,
        "X-Plane-Nonce": nonce,
        "X-Plane-Principal": identity,
        "X-Plane-Signature": hmac.new(
            settings.plane_feedback_secret.encode(), material.encode(), hashlib.sha256
        ).hexdigest(),
        "Content-Type": content_type,
    }
    return client.request(method, target, content=body, headers=headers)


def image_bytes(format_name="PNG"):
    """创建真实可解码的截图。"""
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), "white").save(buffer, format=format_name)
    return buffer.getvalue()


def submission(client, actor=None, key=None, screenshots=None, content="测试反馈"):
    """构造正式 multipart 提交。"""
    payload = {
        "content": content,
        "feedback_type": "bug",
        "path": "/reports?token=removed#private",
        "browser": "test-browser",
        "idempotency_key": key or uuid.uuid4().hex,
    }
    files = [("payload", (None, json.dumps(payload)))] + [
        ("screenshots", ("screenshot", data, mime))
        for data, mime in (screenshots or [])
    ]
    request = httpx.Request("POST", "http://test/api/v1/plane-feedback", files=files)
    body = request.read()
    return send(
        client,
        "POST",
        "/api/v1/plane-feedback",
        actor,
        body,
        request.headers["Content-Type"],
    )


def test_screenshots_idempotency_and_scope(client):
    key = uuid.uuid4().hex
    files = [
        (image_bytes(), "image/png"),
        (image_bytes("JPEG"), "image/jpeg"),
        (image_bytes("WEBP"), "image/webp"),
    ]
    created = submission(client, key=key, screenshots=files)
    assert created.status_code == 200, created.text
    record = created.json()["data"]
    assert record["path"] == "/reports"
    assert len(record["screenshots"]) == 3
    assert (
        submission(client, key=key, screenshots=files).json()["data"]["feedback_id"]
        == record["feedback_id"]
    )
    assert get_feedbacks_collection().count_documents({}) == 1
    assert submission(client, key=key, content="不同内容").status_code == 409
    target = f"/api/v1/plane-feedback/{record['feedback_id']}/screenshots/{record['screenshots'][0]['id']}"
    assert send(client, "GET", target).content == files[0][0]
    assert send(client, "GET", target, principal("other")).status_code == 404
    assert (
        send(client, "GET", target, principal("pi", "org", ["group-2"])).status_code
        == 404
    )
    assert (
        send(client, "GET", target, principal("pi", "org", ["group-1"])).status_code
        == 200
    )
    assert (
        send(
            client, "GET", "/api/v1/plane-feedback", principal(workspace="workspace-2")
        ).json()["data"]["count"]
        == 0
    )


def test_status_audit_and_explicit_delete(client):
    record = submission(client, screenshots=[(image_bytes(), "image/png")]).json()[
        "data"
    ]
    target = f"/api/v1/plane-feedback/{record['feedback_id']}/status"
    assert (
        send(
            client,
            "PATCH",
            target,
            body=json.dumps({"status": "done", "comment": "完成"}).encode(),
        ).status_code
        == 403
    )
    for status in ("in_progress", "done", "closed", "open"):
        result = send(
            client,
            "PATCH",
            target,
            principal("pi", "org", ["group-1"]),
            json.dumps({"status": status, "comment": "处理说明"}).encode(),
        )
        assert result.status_code == 200, result.text
    history = result.json()["data"]["history"]
    assert (
        len(history) == 4
        and history[0]["from_status"] == "open"
        and history[0]["actor"] == "pi"
    )
    assert (
        send(
            client,
            "DELETE",
            target.removesuffix("/status"),
            principal("admin", "workspace"),
        ).status_code
        == 200
    )
    assert (
        get_feedback_database()["feedback_screenshots.files"].count_documents({}) == 0
    )


@pytest.mark.parametrize(
    "data,mime",
    [
        (b"MZfake", "image/png"),
        (image_bytes(), "image/jpeg"),
        (b"", "image/png"),
        (b"x" * (10 * 1024 * 1024 + 1), "image/png"),
    ],
)
def test_invalid_screenshot(client, data, mime):
    assert submission(client, screenshots=[(data, mime)]).status_code == 422
    assert get_feedbacks_collection().count_documents({}) == 0


def test_hmac_binding_expiration_and_replay(client):
    request = send(client, "GET", "/api/v1/plane-feedback")
    assert request.status_code == 200
    assert (
        client.request(
            "GET", "/api/v1/plane-feedback", headers=request.request.headers
        ).status_code
        == 401
    )
    assert (
        client.request(
            "GET", "/api/v1/plane-feedback?q=changed", headers=request.request.headers
        ).status_code
        == 401
    )
    assert (
        send(
            client, "GET", "/api/v1/plane-feedback", timestamp=int(time.time()) - 120
        ).status_code
        == 401
    )


def test_server_filters_and_historical_records(client):
    submission(client, content="关键词甲")
    submission(client, principal("other"), content="关键词乙")
    get_feedbacks_collection().insert_one(
        {"feedback_id": "legacy", "platform": "spec_agent", "content": "历史"}
    )
    own = send(client, "GET", "/api/v1/plane-feedback?q=" + "甲")
    # 使用 URL 编码后的目标签名。
    if own.status_code == 401:
        own = send(client, "GET", "/api/v1/plane-feedback?q=%E7%94%B2")
    assert own.json()["data"]["count"] == 1
    assert (
        send(
            client, "GET", "/api/v1/plane-feedback", principal("admin", "workspace")
        ).json()["data"]["count"]
        == 2
    )
