import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // 刷新会话（如果需要）
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('中间件认证错误:', error)
    } else if (session) {
      console.log('中间件: 用户已登录', session.user.email)
    } else {
      console.log('中间件: 用户未登录')
    }
  } catch (error) {
    console.error('中间件处理认证时出错:', error)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 