import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { feedbackApi, type FeedbackInfo, type FeedbackPlatform, type FeedbackType } from '@/api/client'
import { formatDateTime } from '@/lib/utils'
import Select from '@/components/Select'

const PLATFORM_META: Record<FeedbackPlatform, { emoji: string; name: string; color: string }> = {
  spec_agent: { emoji: '🔬', name: '智能谱学分析', color: 'var(--accent-blue-text)' },
  poly_agent: { emoji: '🧬', name: '高分子研发', color: 'var(--accent-green-text)' },
  speclabos: { emoji: '🖥️', name: '实验自动化监控', color: 'var(--accent-orange-text)' },
  ragportal: { emoji: '📚', name: '知识库文档', color: 'var(--accent-purple-text)' },
}

const TYPE_META: Record<FeedbackType, { label: string; color: string; bg: string }> = {
  bug: { label: '功能异常', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  ux: { label: '体验问题', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  idea: { label: '功能建议', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)' },
  other: { label: '其他', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}

type PlatformFilter = '' | FeedbackPlatform
type TypeFilter = '' | FeedbackType
type StatusFilter = '' | 'open' | 'done'

/** 反馈管理页 — 四个子平台提交的意见统一查看与处理。 */
export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  const [detail, setDetail] = useState<FeedbackInfo | null>(null)
  const [operating, setOperating] = useState(false)

  const fetchFeedbacks = async () => {
    try {
      setError('')
      const res = await feedbackApi.list()
      setFeedbacks(res.data)
    } catch {
      setError('加载反馈列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeedbacks() }, [])

  const filtered = useMemo(() => feedbacks.filter((f) =>
    (!platformFilter || f.platform === platformFilter) &&
    (!typeFilter || f.feedback_type === typeFilter) &&
    (!statusFilter || f.status === statusFilter),
  ), [feedbacks, platformFilter, typeFilter, statusFilter])

  const openCount = useMemo(() => feedbacks.filter((f) => f.status === 'open').length, [feedbacks])

  const toggleStatus = async (fb: FeedbackInfo) => {
    setOperating(true)
    try {
      await feedbackApi.updateStatus(fb.feedback_id, fb.status === 'open' ? 'done' : 'open')
      setFeedbacks((prev) => prev.map((x) =>
        x.feedback_id === fb.feedback_id
          ? { ...x, status: x.status === 'open' ? 'done' : 'open' }
          : x,
      ))
      setDetail((d) => d && d.feedback_id === fb.feedback_id
        ? { ...d, status: d.status === 'open' ? 'done' : 'open' }
        : d)
    } catch {
      setError('操作失败，请重试')
    } finally {
      setOperating(false)
    }
  }

  const handleDelete = async (fb: FeedbackInfo) => {
    if (!window.confirm('确定要删除该条反馈吗？此操作不可撤销。')) return
    try {
      await feedbackApi.remove(fb.feedback_id)
      setFeedbacks((prev) => prev.filter((x) => x.feedback_id !== fb.feedback_id))
      setDetail(null)
    } catch {
      setError('删除失败，请重试')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 w-full">
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
              反馈管理
            </h2>
            <div className="flex gap-6">
              <Link
                to="/admin/users"
                className="text-[13px] pb-2 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                用户列表
              </Link>
              <Link
                to="/admin/invites"
                className="text-[13px] pb-2 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                邀请码管理
              </Link>
              <span className="text-[13px] pb-2 border-b"
                    style={{ color: 'var(--accent-green-text)', borderColor: 'rgba(16,185,129,0.25)' }}>
                反馈管理
              </span>
            </div>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
            {!loading && `共 ${feedbacks.length} 条反馈 · ${openCount} 条待处理`}
          </span>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 text-xs rounded-lg px-4 py-2.5"
               style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: `1px solid var(--danger-border)` }}>
            {error}
          </div>
        )}

        {/* 筛选器 */}
        <div className="flex gap-3 mb-4">
          <Select
            value={platformFilter}
            onChange={(v) => setPlatformFilter(v as PlatformFilter)}
            options={[
              { value: '', label: '全部平台' },
              ...Object.entries(PLATFORM_META).map(([key, m]) => ({ value: key, label: `${m.emoji} ${m.name}` })),
            ]}
          />
          <Select
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as TypeFilter)}
            options={[
              { value: '', label: '全部类型' },
              ...Object.entries(TYPE_META).map(([key, m]) => ({ value: key, label: m.label })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            options={[
              { value: '', label: '全部状态' },
              { value: 'open', label: '待处理' },
              { value: 'done', label: '已处理' },
            ]}
          />
        </div>

        {/* 表格 */}
        <div className="rounded-xl overflow-hidden transition-colors duration-300"
             style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border-subtle)`, color: 'var(--text-muted)' }}
                  className="text-xs">
                <Th>提交平台</Th><Th>类型</Th><Th>反馈内容</Th><Th>提交人</Th><Th>提交时间</Th><Th>状态</Th><Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                           style={{ borderColor: 'var(--spinner-track)', borderTopColor: 'var(--spinner-accent)' }} />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {feedbacks.length === 0 ? '暂无反馈' : '暂无符合条件的反馈'}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.feedback_id}
                      className="cursor-pointer transition-colors duration-150"
                      style={{ borderBottom: `1px solid var(--border-subtle)`, color: 'var(--text-secondary)' }}
                      onClick={() => setDetail(f)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs"
                            style={{ color: PLATFORM_META[f.platform]?.color }}>
                        <span>{PLATFORM_META[f.platform]?.emoji}</span>
                        {PLATFORM_META[f.platform]?.name ?? f.platform}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              color: TYPE_META[f.feedback_type]?.color,
                              background: TYPE_META[f.feedback_type]?.bg,
                            }}>
                        {TYPE_META[f.feedback_type]?.label ?? f.feedback_type}
                      </span>
                    </Td>
                    <Td>
                      <div className="max-w-[280px] truncate" title={f.content}>{f.content}</div>
                    </Td>
                    <Td>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.username}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {f.organization || '—'}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {f.created_at ? formatDateTime(f.created_at) : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap"
                            style={{ color: f.status === 'open' ? 'var(--accent-orange-text)' : 'var(--success)' }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                              style={{ background: f.status === 'open' ? 'var(--accent-orange-text)' : 'var(--success)' }} />
                        {f.status === 'open' ? '待处理' : '已处理'}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleStatus(f)}
                          disabled={operating}
                          className="text-xs tracking-wide transition-opacity duration-200 disabled:opacity-50"
                          style={{ color: f.status === 'open' ? 'var(--success)' : 'var(--accent-orange-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          {f.status === 'open' ? '标记已处理' : '重新打开'}
                        </button>
                        <button
                          onClick={() => handleDelete(f)}
                          className="text-xs tracking-wide transition-colors duration-200"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          删除
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 反馈详情弹窗 */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setDetail(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[540px] rounded-2xl p-7 shadow-2xl transition-colors duration-300"
              style={{ background: 'var(--bg-surface-elevated)', border: `1px solid var(--border-default)` }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-light tracking-[2px] mb-5 transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}>反馈详情</h3>

              {/* 元信息 */}
              <div className="grid grid-cols-3 gap-2.5">
                <MetaCell label="提交平台"
                          value={`${PLATFORM_META[detail.platform]?.emoji ?? ''} ${PLATFORM_META[detail.platform]?.name ?? detail.platform}`}
                          color={PLATFORM_META[detail.platform]?.color} />
                <MetaCell label="反馈类型"
                          value={TYPE_META[detail.feedback_type]?.label ?? detail.feedback_type}
                          color={TYPE_META[detail.feedback_type]?.color} />
                <MetaCell label="状态"
                          value={detail.status === 'open' ? '待处理' : '已处理'}
                          color={detail.status === 'open' ? 'var(--accent-orange-text)' : 'var(--success)'} />
                <MetaCell label="提交人" value={detail.username} />
                <MetaCell label="所属单位" value={detail.organization || '—'} />
                <MetaCell label="提交时间" value={detail.created_at ? formatDateTime(detail.created_at) : '—'} />
              </div>

              {/* 完整内容 */}
              <div className="mt-4 rounded-xl px-4 py-3.5 text-[13px] leading-7 whitespace-pre-wrap break-words"
                   style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}>
                {detail.content}
              </div>

              <div className="flex gap-3 pt-5">
                <button onClick={() => setDetail(null)}
                        className="flex-1 rounded-lg py-2.5 text-xs transition-colors duration-200"
                        style={{ color: 'var(--text-secondary)', border: `1px solid var(--border-default)` }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>关闭</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => toggleStatus(detail)} disabled={operating}
                        className="flex-1 rounded-lg py-2.5 text-xs tracking-wide transition-all duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--accent-green-text)' }}>
                  {detail.status === 'open' ? '标记为已处理' : '重新打开'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MetaCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl px-3.5 py-2.5"
         style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}>
      <div className="text-[10px] mb-1 tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-xs truncate" style={{ color: color ?? 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-normal px-5 py-3.5 tracking-wide">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3.5 align-middle">{children}</td>
}
