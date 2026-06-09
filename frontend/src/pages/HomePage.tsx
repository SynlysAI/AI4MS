import { motion } from 'framer-motion'
import AppCard from '@/components/AppCard'

const apps = [
  {
    name: '智能谱学分析',
    description: ['NMR · IR · Raman', 'GPC · LCMS'],
    icon: '🔬',
    accentColor: '#3b82f6',
    accentColorClass: '#93c5fd',
    url: 'https://specagent.wumiaox.com',
  },
  {
    name: '高分子研发',
    description: ['配方设计 · 工艺优化', '性能预测 · 实验方案'],
    icon: '🧬',
    accentColor: '#8b5cf6',
    accentColorClass: '#c4b5fd',
    url: 'https://specpoly.wumiaox.com',
  },
  {
    name: '实验自动化监控',
    description: ['设备管理 · 工作流编排', '参数下发 · 实时监控'],
    icon: '🖥️',
    accentColor: '#10b981',
    accentColorClass: '#6ee7b7',
    url: 'https://speclabos.wumiaox.com',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

/** 首页：品牌标题 + 三应用卡片 + 交错进场动画。 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center mb-12">
        <h1 className="text-[38px] font-extralight tracking-[8px] text-white/85">
          AI<sup className="text-sm tracking-[2px] font-light">4</sup>MS
        </h1>
        <div className="w-[100px] h-px mx-auto my-3"
             style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }} />
        <p className="text-sm font-light tracking-[2px] text-white/35">AI for Molecular Science</p>
      </motion.div>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex gap-5">
        {apps.map((app) => (
          <motion.div key={app.name} variants={itemVariants}>
            <AppCard {...app} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
