'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          </div>
          <h1 className="font-bold text-[20pt] bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{t('auth.loginTitle')}</h1>
          <p className="text-slate-600 text-[14pt] mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        <Card className="border-white/60 shadow-[0_12px_40px_rgba(99,102,241,0.12)] bg-white/95 backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[14pt] font-semibold text-slate-700 mb-3">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="pl-10 h-12 text-[14pt]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14pt] font-semibold text-slate-700 mb-3">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="pl-10 pr-10 h-12 text-[14pt]"
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

              <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full h-12 text-[14pt]">
                {loading ? t('common.loading') : t('auth.login')}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-[14pt] text-slate-600">
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
  )
} 