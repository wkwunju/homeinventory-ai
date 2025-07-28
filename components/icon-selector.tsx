'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { iconOptions, iconCategories, IconOption } from '@/lib/icons'

interface IconSelectorProps {
  selectedIcon: string
  onIconSelect: (icon: string) => void
  onClose: () => void
}

export default function IconSelector({ selectedIcon, onIconSelect, onClose }: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('房间')

  // 过滤图标
  const filteredIcons = iconOptions.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         icon.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || icon.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">选择图标</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索和分类 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索图标..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="全部">全部分类</option>
              {Object.keys(iconCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 图标网格 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">未找到图标</h3>
              <p className="text-gray-500">尝试使用不同的关键词搜索</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => {
                    onIconSelect(icon.icon)
                    onClose()
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                    selectedIcon === icon.icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{icon.icon}</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{icon.name}</div>
                    <div className="text-xs text-gray-500 truncate">{icon.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              共 {filteredIcons.length} 个图标
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 