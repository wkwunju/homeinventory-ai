'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { getPresetRooms } from '@/lib/preset-rooms'
import { getPresetLocationsByRoomType } from '@/lib/preset-locations'
import { getDefaultIconByLevel } from '@/lib/icons'
import AuthGuard from '@/components/auth-guard'
import { Upload, Camera, Image, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface RecognizedItem {
  name: string
  confidence: number
  bbox?: number[]
  type?: 'label' | 'text'
  // 与数据库items表完全一致的字段
  quantity?: number
  category?: string
  expire_date?: string
  value?: number
  brand?: string
  purchase_date?: string
  purchase_source?: string
  notes?: string
  condition?: string
  priority?: string
  // 额外识别信息（用于智能建议，不保存到数据库）
  suggestedLocation?: string
  needsExpiryDate?: boolean
  expiryDateHint?: string
  unit?: string
  size?: string
  color?: string
}

interface ConvertedItem extends RecognizedItem {
  category: string
  space_id?: string // 存储位置ID，需要用户选择
  quantity: number
  // 编辑状态
  isEditing?: boolean
  // 用户选择的房间和位置
  selectedRoomId?: string
  selectedRoomName?: string
  selectedLocationId?: string
  selectedLocationName?: string
  // 用户输入的其他字段
  editedName?: string
  editedCategory?: string
  editedExpireDate?: string
  editedValue?: string
  editedBrand?: string
  editedPurchaseDate?: string
  editedPurchaseSource?: string
  editedNotes?: string
  editedCondition?: string
  editedPriority?: string
}

interface RoomOption {
  id: string
  name: string
  icon: string
  description: string
}

interface LocationOption {
  id: string
  name: string
  icon: string
  description: string
  roomType: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 默认使用真实识别接口；如需本地演示可设置 NEXT_PUBLIC_USE_MOCK=true
  const [useMockData, setUseMockData] = useState<boolean>(() => {
    return process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  })
  const [showConfidence, setShowConfidence] = useState(false)
  
  // 新增状态
  const [showRoomSelector, setShowRoomSelector] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [currentEditingItemIndex, setCurrentEditingItemIndex] = useState<number | -1>(-1)
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([])
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<string>('')
  const [showCreateConfirm, setShowCreateConfirm] = useState(false)
  const [pendingCreateData, setPendingCreateData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set())

  const { t, language } = useLanguage()

  // 获取预设房间和位置选项
  const getRoomOptions = (): RoomOption[] => {
    return getPresetRooms(language).map(room => ({
      id: room.id,
      name: room.name,
      icon: room.icon,
      description: room.description
    }))
  }

  const getLocationOptions = (roomType: string): LocationOption[] => {
    return getPresetLocationsByRoomType(roomType, language).map(location => ({
      id: location.id,
      name: location.name,
      icon: location.icon,
      description: location.description,
      roomType: roomType
    }))
  }

  // 编辑相关函数
  const startEditing = (index: number) => {
    setCurrentEditingItemIndex(index)
    setRecognizedItems(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            isEditing: true,
            editedName: item.name,
            editedCategory: item.category || '',
            editedExpireDate: item.expire_date || '',
            editedValue: item.value?.toString() || '',
            editedBrand: item.brand || '',
            editedPurchaseDate: item.purchase_date || '',
            editedPurchaseSource: item.purchase_source || '',
            editedNotes: item.notes || '',
            editedCondition: item.condition || '',
            editedPriority: item.priority || ''
          }
        : item
    ))
  }

  const cancelEditing = (index: number) => {
    setCurrentEditingItemIndex(-1)
    setRecognizedItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, isEditing: false }
        : item
    ))
  }

  const updateEditedField = (index: number, field: string, value: string) => {
    setRecognizedItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, [`edited${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }
        : item
    ))
  }

  const selectRoom = (index: number, roomId: string, roomName: string) => {
    setRecognizedItems(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            selectedRoomId: roomId,
            selectedRoomName: roomName,
            selectedLocationId: undefined,
            selectedLocationName: undefined
          }
        : item
    ))
    setShowRoomSelector(false)
    setSelectedRoomType(roomName)
  }

  const selectLocation = (index: number, locationId: string, locationName: string) => {
    setRecognizedItems(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            selectedLocationId: locationId,
            selectedLocationName: locationName
          }
        : item
    ))
    setShowLocationSelector(false)
  }

  // 创建房间和位置
  const createRoom = async (roomData: { name: string; icon: string; description: string }) => {
    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomData.name,
          description: roomData.description,
          icon: roomData.icon,
          level: 1,
          parent_id: null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建房间失败')
      }

      const result = await response.json()
      return result.space
    } catch (error) {
      throw error
    }
  }

  const createLocation = async (locationData: { name: string; icon: string; description: string; parent_id: string }) => {
    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: locationData.name,
          description: locationData.description,
          icon: locationData.icon,
          level: 2,
          parent_id: locationData.parent_id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建位置失败')
      }

      const result = await response.json()
      return result.space
    } catch (error) {
      throw error
    }
  }

  // 确认创建房间和位置
  const handleConfirmCreate = async () => {
    if (!pendingCreateData) return

    setLoading(true)
    try {
      const { item, quantity, needsRoomCreation, needsLocationCreation } = pendingCreateData
      let spaceId = item.space_id

      // 创建房间（如果需要）
      if (needsRoomCreation && item.selectedRoomName) {
        const roomIcon = getDefaultIconByLevel(1, item.selectedRoomName)
        const createdRoom = await createRoom({
          name: item.selectedRoomName,
          icon: roomIcon,
          description: `${item.selectedRoomName}房间`
        })
        spaceId = createdRoom.id
      }

      // 创建位置（如果需要）
      if (needsLocationCreation && item.selectedLocationName && spaceId) {
        const locationIcon = getDefaultIconByLevel(2, item.selectedLocationName)
        const createdLocation = await createLocation({
          name: item.selectedLocationName,
          icon: locationIcon,
          description: `${item.selectedLocationName}位置`,
          parent_id: spaceId
        })
        spaceId = createdLocation.id
      }

      // 保存物品
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          quantity: quantity,
          category: item.category,
          expire_date: item.expire_date,
          value: item.value,
          brand: item.brand,
          purchase_date: item.purchase_date,
          purchase_source: item.purchase_source,
          notes: item.notes,
          condition: item.condition,
          priority: item.priority,
          space_id: spaceId || 'default-space-id',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      // 从列表中移除已保存的物品
      setRecognizedItems(prev => prev.filter(i => i.name !== item.name))
      
      // 关闭确认对话框
      setShowCreateConfirm(false)
      setPendingCreateData(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建房间/位置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCreate = () => {
    setShowCreateConfirm(false)
    setPendingCreateData(null)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setRecognizedItems([])
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
      // 自动开始识别
      setUploading(true)
      try {
        await recognizeImage()
      } finally {
        setUploading(false)
      }
    }
  }

  // 检测数量（从文字识别中提取数字）
  const detectQuantity = (text: string): number => {
    const numbers = text.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      const num = parseInt(numbers[0])
      return num > 0 && num <= 100 ? num : 1
    }
    return 1
  }

  // 将识别结果转换为物品列表
  const convertToItems = (recognizedItems: RecognizedItem[]): ConvertedItem[] => {
    return recognizedItems.map(item => {
      // 智能分类逻辑
      let category = item.category || '其他'
      
      // 根据名称和描述智能分类
      const name = item.name.toLowerCase()
      const notes = (item.notes || '').toLowerCase()
      
      if (name.includes('食品') || name.includes('食物') || name.includes('零食') || name.includes('饮料') || 
          notes.includes('食品') || notes.includes('食物') || notes.includes('零食') || notes.includes('饮料')) {
        category = '食品饮料'
      } else if (name.includes('药品') || name.includes('药') || name.includes('胶囊') || name.includes('片') ||
                 notes.includes('药品') || notes.includes('药') || notes.includes('胶囊') || notes.includes('片')) {
        category = '药品'
      } else if (name.includes('衣物') || name.includes('衣服') || name.includes('裤子') || name.includes('鞋子') ||
                 notes.includes('衣物') || notes.includes('衣服') || notes.includes('裤子') || notes.includes('鞋子')) {
        category = '衣物'
      } else if (name.includes('电子') || name.includes('手机') || name.includes('电脑') || name.includes('充电器') ||
                 notes.includes('电子') || notes.includes('手机') || notes.includes('电脑') || notes.includes('充电器')) {
        category = '电子产品'
      } else if (name.includes('书籍') || name.includes('书') || name.includes('杂志') || name.includes('报纸') ||
                 notes.includes('书籍') || notes.includes('书') || notes.includes('杂志') || notes.includes('报纸')) {
        category = '书籍'
      } else if (name.includes('工具') || name.includes('螺丝刀') || name.includes('锤子') || name.includes('钳子') ||
                 notes.includes('工具') || notes.includes('螺丝刀') || notes.includes('锤子') || notes.includes('钳子')) {
        category = '工具'
      } else if (name.includes('清洁') || name.includes('洗') || name.includes('刷') || name.includes('抹布') ||
                 notes.includes('清洁') || notes.includes('洗') || notes.includes('刷') || notes.includes('抹布')) {
        category = '清洁用品'
      } else if (name.includes('装饰') || name.includes('画') || name.includes('花瓶') || name.includes('相框') ||
                 notes.includes('装饰') || notes.includes('画') || notes.includes('花瓶') || notes.includes('相框')) {
        category = '装饰品'
      }

      // 智能过期日期检测
      let expireDate = item.expire_date
      if (!expireDate && item.needsExpiryDate) {
        // 根据提示设置默认过期日期（比如3个月后）
        const defaultExpiry = new Date()
        defaultExpiry.setMonth(defaultExpiry.getMonth() + 3)
        expireDate = defaultExpiry.toISOString().split('T')[0]
      }

      // 智能价值评估
      let value = item.value
      if (!value) {
        // 根据分类和名称智能评估价值
        if (category === '电子产品') {
          value = Math.floor(Math.random() * 5000) + 1000 // 1000-6000
        } else if (category === '衣物') {
          value = Math.floor(Math.random() * 500) + 100 // 100-600
        } else if (category === '食品饮料') {
          value = Math.floor(Math.random() * 100) + 10 // 10-110
        } else if (category === '药品') {
          value = Math.floor(Math.random() * 200) + 20 // 20-220
        } else {
          value = Math.floor(Math.random() * 300) + 50 // 50-350
        }
      }

      return {
        ...item,
        category,
        expire_date: expireDate,
        value,
        quantity: item.quantity || 1,
        // 初始化编辑状态
        isEditing: false,
        selectedRoomId: undefined,
        selectedRoomName: undefined,
        selectedLocationId: undefined,
        selectedLocationName: undefined,
        editedName: item.name,
        editedCategory: category,
        editedExpireDate: expireDate || '',
        editedValue: value?.toString() || '',
        editedBrand: item.brand || '',
        editedPurchaseDate: item.purchase_date || '',
        editedPurchaseSource: item.purchase_source || '',
        editedNotes: item.notes || '',
        editedCondition: item.condition || '',
        editedPriority: item.priority || ''
      }
    })
  }

  // 更新物品数量
  const updateItemQuantity = (index: number, newQuantity: number) => {
    const convertedItems = convertToItems(recognizedItems)
    convertedItems[index].quantity = Math.max(1, Math.min(100, newQuantity))
    
    // 更新原始识别结果（保持原始数据不变，只更新显示）
    setRecognizedItems(prev => {
      const newItems = [...prev]
      // 这里我们保持原始数据，数量在转换时处理
      return newItems
    })
  }

  const recognizeImage = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)

    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockItems: RecognizedItem[] = [
          { 
            name: '红富士苹果', 
            confidence: 0.92, 
            type: 'label',
            quantity: 6,
            category: '食品',
            expire_date: undefined,
            value: 24.00,
            brand: '农夫山泉',
            purchase_date: undefined,
            purchase_source: undefined,
            notes: '新鲜红富士苹果，脆甜多汁，中号，红色',
            condition: 'new',
            priority: 'normal',
            suggestedLocation: '冰箱冷藏室',
            needsExpiryDate: true,
            expiryDateHint: '苹果通常可保存7-14天',
            unit: '个',
            size: '中号',
            color: '红色'
          },
          { 
            name: '蒙牛纯牛奶', 
            confidence: 0.87, 
            type: 'text',
            quantity: 2,
            category: '食品',
            expire_date: undefined,
            value: 15.00,
            brand: '蒙牛',
            purchase_date: undefined,
            purchase_source: undefined,
            notes: '250ml 纯牛奶，纸盒包装，需要冷藏保存，开封后24小时内饮用',
            condition: 'new',
            priority: 'normal',
            suggestedLocation: '冰箱冷藏室',
            needsExpiryDate: true,
            expiryDateHint: '牛奶通常保质期7-14天',
            unit: '盒',
            size: '250ml',
            color: '白色'
          },
          { 
            name: '全麦面包', 
            confidence: 0.78, 
            type: 'label',
            quantity: 1,
            category: '食品',
            expire_date: undefined,
            value: 8.50,
            brand: '桃李',
            purchase_date: undefined,
            purchase_source: undefined,
            notes: '全麦面包，营养丰富，400g，避免阳光直射，保持干燥',
            condition: 'new',
            priority: 'normal',
            suggestedLocation: '厨房面包盒',
            needsExpiryDate: true,
            expiryDateHint: '面包通常保质期3-5天',
            unit: '包',
            size: '400g',
            color: '棕色'
          }
        ]
        setRecognizedItems(mockItems)
      } else {
        const formData = new FormData()
        formData.append('image', selectedFile)

        const response = await fetch('/api/recognize', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '请求失败')
        }

        const data = await response.json()
        setRecognizedItems(data.items || [])
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  // 触发识别上传流程（用于“立即上传”按钮）
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请先选择图片')
      return
    }
    setUploading(true)
    try {
      await recognizeImage()
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const saveToInventory = async (item: RecognizedItem, quantity: number) => {
    if (!user) {
      setError('请先登录')
      return
    }

    try {
      const convertedItems = convertToItems([item])
      const itemToSave = convertedItems[0]
      
      // 检查是否需要创建房间和位置
      let spaceId = itemToSave.space_id
      
      if (itemToSave.selectedRoomId && itemToSave.selectedLocationId) {
        // 用户已选择房间和位置，检查是否需要创建
        const needsRoomCreation = !itemToSave.selectedRoomId.startsWith('preset-')
        const needsLocationCreation = !itemToSave.selectedLocationId.startsWith('preset-')
        
        if (needsRoomCreation || needsLocationCreation) {
          // 显示确认对话框
          setPendingCreateData({
            item: itemToSave,
            quantity,
            needsRoomCreation,
            needsLocationCreation
          })
          setShowCreateConfirm(true)
          return
        }
        
        // 使用预设的房间和位置ID
        spaceId = itemToSave.selectedLocationId
      }
      
      // 保存物品
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: itemToSave.name,
          quantity: quantity,
          category: itemToSave.category,
          expire_date: itemToSave.expire_date,
          value: itemToSave.value,
          brand: itemToSave.brand,
          purchase_date: itemToSave.purchase_date,
          purchase_source: itemToSave.purchase_source,
          notes: itemToSave.notes,
          condition: itemToSave.condition,
          priority: itemToSave.priority,
          space_id: spaceId || 'default-space-id',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      setRecognizedItems(prev => prev.filter(i => i.name !== item.name))
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存失败')
    }
  }

  const saveAllToInventory = async () => {
    if (!user) {
      setError('请先登录')
      return
    }

    setLoading(true)
    try {
      const convertedItems = convertToItems(recognizedItems)
      
      for (const item of convertedItems) {
        // 检查是否需要创建房间和位置
        let spaceId = item.space_id
        
        if (item.selectedRoomId && item.selectedLocationId) {
          // 用户已选择房间和位置，检查是否需要创建
          const needsRoomCreation = !item.selectedRoomId.startsWith('preset-')
          const needsLocationCreation = !item.selectedLocationId.startsWith('preset-')
          
          if (needsRoomCreation || needsLocationCreation) {
            // 显示确认对话框
            setPendingCreateData({
              item,
              quantity: item.quantity,
              needsRoomCreation,
              needsLocationCreation
            })
            setShowCreateConfirm(true)
            setLoading(false)
            return
          }
          
          // 使用预设的房间和位置ID
          spaceId = item.selectedLocationId
        }
        
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            expire_date: item.expire_date,
            value: item.value,
            brand: item.brand,
            purchase_date: item.purchase_date,
            purchase_source: item.purchase_source,
            notes: item.notes,
            condition: item.condition,
            priority: item.priority,
            space_id: spaceId || 'default-space-id',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '保存失败')
        }
      }
      
      setRecognizedItems([])
    } catch (error) {
      setError(error instanceof Error ? error.message : '批量保存失败')
    } finally {
      setLoading(false)
    }
  }

  const convertedItems = convertToItems(recognizedItems)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <h1 className="font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2 text-[20pt]">
              {t('upload.title')}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-[14pt]">
              {t('upload.description')}
            </p>
          </div>

          {/* 上传区域 */}
          <Card className="mb-8 text-[14pt]">
            <CardContent className="p-6">
              <div className="text-center">
                {!selectedFile ? (
                  <div className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-sky-600" />
                </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2 text-[14pt]">
                        {t('upload.dragAndDrop')}
                      </h3>
                      <p className="text-slate-600 mb-6 text-[14pt]">
                        {t('upload.supportedFormats')}
                      </p>
              </div>
              
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                    onClick={() => fileInputRef.current?.click()} 
                        variant="primary"
                        size="lg"
                        className="h-14 px-8 text-lg"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        {t('upload.selectFile')}
                      </Button>
                      <Button
                        onClick={() => setShowCamera(true)}
                        variant="outline"
                        size="lg"
                        className="h-14 px-8 text-lg"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        {t('upload.takePhoto')}
                      </Button>
                    </div>
                </div>
              ) : (
                  <div className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2 text-[14pt]">
                        {t('upload.fileSelected')}
                      </h3>
                      <p className="text-slate-600 text-[14pt]">{selectedFile.name}</p>
                  </div>
                  
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={() => setSelectedFile(null)}
                        variant="outline"
                        size="lg"
                        className="h-14 px-8 text-lg"
                      >
                        <X className="w-5 h-5 mr-2" />
                        {t('upload.changeFile')}
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        variant="primary"
                        size="lg"
                        className="h-14 px-8 text-lg"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t('upload.uploading')}
                      </>
                    ) : (
                      <>
                            <Upload className="w-5 h-5 mr-2" />
                            {t('upload.uploadNow')}
                      </>
                    )}
                      </Button>
              </div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>

          {/* 识别结果 */}
          {convertedItems.length > 0 && (
            <Card className="mb-6 text-[14px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800 text-[14px] font-semibold">识别结果</CardTitle>
                  <Button onClick={saveAllToInventory} disabled={loading} variant="primary">全部保存</Button>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {recognizedItems.map((raw, index) => {
                  const item: any = convertedItems[index] || {}
                  const rooms = getRoomOptions()
                  const selectedRoomName = (raw as any).selectedRoomName || ''
                  const locations = selectedRoomName ? getLocationOptions(selectedRoomName) : []
                  const selectedLocationName = (raw as any).selectedLocationName || ''
                  const expanded = expandedSet.has(index)
                  return (
                    <div key={index} className="p-4 border border-slate-200/60 rounded-2xl bg-white/80 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-slate-800 text-[14px]">{(raw as any).editedName || raw.name}</div>
                        <div className="text-slate-500 text-xs">置信度: {(raw.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">名称</label>
                          <Input className="h-9 text-sm" value={(raw as any).editedName ?? item.name ?? ''} onChange={(e) => updateEditedField(index, 'name', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">分类</label>
                          <Input className="h-9 text-sm" value={(raw as any).editedCategory ?? item.category ?? ''} onChange={(e) => updateEditedField(index, 'category', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">数量</label>
                          <Input className="h-9 text-sm" type="number" min="1" value={raw.quantity || 1} onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)} />
                        </div>
                      </div>
                      <div className={expanded ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">过期日期</label>
                            <Input className="h-9 text-sm" type="date" value={(raw as any).editedExpireDate ?? item.expire_date ?? ''} onChange={(e) => updateEditedField(index, 'expireDate', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">价值</label>
                            <Input className="h-9 text-sm" type="number" step="0.01" value={(raw as any).editedValue ?? (item.value ?? '')} onChange={(e) => updateEditedField(index, 'value', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">品牌</label>
                            <Input className="h-9 text-sm" value={(raw as any).editedBrand ?? item.brand ?? ''} onChange={(e) => updateEditedField(index, 'brand', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">购买日期</label>
                            <Input className="h-9 text-sm" type="date" value={(raw as any).editedPurchaseDate ?? item.purchase_date ?? ''} onChange={(e) => updateEditedField(index, 'purchaseDate', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">购买来源</label>
                            <Input className="h-9 text-sm" value={(raw as any).editedPurchaseSource ?? item.purchase_source ?? ''} onChange={(e) => updateEditedField(index, 'purchaseSource', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">备注</label>
                            <Textarea rows={2} className="text-sm" value={(raw as any).editedNotes ?? item.notes ?? ''} onChange={(e) => updateEditedField(index, 'notes', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">房间</label>
                            <select
                              value={selectedRoomName}
                              onChange={(e) => {
                                const roomName = e.target.value
                                const room = rooms.find(r => r.name === roomName)
                                selectRoom(index, room ? `preset-${room.id}` : roomName, roomName)
                              }}
                              className="flex h-9 w-full rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm px-3 py-2 text-sm shadow-sm hover:border-slate-300/60 hover:shadow-md"
                            >
                              <option value="">选择房间</option>
                              {rooms.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                              ))}
                              <option value="__create_room__">+ 新建房间…</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">位置</label>
                            <select
                              value={selectedLocationName}
                              onChange={(e) => {
                                const locName = e.target.value
                                if (locName === '__create_location__') return
                                const loc = locations.find(l => l.name === locName)
                                if (loc) selectLocation(index, `preset-${loc.id}`, loc.name)
                              }}
                              className="flex h-9 w-full rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm px-3 py-2 text-sm shadow-sm hover:border-slate-300/60 hover:shadow-md"
                            >
                              <option value="">选择位置</option>
                              {locations.map(l => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                              ))}
                              <option value="__create_location__">+ 新建位置…</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="modern-button-secondary px-3 py-1.5"
                          onClick={() => {
                            setExpandedSet((prev: Set<number>) => {
                              const n = new Set(prev)
                              if (n.has(index)) n.delete(index); else n.add(index)
                              return n
                            })
                          }}
                        >
                          {expanded ? '收起更多' : '展开更多'}
                        </button>
                        <Button
                          onClick={() => saveToInventory(raw as any, (raw.quantity as number) || 1)}
                          variant="primary"
                          disabled={!((raw as any).editedName || raw.name) || !((raw as any).editedCategory || item.category) || !(raw.quantity || 1) || !((raw as any).selectedRoomName && (raw as any).selectedLocationName)}
                        >
                          保存
                        </Button>
                      </div>
                          </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                <Image className="w-6 h-6 text-sky-600" />
                {t('upload.howItWorks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-sky-700">1</span>
                              </div>
                              <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{t('upload.step1Title')}</h4>
                  <p className="text-slate-600 text-sm">{t('upload.step1Description')}</p>
                              </div>
                            </div>
                            
              <div className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-sky-700">2</span>
                                </div>
                              <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{t('upload.step2Title')}</h4>
                  <p className="text-slate-600 text-sm">{t('upload.step2Description')}</p>
                              </div>
                                </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-2xl">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-sky-700">3</span>
                              </div>
                              <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{t('upload.step3Title')}</h4>
                  <p className="text-slate-600 text-sm">{t('upload.step3Description')}</p>
                      </div>
                    </div>
            </CardContent>
          </Card>
                      </div>
                      
        {/* 隐藏的文件输入 */}
                                <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 相机模态框 */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="text-center space-y-6">
                <h3 className="text-xl font-semibold text-slate-800">
                  {t('upload.cameraNotSupported')}
                </h3>
                <p className="text-slate-600">
                  {t('upload.cameraNotSupportedDescription')}
                </p>
                <Button
                  onClick={() => setShowCamera(false)}
                  variant="primary"
                  size="lg"
                  className="w-full h-14 text-lg"
                >
                  {t('common.understand')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 shadow-lg z-50">
                <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
} 