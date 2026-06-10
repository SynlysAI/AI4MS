"""AI4MS 门户后端 — FastAPI 应用入口，同时托管前端静态文件。"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.infra.mongo import init_mongo, close_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时连接 MongoDB，关闭时释放连接。"""
    init_mongo(settings.mongodb_uri, settings.mongodb_db)
    yield
    close_mongo()


app = FastAPI(title="AI4MS Portal", version="0.1.0", lifespan=lifespan)

# CORS — 前后端同源时可关闭，保留配置用于开发分离部署
cors_origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials="*" not in cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 路由
from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """健康检查端点。"""
    return {"status": "ok", "service": "ai4ms-portal"}


# ── 前端静态文件（生产部署） ──

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")

if os.path.isdir(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """SPA 回退：非 API 路径统一返回 index.html，由前端路由处理。"""
        # 先尝试匹配静态文件（favicon 等）
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
