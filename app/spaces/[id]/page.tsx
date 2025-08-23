'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Home, Grid3X3, Package, Edit, Trash2, ChevronRight, MapPin, Sparkles } from 'lucide-react'
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
        <div className="min-h-screen pb-24">
          <div className="w-full max-w-4xl mx-auto px-4 pt-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-slate-500">加载中...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!room) {
    return (
      <AuthGuard>
        <div className="min-h-screen pb-24">
          <div className="w-full max-w-4xl mx-auto px-4 pt-8">
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-slate-800">房间不存在</h2>
              <p className="text-slate-500 mb-6">该房间可能已被删除</p>
              <Button
                onClick={() => router.back()}
                variant="primary"
                size="lg"
              >
                返回
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-5">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="h-12 w-12"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span className="text-lg">{selectedLocation ? selectedLocation.icon || '📦' : room.icon || '🏠'}</span>
                <span>{isLocationDetail ? '位置' : '房间'}</span>
                {selectedLocation && !isLocationDetail && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span>{selectedLocation.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {selectedLocation ? selectedLocation.name : room.name}
              </h1>
              {(selectedLocation ? selectedLocation.description : room.description) && (
                <p className="text-slate-600 mt-2 text-lg">
                  {selectedLocation ? selectedLocation.description : room.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* 删除房间按钮 - 只在房间页面显示 */}
              {!isLocationDetail && (
                <Button
                  onClick={handleDeleteRoom}
                  variant="destructive"
                  size="lg"
                  className="h-12 px-6"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除房间
                </Button>
              )}
            </div>
          </div>

          {/* 内容区域 */}
          <div className={`grid gap-5 grid-cols-1 ${isLocationDetail ? '' : 'lg:grid-cols-3'}`}>
            {/* 左侧：位置列表 */}
            {!isLocationDetail && (
              <Card className="lg:col-span-1 col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">{t('spacesPage.locations')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {locations.length === 0 ? (
                    <div className="text-center py-12">
                      <Grid3X3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">{t('spacesPage.noLocations')}</h3>
                      <p className="text-slate-500 mb-6">{t('spacesPage.addFirstLocation')}</p>
                      <Link href="/spaces/add">
                        <Button variant="primary" size="lg" className="h-12 px-6">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('spacesPage.addFirstLocation')}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* 查看所有物品选项 */}
                      <div 
                        className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          !selectedLocation
                            ? 'border-sky-300 bg-gradient-to-br from-sky-50/80 to-blue-50/80'
                            : 'border-slate-200/60 bg-white/80 backdrop-blur-sm hover:border-slate-300/80 hover:bg-slate-50/80'
                        }`}
                        onClick={handleBackToRoom}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800 text-lg">{t('spacesPage.viewAllItems')}</div>
                                <div className="text-slate-500">{t('spacesPage.showAllItems')}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {locations.map(location => (
                        <div 
                          key={location.id} 
                          className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedLocation?.id === location.id
                              ? 'border-sky-300 bg-gradient-to-br from-sky-50/80 to-blue-50/80'
                              : 'border-slate-200/60 bg-white/80 backdrop-blur-sm hover:border-slate-300/80 hover:bg-slate-50/80'
                          }`}
                          onClick={() => handleLocationClick(location)}
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${
                                  selectedLocation?.id === location.id
                                    ? 'bg-gradient-to-br from-sky-100 to-blue-100'
                                    : 'bg-slate-100'
                                }`}>
                                  {location.icon || '📦'}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800 text-lg">{location.name}</div>
                                  {location.description && (
                                    <div className="text-slate-500">{location.description}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteLocation(location.id)
                                  }}
                                  variant="destructive"
                                  size="sm"
                                  className="h-9 px-3"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  删除
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* 添加位置按钮 */}
                      <Link href="/spaces/add">
                        <div className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-sky-300 hover:bg-sky-50/80">
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600">
                                  <Plus className="h-7 w-7" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-800 text-lg">{t('spacesPage.addLocation')}</div>
                                  <div className="text-slate-500">添加新的位置</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 右侧：物品列表 */}
            <Card className={`${isLocationDetail ? '' : 'lg:col-span-2 col-span-1'}`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-xl text-slate-800">
                    {selectedLocation ? `${selectedLocation.name}的物品` : '房间内所有物品'}
                  </CardTitle>
                  <Link href={selectedLocation ? `/add?space_id=${selectedLocation.id}` : "/add"}>
                    <Button variant="primary" size="lg" className="h-12 px-6">
                      <Plus className="w-4 h-4 mr-2" />
                      添加物品
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">暂无物品</h3>
                    <p className="text-slate-500 mb-6">
                      {selectedLocation 
                        ? `在"${selectedLocation.name}"中还没有物品` 
                        : '开始添加你的第一个物品吧'
                      }
                    </p>
                    <Link href={selectedLocation ? `/add?space_id=${selectedLocation.id}` : "/add"}>
                      <Button variant="primary" size="lg" className="h-12 px-6">
                        <Plus className="h-4 w-4 mr-2" />
                        添加物品
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map(item => (
                      <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-xl hover:border-sky-300/60 hover:-translate-y-1 shadow-lg shadow-slate-100/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800 text-lg mb-2 flex items-center gap-2">
                                <span className="truncate">{item.name}</span>
                                {item.category && (
                                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 text-sm text-slate-600 mb-2 leading-tight">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-sky-500" />
                                  <span>数量：{item.quantity}</span>
                                </div>
                                {!selectedLocation && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-500" />
                                    <span className="whitespace-normal">位置：{item.spaces?.name || '未指定'}</span>
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
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 w-full sm:w-auto mt-2 sm:mt-0">
                            <Link 
                              href={`/item/${item.id}`}
                              className="modern-button-ghost inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 sm:min-w-[120px] whitespace-nowrap shrink-0"
                            >
                              查看详情
                              <Sparkles className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="modern-button-secondary inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 sm:min-w-[100px] whitespace-nowrap shrink-0 text-red-600 hover:bg-red-50"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 