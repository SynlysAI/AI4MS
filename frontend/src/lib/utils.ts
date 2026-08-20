import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合并 className，支持条件类和 Tailwind 冲突去重。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 格式化 ISO 日期字符串为中文日期。 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/** 格式化 ISO 日期字符串为 "YYYY-MM-DD HH:mm"。 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 获取邀请码状态的中文显示。 */
export function inviteStatusLabel(status: string): string {
  switch (status) {
    case 'active': return '有效'
    case 'disabled': return '已禁用'
    case 'expired': return '已过期'
    case 'used_up': return '已用完'
    default: return status
  }
}
