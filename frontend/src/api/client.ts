import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: auto-attach token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ai4ms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
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

// ── Types ──

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

// ── Auth API ──

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
