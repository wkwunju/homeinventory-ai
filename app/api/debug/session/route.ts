import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = createServerSupabaseClient()
    
    if (!supabaseAuth) {
      return NextResponse.json({
        error: '无法创建 Supabase 客户端',
        cookies: request.headers.get('cookie')
      })
    }

    // 获取会话信息
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    // 获取用户信息
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()

    return NextResponse.json({
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email
        },
        expires_at: session.expires_at
      } : null,
      user: user ? {
        id: user.id,
        email: user.email
      } : null,
      sessionError: sessionError?.message,
      userError: userError?.message,
      cookies: request.headers.get('cookie'),
      headers: Object.fromEntries(request.headers.entries())
    })
  } catch (error) {
    return NextResponse.json({
      error: '获取会话信息失败',
      message: error instanceof Error ? error.message : '未知错误'
    })
  }
} 