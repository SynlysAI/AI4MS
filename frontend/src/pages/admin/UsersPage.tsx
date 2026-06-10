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

  useEffect(() => { fetchUsers() }, [])

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
            <h2 className="text-lg font-light tracking-[3px] transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}>
              用户管理
            </h2>
            <div className="flex gap-6">
              <span className="text-[13px] pb-2 border-b"
                    style={{ color: 'var(--accent-blue-text)', borderColor: 'rgba(59,130,246,0.25)' }}>
                用户列表
              </span>
              <Link
                to="/admin/invites"
                className="text-[13px] pb-2 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                邀请码管理
              </Link>
            </div>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
            {!loading && `共 ${users.length} 个用户`}
          </span>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 text-xs rounded-lg px-4 py-2.5"
               style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: `1px solid var(--danger-border)` }}>
            {error}
          </div>
        )}

        {/* 表格 */}
        <div className="rounded-xl overflow-hidden transition-colors duration-300"
             style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border-subtle)`, color: 'var(--text-muted)' }}
                  className="text-xs">
                <Th>用户名</Th><Th>角色</Th><Th>单位</Th><Th>状态</Th><Th>创建时间</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                           style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-accent)' }} />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                    暂无用户
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id}
                      className="transition-colors duration-150"
                      style={{ borderBottom: `1px solid var(--border-subtle)`, color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.username}</Td>
                    <Td>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
                            style={{ background: u.role === 'admin' ? 'var(--bg-badge-admin)' : 'var(--bg-badge)',
                                     color: u.role === 'admin' ? 'var(--accent-blue-text)' : 'var(--text-muted)' }}>
                        {u.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </Td>
                    <Td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {u.organization || '—'}
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs"
                            style={{ color: u.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                              style={{ background: u.status === 'active' ? 'var(--success)' : 'var(--danger)' }} />
                        {u.status === 'active' ? '正常' : '已禁用'}
                      </span>
                    </Td>
                    <Td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {u.created_at ? formatDate(u.created_at) : '—'}
                    </Td>
                    <Td>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => toggleStatus(u.user_id, u.status)}
                          className="text-xs tracking-wide transition-colors duration-200"
                          style={{ color: u.status === 'active' ? 'var(--danger)' : 'var(--success)' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          {u.status === 'active' ? '禁用' : '启用'}
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>
                      )}
                    </Td>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-normal px-6 py-3.5 tracking-wide">{children}</th>
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td className="px-6 py-3.5" style={style}>{children}</td>
}
