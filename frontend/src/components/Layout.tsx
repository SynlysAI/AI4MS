import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import StarFieldBg from '@/components/StarFieldBg'
import UserNav from '@/components/UserNav'

/** 全局布局：深空背景 + 粒子动画 + 光晕 + 顶部导航栏。 */
export default function Layout() {
  const initialize = useAuthStore((s) => s.initialize)
  const logout = useAuthStore((s) => s.logout)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { initialize() }, [initialize])

  useEffect(() => {
    const handleAuthExpired = () => {
      logout()
      navigate('/login')
    }
    window.addEventListener('ai4ms-auth-expired', handleAuthExpired)
    return () => window.removeEventListener('ai4ms-auth-expired', handleAuthExpired)
  }, [logout, navigate])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-blue-400/60 rounded-full animate-spin" />
      </div>
    )
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #0c0c0c 0%, #0f0f0f 30%, #0d1b2a 70%, #0a1628 100%)',
    }}>
      <StarFieldBg />
      <div className="fixed pointer-events-none" style={{
        top: '-20%', left: '20%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)', borderRadius: '50%',
      }} />
      <div className="fixed pointer-events-none" style={{
        bottom: '-15%', right: '10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)', borderRadius: '50%',
      }} />
      {!isAuthPage && (
        <nav className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-white/4">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>M</div>
            <span className="text-sm font-light tracking-[3px] text-white/85">
              AI<sup className="text-[7px] tracking-[1px]">4</sup>MS
            </span>
          </button>
          <div className="flex items-center gap-6">
            <a href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-wide">首页</a>
            <UserNav />
          </div>
        </nav>
      )}
      <main className="relative z-10"><Outlet /></main>
      {isHome && (
        <footer className="relative z-10 text-center pb-8">
          <span className="text-[11px] text-white/10 tracking-[1px]">Xiamen Jiageng Innovation Laboratory</span>
        </footer>
      )}
    </div>
  )
}
