import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

/** 登录页 — 居中玻璃质感卡片。 */
export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
          <img
            src="/JG-logo.png"
            alt="AI4MS"
            className="inline-block w-10 h-10 rounded-lg mb-3 object-contain"
          />
          <div className="text-xl font-light tracking-[4px] transition-colors duration-300"
               style={{ color: 'var(--text-primary)' }}>
            AI<sup className="text-[8px] tracking-[1px] font-light">4</sup>MS
          </div>
          <div className="mt-2 text-[10px] leading-relaxed tracking-wide transition-colors duration-300"
               style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            嘉庚创新实验室材料研发统一入口<br />
            集成智能谱学分析、高分子研发、实验自动化监控
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full rounded-lg pl-3.5 pr-9 py-2.5 text-sm
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1
                           rounded transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
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
