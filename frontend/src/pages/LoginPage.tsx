import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

/** 登录页 — 居中玻璃质感卡片。 */
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
      const detail = err?.response?.data?.data?.detail
      setError(typeof detail === 'string' ? detail : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[380px] rounded-2xl p-10
                   backdrop-blur-xl shadow-2xl shadow-black/10
                   transition-colors duration-300"
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid var(--border-default)`,
        }}
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
          <div className="text-xl font-light tracking-[4px] transition-colors duration-300"
               style={{ color: 'var(--text-primary)' }}>
            AI<sup className="text-[8px] tracking-[1px] font-light">4</sup>MS
          </div>
          <div className="text-[11px] mt-1.5 tracking-[1px] transition-colors duration-300"
               style={{ color: 'var(--text-muted)' }}>
            统一研发门户
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] mb-1.5 block tracking-wide transition-colors duration-300"
                   style={{ color: 'var(--text-secondary)' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm
                         focus:outline-none transition-all duration-200"
              style={{
                background: 'var(--bg-input)',
                border: `1px solid var(--border-input)`,
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)'
                e.currentTarget.style.background = 'var(--bg-hover)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-input)'
                e.currentTarget.style.background = 'var(--bg-input)'
              }}
            />
          </div>

          <div>
            <label className="text-[11px] mb-1.5 block tracking-wide transition-colors duration-300"
                   style={{ color: 'var(--text-secondary)' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm
                         focus:outline-none transition-all duration-200"
              style={{
                background: 'var(--bg-input)',
                border: `1px solid var(--border-input)`,
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)'
                e.currentTarget.style.background = 'var(--bg-hover)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-input)'
                e.currentTarget.style.background = 'var(--bg-input)'
              }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs rounded-lg px-3 py-2"
              style={{
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                border: `1px solid var(--danger-border)`,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px]
                       text-white transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--btn-gradient-login)' }}
          >
            {loading ? '登录中...' : '登 录'}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/register"
            className="text-[11px] transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            没有账号？使用邀请码注册 →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
