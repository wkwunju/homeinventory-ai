'use client'

import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function AuthTestPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [cookies, setCookies] = useState<string[]>([])
  const [localStorage, setLocalStorage] = useState<string[]>([])

  // 检查浏览器存储
  useEffect(() => {
    const updateStorageInfo = () => {
      // 检查 Cookie
      const allCookies = document.cookie.split(';').map(cookie => cookie.trim())
      setCookies(allCookies)
      
      // 检查 localStorage
      const allLocalStorage = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          allLocalStorage.push(`${key}: ${window.localStorage.getItem(key)}`)
        }
      }
      setLocalStorage(allLocalStorage)
    }

    updateStorageInfo()
    
    // 监听存储变化
    window.addEventListener('storage', updateStorageInfo)
    return () => window.removeEventListener('storage', updateStorageInfo)
  }, [user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      console.log('尝试登录:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`登录失败: ${error.message}`)
        console.error('登录失败:', error)
      } else {
        setMessage('登录成功！')
        console.log('登录成功:', data.user?.email)
        
        // 延迟检查存储
        setTimeout(() => {
          const allCookies = document.cookie.split(';').map(cookie => cookie.trim())
          setCookies(allCookies)
          console.log('当前 Cookie:', allCookies)
          
          const allLocalStorage = []
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i)
            if (key) {
              allLocalStorage.push(`${key}: ${window.localStorage.getItem(key)}`)
            }
          }
          setLocalStorage(allLocalStorage)
          console.log('当前 localStorage:', allLocalStorage)
        }, 1000)
      }
    } catch (error) {
      setMessage(`登录错误: ${error}`)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setCookies([])
    setLocalStorage([])
    setMessage('已登出')
  }

  const clearAllStorage = () => {
    // 清除所有 Cookie
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
    
    // 清除 localStorage
    window.localStorage.clear()
    
    setCookies([])
    setLocalStorage([])
    setMessage('已清除所有存储')
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">认证测试页面</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 认证状态 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">认证状态</h2>
          <p>用户: {user ? user.email : '未登录'}</p>
          <p>用户ID: {user?.id || '无'}</p>
          {user && (
            <button 
              onClick={handleLogout}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              登出
            </button>
          )}
        </div>

        {/* Cookie 信息 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">浏览器 Cookie</h2>
          {cookies.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {cookies.map((cookie, index) => (
                <div key={index} className="text-xs bg-gray-100 p-1 rounded">
                  {cookie}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">没有 Cookie</p>
          )}
        </div>

        {/* localStorage 信息 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">localStorage</h2>
          {localStorage.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {localStorage.map((item, index) => (
                <div key={index} className="text-xs bg-gray-100 p-1 rounded">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">没有 localStorage</p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-white p-4 rounded-lg shadow mt-4">
        <h2 className="text-lg font-semibold mb-2">操作</h2>
        <div className="flex gap-2">
          <button
            onClick={clearAllStorage}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            清除所有存储
          </button>
        </div>
      </div>

      {/* 登录表单 */}
      {!user && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h2 className="text-lg font-semibold mb-2">登录测试</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2">邮箱:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">密码:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              登录
            </button>
          </form>
        </div>
      )}

      {/* 消息 */}
      {message && (
        <div className={`mt-4 p-4 rounded ${
          message.includes('失败') || message.includes('错误') 
            ? 'bg-red-100' 
            : 'bg-green-100'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
} 