import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** 右上角用户头像与下拉菜单。 */
export default function UserNav() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'

  /* 点击外部关闭菜单 */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div ref={menuRef} className="relative">
      {/* 头像按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center
                   text-xs font-medium cursor-pointer transition-all duration-200"
        style={{
          background: 'var(--bg-input)',
          border: `1px solid var(--border-input)`,
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)'
          e.currentTarget.style.borderColor = 'var(--border-strong)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-input)'
          e.currentTarget.style.borderColor = 'var(--border-input)'
        }}
      >
        {initial}
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden
                     shadow-2xl shadow-black/20 z-50 animate-in fade-in zoom-in-95
                     origin-top-right duration-150"
          style={{
            background: 'var(--bg-dropdown)',
            border: `1px solid var(--border-default)`,
          }}
        >
          {/* 用户信息 */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: `1px solid var(--border-subtle)` }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {user?.username}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {user?.role === 'admin' ? '管理员' : '用户'}
              {user?.organization ? ` · ${user.organization}` : ''}
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            {isAdmin && (
              <>
                <button
                  onClick={() => { navigate('/admin/users'); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors duration-150"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  用户管理
                </button>
                <button
                  onClick={() => { navigate('/admin/invites'); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors duration-150"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  邀请码管理
                </button>
                <div className="mx-3 my-1" style={{ borderTop: `1px solid var(--border-subtle)` }} />
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs transition-colors duration-150"
              style={{ color: 'var(--danger)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--danger-bg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
