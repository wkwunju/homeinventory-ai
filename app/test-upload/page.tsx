'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'

export default function TestUploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      
      // 先显示本地预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
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
          console.log('上传成功:', data)
          setUploadedImage(data.url)
        } else {
          const errorData = await response.json()
          console.error('上传失败:', errorData)
          alert(`上传失败: ${errorData.error}`)
        }
      } catch (error) {
        console.error('上传图片失败:', error)
        alert('上传图片失败，请重试')
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">图片上传测试</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {/* 上传区域 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                选择图片文件
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-300 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="test-upload"
                  disabled={uploading}
                />
                <label 
                  htmlFor="test-upload"
                  className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {uploading ? '上传中...' : '点击上传图片'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        支持 JPG、PNG 格式，最大 5MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 预览区域 */}
            {uploadedImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  预览图片
                </label>
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="预览图片" 
                    className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setUploadedImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>图片URL: {uploadedImage}</p>
                </div>
              </div>
            )}

            {/* 状态信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">上传状态</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• 状态: {uploading ? '上传中...' : uploadedImage ? '已完成' : '等待上传'}</p>
                <p>• 图片类型: {uploadedImage ? '已选择' : '未选择'}</p>
                <p>• 预览: {uploadedImage ? '已显示' : '无预览'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 