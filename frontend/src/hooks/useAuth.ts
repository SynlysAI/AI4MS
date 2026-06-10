import { useAuthStore } from '@/stores/authStore'

/** 鉴权组合 hook，提供用户状态和操作方法。 */
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
