'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Package, Camera, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slide, setSlide] = useState(0)

  const slides = [
    { key: 's1', title: t('welcome.step1'), desc: t('welcome.step1Desc'), bg: 'from-sky-100 to-blue-100', Icon: Camera },
    { key: 's2', title: t('welcome.step2'), desc: t('welcome.step2Desc'), bg: 'from-emerald-100 to-teal-100', Icon: Plus },
    { key: 's3', title: t('welcome.step3'), desc: t('welcome.step3Desc'), bg: 'from-fuchsia-100 to-pink-100', Icon: Users },
  ]

  const prevSlide = () => setSlide((s) => (s - 1 + slides.length) % slides.length)
  const nextSlide = () => setSlide((s) => (s + 1) % slides.length)

  const ActiveIcon = slides[slide].Icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(formData.email, formData.password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Withings-style onboarding card */}
          <div>
            <div className="rounded-3xl overflow-hidden bg-white/90 border border-white/40 shadow-xl">
              <div className={`h-48 md:h-64 bg-gradient-to-br ${slides[slide].bg} flex items-center justify-center`}>
                <ActiveIcon className="w-14 h-14 text-slate-700" />
              </div>
              <div className="p-6">
                <h2 className="text-[20pt] font-bold text-slate-900 mb-2">{slides[slide].title}</h2>
                <p className="text-slate-600">{slides[slide].desc}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {slides.map((s, i) => (
                      <span key={s.key} className={`h-2 w-2 rounded-full ${i === slide ? 'bg-slate-900' : 'bg-slate-300'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={prevSlide} className="modern-button-secondary px-4 py-2">‹</button>
                    <button type="button" onClick={nextSlide} className="modern-button-primary px-4 py-2">›</button>
                  </div>
                </div>
                <Link href="/auth/register" className="block mt-6">
                  <button className="w-full h-12 rounded-full bg-black text-white font-semibold transition hover:opacity-90">
                    {t('welcome.ctaStart')}
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: login form */}
          <div className="w-full max-w-md lg:ml-auto">
            <Card className="border-white/60 shadow-[0_12px_40px_rgba(99,102,241,0.12)] bg-white/95 backdrop-blur">
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-3">{t('auth.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder={t('auth.emailPlaceholder')}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-3">{t('auth.password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder={t('auth.passwordPlaceholder')}
                        className="pl-10 pr-10 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50/80 border border-red-200 rounded-xl px-3 py-2">
                      {error}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full h-12">
                    {loading ? t('common.loading') : t('auth.login')}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-slate-600">
                    {t('auth.noAccount')} {' '}
                    <Link href="/auth/register" className="text-sky-600 hover:text-sky-700 font-medium">
                      {t('auth.goRegister')}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 