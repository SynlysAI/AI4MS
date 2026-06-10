import { motion } from 'framer-motion'
import AppCard from '@/components/AppCard'

/** 三平台应用配置。 */
const APPS = [
  {
    name: '智能谱学分析',
    description: ['NMR · IR · Raman', 'GPC · LCMS'],
    icon: '🔬',
    accentColor: '#3b82f6',
    accentTextClass: '#93c5fd',
    url: 'https://specagent.wumiaox.com',
  },
  {
    name: '高分子研发',
    description: ['配方设计 · 工艺优化', '性能预测 · 实验方案'],
    icon: '🧬',
    accentColor: '#8b5cf6',
    accentTextClass: '#c4b5fd',
    url: 'https://specpoly.wumiaox.com',
  },
  {
    name: '实验自动化监控',
    description: ['设备管理 · 工作流编排', '参数下发 · 实时监控'],
    icon: '🖥️',
    accentColor: '#10b981',
    accentTextClass: '#6ee7b7',
    url: 'https://speclabos.wumiaox.com',
  },
]

/* 容器动画：子元素依次淡入 */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

/* 单个卡片动画 */
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

/** 门户首页 — 品牌标题 + 三张应用卡片启动器。 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh] px-6">
      {/* 品牌标题区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-14"
      >
        <h1 className="text-[40px] font-extralight tracking-[8px] text-white/85 select-none">
          AI
          <sup className="text-[14px] tracking-[2px] font-light">4</sup>
          MS
        </h1>
        {/* 分割线 */}
        <div
          className="w-[110px] h-px mx-auto my-3.5"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(59,130,246,0.45), transparent)',
          }}
        />
        <p className="text-sm font-light tracking-[2px] text-white/30">
          AI for Molecular Science
        </p>
      </motion.div>

      {/* 应用卡片区 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex gap-6 flex-wrap justify-center"
      >
        {APPS.map((app) => (
          <motion.div key={app.name} variants={itemVariants}>
            <AppCard {...app} />
          </motion.div>
        ))}
      </motion.div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-16 text-[11px] text-white/[0.12] tracking-[1px]"
      >
        点击卡片进入对应平台
      </motion.p>
    </div>
  )
}
