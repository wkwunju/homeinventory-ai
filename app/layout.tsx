import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TopBar from '@/components/topbar'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HomeInventory AI - 智能家庭物品管理',
  description: '通过AI识别照片中的物品，智能管理家庭库存',
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
            <div className="min-h-screen overflow-y-auto pt-16 touch-pan-y">
              <TopBar />
              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
} 