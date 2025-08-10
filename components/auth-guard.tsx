'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('AuthGuard: 认证状态变化', { user: !!user, loading })
    
    if (!loading && !user) {
      console.log('AuthGuard: 用户未登录，重定向到登录页面')
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    console.log('AuthGuard: 显示加载状态')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-400 mt-2">正在检查认证状态...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('AuthGuard: 用户未登录，不显示内容')
    return null
  }

  console.log('AuthGuard: 用户已登录，显示受保护的内容')
  return <>{children}</>
} 