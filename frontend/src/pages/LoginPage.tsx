import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

/** 登录页面：毛玻璃卡片 + 渐变动画按钮。 */
export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute top-[-30%] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-[380px] rounded-2xl p-10 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 text-sm font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>M</div>
          <div className="text-xl font-light tracking-[4px] text-white/85">AI<sup className="text-[8px] tracking-[1px]">4</sup>MS</div>
          <div className="text-[11px] text-white/25 mt-1.5 tracking-[1px]">统一研发门户</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-blue-400/30 transition-colors" />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-blue-400/30 transition-colors" />
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-400/80">{error}</motion.div>
          )}
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full rounded-lg py-2.5 text-sm font-medium tracking-[1px] text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(139,92,246,0.8))' }}>
            {loading ? '登录中...' : '登 录'}
          </motion.button>
        </form>
        <div className="text-center mt-5">
          <Link to="/register" className="text-[11px] text-white/25 hover:text-blue-400/60 transition-colors">
            没有账号？使用邀请码注册 &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
