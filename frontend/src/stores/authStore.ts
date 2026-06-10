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
      const u = d.user
      set({
        isInitialized: true,
        authEnabled: d.auth_enabled,
        isAuthenticated: !!u,
        user: u ? {
          user_id: u.user_id,
          username: u.username,
          role: u.role,
          status: u.status,
          organization: u.organization ?? '',
        } : null,
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
    persistToken(d.token)
    set({
      isAuthenticated: true,
      user: {
        user_id: d.user.user_id,
        username: d.user.username,
        role: d.user.role,
        status: 'active',
        organization: d.user.organization ?? '',
      },
    })
  },

  register: async (params) => {
    const res = await authApi.register(params)
    const d = res.data
    persistToken(d.token)
    set({
      isAuthenticated: true,
      user: {
        user_id: d.user.user_id,
        username: d.user.username,
        role: d.user.role,
        status: 'active',
        organization: d.user.organization ?? '',
      },
    })
  },

  logout: () => {
    clearToken()
    set({ isAuthenticated: false, user: null })
  },
}))
