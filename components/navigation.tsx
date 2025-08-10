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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 z-50 shadow-2xl shadow-sky-100/50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          <Link
            href="/"
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
              pathname === '/'
                ? 'text-sky-600 bg-gradient-to-br from-sky-50 to-blue-50 shadow-md border border-sky-200/40'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50/80'
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('navigation.home')}</span>
          </Link>

          <Link
            href="/add"
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
              pathname === '/add'
                ? 'text-sky-600 bg-gradient-to-br from-sky-50 to-blue-50 shadow-md border border-sky-200/40'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50/80'
            }`}
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('navigation.addItem')}</span>
          </Link>

          <Link
            href="/spaces/add"
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
              pathname === '/spaces/add'
                ? 'text-sky-600 bg-gradient-to-br from-sky-50 to-blue-50 shadow-md border border-sky-200/40'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50/80'
            }`}
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('navigation.addSpace')}</span>
          </Link>

          <Link
            href="/upload"
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
              pathname === '/upload'
                ? 'text-sky-600 bg-gradient-to-br from-sky-50 to-blue-50 shadow-md border border-sky-200/40'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50/80'
            }`}
          >
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">拍照识别</span>
          </Link>

          <Link
            href="/config"
            className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
              pathname === '/config'
                ? 'text-sky-600 bg-gradient-to-br from-sky-50 to-blue-50 shadow-md border border-sky-200/40'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50/80'
            }`}
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('navigation.settings')}</span>
          </Link>
        </div>
      </div>
    </nav>
  )
} 