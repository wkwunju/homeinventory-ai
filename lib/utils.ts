import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function isExpiringSoon(expireDate: string, days = 7) {
  const today = new Date()
  const expire = new Date(expireDate)
  const diffTime = expire.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays >= 0
}

export function isExpired(expireDate: string) {
  const today = new Date()
  const expire = new Date(expireDate)
  return expire < today
}

// 重新导出 Item 类型
export type { Item } from './supabase' 