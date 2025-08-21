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
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#eaeaea] shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-lg font-semibold bg-gradient-to-r from-[#93C5FD] via-[#A5B4FC] to-[#C4B5FD] bg-clip-text text-transparent hover:opacity-90"
        >
          HomeInventory
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="h-10 w-10 rounded-full bg-white border border-[#eaeaea] text-slate-800 font-semibold flex items-center justify-center shadow-sm hover:bg-[#f7f7f7]"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {initial}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#eaeaea] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-1">
              <Link href="/config" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>
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
