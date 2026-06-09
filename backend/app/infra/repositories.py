"""用户与邀请码数据仓储层。"""

import secrets
from datetime import datetime
from typing import Optional

from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

from app.infra.mongo import get_users_collection, get_invite_codes_collection
from app.models.identity import UserRecord, InviteCodeRecord, UserRole, UserStatus


def _gen_id(prefix: str) -> str:
    """生成带前缀的随机 ID。"""
    return f"{prefix}_{secrets.token_hex(6)}"


class UserRepository:
    """用户数据访问层（MongoDB users 集合）。"""

    @staticmethod
    def get_collection() -> Collection:
        return get_users_collection()

    @staticmethod
    def find_by_username(username: str) -> Optional[dict]:
        return UserRepository.get_collection().find_one({"username": username})

    @staticmethod
    def find_by_user_id(user_id: str) -> Optional[dict]:
        return UserRepository.get_collection().find_one({"user_id": user_id})

    @staticmethod
    def create(username: str, password_hash: str, role: UserRole,
               organization: str, created_by: Optional[str]) -> UserRecord:
        doc = {
            "user_id": _gen_id("u"),
            "username": username,
            "password_hash": password_hash,
            "role": role,
            "status": "active",
            "organization": organization,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login_at": None,
            "created_by": created_by,
        }
        try:
            UserRepository.get_collection().insert_one(doc)
        except DuplicateKeyError:
            raise ValueError("用户名已存在")
        return UserRecord(**doc)

    @staticmethod
    def update_login_time(user_id: str) -> None:
        now = datetime.utcnow()
        UserRepository.get_collection().update_one(
            {"user_id": user_id},
            {"$set": {"last_login_at": now, "updated_at": now}},
        )

    @staticmethod
    def update_status(user_id: str, status: UserStatus) -> None:
        UserRepository.get_collection().update_one(
            {"user_id": user_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}},
        )

    @staticmethod
    def list_all() -> list[dict]:
        return list(UserRepository.get_collection().find().sort("created_at", -1))


class InviteCodeRepository:
    """邀请码数据访问层（MongoDB invite_codes 集合）。"""

    @staticmethod
    def get_collection() -> Collection:
        return get_invite_codes_collection()

    @staticmethod
    def find_by_code(invite_code: str) -> Optional[dict]:
        return InviteCodeRepository.get_collection().find_one({"invite_code": invite_code})

    @staticmethod
    def create(role: UserRole, max_uses: int, expires_at: datetime,
               created_by: str) -> InviteCodeRecord:
        doc = {
            "invite_id": _gen_id("invite"),
            "invite_code": secrets.token_urlsafe(16),
            "role": role,
            "status": "active",
            "expires_at": expires_at,
            "max_uses": max_uses,
            "used_count": 0,
            "created_by": created_by,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        InviteCodeRepository.get_collection().insert_one(doc)
        return InviteCodeRecord(**doc)

    @staticmethod
    def atomic_consume(invite_id: str) -> Optional[dict]:
        """原子消费邀请码（used_count + 1），返回更新后的文档或 None。"""
        return InviteCodeRepository.get_collection().find_one_and_update(
            {"invite_id": invite_id},
            {"$inc": {"used_count": 1}, "$set": {"updated_at": datetime.utcnow()}},
            return_document=True,
        )

    @staticmethod
    def rollback_usage(invite_id: str) -> None:
        """回滚计数器（注册失败时调用）。"""
        InviteCodeRepository.get_collection().update_one(
            {"invite_id": invite_id},
            {"$inc": {"used_count": -1}},
        )

    @staticmethod
    def disable(invite_id: str) -> None:
        InviteCodeRepository.get_collection().update_one(
            {"invite_id": invite_id},
            {"$set": {"status": "disabled", "updated_at": datetime.utcnow()}},
        )

    @staticmethod
    def list_all() -> list[dict]:
        return list(InviteCodeRepository.get_collection().find().sort("created_at", -1))
