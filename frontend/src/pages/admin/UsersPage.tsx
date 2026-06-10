import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminApi, type UserInfo } from '@/api/client'
import { formatDate } from '@/lib/utils'

/** 用户管理页 — 表格列表 + 启用/禁用操作。 */
export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setError('')
      const res = await adminApi.listUsers()
      setUsers(res.data.items)
    } catch {
      setError('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleStatus = async (userId: string, current: string) => {
    const newStatus = current === 'active' ? 'disabled' : 'active'
    try {
      await adminApi.updateUserStatus(userId, newStatus)
      fetchUsers()
    } catch {
      setError('操作失败，请重试')
    }
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
              用户管理
            </h2>
            {/* Tab 切换 */}
            <div className="flex gap-6">
              <span className="text-[13px] text-blue-300/80 pb-2 border-b border-blue-400/25">
                用户列表
              </span>
              <Link
                to="/admin/invites"
                className="text-[13px] text-white/25 hover:text-white/45 pb-2
                           transition-colors duration-200"
              >
                邀请码管理
              </Link>
            </div>
          </div>
          <span className="text-[11px] text-white/[0.18]">
            {!loading && `共 ${users.length} 个用户`}
          </span>
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
                  用户名
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  角色
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  单位
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  状态
                </th>
                <th className="text-left font-normal px-6 py-3.5 tracking-wide">
                  创建时间
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
                      <div className="w-3.5 h-3.5 border-2 border-white/[0.06] border-t-blue-400/40 rounded-full animate-spin" />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-white/12 text-xs">
                    暂无用户
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-white/[0.02] text-white/55
                               hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-3.5 text-white/70 font-medium">
                      {u.username}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          u.role === 'admin'
                            ? 'bg-blue-400/[0.10] text-blue-300/75'
                            : 'bg-white/[0.04] text-white/35'
                        }`}
                      >
                        {u.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-white/25 text-xs">
                      {u.organization || '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${
                          u.status === 'active'
                            ? 'text-emerald-400/65'
                            : 'text-red-400/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-400/70'
                              : 'bg-red-400/60'
                          }`}
                        />
                        {u.status === 'active' ? '正常' : '已禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-white/20 text-xs">
                      {u.created_at ? formatDate(u.created_at) : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleStatus(u.user_id, u.status)}
                          className={`text-xs tracking-wide transition-colors duration-200 ${
                            u.status === 'active'
                              ? 'text-red-400/40 hover:text-red-400/70'
                              : 'text-emerald-400/40 hover:text-emerald-400/70'
                          }`}
                        >
                          {u.status === 'active' ? '禁用' : '启用'}
                        </button>
                      )}
                      {u.role === 'admin' && (
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
    </div>
  )
}
