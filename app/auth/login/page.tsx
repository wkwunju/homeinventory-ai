'use client'

import { useState, useEffect } from 'react'
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

  // Auto-slide functionality with fade transitions instead of sliding
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length)
    }, 2500) // Change slide every 2.5 seconds

    return () => clearInterval(interval)
  }, [slides.length])

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
      <div className="w-full max-w-md mx-auto px-4 pt-16 pb-16">
        {/* App name and description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">MaisonStock</h1>
          <div className="relative h-24">
            {slides.map((slideItem, index) => (
              <div 
                key={slideItem.key}
                className={`absolute inset-0 px-4 transition-opacity duration-700 ease-in-out ${
                  index === slide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
                  {slideItem.title}
                </h2>
                <p className="text-slate-600">
                  {slideItem.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div>
            <Card className="border-white/60 shadow-[0_12px_40px_rgba(99,102,241,0.12)] bg-white/95 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t('common.loading') : t('auth.login')}
                  </button>
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
  )
} 