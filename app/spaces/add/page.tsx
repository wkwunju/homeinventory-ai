'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import AuthGuard from '@/components/auth-guard'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import IconSelector from '@/components/icon-selector'
import { getPresetLocationsByRoomType, getPresetLocationById } from '@/lib/preset-locations'
import { getPresetRooms, getPresetRoomById } from '@/lib/preset-rooms'

interface Space {
  id: string
  name: string
  description?: string
  level: number
  parent_id?: string
  icon?: string
  children?: Space[]
}

// 常见房间类型 - 支持中英文
const getCommonRooms = (language: 'zh' | 'en') => {
  return getPresetRooms(language)
}

// 常见家具/电器类型 - 支持中英文
// 使用新的预设位置系统
const getCommonFurniture = (language: 'zh' | 'en') => {
  const roomTypeMap = {
    zh: {
      '客厅': '客厅',
      '卧室': '卧室', 
      '厨房': '厨房',
      '卫生间': '卫生间',
      '书房': '书房',
      '阳台': '阳台',
      '储物间': '储物间',
      '衣帽间': '衣帽间'
    },
    en: {
      'Living Room': '客厅',
      'Bedroom': '卧室',
      'Kitchen': '厨房', 
      'Bathroom': '卫生间',
      'Study': '书房',
      'Balcony': '阳台',
      'Storage Room': '储物间',
      'Closet': '衣帽间'
    }
  }
  
  const roomTypes = roomTypeMap[language]
  const result: Record<string, Array<{ id: string; name: string; icon: string; description: string }>> = {}
  
  Object.entries(roomTypes).forEach(([roomName, roomType]) => {
    result[roomName] = getPresetLocationsByRoomType(roomType, language)
  })
  
  return result
}

export default function AddSpacePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [step, setStep] = useState<'room' | 'furniture'>('room')
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string; originalName?: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    level: 1,
    icon: '📦',
    preset_id: '' as string | undefined
  })
  const [showIconSelector, setShowIconSelector] = useState(false)

  // 获取常见房间和家具类型（根据当前语言）
  const commonRooms = getCommonRooms(language)
  const commonFurniture = getCommonFurniture(language)

  // 获取现有空间列表
  const fetchSpaces = async () => {
    try {
      const response = await fetch('/api/spaces')
      if (response.ok) {
        const data = await response.json()
        setSpaces(data.flat || [])
      }
    } catch (error) {
      console.error('获取空间失败:', error)
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [])

  const handleRoomSelect = (roomId: string) => {
    console.log('选择房间ID:', roomId)
    // 找到对应的房间信息
    const roomInfo = commonRooms.find((room: any) => room.id === roomId)
    console.log('房间信息:', roomInfo)
    
    if (!roomInfo) return
    
    // 查找是否已存在该房间
    const existingRoom = spaces.find(space => space.name === roomInfo.name && space.level === 1)
    
    if (existingRoom) {
      // 如果房间已存在，使用现有房间
      setSelectedRoom({ id: existingRoom.id, name: existingRoom.name, originalName: roomInfo.name })
      setStep('furniture')
    } else {
      // 如果房间不存在，先设置表单数据，然后创建房间
      setFormData(prev => ({
        ...prev,
        name: roomInfo.name,
        level: 1,
        parent_id: '',
        icon: roomInfo.icon,
        preset_id: roomId
      }))
      // 延迟一点执行，确保formData已经更新
      setTimeout(() => {
        handleCreateRoom(roomInfo.name, roomId)
      }, 0)
    }
  }

  const handleFurnitureSelect = (furnitureId: string) => {
    console.log('选择家具ID:', furnitureId)
    // 找到对应的家具信息，包括图标 - 使用 originalName 或 name
    const roomName = selectedRoom?.originalName || selectedRoom?.name
    console.log('房间名称:', roomName)
    console.log('commonFurniture keys:', Object.keys(commonFurniture))
    console.log('commonFurniture for room:', commonFurniture[roomName as keyof typeof commonFurniture])
    
    const furnitureInfo = selectedRoom && commonFurniture[roomName as keyof typeof commonFurniture]?.find(
      (furniture: any) => furniture.id === furnitureId
    )
    console.log('家具信息:', furnitureInfo)
    
    if (furnitureInfo) {
      // 设置表单数据，包括图标
      setFormData(prev => ({
        ...prev,
        name: furnitureInfo.name,
        level: 2,
        parent_id: selectedRoom!.id,
        icon: furnitureInfo.icon,
        preset_id: furnitureId // 保存预设ID
      }))
      console.log('设置家具表单数据，preset_id:', furnitureId)
    } else {
      console.log('未找到家具信息')
    }
    // 不立即创建，让用户确认后再创建
  }

  const handleCreateRoom = async (roomName: string, presetId?: string) => {
    setLoading(true)
    try {
      // 如果有预设ID，使用预设的图标
      let iconToUse = formData.icon || '📦'
      let preset_id = presetId || formData.preset_id
      
      if (preset_id) {
        const presetInfo = getPresetRoomById(preset_id, language)
        if (presetInfo) {
          iconToUse = presetInfo.icon
        }
      }
      
      console.log('创建房间:', {
        name: roomName,
        description: formData.description,
        level: 1,
        icon: iconToUse,
        preset_id: preset_id
      })
      
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          description: formData.description,
          level: 1,
          icon: iconToUse,
          preset_id: preset_id
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newRoom = result.space // 从响应中提取 space 对象
        // 使用原始房间名称来确保预设位置能正确加载
        console.log('查找房间信息，presetId:', presetId)
        console.log('commonRooms:', commonRooms)
        const roomInfo = commonRooms.find((room: any) => room.id === presetId)
        console.log('找到的房间信息:', roomInfo)
        setSelectedRoom({ 
          id: newRoom.id, 
          name: newRoom.name, 
          originalName: roomInfo?.name || newRoom.name 
        })
        console.log('设置的selectedRoom:', { 
          id: newRoom.id, 
          name: newRoom.name, 
          originalName: roomInfo?.name || newRoom.name 
        })
        setStep('furniture')
        // 重置表单数据，为位置创建做准备
        setFormData({
          name: '',
          description: '',
          parent_id: '',
          level: 2,
          icon: '📦',
          preset_id: ''
        })
        fetchSpaces() // 刷新空间列表
      } else {
        const error = await response.json()
        alert(`创建房间失败: ${error.message}`)
      }
    } catch (error) {
      console.error('创建房间失败:', error)
      alert('创建房间失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFurniture = async (furnitureName: string) => {
    setLoading(true)
    try {
      // 如果有预设ID，使用预设的图标
      let iconToUse = formData.icon || '📦'
      
      if (formData.preset_id) {
        const presetInfo = getPresetLocationById(formData.preset_id, language)
        if (presetInfo) {
          iconToUse = presetInfo.icon
        }
      }
      
      console.log('创建位置:', {
        name: furnitureName,
        description: formData.description,
        level: 2,
        parent_id: selectedRoom!.id,
        icon: iconToUse,
        preset_id: formData.preset_id
      })
      
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: furnitureName,
          description: formData.description,
          level: 2,
          parent_id: selectedRoom!.id,
          icon: iconToUse,
          preset_id: formData.preset_id
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('创建位置成功:', result)
        alert('创建位置成功')
        router.push('/')
      } else {
        const error = await response.json()
        console.error('创建位置失败:', error)
        alert(`创建位置失败: ${error.message}`)
      }
    } catch (error) {
      console.error('创建位置失败:', error)
      alert('创建位置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 'room') {
      console.log('提交房间创建，preset_id:', formData.preset_id)
      handleCreateRoom(formData.name, formData.preset_id)
    } else {
      // 确保有选中的房间
      if (!selectedRoom) {
        alert('请先选择房间')
        return
      }
      console.log('提交位置创建，preset_id:', formData.preset_id)
      // 使用表单中的名称创建位置
      handleCreateFurniture(formData.name)
    }
  }

  const handleBack = () => {
    if (step === 'furniture') {
      setStep('room')
      setSelectedRoom(null)
    } else {
      router.back()
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="icon-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('spaces.addTitle')}</h1>
              <p className="text-gray-600">
                {step === 'room' ? t('spaces.selectOrCreateRoom') : t('spaces.addLocationForRoom', { room: selectedRoom?.name })}
              </p>
            </div>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center gap-2 ${step === 'room' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'room' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span>{t('spaces.selectRoom')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${step === 'furniture' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'furniture' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span>{t('spaces.selectLocation')}</span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {step === 'room' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('spaces.selectRoom')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {commonRooms.map(room => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => handleRoomSelect(room.id)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          formData.preset_id === room.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{room.icon}</div>
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm text-gray-500">{room.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{t('spaces.createCustomRoom')}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="custom-room" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('spaces.roomName')}
                      </label>
                      <input
                        type="text"
                        id="custom-room"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="input w-full"
                        placeholder={t('spaces.roomNamePlaceholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('spaces.roomIcon')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowIconSelector(true)}
                        className="w-full p-4 border border-gray-300 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{formData.icon}</div>
                          <div>
                            <div className="font-medium">{t('spaces.selectIcon')}</div>
                            <div className="text-sm text-gray-500">{t('spaces.clickToSelectIcon')}</div>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div>
                      <label htmlFor="custom-description" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('spaces.description')} ({t('common.optional')})
                      </label>
                      <textarea
                        id="custom-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="input w-full"
                        rows={2}
                        placeholder={t('spaces.roomDescriptionPlaceholder')}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !formData.name.trim()}
                      className="main-btn w-full"
                    >
                      {loading ? t('common.loading') : t('spaces.createRoom')}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('spaces.selectLocationForRoom', { room: selectedRoom?.originalName || selectedRoom?.name })}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRoom && commonFurniture[selectedRoom.originalName || selectedRoom.name as keyof typeof commonFurniture]?.map((furniture: any) => (
                      <button
                        key={furniture.id}
                        type="button"
                        onClick={() => handleFurnitureSelect(furniture.id)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          formData.preset_id === furniture.id 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{furniture.icon}</div>
                        <div className="font-medium">{furniture.name}</div>
                        <div className="text-sm text-gray-500">{furniture.description}</div>
                      </button>
                    ))}
                    {selectedRoom && !commonFurniture[selectedRoom.originalName || selectedRoom.name as keyof typeof commonFurniture] && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <p>该房间类型暂无预设位置选项</p>
                        <p className="text-sm mt-2">请使用下方自定义位置功能</p>
                      </div>
                    )}
                  </div>
                  

                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{t('spaces.createCustomLocation')}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="custom-furniture" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('spaces.locationName')}
                      </label>
                      <input
                        type="text"
                        id="custom-furniture"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="input w-full"
                        placeholder={t('spaces.locationNamePlaceholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('spaces.locationIcon')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowIconSelector(true)}
                        className="w-full p-4 border border-gray-300 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{formData.icon}</div>
                          <div>
                            <div className="font-medium">{t('spaces.selectIcon')}</div>
                            <div className="text-sm text-gray-500">{t('spaces.clickToSelectIcon')}</div>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div>
                      <label htmlFor="custom-furniture-description" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('spaces.description')} ({t('common.optional')})
                      </label>
                      <textarea
                        id="custom-furniture-description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="input w-full"
                        rows={2}
                        placeholder={t('spaces.locationDescriptionPlaceholder')}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !formData.name.trim()}
                      className="main-btn w-full"
                    >
                      {loading ? t('common.loading') : `${t('spaces.createLocation')} (${formData.name || 'undefined'})`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图标选择器 */}
      {showIconSelector && (
        <IconSelector
          selectedIcon={formData.icon}
          onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
          onClose={() => setShowIconSelector(false)}
        />
      )}
    </AuthGuard>
  )
} 