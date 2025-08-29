'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Home, Grid3X3, Package, Edit, Trash2, ChevronRight, MapPin, Sparkles, Eye, Image as ImageIcon, Edit3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Space {
  id: string
  name: string
  description?: string
  level: number
  parent_id?: string
  icon?: string
  children?: Space[]
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

export default function SpaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [room, setRoom] = useState<Space | null>(null)
  const [locations, setLocations] = useState<Space[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Space | null>(null)
  const [isLocationDetail, setIsLocationDetail] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)

  const spaceId = params.id as string
  const locationParam = searchParams.get('location')

  // 获取房间信息
  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}`)
      
      if (response.ok) {
        const data = await response.json()
        setRoom(data.room)
        setLocations(data.locations || [])
        
        // 检查是否是位置详情页面
        if (data.room.level === 2) {
          setIsLocationDetail(true)
          setSelectedLocation(data.room)
          const locationItems = await fetchLocationItems(data.room.id)
          setItems(locationItems)
        } else {
          // 如果有location参数，直接获取该位置的物品
          if (locationParam) {
            const targetLocation = data.locations?.find((loc: Space) => loc.id === locationParam)
            if (targetLocation) {
              setSelectedLocation(targetLocation)
              const locationItems = await fetchLocationItems(targetLocation.id)
              setItems(locationItems)
            } else {
              // 如果找不到目标位置，获取房间内所有物品
              await fetchAllRoomItems(data.locations || [])
            }
          } else {
            // 没有location参数，获取房间内的所有物品
            await fetchAllRoomItems(data.locations || [])
          }
        }
      } else {
        const errorData = await response.json()
        console.error('获取房间信息失败:', errorData)
      }
    } catch (error) {
      console.error('获取房间信息失败:', error)
    }
  }

  // 获取房间内的物品
  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/items?space_id=${spaceId}`)
      
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else {
        const errorData = await response.json()
        console.error('获取物品失败:', errorData)
      }
    } catch (error) {
      console.error('获取物品失败:', error)
    }
  }

  // 获取房间内所有物品（包括所有位置的物品）
  const fetchAllRoomItems = async (locationsList: Space[] = []) => {
    try {
      // 获取房间内所有位置的物品
      const allItems: Item[] = []
      
      // 先获取直接属于房间的物品
      const roomResponse = await fetch(`/api/items?space_id=${spaceId}`)
      if (roomResponse.ok) {
        const roomData = await roomResponse.json()
        allItems.push(...(roomData.items || []))
      }
      
      // 再获取所有位置的物品
      const locationsToUse = locationsList.length > 0 ? locationsList : locations
      for (const location of locationsToUse) {
        const locationResponse = await fetch(`/api/items?space_id=${location.id}`)
        if (locationResponse.ok) {
          const locationData = await locationResponse.json()
          allItems.push(...(locationData.items || []))
        }
      }
      
      setItems(allItems)
    } catch (error) {
      console.error('获取房间内所有物品失败:', error)
    }
  }

  // 获取位置内的物品
  const fetchLocationItems = async (locationId: string) => {
    try {
      const response = await fetch(`/api/items?space_id=${locationId}`)
      if (response.ok) {
        const data = await response.json()
        return data.items || []
      }
    } catch (error) {
      console.error('获取位置物品失败:', error)
    }
    return []
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchRoom()
      setLoading(false)
    }

    if (spaceId) {
      loadData()
    }
  }, [spaceId, locationParam])

  const handleLocationClick = async (location: Space) => {
    setSelectedLocation(location)
    const locationItems = await fetchLocationItems(location.id)
    setItems(locationItems)
  }

  const handleBackToRoom = async () => {
    setSelectedLocation(null)
    await fetchAllRoomItems(locations)
  }

  const handleDeleteRoom = async () => {
    if (!confirm('确定要删除这个房间吗？删除后房间内的所有位置和物品也会被删除。')) {
      return
    }

    try {
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('房间删除成功')
        router.push('/')
      } else {
        const errorData = await response.json()
        alert(`删除失败: ${errorData.error}`)
      }
    } catch (error) {
      console.error('删除房间失败:', error)
      alert('删除失败')
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('确定要删除这个位置吗？删除后该位置的所有物品也会被删除。')) {
      return
    }

    try {
      const response = await fetch(`/api/spaces/${locationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 重新加载数据
        await Promise.all([fetchRoom(), fetchAllRoomItems(locations)])
        if (selectedLocation?.id === locationId) {
          setSelectedLocation(null)
        }
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除位置失败:', error)
      alert('删除失败')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('确定要删除这个物品吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (selectedLocation) {
          // 如果选中了位置，重新获取该位置的物品
          const locationItems = await fetchLocationItems(selectedLocation.id)
          setItems(locationItems)
        } else {
          // 如果没有选中位置，获取房间内所有物品
          await fetchAllRoomItems(locations)
        }
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除物品失败:', error)
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen pb-24 bg-white">
          <div className="w-full max-w-4xl mx-auto px-4 pt-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!room) {
    return (
      <AuthGuard>
        <div className="min-h-screen pb-24 bg-white">
          <div className="w-full max-w-4xl mx-auto px-4 pt-8">
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">房间不存在</h2>
              <p className="text-gray-500 mb-6">该房间可能已被删除</p>
              <button
                onClick={() => router.back()}
                className="h-12 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pb-24 bg-white">
        <div className="w-full max-w-4xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="h-12 w-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="text-lg">{selectedLocation ? selectedLocation.icon || '📦' : room.icon || '🏠'}</span>
                <span>{isLocationDetail ? '位置' : '房间'}</span>
                {selectedLocation && !isLocationDetail && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span>{selectedLocation.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-black">
                {selectedLocation ? selectedLocation.name : room.name}
              </h1>
              {(selectedLocation ? selectedLocation.description : room.description) && (
                <p className="text-gray-600 mt-2 text-lg">
                  {selectedLocation ? selectedLocation.description : room.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* 删除房间按钮 - 只在房间页面显示 */}
              {!isLocationDetail && (
                <button
                  onClick={handleDeleteRoom}
                  className="h-12 w-12 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center"
                  title="删除房间"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* 内容区域 */}
          <div className={`${isLocationDetail ? '' : 'lg:flex lg:gap-8'}`}>
            {/* 左侧：位置列表 */}
            {!isLocationDetail && (
              <div className="lg:w-1/3 w-full mb-8 lg:mb-0">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-black">{t('spacesPage.locations')}</h2>
                </div>
                <div>
                  {locations.length === 0 ? (
                    <div className="text-center py-12">
                      <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('spacesPage.noLocations')}</h3>
                      <p className="text-gray-500 mb-6">{t('spacesPage.addFirstLocation')}</p>
                      <Link href={`/spaces/add?room_id=${room.id}&room_name=${encodeURIComponent(room.name)}`}>
                        <button className="h-12 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto">
                          <Plus className="h-4 w-4" />
                          {t('spacesPage.addFirstLocation')}
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {/* 查看所有物品选项 */}
                      <div 
                        className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-sm ${
                          !selectedLocation
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={handleBackToRoom}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-base mb-1 ${!selectedLocation ? 'text-white' : 'text-gray-900'}`}>{t('spacesPage.viewAllItems')}</div>
                              <div className={`text-sm ${!selectedLocation ? 'text-gray-300' : 'text-gray-500'}`}>{t('spacesPage.showAllItems')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {locations.map(location => (
                        <div 
                          key={location.id} 
                          className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-sm ${
                            selectedLocation?.id === location.id
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleLocationClick(location)}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-all duration-300 shrink-0 ${
                                  selectedLocation?.id === location.id
                                    ? 'bg-white'
                                    : 'bg-gray-100'
                                }`}>
                                  {location.icon || '📦'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-semibold text-base mb-1 ${selectedLocation?.id === location.id ? 'text-white' : 'text-gray-900'}`}>{location.name}</div>
                                  {location.description && (
                                    <div className={`text-sm ${selectedLocation?.id === location.id ? 'text-gray-300' : 'text-gray-500'}`}>{location.description}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteLocation(location.id)
                                  }}
                                  className="h-8 w-8 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                                  title="删除位置"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* 添加位置按钮 */}
                      <Link href={`/spaces/add?room_id=${room.id}&room_name=${encodeURIComponent(room.name)}`}>
                        <div className="group relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 cursor-pointer transition-all duration-300 hover:shadow-sm hover:border-black hover:bg-gray-100 mt-4">
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-gray-600 shrink-0">
                                  <Plus className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-base mb-1">{t('spacesPage.addLocation')}</div>
                                  <div className="text-gray-500 text-sm">添加新的位置</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 分隔线 */}
            {!isLocationDetail && (
              <div className="lg:w-px lg:bg-gray-200 lg:mx-0 w-full h-px bg-gray-200 my-6 lg:my-0"></div>
            )}

            {/* 右侧：物品列表 */}
            <div className={`${isLocationDetail ? '' : 'lg:flex-1'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-xl font-semibold text-black">
                  {selectedLocation ? `${selectedLocation.name}的物品` : '房间内所有物品'}
                </h2>
                {selectedLocation && (
                  <button 
                    onClick={() => setShowAddItemModal(true)}
                    className="h-12 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加物品
                  </button>
                )}
              </div>
              <div>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无物品</h3>
                    <p className="text-gray-500 mb-6">
                      {selectedLocation 
                        ? `在"${selectedLocation.name}"中还没有物品` 
                        : '开始添加你的第一个物品吧'
                      }
                    </p>
                    {selectedLocation ? (
                      <button 
                        onClick={() => setShowAddItemModal(true)}
                        className="h-12 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        添加物品
                      </button>
                    ) : (
                      <Link href="/add">
                        <button className="h-12 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto">
                          <Plus className="h-4 w-4" />
                          添加物品
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map(item => (
                      <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-base truncate">{item.name}</span>
                              {item.category && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 shrink-0">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span>数量: {item.quantity}</span>
                              </div>
                              {!selectedLocation && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="truncate">位置: {item.spaces?.name || '未指定'}</span>
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
                          <div className="flex flex-col gap-2 shrink-0">
                            <Link 
                              href={`/item/${item.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                              title="查看详情"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddItemModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/60 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <Link href={`/upload?location_id=${selectedLocation.id}&location_name=${encodeURIComponent(selectedLocation.name)}`} className="block">
                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-black text-white hover:bg-gray-800 transition-all">
                  <ImageIcon className="h-5 w-5 text-white" />
                  AI 识别添加
                </button>
              </Link>
              <Link href={`/add?space_id=${selectedLocation.id}`} className="block">
                <button className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all">
                  <Edit3 className="h-5 w-5 text-gray-600" />
                  手动添加
                </button>
              </Link>
            </div>
            <button onClick={() => setShowAddItemModal(false)} className="mt-6 w-full bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl px-4 py-3 font-medium transition-all">关闭</button>
          </div>
        </div>
      )}
    </AuthGuard>
  )
} 