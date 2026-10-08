"""Plane 权威反馈记录、GridFS 截图、分页查询与状态审计接口。"""

import hashlib
import io
import json
import re
import uuid
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit

import gridfs
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field, field_validator
from pymongo.errors import DuplicateKeyError

from app.core.plane_feedback_auth import (
    PlaneFeedbackPrincipal,
    feedback_scope,
    require_plane_feedback,
)
from app.infra.mongo import get_feedback_database, get_feedbacks_collection
from app.models.feedback import FeedbackStatus, FeedbackType

router = APIRouter()
SCREENSHOT_LIMIT = 10 * 1024 * 1024
FORMATS = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp"}


class PlaneSubmission(BaseModel):
    """提交数据不接受客户端提交的身份或组织。"""

    content: str = Field(min_length=1, max_length=5000)
    feedback_type: FeedbackType
    path: str = Field(default="/", max_length=2048)
    browser: str = Field(default="", max_length=500)
    module: str = Field(default="plane", max_length=100)
    idempotency_key: str = Field(min_length=16, max_length=128)

    @field_validator("content")
    @classmethod
    def nonempty_content(cls, value):
        """拒绝仅含空白的反馈内容。"""
        if not value.strip():
            raise ValueError("反馈内容不能为空")
        return value.strip()


class StatusUpdate(BaseModel):
    """每次处置必须填写说明。"""

    status: FeedbackStatus
    comment: str = Field(min_length=1, max_length=2000)


def public_record(record):
    """去除内部存储标识与幂等哈希，返回可读反馈记录。

    Args:
        record: MongoDB 反馈文档。

    Returns:
        可 JSON 序列化的记录。
    """
    return {
        key: value
        for key, value in record.items()
        if key not in {"_id", "payload_hash", "idempotency_key"}
    }


def delete_screenshots(record):
    """显式删除反馈时清理其全部 GridFS 截图。

    Args:
        record: 拥有截图的反馈记录。
    """
    bucket = gridfs.GridFS(get_feedback_database(), collection="feedback_screenshots")
    for screenshot in record.get("screenshots", []):
        bucket.delete(ObjectId(screenshot["id"]))


@router.post("")
async def submit(
    request: Request,
    principal: PlaneFeedbackPrincipal = Depends(require_plane_feedback),
):
    """幂等创建反馈，最多接收三张经实际图像解码的截图。"""
    if "submit" not in principal.permissions:
        raise HTTPException(403, "没有提交反馈权限")
    form = await request.form(
        max_files=3, max_fields=10, max_part_size=SCREENSHOT_LIMIT
    )
    try:
        submission = PlaneSubmission.model_validate(
            json.loads(str(form.get("payload") or "{}"))
        )
    except ValueError:
        raise HTTPException(422, "反馈字段无效") from None
    screenshots = form.getlist("screenshots")
    if len(screenshots) > 3:
        raise HTTPException(422, "每条反馈最多三张截图")
    images = []
    for screenshot in screenshots:
        if not hasattr(screenshot, "read"):
            raise HTTPException(422, "截图必须为文件")
        content = await screenshot.read(SCREENSHOT_LIMIT + 1)
        if not content or len(content) > SCREENSHOT_LIMIT:
            raise HTTPException(422, "每张截图须为非空文件且不超过 10 MB")
        try:
            with Image.open(io.BytesIO(content)) as image:
                actual_type = FORMATS.get(image.format)
                image.verify()
            if actual_type is None or screenshot.content_type != actual_type:
                raise ValueError()
        except (
            ValueError,
            OSError,
            UnidentifiedImageError,
            Image.DecompressionBombError,
        ):
            raise HTTPException(422, "截图必须为真实 PNG、JPEG 或 WebP") from None
        images.append((content, actual_type))
    data = submission.model_dump()
    data["path"] = urlsplit(submission.path).path or "/"
    digest = hashlib.sha256(
        json.dumps(data, sort_keys=True).encode()
        + b"".join(hashlib.sha256(content).digest() for content, _ in images)
    ).hexdigest()
    identity = {
        "platform": "plane",
        "workspace_id": principal.workspace_id,
        "user_id": principal.user_id,
        "idempotency_key": submission.idempotency_key,
    }
    collection = get_feedbacks_collection()
    existing = collection.find_one(identity)
    if existing:
        if existing["payload_hash"] != digest:
            raise HTTPException(409, "同一重试标识已用于不同反馈")
        return {"code": 0, "data": public_record(existing)}
    now = datetime.now(UTC)
    record = {
        **identity,
        **data,
        "payload_hash": digest,
        "feedback_id": f"fb_{uuid.uuid4().hex}",
        "username": principal.username,
        "organization": "",
        "org_unit_id": principal.org_unit_id,
        "status": "open",
        "created_at": now,
        "updated_at": now,
        "history": [],
        "screenshots": [],
    }
    bucket = gridfs.GridFS(get_feedback_database(), collection="feedback_screenshots")
    try:
        for index, (content, content_type) in enumerate(images):
            file_id = bucket.put(
                content,
                filename=f"screenshot-{index + 1}",
                content_type=content_type,
                metadata={
                    "feedback_id": record["feedback_id"],
                    "workspace_id": principal.workspace_id,
                },
            )
            record["screenshots"].append(
                {"id": str(file_id), "content_type": content_type, "size": len(content)}
            )
        collection.insert_one(record)
    except DuplicateKeyError:
        delete_screenshots(record)
        existing = collection.find_one(identity)
        if existing and existing["payload_hash"] == digest:
            return {"code": 0, "data": public_record(existing)}
        raise HTTPException(409, "同一重试标识已用于不同反馈") from None
    except Exception:
        delete_screenshots(record)
        raise
    return {"code": 0, "data": public_record(record)}


@router.get("")
async def list_feedback(
    request: Request,
    principal: PlaneFeedbackPrincipal = Depends(require_plane_feedback),
):
    """服务端执行分类、状态、模块、关键词和日期筛选。"""
    query = feedback_scope(principal)
    params = request.query_params
    for key, allowed in (
        ("status", {"open", "in_progress", "done", "closed"}),
        ("feedback_type", {"bug", "ux", "idea", "other"}),
    ):
        if params.get(key):
            if params[key] not in allowed:
                raise HTTPException(422, "筛选值无效")
            query[key] = params[key]
    if params.get("module"):
        query["module"] = params["module"][:100]
    if params.get("q"):
        query["content"] = {"$regex": re.escape(params["q"][:200]), "$options": "i"}
    dates = {}
    try:
        for key, operator in (("date_from", "$gte"), ("date_to", "$lt")):
            if params.get(key):
                value = datetime.strptime(params[key], "%Y-%m-%d").replace(tzinfo=UTC)
                dates[operator] = value + (
                    timedelta(days=1) if key == "date_to" else timedelta()
                )
        page = max(1, int(params.get("page", "1")))
        size = max(1, min(100, int(params.get("page_size", "20"))))
    except ValueError:
        raise HTTPException(422, "日期或分页参数无效") from None
    if "$gte" in dates and "$lt" in dates and dates["$gte"] >= dates["$lt"]:
        raise HTTPException(422, "开始日期不能晚于结束日期")
    if dates:
        query["created_at"] = dates
    collection = get_feedbacks_collection()
    results = (
        collection.find(query)
        .sort([("created_at", -1), ("feedback_id", 1)])
        .skip((page - 1) * size)
        .limit(size)
    )
    return {
        "code": 0,
        "data": {
            "results": [public_record(item) for item in results],
            "count": collection.count_documents(query),
            "page": page,
            "page_size": size,
        },
    }


@router.get("/{feedback_id}/screenshots/{screenshot_id}")
async def screenshot(
    feedback_id: str,
    screenshot_id: str,
    principal: PlaneFeedbackPrincipal = Depends(require_plane_feedback),
):
    """截图读取执行与本人/管理列表相同的权限条件。"""
    record = get_feedbacks_collection().find_one(
        {**feedback_scope(principal), "feedback_id": feedback_id}
    )
    if not record or not any(
        item["id"] == screenshot_id for item in record.get("screenshots", [])
    ):
        raise HTTPException(404, "截图不存在")
    bucket = gridfs.GridFS(get_feedback_database(), collection="feedback_screenshots")
    image = bucket.get(ObjectId(screenshot_id))
    return Response(
        image.read(),
        media_type=image.content_type,
        headers={
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.patch("/{feedback_id}/status")
async def update_status(
    feedback_id: str,
    update: StatusUpdate,
    principal: PlaneFeedbackPrincipal = Depends(require_plane_feedback),
):
    """处置时原子记录前后状态、说明、操作者及时间。"""
    query = {**feedback_scope(principal, manage=True), "feedback_id": feedback_id}
    collection = get_feedbacks_collection()
    record = collection.find_one(query)
    if not record:
        raise HTTPException(404, "反馈不存在")
    if not update.comment.strip():
        raise HTTPException(422, "处置说明不能为空")
    now = datetime.now(UTC)
    result = collection.update_one(
        {**query, "updated_at": record["updated_at"]},
        {
            "$set": {"status": update.status, "updated_at": now},
            "$push": {
                "history": {
                    "actor": principal.user_id,
                    "actor_name": principal.username,
                    "from_status": record["status"],
                    "to_status": update.status,
                    "comment": update.comment.strip(),
                    "created_at": now,
                }
            },
        },
    )
    if not result.matched_count:
        raise HTTPException(409, "反馈已被其他人更新，请刷新")
    return {"code": 0, "data": public_record(collection.find_one(query))}


@router.delete("/{feedback_id}")
async def delete(
    feedback_id: str,
    principal: PlaneFeedbackPrincipal = Depends(require_plane_feedback),
):
    """显式删除授权范围内反馈，同时清理其截图。"""
    record = get_feedbacks_collection().find_one_and_delete(
        {**feedback_scope(principal, manage=True), "feedback_id": feedback_id}
    )
    if not record:
        raise HTTPException(404, "反馈不存在")
    delete_screenshots(record)
    return {"code": 0, "message": "反馈及截图已删除"}
