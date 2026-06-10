import { motion } from 'framer-motion'

interface AppCardProps {
  name: string
  description: string[]
  icon: string
  accentColor: string
  accentTextClass: string
  url: string
}

/** 首页应用入口卡片 — 独立强调色、hover 发光边框、顶部渐变细线。 */
export default function AppCard({
  name,
  description,
  icon,
  accentColor,
  accentTextClass,
  url,
}: AppCardProps) {
  const handleClick = () => {
    const token = sessionStorage.getItem('ai4ms_token')
    if (token) {
      window.open(`${url}#token=${token}`, '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-[230px] rounded-2xl p-8 text-center cursor-pointer
                 transition-all duration-300 group overflow-hidden text-left"
      style={{
        background: `${accentColor}0D`,
        border: `1px solid ${accentColor}26`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}55`
        e.currentTarget.style.boxShadow = `0 0 40px ${accentColor}15, 0 0 80px ${accentColor}08`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}26`
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* 顶部发光线 */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-50 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}99, transparent)`,
        }}
      />

      {/* 内容 */}
      <div className="text-4xl mb-5">{icon}</div>
      <div
        className="text-[15px] font-normal tracking-[1px] mb-2.5"
        style={{ color: accentTextClass }}
      >
        {name}
      </div>
      <div className="text-[11px] text-white/25 leading-relaxed mb-5 space-y-0.5">
        {description.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div
        className="text-[11px] tracking-[1px] transition-colors duration-300
                   group-hover:translate-x-0.5 inline-flex items-center gap-1"
        style={{ color: `${accentColor}99` }}
      >
        进入平台
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </motion.button>
  )
}
