import { useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import StarFieldBg from '@/components/StarFieldBg'
import UserNav from '@/components/UserNav'

/** 全局布局：深空背景 + 光晕装饰 + 顶栏导航 + 页面内容。 */
export default function Layout() {
  const initialize = useAuthStore((s) => s.initialize)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const location = useLocation()

  useEffect(() => {
    initialize()
  }, [initialize])

  /* 加载状态 */
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 border-2 border-white/[0.08] border-t-blue-400/60 rounded-full animate-spin" />
          <span className="text-xs text-white/20 tracking-wider">加载中</span>
        </div>
      </div>
    )
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* 主背景渐变 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            'linear-gradient(135deg, #0c0c0c 0%, #0f0f0f 30%, #0d1b2a 70%, #0a1628 100%)',
        }}
      />

      {/* 光晕装饰 */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-20%',
          left: '20%',
          width: '700px',
          height: '700px',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.07), transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '-15%',
          right: '10%',
          width: '550px',
          height: '550px',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '40%',
          left: '50%',
          width: '450px',
          height: '450px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(16,185,129,0.03), transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* 星场粒子 */}
      <StarFieldBg />

      {/* 顶栏导航（非登录/注册页显示） */}
      {!isAuthPage && (
        <nav
          className="relative z-20 flex items-center justify-between px-8 py-4
                     border-b border-white/[0.04] backdrop-blur-sm"
        >
          <Link to="/" className="flex items-center gap-3 group">
            {/* Logo 图标 */}
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center
                         text-[11px] font-bold text-white shadow-lg
                         group-hover:scale-105 transition-transform duration-200"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 16px rgba(59,130,246,0.2)',
              }}
            >
              M
            </div>
            {/* 品牌字标 */}
            <span className="text-sm font-light tracking-[3px] text-white/85">
              AI<sup className="text-[7px] tracking-[1px] font-light">4</sup>MS
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-xs text-white/30 hover:text-white/55 transition-colors tracking-wide"
            >
              首页
            </Link>
            <UserNav />
          </div>
        </nav>
      )}

      {/* 主内容区 */}
      <main className="relative z-10 flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* 底部机构署名（仅首页） */}
      {location.pathname === '/' && (
        <footer className="relative z-10 text-center pb-8 mt-auto">
          <span className="text-[11px] text-white/[0.10] tracking-[1px] select-none">
            Xiamen Jiageng Innovation Laboratory
          </span>
        </footer>
      )}
    </div>
  )
}
