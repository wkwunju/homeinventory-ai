import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  // 检查环境变量是否配置
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
    return null
  }

  try {
    // 正确创建服务端客户端，传递 cookies 函数
    const cookieStore = cookies()
    return createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
  } catch (error) {
    console.error('创建 Supabase 客户端失败:', error)
    return null
  }
} 