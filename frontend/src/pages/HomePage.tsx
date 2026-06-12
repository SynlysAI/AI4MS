import { motion } from 'framer-motion'
import AppCard from '@/components/AppCard'
import { useThemeStore } from '@/stores/themeStore'

/** 三平台应用配置。 */
const APPS = [
  {
    name: '智能谱学分析',
    description: ['NMR · IR · Raman', 'GPC · LCMS'],
    icon: '🔬',
    accentColor: '#3b82f6',
    accentTextClass: 'var(--accent-blue-text)',
    url: 'https://specagent.wumiaox.com',
  },
  {
    name: '高分子研发',
    description: ['配方设计 · 工艺优化', '性能预测 · 实验方案'],
    icon: '🧬',
    accentColor: '#8b5cf6',
    accentTextClass: 'var(--accent-purple-text)',
    url: 'https://specpoly.wumiaox.com',
  },
  {
    name: '实验自动化监控',
    description: ['设备管理 · 工作流编排', '参数下发 · 实时监控'],
    icon: '🖥️',
    accentColor: '#10b981',
    accentTextClass: 'var(--accent-green-text)',
    url: 'https://speclabos.wumiaox.com',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

/** 门户首页 — 品牌标题 + 三张应用卡片启动器。 */
export default function HomePage() {
  const theme = useThemeStore((s) => s.theme)
  const darkFilter = theme === 'dark' ? 'brightness(2.6) contrast(1.3)' : undefined

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh] px-6">
      {/* 品牌标题区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-14"
      >
        <h1 className="text-[40px] font-extralight tracking-[8px] select-none transition-colors duration-300"
            style={{ color: 'var(--text-primary)' }}>
          AI
          <sup className="text-[14px] tracking-[2px] font-light">4</sup>
          MS
        </h1>
        <div
          className="w-[110px] h-px mx-auto my-3.5"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(59,130,246,0.45), transparent)',
          }}
        />
        <p className="text-sm font-light tracking-[2px] transition-colors duration-300"
           style={{ color: 'var(--text-muted)' }}>
          AI for Molecular Science
        </p>
      </motion.div>

      {/* 合作单位 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-10 flex items-center gap-8 flex-wrap justify-center"
      >
        <img
          src="/JG-logo.png"
          alt="嘉庚创新实验室"
          className="h-11 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
        />
        <img
          src="/厦门大学.svg"
          alt="厦门大学"
          className="h-11 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
          style={{ filter: darkFilter }}
        />
        <img
          src="/上海人工智能实验室.png"
          alt="上海人工智能实验室"
          className="h-11 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
          style={{ filter: darkFilter }}
        />
        <img
          src="/苏州实验室.png"
          alt="苏州实验室"
          className="h-11 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
          style={{ filter: darkFilter }}
        />
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
        className="mt-16 text-[11px] tracking-[1px] transition-colors duration-300"
        style={{ color: 'var(--text-muted)', opacity: 0.6 }}
      >
        点击卡片进入对应平台
      </motion.p>
    </div>
  )
}
