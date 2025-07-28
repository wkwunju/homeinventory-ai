// 图标映射系统
export interface IconOption {
  name: string
  icon: string
  category: string
  description: string
}

// 100个常用图标，按类别组织
export const iconOptions: IconOption[] = [
  // 房间类图标
  { name: '客厅', icon: '🛋️', category: '房间', description: '家庭活动中心' },
  { name: '卧室', icon: '🛏️', category: '房间', description: '休息睡眠空间' },
  { name: '厨房', icon: '🍳', category: '房间', description: '烹饪和用餐' },
  { name: '卫生间', icon: '🚿', category: '房间', description: '洗漱和清洁' },
  { name: '书房', icon: '📚', category: '房间', description: '学习和工作' },
  { name: '阳台', icon: '🌱', category: '房间', description: '晾晒和植物' },
  { name: '储物间', icon: '📦', category: '房间', description: '杂物存放' },
  { name: '衣帽间', icon: '👔', category: '房间', description: '衣物收纳' },
  { name: '餐厅', icon: '🍽️', category: '房间', description: '用餐空间' },
  { name: '儿童房', icon: '🧸', category: '房间', description: '儿童活动空间' },
  { name: '老人房', icon: '👴', category: '房间', description: '老年人休息' },
  { name: '客房', icon: '🛌', category: '房间', description: '客人住宿' },
  { name: '健身房', icon: '💪', category: '房间', description: '运动健身' },
  { name: '影音室', icon: '🎬', category: '房间', description: '娱乐观影' },
  { name: '游戏室', icon: '🎮', category: '房间', description: '游戏娱乐' },
  { name: '工作间', icon: '💼', category: '房间', description: '办公工作' },
  { name: '洗衣房', icon: '🧺', category: '房间', description: '衣物清洗' },
  { name: '车库', icon: '🚗', category: '房间', description: '车辆停放' },
  { name: '花园', icon: '🌺', category: '房间', description: '户外花园' },
  { name: '露台', icon: '☀️', category: '房间', description: '户外休闲' },

  // 家具类图标
  { name: '沙发', icon: '🛋️', category: '家具', description: '休息和接待' },
  { name: '茶几', icon: '☕', category: '家具', description: '茶具和小物品' },
  { name: '电视柜', icon: '📺', category: '家具', description: '电视和影音设备' },
  { name: '书架', icon: '📚', category: '家具', description: '书籍和装饰品' },
  { name: '衣柜', icon: '👕', category: '家具', description: '衣物收纳' },
  { name: '床头柜', icon: '🛏️', category: '家具', description: '睡前用品' },
  { name: '梳妆台', icon: '💄', category: '家具', description: '化妆品和首饰' },
  { name: '床', icon: '🛏️', category: '家具', description: '睡眠休息' },
  { name: '餐桌', icon: '🍽️', category: '家具', description: '用餐桌面' },
  { name: '餐椅', icon: '🪑', category: '家具', description: '用餐座椅' },
  { name: '书桌', icon: '📝', category: '家具', description: '办公和学习' },
  { name: '办公椅', icon: '🪑', category: '家具', description: '办公座椅' },
  { name: '文件柜', icon: '📁', category: '家具', description: '重要文件' },
  { name: '置物架', icon: '📦', category: '家具', description: '杂物收纳' },
  { name: '鞋柜', icon: '👠', category: '家具', description: '鞋子收纳' },
  { name: '首饰盒', icon: '💍', category: '家具', description: '首饰收纳' },
  { name: '工具箱', icon: '🔧', category: '家具', description: '工具存放' },
  { name: '行李箱', icon: '🧳', category: '家具', description: '旅行用品' },
  { name: '花架', icon: '🌱', category: '家具', description: '植物摆放' },
  { name: '晾衣架', icon: '👕', category: '家具', description: '衣物晾晒' },
  { name: '毛巾架', icon: '🧺', category: '家具', description: '毛巾和浴巾' },
  { name: '浴室柜', icon: '🧴', category: '家具', description: '洗漱用品' },
  { name: '马桶柜', icon: '🧻', category: '家具', description: '卫生用品' },

  // 电器类图标
  { name: '冰箱', icon: '❄️', category: '电器', description: '冷藏和冷冻食品' },
  { name: '微波炉', icon: '🔥', category: '电器', description: '快速加热' },
  { name: '洗碗机', icon: '🍽️', category: '电器', description: '餐具清洁' },
  { name: '洗衣机', icon: '🧺', category: '电器', description: '衣物清洗' },
  { name: '烘干机', icon: '🌞', category: '电器', description: '衣物烘干' },
  { name: '电视', icon: '📺', category: '电器', description: '影音娱乐' },
  { name: '音响', icon: '🔊', category: '电器', description: '音频播放' },
  { name: '电脑', icon: '💻', category: '电器', description: '办公娱乐' },
  { name: '打印机', icon: '🖨️', category: '电器', description: '文档打印' },
  { name: '空调', icon: '❄️', category: '电器', description: '温度调节' },
  { name: '电风扇', icon: '💨', category: '电器', description: '空气循环' },
  { name: '电热水器', icon: '🚿', category: '电器', description: '热水供应' },
  { name: '电饭煲', icon: '🍚', category: '电器', description: '米饭烹饪' },
  { name: '电磁炉', icon: '🔥', category: '电器', description: '烹饪加热' },
  { name: '烤箱', icon: '🍞', category: '电器', description: '烘焙烹饪' },
  { name: '豆浆机', icon: '🥛', category: '电器', description: '饮品制作' },
  { name: '榨汁机', icon: '🍊', category: '电器', description: '果汁制作' },
  { name: '咖啡机', icon: '☕', category: '电器', description: '咖啡制作' },
  { name: '电水壶', icon: '🫖', category: '电器', description: '热水烧制' },
  { name: '电熨斗', icon: '👔', category: '电器', description: '衣物熨烫' },
  { name: '吸尘器', icon: '🧹', category: '电器', description: '清洁打扫' },
  { name: '扫地机器人', icon: '🤖', category: '电器', description: '自动清洁' },

  // 储物类图标
  { name: '橱柜', icon: '🥘', category: '储物', description: '餐具和调料' },
  { name: '抽屉', icon: '📥', category: '储物', description: '小物品收纳' },
  { name: '储物盒', icon: '📦', category: '储物', description: '物品分类' },
  { name: '收纳袋', icon: '👜', category: '储物', description: '衣物收纳' },
  { name: '挂钩', icon: '🪝', category: '储物', description: '悬挂物品' },
  { name: '置物篮', icon: '🧺', category: '储物', description: '临时收纳' },
  { name: '药箱', icon: '💊', category: '储物', description: '药品存放' },
  { name: '工具箱', icon: '🔧', category: '储物', description: '工具存放' },
  { name: '文具盒', icon: '✏️', category: '储物', description: '文具收纳' },
  { name: '首饰盒', icon: '💍', category: '储物', description: '首饰收纳' },
  { name: '钱包', icon: '👛', category: '储物', description: '现金卡片' },
  { name: '钥匙扣', icon: '🔑', category: '储物', description: '钥匙存放' },
  { name: '雨伞架', icon: '☔', category: '储物', description: '雨具存放' },
  { name: '鞋架', icon: '👠', category: '储物', description: '鞋子摆放' },
  { name: '衣架', icon: '👕', category: '储物', description: '衣物悬挂' },
  { name: '书立', icon: '📚', category: '储物', description: '书籍支撑' },
  { name: '文件夹', icon: '📁', category: '储物', description: '文件整理' },
  { name: '相框', icon: '🖼️', category: '储物', description: '照片展示' },
  { name: '花瓶', icon: '🌺', category: '储物', description: '花卉装饰' },
  { name: '垃圾桶', icon: '🗑️', category: '储物', description: '垃圾收集' },
  { name: '回收箱', icon: '♻️', category: '储物', description: '可回收物' },

  // 其他类图标
  { name: '床底', icon: '🛏️', category: '其他', description: '季节性物品' },
  { name: '天花板', icon: '🏠', category: '其他', description: '顶部空间' },
  { name: '地板', icon: '🟫', category: '其他', description: '地面空间' },
  { name: '墙壁', icon: '🧱', category: '其他', description: '墙面空间' },
  { name: '门后', icon: '🚪', category: '其他', description: '门后空间' },
  { name: '窗台', icon: '🪟', category: '其他', description: '窗户台面' },
  { name: '角落', icon: '📐', category: '其他', description: '角落空间' },
  { name: '过道', icon: '🚶', category: '其他', description: '通行空间' },
  { name: '楼梯', icon: '🪜', category: '其他', description: '上下通道' },
  { name: '电梯', icon: '🛗', category: '其他', description: '垂直运输' },
  { name: '地下室', icon: '🏚️', category: '其他', description: '地下空间' },
  { name: '阁楼', icon: '🏠', category: '其他', description: '顶部空间' },
  { name: '车库', icon: '🚗', category: '其他', description: '车辆停放' },
  { name: '花园', icon: '🌺', category: '其他', description: '户外花园' },
  { name: '露台', icon: '☀️', category: '其他', description: '户外休闲' },
  { name: '游泳池', icon: '🏊', category: '其他', description: '游泳设施' },
  { name: '烧烤架', icon: '🔥', category: '其他', description: '户外烹饪' },
  { name: '秋千', icon: '🪑', category: '其他', description: '休闲娱乐' },
  { name: '沙坑', icon: '🏖️', category: '其他', description: '儿童娱乐' },
  { name: '篮球架', icon: '🏀', category: '其他', description: '运动设施' },
  { name: '网球场', icon: '🎾', category: '其他', description: '运动场地' },
  { name: '停车场', icon: '🅿️', category: '其他', description: '车辆停放' },
  { name: '垃圾箱', icon: '🗑️', category: '其他', description: '垃圾收集' },
  { name: '邮箱', icon: '📮', category: '其他', description: '邮件收发' },
  { name: '门铃', icon: '🔔', category: '其他', description: '访客通知' },
  { name: '监控', icon: '📹', category: '其他', description: '安全监控' },
  { name: '报警器', icon: '🚨', category: '其他', description: '安全警报' },
  { name: '灭火器', icon: '🧯', category: '其他', description: '消防安全' },
  { name: '急救箱', icon: '🏥', category: '其他', description: '紧急医疗' },
  { name: '保险箱', icon: '🔒', category: '其他', description: '贵重物品' },
  { name: '保险柜', icon: '🏦', category: '其他', description: '重要文件' },
  { name: '金库', icon: '💰', category: '其他', description: '贵重物品' },
  { name: '密室', icon: '🚪', category: '其他', description: '私密空间' },
  { name: '暗道', icon: '🕳️', category: '其他', description: '秘密通道' },
  { name: '地窖', icon: '🏚️', category: '其他', description: '地下储藏' },
  { name: '酒窖', icon: '🍷', category: '其他', description: '酒类储藏' },
  { name: '雪茄房', icon: '🚬', category: '其他', description: '雪茄收藏' },
  { name: '游戏室', icon: '🎮', category: '其他', description: '游戏娱乐' },
  { name: '影音室', icon: '🎬', category: '其他', description: '娱乐观影' },
  { name: '健身房', icon: '💪', category: '其他', description: '运动健身' },
  { name: '桑拿房', icon: '🧖', category: '其他', description: '放松休闲' },
  { name: '按摩椅', icon: '💆', category: '其他', description: '放松按摩' },
  { name: '瑜伽室', icon: '🧘', category: '其他', description: '瑜伽练习' },
  { name: '冥想室', icon: '🧘‍♀️', category: '其他', description: '冥想放松' },
  { name: '祈祷室', icon: '🙏', category: '其他', description: '宗教活动' },
  { name: '书房', icon: '📚', category: '其他', description: '学习工作' },
  { name: '画室', icon: '🎨', category: '其他', description: '艺术创作' },
  { name: '音乐室', icon: '🎵', category: '其他', description: '音乐练习' },
  { name: '舞蹈室', icon: '💃', category: '其他', description: '舞蹈练习' },
  { name: '摄影棚', icon: '📸', category: '其他', description: '摄影创作' },
  { name: '录音棚', icon: '🎤', category: '其他', description: '音频录制' },
  { name: '工作室', icon: '💼', category: '其他', description: '专业工作' },
  { name: '会议室', icon: '🤝', category: '其他', description: '会议讨论' },
  { name: '接待室', icon: '👋', category: '其他', description: '访客接待' },
  { name: '休息室', icon: '☕', category: '其他', description: '休息放松' },
  { name: '吸烟室', icon: '🚬', category: '其他', description: '吸烟区域' },
  { name: '母婴室', icon: '👶', category: '其他', description: '母婴护理' },
  { name: '无障碍', icon: '♿', category: '其他', description: '无障碍设施' },
  { name: '紧急出口', icon: '🚪', category: '其他', description: '安全通道' },
  { name: '消防通道', icon: '🚒', category: '其他', description: '消防疏散' },
  { name: '避难所', icon: '🏠', category: '其他', description: '紧急避难' },
]

// 按类别分组图标
export const iconCategories = {
  '房间': iconOptions.filter(icon => icon.category === '房间'),
  '家具': iconOptions.filter(icon => icon.category === '家具'),
  '电器': iconOptions.filter(icon => icon.category === '电器'),
  '储物': iconOptions.filter(icon => icon.category === '储物'),
  '其他': iconOptions.filter(icon => icon.category === '其他'),
}

// 根据名称获取图标
export function getIconByName(name: string): string {
  const icon = iconOptions.find(icon => icon.name === name)
  return icon ? icon.icon : '📦' // 默认图标
}

// 根据空间类型获取默认图标
export function getDefaultIconByLevel(level: number, name: string): string {
  if (level === 1) {
    // 房间级别
    const roomIcon = iconOptions.find(icon => icon.name === name && icon.category === '房间')
    return roomIcon ? roomIcon.icon : '🏠'
  } else {
    // 位置级别
    const furnitureIcon = iconOptions.find(icon => icon.name === name && icon.category === '家具')
    return furnitureIcon ? furnitureIcon.icon : '📦'
  }
} 