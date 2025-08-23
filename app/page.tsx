'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useItemsCache } from '@/lib/items-cache'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { Plus, Search, Package, Grid3X3, List, Sparkles, Home, MapPin, Image as ImageIcon, Edit3, Share2, Crown } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface Space {
  id: string
  name: string
  description?: string
  level: number
  parent_id?: string
  icon?: string
  children?: Space[]
  item_count?: number
}

interface Item {
  id: string
  name: string
  quantity: number
  category?: string
  expire_date?: string
  space_id: string
  spaces: {
    id: string
    name: string
    level: number
  }
  // 新增字段
  value?: number
  brand?: string
  purchase_date?: string
  purchase_source?: string
  notes?: string
  condition?: string
  priority?: string
  photo_url?: string
}

export default function HomePage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'spaces' | 'items'>('items')
  const [spaces, setSpaces] = useState<Space[]>([])
  const { items: cachedItems, loaded, refresh, removeItem } = useItemsCache()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<{spaces: Space[], items: Item[]}>({spaces: [], items: []})
  const [isSearching, setIsSearching] = useState(false)
  const [allSpaces, setAllSpaces] = useState<Space[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false)
  const [roomsCount, setRoomsCount] = useState(0)

  // 获取空间数据
  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/spaces')
      if (response.ok) {
        const data = await response.json()
        const spacesData = data.spaces || []
        setSpaces(spacesData)
        setAllSpaces(spacesData) // 保存所有空间数据
        const flat = data.flat || []
        const roomNum = Array.isArray(flat) ? flat.filter((s: any) => s.level === 1).length : 0
        setRoomsCount(roomNum)
      }
    } catch (error) {
      console.error('获取空间失败:', error)
    }
  }

  // 获取物品数据
  const fetchItems = async (spaceId?: string) => {
    // Use cache as primary source; refresh in background
    if (!spaceId) {
      setItems(cachedItems as unknown as Item[])
      setAllItems(cachedItems as unknown as Item[])
      // background refresh to keep it up to date
      refresh().catch(() => {})
    } else {
      try {
        const params = new URLSearchParams()
        params.append('space_id', spaceId)
        const response = await fetch(`/api/items?${params}`)
        if (response.ok) {
          const data = await response.json()
          const itemsData = data.items || []
          setItems(itemsData)
        }
      } catch (error) {
        console.error('获取物品失败:', error)
      }
    }
  }

  // 搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      setIsSearching(true)
      
      // 在本地数据中搜索空间
      const filteredSpaces = allSpaces.filter(space => 
        space.name.toLowerCase().includes(query.toLowerCase()) ||
        space.description?.toLowerCase().includes(query.toLowerCase())
      )
      
      // 在本地数据中搜索物品
      const filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase()) ||
        (item.spaces?.name?.toLowerCase() || '').includes(query.toLowerCase())
      )
      
      setSearchResults({
        spaces: filteredSpaces,
        items: filteredItems
      })
    } else {
      setIsSearching(false)
      setSearchResults({spaces: [], items: []})
      // 恢复正常的tab显示
      setSpaces(allSpaces)
      setItems(allItems)
    }
  }

  // 切换Tab
  const handleTabChange = (tab: 'spaces' | 'items') => {
    setActiveTab(tab)
    // 不清空搜索框，保持搜索状态
    if (tab === 'items') {
      setItems(allItems)
    } else if (tab === 'spaces') {
      setSpaces(allSpaces)
    }
  }

  // 渲染空间层级
  const renderSpace = (space: Space, level: number = 0) => {
    const indent = level * 20
    const isRoom = space.level === 1
    const hasChildren = space.children && space.children.length > 0

    return (
      <div key={space.id} className="space-y-3">
        <div 
          className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            isRoom 
              ? 'bg-gradient-to-br from-sky-50/90 via-blue-50/90 to-indigo-50/90 border-sky-200/60 hover:border-sky-300/80 shadow-lg shadow-sky-100/50' 
              : 'bg-gradient-to-br from-slate-50/90 via-gray-50/90 to-slate-50/90 border-slate-200/60 hover:border-slate-300/80 shadow-lg shadow-slate-100/50'
          }`}
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-md ${
                  isRoom ? 'bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600' : 'bg-gradient-to-br from-slate-100 to-gray-100 text-slate-600'
                }`}>
                  {space.icon || '📦'}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-lg">{space.name}</div>
                  {space.description && (
                    <div className="text-sm text-slate-600 mt-1">{space.description}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {space.item_count !== undefined && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                    isRoom 
                      ? 'bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border border-sky-200/60' 
                      : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200/60'
                  }`}>
                    {space.item_count} 件物品
                  </span>
                )}
                {isRoom ? (
                  <Link 
                    href={`/spaces/${space.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl hover:shadow-md"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link 
                    href={`/spaces/${space.parent_id}?location=${space.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl hover:shadow-md"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        {hasChildren && (
          <div className="space-y-3">
            {space.children!.map(child => renderSpace(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // 渲染物品列表（滚动容器）
  const renderItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center mb-6 shadow-lg border border-sky-200/40">
            <Package className="h-14 w-14 text-sky-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">暂无物品</h3>
          <p className="text-slate-600 mb-8 text-lg">开始添加你的第一个物品吧</p>
          <button onClick={() => setShowAddItemModal(true)} className="modern-button-primary inline-flex items-center gap-3 px-6 py-3">
            <Plus className="h-5 w-5" />
            添加物品
          </button>
        </div>
      )
    }

    return (
                    <div className="grid gap-4">
                {items.map(item => (
          <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-xl hover:border-sky-300/60 hover:-translate-y-1 shadow-lg shadow-slate-100/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-lg mb-2">{item.name}</div>
                  <div className="flex flex-col gap-2 text-sm text-slate-600 mb-2 leading-tight">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-sky-500" />
                      <span>数量：{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="whitespace-normal">{t('home.location')}：{item.spaces?.name || t('home.unspecified')}</span>
                    </div>
                    {item.category && (
                      <div>
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>
                  {item.expire_date && (
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      {t('home.expire')}: {new Date(item.expire_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 w-full sm:w-auto mt-2 sm:mt-0">
                <Link 
                  href={`/item/${item.id}`}
                  className="modern-button-ghost inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 sm:min-w-[120px] whitespace-nowrap shrink-0"
                >
                  {t('home.viewDetail')}
                  <Sparkles className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDeleteHomeItem(item.id)}
                  className="modern-button-secondary inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 sm:min-w-[100px] whitespace-nowrap shrink-0 text-red-600 hover:bg-red-50"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchSpaces()
      await fetchItems() // 从缓存读取并后台刷新
      setLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user])

  // 当缓存变更时，仅同步本地展示数据，不触发重新加载
  useEffect(() => {
    if (!selectedSpaceId) {
      setAllItems(cachedItems as unknown as Item[])
      setItems(cachedItems as unknown as Item[])
    } else {
      const filtered = (cachedItems as unknown as Item[]).filter(it => it.space_id === selectedSpaceId)
      setItems(filtered)
    }
  }, [cachedItems, selectedSpaceId])

  // 统计信息
  const { totalItems, totalWorth, expiringSoon, expiredCount } = useMemo(() => {
    const totalItems = items.length
    const totalWorth = items.reduce((sum, it) => sum + (typeof it.value === 'number' ? it.value : 0), 0)
    const now = new Date()
    const soon = new Date()
    soon.setDate(now.getDate() + 7)
    const expiringSoon = items.filter(it => {
      if (!it.expire_date) return false
      const d = new Date(it.expire_date)
      return d <= soon
    }).length
    const expiredCount = items.filter(it => {
      if (!it.expire_date) return false
      const d = new Date(it.expire_date)
      return d < now
    }).length
    return { totalItems, totalWorth, expiringSoon, expiredCount }
  }, [items])

  const locationItemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allItems.forEach((it) => {
      if (it.space_id) counts[it.space_id] = (counts[it.space_id] || 0) + 1
    })
    return counts
  }, [allItems])

  const handleDeleteHomeItem = async (id: string) => {
    if (!confirm(t('common.delete') + '?')) return
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      removeItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      setAllItems((prev) => prev.filter((i) => i.id !== id))
    } catch (e) {
      alert(t('common.error'))
    }
  }

  const [showShareModal, setShowShareModal] = useState(false)

  const handleShareSummary = async () => {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = '/share-template.png'
      }).catch(() => null as any)

      const scale = 2
      const fallbackWidth = 900
      const fallbackHeight = 600
      const width = img ? img.width : fallbackWidth
      const height = img ? img.height : fallbackHeight

      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)

      if (img) {
        ctx.drawImage(img, 0, 0, width, height)
      } else {
        // Fallback gradient background if template is missing
        const grad = ctx.createLinearGradient(0, 0, width, height)
        grad.addColorStop(0, '#E0F2FE')
        grad.addColorStop(1, '#EDE9FE')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)
      }

      // Compose text lines (center on label area)
      const line1 = language === 'zh' ? '我正在用 AI 管理我的物品' : "I'm using AI to manage my stuff"
      const line2 = language === 'zh' ? '来看看你的吧！' : 'Come and see yours!'

      // Text box roughly where the tag area is (tweak to your template)
      const centerX = width / 2
      const centerY = height * 0.56
      const maxWidth = width * 0.64 // keep inside the tag
      const baseFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#0f172a'
      ctx.shadowColor = 'rgba(0,0,0,0.18)'
      ctx.shadowBlur = 8

      // Helper: wrap by characters (better for Chinese)
      const wrapByChars = (text: string, fontSize: number) => {
        ctx.font = `bold ${fontSize}px ${baseFamily}`
        const chars = Array.from(text)
        const lines: string[] = []
        let line = ''
        for (const ch of chars) {
          const test = line + ch
          if (ctx.measureText(test).width > maxWidth && line.length > 0) {
            lines.push(line)
            line = ch
          } else {
            line = test
          }
        }
        if (line) lines.push(line)
        return lines
      }

      // Fit title lines
      let titleSize = 30
      let titleLines: string[] = []
      while (titleSize >= 18) {
        titleLines = wrapByChars(line1, titleSize)
        if (titleLines.every(l => (ctx.measureText(l).width <= maxWidth)) && titleLines.length <= 2) break
        titleSize -= 1
      }
      ctx.font = `bold ${titleSize}px ${baseFamily}`
      const lineHeightTitle = titleSize * 1.3
      const blockHeight = lineHeightTitle * titleLines.length + titleSize * 1.1
      let currentY = centerY - blockHeight / 2
      titleLines.forEach((l, idx) => {
        ctx.fillText(l, centerX, currentY)
        currentY += lineHeightTitle
      })

      // Fit secondary line
      let subSize = Math.max(16, titleSize - 4)
      ctx.font = `${subSize}px ${baseFamily}`
      const subLines = wrapByChars(line2, subSize)
      const lineHeightSub = subSize * 1.35
      subLines.forEach(l => {
        ctx.fillText(l, centerX, currentY)
        currentY += lineHeightSub
      })
      ctx.shadowBlur = 0

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `homeinventory-share-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (e) {
      console.error('分享图片生成失败', e)
    }
  }

  const handleOpenShareModal = () => {
    setShowShareModal(true)
  }

  const handleShareWebsite = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.origin + '/' : ''
      const text = language === 'zh'
        ? '我正在用 AI 管理我的物品，来看看你的吧！'
        : "I'm using AI to manage my stuff, come and see yours"
      const title = language === 'zh' ? '分享' : 'Share'
      if (navigator?.share) {
        await navigator.share({ title, text, url })
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text} ${url}`)
        alert('分享内容已复制到剪贴板')
      } else {
        window.open(url, '_blank')
      }
      setShowShareModal(false)
    } catch (e) {
      console.error('网站分享失败', e)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pb-24">
        <div className="w-full max-w-5xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  家庭储物管理
                </h1>
              </div>
              {/* 移除头部欢迎语，改为下方概览卡片展示 */}
            </div>
            <div className="h-10" />
          </div>

          {/* 概览卡片 + landing style intro */}
          <div className="mb-5">
            <Card className="rounded-3xl border border-[#eaeaea] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <CardContent className="p-6">
                <div className="space-y-2 text-slate-700 leading-relaxed">
                  <p>
                    <span className="text-slate-900 font-semibold">{t('navigation.home')}, {user?.email?.split('@')[0] || 'friend'} 👋</span>
                  </p>
                  <p>
                    {t('home.summary', { items: totalItems, rooms: roomsCount, worth: totalWorth.toFixed(2) })}
                  </p>
                  <p>
                    {t('home.summaryMore', { soon: expiringSoon, expired: expiredCount })}
                  </p>
                </div>

                {/* Removed landing-style tiles from Home to avoid duplication pre-login */}
                {/* 搜索框移动到概览卡片下方 */}
                <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative max-w-lg flex-1 min-w-[260px]">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('home.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-100/50 text-lg"
                    />
                  </div>
                  <button
                    onClick={handleOpenShareModal}
                    className="modern-button-primary inline-flex items-center gap-2 px-5 py-3"
                    aria-label="生成分享图"
                  >
                    <Share2 className="w-5 h-5" />
                    {t('share.button')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toggle + content header merged */}
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-sm p-1.5 shadow-xl border border-white/40 shadow-sky-100/50 overflow-x-auto">
              <button
                onClick={() => handleTabChange('items')}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'items'
                    ? 'bg-gradient-to-r from-[#93C5FD] via-[#A5B4FC] to-[#C4B5FD] text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
                aria-label={t('home.manageItems')}
              >
                <Package className="w-6 h-6" />
                {t('home.myItems')}
              </button>
              <button
                onClick={() => handleTabChange('spaces')}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'spaces'
                    ? 'bg-gradient-to-r from-[#93C5FD] via-[#A5B4FC] to-[#C4B5FD] text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
                aria-label={t('home.manageSpaces')}
              >
                <span className="text-2xl">🏠</span>
                {t('home.mySpaces')}
              </button>
            </div>

            <div className="w-full sm:w-auto flex justify-end sm:justify-start">
              {activeTab === 'items' ? (
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-md text-white bg-gradient-to-r from-[#93C5FD] via-[#A5B4FC] to-[#C4B5FD] hover:shadow-lg transition-all"
                  aria-label={t('home.addItemCTA')}
                >
                  <Plus className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAddSpaceModal(true)}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-md text-white bg-gradient-to-r from-[#93C5FD] via-[#A5B4FC] to-[#C4B5FD] hover:shadow-lg transition-all"
                  aria-label={t('home.addSpaceCTA')}
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 shadow-sky-100/50 overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-6"></div>
                <p className="text-slate-600 text-lg">{t('common.loading')}</p>
              </div>
            ) : (
              <div className="p-8">
                {isSearching ? (
                  // 搜索结果显示
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                        <Search className="h-6 w-6 text-sky-500" />
                        {t('home.searchResults')}: "{searchQuery}"
                      </h2>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setIsSearching(false)
                          setSearchResults({spaces: [], items: []})
                        }}
                        className="modern-button-secondary inline-flex items-center gap-2 px-5 py-3"
                      >
                        {t('home.clearSearch')}
                      </button>
                    </div>
                    
                    {/* 空间搜索结果 */}
                    {searchResults.spaces.length > 0 && (
                      <div className="mb-10">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                          <Home className="h-5 w-5 text-sky-500" />
                          {t('home.spacesSection', { count: searchResults.spaces.length })}
                        </h3>
                        <div className="space-y-5">
                          {searchResults.spaces.map(space => renderSpace(space))}
                        </div>
                      </div>
                    )}
                    
                    {/* 物品搜索结果 */}
                    {searchResults.items.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                          <Package className="h-5 w-5 text-emerald-500" />
                          {t('home.itemsSection', { count: searchResults.items.length })}
                        </h3>
                        <div className="grid gap-5">
                          {searchResults.items.map(item => (
                            <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-xl hover:border-sky-300/60 hover:-translate-y-1 shadow-lg shadow-slate-100/50">
                               <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-800 text-lg mb-2">{item.name}</div>
                                    <div className="flex flex-col gap-2 text-sm text-slate-600 mb-2 leading-tight">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-sky-500" />
                                        <span>数量：{item.quantity}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-500" />
                                        <span className="whitespace-normal">位置：{item.spaces?.name || '未指定'}</span>
                                      </div>
                                      {item.category && (
                                        <div>
                                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                                            {item.category}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {item.expire_date && (
                                      <div className="flex items-center gap-1 text-sm text-amber-600">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                        过期: {new Date(item.expire_date).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                                  <Link 
                                    href={`/item/${item.id}`}
                                    className="modern-button-ghost inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 sm:min-w-[120px] whitespace-nowrap shrink-0"
                                  >
                                    查看详情
                                    <Sparkles className="h-4 w-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 无搜索结果 */}
                    {searchResults.spaces.length === 0 && searchResults.items.length === 0 && (
                      <div className="text-center py-16">
                        <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center mb-6 shadow-lg border border-slate-200/40">
                          <Search className="h-14 w-14 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-3">{t('home.noSearchResultsTitle')}</h3>
                        <p className="text-slate-600 text-lg">{t('home.noSearchResultsHint')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // 正常的tab内容
                  activeTab === 'spaces' ? (
                    <div>
                      {spaces.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center mb-6 shadow-lg border border-sky-200/40">
                            <span className="text-5xl">🏠</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-3">{t('home.noSpaces')}</h3>
                          <p className="text-slate-600 mb-8 text-lg">{t('home.createFirstSpace')}</p>
                          <button onClick={() => setShowAddSpaceModal(true)} className="modern-button-primary inline-flex items-center gap-3 px-6 py-3">
                            <Plus className="h-5 w-5" />
                            创建第一个空间
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {spaces.filter(r => r.level === 1).map(room => (
                            <div key={room.id} className="rounded-3xl border border-sky-200/60 bg-gradient-to-br from-sky-50/70 to-blue-50/70 p-5 shadow-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-sky-200/50 flex items-center justify-center text-2xl">
                                    {room.icon || '🏠'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800 text-lg">{room.name}</div>
                                    {room.description && (
                                      <div className="text-sm text-slate-600 mt-0.5">{room.description}</div>
                                    )}
                                  </div>
                                </div>
                                <Link href={`/spaces/${room.id}`} className="text-slate-500 hover:text-sky-600">
                                  <Grid3X3 className="w-5 h-5" />
                                </Link>
                              </div>
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {(room.children || []).filter((loc: any) => loc.level === 2).map((loc: any) => (
                                  <Link key={loc.id} href={`/spaces/${room.id}?location=${loc.id}`} className="group">
                                    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-3 flex items-center gap-3 hover:border-sky-300/80 hover:shadow-md transition-all">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-200/60">
                                        {loc.icon || '📦'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium text-slate-800">{loc.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                          {locationItemCounts[loc.id] ? t('home.itemsCount', { count: locationItemCounts[loc.id] }) : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {renderItems()}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddItemModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/60 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">选择添加方式</h3>
            <div className="space-y-3">
              <Link href="/upload" className="block">
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#93C5FD] via-[#A5B4FC] to-[#C4B5FD] text-white shadow-md hover:shadow-lg transition-all">
                  <ImageIcon className="h-5 w-5 text-white" />
                  AI 识别添加
                </button>
              </Link>
              <Link href="/add" className="block">
                <button className="w-full flex items-center gap-3 p-4 border border-slate-200/60 rounded-xl bg-white hover:bg-slate-50/80 transition-all">
                  <Edit3 className="h-5 w-5 text-slate-600" />
                  手动添加
                </button>
              </Link>
            </div>
            <button onClick={() => setShowAddItemModal(false)} className="mt-6 w-full modern-button-secondary px-4 py-3">关闭</button>
          </div>
        </div>
      )}

      {showAddSpaceModal && (
        <div className="mobile-modal" onClick={() => setShowAddSpaceModal(false)}>
          <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">空间管理</h3>
            <p className="text-slate-600 mb-6">前往空间管理页面添加房间与位置</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddSpaceModal(false)} className="modern-button-secondary px-5 py-3">稍后</button>
              <Link href="/spaces/add">
                <button className="modern-button-primary px-5 py-3">前往管理</button>
              </Link>
            </div>
          </div>
        </div>
      )}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-white/40 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Body only (title removed) */}
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3 text-slate-800">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-100 to-pink-100 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-[20pt] leading-snug">
                  我正在使用 HomeInventory AI 管理我的“宝藏”，总价值约 ¥{totalWorth.toFixed(2)}，来看看你的吧！
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-2xl border border-sky-200/60 bg-sky-50/60 p-6">
                  <div className="text-slate-900 font-semibold text-[20pt]">{totalItems}</div>
                  <div className="text-slate-600">物品</div>
                </div>
                <div className="rounded-2xl border border-violet-200/60 bg-violet-50/60 p-6">
                  <div className="text-slate-900 font-semibold text-[20pt]">¥{totalWorth.toFixed(2)}</div>
                  <div className="text-slate-600">总价值</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button onClick={() => setShowShareModal(false)} className="modern-button-secondary px-6 py-3">{t('share.cancel')}</button>
                <button onClick={handleShareWebsite} className="modern-button-primary px-6 py-3">{t('share.shareWebsite')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}