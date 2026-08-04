"""Token 生成/校验 + FastAPI 鉴权依赖注入守卫。

与 Spec_Agent 使用完全相同的 Token 格式，确保 SSO 兼容。
Token 格式：{base64(payload)}.{hmac_signature}
"""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional

from fastapi import Depends, HTTPException, Request

from app.core.config import settings
from app.infra.repositories import UserRepository


def _get_secret() -> bytes:
    """获取 HMAC 签名密钥。

    优先使用 AUTH_SECRET 环境变量，否则从项目路径 + 用户名密码派生。
    与 Spec_Agent 保持完全一致的派生逻辑。
    """
    if settings.auth_secret:
        return settings.auth_secret.encode("utf-8")
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    material = f"{project_root}_ai4ms_portal".encode("utf-8")
    return hashlib.sha256(material).digest()


def generate_access_token(
    user_id: str,
    username: str,
    role: str,
    organization: str = "",
) -> str:
    """生成自签名 access token。

    Args:
        user_id: 用户唯一 ID。
        username: 用户名。
        role: 用户角色（admin 或 user）。
        organization: 用户所属组织。

    Returns:
        伪 JWT 格式的 token 字符串。
    """
    now = int(time.time())
    expire_hours = settings.auth_token_expire_hours
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "organization": organization,
        "iat": now,
        "exp": now + expire_hours * 3600,
    }
    payload_b64 = base64.urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":")).encode()
    ).rstrip(b"=").decode()
    secret = _get_secret()
    sig = hmac.new(secret, payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def parse_access_token(token: str) -> Optional[dict]:
    """校验并解析 access token。

    Args:
        token: 完整的 token 字符串（含签名）。

    Returns:
        成功返回 payload 字典，失败返回 None。
    """
    try:
        payload_b64, sig = token.rsplit(".", 1)
    except (ValueError, AttributeError):
        return None
    expected_sig = hmac.new(_get_secret(), payload_b64.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_sig, sig):
        return None
    try:
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
    except Exception:
        return None
    if payload.get("role") not in ("admin", "user"):
        return None
    if payload.get("exp", 0) < int(time.time()):
        return None
    return payload


def _extract_token(request: Request) -> Optional[str]:
    """从请求头提取 Bearer token。"""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


async def get_current_user(request: Request) -> dict:
    """强制解析当前登录用户，未认证返回 401。"""
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="未提供认证令牌")
    payload = parse_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="令牌无效或已过期")
    user = UserRepository.find_by_user_id(payload["sub"])
    if not user or user.get("status") != "active":
        raise HTTPException(status_code=401, detail="用户不存在或已被禁用")
    return user


async def get_current_user_optional(request: Request) -> Optional[dict]:
    """可选解析当前用户，未认证返回 None。"""
    token = _extract_token(request)
    if not token:
        return None
    payload = parse_access_token(token)
    if not payload:
        return None
    user = UserRepository.find_by_user_id(payload["sub"])
    return user if user and user.get("status") == "active" else None


async def require_authenticated(
    request: Request,
    user: Optional[dict] = Depends(get_current_user_optional),
) -> dict:
    """要求已登录（auth_enabled=false 时放行）。"""
    if not settings.auth_enabled:
        return user or {
            "user_id": "anon",
            "username": "anonymous",
            "role": "user",
            "status": "active",
            "organization": "",
        }
    if not user:
        raise HTTPException(status_code=401, detail="需要登录")
    return user


async def require_admin(user: dict = Depends(require_authenticated)) -> dict:
    """要求 admin 角色，否则返回 403。"""
    if not settings.auth_enabled:
        return user
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user
