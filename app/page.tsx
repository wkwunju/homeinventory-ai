'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { Plus, Search, Package, Grid3X3, List, Sparkles, Home, MapPin, Image as ImageIcon, Edit3 } from 'lucide-react'
import Link from 'next/link'

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
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'spaces' | 'items'>('items')
  const [spaces, setSpaces] = useState<Space[]>([])
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

  // 获取空间数据
  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/spaces')
      if (response.ok) {
        const data = await response.json()
        const spacesData = data.spaces || []
        setSpaces(spacesData)
        setAllSpaces(spacesData) // 保存所有空间数据
      }
    } catch (error) {
      console.error('获取空间失败:', error)
    }
  }

  // 获取物品数据
  const fetchItems = async (spaceId?: string) => {
    try {
      const params = new URLSearchParams()
      if (spaceId) params.append('space_id', spaceId)

      const response = await fetch(`/api/items?${params}`)
      if (response.ok) {
        const data = await response.json()
        const itemsData = data.items || []
        setItems(itemsData)
        if (!spaceId) {
          setAllItems(itemsData) // 保存所有物品数据
        }
      }
    } catch (error) {
      console.error('获取物品失败:', error)
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
        item.spaces.name.toLowerCase().includes(query.toLowerCase())
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
      <div className="grid gap-5 max-h-[60vh] overflow-y-auto pr-1">
        {items.map(item => (
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
                      <span className="whitespace-normal">位置：{item.spaces.name}</span>
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
                  className="modern-button-ghost inline-flex items-center gap-2 px-3 py-1.5"
                >
                  查看详情
                  <Sparkles className="h-4 w-4" />
                </Link>
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
      await Promise.all([
        fetchSpaces(),
        fetchItems(), // 获取所有物品数据
      ])
      setLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 pb-24">
        <div className="w-full max-w-5xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  家庭储物管理
                </h1>
              </div>
              <p className="text-slate-600 text-lg">欢迎回来，{user?.email}</p>
            </div>
            <div className="h-10" />
          </div>

          {/* 搜索框 */}
          <div className="mb-10">
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-100/50 text-lg"
              />
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="mb-10">
            <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-sm p-1.5 shadow-xl border border-white/40 shadow-sky-100/50">
              <button
                onClick={() => handleTabChange('items')}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'items'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200/50'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
              >
                <Package className="w-6 h-6" />
                {t('home.manageItems')}
              </button>
              <button
                onClick={() => handleTabChange('spaces')}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'spaces'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200/50'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
              >
                <span className="text-2xl">🏠</span>
                {t('home.manageSpaces')}
              </button>
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
                        搜索结果: "{searchQuery}"
                      </h2>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setIsSearching(false)
                          setSearchResults({spaces: [], items: []})
                        }}
                        className="modern-button-secondary inline-flex items-center gap-2 px-5 py-3"
                      >
                        清除搜索
                      </button>
                    </div>
                    
                    {/* 空间搜索结果 */}
                    {searchResults.spaces.length > 0 && (
                      <div className="mb-10">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                          <Home className="h-5 w-5 text-sky-500" />
                          空间 ({searchResults.spaces.length})
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
                          物品 ({searchResults.items.length})
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
                                        <span className="whitespace-normal">位置：{item.spaces.name}</span>
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
                                    className="modern-button-ghost inline-flex items-center gap-2 px-3 py-1.5"
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
                        <h3 className="text-xl font-semibold text-slate-800 mb-3">未找到相关结果</h3>
                        <p className="text-slate-600 text-lg">尝试使用不同的关键词搜索</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // 正常的tab内容
                  activeTab === 'spaces' ? (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                          <Home className="h-6 w-6 text-sky-500" />
                          我的空间
                        </h2>
                        <button onClick={() => setShowAddSpaceModal(true)} className="modern-button-primary inline-flex items-center gap-3 px-6 py-3">
                          <Plus className="w-5 h-5" />
                          添加空间
                        </button>
                      </div>
                      <div className="space-y-5">
                        {spaces.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center mb-6 shadow-lg border border-sky-200/40">
                              <span className="text-5xl">🏠</span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-3">暂无空间</h3>
                            <p className="text-slate-600 mb-8 text-lg">创建你的第一个空间来开始管理</p>
                            <button onClick={() => setShowAddSpaceModal(true)} className="modern-button-primary inline-flex items-center gap-3 px-6 py-3">
                              <Plus className="h-5 w-5" />
                              创建第一个空间
                            </button>
                          </div>
                        ) : (
                          spaces.map(space => renderSpace(space))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                          <Package className="h-6 w-6 text-emerald-500" />
                          我的物品
                        </h2>
                        <button onClick={() => setShowAddItemModal(true)} className="modern-button-primary inline-flex items-center gap-3 px-6 py-3">
                          <Plus className="w-5 h-5" />
                          添加物品
                        </button>
                      </div>
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
            <h3 className="text-xl font-semibold text-slate-800 mb-4">选择添加方式</h3>
            <p className="text-slate-600 mb-6">请选择手动添加或使用 AI 识别添加物品</p>
            <div className="space-y-3">
              <Link href="/upload" className="block">
                <button className="w-full flex items-center gap-3 p-4 border-2 border-sky-300/60 rounded-xl bg-sky-50/60 hover:bg-sky-100/60 transition-all">
                  <ImageIcon className="h-5 w-5 text-sky-600" />
                  AI 识别添加
                </button>
              </Link>
              <Link href="/add" className="block">
                <button className="w-full flex items-center gap-3 p-4 border border-slate-200/60 rounded-xl hover:bg-slate-50/80 transition-all">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddSpaceModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/60 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
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
    </AuthGuard>
  )
} 