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
                   text-xs text-white/60 font-medium cursor-pointer
                   bg-white/[0.06] border border-white/[0.08]
                   hover:bg-white/[0.10] hover:border-white/[0.14]
                   transition-all duration-200"
      >
        {initial}
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden
                     bg-[#151515]/95 backdrop-blur-xl border border-white/[0.08]
                     shadow-2xl shadow-black/50 z-50 animate-in fade-in zoom-in-95
                     origin-top-right duration-150"
        >
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="text-xs text-white/75 font-medium">{user?.username}</div>
            <div className="text-[10px] text-white/30 mt-0.5">
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
                  className="w-full text-left px-4 py-2.5 text-xs text-white/50
                             hover:bg-white/[0.04] hover:text-white/75 transition-colors"
                >
                  用户管理
                </button>
                <button
                  onClick={() => { navigate('/admin/invites'); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-xs text-white/50
                             hover:bg-white/[0.04] hover:text-white/75 transition-colors"
                >
                  邀请码管理
                </button>
                <div className="mx-3 my-1 border-t border-white/[0.05]" />
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs text-red-400/60
                         hover:bg-red-400/[0.06] hover:text-red-400/80 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
