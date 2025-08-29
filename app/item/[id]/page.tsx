'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, Trash2, Package } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useItemsCache } from '@/lib/items-cache'
import AuthGuard from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
  const { updateItem, removeItem } = useItemsCache()

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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '保存失败')
      }
      const updated = await response.json()
      if (updated?.id) updateItem(updated)
      alert('保存成功')
    } catch (error) {
      alert(error instanceof Error ? error.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除该物品吗？')) return
    try {
      const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
      if (response.ok) {
        alert('删除成功')
        removeItem(itemId)
        router.back()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      alert('删除失败')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      handleChange('photo_url', ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formDataObj })
      if (response.ok) {
        const data = await response.json()
        handleChange('photo_url', data.url)
      }
    } catch (error) {
      console.error('上传图片失败:', error)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen pb-24 flex items-center justify-center">
          <div className="text-lg text-slate-500">加载中...</div>
        </div>
      </AuthGuard>
    )
  }

  if (!item) {
    return (
      <AuthGuard>
        <div className="min-h-screen pb-24 flex items-center justify-center">
          <div className="text-lg text-slate-500">物品不存在</div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pb-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 头部 */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="h-12 w-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-black">编辑物品</h1>
          </div>

          {/* 表单 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧：基本信息 */}
                <div className="space-y-6">
                  <h2 className="font-semibold text-gray-900 mb-4 text-lg">基本信息</h2>

                  <div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="物品名称 *"
                      required
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      value={(formData.quantity as number | '').toString()}
                      onChange={(e) => {
                        const v = e.target.value
                        handleChange('quantity', v === '' ? '' : (parseInt(v) || ''))
                      }}
                      placeholder="数量 *"
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      placeholder="分类 *"
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      value={formData.expire_date}
                      onChange={(e) => handleChange('expire_date', e.target.value)}
                      placeholder="过期日期"
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.value ?? ''}
                      onChange={(e) => handleChange('value', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="价值（元）"
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      placeholder="品牌"
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* 右侧：详细信息 */}
                <div className="space-y-6">
                  <h2 className="font-semibold text-gray-900 mb-4 text-lg">详细信息</h2>

                  <div>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleChange('purchase_date', e.target.value)}
                      placeholder="购入日期"
                      className="h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <select
                      value={formData.purchase_source}
                      onChange={(e) => handleChange('purchase_source', e.target.value)}
                      className="flex h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    >
                      <option value="">购入来源</option>
                      <option value="淘宝">淘宝</option>
                      <option value="京东">京东</option>
                      <option value="实体店">实体店</option>
                      <option value="朋友赠送">朋友赠送</option>
                      <option value="二手购买">二手购买</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleChange('condition', e.target.value)}
                      className="flex h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    >
                      <option value="">物品状态</option>
                      <option value="全新">全新</option>
                      <option value="良好">良好</option>
                      <option value="一般">一般</option>
                      <option value="需要维修">需要维修</option>
                      <option value="损坏">损坏</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="flex h-12 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                    >
                      <option value="low">优先级 - 低</option>
                      <option value="normal">优先级 - 普通</option>
                      <option value="high">优先级 - 高</option>
                      <option value="urgent">优先级 - 紧急</option>
                    </select>
                  </div>

                  {/* 图片上传 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">物品图片</label>
                    <div className="space-y-3">
                      {formData.photo_url ? (
                        <div className="relative">
                          <img src={formData.photo_url} alt="物品图片" className="w-full h-40 object-cover rounded-2xl border border-gray-200" />
                          <button 
                            type="button" 
                            onClick={() => handleChange('photo_url', '')} 
                            className="absolute top-2 right-2 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-black transition-colors">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photo-upload" />
                          <label htmlFor="photo-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">点击上传图片</p>
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
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={4}
                      placeholder="备注"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 物品位置信息 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">位置信息</h3>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">当前位置</p>
                      <p className="font-medium text-gray-900">{item.spaces.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSubmit} 
                    disabled={saving} 
                    className="flex-1 h-12 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="h-12 px-6 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 