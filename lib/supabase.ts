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
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
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