import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

/** 登录页 — 居中玻璃质感卡片，深空背景。 */
export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {/* 居中卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[380px] rounded-2xl p-10
                   bg-white/[0.02] border border-white/[0.06]
                   backdrop-blur-xl shadow-2xl shadow-black/40"
      >
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3
                       text-sm font-bold text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 20px rgba(59,130,246,0.25)',
            }}
          >
            M
          </div>
          <div className="text-xl font-light tracking-[4px] text-white/85">
            AI<sup className="text-[8px] tracking-[1px] font-light">4</sup>MS
          </div>
          <div className="text-[11px] text-white/25 mt-1.5 tracking-[1px]">
            统一研发门户
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名 */}
          <div>
            <label className="text-[11px] text-white/35 mb-1.5 block tracking-wide">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/[0.12]
                         focus:outline-none focus:border-blue-400/30 focus:bg-white/[0.04]
                         transition-all duration-200"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="text-[11px] text-white/35 mb-1.5 block tracking-wide">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/[0.12]
                         focus:outline-none focus:border-blue-400/30 focus:bg-white/[0.04]
                         transition-all duration-200"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-400/80 bg-red-400/[0.06] rounded-lg px-3 py-2
                         border border-red-400/[0.10]"
            >
              {error}
            </motion.div>
          )}

          {/* 登录按钮 */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px]
                       text-white transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.85), rgba(139,92,246,0.85))',
            }}
          >
            <span className="relative z-10">
              {loading ? '登录中...' : '登 录'}
            </span>
          </motion.button>
        </form>

        {/* 底部切换链接 */}
        <div className="text-center mt-6">
          <Link
            to="/register"
            className="text-[11px] text-white/20 hover:text-blue-400/60 transition-colors duration-200"
          >
            没有账号？使用邀请码注册 →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
