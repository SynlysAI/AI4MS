import { type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import UsersPage from '@/pages/admin/UsersPage'
import InvitesPage from '@/pages/admin/InvitesPage'

/** 鉴权守卫：未登录重定向到 /login，可选要求管理员角色。 */
function AuthGuard({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, user, authEnabled } = useAuthStore()

  if (!authEnabled) return <>{children}</>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

/** 游客守卫：已登录则重定向到首页。 */
function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, authEnabled } = useAuthStore()
  if (!authEnabled || isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/login', element: <GuestGuard><LoginPage /></GuestGuard> },
      { path: '/register', element: <GuestGuard><RegisterPage /></GuestGuard> },
      { path: '/', element: <AuthGuard><HomePage /></AuthGuard> },
      { path: '/admin/users', element: <AuthGuard requireAdmin><UsersPage /></AuthGuard> },
      { path: '/admin/invites', element: <AuthGuard requireAdmin><InvitesPage /></AuthGuard> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
