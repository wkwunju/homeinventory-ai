'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  if (!user || pathname.startsWith('/auth/')) return null

  const initial = user.email?.[0]?.toUpperCase() || 'U'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-lg font-semibold text-slate-700 hover:text-slate-900"
        >
          HomeInventory
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 border border-slate-200/60 text-slate-700 font-semibold flex items-center justify-center shadow-sm hover:shadow-md"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {initial}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-lg p-1">
              <Link href="/config" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">
                <Settings className="h-4 w-4" />
                {t('navigation.settings')}
              </Link>
              <button
                onClick={async () => { await signOut(); router.push('/'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                {t('navigation.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
