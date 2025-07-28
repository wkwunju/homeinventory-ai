'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { ArrowLeft, Save, Package, ChevronRight, Plus, Trash2 } from 'lucide-react'

interface Space {
  id: string
  name: string
  description?: string
  level: number
  parent_id?: string
  icon?: string
  children?: Space[]
}

interface ItemForm {
  id: string
  name: string
  quantity: number
  category: string
  expire_date: string
  value?: number
  brand?: string
  purchase_date?: string
  purchase_source?: string
  notes?: string
  condition?: string
  priority?: string
  photo_url?: string
}

export default function AddItemPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [flatSpaces, setFlatSpaces] = useState<Space[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Space | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Space | null>(null)
  const [items, setItems] = useState<ItemForm[]>([])
  const [showItemForm, setShowItemForm] = useState(false)

  // 获取空间列表
  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/spaces')
      
      if (response.ok) {
        const data = await response.json()
        setSpaces(data.spaces || [])
        setFlatSpaces(data.flat || [])
      } else {
        console.error('API响应错误:', response.status)
      }
    } catch (error) {
      console.error('获取空间失败:', error)
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [])

  const handleRoomSelect = (room: Space) => {
    setSelectedRoom(room)
    setSelectedLocation(null)
    setItems([])
  }

  const handleLocationSelect = (location: Space) => {
    setSelectedLocation(location)
    setShowItemForm(true)
  }

  const addNewItem = () => {
    const newItem: ItemForm = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      category: '',
      expire_date: '',
      value: undefined,
      brand: '',
      purchase_date: '',
      purchase_source: '',
      notes: '',
      condition: '',
      priority: 'normal',
      photo_url: ''
    }
    setItems([...items, newItem])
  }

  const updateItem = (id: string, field: keyof ItemForm, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLocation) {
      alert(t('add.selectLocationAlert'))
      return
    }

    if (items.length === 0) {
      alert(t('add.addAtLeastOneItem'))
      return
    }

    const validItems = items.filter(item => item.name.trim())
    if (validItems.length === 0) {
      alert(t('add.addValidItem'))
      return
    }

    setLoading(true)
    try {
      // 批量添加物品
      const promises = validItems.map(item => 
        fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: item.name,
            quantity: item.quantity,
            category: item.category || undefined,
            expire_date: item.expire_date || undefined,
            space_id: selectedLocation.id
          }),
        })
      )

      const responses = await Promise.all(promises)
      const errors = responses.filter(response => !response.ok)

      if (errors.length > 0) {
        alert(t('add.addFailed', { count: errors.length }))
      } else {
        alert(t('add.addSuccess', { count: validItems.length }))
        router.push('/')
      }
    } catch (error) {
      console.error('添加物品失败:', error)
      alert(t('add.addError'))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (selectedLocation) {
      setSelectedLocation(null)
      setShowItemForm(false)
    } else if (selectedRoom) {
      setSelectedRoom(null)
    } else {
      router.back()
    }
  }

  // 获取房间列表
  const rooms = spaces.filter(space => space.level === 1)

  // 获取选中房间的位置列表
  const locations = selectedRoom 
    ? flatSpaces.filter(space => space.parent_id === selectedRoom.id && space.level === 2)
    : []

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="icon-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('add.title')}</h1>
              <p className="text-gray-600">
                {!selectedRoom ? t('add.selectRoom') : 
                 !selectedLocation ? t('add.selectLocationForRoom', { room: selectedRoom.name }) :
                 t('add.addItemsToLocation', { location: selectedLocation.name })}
              </p>
            </div>
          </div>

          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
            <span className={!selectedRoom ? 'text-blue-600 font-medium' : ''}>{t('add.selectRoom')}</span>
            {selectedRoom && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className={!selectedLocation ? 'text-blue-600 font-medium' : ''}>{t('add.selectLocation')}</span>
              </>
            )}
            {selectedLocation && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-blue-600 font-medium">{t('add.addItems')}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：空间选择 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">🏠</span>
                  {t('add.spaceSelection')}
                </h2>

                {/* 房间选择 */}
                {!selectedRoom ? (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">{t('add.selectRoom')}</h3>
                    {rooms.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="text-4xl text-gray-300 mx-auto mb-3 block">🏠</span>
                        <p className="text-gray-500 mb-4">{t('add.noRooms')}</p>
                        <button
                          onClick={() => router.push('/spaces/add')}
                          className="main-btn"
                        >
                          {t('add.createFirstRoom')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rooms.map(room => (
                          <button
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className="w-full p-3 border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                                {room.icon || '🏠'}
                              </div>
                              <div>
                                <div className="font-medium">{room.name}</div>
                                {room.description && (
                                  <div className="text-sm text-gray-500">{room.description}</div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 已选房间 */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                          {selectedRoom.icon || '🏠'}
                        </div>
                        <div>
                          <div className="font-medium">{selectedRoom.name}</div>
                          {selectedRoom.description && (
                            <div className="text-sm text-gray-500">{selectedRoom.description}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 位置选择 */}
                    {!selectedLocation ? (
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-700">{t('add.selectLocation')}</h3>
                        {locations.length === 0 ? (
                          <div className="text-center py-6">
                            <span className="text-2xl text-gray-300 mx-auto mb-2 block">📦</span>
                            <p className="text-gray-500 mb-3">{t('add.noLocations')}</p>
                            <button
                              onClick={() => router.push('/spaces/add')}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              {t('add.addLocation')}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {locations.map(location => (
                              <button
                                key={location.id}
                                onClick={() => handleLocationSelect(location)}
                                className="w-full p-3 border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                    {location.icon || '📦'}
                                  </div>
                                  <div>
                                    <div className="font-medium">{location.name}</div>
                                    {location.description && (
                                      <div className="text-sm text-gray-500">{location.description}</div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">
                            {selectedLocation.icon || '📦'}
                          </div>
                          <div>
                            <div className="font-medium">{selectedLocation.name}</div>
                            {selectedLocation.description && (
                              <div className="text-sm text-gray-500">{selectedLocation.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：物品添加 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('add.addItems')}
                </h2>

                {!selectedLocation ? (
                  <div className="text-center py-12">
                    <span className="text-6xl text-gray-300 mx-auto mb-4 block">📦</span>
                    <p className="text-gray-500">
                      {!selectedRoom ? t('add.selectRoomFirst') : t('add.selectLocationFirst')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 物品列表 */}
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">{t('add.itemNumber', { number: index + 1 })}</h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 物品名称 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.itemName')} *
                              </label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                className="input w-full"
                                placeholder={t('add.itemNamePlaceholder')}
                                required
                              />
                            </div>

                            {/* 数量 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.quantity')}
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="input w-full"
                              />
                            </div>

                            {/* 分类 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.category')}
                              </label>
                              <input
                                type="text"
                                value={item.category || ''}
                                onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                                className="input w-full"
                                placeholder={t('add.categoryPlaceholder')}
                              />
                            </div>

                            {/* 过期日期 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.expireDate')}
                              </label>
                              <input
                                type="date"
                                value={item.expire_date || ''}
                                onChange={(e) => updateItem(item.id, 'expire_date', e.target.value)}
                                className="input w-full"
                              />
                            </div>

                            {/* 价值 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.value')}
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.value || ''}
                                onChange={(e) => updateItem(item.id, 'value', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="input w-full"
                                placeholder={t('add.valuePlaceholder')}
                              />
                            </div>

                            {/* 品牌 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.brand')}
                              </label>
                              <input
                                type="text"
                                value={item.brand || ''}
                                onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                                className="input w-full"
                                placeholder={t('add.brandPlaceholder')}
                              />
                            </div>

                            {/* 购买日期 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.purchaseDate')}
                              </label>
                              <input
                                type="date"
                                value={item.purchase_date || ''}
                                onChange={(e) => updateItem(item.id, 'purchase_date', e.target.value)}
                                className="input w-full"
                              />
                            </div>

                            {/* 购买来源 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.purchaseSource')}
                              </label>
                              <input
                                type="text"
                                value={item.purchase_source || ''}
                                onChange={(e) => updateItem(item.id, 'purchase_source', e.target.value)}
                                className="input w-full"
                                placeholder={t('add.purchaseSourcePlaceholder')}
                              />
                            </div>

                            {/* 状态 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.condition')}
                              </label>
                              <select
                                value={item.condition || ''}
                                onChange={(e) => updateItem(item.id, 'condition', e.target.value)}
                                className="input w-full"
                              >
                                <option value="">{t('add.selectCondition')}</option>
                                <option value="new">{t('add.conditionNew')}</option>
                                <option value="like-new">{t('add.conditionLikeNew')}</option>
                                <option value="good">{t('add.conditionGood')}</option>
                                <option value="fair">{t('add.conditionFair')}</option>
                                <option value="poor">{t('add.conditionPoor')}</option>
                              </select>
                            </div>

                            {/* 优先级 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.priority')}
                              </label>
                              <select
                                value={item.priority || 'normal'}
                                onChange={(e) => updateItem(item.id, 'priority', e.target.value)}
                                className="input w-full"
                              >
                                <option value="low">{t('add.priorityLow')}</option>
                                <option value="normal">{t('add.priorityNormal')}</option>
                                <option value="high">{t('add.priorityHigh')}</option>
                                <option value="urgent">{t('add.priorityUrgent')}</option>
                              </select>
                            </div>

                            {/* 备注 */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('add.notes')}
                              </label>
                              <textarea
                                value={item.notes || ''}
                                onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                                className="input w-full"
                                rows={3}
                                placeholder={t('add.notesPlaceholder')}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 添加更多物品按钮 */}
                    <button
                      onClick={addNewItem}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      {t('add.addMoreItems')}
                    </button>

                    {/* 提交按钮 */}
                    <button
                      onClick={handleSubmit}
                      disabled={loading || items.length === 0}
                      className="main-btn w-full"
                    >
                      {loading ? t('common.loading') : t('add.addItemsCount', { count: items.length })}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 