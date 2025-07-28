'use client'

import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'

export default function TestLoginPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        setMessage(`错误: ${error.message}`)
      } else {
        setMessage(isSignUp ? '注册成功！' : '登录成功！')
      }
    } catch (error) {
      setMessage(`操作失败: ${error}`)
    }
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  if (user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">测试登录页面</h1>
        <div className="bg-green-100 p-4 rounded mb-4">
          <p>已登录用户: {user.email}</p>
          <p>用户ID: {user.id}</p>
        </div>
        <button 
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          登出
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">测试登录页面</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isSignUp ? '注册' : '登录'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            切换到{isSignUp ? '登录' : '注册'}
          </button>
        </div>
      </form>
      
      {message && (
        <div className={`mt-4 p-4 rounded ${
          message.includes('错误') || message.includes('失败') 
            ? 'bg-red-100' 
            : 'bg-green-100'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
} 