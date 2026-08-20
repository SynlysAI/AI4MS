"""用户反馈领域模型。"""

from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, Field


FeedbackStatus = Literal["open", "done"]
FeedbackType = Literal["bug", "ux", "idea", "other"]
FeedbackPlatform = Literal["spec_agent", "poly_agent", "speclabos", "ragportal"]


class FeedbackRecord(BaseModel):
    """用户反馈记录（提交人信息为提交时刻快照）。"""

    feedback_id: str       # "fb_" + 12位hex
    platform: FeedbackPlatform
    feedback_type: FeedbackType
    content: str           # 反馈内容（≤500 字）
    user_id: str           # 提交人 user_id
    username: str          # 提交人用户名（快照）
    organization: str = "" # 提交人单位（快照）
    status: FeedbackStatus = "open"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
