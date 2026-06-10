import { create } from 'zustand'
import { authApi, type UserInfo } from '@/api/client'

const TOKEN_KEY = 'ai4ms_token'

function persistToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

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

/** 从扁平 API 响应中提取 UserInfo。 */
function extractUser(d: Record<string, any>): UserInfo {
  return {
    user_id: d.user_id,
    username: d.username,
    role: d.role,
    status: d.status,
    organization: d.organization ?? '',
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  isInitialized: false,
  isAuthenticated: false,
  authEnabled: true,
  user: null,
  isLoading: false,

  initialize: async () => {
    try {
      const res = await authApi.me()
      const d = res.data
      set({
        isInitialized: true,
        authEnabled: d.auth_enabled,
        isAuthenticated: d.authenticated,
        user: d.authenticated ? extractUser(d) : null,
      })
    } catch {
      set({
        isInitialized: true,
        authEnabled: true,
        isAuthenticated: false,
        user: null,
      })
    }
  },

  login: async (username: string, password: string) => {
    const res = await authApi.login({ username, password })
    const d = res.data
    persistToken(d.access_token)
    set({ isAuthenticated: true, user: extractUser(d) })
  },

  register: async (params) => {
    const res = await authApi.register(params)
    const d = res.data
    persistToken(d.access_token)
    set({ isAuthenticated: true, user: extractUser(d) })
  },

  logout: () => {
    clearToken()
    set({ isAuthenticated: false, user: null })
  },
}))
