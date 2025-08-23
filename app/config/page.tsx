'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Globe, User, Bell, Shield, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
      <div className="min-h-screen pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-5">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-12 w-12">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{t('settings.title')}</h1>
              <p className="text-slate-600 text-lg mt-2">{t('settings.languageDesc')}</p>
            </div>
          </div>

          {/* 设置选项 */}
          <div className="space-y-5">
            {/* 语言设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800">{t('settings.language')}</CardTitle>
                    <p className="text-sm text-slate-500">{t('settings.languageDesc')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => handleLanguageChange('zh')}
                  className={`w-full p-4 border rounded-2xl text-left transition-all duration-300 ${
                    language === 'zh'
                      ? 'border-sky-500 bg-gradient-to-br from-sky-50/80 to-blue-50/80 text-sky-700 shadow-lg shadow-sky-100/50'
                      : 'border-slate-200/60 hover:border-sky-300/80 hover:bg-sky-50/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇨🇳</span>
                      <div>
                        <div className="font-medium text-slate-800">{t('settings.chinese')}</div>
                        <div className="text-sm text-slate-600">简体中文</div>
                      </div>
                    </div>
                    {language === 'zh' && (
                      <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full p-4 border rounded-2xl text-left transition-all duration-300 ${
                    language === 'en'
                      ? 'border-sky-500 bg-gradient-to-br from-sky-50/80 to-blue-50/80 text-sky-700 shadow-lg shadow-sky-100/50'
                      : 'border-slate-200/60 hover:border-sky-300/80 hover:bg-sky-50/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇺🇸</span>
                      <div>
                        <div className="font-medium text-slate-800">{t('settings.english')}</div>
                        <div className="text-sm text-slate-600">English</div>
                      </div>
                    </div>
                    {language === 'en' && (
                      <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* 账户信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800">{t('settings.account')}</CardTitle>
                    <p className="text-sm text-slate-500">{t('settings.profile')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50/80 rounded-2xl">
                  <div className="text-sm text-slate-600">{t('auth.email')}</div>
                  <div className="font-medium text-slate-800">{user?.email}</div>
                </div>
              </CardContent>
            </Card>

            {/* 其他设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800">{t('settings.preferences')}</CardTitle>
                    <p className="text-sm text-slate-500">{t('settings.languageDesc')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full p-4 border border-slate-200/60 rounded-2xl text-left hover:border-slate-300/80 hover:bg-slate-50/80 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-800">{t('settings.notifications')}</div>
                        <div className="text-sm text-slate-600">{t('settings.notificationsDesc')}</div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 border border-slate-200/60 rounded-2xl text-left hover:border-slate-300/80 hover:bg-slate-50/80 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-800">{t('settings.privacy')}</div>
                        <div className="text-sm text-slate-600">{t('settings.privacyDesc')}</div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 border border-slate-200/60 rounded-2xl text-left hover:border-slate-300/80 hover:bg-slate-50/80 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-800">{t('settings.about')}</div>
                        <div className="text-sm text-slate-600">{t('settings.aboutApp')}</div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* 退出登录 */}
            <Card>
              <CardContent>
                <div className="flex justify-center">
                  <Button onClick={handleLogout} disabled={loading} variant="destructive" className="h-12 min-w-[200px]">
                    {loading ? t('common.loading') : t('auth.logout')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 