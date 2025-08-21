'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Package, Camera, Plus, Users } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-sky-50/60 to-indigo-50/60">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="w-full max-w-5xl mx-auto px-4 pt-20 pb-14 relative">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <Package className="w-10 h-10 text-sky-600" />
          </div>
          <h1 className="font-bold text-[20pt] bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">{t('welcome.heroTitle')}</h1>
          <p className="text-slate-600 text-[14pt] max-w-2xl mx-auto">{t('welcome.heroSubtitle')}</p>
        </div>

        {/* 3-step flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <Card className="text-center border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-[14pt] mb-1">{t('welcome.step1')}</h3>
              <p className="text-slate-600 text-[14pt]">{t('welcome.step1Desc')}</p>
            </CardContent>
          </Card>
          <Card className="text-center border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-[14pt] mb-1">{t('welcome.step2')}</h3>
              <p className="text-slate-600 text-[14pt]">{t('welcome.step2Desc')}</p>
            </CardContent>
          </Card>
          <Card className="text-center border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-fuchsia-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-[14pt] mb-1">{t('welcome.step3')}</h3>
              <p className="text-slate-600 text-[14pt]">{t('welcome.step3Desc')}</p>
            </CardContent>
          </Card>
        </div>

        {/* CTAs */}
        <div className="text-center space-y-5">
          <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur p-1.5 shadow-xl border border-white/60">
            <Link href="/auth/register" className="block">
              <Button variant="primary" size="lg" className="h-12 px-7">{t('welcome.ctaStart')}</Button>
            </Link>
            <div className="w-2" />
            <Link href="/auth/login" className="block">
              <Button variant="outline" size="lg" className="h-12 px-7">{t('welcome.ctaHave')}</Button>
            </Link>
          </div>
          <p className="text-slate-500 text-[14pt]">{t('welcome.subtext')}</p>
        </div>
      </div>
    </div>
  )
} 