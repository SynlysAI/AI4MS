import { Link } from 'react-router-dom'

/** 404 未找到页面。 */
export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="text-6xl font-light text-white/10">404</div>
      <div className="text-sm text-white/30">页面不存在</div>
      <Link to="/" className="text-xs text-blue-400/50 hover:text-blue-400/80 transition-colors mt-2">返回首页 &rarr;</Link>
    </div>
  )
}
