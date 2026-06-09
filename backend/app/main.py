"""AI4MS 门户后端 — FastAPI 应用入口。"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.infra.mongo import init_mongo, close_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时连接 MongoDB，关闭时释放连接。"""
    init_mongo(settings.mongodb_uri, settings.mongodb_db)
    yield
    close_mongo()


app = FastAPI(title="AI4MS Portal", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """健康检查端点。"""
    return {"status": "ok", "service": "ai4ms-portal"}
