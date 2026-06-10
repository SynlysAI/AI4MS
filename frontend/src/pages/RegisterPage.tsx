import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

/** 注册页 — 邀请码注册，紫色调居中卡片。 */
export default function RegisterPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim() || !username.trim() || !password.trim()) {
      setError('请填写所有必填字段')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({
        invite_code: inviteCode,
        username,
        password,
        organization,
      })
      navigate('/')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : '注册失败，请重试')
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
        <div className="text-center mb-7">
          <div className="text-lg font-light tracking-[3px] transition-colors duration-300"
               style={{ color: 'var(--text-primary)' }}>
            创建账号
          </div>
          <div className="text-[11px] mt-1.5 tracking-[1px] transition-colors duration-300"
               style={{ color: 'var(--text-muted)' }}>
            需要有效的邀请码
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 邀请码 */}
          <Field label="邀请码" required>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="请输入邀请码"
            />
          </Field>

          {/* 用户名 */}
          <Field label="用户名" required>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Field>

          {/* 密码 */}
          <Field label="密码" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="new-password"
            />
          </Field>

          {/* 单位 */}
          <Field label="单位" optional>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="请输入所在单位"
            />
          </Field>

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
                       disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            style={{ background: 'var(--btn-gradient-register)' }}
          >
            {loading ? '注册中...' : '注 册'}
          </motion.button>
        </form>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-[11px] transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-purple-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            已有账号？返回登录 →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

/* ── 内联小组件 ── */

function Field({ label, required, optional, children }: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-[11px] mb-1.5 block tracking-wide transition-colors duration-300"
             style={{ color: 'var(--text-secondary)' }}>
        {label}
        {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        {optional && <span style={{ color: 'var(--text-muted)' }}> (选填)</span>}
      </label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
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
  )
}
