import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查环境变量是否配置
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
  console.warn('Supabase 环境变量未正确配置')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // 强制使用 Cookie 而不是 localStorage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // 关键：使用 Cookie 存储
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          const cookies = document.cookie.split(';')
          const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
          return cookie ? cookie.split('=')[1] : null
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      }
    }
  }
)

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