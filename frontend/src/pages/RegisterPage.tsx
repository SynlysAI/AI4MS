import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

/** 注册页面：邀请码 + 用户名密码 + 可选单位。 */
export default function RegisterPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ invite_code: inviteCode, username, password, organization })
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute top-[-30%] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%)' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-[380px] rounded-2xl p-10 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-7">
          <div className="text-lg font-light tracking-[3px] text-white/85">创建账号</div>
          <div className="text-[11px] text-white/30 mt-1.5">需要有效的邀请码</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">邀请码</label>
            <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
              placeholder="请输入邀请码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-purple-400/30 transition-colors" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-purple-400/30 transition-colors" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-purple-400/30 transition-colors" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">单位</label>
            <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)}
              placeholder="请输入所在单位（选填）"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-purple-400/30 transition-colors" />
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-400/80">{error}</motion.div>
          )}
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px] text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))' }}>
            {loading ? '注册中...' : '注 册'}
          </motion.button>
        </form>
        <div className="text-center mt-5">
          <Link to="/login" className="text-[11px] text-white/25 hover:text-purple-400/60 transition-colors">
            已有账号？返回登录 &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
