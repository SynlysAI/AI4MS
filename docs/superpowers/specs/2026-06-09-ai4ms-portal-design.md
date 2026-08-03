# AI4MS 统一门户设计文档

> 版本日期：2026-06-09
> 状态：已确认

## 1. 项目概述

AI4MS（AI for Molecular Science）统一门户，作为嘉庚创新实验室材料研发的单一入口，承载智能谱学分析、高分子研发和实验自动化监控三大子平台的导航、统一认证和应用管理。

**核心目标：**
- 统一入口：一个地址，三个子平台
- 统一认证：登录一次，跳转子平台无需二次登录（SSO）
- 统一管理：管理员通过门户管理所有用户和邀请码

**子平台：**

| 名称 | 链接 | 说明 |
|------|------|------|
| 智能谱学分析平台 | https://specagent.xmuzc.com | NMR/IR/Raman/GPC/LCMS |
| 高分子研发平台 | https://specpoly.xmuzc.com | 配方设计/工艺优化/性能预测 |
| 实验自动化监控系统 | https://speclabos.xmuzc.com | 设备管理/工作流编排/参数下发 |

## 2. 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端框架 | React 18 + Vite | SPA，纯前端渲染 |
| UI 组件 | shadcn/ui (Radix) | 深色主题高度可控，无障碍性内置 |
| 样式 | Tailwind CSS 4 | 原子化样式，深色主题定制 |
| 动效 | Framer Motion | 卡片 hover、页面过渡、微交互 |
| 路由 | React Router v7 | SPA 路由 + 鉴权守卫 |
| 状态管理 | Zustand | 轻量响应式，authStore + appStore |
| HTTP | Axios | 拦截器处理 Token 附加 + 401 过期 |
| 后端 | Python FastAPI | 轻量 auth 服务 |
| 数据库 | MongoDB | 共享 Spec_Agent 的 users + invite_codes 集合 |
| 认证 | HMAC-SHA256 自签名 Token | 与 Spec_Agent 完全相同的 Token 格式 |

## 3. 架构设计

### 3.1 系统拓扑

```
┌─────────────┐     Auth API     ┌──────────────┐
│  AI4MS 门户  │ ──────────────→ │  FastAPI 后端  │
│  (React)    │ ←── Token ───── │  (端口 8000)   │
└──────┬──────┘                  └──────┬───────┘
       │ SSO 跳转                       │ 共享
       ▼                               ▼
┌─────────────┐              ┌─────────────────┐
│  Spec_Agent │ ←── 同Token ─→ │  MongoDB        │
│  Poly_Agent │   直接校验     │  spec_agent DB  │
│  SpecLabOS  │              │  users 集合      │
└─────────────┘              │  invite_codes    │
                              └─────────────────┘
```

### 3.2 SSO 方案

- 门户后端使用与 Spec_Agent **完全相同的 Token 生成/校验算法**（HMAC-SHA256，同一 secret key）
- 门户登录后 Token 存入浏览器 `sessionStorage`
- 跳转子平台时，通过 URL 参数或 postMessage 传递 Token
- Spec_Agent 校验 Token 的 `exp`、`role`、`status`，通过则直接登录
- 后续用户 DB 独立时，只改 MongoDB 连接地址，Token 格式不变

### 3.3 认证机制（参考 Spec_Agent）

- **Token 格式**：`{base64(payload)}.{hmac_signature}`（伪 JWT 格式）
- **Secret 派生**：优先 `AUTH_SECRET` 环境变量，否则 `SHA256(project_root + username + password)`
- **密码哈希**：PBKDF2-SHA256，260000 次迭代
- **注册方式**：邀请码制（不支持公开注册）
- **角色模型**：`admin` / `user`，路由级守卫隔离
- **鉴权开关**：`AUTH_ENABLED=false` 可全局关闭（开发/演示环境）

## 4. 页面与路由

| 路由 | 页面 | 权限 | 说明 |
|------|------|------|------|
| `/login` | 登录页 | 公开 | 用户名+密码 |
| `/register` | 注册页 | 公开 | 邀请码+用户名+密码+单位 |
| `/` | 门户首页 | 需登录 | 三应用卡片 + 粒子背景 |
| `/admin/users` | 用户管理 | admin | 用户列表/启用/禁用 |
| `/admin/invites` | 邀请码管理 | admin | 邀请码列表/创建/禁用 |
| `*` | 404 | 公开 | 找不到页面 |

### 4.1 路由守卫逻辑

```
router.beforeEach:
  if (!hasToken && route != /login && route != /register)
    → /login?redirect=原路径
  if (hasToken && route is /login)
    → /
  if (route.meta.requiresAdmin && user.role != admin)
    → /
  if (收到 401 响应)
    → 清空 Token → /login
```

### 4.2 交互流程

```
未登录 → /login
登录成功 → Token 存 sessionStorage → 跳转 /
点击应用卡片 → 带 Token 跳转子平台
右上角菜单 → 下拉：用户信息 / 管理员入口 / 退出
退出 → 清除 sessionStorage → 跳转 /login
```

## 5. UI/UX 设计规范

### 5.1 整体风格

**深空科技** — 深黑底色 + 蓝紫径向光晕，沉浸式全屏布局，无侧边栏。

### 5.2 配色体系

| 用途 | Tailwind Class | 色值 |
|------|---------------|------|
| 主背景 | 自定义 CSS | `linear-gradient(135deg, #0c0c0c, #0f0f0f, #0d1b2a, #0a1628)` |
| 光晕蓝 | — | `radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)` |
| 光晕紫 | — | `radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)` |
| 卡片背景 | — | `rgba(255,255,255,0.02)` + `border: rgba(255,255,255,0.06)` |
| 谱学强调色 | blue-400 | `#60a5fa` / `#93c5fd` |
| 高分子强调色 | purple-400 | `#c4b5fd` |
| 实验强调色 | emerald-400 | `#6ee7b7` |
| 主文字 | white/80 | `rgba(255,255,255,0.8)` |
| 次文字 | white/40 | `rgba(255,255,255,0.4)` |
| 弱文字 | white/20 | `rgba(255,255,255,0.2)` |

### 5.3 排版

- **标题字体**：系统默认（Inter/系统字体），font-weight 200-300，宽字距
- **品牌字标**：`AI⁴MS`，letter-spacing: 6-8px，font-weight: 200
- **卡片标题**：letter-spacing: 1px，font-weight: 400
- **按钮文字**：letter-spacing: 1px，font-weight: 500

### 5.4 动效规范

| 场景 | 动效 | 参数 |
|------|------|------|
| 卡片 hover | 上浮 + 边框发光 | `y: -4px`, `border-color` 过渡, 0.3s ease-out |
| 页面进入 | 淡入 + 上移 | `opacity: 0→1`, `y: 20→0`, 0.5s |
| 登录错误 | 水平抖动 | `x: [0, -10, 10, -10, 0]`, 0.3s |
| Dialog 弹出 | 缩放 + 淡入 | `scale: 0.95→1`, `opacity: 0→1`, 0.2s |
| 数字变化 | 计数动画 | `animateNumber` |
| 页面切换 | 淡入淡出 | `AnimatePresence` |

### 5.5 组件设计

**首页应用卡片：**
- 尺寸：220×auto，padding 32/24
- 背景半透明 + 半透明边框
- 顶部 1px 渐变发光细线
- 36px 图标 → 16px 标题（强调色）→ 11px 描述（白色 0.3）→ "进入平台 →" 链接

**登录/注册卡片：**
- 尺寸：380px 宽，玻璃质感背景
- Logo 区域 + 输入框 + 渐变按钮
- 底部切换链接

**管理员 Table：**
- 极简线条风格，暗色行分隔
- 角色 Badge：admin 蓝色，user 灰色
- 状态指示：正常绿色圆点，禁用红色圆点
- 操作列：文字链接"启用"/"禁用"

## 6. 数据模型

### 6.1 用户模型（扩展 Spec_Agent 模型）

```python
class UserRecord:
    user_id: str        # "u_" + 12位hex
    username: str
    password_hash: str  # PBKDF2-SHA256
    role: Literal["admin", "user"]
    status: Literal["active", "disabled"]
    organization: str   # 新增：单位
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None
    created_by: str | None
```

### 6.2 邀请码模型

```python
class InviteCodeRecord:
    invite_id: str       # "invite_" + 12位hex
    invite_code: str     # URL安全随机token
    role: Literal["admin", "user"]
    status: Literal["active", "disabled", "expired", "used_up"]
    expires_at: datetime
    max_uses: int
    used_count: int
    created_by: str
    created_at: datetime
    updated_at: datetime
```

## 7. API 端点

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 公开 | 登录，返回 Token + 用户信息 |
| POST | `/api/v1/auth/register` | 公开 | 注册（需邀请码），返回 Token |
| GET | `/api/v1/auth/me` | 需登录 | 获取当前用户信息 + 鉴权状态 |
| GET | `/api/v1/admin/users` | admin | 用户列表 |
| PATCH | `/api/v1/admin/users/{id}/status` | admin | 启用/禁用用户 |
| GET | `/api/v1/admin/invite-codes` | admin | 邀请码列表 |
| POST | `/api/v1/admin/invite-codes` | admin | 创建邀请码 |
| PATCH | `/api/v1/admin/invite-codes/{id}/disable` | admin | 禁用邀请码 |
| GET | `/api/v1/health` | 公开 | 健康检查 |

统一响应格式：
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "request_id": "uuid"
}
```

## 8. 项目结构

```
AI4MS/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui 组件
│   │   │   ├── AppCard.tsx      # 应用卡片
│   │   │   ├── ParticleBg.tsx   # 粒子/光晕背景
│   │   │   └── UserNav.tsx      # 用户导航菜单
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── admin/
│   │   │       ├── UsersPage.tsx
│   │   │       └── InvitesPage.tsx
│   │   ├── stores/
│   │   │   ├── authStore.ts     # 鉴权状态
│   │   │   └── appStore.ts      # 应用数据
│   │   ├── api/
│   │   │   └── client.ts        # Axios 封装
│   │   ├── hooks/
│   │   │   └── useAuth.ts       # 鉴权 hook
│   │   ├── lib/
│   │   │   └── utils.ts         # 工具函数
│   │   ├── router.tsx           # 路由配置 + 守卫
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── index.html
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── router.py
│   │   │   ├── auth.py
│   │   │   └── admin.py
│   │   ├── core/
│   │   │   ├── auth.py          # Token 生成/校验
│   │   │   └── config.py        # Settings
│   │   ├── models/
│   │   │   └── identity.py      # Pydantic 模型
│   │   ├── infra/
│   │   │   ├── mongo.py
│   │   │   └── repositories.py
│   │   ├── services/
│   │   │   └── auth_service.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
└── docs/
    └── superpowers/specs/
        └── 2026-06-09-ai4ms-portal-design.md
```

## 9. 边界说明

**这一版包含：**
- 前端所有页面（登录/注册/首页/管理/404）
- 后端 Auth API（登录/注册/me）
- 后端 Admin API（用户管理/邀请码管理）
- SSO Token 方案（同 Spec_Agent 格式）
- 完整的暗色深空科技主题

**这一版不包含：**
- 真实的高分子大模型调用
- 子平台的真实 SSO 对接（Token 传递方式已定义，但对接放后续）
- 仪表盘数据聚合（首页纯应用启动器）
- 移动端响应式适配（先做桌面端）
- 用户信息修改、密码修改、头像上传等功能

## 10. 里程碑

| 里程碑 | 验收标准 |
|--------|----------|
| 后端 Auth | 登录/注册/me API 可用，Token 生成与 Spec_Agent 算法一致 |
| 后端 Admin | 用户列表/状态切换/邀请码 CRUD API 可用 |
| 前端页面 | 5 个页面完整开发，路由守卫生效 |
| 前端主题 | 深空科技暗色主题完整，动效流畅 |
| 前后端联调 | 前端调用后端 API，登录注册流程走通 |
| 端到端演示 | 注册 → 登录 → 首页 → 点击卡片跳转（带 Token） |
