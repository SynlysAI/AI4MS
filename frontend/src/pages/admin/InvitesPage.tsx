import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, type InviteCode } from '@/api/client'
import { formatDate, inviteStatusLabel } from '@/lib/utils'
import Select from '@/components/Select'

export default function InvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showDialog, setShowDialog] = useState(false)
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [maxUses, setMaxUses] = useState(10)
  const [expiresHours, setExpiresHours] = useState(72)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchCodes = async () => {
    try { setError(''); const res = await adminApi.listInviteCodes(); setCodes(res.data) }
    catch { setError('加载邀请码列表失败') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCodes() }, [])

  const handleCreate = async () => {
    setCreateError(''); setCreating(true)
    try {
      const res = await adminApi.createInviteCode({ role, max_uses: maxUses, expires_hours: expiresHours })
      setNewCode(res.data.invite_code)
      fetchCodes()
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setCreateError(typeof detail === 'string' ? detail : '创建失败')
    } finally { setCreating(false) }
  }

  const handleDisable = async (inviteId: string) => {
    try { await adminApi.disableInviteCode(inviteId); fetchCodes() }
    catch { setError('操作失败，请重试') }
  }

  const handleEnable = async (inviteId: string) => {
    try { await adminApi.enableInviteCode(inviteId); fetchCodes() }
    catch { setError('操作失败，请重试') }
  }

  const handleDelete = async (inviteId: string) => {
    if (!window.confirm('确定要删除该邀请码吗？此操作不可撤销。')) return
    try { await adminApi.deleteInviteCode(inviteId); fetchCodes() }
    catch { setError('操作失败，请重试') }
  }

  const openDialog = () => { setNewCode(null); setCreateError(''); setRole('user'); setMaxUses(10); setExpiresHours(72); setShowDialog(true) }

  /* 通用输入框样式 */
  const inputClass = `w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all duration-200`
  const inputStyle = (focusBorder: string) => ({
    background: 'var(--bg-input)', border: `1px solid var(--border-input)`, color: 'var(--text-primary)',
  } as React.CSSProperties)

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-8">
            <h2 className="text-lg font-light tracking-[3px] transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}>邀请码管理</h2>
            <div className="flex gap-6">
              <Link to="/admin/users" className="text-[13px] pb-2 transition-colors duration-200"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                用户列表
              </Link>
              <span className="text-[13px] pb-2 border-b"
                    style={{ color: 'var(--accent-purple-text)', borderColor: 'rgba(139,92,246,0.25)' }}>
                邀请码管理
              </span>
              <Link to="/admin/feedback" className="text-[13px] pb-2 transition-colors duration-200"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                反馈管理
              </Link>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openDialog}
            className="px-4 py-2 text-xs rounded-lg tracking-wide transition-all duration-200"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', color: 'var(--accent-purple-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.14)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.30)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)' }}>
            + 生成邀请码
          </motion.button>
        </div>

        {error && (
          <div className="mb-4 text-xs rounded-lg px-4 py-2.5"
               style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: `1px solid var(--danger-border)` }}>
            {error}
          </div>
        )}

        <div className="rounded-xl overflow-hidden transition-colors duration-300"
             style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border-subtle)`, color: 'var(--text-muted)' }} className="text-xs">
                <Th>邀请码</Th><Th>角色</Th><Th>已用 / 上限</Th><Th>过期时间</Th><Th>状态</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                         style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-accent)' }} />加载中...
                  </div>
                </td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                  暂无邀请码，点击上方按钮创建
                </td></tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.invite_id} className="transition-colors duration-150"
                      style={{ borderBottom: `1px solid var(--border-subtle)`, color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-6 py-3.5">
                      <code className="text-xs bg-transparent font-mono" style={{ color: 'var(--accent-purple-text)' }}>
                        {c.invite_code}
                      </code>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
                            style={{ background: c.role === 'admin' ? 'var(--bg-badge-admin)' : 'var(--bg-badge)',
                                     color: c.role === 'admin' ? 'var(--accent-blue-text)' : 'var(--text-muted)' }}>
                        {c.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span style={c.used_count >= c.max_uses ? { color: 'var(--danger)' } : {}}>{c.used_count}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / </span>{c.max_uses}
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(c.expires_at)}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs" style={{ color: c.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>
                        {inviteStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {c.status === 'active' && (
                          <button onClick={() => handleDisable(c.invite_id)}
                            className="text-xs tracking-wide transition-colors duration-200"
                            style={{ color: 'var(--danger)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--danger)'}>禁用</button>
                        )}
                        {c.status === 'disabled' && (
                          <button onClick={() => handleEnable(c.invite_id)}
                            className="text-xs tracking-wide transition-colors duration-200"
                            style={{ color: 'var(--success)' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>启用</button>
                        )}
                        {c.status !== 'active' && (
                          <button onClick={() => handleDelete(c.invite_id)}
                            className="text-xs tracking-wide transition-colors duration-200"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>删除</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 创建邀请码弹窗 */}
      <AnimatePresence>
        {showDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowDialog(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[400px] rounded-2xl p-8 shadow-2xl transition-colors duration-300"
              style={{ background: 'var(--bg-surface-elevated)', border: `1px solid var(--border-default)` }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-light tracking-[2px] mb-6 transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}>生成邀请码</h3>

              {newCode ? (
                <div className="space-y-4">
                  <div className="rounded-xl p-4"
                       style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <div className="text-[10px] mb-1.5 tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      新邀请码（请复制保存）
                    </div>
                    <code className="text-sm break-all font-mono" style={{ color: 'var(--accent-green-text)' }}>{newCode}</code>
                  </div>
                  <button onClick={() => setShowDialog(false)}
                    className="w-full rounded-lg py-2.5 text-xs transition-colors duration-200"
                    style={{ color: 'var(--text-secondary)', border: `1px solid var(--border-default)` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>关闭</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 角色 */}
                  <div>
                    <label className="text-[10px] mb-1.5 block tracking-wide" style={{ color: 'var(--text-muted)' }}>角色</label>
                    <Select fullWidth value={role}
                      onChange={(v) => setRole(v as 'admin' | 'user')}
                      options={[{ value: 'user', label: '用户' }, { value: 'admin', label: '管理员' }]} />
                  </div>
                  {/* 最大使用次数 */}
                  <div>
                    <label className="text-[10px] mb-1.5 block tracking-wide" style={{ color: 'var(--text-muted)' }}>最大使用次数</label>
                    <input type="number" min={1} max={999} value={maxUses}
                      onChange={(e) => setMaxUses(Math.max(1, Number(e.target.value)))}
                      className={inputClass} style={inputStyle('var(--border-focus)')} />
                  </div>
                  {/* 有效期 */}
                  <div>
                    <label className="text-[10px] mb-1.5 block tracking-wide" style={{ color: 'var(--text-muted)' }}>有效期（小时）</label>
                    <input type="number" min={1} max={720} value={expiresHours}
                      onChange={(e) => setExpiresHours(Math.max(1, Number(e.target.value)))}
                      className={inputClass} style={inputStyle('var(--border-focus)')} />
                  </div>
                  {createError && (
                    <div className="text-xs rounded-lg px-3 py-2"
                         style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: `1px solid var(--danger-border)` }}>
                      {createError}
                    </div>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowDialog(false)}
                      className="flex-1 rounded-lg py-2.5 text-xs transition-colors duration-200"
                      style={{ color: 'var(--text-muted)', border: `1px solid var(--border-default)` }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>取消</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleCreate} disabled={creating}
                      className="flex-1 rounded-lg py-2.5 text-xs text-white tracking-wide transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'rgba(139,92,246,0.20)', border: '1px solid rgba(139,92,246,0.25)' }}
                      onMouseEnter={(e) => { if (!creating) e.currentTarget.style.background = 'rgba(139,92,246,0.28)' }}
                      onMouseLeave={(e) => { if (!creating) e.currentTarget.style.background = 'rgba(139,92,246,0.20)' }}>
                      {creating ? '生成中...' : '生成'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-normal px-6 py-3.5 tracking-wide">{children}</th>
}
