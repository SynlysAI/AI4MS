import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/** 404 页面 — 极简提示。 */
export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="text-7xl font-extralight tracking-[8px] select-none"
             style={{ color: 'var(--text-muted)', opacity: 0.3 }}>
          404
        </div>
        <div className="text-sm mt-3 tracking-wide transition-colors duration-300"
             style={{ color: 'var(--text-muted)' }}>
          页面不存在
        </div>
        <Link
          to="/"
          className="inline-block mt-5 text-xs tracking-[1px] transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue-text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          返回首页 →
        </Link>
      </motion.div>
    </div>
  )
}
