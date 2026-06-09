import { motion } from 'framer-motion'

interface AppCardProps {
  name: string
  description: string[]
  icon: string
  accentColor: string
  accentColorClass: string
  url: string
}

/** 应用卡片：悬停光影效果 + 点击跳转（携带 token）。 */
export default function AppCard({ name, description, icon, accentColor, accentColorClass, url }: AppCardProps) {
  const handleClick = () => {
    const token = sessionStorage.getItem('ai4ms_token')
    if (token) {
      window.open(`${url}#token=${token}`, '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClick}
      className="relative w-[220px] rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}40`
        e.currentTarget.style.boxShadow = `0 0 30px ${accentColor}10`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-100 transition-opacity"
           style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-base font-normal tracking-[1px] mb-2 transition-colors" style={{ color: accentColorClass }}>
        {name}
      </div>
      <div className="text-[11px] text-white/30 leading-relaxed mb-4">
        {description.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <div className="text-[11px] tracking-[1px] transition-colors" style={{ color: `${accentColor}80` }}>
        进入平台 &rarr;
      </div>
    </motion.div>
  )
}
