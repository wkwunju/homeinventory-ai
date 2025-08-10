'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: 初始化认证状态检查')
    
    // 获取当前用户
    const getUser = async () => {
      try {
        console.log('正在获取用户信息...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('获取用户信息失败:', error)
          setUser(null)
        } else {
          console.log('用户信息获取成功:', user ? '已登录' : '未登录')
          setUser(user)
        }
      } catch (error) {
        console.error('获取用户信息时发生错误:', error)
        setUser(null)
      } finally {
        console.log('设置加载状态为 false')
        setLoading(false)
      }
    }

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user ? '已登录' : '未登录')
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    // 立即获取用户信息
    getUser()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('尝试登录:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('登录失败:', error)
        return { error }
      }
      
      console.log('登录成功')
      return { error: null }
    } catch (error) {
      console.error('登录时发生错误:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log('尝试注册:', email)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('注册失败:', error)
        return { error }
      }
      
      console.log('注册成功')
      return { error: null }
    } catch (error) {
      console.error('注册时发生错误:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log('尝试登出')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('登出失败:', error)
      } else {
        console.log('登出成功')
        setUser(null)
      }
    } catch (error) {
      console.error('登出时发生错误:', error)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  console.log('AuthProvider 状态:', { user: !!user, loading })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 