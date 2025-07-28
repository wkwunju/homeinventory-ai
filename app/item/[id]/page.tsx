'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, Trash2, Package } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import AuthGuard from '@/components/auth-guard'

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

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  const { user } = useAuth()

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    category: '',
    expire_date: '',
    value: undefined as number | undefined,
    brand: '',
    purchase_date: '',
    purchase_source: '',
    notes: '',
    condition: '',
    priority: 'normal',
    photo_url: ''
  })

  useEffect(() => {
    if (itemId) {
      fetchItem()
    }
  }, [itemId])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${itemId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API响应错误:', response.status, errorData)
        throw new Error(`获取物品失败: ${response.status} ${errorData.error || ''}`)
      }
      const data = await response.json()
      setItem(data)
      setFormData({
        name: data.name,
        quantity: data.quantity,
        category: data.category || '',
        expire_date: data.expire_date || '',
        value: data.value,
        brand: data.brand || '',
        purchase_date: data.purchase_date || '',
        purchase_source: data.purchase_source || '',
        notes: data.notes || '',
        condition: data.condition || '',
        priority: data.priority || 'normal',
        photo_url: data.photo_url || ''
      })
    } catch (error) {
      console.error('获取物品详情失败:', error)
      alert(`获取物品详情失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        throw new Error('更新失败')
      }
      alert('物品更新成功！')
      router.push('/')
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个物品吗？')) return
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('删除失败')
      }
      alert('物品删除成功！')
      router.push('/')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 先显示本地预览
      const reader = new FileReader()
      reader.onload = (e) => {
        handleChange('photo_url', e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // 然后尝试上传到服务器
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          handleChange('photo_url', data.url)
        } else {
          console.log('服务器上传失败，使用本地预览')
        }
      } catch (error) {
        console.error('上传图片失败:', error)
      }
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
          <div className="text-lg text-gray-400">加载中...</div>
        </div>
      </AuthGuard>
    )
  }

  if (!item) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
          <div className="text-lg text-gray-400">物品不存在</div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">编辑物品</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          </div>

          {/* 表单 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：基本信息 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">基本信息</h2>
                
                {/* 物品名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    物品名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>

                {/* 数量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    数量
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                    className="input w-full"
                    min="1"
                  />
                </div>

                {/* 分类 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">选择分类</option>
                    <option value="食品">食品</option>
                    <option value="日用品">日用品</option>
                    <option value="衣物">衣物</option>
                    <option value="书籍">书籍</option>
                    <option value="电子产品">电子产品</option>
                    <option value="工具">工具</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 过期日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    过期日期
                  </label>
                  <input
                    type="date"
                    value={formData.expire_date}
                    onChange={(e) => handleChange('expire_date', e.target.value)}
                    className="input w-full"
                  />
                </div>

                {/* 价值 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    价值（元）
                  </label>
                  <input
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => handleChange('value', parseFloat(e.target.value) || undefined)}
                    className="input w-full"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* 品牌 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    品牌
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* 右侧：详细信息 */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">详细信息</h2>
                
                {/* 购入日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    购入日期
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleChange('purchase_date', e.target.value)}
                    className="input w-full"
                  />
                </div>

                {/* 购入来源 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    购入来源
                  </label>
                  <select
                    value={formData.purchase_source}
                    onChange={(e) => handleChange('purchase_source', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">选择来源</option>
                    <option value="淘宝">淘宝</option>
                    <option value="京东">京东</option>
                    <option value="实体店">实体店</option>
                    <option value="朋友赠送">朋友赠送</option>
                    <option value="二手购买">二手购买</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 物品状态 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    物品状态
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">选择状态</option>
                    <option value="全新">全新</option>
                    <option value="良好">良好</option>
                    <option value="一般">一般</option>
                    <option value="需要维修">需要维修</option>
                    <option value="损坏">损坏</option>
                  </select>
                </div>

                {/* 优先级 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    优先级
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="input w-full"
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>

                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    物品图片
                  </label>
                  <div className="space-y-3">
                    {formData.photo_url ? (
                      <div className="relative">
                        <img 
                          src={formData.photo_url} 
                          alt="物品图片" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleChange('photo_url', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label 
                          htmlFor="photo-upload"
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">点击上传图片</p>
                              <p className="text-xs text-gray-500">支持 JPG、PNG 格式，最大 5MB</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="input w-full"
                    rows={4}
                    placeholder="添加备注信息..."
                  />
                </div>
              </div>
            </div>

            {/* 物品位置信息 */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">位置信息</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">当前位置</p>
                    <p className="font-medium text-gray-900">{item.spaces.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 