"""管理后台 API 端点：用户管理、邀请码管理。"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import require_admin
from app.infra.repositories import UserRepository, InviteCodeRepository
from app.models.identity import UserRole

router = APIRouter()


class CreateInviteRequest(BaseModel):
    """创建邀请码请求体。"""
    role: UserRole = "user"
    max_uses: int = 10
    expires_hours: int = 72


class ApiResponse(BaseModel):
    """统一 API 响应。"""
    code: int = 0
    message: str = "成功"
    data: dict | list | None = None


# ── 用户管理 ──

@router.get("/users")
async def list_users(
    admin: dict = Depends(require_admin),
):
    """获取用户列表（仅管理员）。"""
    users = UserRepository.list_all()
    result = []
    for u in users:
        u["_id"] = str(u["_id"])
        del u["password_hash"]
        result.append(u)
    return ApiResponse(data=result)


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    req: dict,
    admin: dict = Depends(require_admin),
):
    """启用/禁用用户（仅管理员）。"""
    new_status = req.get("status")
    if new_status not in ("active", "disabled"):
        raise HTTPException(status_code=400, detail="status 必须为 active 或 disabled")
    user = UserRepository.find_by_user_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if user["role"] == "admin" and new_status == "disabled":
        raise HTTPException(status_code=400, detail="不允许禁用管理员")
    UserRepository.update_status(user_id, new_status)
    return ApiResponse(message="状态已更新")


# ── 邀请码管理 ──

@router.get("/invite-codes")
async def list_invite_codes(
    admin: dict = Depends(require_admin),
):
    """获取邀请码列表（仅管理员）。"""
    codes = InviteCodeRepository.list_all()
    for c in codes:
        c["_id"] = str(c["_id"])
    return ApiResponse(data=codes)


@router.post("/invite-codes")
async def create_invite_code(
    req: CreateInviteRequest,
    admin: dict = Depends(require_admin),
):
    """创建邀请码（仅管理员）。"""
    expires_at = datetime.now(timezone.utc) + timedelta(hours=req.expires_hours)
    invite = InviteCodeRepository.create(
        role=req.role,
        max_uses=req.max_uses,
        expires_at=expires_at,
        created_by=admin["user_id"],
    )
    return ApiResponse(data={
        "invite_id": invite.invite_id,
        "invite_code": invite.invite_code,
        "role": invite.role,
        "max_uses": invite.max_uses,
        "expires_at": invite.expires_at.isoformat(),
    })


@router.patch("/invite-codes/{invite_id}/disable")
async def disable_invite_code(
    invite_id: str,
    admin: dict = Depends(require_admin),
):
    """禁用邀请码（仅管理员）。"""
    matched = InviteCodeRepository.disable(invite_id)
    if matched == 0:
        raise HTTPException(status_code=404, detail="邀请码不存在")
    return ApiResponse(message="邀请码已禁用")
