"""MongoDB 连接与集合获取器。"""

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

_client: MongoClient | None = None
_db: Database | None = None


def init_mongo(uri: str, db_name: str) -> None:
    """初始化 MongoDB 连接，确保唯一索引存在。"""
    global _client, _db
    _client = MongoClient(uri)
    _db = _client[db_name]
    _db["users"].create_index("username", unique=True, name="idx_username_unique")
    _db["users"].create_index("user_id", unique=True, name="idx_user_id_unique")
    _db["invite_codes"].create_index("invite_code", unique=True, name="idx_invite_code_unique")
    _db["invite_codes"].create_index("invite_id", unique=True, name="idx_invite_id_unique")


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
