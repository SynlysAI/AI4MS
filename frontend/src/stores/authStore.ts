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

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
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
