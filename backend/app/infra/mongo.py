"""MongoDB 连接与集合获取器。"""
import logging

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import OperationFailure

_logger = logging.getLogger(__name__)

_client: MongoClient | None = None
_db: Database | None = None


def _ensure_index(collection: str, field: str, unique: bool = True) -> None:
    """创建索引，若已存在同名或同字段索引则跳过。"""
    try:
        _db[collection].create_index(field, unique=unique)
    except OperationFailure as e:
        if e.code == 85:  # IndexOptionsConflict — 已存在该字段索引
            _logger.info("索引已存在，跳过：%s.%s", collection, field)
        else:
            raise


def init_mongo(uri: str, db_name: str) -> None:
    """初始化 MongoDB 连接，确保唯一索引存在。"""
    global _client, _db
    _client = MongoClient(uri)
    _db = _client[db_name]
    _ensure_index("users", "username")
    _ensure_index("users", "user_id")
    _ensure_index("invite_codes", "invite_code")
    _ensure_index("invite_codes", "invite_id")
    _ensure_index("feedbacks", "feedback_id")


def close_mongo() -> None:
    """关闭 MongoDB 连接。"""
    global _client, _db
    if _client:
        _client.close()
        _client = None
    _db = None


def get_users_collection() -> Collection:
    """获取 users 集合。"""
    if _db is None:
        raise RuntimeError("数据库未初始化，请先调用 init_mongo()")
    return _db.get_collection("users")


def get_invite_codes_collection() -> Collection:
    """获取 invite_codes 集合。"""
    if _db is None:
        raise RuntimeError("数据库未初始化，请先调用 init_mongo()")
    return _db.get_collection("invite_codes")


def get_feedbacks_collection() -> Collection:
    """获取 feedbacks 集合。"""
    if _db is None:
        raise RuntimeError("数据库未初始化，请先调用 init_mongo()")
    return _db.get_collection("feedbacks")
