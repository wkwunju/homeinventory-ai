import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createServerSupabaseClient()
    
    if (!supabaseAuth) {
      return NextResponse.json({ error: '无法创建 Supabase 客户端' })
    }

    // 获取用户信息
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: '用户未认证',
        userError: userError?.message 
      })
    }

    // 测试 RLS 策略
    const { data, error } = await supabaseAuth
      .from('items')
      .select('count')
      .limit(1)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      rlsTest: {
        success: !error,
        error: error?.message,
        data: data
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: '测试失败',
      message: error instanceof Error ? error.message : '未知错误'
    })
  }
} 