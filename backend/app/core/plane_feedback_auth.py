"""Plane BFF 专用请求 HMAC，绑定正文、URL、工作区、身份及授权范围。"""

import base64
import hashlib
import hmac
import json
import time
from datetime import UTC, datetime, timedelta
from typing import Literal

from fastapi import HTTPException, Request
from pydantic import BaseModel, Field, ValidationError
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.infra.mongo import get_feedback_database


class PlaneFeedbackPrincipal(BaseModel):
    """仅可信 Plane 后端可签发的当前用户及工作区权限。"""

    workspace_id: str = Field(min_length=1, max_length=64)
    user_id: str = Field(min_length=1, max_length=64)
    username: str = Field(min_length=1, max_length=100)
    scope: Literal["self", "org", "workspace"] = "self"
    org_unit_id: str | None = Field(default=None, max_length=64)
    org_unit_ids: list[str] = Field(default_factory=list, max_length=1000)
    permissions: list[Literal["submit", "read", "manage"]] = Field(default_factory=list)


async def require_plane_feedback(request: Request) -> PlaneFeedbackPrincipal:
    """验证请求签名、短时效及数据库防重放 nonce。

    Args:
        request: Plane 后端代理的原始请求。

    Returns:
        经过认证的工作区和用户授权，失败返回 401/503。
    """
    secret = settings.plane_feedback_secret
    if len(secret) < 32 or secret == settings.auth_secret:
        raise HTTPException(503, "Plane 反馈服务尚未配置独立密钥")
    timestamp = request.headers.get("X-Plane-Timestamp", "")
    nonce = request.headers.get("X-Plane-Nonce", "")
    principal_header = request.headers.get("X-Plane-Principal", "")
    signature = request.headers.get("X-Plane-Signature", "")
    try:
        if abs(int(timestamp) - int(time.time())) > 60 or not 16 <= len(nonce) <= 128:
            raise ValueError()
        principal = PlaneFeedbackPrincipal.model_validate(
            json.loads(base64.urlsafe_b64decode(principal_header))
        )
    except (ValueError, ValidationError, TypeError):
        raise HTTPException(401, "Plane 反馈认证无效或过期") from None
    body = await request.body()
    if len(body) > 31 * 1024 * 1024:
        raise HTTPException(413, "反馈截图总量超限")
    target = request.url.path + (f"?{request.url.query}" if request.url.query else "")
    material = "\n".join(
        [
            request.method.upper(),
            target,
            timestamp,
            nonce,
            principal_header,
            hashlib.sha256(body).hexdigest(),
        ]
    )
    expected = hmac.new(secret.encode(), material.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(401, "Plane 反馈签名无效")
    try:
        get_feedback_database().feedback_nonces.insert_one(
            {
                "nonce": nonce,
                "expires_at": datetime.now(UTC) + timedelta(minutes=2),
            }
        )
    except DuplicateKeyError:
        raise HTTPException(401, "反馈请求已使用，请重新签发请求") from None
    return principal


def feedback_scope(principal: PlaneFeedbackPrincipal, *, manage=False) -> dict:
    """生成所有列表、截图和状态操作共用的数据库权限条件。

    Args:
        principal: 已验证的 Plane 授权。
        manage: 是否要求处置权限。

    Returns:
        MongoDB 范围条件；缺少权限时返回 403。
    """
    if ("manage" if manage else "read") not in principal.permissions:
        raise HTTPException(403, "没有反馈操作权限")
    query = {"platform": "plane", "workspace_id": principal.workspace_id}
    if principal.scope == "self":
        if manage:
            raise HTTPException(403, "本人查询授权不允许处置")
        query["user_id"] = principal.user_id
    elif principal.scope == "org":
        query["org_unit_id"] = {"$in": principal.org_unit_ids}
    return query
