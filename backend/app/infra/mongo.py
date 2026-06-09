"""MongoDB 连接与集合获取器。"""

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

_client: MongoClient | None = None
_db: Database | None = None


def init_mongo(uri: str, db_name: str) -> None:
    """初始化 MongoDB 连接，在应用启动时调用一次。"""
    global _client, _db
    _client = MongoClient(uri)
    _db = _client[db_name]


def close_mongo() -> None:
    """关闭 MongoDB 连接。"""
    global _client
    if _client:
        _client.close()
        _client = None


def get_users_collection() -> Collection:
    """获取 users 集合。"""
    return _db.get_collection("users")


def get_invite_codes_collection() -> Collection:
    """获取 invite_codes 集合。"""
    return _db.get_collection("invite_codes")
