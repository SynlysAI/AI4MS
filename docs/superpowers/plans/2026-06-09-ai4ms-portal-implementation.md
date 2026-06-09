# AI4MS 统一门户实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 AI4MS 统一门户 — 用户认证 + 三应用卡片首页 + 管理员后台（用户管理/邀请码管理）

**Architecture:** React 18 + Vite SPA 前端，FastAPI 轻量后端共享 Spec_Agent 的 MongoDB users 集合，HMAC-SHA256 自签名 Token 实现 SSO

**Tech Stack:** React 18, Vite, Tailwind CSS 4, shadcn/ui, Framer Motion, Zustand, React Router v7, Axios; FastAPI, PyMongo, Pydantic

---

## 文件结构

```
AI4MS/
├── frontend/                        # React SPA
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.tsx                 # createRoot, RouterProvider, global CSS
│   │   ├── App.tsx                  # 根布局：背景 + Outlet + Toaster
│   │   ├── index.css               # Tailwind + 全局暗色主题变量
│   │   ├── router.tsx              # 路由表 + AuthGuard
│   │   ├── api/client.ts           # Axios 实例 + 拦截器 + 全部 API 函数
│   │   ├── stores/authStore.ts     # 鉴权状态（Zustand）
│   │   ├── lib/utils.ts            # cn() 工具函数（shadcn/ui 风格）
│   │   ├── hooks/useAuth.ts        # 鉴权组合 hook
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui 组件（button, input, dialog, dropdown-menu, table 等）
│   │   │   ├── StarFieldBg.tsx     # 深空粒子/光晕背景
│   │   │   ├── AppCard.tsx         # 应用入口卡片
│   │   │   ├── UserNav.tsx         # 右上角用户头像+下拉菜单
│   │   │   └── Layout.tsx          # 页面外层容器
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── HomePage.tsx
│   │       ├── NotFoundPage.tsx
│   │       └── admin/
│   │           ├── UsersPage.tsx
│   │           └── InvitesPage.tsx
├── backend/                         # FastAPI 轻量后端
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app + CORS + lifespan
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Pydantic Settings 配置类
│   │   │   └── auth.py              # Token 生成/校验 + 4 个 Depends 守卫
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── identity.py          # User/InviteCode Pydantic 模型
│   │   ├── infra/
│   │   │   ├── __init__.py
│   │   │   ├── mongo.py             # MongoDB 连接 + 集合获取
│   │   │   └── repositories.py      # User/InviteCode 仓储层
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── auth_service.py      # 注册/登录/密码哈希业务逻辑
│   │   └── api/v1/
│   │       ├── __init__.py
│   │       ├── router.py            # 路由聚合
│   │       ├── auth.py              # POST /auth/login, /auth/register, GET /auth/me
│   │       └── admin.py             # 用户管理 + 邀请码管理端点
└── docs/superpowers/
    ├── specs/2026-06-09-ai4ms-portal-design.md
    └── plans/2026-06-09-ai4ms-portal-implementation.md
```

---

### Task 1: 项目脚手架 — 前端 Vite + React + TypeScript

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.app.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/lib/utils.ts`

- [ ] **Step 1: 初始化前端项目**

```bash
cd E:/github_project/AI4MS
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: 安装所有依赖**

```bash
cd E:/github_project/AI4MS/frontend
npm install react-router-dom zustand axios framer-motion
npm install -D tailwindcss @tailwindcss/vite
npm install -D @types/react @types/react-dom
npx shadcn@latest init -d
npx shadcn@latest add button input dialog dropdown-menu table badge card separator label
```

- [ ] **Step 3: 配置 Vite（修改 vite.config.ts）**

编辑 `frontend/vite.config.ts`，添加 Tailwind 插件和 API 代理：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8001',
    },
  },
})
```

- [ ] **Step 4: 写入全局 CSS（`frontend/src/index.css`）**

```css
@import "tailwindcss";

@theme {
  --color-dark-900: #0c0c0c;
  --color-dark-800: #0f0f0f;
  --color-dark-700: #0d1b2a;
  --color-dark-600: #0a1628;
  --color-accent-blue: #3b82f6;
  --color-accent-purple: #8b5cf6;
  --color-accent-green: #10b981;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #0c0c0c;
  color: rgba(255, 255, 255, 0.85);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 5: 写入工具函数（`frontend/src/lib/utils.ts`）**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

安装额外依赖：
```bash
cd E:/github_project/AI4MS/frontend
npm install clsx tailwind-merge
```

- [ ] **Step 6: 写入 `frontend/tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 7: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "chore: 初始化前端项目脚手架

- Vite + React 18 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Framer Motion + Zustand + React Router + Axios"
```

---

### Task 2: 项目脚手架 — 后端 FastAPI

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/.env`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/infra/__init__.py`
- Create: `backend/app/infra/mongo.py`

- [ ] **Step 1: 写入 `backend/requirements.txt`**

```
fastapi>=0.116.0
uvicorn[standard]>=0.35.0
pymongo>=4.14.0
pydantic>=2.11.0
pydantic-settings>=2.8.0
python-dotenv>=1.0.0
```

- [ ] **Step 2: 写入环境变量配置文件**

`backend/.env.example`:

```ini
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=spec_agent
AUTH_ENABLED=true
AUTH_TOKEN_EXPIRE_HOURS=12
AUTH_SECRET=
CORS_ORIGINS=http://localhost:5173,http://localhost:64726
```

`backend/.env`（与 .example 一致，开发环境使用相同值）:

```ini
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=spec_agent
AUTH_ENABLED=true
AUTH_TOKEN_EXPIRE_HOURS=12
AUTH_SECRET=
CORS_ORIGINS=http://localhost:5173,http://localhost:64726
```

- [ ] **Step 3: 写入配置类（`backend/app/core/config.py`）**

```python
"""全局配置管理，使用 Pydantic Settings 加载环境变量。"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置，所有变量可从 .env 文件或环境变量覆盖。"""

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "spec_agent"
    auth_enabled: bool = True
    auth_token_expire_hours: int = 12
    auth_secret: str = ""
    cors_origins: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

- [ ] **Step 4: 写入 MongoDB 连接（`backend/app/infra/mongo.py`）**

```python
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
```

- [ ] **Step 5: 写入应用入口（`backend/app/main.py`）**

```python
"""AI4MS 门户后端 — FastAPI 应用入口。"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.infra.mongo import init_mongo, close_mongo
from app.api.v1.router import api_router


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

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """健康检查端点。"""
    return {"status": "ok", "service": "ai4ms-portal"}
```

- [ ] **Step 6: 安装后端依赖并验证启动**

```bash
cd E:/github_project/AI4MS/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload &
sleep 2
curl http://localhost:8001/health
# Expected: {"status":"ok","service":"ai4ms-portal"}
```

- [ ] **Step 7: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "chore: 初始化后端项目脚手架

- FastAPI + PyMongo + Pydantic Settings
- MongoDB 连接管理 + 健康检查端点
- 环境变量配置"
```

---

### Task 3: 后端 — 用户模型与数据层

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/identity.py`
- Create: `backend/app/infra/repositories.py`

- [ ] **Step 1: 写入数据模型（`backend/app/models/identity.py`）**

```python
"""用户与邀请码 Pydantic 领域模型。"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


UserRole = Literal["admin", "user"]
UserStatus = Literal["active", "disabled"]


class UserRecord(BaseModel):
    """用户记录。"""
    user_id: str          # "u_" + 12位hex
    username: str
    password_hash: str    # PBKDF2-SHA256 格式
    role: UserRole = "user"
    status: UserStatus = "active"
    organization: str = ""  # 单位（注册时填写）
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: datetime | None = None
    created_by: str | None = None  # 注册时使用的邀请码创建人


class UserPublicInfo(BaseModel):
    """返回给前端的用户公开信息（不含密码哈希）。"""
    user_id: str
    username: str
    role: UserRole
    status: UserStatus
    organization: str
    created_at: datetime
    last_login_at: datetime | None


InviteStatus = Literal["active", "disabled", "expired", "used_up"]


class InviteCodeRecord(BaseModel):
    """邀请码记录。"""
    invite_id: str       # "invite_" + 12位hex
    invite_code: str     # URL安全随机token
    role: UserRole = "user"
    status: InviteStatus = "active"
    expires_at: datetime
    max_uses: int = 10
    used_count: int = 0
    created_by: str      # 创建人 user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

- [ ] **Step 2: 写入仓储层（`backend/app/infra/repositories.py`）**

```python
"""用户与邀请码数据仓储层。"""

import secrets
from datetime import datetime
from typing import Optional

from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

from app.infra.mongo import get_users_collection, get_invite_codes_collection
from app.models.identity import UserRecord, InviteCodeRecord, UserRole, UserStatus


def _gen_id(prefix: str) -> str:
    """生成带前缀的随机 ID。"""
    return f"{prefix}_{secrets.token_hex(6)}"


class UserRepository:
    """用户数据访问层（MongoDB users 集合）。"""

    @staticmethod
    def get_collection() -> Collection:
        return get_users_collection()

    @staticmethod
    def find_by_username(username: str) -> Optional[dict]:
        return UserRepository.get_collection().find_one({"username": username})

    @staticmethod
    def find_by_user_id(user_id: str) -> Optional[dict]:
        return UserRepository.get_collection().find_one({"user_id": user_id})

    @staticmethod
    def create(username: str, password_hash: str, role: UserRole,
               organization: str, created_by: Optional[str]) -> UserRecord:
        doc = {
            "user_id": _gen_id("u"),
            "username": username,
            "password_hash": password_hash,
            "role": role,
            "status": "active",
            "organization": organization,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login_at": None,
            "created_by": created_by,
        }
        try:
            UserRepository.get_collection().insert_one(doc)
        except DuplicateKeyError:
            raise ValueError("用户名已存在")
        return UserRecord(**doc)

    @staticmethod
    def update_login_time(user_id: str) -> None:
        now = datetime.utcnow()
        UserRepository.get_collection().update_one(
            {"user_id": user_id},
            {"$set": {"last_login_at": now, "updated_at": now}},
        )

    @staticmethod
    def update_status(user_id: str, status: UserStatus) -> None:
        UserRepository.get_collection().update_one(
            {"user_id": user_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}},
        )

    @staticmethod
    def list_all() -> list[dict]:
        return list(UserRepository.get_collection().find().sort("created_at", -1))


class InviteCodeRepository:
    """邀请码数据访问层（MongoDB invite_codes 集合）。"""

    @staticmethod
    def get_collection() -> Collection:
        return get_invite_codes_collection()

    @staticmethod
    def find_by_code(invite_code: str) -> Optional[dict]:
        return InviteCodeRepository.get_collection().find_one({"invite_code": invite_code})

    @staticmethod
    def create(role: UserRole, max_uses: int, expires_at: datetime,
               created_by: str) -> InviteCodeRecord:
        doc = {
            "invite_id": _gen_id("invite"),
            "invite_code": secrets.token_urlsafe(16),
            "role": role,
            "status": "active",
            "expires_at": expires_at,
            "max_uses": max_uses,
            "used_count": 0,
            "created_by": created_by,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        InviteCodeRepository.get_collection().insert_one(doc)
        return InviteCodeRecord(**doc)

    @staticmethod
    def atomic_consume(invite_id: str) -> Optional[dict]:
        """原子消费邀请码（used_count + 1），返回更新后的文档或 None。"""
        return InviteCodeRepository.get_collection().find_one_and_update(
            {"invite_id": invite_id},
            {"$inc": {"used_count": 1}, "$set": {"updated_at": datetime.utcnow()}},
            return_document=True,
        )

    @staticmethod
    def rollback_usage(invite_id: str) -> None:
        """回滚计数器（注册失败时调用）。"""
        InviteCodeRepository.get_collection().update_one(
            {"invite_id": invite_id},
            {"$inc": {"used_count": -1}},
        )

    @staticmethod
    def disable(invite_id: str) -> None:
        InviteCodeRepository.get_collection().update_one(
            {"invite_id": invite_id},
            {"$set": {"status": "disabled", "updated_at": datetime.utcnow()}},
        )

    @staticmethod
    def list_all() -> list[dict]:
        return list(InviteCodeRepository.get_collection().find().sort("created_at", -1))
```

- [ ] **Step 3: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 添加用户与邀请码数据模型及仓储层

- UserRecord / InviteCodeRecord Pydantic 领域模型
- UserRepository / InviteCodeRepository MongoDB 仓储
- 原子消费邀请码 + 回滚机制"
```

---

### Task 4: 后端 — Token 生成与校验

**Files:**
- Create: `backend/app/core/auth.py`

- [ ] **Step 1: 写入完整鉴权模块（`backend/app/core/auth.py`）**

```python
"""Token 生成/校验 + FastAPI 鉴权依赖注入守卫。

与 Spec_Agent 使用完全相同的 Token 格式，确保 SSO 兼容。
Token 格式：{base64(payload)}.{hmac_signature}
"""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional

from fastapi import Depends, HTTPException, Request

from app.core.config import settings
from app.infra.repositories import UserRepository


def _get_secret() -> bytes:
    """获取 HMAC 签名密钥。

    优先使用 AUTH_SECRET 环境变量，否则从项目路径 + 用户名密码派生。
    与 Spec_Agent 保持完全一致的派生逻辑。
    """
    if settings.auth_secret:
        return settings.auth_secret.encode("utf-8")
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    material = f"{project_root}_ai4ms_portal".encode("utf-8")
    return hashlib.sha256(material).digest()


def generate_access_token(user_id: str, username: str, role: str) -> str:
    """生成自签名 access token。

    Args:
        user_id: 用户唯一 ID。
        username: 用户名。
        role: 用户角色（admin 或 user）。

    Returns:
        伪 JWT 格式的 token 字符串。
    """
    now = int(time.time())
    expire_hours = settings.auth_token_expire_hours
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "iat": now,
        "exp": now + expire_hours * 3600,
    }
    payload_b64 = base64.urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":")).encode()
    ).rstrip(b"=").decode()
    secret = _get_secret()
    sig = hmac.new(secret, payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def parse_access_token(token: str) -> Optional[dict]:
    """校验并解析 access token。

    Args:
        token: 完整的 token 字符串（含签名）。

    Returns:
        成功返回 payload 字典，失败返回 None。
    """
    try:
        payload_b64, sig = token.rsplit(".", 1)
    except (ValueError, AttributeError):
        return None
    expected_sig = hmac.new(_get_secret(), payload_b64.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_sig, sig):
        return None
    try:
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
    except Exception:
        return None
    if payload.get("role") not in ("admin", "user"):
        return None
    if payload.get("exp", 0) < int(time.time()):
        return None
    return payload


def _extract_token(request: Request) -> Optional[str]:
    """从请求头提取 Bearer token。"""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


async def get_current_user(request: Request) -> dict:
    """强制解析当前登录用户，未认证返回 401。"""
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="未提供认证令牌")
    payload = parse_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="令牌无效或已过期")
    user = UserRepository.find_by_user_id(payload["sub"])
    if not user or user.get("status") != "active":
        raise HTTPException(status_code=401, detail="用户不存在或已被禁用")
    return user


async def get_current_user_optional(request: Request) -> Optional[dict]:
    """可选解析当前用户，未认证返回 None。"""
    token = _extract_token(request)
    if not token:
        return None
    payload = parse_access_token(token)
    if not payload:
        return None
    user = UserRepository.find_by_user_id(payload["sub"])
    return user if user and user.get("status") == "active" else None


async def require_authenticated(
    request: Request,
    user: Optional[dict] = Depends(get_current_user_optional),
) -> dict:
    """要求已登录（auth_enabled=false 时放行）。"""
    if not settings.auth_enabled:
        return user or {
            "user_id": "anon",
            "username": "anonymous",
            "role": "user",
            "status": "active",
            "organization": "",
        }
    if not user:
        raise HTTPException(status_code=401, detail="需要登录")
    return user


async def require_admin(user: dict = Depends(require_authenticated)) -> dict:
    """要求 admin 角色，否则返回 403。"""
    if not settings.auth_enabled:
        return user
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user
```

- [ ] **Step 2: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现 Token 生成/校验与鉴权守卫

- HMAC-SHA256 自签名 Token（与 Spec_Agent 格式一致）
- 4 个 FastAPI 依赖守卫：get_current_user/optional/require_authenticated/require_admin
- AUTH_ENABLED 开关控制"
```

---

### Task 5: 后端 — 鉴权业务服务

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/auth_service.py`

- [ ] **Step 1: 写入鉴权服务（`backend/app/services/auth_service.py`）**

```python
"""用户注册与登录业务逻辑。"""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timezone

from app.infra.repositories import UserRepository, InviteCodeRepository
from app.core.auth import generate_access_token
from app.models.identity import UserRole


def _hash_password(password: str) -> str:
    """PBKDF2-SHA256 密码哈希。

    Args:
        password: 明文密码。

    Returns:
        格式：pbkdf2_sha256$260000${salt.hex()}${{hash.hex()}}。
    """
    iterations = 260_000
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"pbkdf2_sha256${iterations}${salt.hex()}${dk.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    """验证密码是否匹配。

    同时支持旧版纯 SHA256 格式的兼容验证。
    """
    if "$" not in stored_hash:
        return hashlib.sha256(password.encode()).hexdigest() == stored_hash
    try:
        algo, iterations_str, salt_hex, hash_hex = stored_hash.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations_str))
        return hmac.compare_digest(dk, expected)
    except (ValueError, TypeError):
        return False


def register(invite_code: str, username: str, password: str,
             organization: str = "") -> dict:
    """用户注册 — 邀请码验证 + 创建用户。

    Args:
        invite_code: 邀请码。
        username: 用户名。
        password: 明文密码。
        organization: 单位名称。

    Returns:
        包含 token 和用户信息的字典。
    """
    # 验证邀请码
    invite = InviteCodeRepository.find_by_code(invite_code)
    if not invite:
        raise ValueError("邀请码无效")
    if invite["status"] != "active":
        raise ValueError("邀请码已失效")
    if invite["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise ValueError("邀请码已过期")
    if invite["used_count"] >= invite["max_uses"]:
        raise ValueError("邀请码已用完")

    # 检查用户名唯一性
    existing = UserRepository.find_by_username(username)
    if existing:
        raise ValueError("用户名已存在")

    # 原子消费邀请码
    updated = InviteCodeRepository.atomic_consume(invite["invite_id"])

    # 创建用户
    try:
        password_hash = _hash_password(password)
        user = UserRepository.create(
            username=username,
            password_hash=password_hash,
            role=invite["role"],
            organization=organization,
            created_by=invite["created_by"],
        )
    except Exception:
        InviteCodeRepository.rollback_usage(invite["invite_id"])
        raise

    UserRepository.update_login_time(user.user_id)
    token = generate_access_token(user.user_id, user.username, user.role)
    return {
        "token": token,
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "role": user.role,
            "organization": user.organization,
        },
    }


def login(username: str, password: str) -> dict:
    """用户登录。

    Args:
        username: 用户名。
        password: 明文密码。

    Returns:
        包含 token 和用户信息的字典。

    Raises:
        ValueError: 用户名或密码错误，或用户已被禁用。
    """
    user = UserRepository.find_by_username(username)
    if not user:
        raise ValueError("用户名或密码错误")
    if user["status"] != "active":
        raise ValueError("用户已被禁用")
    if not _verify_password(password, user["password_hash"]):
        raise ValueError("用户名或密码错误")
    UserRepository.update_login_time(user["user_id"])
    token = generate_access_token(user["user_id"], user["username"], user["role"])
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
            "organization": user.get("organization", ""),
        },
    }
```

- [ ] **Step 2: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现用户注册与登录业务逻辑

- PBKDF2-SHA256 密码哈希（26万次迭代）
- 邀请码验证 + 原子消费 + 回滚机制
- 兼容旧版纯 SHA256 密码格式"
```

---

### Task 6: 后端 — Auth API 端点

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/v1/__init__.py`
- Create: `backend/app/api/v1/router.py`
- Create: `backend/app/api/v1/auth.py`

- [ ] **Step 1: 写入路由聚合（`backend/app/api/v1/router.py`）**

```python
"""API v1 路由聚合入口。"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["认证"])
api_router.include_router(admin_router, prefix="/admin", tags=["管理"])
```

- [ ] **Step 2: 写入 Auth API（`backend/app/api/v1/auth.py`）**

```python
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
```

- [ ] **Step 3: 暂时创建占位 `backend/app/api/v1/admin.py`**

```python
"""管理员 API 端点（占位，后续 Task 实现）。"""

from fastapi import APIRouter

router = APIRouter()
```

- [ ] **Step 4: 验证后端启动和 Auth 端点**

```bash
# 启动后端
cd E:/github_project/AI4MS/backend
python -m uvicorn app.main:app --port 8001 &
sleep 2

# 测试 /api/v1/auth/me（未登录）
curl -s http://localhost:8001/api/v1/auth/me | python -m json.tool
# Expected: {"code":0,"data":{"auth_enabled":true,"user":null},...}

# 测试登录（无用户时预期 401）
curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}' | python -m json.tool
# Expected: 401 detail: "用户名或密码错误"
```

- [ ] **Step 5: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现 Auth API 端点

- POST /api/v1/auth/login — 用户登录
- POST /api/v1/auth/register — 邀请码注册
- GET /api/v1/auth/me — 获取当前用户状态"
```

---

### Task 7: 后端 — Admin API 端点

**Files:**
- Modify: `backend/app/api/v1/admin.py`

- [ ] **Step 1: 重写 Admin API（`backend/app/api/v1/admin.py`）**

```python
"""管理后台 API 端点：用户管理、邀请码管理。"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import require_admin
from app.infra.repositories import UserRepository, InviteCodeRepository
from app.models.identity import UserRole

router = APIRouter()


class CreateInviteRequest(BaseModel):
    """创建邀请码请求体。"""
    role: UserRole = "user"
    max_uses: int = 10
    expires_hours: int = 72


class ApiResponse(BaseModel):
    """统一 API 响应。"""
    code: int = 0
    message: str = "成功"
    data: dict | list | None = None


# ── 用户管理 ──

@router.get("/users")
async def list_users(
    admin: dict = Depends(require_admin),
):
    """获取用户列表（仅管理员）。"""
    users = UserRepository.list_all()
    result = []
    for u in users:
        u["_id"] = str(u["_id"])
        del u["password_hash"]
        result.append(u)
    return ApiResponse(data=result)


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    req: dict,
    admin: dict = Depends(require_admin),
):
    """启用/禁用用户（仅管理员）。"""
    new_status = req.get("status")
    if new_status not in ("active", "disabled"):
        raise HTTPException(status_code=400, detail="status 必须为 active 或 disabled")
    user = UserRepository.find_by_user_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if user["role"] == "admin" and new_status == "disabled":
        raise HTTPException(status_code=400, detail="不允许禁用管理员")
    UserRepository.update_status(user_id, new_status)
    return ApiResponse(message="状态已更新")


# ── 邀请码管理 ──

@router.get("/invite-codes")
async def list_invite_codes(
    admin: dict = Depends(require_admin),
):
    """获取邀请码列表（仅管理员）。"""
    codes = InviteCodeRepository.list_all()
    for c in codes:
        c["_id"] = str(c["_id"])
    return ApiResponse(data=codes)


@router.post("/invite-codes")
async def create_invite_code(
    req: CreateInviteRequest,
    admin: dict = Depends(require_admin),
):
    """创建邀请码（仅管理员）。"""
    expires_at = datetime.now(timezone.utc) + timedelta(hours=req.expires_hours)
    invite = InviteCodeRepository.create(
        role=req.role,
        max_uses=req.max_uses,
        expires_at=expires_at,
        created_by=admin["user_id"],
    )
    return ApiResponse(data={
        "invite_id": invite.invite_id,
        "invite_code": invite.invite_code,
        "role": invite.role,
        "max_uses": invite.max_uses,
        "expires_at": invite.expires_at.isoformat(),
    })


@router.patch("/invite-codes/{invite_id}/disable")
async def disable_invite_code(
    invite_id: str,
    admin: dict = Depends(require_admin),
):
    """禁用邀请码（仅管理员）。"""
    InviteCodeRepository.disable(invite_id)
    return ApiResponse(message="邀请码已禁用")
```

- [ ] **Step 2: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现 Admin API 端点

- GET /admin/users — 用户列表
- PATCH /admin/users/{id}/status — 启用/禁用用户
- GET /admin/invite-codes — 邀请码列表
- POST /admin/invite-codes — 创建邀请码
- PATCH /admin/invite-codes/{id}/disable — 禁用邀请码"
```

---

### Task 8: 前端 — API 客户端 + Zustand 状态管理

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/stores/authStore.ts`

- [ ] **Step 1: 写入 HTTP 客户端（`frontend/src/api/client.ts`）**

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：自动附加 Token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ai4ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：401 自动清除 Token
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('ai4ms_token')
      window.dispatchEvent(new CustomEvent('ai4ms-auth-expired'))
    }
    return Promise.reject(error)
  },
)

// ── Auth API ──

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  invite_code: string
  username: string
  password: string
  organization: string
}

export interface UserInfo {
  user_id: string
  username: string
  role: 'admin' | 'user'
  status: string
  organization: string
}

export interface AuthData {
  token: string
  user: UserInfo
}

export interface MeData {
  auth_enabled: boolean
  user: UserInfo | null
}

export const authApi = {
  login: (params: LoginParams) =>
    apiClient.post('/auth/login', params) as Promise<{ code: number; data: AuthData }>,

  register: (params: RegisterParams) =>
    apiClient.post('/auth/register', params) as Promise<{ code: number; data: AuthData }>,

  me: () =>
    apiClient.get('/auth/me') as Promise<{ code: number; data: MeData }>,
}

// ── Admin API ──

export const adminApi = {
  listUsers: () =>
    apiClient.get('/admin/users') as Promise<{ code: number; data: any[] }>,

  updateUserStatus: (userId: string, status: 'active' | 'disabled') =>
    apiClient.patch(`/admin/users/${userId}/status`, { status }),

  listInviteCodes: () =>
    apiClient.get('/admin/invite-codes') as Promise<{ code: number; data: any[] }>,

  createInviteCode: (params: { role: string; max_uses: number; expires_hours: number }) =>
    apiClient.post('/admin/invite-codes', params),

  disableInviteCode: (inviteId: string) =>
    apiClient.patch(`/admin/invite-codes/${inviteId}/disable`),
}

export default apiClient
```

- [ ] **Step 2: 写入鉴权状态（`frontend/src/stores/authStore.ts`）**

```typescript
import { create } from 'zustand'
import { authApi, type UserInfo } from '@/api/client'

interface AuthState {
  isInitialized: boolean
  isAuthenticated: boolean
  authEnabled: boolean
  user: UserInfo | null
  isLoading: boolean

  initialize: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  register: (params: {
    invite_code: string
    username: string
    password: string
    organization: string
  }) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'ai4ms_token'

function persistToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  authEnabled: true,
  user: null,
  isLoading: false,

  initialize: async () => {
    try {
      const res = await authApi.me()
      const { auth_enabled, user } = res.data
      set({
        isInitialized: true,
        authEnabled: auth_enabled,
        isAuthenticated: !!user,
        user: user ?? null,
      })
    } catch {
      set({ isInitialized: true, authEnabled: true, isAuthenticated: false, user: null })
    }
  },

  login: async (username: string, password: string) => {
    const res = await authApi.login({ username, password })
    const { token, user } = res.data
    persistToken(token)
    set({ isAuthenticated: true, user })
  },

  register: async (params) => {
    const res = await authApi.register(params)
    const { token, user } = res.data
    persistToken(token)
    set({ isAuthenticated: true, user })
  },

  logout: () => {
    clearToken()
    set({ isAuthenticated: false, user: null })
  },
}))
```

- [ ] **Step 3: 写入鉴权 Hook（`frontend/src/hooks/useAuth.ts`）**

```typescript
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const store = useAuthStore()
  return {
    isAuthenticated: store.isAuthenticated,
    isInitialized: store.isInitialized,
    authEnabled: store.authEnabled,
    user: store.user,
    isLoading: store.isLoading,
    isAdmin: store.user?.role === 'admin',
    login: store.login,
    register: store.register,
    logout: store.logout,
  }
}
```

- [ ] **Step 4: 手动创建目录结构**

```bash
mkdir -p E:/github_project/AI4MS/frontend/src/api
mkdir -p E:/github_project/AI4MS/frontend/src/stores
mkdir -p E:/github_project/AI4MS/frontend/src/hooks
mkdir -p E:/github_project/AI4MS/frontend/src/components
mkdir -p E:/github_project/AI4MS/frontend/src/pages/admin
```

- [ ] **Step 5: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 添加 API 客户端与 Zustand 鉴权状态管理

- Axios 拦截器：自动附加 Token + 401 过期处理
- authStore：登录/注册/登出/初始化
- useAuth Hook 封装"
```

---

### Task 9: 前端 — 路由 + 鉴权守卫

**Files:**
- Create: `frontend/src/router.tsx`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 写入路由配置（`frontend/src/router.tsx`）**

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import UsersPage from '@/pages/admin/UsersPage'
import InvitesPage from '@/pages/admin/InvitesPage'

function AuthGuard({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, user, authEnabled } = useAuthStore()

  if (!authEnabled) return <>{children}</>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authEnabled } = useAuthStore()
  if (!authEnabled || isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/login',
        element: <GuestGuard><LoginPage /></GuestGuard>,
      },
      {
        path: '/register',
        element: <GuestGuard><RegisterPage /></GuestGuard>,
      },
      {
        path: '/',
        element: <AuthGuard><HomePage /></AuthGuard>,
      },
      {
        path: '/admin/users',
        element: <AuthGuard requireAdmin><UsersPage /></AuthGuard>,
      },
      {
        path: '/admin/invites',
        element: <AuthGuard requireAdmin><InvitesPage /></AuthGuard>,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
```

- [ ] **Step 2: 重写入口文件（`frontend/src/main.tsx`）**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
```

- [ ] **Step 3: 准备 App.tsx（轻量入口）**

```typescript
export default function App() {
  return null
}
```

- [ ] **Step 4: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 配置路由与鉴权守卫

- React Router v7 createBrowserRouter
- AuthGuard/GuestGuard 组件：未登录→/login, 已登录→/, 非admin→/
- 5 条路由：login / register / home / admin/users / admin/invites"
```

---

### Task 10: 前端 — 背景组件与布局

**Files:**
- Create: `frontend/src/components/StarFieldBg.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/UserNav.tsx`

- [ ] **Step 1: 写入深空背景（`frontend/src/components/StarFieldBg.tsx`）**

```typescript
import { useEffect, useRef } from 'react'

/** 深空粒子/光晕背景，使用 Canvas 绘制缓慢移动的粒子。 */
export default function StarFieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 生成粒子
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(148, 163, 184, ${p.alpha})`
        ctx!.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas!.width
        if (p.x > canvas!.width) p.x = 0
        if (p.y < 0) p.y = canvas!.height
        if (p.y > canvas!.height) p.y = 0
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
```

- [ ] **Step 2: 写入用户导航菜单（`frontend/src/components/UserNav.tsx`）**

```typescript
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** 右上角用户头像与下拉菜单。 */
export default function UserNav() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <button
          onClick={() => navigate('/admin/users')}
          className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-wide"
        >
          管理
        </button>
      )}
      <div className="relative group">
        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                        text-xs text-white/60 font-medium cursor-pointer
                        border border-white/6 hover:border-white/15 transition-colors">
          {initial}
        </div>
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl
                        bg-white/5 backdrop-blur-xl border border-white/8
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 z-50 shadow-2xl">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs text-white/70">{user?.username}</div>
            <div className="text-[10px] text-white/30 mt-0.5">
              {user?.role === 'admin' ? '管理员' : '用户'}
            </div>
          </div>
          <div className="py-1">
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full text-left px-4 py-2 text-xs text-white/50
                             hover:bg-white/5 hover:text-white/70 transition-colors"
                >
                  用户管理
                </button>
                <button
                  onClick={() => navigate('/admin/invites')}
                  className="w-full text-left px-4 py-2 text-xs text-white/50
                             hover:bg-white/5 hover:text-white/70 transition-colors"
                >
                  邀请码管理
                </button>
                <div className="border-t border-white/5 my-1" />
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-xs text-red-400/60
                         hover:bg-red-400/5 hover:text-red-400/80 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 写入布局组件（`frontend/src/components/Layout.tsx`）**

```typescript
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import StarFieldBg from '@/components/StarFieldBg'
import UserNav from '@/components/UserNav'

/** 全局布局：深空背景 + 顶部导航 + Outlet。在 mount 时初始化鉴权状态。 */
export default function Layout() {
  const initialize = useAuthStore((s) => s.initialize)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const location = useLocation()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-blue-400/60 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #0c0c0c 0%, #0f0f0f 30%, #0d1b2a 70%, #0a1628 100%)',
    }}>
      <StarFieldBg />

      {/* 光晕装饰 */}
      <div className="fixed pointer-events-none" style={{
        top: '-20%', left: '20%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)',
        borderRadius: '50%',
      }} />
      <div className="fixed pointer-events-none" style={{
        bottom: '-15%', right: '10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* 顶部导航 */}
      {location.pathname !== '/login' && location.pathname !== '/register' && (
        <nav className="relative z-20 flex items-center justify-between px-8 py-4
                        border-b border-white/4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center
                          text-xs font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              M
            </div>
            <span className="text-sm font-light tracking-[3px] text-white/85">
              AI<sup className="text-[7px] tracking-[1px]">4</sup>MS
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-wide">
              首页
            </a>
            <UserNav />
          </div>
        </nav>
      )}

      {/* 页面内容 */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* 底部署名 */}
      {location.pathname === '/' && (
        <footer className="relative z-10 text-center pb-8">
          <span className="text-[11px] text-white/10 tracking-[1px]">
            Xiamen Jiageng Innovation Laboratory
          </span>
        </footer>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 添加深空背景、全局布局与用户导航

- StarFieldBg：Canvas 粒子星场背景
- Layout：全局容器 + 光晕装饰 + 顶部导航 + 鉴权初始化
- UserNav：头像 + hover 下拉菜单（管理员入口/退出）"
```

---

### Task 11: 前端 — 登录页 & 注册页

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Create: `frontend/src/components/AppCard.tsx` (先占位，Task 12 会用到)

- [ ] **Step 1: 写入登录页（`frontend/src/pages/LoginPage.tsx`）**

```typescript
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* 光晕 */}
      <div className="absolute top-[-30%] left-[30%] w-[500px] h-[500px]
                      rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px]
                      rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-[380px] rounded-2xl p-10
                   bg-white/[0.02] border border-white/[0.06]
                   backdrop-blur-xl shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3
                        text-sm font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            M
          </div>
          <div className="text-xl font-light tracking-[4px] text-white/85">
            AI<sup className="text-[8px] tracking-[1px]">4</sup>MS
          </div>
          <div className="text-[11px] text-white/25 mt-1.5 tracking-[1px]">统一研发门户</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15
                         focus:outline-none focus:border-blue-400/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15
                         focus:outline-none focus:border-blue-400/30 transition-colors"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-400/80"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px]
                       text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(139,92,246,0.8))' }}
          >
            {loading ? '登录中...' : '登 录'}
          </motion.button>
        </form>

        <div className="text-center mt-5">
          <Link to="/register" className="text-[11px] text-white/25 hover:text-blue-400/60 transition-colors">
            没有账号？使用邀请码注册 &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 写入注册页（`frontend/src/pages/RegisterPage.tsx`）**

```typescript
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

export default function RegisterPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        invite_code: inviteCode,
        username,
        password,
        organization,
      })
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute top-[-30%] left-[30%] w-[500px] h-[500px]
                      rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px]
                      rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-[380px] rounded-2xl p-10
                   bg-white/[0.02] border border-white/[0.06]
                   backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-7">
          <div className="text-lg font-light tracking-[3px] text-white/85">创建账号</div>
          <div className="text-[11px] text-white/30 mt-1.5">需要有效的邀请码</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">邀请码</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="请输入邀请码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15
                         focus:outline-none focus:border-purple-400/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15
                         focus:outline-none focus:border-purple-400/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15
                         focus:outline-none focus:border-purple-400/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">单位</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="请输入所在单位（选填）"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15
                         focus:outline-none focus:border-purple-400/30 transition-colors"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-400/80"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px]
                       text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))' }}
          >
            {loading ? '注册中...' : '注 册'}
          </motion.button>
        </form>

        <div className="text-center mt-5">
          <Link to="/login" className="text-[11px] text-white/25 hover:text-purple-400/60 transition-colors">
            已有账号？返回登录 &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: 创建占位文件**

`frontend/src/pages/HomePage.tsx`:
```typescript
export default function HomePage() {
  return <div className="p-8 text-white/50">HomePage placeholder</div>
}
```

`frontend/src/pages/NotFoundPage.tsx`:
```typescript
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="text-6xl font-light text-white/10">404</div>
      <div className="text-sm text-white/30">页面不存在</div>
      <Link to="/" className="text-xs text-blue-400/50 hover:text-blue-400/80 transition-colors mt-2">
        返回首页 &rarr;
      </Link>
    </div>
  )
}
```

`frontend/src/pages/admin/UsersPage.tsx`:
```typescript
export default function UsersPage() {
  return <div className="p-8 text-white/50">UsersPage placeholder</div>
}
```

`frontend/src/pages/admin/InvitesPage.tsx`:
```typescript
export default function InvitesPage() {
  return <div className="p-8 text-white/50">InvitesPage placeholder</div>
}
```

`frontend/src/components/AppCard.tsx`:
```typescript
export default function AppCard() {
  return null
}
```

- [ ] **Step 4: 验证前端开发服务器启动**

```bash
cd E:/github_project/AI4MS/frontend
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Expected: 200
```

- [ ] **Step 5: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现登录页和注册页

- LoginPage：渐变按钮、输入框 focus 动效、错误提示 + shake
- RegisterPage：邀请码 + 用户名 + 密码 + 单位字段
- 占位页面：HomePage / NotFoundPage / UsersPage / InvitesPage"
```

---

### Task 12: 前端 — 门户首页（应用卡片 + 粒子背景）

**Files:**
- Modify: `frontend/src/components/AppCard.tsx`
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: 重写应用卡片组件（`frontend/src/components/AppCard.tsx`）**

```typescript
import { motion } from 'framer-motion'

interface AppCardProps {
  name: string
  description: string[]
  icon: string
  accentColor: string
  accentColorClass: string
  url: string
}

/** 门户首页应用入口卡片，带 hover 发光+上浮效果。 */
export default function AppCard({ name, description, icon, accentColor, accentColorClass, url }: AppCardProps) {
  const handleClick = () => {
    const token = sessionStorage.getItem('ai4ms_token')
    if (token) {
      // 通过 URL hash 传递 Token 给子平台
      window.open(`${url}#token=${token}`, '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClick}
      className="relative w-[220px] rounded-2xl p-8 text-center cursor-pointer
                 transition-all duration-300 group overflow-hidden"
      style={{
        background: `rgba(255,255,255,0.02)`,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}40`
        e.currentTarget.style.boxShadow = `0 0 30px ${accentColor}10`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* 顶部发光线 */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-100 transition-opacity"
           style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-base font-normal tracking-[1px] mb-2 transition-colors"
           style={{ color: accentColorClass }}>
        {name}
      </div>
      <div className="text-[11px] text-white/30 leading-relaxed mb-4">
        {description.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className="text-[11px] tracking-[1px] transition-colors"
           style={{ color: `${accentColor}80` }}>
        进入平台 &rarr;
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: 重写首页（`frontend/src/pages/HomePage.tsx`）**

```typescript
import { motion } from 'framer-motion'
import AppCard from '@/components/AppCard'

const apps = [
  {
    name: '智能谱学分析',
    description: ['NMR · IR · Raman', 'GPC · LCMS'],
    icon: '🔬',
    accentColor: '#3b82f6',
    accentColorClass: '#93c5fd',
    url: 'https://specagent.wumiaox.com',
  },
  {
    name: '高分子研发',
    description: ['配方设计 · 工艺优化', '性能预测 · 实验方案'],
    icon: '🧬',
    accentColor: '#8b5cf6',
    accentColorClass: '#c4b5fd',
    url: 'https://specpoly.wumiaox.com',
  },
  {
    name: '实验自动化监控',
    description: ['设备管理 · 工作流编排', '参数下发 · 实时监控'],
    icon: '🖥️',
    accentColor: '#10b981',
    accentColorClass: '#6ee7b7',
    url: 'https://speclabos.wumiaox.com',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-8">
      {/* 标题区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-[38px] font-extralight tracking-[8px] text-white/85">
          AI<sup className="text-sm tracking-[2px] font-light">4</sup>MS
        </h1>
        <div className="w-[100px] h-px mx-auto my-3"
             style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }} />
        <p className="text-sm font-light tracking-[2px] text-white/35">
          AI for Molecular Science
        </p>
      </motion.div>

      {/* 应用卡片 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex gap-5"
      >
        {apps.map((app) => (
          <motion.div key={app.name} variants={itemVariants}>
            <AppCard {...app} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现首页应用卡片启动器

- AppCard：hover 边框发光 + 上浮 + 顶部发光线 + 点击跳转子平台带 Token
- HomePage：stagger 进场动画 + 品牌标题区 + 三张卡片"
```

---

### Task 13: 前端 — 管理后台页面

**Files:**
- Modify: `frontend/src/pages/admin/UsersPage.tsx`
- Modify: `frontend/src/pages/admin/InvitesPage.tsx`

- [ ] **Step 1: 重写用户管理页（`frontend/src/pages/admin/UsersPage.tsx`）**

```typescript
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, type UserInfo } from '@/api/client'

export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await adminApi.listUsers()
      setUsers(res.data)
    } catch {
      /* handle */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleStatus = async (userId: string, current: string) => {
    const newStatus = current === 'active' ? 'disabled' : 'active'
    await adminApi.updateUserStatus(userId, newStatus)
    fetchUsers()
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-lg font-light tracking-[3px] text-white/75 mb-8">用户管理</h2>

        <div className="rounded-xl bg-white/[0.015] border border-white/[0.05] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs">
                <th className="text-left font-normal px-6 py-3">用户名</th>
                <th className="text-left font-normal px-6 py-3">角色</th>
                <th className="text-left font-normal px-6 py-3">单位</th>
                <th className="text-left font-normal px-6 py-3">状态</th>
                <th className="text-left font-normal px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/20">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/20">暂无用户</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="border-b border-white/[0.02] text-white/60 hover:bg-white/[0.015] transition-colors">
                    <td className="px-6 py-3.5">{u.username}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-blue-400/10 text-blue-300/80'
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {u.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-white/30">{u.organization || '—'}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs ${u.status === 'active' ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                        {u.status === 'active' ? '● 正常' : '● 已禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleStatus(u.user_id, u.status)}
                          className={`text-xs hover:underline transition-colors ${
                            u.status === 'active'
                              ? 'text-red-400/50 hover:text-red-400/80'
                              : 'text-emerald-400/50 hover:text-emerald-400/80'
                          }`}
                        >
                          {u.status === 'active' ? '禁用' : '启用'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 重写邀请码管理页（`frontend/src/pages/admin/InvitesPage.tsx`）**

```typescript
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/api/client'

interface InviteCode {
  invite_id: string
  invite_code: string
  role: string
  status: string
  max_uses: number
  used_count: number
  expires_at: string
}

export default function InvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [maxUses, setMaxUses] = useState(10)
  const [expiresHours, setExpiresHours] = useState(72)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchCodes = async () => {
    try {
      const res = await adminApi.listInviteCodes()
      setCodes(res.data)
    } catch {
      /* handle */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCodes() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await adminApi.createInviteCode({ role, max_uses: maxUses, expires_hours: expiresHours })
      const data = res.data as any
      setNewCode(data.invite_code)
      fetchCodes()
    } catch {
      /* handle */
    } finally {
      setCreating(false)
    }
  }

  const handleDisable = async (inviteId: string) => {
    await adminApi.disableInviteCode(inviteId)
    fetchCodes()
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('zh-CN')
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-light tracking-[3px] text-white/75">邀请码管理</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowCreate(true); setNewCode(null) }}
            className="px-4 py-2 text-xs rounded-lg tracking-wide
                       bg-purple-400/10 border border-purple-400/20
                       text-purple-300/70 hover:text-purple-300/90
                       hover:border-purple-400/30 transition-colors"
          >
            + 生成邀请码
          </motion.button>
        </div>

        <div className="rounded-xl bg-white/[0.015] border border-white/[0.05] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs">
                <th className="text-left font-normal px-6 py-3">邀请码</th>
                <th className="text-left font-normal px-6 py-3">角色</th>
                <th className="text-left font-normal px-6 py-3">已用/上限</th>
                <th className="text-left font-normal px-6 py-3">过期时间</th>
                <th className="text-left font-normal px-6 py-3">状态</th>
                <th className="text-left font-normal px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/20">加载中...</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/20">暂无邀请码</td></tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.invite_id} className="border-b border-white/[0.02] text-white/60 hover:bg-white/[0.015] transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs text-purple-300/70">{c.invite_code}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        c.role === 'admin'
                          ? 'bg-blue-400/10 text-blue-300/80'
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {c.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-white/40">{c.used_count} / {c.max_uses}</td>
                    <td className="px-6 py-3.5 text-white/30">{formatDate(c.expires_at)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs ${
                        c.status === 'active' ? 'text-emerald-400/60' : 'text-white/20'
                      }`}>
                        {c.status === 'active' ? '有效' : c.status === 'disabled' ? '已禁用' : '已用完'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {c.status === 'active' && (
                        <button
                          onClick={() => handleDisable(c.invite_id)}
                          className="text-xs text-red-400/50 hover:text-red-400/80 hover:underline transition-colors"
                        >
                          禁用
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 创建邀请码 Dialog */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-[400px] rounded-2xl p-8 bg-[#111] border border-white/[0.08] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-light tracking-[2px] text-white/75 mb-6">生成邀请码</h3>

                {newCode ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-lg p-4">
                      <div className="text-[10px] text-white/30 mb-1 tracking-wide">新邀请码</div>
                      <div className="text-sm font-mono text-emerald-300/80 break-all">{newCode}</div>
                    </div>
                    <button
                      onClick={() => setShowCreate(false)}
                      className="w-full rounded-lg py-2.5 text-xs text-white/40
                                 border border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block tracking-wide">角色</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/60"
                      >
                        <option value="user">用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block tracking-wide">最大使用次数</label>
                      <input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(Number(e.target.value))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/60"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block tracking-wide">有效期（小时）</label>
                      <input
                        type="number"
                        value={expiresHours}
                        onChange={(e) => setExpiresHours(Number(e.target.value))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/60"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowCreate(false)}
                        className="flex-1 rounded-lg py-2.5 text-xs text-white/30
                                   border border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                      >
                        取消
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreate}
                        disabled={creating}
                        className="flex-1 rounded-lg py-2.5 text-xs text-white tracking-wide
                                   bg-purple-400/20 border border-purple-400/25
                                   hover:bg-purple-400/25 transition-colors disabled:opacity-50"
                      >
                        {creating ? '生成中...' : '生成'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "feat: 实现管理后台页面

- UsersPage：用户列表表格，启用/禁用操作，角色 badge
- InvitesPage：邀请码列表 + 创建 Dialog（角色/次数/有效期），结果显示
- 管理员不能禁用自己（前端禁用 admin 用户的按钮不显示）"
```

---

### Task 14: 前后端联调 — 初始化数据与端到端验证

- [ ] **Step 1: 创建管理员脚本（`backend/scripts/create_admin.py`）**

```bash
mkdir -p E:/github_project/AI4MS/backend/scripts
```

写入 `backend/scripts/create_admin.py`:
```python
"""创建初始管理员用户（用于开发/生产环境初始化）。"""

import hashlib
import os
import secrets
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.infra.mongo import init_mongo
from app.core.config import settings


def hash_pwd(password: str) -> str:
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
    })
    print(f"管理员 {username} 创建成功")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 启动 MongoDB（如本地未运行）并初始化管理员**

```bash
# 如果 MongoDB 没有运行，启动它
# 创建管理员
cd E:/github_project/AI4MS/backend
python scripts/create_admin.py admin admin123
# Expected: 管理员 admin 创建成功
```

- [ ] **Step 3: 端到端测试**

```bash
# 1. 启动后端
cd E:/github_project/AI4MS/backend
python -m uvicorn app.main:app --port 8001 &
sleep 2

# 2. 测试登录
curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: {"code":0,"message":"成功","data":{"token":"...","user":{...}}}

# 3. 保存 token 后测试 /me
TOKEN="<从登录结果获取>"
curl -s http://localhost:8001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
# Expected: 返回用户信息

# 4. 测试用户列表
curl -s http://localhost:8001/api/v1/admin/users \
  -H "Authorization: Bearer $TOKEN"
# Expected: 返回用户数组

# 5. 启动前端
cd E:/github_project/AI4MS/frontend
npm run dev &
sleep 3

# 6. 浏览器打开 http://localhost:5173
# 验证：登录页 → 登录 → 首页卡片 → 管理后台
```

- [ ] **Step 4: 提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "chore: 添加管理员创建脚本与联调完成

- create_admin.py：创建初始管理员用户
- 前后端联调验证通过：
  - 登录/注册/me API
  - 用户管理/邀请码管理 API
  - 前端路由守卫 + 页面渲染"
```

---

### Task 15: 最终修整 — 验证 & .gitignore

- [ ] **Step 1: 创建 `.gitignore`**

```bash
cat > E:/github_project/AI4MS/.gitignore << 'EOF'
node_modules/
dist/
__pycache__/
*.pyc
.venv/
venv/
.env
*.egg-info/
.superpowers/
.runtime/
EOF
```

- [ ] **Step 2: 最终验证**

```bash
# 确认前端无 TypeScript 编译错误
cd E:/github_project/AI4MS/frontend
npx tsc --noEmit

# 确认后端无语法错误
cd E:/github_project/AI4MS/backend
python -c "import py_compile; import glob
for f in glob.glob('app/**/*.py', recursive=True):
    py_compile.compile(f, doraise=True)
print('All Python files OK')"
```

- [ ] **Step 3: 最终提交**

```bash
cd E:/github_project/AI4MS
git add -A
git commit -m "chore: 添加 .gitignore、TypeScript 编译检查、最终清理"
```
