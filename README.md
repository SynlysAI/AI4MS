# AI⁴MS — 统一研发门户

> AI for Molecular Science · 嘉庚创新实验室材料研发统一入口

深空科技风格的 Web 门户，承载智能谱学分析、高分子研发和实验自动化监控三大子平台的导航、统一认证和应用管理。

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript + Vite |
| UI 样式 | Tailwind CSS 3 + 自定义深空主题 |
| 动效 | Framer Motion |
| 路由 | React Router v7（鉴权守卫） |
| 状态管理 | Zustand |
| HTTP | Axios（拦截器 + Token 附加） |
| 后端 | Python FastAPI |
| 数据库 | MongoDB |
| 认证 | HMAC-SHA256 自签名 Token（SSO 兼容） |

## 项目结构

```
AI4MS/
├── frontend/                    # React SPA 前端
│   ├── src/
│   │   ├── api/client.ts        # Axios 封装 + 全部 API 函数
│   │   ├── stores/authStore.ts  # Zustand 鉴权状态
│   │   ├── hooks/useAuth.ts     # 鉴权 Hook
│   │   ├── router.tsx           # 路由 + AuthGuard/GuestGuard
│   │   ├── components/
│   │   │   ├── StarFieldBg.tsx  # Canvas 星场粒子背景
│   │   │   ├── Layout.tsx       # 全局布局（光晕 + 导航）
│   │   │   ├── UserNav.tsx      # 用户头像下拉菜单
│   │   │   └── AppCard.tsx      # 应用入口卡片
│   │   └── pages/
│   │       ├── LoginPage.tsx    # 登录
│   │       ├── RegisterPage.tsx # 邀请码注册
│   │       ├── HomePage.tsx     # 门户首页
│   │       ├── NotFoundPage.tsx # 404
│   │       └── admin/
│   │           ├── UsersPage.tsx    # 用户管理
│   │           └── InvitesPage.tsx  # 邀请码管理
│   └── ...配置文件
├── backend/                     # FastAPI 后端
│   ├── app/
│   │   ├── main.py              # 应用入口 + CORS + lifespan
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic Settings 配置
│   │   │   └── auth.py          # Token 生成/校验 + 鉴权守卫
│   │   ├── models/identity.py   # User / InviteCode 领域模型
│   │   ├── infra/
│   │   │   ├── mongo.py         # MongoDB 连接管理
│   │   │   └── repositories.py  # 数据仓储层
│   │   ├── services/auth_service.py  # 注册/登录业务逻辑
│   │   └── api/v1/
│   │       ├── auth.py          # /auth/login, /auth/register, /auth/me
│   │       └── admin.py         # /admin/users, /admin/invite-codes
│   └── scripts/create_admin.py  # 管理员创建脚本
└── docs/superpowers/            # 设计文档与实施计划
```

## 页面与路由

| 路由 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录页 | 公开（未登录） |
| `/register` | 注册页 | 公开（未登录） |
| `/` | 门户首页 — 三应用卡片启动器 | 需登录 |
| `/admin/users` | 用户管理 | 仅 admin |
| `/admin/invites` | 邀请码管理 | 仅 admin |
| `*` | 404 页面 | 公开 |

### 子平台入口

| 平台 | 链接 |
|------|------|
| 🔬 智能谱学分析 | https://specagent.wumiaox.com |
| 🧬 高分子研发 | https://specpoly.wumiaox.com |
| 🖥️ 实验自动化监控 | https://speclabos.wumiaox.com |

点击卡片时自动携带 Token 跳转，子平台校验通过后直接登录（SSO）。

## 快速开始

### 环境要求

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **MongoDB** ≥ 6.0（已运行）

### 1. 克隆仓库

```bash
git clone <repo-url>
cd AI4MS
```

### 2. 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 AUTH_SECRET 和 MongoDB 连接信息

# 创建管理员账号
python scripts/create_admin.py admin <your-password>

# 启动开发服务器（端口 8001）
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（端口 5173，API 代理到 8001）
npm run dev
```

浏览器打开 `http://localhost:5173`，使用刚才创建的管理员账号登录。

### 4. 生产构建

```bash
cd frontend
npm run build        # tsc + vite build，输出到 dist/
npm run preview      # 预览生产构建
```

## 环境变量

后端 `.env` 配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MONGODB_URI` | MongoDB 连接地址 | `mongodb://localhost:27017` |
| `MONGODB_DB` | 数据库名 | `spec_agent` |
| `AUTH_ENABLED` | 启用鉴权 | `true` |
| `AUTH_TOKEN_EXPIRE_HOURS` | Token 有效期（小时） | `12` |
| `AUTH_SECRET` | HMAC 签名密钥 | 必填（生产环境） |
| `CORS_ORIGINS` | 允许的前端域名 | `http://localhost:5173` |

## API 端点

### Auth

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 |
| POST | `/api/v1/auth/register` | 邀请码注册 |
| GET | `/api/v1/auth/me` | 获取当前用户状态 |

### Admin（需 admin 角色）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/users` | 用户列表 |
| PATCH | `/api/v1/admin/users/{id}/status` | 启用/禁用用户 |
| GET | `/api/v1/admin/invite-codes` | 邀请码列表 |
| POST | `/api/v1/admin/invite-codes` | 创建邀请码 |
| PATCH | `/api/v1/admin/invite-codes/{id}/disable` | 禁用邀请码 |

统一响应格式：`{ code: 0, message: "ok", data: {...} }`

## 设计系统

**深空科技** · 深黑底色 + 蓝紫径向光晕

- **背景**：多层径向渐变光晕 + Canvas 星场粒子动画
- **卡片**：每张卡片独立强调色（蓝/紫/绿），顶部渐变发光线，hover 发光上浮
- **登录/注册**：居中玻璃质感卡片，蓝紫渐变按钮
- **管理后台**：极简线条表格，彩色状态圆点 + 角色 Badge
- **动效**：Framer Motion stagger 入场、hover 过渡、Dialog 缩放

## 认证机制

与子平台（Spec_Agent 等）使用完全相同的 Token 算法：

- **格式**：`{base64(payload)}.{hmac_sha256_signature}`
- **密码哈希**：PBKDF2-SHA256，260,000 次迭代
- **注册方式**：邀请码制（不开放公开注册）
- **角色模型**：`admin` / `user`

## License

Internal — 嘉庚创新实验室
