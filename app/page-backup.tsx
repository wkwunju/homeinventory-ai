'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { useItemsCache } from '@/lib/items-cache'
import AuthGuard from '@/components/auth-guard'
import { Card, CardContent } from '@/components/ui/card'
import { Package, MapPin, Plus, Search, Share2, X, ExternalLink, Copy } from 'lucide-react'
import Link from 'next/link'

interface Item {
  id: string
  name: string
  quantity: number
  category?: string
  space_id?: string
  spaces?: { name: string }
  expire_date?: string
  value?: number
}

interface Space {
  id: string
  name: string
  level: number
  parent_id?: string
  children?: Space[]
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
  const [showShareModal, setShowShareModal] = useState(false)

  // Fetch functions
  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/spaces')
      if (response.ok) {
        const data = await response.json()
        const spacesData = data.spaces || []
        setSpaces(spacesData)
        setAllSpaces(spacesData)
        const flat = data.flat || []
        const roomNum = Array.isArray(flat) ? flat.filter((s: any) => s.level === 1).length : 0
        setRoomsCount(roomNum)
      }
    } catch (error) {
      console.error('获取空间失败:', error)
    }
  }

  const fetchItems = async (spaceId?: string) => {
    if (!spaceId) {
      setItems(cachedItems as unknown as Item[])
      setAllItems(cachedItems as unknown as Item[])
      refresh().catch(() => {})
    } else {
      try {
        const params = new URLSearchParams()
        params.append('space_id', spaceId)
        const response = await fetch(`/api/items?${params}`)
        if (response.ok) {
          const data = await response.json()
          setItems(data.items || [])
        }
      } catch (error) {
        console.error('获取物品失败:', error)
      }
    }
  }

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      setIsSearching(true)
      const filteredSpaces = allSpaces.filter(space =>
        space.name.toLowerCase().includes(query.toLowerCase())
      )
      const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
      )
      setSearchResults({ spaces: filteredSpaces, items: filteredItems })
    } else {
      setIsSearching(false)
      setSearchResults({ spaces: [], items: [] })
    }
  }

  const handleTabChange = (tab: 'spaces' | 'items') => {
    setActiveTab(tab)
    if (tab === 'items') {
      setItems(allItems)
    } else if (tab === 'spaces') {
      setSelectedSpaceId(null)
    }
  }

  const handleDeleteHomeItem = async (id: string) => {
    if (!confirm(t('common.delete') + '?')) return
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      removeItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      setAllItems((prev) => prev.filter((i) => i.id !== id))
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleShareSummary = async () => {
    console.log('Share summary clicked')
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

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchSpaces()
      await fetchItems()
      setLoading(false)
    }
    if (loaded) {
      loadData()
    }
  }, [loaded])

  useEffect(() => {
    if (!selectedSpaceId) {
      setItems(cachedItems as unknown as Item[])
    } else {
      const filtered = (cachedItems as unknown as Item[]).filter(it => it.space_id === selectedSpaceId)
      setItems(filtered)
    }
  }, [cachedItems, selectedSpaceId])

  // Computed values
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

  // Render functions
  const renderSpace = (space: Space, level: number = 0) => {
    const isRoom = space.level === 1
    const hasChildren = space.children && space.children.length > 0
    const itemCount = locationItemCounts[space.id] || 0

    return (
      <div key={space.id} className="space-y-3">
        <div className="group relative overflow-hidden rounded-3xl border bg-blue-50 border-blue-200 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <h3 className="font-semibold text-slate-800">{space.name}</h3>
                {itemCount > 0 && (
                  <p className="text-sm text-slate-600">{itemCount} 件物品</p>
                )}
              </div>
            </div>
            <Link href={`/spaces/${space.id}`} className="modern-button-ghost">
              查看详情
            </Link>
          </div>
        </div>
        {hasChildren && (
          <div className="ml-6">
            {space.children?.map(child => renderSpace(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center mb-6 shadow-lg border border-sky-200/40">
            <Package className="h-14 w-14 text-sky-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">暂无物品</h3>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="modern-button-primary"
          >
            添加第一个物品
          </button>
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-blue-50 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-xl hover:border-sky-300/60 hover:-translate-y-1 shadow-lg shadow-slate-100/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 text-lg truncate">{item.name}</span>
                    {item.category && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 leading-tight">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-sky-500" />
                      <span>数量：{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="whitespace-normal">位置：{item.spaces?.name || '未指定'}</span>
                    </div>
                  </div>
                  {item.expire_date && (
                    <div className="flex items-center gap-1 text-sm text-amber-600 mt-1">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      过期: {new Date(item.expire_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link 
                  href={`/item/${item.id}`}
                  className="modern-button-ghost inline-flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                >
                  查看详情
                </Link>
                <button
                  onClick={() => handleDeleteHomeItem(item.id)}
                  className="modern-button-ghost text-red-600 hover:text-red-700 px-3 py-2"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pb-24">
        <div className="w-full max-w-5xl mx-auto px-4 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t('home.welcome')} {user?.user_metadata?.name || user?.email}
              </h1>
              <p className="text-slate-600 mt-1">{t('home.subtitle')}</p>
            </div>
            <button
              onClick={handleOpenShareModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
              {t('home.share')}
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-900">{totalItems}</div>
                <div className="text-sm text-slate-600">{t('home.totalItems')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-900">{roomsCount}</div>
                <div className="text-sm text-slate-600">{t('home.totalSpaces')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-600">{expiringSoon}</div>
                <div className="text-sm text-slate-600">{t('home.expiringSoon')}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
                <div className="text-sm text-slate-600">{t('home.expired')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex gap-3 overflow-x-auto">
              <button
                onClick={() => handleTabChange('items')}
                className={`px-6 py-2.5 font-medium transition-all duration-200 rounded-full whitespace-nowrap ${
                  activeTab === 'items'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('home.myItems')}
              </button>
              <button
                onClick={() => handleTabChange('spaces')}
                className={`px-6 py-2.5 font-medium transition-all duration-200 rounded-full whitespace-nowrap ${
                  activeTab === 'spaces'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('home.mySpaces')}
              </button>
            </div>

            <button
              onClick={() => activeTab === 'items' ? setShowAddItemModal(true) : setShowAddSpaceModal(true)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-6"></div>
                <p className="text-slate-600 text-lg">{t('common.loading')}</p>
              </div>
            ) : isSearching ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">搜索结果</h3>
                {searchResults.items.length === 0 && searchResults.spaces.length === 0 ? (
                  <p className="text-slate-600">未找到相关结果</p>
                ) : (
                  <div className="space-y-6">
                    {searchResults.items.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">物品</h4>
                        <div className="grid gap-4">
                          {searchResults.items.map(item => (
                            <div key={item.id} className="p-4 border rounded-xl">
                              <h5 className="font-medium">{item.name}</h5>
                              <p className="text-sm text-slate-600">数量: {item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {searchResults.spaces.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">空间</h4>
                        <div className="grid gap-4">
                          {searchResults.spaces.map(space => (
                            <div key={space.id} className="p-4 border rounded-xl">
                              <h5 className="font-medium">{space.name}</h5>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                {activeTab === 'items' ? renderItems() : (
                  <div className="space-y-4">
                    {spaces.map(space => renderSpace(space))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">分享</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleShareSummary}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">分享统计图片</div>
                  <div className="text-sm text-gray-600">生成物品统计图片</div>
                </div>
              </button>
              <button
                onClick={handleShareWebsite}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">分享网站</div>
                  <div className="text-sm text-gray-600">分享应用链接</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
