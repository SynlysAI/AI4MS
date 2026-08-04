"""用户注册与登录业务逻辑。"""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timezone

from app.infra.repositories import UserRepository, InviteCodeRepository
from app.core.auth import generate_access_token
from app.models.identity import UserRole


def _hash_password(password: str) -> str:
    """PBKDF2-SHA256 密码哈希。

    Args:
        password: 明文密码。

    Returns:
        格式：pbkdf2_sha256$260000${salt.hex()}${{hash.hex()}}。
    """
    iterations = 260_000
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${dk.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    """验证密码是否匹配。

    同时支持旧版纯 SHA256 格式的兼容验证。
    """
    if "$" not in stored_hash:
        return hmac.compare_digest(
            hashlib.sha256(password.encode()).hexdigest(),
            stored_hash,
        )
    try:
        algo, iterations_str, salt_hex, hash_hex = stored_hash.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations_str))
        return hmac.compare_digest(dk, expected)
    except (ValueError, TypeError):
        return False


def register(invite_code: str, username: str, password: str,
             organization: str = "") -> dict:
    """用户注册 — 邀请码验证 + 创建用户。

    Args:
        invite_code: 邀请码。
        username: 用户名。
        password: 明文密码。
        organization: 单位名称。

    Returns:
        包含 token 和用户信息的字典。
    """
    invite = InviteCodeRepository.find_by_code(invite_code)
    if not invite:
        raise ValueError("邀请码无效")
    if invite["status"] != "active":
        raise ValueError("邀请码已失效")
    if invite["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise ValueError("邀请码已过期")
    if invite["used_count"] >= invite["max_uses"]:
        raise ValueError("邀请码已用完")

    existing = UserRepository.find_by_username(username)
    if existing:
        raise ValueError("用户名已存在")

    updated = InviteCodeRepository.atomic_consume(invite["invite_id"])
    if updated is None:
        raise ValueError("邀请码已被使用或已过期")

    try:
        password_hash = _hash_password(password)
        user = UserRepository.create(
            username=username,
            password_hash=password_hash,
            role=invite["role"],
            organization=organization,
            created_by=invite["created_by"],
        )
    except Exception:
        InviteCodeRepository.rollback_usage(invite["invite_id"])
        raise

    UserRepository.update_login_time(user.user_id)
    token = generate_access_token(
        user.user_id,
        user.username,
        user.role,
        user.organization,
    )
    return {
        "token": token,
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "role": user.role,
            "organization": user.organization,
        },
    }


def login(username: str, password: str) -> dict:
    """用户登录。

    Args:
        username: 用户名。
        password: 明文密码。

    Returns:
        包含 token 和用户信息的字典。

    Raises:
        ValueError: 用户名或密码错误，或用户已被禁用。
    """
    user = UserRepository.find_by_username(username)
    if not user:
        raise ValueError("用户名或密码错误")
    if user["status"] != "active":
        raise ValueError("用户已被禁用")
    if not _verify_password(password, user["password_hash"]):
        raise ValueError("用户名或密码错误")
    UserRepository.update_login_time(user["user_id"])
    token = generate_access_token(
        user["user_id"],
        user["username"],
        user["role"],
        user.get("organization", ""),
    )
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
            "organization": user.get("organization", ""),
        },
    }
