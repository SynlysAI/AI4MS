"""AI4MS 自有反馈 API 与 Plane 历史数据隔离回归。"""

import os

os.environ.setdefault("AUTH_ENABLED", "false")
os.environ.setdefault("MONGODB_URI", "mongodb://127.0.0.1:27118")
os.environ.setdefault("MONGODB_DB", "ai4ms_feedback_api_tests")

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.infra.mongo import get_feedbacks_collection
from app.main import app


@pytest.fixture
def client():
    """启动测试应用，并准备一条待隔离的 Plane 历史记录。"""
    with TestClient(app) as instance:
        collection = get_feedbacks_collection()
        collection.delete_many({})
        collection.insert_one(
            {
                "feedback_id": "fb_legacy_plane",
                "platform": "plane",
                "feedback_type": "bug",
                "content": "Legacy Plane feedback",
                "user_id": "plane-user",
                "username": "Plane user",
                "status": "in_progress",
            }
        )
        yield instance
        collection.delete_many({})


def test_own_feedback_submission_and_admin_list(client):
    response = client.post(
        "/api/v1/feedback",
        json={
            "platform": "spec_agent",
            "feedback_type": "bug",
            "content": " Spectrum upload fails ",
        },
    )
    listed = client.get("/api/v1/feedback")

    assert response.status_code == 200, response.text
    assert response.json()["data"]["feedback_id"].startswith("fb_")
    assert listed.status_code == 200
    records = listed.json()["data"]
    assert [record["platform"] for record in records] == ["spec_agent"]
    assert records[0]["content"] == "Spectrum upload fails"


def test_own_feedback_keeps_four_statuses_and_history(client):
    feedback_id = client.post(
        "/api/v1/feedback",
        json={"platform": "ragportal", "feedback_type": "idea", "content": "Add dataset export"},
    ).json()["data"]["feedback_id"]
    updated = client.patch(
        f"/api/v1/feedback/{feedback_id}/status",
        json={"status": "in_progress", "comment": "Assigned to platform owner"},
    )
    listed = client.get("/api/v1/feedback").json()["data"]

    assert updated.status_code == 200, updated.text
    assert listed[0]["status"] == "in_progress"
    assert listed[0]["history"][0]["from_status"] == "open"
    assert listed[0]["history"][0]["to_status"] == "in_progress"
    assert listed[0]["history"][0]["comment"] == "Assigned to platform owner"

    empty = client.patch(
        f"/api/v1/feedback/{feedback_id}/status",
        json={"status": "done", "comment": " "},
    )
    assert empty.status_code == 422


def test_plane_platform_is_rejected_and_removed_api_is_not_found(client):
    rejected = client.post(
        "/api/v1/feedback",
        json={"platform": "plane", "feedback_type": "bug", "content": "Must not enter AI4MS"},
    )
    removed = client.get("/api/v1/plane-feedback")

    assert rejected.status_code == 422
    assert removed.status_code == 404
    assert removed.json()["detail"] == "API 路径不存在"
    assert not hasattr(settings, "plane_feedback_secret")


def test_legacy_plane_records_are_immutable_and_invisible(client):
    own = client.post(
        "/api/v1/feedback",
        json={"platform": "poly_agent", "feedback_type": "ux", "content": "Own feedback"},
    ).json()["data"]["feedback_id"]
    listed = client.get("/api/v1/feedback").json()["data"]
    patched = client.patch(
        "/api/v1/feedback/fb_legacy_plane/status",
        json={"status": "done", "comment": "Must not mutate Plane history"},
    )
    deleted = client.delete("/api/v1/feedback/fb_legacy_plane")
    legacy = get_feedbacks_collection().find_one({"feedback_id": "fb_legacy_plane"})

    assert [record["feedback_id"] for record in listed] == [own]
    assert patched.status_code == deleted.status_code == 404
    assert legacy["status"] == "in_progress"


def test_app_and_openapi_version_are_2_0_0(client):
    assert client.get("/openapi.json").json()["info"]["version"] == "2.0.0"
