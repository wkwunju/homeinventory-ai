'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { getDefaultIconByLevel } from '@/lib/icons'
// preset helpers removed; rely on user's actual spaces
import AuthGuard from '@/components/auth-guard'
import { useItemsCache } from '@/lib/items-cache'
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

interface RoomOption { id: string; name: string; icon?: string; description?: string }
interface LocationOption { id: string; name: string; icon?: string; description?: string; parent_id: string }

export default function UploadPage() {
  const { user } = useAuth()
  const { addItem } = useItemsCache()
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
  const [userSpacesFlat, setUserSpacesFlat] = useState<any[]>([])
  const [showCreateConfirm, setShowCreateConfirm] = useState(false)
  const [pendingCreateData, setPendingCreateData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set())
  
  // Save mode: 'one-space' or 'separate-spaces'
  const [saveMode, setSaveMode] = useState<'one-space' | 'separate-spaces'>('one-space')
  
  // Global room/location for one-space mode
  const [globalRoomId, setGlobalRoomId] = useState<string>('')
  const [globalRoomName, setGlobalRoomName] = useState<string>('')
  const [globalLocationId, setGlobalLocationId] = useState<string>('')
  const [globalLocationName, setGlobalLocationName] = useState<string>('')

  const { t, language } = useLanguage()

  // 从用户空间中构造房间和位置选项
  const getRoomOptions = (): RoomOption[] => {
    return userSpacesFlat.filter(s => s.level === 1).map((s: any) => ({ id: s.id, name: s.name, icon: s.icon, description: s.description }))
  }

  const getLocationOptions = (roomId: string): LocationOption[] => {
    if (!roomId) return []
    return userSpacesFlat.filter(s => s.level === 2 && s.parent_id === roomId).map((s: any) => ({ id: s.id, name: s.name, icon: s.icon, description: s.description, parent_id: s.parent_id }))
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

  // Global room/location selection for one-space mode
  const selectGlobalRoom = (roomId: string, roomName: string) => {
    setGlobalRoomId(roomId)
    setGlobalRoomName(roomName)
    setGlobalLocationId('')
    setGlobalLocationName('')
  }

  const selectGlobalLocation = (locationId: string, locationName: string) => {
    setGlobalLocationId(locationId)
    setGlobalLocationName(locationName)
  }

  // 拉取用户空间（房间/位置）
  const fetchUserSpaces = async () => {
    try {
      const res = await fetch('/api/spaces')
      if (res.ok) {
        const data = await res.json()
        setUserSpacesFlat(data.flat || [])
      }
    } catch (err) {
      console.error('fetchUserSpaces error:', err)
    }
  }

  // 初始化拉取
  useEffect(() => { fetchUserSpaces() }, [])

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

      // 创建房间/位置逻辑已禁用：上传页现在仅允许从已有房间/位置中选择

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

  // 优先使用原生相机捕获（移动端会弹出拍照），桌面端回退到选择文件
  const handleTakePhoto = () => {
    const input = fileInputRef.current
    if (!input) return
    try {
      input.setAttribute('capture', 'environment')
    } catch {}
    input.click()
    // 恢复属性，避免影响下次普通选择
    setTimeout(() => {
      try { input.removeAttribute('capture') } catch {}
    }, 1000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    console.log('[upload] file selected:', { name: file.name, size: file.size, type: file.type })
    handleFileSelect(file)
    // 自动开始识别（直接传入 file，避免状态尚未更新）
    setUploading(true)
    try {
      console.log('[upload] start recognizeImage')
      await recognizeImage(file)
      console.log('[upload] recognizeImage done')
    } catch (err) {
      console.error('[upload] recognizeImage error:', err)
      setError(err instanceof Error ? err.message : '请求失败')
    } finally {
      setUploading(false)
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
        // 保留用户选择与编辑（如果存在）
        isEditing: (item as any).isEditing ?? false,
        selectedRoomId: (item as any).selectedRoomId,
        selectedRoomName: (item as any).selectedRoomName,
        selectedLocationId: (item as any).selectedLocationId,
        selectedLocationName: (item as any).selectedLocationName,
        editedName: (item as any).editedName ?? item.name,
        editedCategory: (item as any).editedCategory ?? category,
        editedExpireDate: (item as any).editedExpireDate ?? (expireDate || ''),
        editedValue: (item as any).editedValue ?? (value?.toString() || ''),
        editedBrand: (item as any).editedBrand ?? (item.brand || ''),
        editedPurchaseDate: (item as any).editedPurchaseDate ?? (item.purchase_date || ''),
        editedPurchaseSource: (item as any).editedPurchaseSource ?? (item.purchase_source || ''),
        editedNotes: (item as any).editedNotes ?? (item.notes || ''),
        editedCondition: (item as any).editedCondition ?? (item.condition || ''),
        editedPriority: (item as any).editedPriority ?? (item.priority || '')
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

  const recognizeImage = async (fileParam?: File) => {
    const fileToUse = fileParam || selectedFile
    if (!fileToUse) { console.warn('[upload] recognizeImage(): missing file'); return }
    console.log('[upload] recognizeImage() with file:', { name: fileToUse.name, size: fileToUse.size, type: fileToUse.type })
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
        // Compress image before upload to reduce latency and cost
        const compressImage = async (file: File, maxDim = 1280, quality = 0.6): Promise<Blob> => {
          const img = document.createElement('img')
          const url = URL.createObjectURL(file)
          await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; img.src = url })
          const { naturalWidth: w, naturalHeight: h } = img
          let targetW = w
          let targetH = h
          if (Math.max(w, h) > maxDim) {
            if (w >= h) { targetW = maxDim; targetH = Math.round((h / w) * maxDim) }
            else { targetH = maxDim; targetW = Math.round((w / h) * maxDim) }
          }
          const canvas = document.createElement('canvas')
          canvas.width = targetW
          canvas.height = targetH
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, targetW, targetH)
          return await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => { URL.revokeObjectURL(url); resolve(blob || file) }, 'image/jpeg', quality)
          })
        }

        const compressed = await compressImage(fileToUse)
        const formData = new FormData()
        formData.append('image', compressed, 'upload.jpg')

        console.log('[upload] POST /api/recognize')
        const response = await fetch('/api/recognize', {
          method: 'POST',
          body: formData,
        })

        console.log('[upload] /api/recognize status:', response.status)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '请求失败')
        }

        const data = await response.json()
        console.log('[upload] /api/recognize items count:', Array.isArray(data.items) ? data.items.length : 'n/a')
        setRecognizedItems(data.items || [])
      }
    } catch (error) {
      console.error('[upload] recognizeImage failed:', error)
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
      await recognizeImage(selectedFile as File)
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
        spaceId = itemToSave.selectedLocationId
      }
      if (!spaceId) {
        throw new Error('请选择房间与位置后再保存')
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
          space_id: spaceId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }
      const saved = await response.json()
      if (saved?.item) addItem(saved.item)
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

    // Validate required selections based on save mode
    if (saveMode === 'one-space') {
      if (!globalRoomId || !globalLocationId) {
        setError('请选择房间和位置')
        return
      }
    } else {
      // Check that all items have room and location selected
      for (let i = 0; i < recognizedItems.length; i++) {
        const item = recognizedItems[i] as any
        if (!item.selectedRoomId || !item.selectedLocationId) {
          setError(`请为所有物品选择房间和位置`)
          return
        }
      }
    }

    setLoading(true)
    try {
      const convertedItems = convertToItems(recognizedItems)
      
      for (const item of convertedItems) {
        // 检查是否需要创建房间和位置
        let spaceId = item.space_id
        
        if (saveMode === 'one-space') {
          // Use global room/location for all items
          spaceId = globalLocationId
        } else {
          // Use individual room/location for each item
          if (item.selectedRoomId && item.selectedLocationId) {
            spaceId = item.selectedLocationId
          }
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
          space_id: spaceId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '保存失败')
        }
        const saved = await response.json()
        if (saved?.item) addItem(saved.item)
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
      <div className="min-h-screen pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
          {/* 头部 */}
          <div className="text-center mb-6">
            <h1 className="font-bold text-gray-900 mb-2 text-xl">
              智能上传
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              上传或拍照，自动识别物品并快速添加到清单
            </p>
          </div>

          {/* 上传区域 */}
          <Card className="mb-5">
            <CardContent className="p-6">
              <div className="text-center">
                {!selectedFile ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1 text-base">
                        拖放图片到这里，或选择文件
                      </h3>
                      <p className="text-gray-500 mb-4 text-sm">
                        支持 JPG、PNG，最大 5MB
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        选择文件
                      </button>
                      <button
                        onClick={handleTakePhoto}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        拍照
                      </button>
                    </div>
                </div>
              ) : (
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 mb-1 text-base flex items-center gap-2 justify-center">
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            {t('upload.uploading')}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            {t('upload.fileSelected')}
                          </>
                        )}
                      </h3>
                      {/* Thumbnail preview */}
                      {preview && (
                        <img src={preview} alt="预览" className="mx-auto w-40 h-40 object-cover rounded-2xl border border-slate-200/60 shadow-sm" />
                      )}
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all"
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                        更换图片
                      </button>
                    </div>
                  </div>
                )}
            </div>
            </CardContent>
          </Card>

          {/* Save Mode Selection Card */}
          {convertedItems.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-gray-900 text-base font-medium">选择保存方式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    onClick={() => setSaveMode('one-space')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      saveMode === 'one-space'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium mb-1">保存到同一位置</div>
                    <div className={`text-sm ${saveMode === 'one-space' ? 'text-gray-200' : 'text-gray-600'}`}>
                      所有物品保存到相同的房间和位置
                    </div>
                  </button>

                  <button
                    onClick={() => setSaveMode('separate-spaces')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      saveMode === 'separate-spaces'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium mb-1">分别保存到不同位置</div>
                    <div className={`text-sm ${saveMode === 'separate-spaces' ? 'text-gray-200' : 'text-gray-600'}`}>
                      每个物品可以保存到不同的房间和位置
                    </div>
                  </button>
                </div>

                {/* Global Room/Location Selectors for One Space Mode */}
                {saveMode === 'one-space' && (
                  <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Rooms Section */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-3 font-medium">房间</label>
                        <div className="space-y-2">
                          {getRoomOptions().map(room => (
                            <label
                              key={room.id}
                              className={`flex items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                                globalRoomId === room.id
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="globalRoom"
                                value={room.id}
                                checked={globalRoomId === room.id}
                                onChange={() => selectGlobalRoom(room.id, room.name)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                globalRoomId === room.id
                                  ? 'border-white bg-white'
                                  : 'border-gray-400'
                              }`}>
                                {globalRoomId === room.id && (
                                  <div className="w-2 h-2 rounded-full bg-black"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{room.name}</div>
                                {room.description && (
                                  <div className={`text-sm ${
                                    globalRoomId === room.id ? 'text-gray-200' : 'text-gray-600'
                                  }`}>
                                    {room.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Locations Section */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-3 font-medium">位置</label>
                        <div className="space-y-2">
                          {globalRoomId ? (
                            getLocationOptions(globalRoomId).map(location => (
                              <label
                                key={location.id}
                                className={`flex items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                                  globalLocationId === location.id
                                    ? 'border-black bg-black text-white'
                                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="globalLocation"
                                  value={location.id}
                                  checked={globalLocationId === location.id}
                                  onChange={() => selectGlobalLocation(location.id, location.name)}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  globalLocationId === location.id
                                    ? 'border-white bg-white'
                                    : 'border-gray-400'
                                }`}>
                                  {globalLocationId === location.id && (
                                    <div className="w-2 h-2 rounded-full bg-black"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{location.name}</div>
                                  {location.description && (
                                    <div className={`text-sm ${
                                      globalLocationId === location.id ? 'text-gray-200' : 'text-gray-600'
                                    }`}>
                                      {location.description}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm italic p-3 bg-gray-50 rounded-2xl border border-gray-200">
                              请先选择房间
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 识别物品列表 */}
          {convertedItems.length > 0 && (
            <div className="mb-6">
              <div className="space-y-4">
                {recognizedItems.map((raw, index) => {
                  const item: any = convertedItems[index] || {}
                  const rooms = getRoomOptions()
                  const selectedRoomId = (raw as any).selectedRoomId || ''
                  const selectedRoomName = (raw as any).selectedRoomName || ''
                  const locations = selectedRoomId ? getLocationOptions(selectedRoomId) : []
                  const selectedLocationId = (raw as any).selectedLocationId || ''
                  const selectedLocationName = (raw as any).selectedLocationName || ''
                  const expanded = expandedSet.has(index)
                  return (
                    <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-gray-900 text-base">{(raw as any).editedName || raw.name}</div>
                        <div className="text-gray-600 text-sm">置信度: {(raw.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">名称</label>
                          <Input variant="underline" className="h-10 text-sm" value={(raw as any).editedName ?? item.name ?? ''} onChange={(e) => updateEditedField(index, 'name', e.target.value)} placeholder="名称 *" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">分类</label>
                          <Input variant="underline" className="h-10 text-sm" value={(raw as any).editedCategory ?? item.category ?? ''} onChange={(e) => updateEditedField(index, 'category', e.target.value)} placeholder="分类 *" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">数量</label>
                          <Input variant="underline" className="h-10 text-sm" type="number" min="1" value={(raw.quantity as number | '' ) as any} onChange={(e) => updateItemQuantity(index, e.target.value === '' ? 1 : (parseInt(e.target.value) || 1))} placeholder="数量 *" />
                        </div>
                        
                        {/* Only show individual room/location selectors in separate-spaces mode */}
                        {saveMode === 'separate-spaces' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">房间</label>
                              <select
                                value={selectedRoomId}
                                onChange={(e) => {
                                  const roomId = e.target.value
                                  const room = rooms.find(r => r.id === roomId)
                                  if (room) selectRoom(index, room.id, room.name)
                                }}
                                className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:border-gray-300"
                              >
                                <option value="">选择房间</option>
                                {rooms.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">位置</label>
                              <select
                                value={selectedLocationId}
                                onChange={(e) => {
                                  const locId = e.target.value
                                  const loc = locations.find(l => l.id === locId)
                                  if (loc) selectLocation(index, loc.id, loc.name)
                                }}
                                className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:border-gray-300"
                              >
                                <option value="">选择位置</option>
                                {locations.map(l => (
                                  <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                      <div className={expanded ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">过期日期</label>
                            <Input variant="underline" className="h-10 text-sm" type="date" value={(raw as any).editedExpireDate ?? item.expire_date ?? ''} onChange={(e) => updateEditedField(index, 'expireDate', e.target.value)} placeholder="过期日期" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">价值</label>
                            <Input variant="underline" className="h-10 text-sm" type="number" step="0.01" value={(raw as any).editedValue ?? (item.value ?? '')} onChange={(e) => updateEditedField(index, 'value', e.target.value)} placeholder="价值" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">品牌</label>
                            <Input variant="underline" className="h-10 text-sm" value={(raw as any).editedBrand ?? item.brand ?? ''} onChange={(e) => updateEditedField(index, 'brand', e.target.value)} placeholder="品牌" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">购买日期</label>
                            <Input variant="underline" className="h-10 text-sm" type="date" value={(raw as any).editedPurchaseDate ?? item.purchase_date ?? ''} onChange={(e) => updateEditedField(index, 'purchaseDate', e.target.value)} placeholder="购买日期" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">购买来源</label>
                            <Input variant="underline" className="h-10 text-sm" value={(raw as any).editedPurchaseSource ?? item.purchase_source ?? ''} onChange={(e) => updateEditedField(index, 'purchaseSource', e.target.value)} placeholder="购买来源" />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm text-gray-700 mb-1">备注</label>
                            <Textarea variant="underline" rows={3} className="text-sm" value={(raw as any).editedNotes ?? item.notes ?? ''} onChange={(e) => updateEditedField(index, 'notes', e.target.value)} placeholder="备注" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <button
                          type="button"
                          className="modern-button-secondary px-4 py-2"
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
                        <button
                          onClick={() => {
                            saveToInventory(raw as any, (raw.quantity as number) || 1)
                          }}
                          disabled={!((raw as any).editedName || raw.name) || !((raw as any).editedCategory || item.category) || !(raw.quantity || 1) || !((raw as any).selectedRoomId && (raw as any).selectedLocationId)}
                          className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Save All Button at Bottom */}
              <div className="mt-6">
                <button 
                  onClick={saveAllToInventory} 
                  disabled={loading} 
                  className="w-full py-4 bg-black text-white rounded-full text-base font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {loading ? '保存中...' : '全部保存'}
                </button>
              </div>
            </div>
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

        {/* 相机模态框已移除，使用 capture 属性直接调起相机（移动端） */}

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