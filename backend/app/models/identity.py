"""用户与邀请码 Pydantic 领域模型。"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


UserRole = Literal["admin", "user"]
UserStatus = Literal["active", "disabled"]


class UserRecord(BaseModel):
    """用户记录。"""
    user_id: str          # "u_" + 12位hex
    username: str
    password_hash: str    # PBKDF2-SHA256 格式
    role: UserRole = "user"
    status: UserStatus = "active"
    organization: str = ""  # 单位（注册时填写）
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: datetime | None = None
    created_by: str | None = None  # 注册时使用的邀请码创建人


class UserPublicInfo(BaseModel):
    """返回给前端的用户公开信息（不含密码哈希）。"""
    user_id: str
    username: str
    role: UserRole
    status: UserStatus
    organization: str
    created_at: datetime
    last_login_at: datetime | None


InviteStatus = Literal["active", "disabled", "expired", "used_up"]


class InviteCodeRecord(BaseModel):
    """邀请码记录。"""
    invite_id: str       # "invite_" + 12位hex
    invite_code: str     # URL安全随机token
    role: UserRole = "user"
    status: InviteStatus = "active"
    expires_at: datetime
    max_uses: int = 10
    used_count: int = 0
    created_by: str      # 创建人 user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
