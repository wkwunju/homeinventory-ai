'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { Home, Plus, Camera, Settings, Package } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useLanguage()

  // 如果用户未登录或在认证页面，不显示导航
  if (!user || pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              pathname === '/'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('navigation.home')}</span>
          </Link>

          <Link
            href="/add"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              pathname === '/add'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('navigation.addItem')}</span>
          </Link>

          <Link
            href="/spaces/add"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              pathname === '/spaces/add'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('navigation.addSpace')}</span>
          </Link>

          <Link
            href="/upload"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              pathname === '/upload'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-xs">拍照识别</span>
          </Link>

          <Link
            href="/config"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              pathname === '/config'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">{t('navigation.settings')}</span>
          </Link>
        </div>
      </div>
    </nav>
  )
} 