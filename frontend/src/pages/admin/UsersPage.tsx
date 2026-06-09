import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi, type UserInfo } from '@/api/client'

/** 管理员用户管理页面：表格展示所有用户，支持启用/禁用操作。 */
export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await adminApi.listUsers()
      setUsers(res.data)
    } catch { /* handle */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleStatus = async (userId: string, current: string) => {
    const newStatus = current === 'active' ? 'disabled' : 'active'
    await adminApi.updateUserStatus(userId, newStatus)
    fetchUsers()
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-lg font-light tracking-[3px] text-white/75 mb-8">用户管理</h2>
        <div className="rounded-xl bg-white/[0.015] border border-white/[0.05] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-white/30 text-xs">
                <th className="text-left font-normal px-6 py-3">用户名</th>
                <th className="text-left font-normal px-6 py-3">角色</th>
                <th className="text-left font-normal px-6 py-3">单位</th>
                <th className="text-left font-normal px-6 py-3">状态</th>
                <th className="text-left font-normal px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/20">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-white/20">暂无用户</td></tr>
              ) : users.map((u) => (
                <tr key={u.user_id} className="border-b border-white/[0.02] text-white/60 hover:bg-white/[0.015] transition-colors">
                  <td className="px-6 py-3.5">{u.username}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-blue-400/10 text-blue-300/80' : 'bg-white/5 text-white/40'}`}>
                      {u.role === 'admin' ? '管理员' : '用户'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-white/30">{u.organization || '—'}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs ${u.status === 'active' ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                      {u.status === 'active' ? '● 正常' : '● 已禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleStatus(u.user_id, u.status)}
                        className={`text-xs hover:underline transition-colors ${u.status === 'active' ? 'text-red-400/50 hover:text-red-400/80' : 'text-emerald-400/50 hover:text-emerald-400/80'}`}>
                        {u.status === 'active' ? '禁用' : '启用'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
