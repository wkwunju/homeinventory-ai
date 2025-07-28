'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, Check, X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import AuthGuard from '@/components/auth-guard'

interface RecognizedItem {
  name: string
  confidence: number
  bbox?: number[]
}

export default function UploadPage() {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showConfidence, setShowConfidence] = useState(false)
  const [useMockData, setUseMockData] = useState(true) // 默认使用模拟数据
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const recognizeImage = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)

    try {
      if (useMockData) {
        // 使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟延迟
        const mockItems: RecognizedItem[] = [
          { name: '苹果', confidence: 0.92 },
          { name: '牛奶', confidence: 0.87 },
          { name: '面包', confidence: 0.78 },
          { name: '鸡蛋', confidence: 0.85 },
          { name: '香蕉', confidence: 0.91 }
        ]
        setRecognizedItems(mockItems)
      } else {
        // 使用真实 API
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
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const saveToInventory = async (item: RecognizedItem) => {
    if (!user) {
      setError('请先登录')
      return
    }

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          quantity: 1,
          category: '食品',
          location: '厨房',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      // 从列表中移除已保存的项目
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
      for (const item of recognizedItems) {
        await saveToInventory(item)
      }
      setRecognizedItems([])
    } catch (error) {
      setError(error instanceof Error ? error.message : '批量保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">拍照识别物品</h1>
          </div>

          {/* 模式选择 */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">识别模式</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={useMockData}
                  onChange={() => setUseMockData(true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>快速测试模式（模拟数据）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={!useMockData}
                  onChange={() => setUseMockData(false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>真实识别模式</span>
              </label>
            </div>
            {useMockData && (
              <p className="text-sm text-gray-600 mt-2">
                💡 快速测试模式使用模拟数据，无需配置 Roboflow
              </p>
            )}
          </div>

          {/* 上传区域 */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">上传图片</h2>
            {!preview ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Camera className="w-16 h-16 text-gray-300 mb-4" />
                <div className="text-gray-500 mb-4">选择一张图片进行识别</div>
                <div className="flex gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="main-btn w-36 flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" /> 选择文件
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full flex justify-center mb-4">
                  <img
                    src={preview}
                    alt="预览"
                    className="w-full max-h-64 object-contain rounded-2xl border border-gray-100"
                  />
                  <button
                    className="icon-btn absolute top-2 right-2"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                      setRecognizedItems([])
                      setError(null)
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={recognizeImage}
                  disabled={loading}
                  className="main-btn w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      识别中...
                    </>
                  ) : (
                    '开始识别'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="card mb-6 bg-red-50 border-red-200">
              <h2 className="text-lg font-semibold mb-2 text-red-800">错误信息</h2>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 识别结果 */}
          {recognizedItems.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">识别结果</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowConfidence(!showConfidence)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showConfidence ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showConfidence ? '隐藏置信度' : '显示置信度'}
                  </button>
                  <button
                    onClick={saveAllToInventory}
                    disabled={loading}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    全部保存
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {recognizedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {showConfidence && (
                        <div className="text-sm text-gray-500">
                          置信度: {(item.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => saveToInventory(item)}
                      disabled={loading}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      保存
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
} 