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
    // 获取当前用户
    const getUser = async () => {
      try {
        console.log('正在获取用户信息...')
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('获取用户信息失败:', error)
        } else {
          console.log('用户信息获取成功:', user?.email)
          setUser(user)
        }
      } catch (error) {
        console.error('认证错误:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('尝试登录:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('登录失败:', error)
    } else {
      console.log('登录成功:', data.user?.email)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    console.log('尝试注册:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('注册失败:', error)
    } else {
      console.log('注册成功:', data.user?.email)
    }
    
    return { error }
  }

  const signOut = async () => {
    console.log('尝试登出')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('登出失败:', error)
    } else {
      console.log('登出成功')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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