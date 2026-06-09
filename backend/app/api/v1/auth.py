"""认证相关 API 端点：登录、注册、获取当前用户状态。"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.core.auth import require_authenticated, get_current_user_optional
from app.core.config import settings
from app.services.auth_service import login, register

router = APIRouter()


class LoginRequest(BaseModel):
    """登录请求体。"""
    username: str
    password: str


class RegisterRequest(BaseModel):
    """注册请求体。"""
    invite_code: str
    username: str
    password: str
    organization: str = ""


class AuthResponse(BaseModel):
    """鉴权成功响应体。"""
    code: int = 0
    message: str = "成功"
    data: dict


@router.post("/login")
async def login_endpoint(req: LoginRequest):
    """用户登录。"""
    try:
        result = login(req.username, req.password)
        return AuthResponse(data=result)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register")
async def register_endpoint(req: RegisterRequest):
    """用户注册（需邀请码）。"""
    try:
        result = register(req.invite_code, req.username, req.password, req.organization)
        return AuthResponse(data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user_optional)):
    """获取当前登录用户状态及全局鉴权配置。"""
    return {
        "code": 0,
        "message": "成功",
        "data": {
            "auth_enabled": settings.auth_enabled,
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "role": user["role"],
                "status": user.get("status", "active"),
                "organization": user.get("organization", ""),
            } if user else None,
        },
    }
