'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, Check, X } from 'lucide-react'

export default function TestRoboflowPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setResult(null)
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

  const testRoboflow = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
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
      setResult(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="w-full max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Roboflow 测试</h1>
        </div>

        {/* 配置状态 */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">配置状态</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>API 路由已配置</span>
            </div>
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span>API Key: {process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY ? '已配置' : '未配置'}</span>
            </div>
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_ROBOFLOW_MODEL_URL ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span>Model URL: {process.env.NEXT_PUBLIC_ROBOFLOW_MODEL_URL ? '已配置' : '未配置'}</span>
            </div>
          </div>
        </div>

        {/* 上传区域 */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">上传测试图片</h2>
          {!preview ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Camera className="w-16 h-16 text-gray-300 mb-4" />
              <div className="text-gray-500 mb-4">选择一张图片进行测试</div>
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
                    setResult(null)
                    setError(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={testRoboflow} 
                disabled={loading}
                className="main-btn w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  '测试识别'
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

        {/* 测试结果 */}
        {result && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">测试结果</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">识别到的物品：</h3>
                {result.items && result.items.length > 0 ? (
                  <div className="space-y-2">
                    {result.items.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          置信度: {(item.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">未识别到任何物品</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">原始响应：</h3>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 