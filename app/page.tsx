'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { Plus, Search, Package, LogOut, Grid3X3, List } from 'lucide-react'
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
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'spaces' | 'items'>('spaces')
  const [spaces, setSpaces] = useState<Space[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<{spaces: Space[], items: Item[]}>({spaces: [], items: []})
  const [isSearching, setIsSearching] = useState(false)
  const [allSpaces, setAllSpaces] = useState<Space[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])

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
          className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
            isRoom 
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300' 
              : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'
          }`}
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-2xl ${
                  isRoom ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {space.icon || '📦'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{space.name}</div>
                  {space.description && (
                    <div className="text-sm text-gray-500">{space.description}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {space.item_count !== undefined && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {space.item_count} 件物品
                  </span>
                )}
                {isRoom ? (
                  <Link 
                    href={`/spaces/${space.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link 
                    href={`/spaces/${space.parent_id}?location=${space.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Grid3X3 className="h-4 w-4" />
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

  // 渲染物品列表
  const renderItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无物品</h3>
          <p className="text-gray-500 mb-6">开始添加你的第一个物品吧</p>
          <Link href="/add" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            添加物品
          </Link>
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-lg hover:border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                    <span>数量: {item.quantity}</span>
                    <span>位置: {item.spaces.name}</span>
                    {item.category && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.expire_date && (
                    <div className="mt-1 text-sm text-gray-500">
                      过期: {new Date(item.expire_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link 
                  href={`/item/${item.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  查看详情
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
      await fetchSpaces()
      await fetchItems() // 获取所有物品数据
      setLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">家庭储物管理</h1>
              <p className="text-gray-600 mt-1">欢迎回来，{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>

          {/* 搜索框 */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="mb-8">
            <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => handleTabChange('spaces')}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'spaces'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">🏠</span>
                {t('home.manageSpaces')}
              </button>
              <button
                onClick={() => handleTabChange('items')}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'items'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                {t('home.manageItems')}
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">{t('common.loading')}</p>
              </div>
            ) : (
              <div className="p-6">
                {isSearching ? (
                  // 搜索结果显示
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        搜索结果: "{searchQuery}"
                      </h2>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setIsSearching(false)
                          setSearchResults({spaces: [], items: []})
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        清除搜索
                      </button>
                    </div>
                    
                    {/* 空间搜索结果 */}
                    {searchResults.spaces.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">空间 ({searchResults.spaces.length})</h3>
                        <div className="space-y-4">
                          {searchResults.spaces.map(space => renderSpace(space))}
                        </div>
                      </div>
                    )}
                    
                    {/* 物品搜索结果 */}
                    {searchResults.items.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">物品 ({searchResults.items.length})</h3>
                        <div className="grid gap-4">
                          {searchResults.items.map(item => (
                            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-lg hover:border-gray-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <Package className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{item.name}</div>
                                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                      <span>数量: {item.quantity}</span>
                                      <span>位置: {item.spaces.name}</span>
                                      {item.category && (
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                    {item.expire_date && (
                                      <div className="mt-1 text-sm text-gray-500">
                                        过期: {new Date(item.expire_date).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Link 
                                    href={`/item/${item.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    查看详情
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
                      <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
                        <p className="text-gray-500">尝试使用不同的关键词搜索</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // 正常的tab内容
                  activeTab === 'spaces' ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">我的空间</h2>
                        <Link 
                          href="/spaces/add" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          添加空间
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {spaces.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <span className="text-4xl">🏠</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无空间</h3>
                            <p className="text-gray-500 mb-6">创建你的第一个空间来开始管理</p>
                            <Link 
                              href="/spaces/add" 
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              创建第一个空间
                            </Link>
                          </div>
                        ) : (
                          spaces.map(space => renderSpace(space))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">我的物品</h2>
                        <Link 
                          href="/add" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          添加物品
                        </Link>
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
    </AuthGuard>
  )
} 