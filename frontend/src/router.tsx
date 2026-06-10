import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import UsersPage from '@/pages/admin/UsersPage'
import InvitesPage from '@/pages/admin/InvitesPage'

/** 需要登录才能访问的路由守卫。 */
function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const { isAuthenticated, user, authEnabled } = useAuthStore()

  if (!authEnabled) return <>{children}</>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

/** 仅未登录用户可访问的路由守卫（登录/注册页）。 */
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
        element: (
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/admin/users',
        element: (
          <AuthGuard requireAdmin>
            <UsersPage />
          </AuthGuard>
        ),
      },
      {
        path: '/admin/invites',
        element: (
          <AuthGuard requireAdmin>
            <InvitesPage />
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
