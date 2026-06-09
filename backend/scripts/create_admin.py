"""创建初始管理员用户（用于开发/生产环境初始化）。"""

import hashlib
import os
import secrets
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.infra.mongo import init_mongo
from app.core.config import settings


def hash_pwd(password: str) -> str:
    """PBKDF2-SHA256 密码哈希。"""
    iterations = 260_000
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${dk.hex()}"


def main():
    username = sys.argv[1] if len(sys.argv) > 1 else "admin"
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"

    init_mongo(settings.mongodb_uri, settings.mongodb_db)
    from app.infra.mongo import get_users_collection
    col = get_users_collection()
    existing = col.find_one({"username": username})
    if existing:
        print(f"用户 {username} 已存在，跳过创建")
        return
    col.insert_one({
        "user_id": f"u_{secrets.token_hex(6)}",
        "username": username,
        "password_hash": hash_pwd(password),
        "role": "admin",
        "status": "active",
        "organization": "嘉庚创新实验室",
        "created_at": __import__("datetime").datetime.now(__import__("datetime").UTC),
        "updated_at": __import__("datetime").datetime.now(__import__("datetime").UTC),
        "last_login_at": None,
        "created_by": None,
    })
    print(f"管理员 {username} 创建成功")


if __name__ == "__main__":
    main()
