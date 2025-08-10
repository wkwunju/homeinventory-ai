'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Home, Grid3X3, Package, Edit, Trash2, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 pb-24">
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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 pb-24">
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-8">
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
          <div className={`grid gap-8 ${isLocationDetail ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* 左侧：位置列表 */}
            {!isLocationDetail && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-slate-800">位置列表</CardTitle>
                    <Link href="/spaces/add">
                      <Button variant="primary" size="lg" className="h-12 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        添加位置
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {locations.length === 0 ? (
                    <div className="text-center py-12">
                      <Grid3X3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 mb-2">暂无位置</h3>
                      <p className="text-slate-500 mb-6">为这个房间添加具体位置来开始管理物品</p>
                      <Link href="/spaces/add">
                        <Button variant="primary" size="lg" className="h-12 px-6">
                          <Plus className="h-4 w-4 mr-2" />
                          添加第一个位置
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                                !selectedLocation
                                  ? 'bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Package className="h-7 w-7" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800 text-lg">查看所有物品</div>
                                <div className="text-slate-500">显示房间内所有位置的物品</div>
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
                                <Link 
                                  href={`/add?space_id=${location.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button variant="outline" size="sm" className="h-9 px-3">
                                    <Plus className="h-4 w-4 mr-1" />
                                    添加物品
                                  </Button>
                                </Link>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 右侧：物品列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
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
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-slate-300/80 hover:bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex-shrink-0">
                              {item.photo_url ? (
                                <img 
                                  src={item.photo_url} 
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-2xl"
                                />
                              ) : (
                                <Package className="h-7 w-7 text-sky-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-800 text-lg truncate">{item.name}</div>
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="font-medium">数量:</span>
                                  <span className="bg-slate-100 px-2 py-1 rounded-lg">{item.quantity}</span>
                                </div>
                                {!selectedLocation && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">位置:</span>
                                    <span className="text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">{item.spaces.name}</span>
                                  </div>
                                )}
                                {item.category && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600 font-medium">分类:</span>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
                                      {item.category}
                                    </span>
                                  </div>
                                )}
                                {item.expire_date && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">过期:</span>
                                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">{new Date(item.expire_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {item.value && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">价值:</span>
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">¥{item.value}</span>
                                  </div>
                                )}
                                {item.brand && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">品牌:</span>
                                    <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{item.brand}</span>
                                  </div>
                                )}
                                {item.condition && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">状态:</span>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                      item.condition === '全新' ? 'bg-emerald-100 text-emerald-800' :
                                      item.condition === '良好' ? 'bg-sky-100 text-sky-800' :
                                      item.condition === '一般' ? 'bg-yellow-100 text-yellow-800' :
                                      item.condition === '需要维修' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {item.condition}
                                    </span>
                                  </div>
                                )}
                                {item.priority && item.priority !== 'normal' && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">优先级:</span>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                      item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                      item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                      'bg-sky-100 text-sky-800'
                                    }`}>
                                      {item.priority === 'urgent' ? '紧急' :
                                       item.priority === 'high' ? '高' :
                                       item.priority === 'low' ? '低' : '普通'}
                                    </span>
                                  </div>
                                )}
                                {item.notes && (
                                  <div className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="font-medium mt-0.5">备注:</span>
                                    <span className="text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">{item.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4">
                            <Link href={`/item/${item.id}`}>
                              <Button variant="outline" size="sm" className="h-9 px-3">
                                <Edit className="h-4 w-4 mr-1" />
                                编辑
                              </Button>
                            </Link>
                            <Button
                              onClick={() => handleDeleteItem(item.id)}
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