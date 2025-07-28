'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/debug/session')
        const data = await response.json()
        setSessionInfo(data)
      } catch (error) {
        console.error('获取会话信息失败:', error)
      }
    }

    checkSession()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">调试页面</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">客户端认证状态</h2>
          <p>加载中: {loading ? '是' : '否'}</p>
          <p>用户: {user ? user.email : '未登录'}</p>
          <p>用户ID: {user?.id || '无'}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">服务端会话信息</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 