'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TestUploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/upload', { method: 'POST', body: formData })
        if (response.ok) {
          const data = await response.json()
          setUploadedImage(data.url)
        }
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-8">图片上传测试</h1>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">选择图片文件</label>
                <div className="border-2 border-dashed border-slate-300/60 rounded-2xl p-8 text-center hover:border-sky-300/80 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="test-upload" disabled={uploading} />
                  <label htmlFor="test-upload" className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-700">{uploading ? '上传中...' : '点击上传图片'}</p>
                        <p className="text-sm text-slate-500 mt-1">支持 JPG、PNG 格式，最大 5MB</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {uploadedImage && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">预览图片</label>
                  <div className="relative">
                    <img src={uploadedImage} alt="预览图片" className="w-full max-h-96 object-cover rounded-2xl border border-slate-200/60" />
                    <button onClick={() => setUploadedImage('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">图片URL: {uploadedImage}</div>
                </div>
              )}

              <div className="bg-slate-50/80 rounded-2xl p-4">
                <h3 className="font-medium text-slate-800 mb-2">上传状态</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• 状态: {uploading ? '上传中...' : uploadedImage ? '已完成' : '等待上传'}</p>
                  <p>• 图片类型: {uploadedImage ? '已选择' : '未选择'}</p>
                  <p>• 预览: {uploadedImage ? '已显示' : '无预览'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 