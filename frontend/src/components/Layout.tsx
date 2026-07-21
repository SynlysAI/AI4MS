import { useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import StarFieldBg from '@/components/StarFieldBg'
import UserNav from '@/components/UserNav'

/** 全局布局：深空背景 + 光晕装饰 + 顶栏导航 + 页面内容。 */
export default function Layout() {
  const initialize = useAuthStore((s) => s.initialize)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const location = useLocation()

  useEffect(() => {
    initialize()
  }, [initialize])

  /* 加载状态 */
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-root)]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'var(--spinner-track)',
              borderTopColor: 'var(--spinner-accent)',
            }}
          />
          <span className="text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>
            加载中
          </span>
        </div>
      </div>
    )
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* 主背景渐变 */}
      <div
        className="fixed inset-0 z-0 transition-colors duration-300"
        style={{ background: 'var(--bg-root-gradient)' }}
      />

      {/* 光晕装饰 */}
      <div
        className="fixed pointer-events-none z-0 rounded-full transition-opacity duration-300"
        style={{
          top: '-20%', left: '20%', width: '700px', height: '700px',
          background: `radial-gradient(circle, var(--glow-blue), transparent 70%)`,
          opacity: theme === 'dark' ? 1 : 0.6,
        }}
      />
      <div
        className="fixed pointer-events-none z-0 rounded-full transition-opacity duration-300"
        style={{
          bottom: '-15%', right: '10%', width: '550px', height: '550px',
          background: `radial-gradient(circle, var(--glow-purple), transparent 70%)`,
          opacity: theme === 'dark' ? 1 : 0.6,
        }}
      />
      <div
        className="fixed pointer-events-none z-0 rounded-full transition-opacity duration-300"
        style={{
          top: '40%', left: '50%', width: '450px', height: '450px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, var(--glow-green), transparent 70%)`,
        }}
      />

      {/* 星场粒子 */}
      <StarFieldBg />

      {/* 顶栏导航（非登录/注册页显示） */}
      {!isAuthPage && (
        <nav
          className="relative z-20 flex items-center justify-between px-8 py-4
                     backdrop-blur-sm transition-colors duration-300"
          style={{ borderBottom: `1px solid var(--border-subtle)` }}
        >
          <Link to="/" className="flex items-center gap-3 group">
            {/* Logo 图标 */}
            <img
              src="/JG-logo.png"
              alt="AI4MS"
              className="w-7 h-7 rounded-md object-contain
                         group-hover:scale-105 transition-transform duration-200"
            />
            {/* 品牌字标 */}
            <span className="text-sm font-light tracking-[3px] transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}>
              AI<sup className="text-[7px] tracking-[1px] font-light">4</sup>MS
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-xs tracking-wide transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              首页
            </Link>

            {/* 主题切换按钮 */}
            <button
              onClick={toggleTheme}
              className="w-7 h-7 rounded-full flex items-center justify-center
                         transition-all duration-200 hover:scale-110"
              style={{
                background: 'var(--bg-input)',
                border: `1px solid var(--border-input)`,
              }}
              title={theme === 'dark' ? '切换亮色模式' : '切换暗色模式'}
            >
              {theme === 'dark' ? (
                /* 太阳图标 */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                /* 月亮图标 */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <UserNav />
            ) : (
              <Link
                to="/login"
                className="text-xs tracking-wide transition-colors duration-200
                           px-3 py-1.5 rounded-lg"
                style={{
                  color: 'var(--text-secondary)',
                  border: `1px solid var(--border-input)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.borderColor = 'var(--border-strong)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'var(--border-input)'
                }}
              >
                登录
              </Link>
            )}
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
          <span className="text-[11px] tracking-[1px] select-none transition-colors duration-300"
                style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
            Tan Kah Kee Innovation Laboratory
          </span>
        </footer>
      )}
    </div>
  )
}
