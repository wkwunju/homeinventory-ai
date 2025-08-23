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
    if (!loading) {
      router.push(user ? '/' : '/auth/login')
    }
  }, [user, loading, router])

  return null
} 