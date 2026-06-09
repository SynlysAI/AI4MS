import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** 顶部用户头像 + 下拉菜单（管理员入口 / 退出登录）。 */
export default function UserNav() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const initial = user?.username?.charAt(0).toUpperCase() ?? '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <button
          onClick={() => navigate('/admin/users')}
          className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-wide"
        >
          管理
        </button>
      )}
      <div className="relative group">
        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                        text-xs text-white/60 font-medium cursor-pointer
                        border border-white/6 hover:border-white/15 transition-colors">
          {initial}
        </div>
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl
                        bg-white/5 backdrop-blur-xl border border-white/8
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 z-50 shadow-2xl">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs text-white/70">{user?.username}</div>
            <div className="text-[10px] text-white/30 mt-0.5">
              {user?.role === 'admin' ? '管理员' : '用户'}
            </div>
          </div>
          <div className="py-1">
            {isAdmin && (
              <>
                <button onClick={() => navigate('/admin/users')}
                  className="w-full text-left px-4 py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white/70 transition-colors">
                  用户管理
                </button>
                <button onClick={() => navigate('/admin/invites')}
                  className="w-full text-left px-4 py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white/70 transition-colors">
                  邀请码管理
                </button>
                <div className="border-t border-white/5 my-1" />
              </>
            )}
            <button onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-xs text-red-400/60 hover:bg-red-400/5 hover:text-red-400/80 transition-colors">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
