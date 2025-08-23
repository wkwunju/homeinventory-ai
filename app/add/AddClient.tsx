'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { useItemsCache } from '@/lib/items-cache'
import { ArrowLeft, Save, Package, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
  quantity: number | ''
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

export default function AddItemClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const { addItem } = useItemsCache()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [flatSpaces, setFlatSpaces] = useState<Space[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Space | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Space | null>(null)
  const [items, setItems] = useState<ItemForm[]>([])
  const [showItemForm, setShowItemForm] = useState(false)

  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/spaces')
      if (response.ok) {
        const data = await response.json()
        setSpaces(data.spaces || [])
        setFlatSpaces(data.flat || [])
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
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)))
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
      const responses = await Promise.all(
        validItems.map(item =>
          fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: item.name,
              quantity: item.quantity,
              category: item.category || undefined,
              expire_date: item.expire_date || undefined,
              space_id: selectedLocation.id,
            }),
          })
        )
      )
      // Update cache for successful creates
      const results = await Promise.all(responses.map(r => r.ok ? r.json() : null))
      results.forEach((res) => {
        if (res?.item) addItem(res.item)
      })
      const errors = responses.filter(r => !r.ok)
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

  const rooms = spaces.filter(space => space.level === 1)
  const locations = selectedRoom ? flatSpaces.filter(space => space.parent_id === selectedRoom.id && space.level === 2) : []

  return (
    <AuthGuard>
      <div className="min-h-screen pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 pt-8">
          <div className="flex items-center gap-4 mb-5">
            <Button onClick={handleBack} variant="ghost" size="icon" className="h-12 w-12">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t('add.title')}
              </h1>
              <p className="text-slate-600 text-lg mt-2">
                {!selectedRoom
                  ? t('add.selectRoom')
                  : !selectedLocation
                  ? t('add.selectLocationForRoom', { room: selectedRoom.name })
                  : t('add.addItemsToLocation', { location: selectedLocation.name })}
              </p>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-5 text-sm text-slate-500">
            <span className={`${!selectedRoom ? 'text-sky-600 font-medium' : ''}`}>{t('add.selectRoom')}</span>
            {selectedRoom && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className={`${!selectedLocation ? 'text-sky-600 font-medium' : ''}`}>{t('add.selectLocation')}</span>
              </>
            )}
            {selectedLocation && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-sky-600 font-medium">{t('add.addItems')}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Space Selection */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <span className="text-2xl">🏠</span>
                    {t('add.spaceSelection')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedRoom ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-700 text-lg">{t('add.selectRoom')}</h3>
                      {rooms.length === 0 ? (
                        <div className="text-center py-8">
                          <span className="text-4xl text-slate-300 mx-auto mb-3 block">🏠</span>
                          <p className="text-slate-500 mb-4">{t('add.noRooms')}</p>
                          <Button onClick={() => router.push('/spaces/add')} variant="primary" className="w-full">
                            {t('add.createFirstRoom')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {rooms.map(room => (
                            <button
                              key={room.id}
                              onClick={() => handleRoomSelect(room)}
                              className="w-full p-4 border border-slate-200/60 rounded-2xl text-left hover:border-sky-300/80 hover:bg-sky-50/80 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center text-lg shadow-md border border-sky-200/40">
                                  {room.icon || '🏠'}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800">{room.name}</div>
                                  {room.description && <div className="text-sm text-slate-600 mt-1">{room.description}</div>}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-sky-50/80 to-blue-50/80 border border-sky-200/60 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center text-lg shadow-md border border-sky-200/40">
                            {selectedRoom.icon || '🏠'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{selectedRoom.name}</div>
                            {selectedRoom.description && <div className="text-sm text-slate-600 mt-1">{selectedRoom.description}</div>}
                          </div>
                        </div>
                      </div>

                      {!selectedLocation ? (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-slate-700 text-lg">{t('add.selectLocation')}</h3>
                          {locations.length === 0 ? (
                            <div className="text-center py-6">
                              <span className="text-2xl text-slate-300 mx-auto mb-2 block">📦</span>
                              <p className="text-slate-500 mb-3">{t('add.noLocations')}</p>
                              <Button onClick={() => router.push('/spaces/add')} variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700">
                                {t('add.addLocation')}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {locations.map(location => (
                                <button
                                  key={location.id}
                                  onClick={() => handleLocationSelect(location)}
                                  className="w-full p-4 border border-slate-200/60 rounded-2xl text-left hover:border-sky-300/80 hover:bg-slate-50/80 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl flex items-center justify-center text-lg shadow-md border border-slate-200/40">
                                      {location.icon || '📦'}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-800">{location.name}</div>
                                      {location.description && <div className="text-sm text-slate-600 mt-1">{location.description}</div>}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-200/60 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-lg shadow-md border border-emerald-200/40">
                              {selectedLocation.icon || '📦'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{selectedLocation.name}</div>
                              {selectedLocation.description && <div className="text-sm text-slate-600 mt-1">{selectedLocation.description}</div>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Package className="w-6 h-6" />
                    {t('add.addItems')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedLocation ? (
                    <div className="text-center py-16">
                      <span className="text-6xl text-slate-300 mx-auto mb-4 block">📦</span>
                      <p className="text-slate-500 text-lg">{!selectedRoom ? t('add.selectRoomFirst') : t('add.selectLocationFirst')}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-6">
                        {items.map((item, index) => (
                          <Card key={item.id} className="border-slate-200/60">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg text-slate-800">{t('add.itemNumber', { number: index + 1 })}</h3>
                                <Button onClick={() => removeItem(item.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50/80">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <Input variant="underline" type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder={`${t('add.itemName')} *`} required />
                                </div>
                                <div>
                                  <Input
                                    variant="underline"
                                    type="number"
                                    min="1"
                                    value={item.quantity === '' ? '' : item.quantity}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      updateItem(item.id, 'quantity', v === '' ? '' : (parseInt(v) || ''))
                                    }}
                                    placeholder={`${t('add.quantity')} *`}
                                  />
                                </div>
                                <div>
                                  <Input variant="underline" type="text" value={item.category || ''} onChange={(e) => updateItem(item.id, 'category', e.target.value)} placeholder={`${t('add.category')} *`} />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">{t('add.expireDate')}</div>
                                  <Input variant="underline" type="date" value={item.expire_date || ''} onChange={(e) => updateItem(item.id, 'expire_date', e.target.value)} placeholder={t('add.expireDate')} />
                                </div>
                                <div>
                                  <Input variant="underline" type="number" step="0.01" value={item.value || ''} onChange={(e) => updateItem(item.id, 'value', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder={t('add.value')} />
                                </div>
                                <div>
                                  <Input variant="underline" type="text" value={item.brand || ''} onChange={(e) => updateItem(item.id, 'brand', e.target.value)} placeholder={t('add.brand')} />
                                </div>
                                <div>
                                  <Input variant="underline" type="date" value={item.purchase_date || ''} onChange={(e) => updateItem(item.id, 'purchase_date', e.target.value)} placeholder={t('add.purchaseDate')} />
                                </div>
                                <div>
                                  <Input variant="underline" type="text" value={item.purchase_source || ''} onChange={(e) => updateItem(item.id, 'purchase_source', e.target.value)} placeholder={t('add.purchaseSource')} />
                                </div>
                                <div>
                                  <select value={item.condition || ''} onChange={(e) => updateItem(item.id, 'condition', e.target.value)} className="flex h-11 w-full bg-transparent border-0 border-b border-[#eaeaea] rounded-none px-0 py-3 text-[14px] focus:outline-none">
                                    <option value="">{t('add.condition')}</option>
                                    <option value="new">{t('add.conditionNew')}</option>
                                    <option value="like-new">{t('add.conditionLikeNew')}</option>
                                    <option value="good">{t('add.conditionGood')}</option>
                                    <option value="fair">{t('add.conditionFair')}</option>
                                    <option value="poor">{t('add.conditionPoor')}</option>
                                  </select>
                                </div>
                                <div>
                                  <select value={item.priority || 'normal'} onChange={(e) => updateItem(item.id, 'priority', e.target.value)} className="flex h-11 w-full bg-transparent border-0 border-b border-[#eaeaea] rounded-none px-0 py-3 text-[14px] focus:outline-none">
                                    <option value="low">{t('add.priority')} - {t('add.priorityLow')}</option>
                                    <option value="normal">{t('add.priority')} - {t('add.priorityNormal')}</option>
                                    <option value="high">{t('add.priority')} - {t('add.priorityHigh')}</option>
                                    <option value="urgent">{t('add.priority')} - {t('add.priorityUrgent')}</option>
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <Textarea variant="underline" value={item.notes || ''} onChange={(e) => updateItem(item.id, 'notes', e.target.value)} rows={3} placeholder={t('add.notes')} />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Button onClick={addNewItem} variant="outline" className="w-full p-6 border-2 border-dashed border-slate-300/60 rounded-2xl text-slate-500 hover:border-sky-300/80 hover:text-sky-600 transition-all duration-300 flex items-center justify-center gap-3 h-16">
                        <Plus className="w-6 h-6" />
                        {t('add.addMoreItems')}
                      </Button>

                      <Button onClick={handleSubmit} disabled={loading || items.length === 0} variant="primary" size="lg" className="w-full h-16 text-lg">
                        {loading ? t('common.loading') : t('add.addItemsCount', { count: items.length })}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}


