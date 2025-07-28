'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Globe, User, Bell, Shield, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLanguage: 'zh' | 'en') => {
    setLanguage(newLanguage)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="icon-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
              <p className="text-gray-600">{t('settings.languageDesc')}</p>
            </div>
          </div>

          {/* 设置选项 */}
          <div className="space-y-6">
            {/* 语言设置 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t('settings.language')}</h2>
                  <p className="text-sm text-gray-500">{t('settings.languageDesc')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleLanguageChange('zh')}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    language === 'zh'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇨🇳</span>
                      <div>
                        <div className="font-medium">{t('settings.chinese')}</div>
                        <div className="text-sm text-gray-500">简体中文</div>
                      </div>
                    </div>
                    {language === 'zh' && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇺🇸</span>
                      <div>
                        <div className="font-medium">{t('settings.english')}</div>
                        <div className="text-sm text-gray-500">English</div>
                      </div>
                    </div>
                    {language === 'en' && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* 账户信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t('settings.account')}</h2>
                  <p className="text-sm text-gray-500">{t('settings.profile')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">{t('auth.email')}</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* 其他设置 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t('settings.preferences')}</h2>
                  <p className="text-sm text-gray-500">应用偏好设置</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">通知设置</div>
                        <div className="text-sm text-gray-500">管理推送通知</div>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">隐私设置</div>
                        <div className="text-sm text-gray-500">管理数据隐私</div>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t('settings.about')}</div>
                        <div className="text-sm text-gray-500">关于应用</div>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 退出登录 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {loading ? t('common.loading') : t('auth.logout')}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 