// 预设房间映射表
export interface PresetRoom {
  id: string
  name: {
    zh: string
    en: string
  }
  icon: string
  description: {
    zh: string
    en: string
  }
}

export const PRESET_ROOMS: PresetRoom[] = [
  {
    id: 'living-room',
    name: { zh: '客厅', en: 'Living Room' },
    icon: '🛋️',
    description: { zh: '家庭活动中心', en: 'Family activity center' }
  },
  {
    id: 'bedroom',
    name: { zh: '卧室', en: 'Bedroom' },
    icon: '🛏️',
    description: { zh: '休息睡眠空间', en: 'Rest and sleep space' }
  },
  {
    id: 'kitchen',
    name: { zh: '厨房', en: 'Kitchen' },
    icon: '🍳',
    description: { zh: '烹饪和用餐', en: 'Cooking and dining' }
  },
  {
    id: 'bathroom',
    name: { zh: '卫生间', en: 'Bathroom' },
    icon: '🚿',
    description: { zh: '洗漱和清洁', en: 'Bathing and cleaning' }
  },
  {
    id: 'study',
    name: { zh: '书房', en: 'Study' },
    icon: '📚',
    description: { zh: '学习和工作', en: 'Learning and work' }
  },
  {
    id: 'balcony',
    name: { zh: '阳台', en: 'Balcony' },
    icon: '🌱',
    description: { zh: '晾晒和植物', en: 'Drying and plants' }
  },
  {
    id: 'storage-room',
    name: { zh: '储物间', en: 'Storage Room' },
    icon: '📦',
    description: { zh: '杂物存放', en: 'Storage for items' }
  },
  {
    id: 'closet',
    name: { zh: '衣帽间', en: 'Closet' },
    icon: '👔',
    description: { zh: '衣物收纳', en: 'Clothing storage' }
  }
]

// 根据语言获取所有预设房间
export function getPresetRooms(language: 'zh' | 'en'): Array<{ id: string; name: string; icon: string; description: string }> {
  return PRESET_ROOMS.map(room => ({
    id: room.id,
    name: room.name[language],
    icon: room.icon,
    description: room.description[language]
  }))
}

// 根据ID获取预设房间信息
export function getPresetRoomById(id: string, language: 'zh' | 'en'): { name: string; icon: string; description: string } | null {
  const room = PRESET_ROOMS.find(r => r.id === id)
  if (!room) return null

  return {
    name: room.name[language],
    icon: room.icon,
    description: room.description[language]
  }
} 