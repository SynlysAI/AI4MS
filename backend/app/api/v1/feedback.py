"""反馈意见 API 端点：子平台提交反馈 + 管理员查看/处理。"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.auth import parse_access_token, require_admin
from app.core.config import settings
from app.infra.repositories import FeedbackRepository
from app.models.feedback import FeedbackPlatform, FeedbackStatus, FeedbackType

router = APIRouter()

FEEDBACK_PLATFORMS: set[str] = {"spec_agent", "poly_agent", "speclabos", "ragportal"}
FEEDBACK_TYPES: set[str] = {"bug", "ux", "idea", "other"}


class SubmitFeedbackRequest(BaseModel):
    """提交反馈请求体。"""

    platform: FeedbackPlatform
    feedback_type: FeedbackType
    content: str = Field(min_length=1, max_length=500)


class ApiResponse(BaseModel):
    """统一 API 响应。"""

    code: int = 0
    message: str = "成功"
    data: dict | list | None = None


async def require_feedback_user(request: Request) -> dict:
    """解析提交反馈的用户身份。

    信任 Token 载荷中的用户名/单位，不做门户用户库校验——
    子平台通过 SSO 登录的用户可能不存在于门户 users 集合。
    """
    if not settings.auth_enabled:
        return {"sub": "anon", "username": "anonymous", "organization": ""}
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    payload = parse_access_token(token) if token else None
    if not payload:
        raise HTTPException(status_code=401, detail="登录状态已失效，请重新进入平台后再提交")
    return payload


@router.post("")
async def submit_feedback(
    req: SubmitFeedbackRequest,
    user: dict = Depends(require_feedback_user),
):
    """提交一条反馈意见（四个子平台调用）。"""
    if req.platform not in FEEDBACK_PLATFORMS:
        raise HTTPException(status_code=400, detail="不支持的平台标识")
    if req.feedback_type not in FEEDBACK_TYPES:
        raise HTTPException(status_code=400, detail="不支持的反馈类型")
    fb = FeedbackRepository.create(
        platform=req.platform,
        feedback_type=req.feedback_type,
        content=req.content.strip(),
        user_id=user.get("sub", ""),
        username=user.get("username", ""),
        organization=user.get("organization", ""),
    )
    return ApiResponse(message="反馈已提交", data={"feedback_id": fb.feedback_id})


@router.get("")
async def list_feedbacks(
    admin: dict = Depends(require_admin),
):
    """获取反馈列表（仅管理员，按提交时间倒序）。"""
    feedbacks = FeedbackRepository.list_all()
    for f in feedbacks:
        f["_id"] = str(f["_id"])
    return ApiResponse(data=feedbacks)


@router.patch("/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: str,
    req: dict,
    admin: dict = Depends(require_admin),
):
    """标记反馈为已处理/重新打开（仅管理员）。"""
    new_status = req.get("status")
    if new_status not in ("open", "done"):
        raise HTTPException(status_code=400, detail="status 必须为 open 或 done")
    matched = FeedbackRepository.update_status(feedback_id, new_status)
    if matched == 0:
        raise HTTPException(status_code=404, detail="反馈不存在")
    return ApiResponse(message="状态已更新")


@router.delete("/{feedback_id}")
async def delete_feedback(
    feedback_id: str,
    admin: dict = Depends(require_admin),
):
    """删除反馈（仅管理员）。"""
    deleted = FeedbackRepository.delete(feedback_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="反馈不存在")
    return ApiResponse(message="反馈已删除")
