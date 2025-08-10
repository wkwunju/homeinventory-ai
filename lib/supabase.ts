import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 使用 Next.js Auth Helpers 的客户端实例，以便在浏览器中登录后写入服务器可读的认证 Cookie
export const supabase = createClientComponentClient()

// 数据库类型定义
export interface Item {
  id: string
  name: string
  quantity: number
  category?: string
  expire_date?: string
  location?: string
  photo_url?: string
  created_at: string
  user_id?: string
}

export interface RecognizedItem {
  name: string
  confidence: number
  bbox?: {
    x: number
    y: number
    width: number
    height: number
  }
} 