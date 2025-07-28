// 预设位置映射表
export interface PresetLocation {
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
  roomType: string // 对应的房间类型
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  // 客厅
  {
    id: 'tv-stand',
    name: { zh: '电视柜', en: 'TV Stand' },
    icon: '📺',
    description: { zh: '电视和影音设备', en: 'TV and audio equipment' },
    roomType: '客厅'
  },
  {
    id: 'coffee-table',
    name: { zh: '茶几', en: 'Coffee Table' },
    icon: '☕',
    description: { zh: '茶具和小物品', en: 'Tea sets and small items' },
    roomType: '客厅'
  },
  {
    id: 'sofa',
    name: { zh: '沙发', en: 'Sofa' },
    icon: '🛋️',
    description: { zh: '休息和接待', en: 'Rest and reception' },
    roomType: '客厅'
  },
  {
    id: 'bookshelf-living',
    name: { zh: '书架', en: 'Bookshelf' },
    icon: '📚',
    description: { zh: '书籍和装饰品', en: 'Books and decorations' },
    roomType: '客厅'
  },
  
  // 卧室
  {
    id: 'wardrobe',
    name: { zh: '衣柜', en: 'Wardrobe' },
    icon: '👕',
    description: { zh: '衣物收纳', en: 'Clothing storage' },
    roomType: '卧室'
  },
  {
    id: 'nightstand',
    name: { zh: '床头柜', en: 'Nightstand' },
    icon: '🛏️',
    description: { zh: '睡前用品', en: 'Bedside items' },
    roomType: '卧室'
  },
  {
    id: 'dresser',
    name: { zh: '梳妆台', en: 'Dresser' },
    icon: '💄',
    description: { zh: '化妆品和首饰', en: 'Cosmetics and jewelry' },
    roomType: '卧室'
  },
  {
    id: 'under-bed',
    name: { zh: '床底', en: 'Under Bed' },
    icon: '🛏️',
    description: { zh: '季节性物品', en: 'Seasonal items' },
    roomType: '卧室'
  },
  
  // 厨房
  {
    id: 'refrigerator',
    name: { zh: '冰箱', en: 'Refrigerator' },
    icon: '❄️',
    description: { zh: '冷藏和冷冻食品', en: 'Cold and frozen food' },
    roomType: '厨房'
  },
  {
    id: 'cabinet',
    name: { zh: '橱柜', en: 'Cabinet' },
    icon: '🥘',
    description: { zh: '餐具和调料', en: 'Utensils and seasonings' },
    roomType: '厨房'
  },
  {
    id: 'microwave',
    name: { zh: '微波炉', en: 'Microwave' },
    icon: '🔥',
    description: { zh: '快速加热', en: 'Quick heating' },
    roomType: '厨房'
  },
  {
    id: 'dishwasher',
    name: { zh: '洗碗机', en: 'Dishwasher' },
    icon: '🍽️',
    description: { zh: '餐具清洁', en: 'Dish cleaning' },
    roomType: '厨房'
  },
  
  // 卫生间
  {
    id: 'bathroom-cabinet',
    name: { zh: '浴室柜', en: 'Bathroom Cabinet' },
    icon: '🧴',
    description: { zh: '洗漱用品', en: 'Bathroom supplies' },
    roomType: '卫生间'
  },
  {
    id: 'towel-rack',
    name: { zh: '毛巾架', en: 'Towel Rack' },
    icon: '🧺',
    description: { zh: '毛巾和浴巾', en: 'Towels and bath towels' },
    roomType: '卫生间'
  },
  {
    id: 'toilet-cabinet',
    name: { zh: '马桶柜', en: 'Toilet Cabinet' },
    icon: '🧻',
    description: { zh: '卫生用品', en: 'Hygiene supplies' },
    roomType: '卫生间'
  },
  
  // 书房
  {
    id: 'desk',
    name: { zh: '书桌', en: 'Desk' },
    icon: '📝',
    description: { zh: '办公和学习', en: 'Office and study' },
    roomType: '书房'
  },
  {
    id: 'bookshelf-study',
    name: { zh: '书架', en: 'Bookshelf' },
    icon: '📚',
    description: { zh: '书籍和文件', en: 'Books and documents' },
    roomType: '书房'
  },
  {
    id: 'file-cabinet',
    name: { zh: '文件柜', en: 'File Cabinet' },
    icon: '📁',
    description: { zh: '重要文件', en: 'Important files' },
    roomType: '书房'
  },
  
  // 阳台
  {
    id: 'clothes-rack',
    name: { zh: '晾衣架', en: 'Clothes Rack' },
    icon: '👕',
    description: { zh: '衣物晾晒', en: 'Clothes drying' },
    roomType: '阳台'
  },
  {
    id: 'plant-stand',
    name: { zh: '花架', en: 'Plant Stand' },
    icon: '🌱',
    description: { zh: '植物摆放', en: 'Plant placement' },
    roomType: '阳台'
  },
  {
    id: 'storage-cabinet',
    name: { zh: '储物柜', en: 'Storage Cabinet' },
    icon: '📦',
    description: { zh: '清洁用品', en: 'Cleaning supplies' },
    roomType: '阳台'
  },
  
  // 储物间
  {
    id: 'storage-shelf',
    name: { zh: '置物架', en: 'Storage Shelf' },
    icon: '📦',
    description: { zh: '杂物收纳', en: 'Item storage' },
    roomType: '储物间'
  },
  {
    id: 'tool-box',
    name: { zh: '工具箱', en: 'Tool Box' },
    icon: '🔧',
    description: { zh: '工具存放', en: 'Tool storage' },
    roomType: '储物间'
  },
  {
    id: 'suitcase',
    name: { zh: '行李箱', en: 'Suitcase' },
    icon: '🧳',
    description: { zh: '旅行用品', en: 'Travel items' },
    roomType: '储物间'
  },
  
  // 衣帽间
  {
    id: 'wardrobe-closet',
    name: { zh: '衣柜', en: 'Wardrobe' },
    icon: '👔',
    description: { zh: '衣物分类', en: 'Clothing categories' },
    roomType: '衣帽间'
  },
  {
    id: 'shoe-cabinet',
    name: { zh: '鞋柜', en: 'Shoe Cabinet' },
    icon: '👠',
    description: { zh: '鞋子收纳', en: 'Shoe storage' },
    roomType: '衣帽间'
  },
  {
    id: 'jewelry-box',
    name: { zh: '首饰盒', en: 'Jewelry Box' },
    icon: '💍',
    description: { zh: '首饰收纳', en: 'Jewelry storage' },
    roomType: '衣帽间'
  }
]

// 根据房间类型获取预设位置
export function getPresetLocationsByRoomType(roomType: string, language: 'zh' | 'en'): Array<{ id: string; name: string; icon: string; description: string }> {
  return PRESET_LOCATIONS
    .filter(location => location.roomType === roomType)
    .map(location => ({
      id: location.id,
      name: location.name[language],
      icon: location.icon,
      description: location.description[language]
    }))
}

// 根据ID获取预设位置信息
export function getPresetLocationById(id: string, language: 'zh' | 'en'): { name: string; icon: string; description: string } | null {
  const location = PRESET_LOCATIONS.find(loc => loc.id === id)
  if (!location) return null
  
  return {
    name: location.name[language],
    icon: location.icon,
    description: location.description[language]
  }
} 