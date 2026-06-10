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
      const detail = err?.response?.data?.data?.detail
      setError(typeof detail === 'string' ? detail : '注册失败，请重试')
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
        {/* 标题 */}
        <div className="text-center mb-7">
          <div className="text-lg font-light tracking-[3px] text-white/85">
            创建账号
          </div>
          <div className="text-[11px] text-white/25 mt-1.5 tracking-[1px]">
            需要有效的邀请码
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 邀请码 */}
          <div>
            <label className="text-[11px] text-white/35 mb-1.5 block tracking-wide">
              邀请码 <span className="text-red-400/50">*</span>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="请输入邀请码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/[0.12]
                         focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.04]
                         transition-all duration-200"
            />
          </div>

          {/* 用户名 */}
          <div>
            <label className="text-[11px] text-white/35 mb-1.5 block tracking-wide">
              用户名 <span className="text-red-400/50">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/[0.12]
                         focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.04]
                         transition-all duration-200"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="text-[11px] text-white/35 mb-1.5 block tracking-wide">
              密码 <span className="text-red-400/50">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="new-password"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/[0.12]
                         focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.04]
                         transition-all duration-200"
            />
          </div>

          {/* 单位（选填） */}
          <div>
            <label className="text-[11px] text-white/35 mb-1.5 block tracking-wide">
              单位 <span className="text-white/15">(选填)</span>
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="请输入所在单位"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                         px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/[0.12]
                         focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.04]
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

          {/* 注册按钮 — 紫色调 */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px]
                       text-white transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       relative overflow-hidden mt-1"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.85), rgba(59,130,246,0.85))',
            }}
          >
            <span className="relative z-10">
              {loading ? '注册中...' : '注 册'}
            </span>
          </motion.button>
        </form>

        {/* 底部切换链接 */}
        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-[11px] text-white/20 hover:text-purple-400/60 transition-colors duration-200"
          >
            已有账号？返回登录 →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
