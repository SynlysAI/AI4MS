import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/api/client'

interface InviteCode {
  invite_id: string
  invite_code: string
  role: string
  status: string
  max_uses: number
  used_count: number
  expires_at: string
}

/** 管理员邀请码管理页面：列表展示 + 创建弹窗。 */
export default function InvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [maxUses, setMaxUses] = useState(10)
  const [expiresHours, setExpiresHours] = useState(72)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchCodes = async () => {
    try {
      const res = await adminApi.listInviteCodes()
      setCodes(res.data)
    } catch { /* handle */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCodes() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res: any = await adminApi.createInviteCode({ role, max_uses: maxUses, expires_hours: expiresHours })
      setNewCode(res.data.invite_code)
      fetchCodes()
    } catch { /* handle */ }
    finally { setCreating(false) }
  }

  const handleDisable = async (inviteId: string) => {
    await adminApi.disableInviteCode(inviteId)
    fetchCodes()
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('zh-CN')

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-light tracking-[3px] text-white/75">邀请码管理</h2>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setShowCreate(true); setNewCode(null) }}
            className="px-4 py-2 text-xs rounded-lg tracking-wide bg-purple-400/10 border border-purple-400/20 text-purple-300/70 hover:text-purple-300/90 hover:border-purple-400/30 transition-colors">
            + 生成邀请码
          </motion.button>
        </div>
        <div className="rounded-xl bg-white/[0.015] border border-white/[0.05] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs">
                <th className="text-left font-normal px-6 py-3">邀请码</th>
                <th className="text-left font-normal px-6 py-3">角色</th>
                <th className="text-left font-normal px-6 py-3">已用/上限</th>
                <th className="text-left font-normal px-6 py-3">过期时间</th>
                <th className="text-left font-normal px-6 py-3">状态</th>
                <th className="text-left font-normal px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/20">加载中...</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/20">暂无邀请码</td></tr>
              ) : codes.map((c) => (
                <tr key={c.invite_id} className="border-b border-white/[0.02] text-white/60 hover:bg-white/[0.015] transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-purple-300/70">{c.invite_code}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.role === 'admin' ? 'bg-blue-400/10 text-blue-300/80' : 'bg-white/5 text-white/40'}`}>
                      {c.role === 'admin' ? '管理员' : '用户'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-white/40">{c.used_count} / {c.max_uses}</td>
                  <td className="px-6 py-3.5 text-white/30">{formatDate(c.expires_at)}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs ${c.status === 'active' ? 'text-emerald-400/60' : 'text-white/20'}`}>
                      {c.status === 'active' ? '有效' : c.status === 'disabled' ? '已禁用' : '已用完'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {c.status === 'active' && (
                      <button onClick={() => handleDisable(c.invite_id)}
                        className="text-xs text-red-400/50 hover:text-red-400/80 hover:underline transition-colors">禁用</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
                className="w-[400px] rounded-2xl p-8 bg-[#111] border border-white/[0.08] shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <h3 className="text-base font-light tracking-[2px] text-white/75 mb-6">生成邀请码</h3>
                {newCode ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-lg p-4">
                      <div className="text-[10px] text-white/30 mb-1 tracking-wide">新邀请码</div>
                      <div className="text-sm font-mono text-emerald-300/80 break-all">{newCode}</div>
                    </div>
                    <button onClick={() => setShowCreate(false)}
                      className="w-full rounded-lg py-2.5 text-xs text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-colors">关闭</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block tracking-wide">角色</label>
                      <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/60">
                        <option value="user">用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block tracking-wide">最大使用次数</label>
                      <input type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/60" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 mb-1 block tracking-wide">有效期（小时）</label>
                      <input type="number" value={expiresHours} onChange={(e) => setExpiresHours(Number(e.target.value))}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/60" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowCreate(false)}
                        className="flex-1 rounded-lg py-2.5 text-xs text-white/30 border border-white/[0.06] hover:bg-white/[0.02] transition-colors">取消</button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleCreate} disabled={creating}
                        className="flex-1 rounded-lg py-2.5 text-xs text-white tracking-wide bg-purple-400/20 border border-purple-400/25 hover:bg-purple-400/25 transition-colors disabled:opacity-50">
                        {creating ? '生成中...' : '生成'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
