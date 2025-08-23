import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TopBar from '@/components/topbar'
import { AuthProvider } from '@/lib/auth-context'
import { ItemsCacheProvider } from '@/lib/items-cache'
import { LanguageProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HomeInventory AI - 智能家庭物品管理',
  description: '通过AI识别照片中的物品，智能管理家庭库存',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <ItemsCacheProvider>
              <div className="min-h-screen overflow-y-auto pt-16 touch-pan-y">
                <TopBar />
                <main className="px-5 sm:px-6">
                  {children}
                </main>
              </div>
            </ItemsCacheProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
} 