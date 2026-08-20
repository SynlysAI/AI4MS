import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  fullWidth?: boolean
}

/** 自定义下拉选择器 — 替代原生 select，原生弹层在深色主题下会渲染白色边框。 */
export default function Select({ value, options, onChange, fullWidth }: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const current = options.find((o) => o.value === value)

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-xs rounded-lg px-3 py-2 cursor-pointer focus:outline-none transition-colors duration-200
                    flex items-center justify-between gap-2 ${fullWidth ? 'w-full' : ''}`}
        style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}>
        <span className="whitespace-nowrap">{current?.label ?? options[0]?.label}</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="12" height="12"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1.5 z-50 rounded-lg py-1 max-h-72 overflow-y-auto
                        ${fullWidth ? 'w-full' : 'min-w-full'}`}
            style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="block w-full text-left text-xs px-3.5 py-2 whitespace-nowrap cursor-pointer transition-colors duration-150"
                style={{
                  color: o.value === value ? 'var(--accent-blue-text)' : 'var(--text-secondary)',
                  background: o.value === value ? 'var(--bg-hover)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (o.value !== value) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { if (o.value !== value) e.currentTarget.style.background = 'transparent' }}>
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
