import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, type InviteCode } from '@/api/client'
import { formatDate, inviteStatusLabel } from '@/lib/utils'

/** 邀请码管理页 — 表格列表 + 创建弹窗。 */
export default function InvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /* 创建弹窗状态 */
  const [showDialog, setShowDialog] = useState(false)
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [maxUses, setMaxUses] = useState(10)
  const [expiresHours, setExpiresHours] = useState(72)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchCodes = async () => {
    try {
      setError('')
      const res = await adminApi.listInviteCodes()
      setCodes(res.data.items)
    } catch {
      setError('加载邀请码列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  const handleCreate = async () => {
    setCreateError('')
    setCreating(true)
    try {
      const res = await adminApi.createInviteCode({
        role,
        max_uses: maxUses,
        expires_hours: expiresHours,
      })
      setNewCode(res.data.invite_code)
      fetchCodes()
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setCreateError(typeof detail === 'string' ? detail : '创建失败')
    } finally {
      setCreating(false)
    }
  }

  const handleDisable = async (inviteId: string) => {
    try {
      await adminApi.disableInviteCode(inviteId)
      fetchCodes()
    } catch {
      setError('操作失败，请重试')
    }
  }

  const openDialog = () => {
    setNewCode(null)
    setCreateError('')
    setRole('user')
    setMaxUses(10)
    setExpiresHours(72)
    setShowDialog(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 页头 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-8">
            <h2 className="text-lg font-light tracking-[3px] text-white/75">
              邀请码管理
            </h2>
            {/* Tab 切换 */}
            <div className="flex gap-6">
              <Link
                to="/admin/users"
                className="text-[13px] text-white/25 hover:text-white/45 pb-2
                           transition-colors duration-200"
              >
                用户列表
              </Link>
              <span className="text-[13px] text-purple-300/75 pb-2 border-b border-purple-400/25">
                邀请码管理
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openDialog}
            className="px-4 py-2 text-xs rounded-lg tracking-wide
                       bg-purple-400/[0.08] border border-purple-400/[0.18]
                       text-purple-300/65 hover:text-purple-300/85
                       hover:border-purple-400/28 hover:bg-purple-400/[0.12]
                       transition-all duration-200"
          >
            + 生成邀请码
          </motion.button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 text-xs text-red-400/70 bg-red-400/[0.05] rounded-lg
                          px-4 py-2.5 border border-red-400/[0.08]">
            {error}
          </div>
        )}

        {/* 表格 */}
        <div className="rounded-xl bg-white/[0.012] border border-white/[0.05] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/25 text-xs">
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  邀请码
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  角色
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  已用 / 上限
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  过期时间
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  状态
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-white/15 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/[0.06] border-t-purple-400/40 rounded-full animate-spin" />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-white/12 text-xs">
                    暂无邀请码，点击上方按钮创建
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr
                    key={c.invite_id}
                    className="border-b border-white/[0.02] text-white/55
                               hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <code className="text-xs text-purple-300/60 bg-transparent font-mono">
                        {c.invite_code}
                      </code>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          c.role === 'admin'
                            ? 'bg-blue-400/[0.10] text-blue-300/75'
                            : 'bg-white/[0.04] text-white/35'
                        }`}
                      >
                        {c.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-white/35 text-xs">
                      <span
                        className={
                          c.used_count >= c.max_uses ? 'text-red-400/55' : ''
                        }
                      >
                        {c.used_count}
                      </span>
                      <span className="text-white/15"> / </span>
                      {c.max_uses}
                    </td>
                    <td className="px-6 py-3.5 text-white/20 text-xs">
                      {formatDate(c.expires_at)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-xs ${
                          c.status === 'active'
                            ? 'text-emerald-400/55'
                            : 'text-white/15'
                        }`}
                      >
                        {inviteStatusLabel(c.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {c.status === 'active' ? (
                        <button
                          onClick={() => handleDisable(c.invite_id)}
                          className="text-xs text-red-400/40 hover:text-red-400/70
                                     transition-colors duration-200 tracking-wide"
                        >
                          禁用
                        </button>
                      ) : (
                        <span className="text-white/[0.10] text-xs">—</span>
                      )}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center
                       bg-black/55 backdrop-blur-sm px-4"
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[400px] rounded-2xl p-8
                         bg-[#131313] border border-white/[0.08] shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-light tracking-[2px] text-white/75 mb-6">
                生成邀请码
              </h3>

              {newCode ? (
                /* 生成结果 */
                <div className="space-y-4">
                  <div className="bg-emerald-400/[0.04] border border-emerald-400/[0.12]
                                  rounded-xl p-4">
                    <div className="text-[10px] text-white/25 mb-1.5 tracking-wide">
                      新邀请码（请复制保存）
                    </div>
                    <code className="text-sm text-emerald-300/70 break-all font-mono">
                      {newCode}
                    </code>
                  </div>
                  <button
                    onClick={() => setShowDialog(false)}
                    className="w-full rounded-lg py-2.5 text-xs text-white/35
                               border border-white/[0.06] hover:bg-white/[0.02]
                               transition-colors duration-200"
                  >
                    关闭
                  </button>
                </div>
              ) : (
                /* 创建表单 */
                <div className="space-y-4">
                  {/* 角色选择 */}
                  <div>
                    <label className="text-[10px] text-white/30 mb-1.5 block tracking-wide">
                      角色
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                                 px-3.5 py-2.5 text-sm text-white/60
                                 focus:outline-none focus:border-purple-400/25
                                 transition-colors duration-200 appearance-none
                                 cursor-pointer"
                    >
                      <option value="user">用户</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>

                  {/* 最大使用次数 */}
                  <div>
                    <label className="text-[10px] text-white/30 mb-1.5 block tracking-wide">
                      最大使用次数
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={maxUses}
                      onChange={(e) =>
                        setMaxUses(Math.max(1, Number(e.target.value)))
                      }
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                                 px-3.5 py-2.5 text-sm text-white/60
                                 focus:outline-none focus:border-purple-400/25
                                 transition-colors duration-200"
                    />
                  </div>

                  {/* 有效期 */}
                  <div>
                    <label className="text-[10px] text-white/30 mb-1.5 block tracking-wide">
                      有效期（小时）
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={expiresHours}
                      onChange={(e) =>
                        setExpiresHours(Math.max(1, Number(e.target.value)))
                      }
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg
                                 px-3.5 py-2.5 text-sm text-white/60
                                 focus:outline-none focus:border-purple-400/25
                                 transition-colors duration-200"
                    />
                  </div>

                  {/* 错误 */}
                  {createError && (
                    <div className="text-xs text-red-400/70 bg-red-400/[0.05]
                                    rounded-lg px-3 py-2 border border-red-400/[0.08]">
                      {createError}
                    </div>
                  )}

                  {/* 按钮 */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setShowDialog(false)}
                      className="flex-1 rounded-lg py-2.5 text-xs text-white/25
                                 border border-white/[0.06] hover:bg-white/[0.02]
                                 transition-colors duration-200"
                    >
                      取消
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreate}
                      disabled={creating}
                      className="flex-1 rounded-lg py-2.5 text-xs text-white tracking-wide
                                 bg-purple-400/[0.18] border border-purple-400/[0.22]
                                 hover:bg-purple-400/[0.24]
                                 transition-all duration-200 disabled:opacity-50
                                 disabled:cursor-not-allowed"
                    >
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
