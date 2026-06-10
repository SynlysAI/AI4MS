import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* 请求拦截：自动附加 Token */
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ai4ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* 响应拦截：401 自动清除 Token 并通知 */
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

export default apiClient

/* ── 类型定义 ── */

export interface UserInfo {
  user_id: string
  username: string
  role: 'admin' | 'user'
  status: string
  organization?: string
  created_at?: string
  last_login_at?: string | null
}

/** 登录响应 data 字段 */
export interface LoginData {
  auth_enabled: boolean
  user_id: string
  username: string
  role: 'admin' | 'user'
  status: string
  organization?: string
  access_token: string
  token_type: string
  expires_at: number
}

/** /auth/me 响应 data 字段 */
export interface MeData {
  auth_enabled: boolean
  authenticated: boolean
  user_id: string
  username: string
  role: 'admin' | 'user'
  status: string
  organization?: string
}

export interface InviteCode {
  invite_id: string
  invite_code: string
  role: string
  status: string
  max_uses: number
  used_count: number
  expires_at: string
  created_by?: string
  created_at?: string
}

/** 分页列表响应 */
export interface ListData<T> {
  total: number
  items: T[]
}

/* ── API 响应通用结构 ── */

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/* ── Auth API ── */

export const authApi = {
  login: (params: { username: string; password: string }) =>
    apiClient.post('/auth/login', params) as Promise<ApiResponse<LoginData>>,

  register: (params: {
    invite_code: string
    username: string
    password: string
    organization: string
  }) => apiClient.post('/auth/register', params) as Promise<ApiResponse<LoginData>>,

  me: () => apiClient.get('/auth/me') as Promise<ApiResponse<MeData>>,
}

/* ── Admin API ── */

export const adminApi = {
  listUsers: () =>
    apiClient.get('/admin/users') as Promise<ApiResponse<ListData<UserInfo>>>,

  updateUserStatus: (userId: string, status: 'active' | 'disabled') =>
    apiClient.patch(`/admin/users/${userId}/status`, { status }),

  listInviteCodes: () =>
    apiClient.get('/admin/invite-codes') as Promise<ApiResponse<ListData<InviteCode>>>,

  createInviteCode: (params: {
    role: string
    max_uses: number
    expires_hours: number
  }) => apiClient.post('/admin/invite-codes', params) as Promise<ApiResponse<InviteCode>>,

  disableInviteCode: (inviteId: string) =>
    apiClient.patch(`/admin/invite-codes/${inviteId}/disable`),
}
