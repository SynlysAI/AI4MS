import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/** 404 页面 — 深空风格，极简提示。 */
export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="text-7xl font-extralight text-white/[0.06] tracking-[8px] select-none">
          404
        </div>
        <div className="text-sm text-white/25 mt-3 tracking-wide">
          页面不存在
        </div>
        <Link
          to="/"
          className="inline-block mt-5 text-xs text-blue-400/40
                     hover:text-blue-400/70 transition-colors duration-200
                     tracking-[1px]"
        >
          返回首页 →
        </Link>
      </motion.div>
    </div>
  )
}
