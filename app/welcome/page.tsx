'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Package, Camera, Plus, Users } from 'lucide-react'

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl mx-auto px-4 pt-16 pb-8">
        {/* 头部 */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HomeInventory AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            智能家庭物品管理系统，通过AI识别照片中的物品，轻松管理你的家庭库存
          </p>
        </div>

        {/* 功能特色 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 拍照识别</h3>
            <p className="text-gray-600">
              拍照即可自动识别物品，无需手动输入
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">手动添加</h3>
            <p className="text-gray-600">
              支持手动添加物品，记录详细信息
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">多用户支持</h3>
            <p className="text-gray-600">
              支持多用户，每个用户独立管理自己的物品
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <button className="main-btn w-full sm:w-auto">
                立即注册
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="secondary-btn w-full sm:w-auto">
                已有账号？登录
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            注册即表示同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  )
} 