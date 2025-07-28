'use client'

import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react'

export type Language = 'zh' | 'en'

const translations = {
  zh: {
    common: {
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      back: '返回',
      confirm: '确认',
      search: '搜索',
      filter: '筛选',
      clear: '清除',
      submit: '提交',
      close: '关闭',
      yes: '是',
      no: '否',
      ok: '确定',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息',
      optional: '可选'
    },
    navigation: {
      home: '首页',
      addItem: '添加物品',
      addSpace: '添加空间',
      settings: '设置',
      logout: '退出登录',
      login: '登录',
      register: '注册'
    },
    home: {
      title: '家庭物品管理',
      manageSpaces: '管理空间',
      manageItems: '管理物品',
      searchPlaceholder: '搜索空间或物品...',
      noSpaces: '还没有创建空间',
      noItems: '还没有添加物品',
      createFirstSpace: '创建第一个空间',
      createFirstItem: '添加第一个物品',
      totalSpaces: '个空间',
      totalItems: '个物品',
      recentItems: '最近添加',
      expiredItems: '即将过期'
    },
    settings: {
      title: '设置',
      language: '语言',
      languageDesc: '选择应用显示语言',
      chinese: '中文',
      english: 'English',
      account: '账户',
      profile: '个人资料',
      preferences: '偏好设置',
      about: '关于',
      version: '版本'
    },
    auth: {
      login: '登录',
      register: '注册',
      logout: '退出登录',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码',
      loginSuccess: '登录成功',
      registerSuccess: '注册成功',
      logoutSuccess: '已退出登录',
      loginFailed: '登录失败',
      registerFailed: '注册失败',
      emailRequired: '请输入邮箱',
      passwordRequired: '请输入密码',
      passwordMismatch: '两次密码不一致',
      invalidEmail: '邮箱格式不正确',
      weakPassword: '密码强度不够'
    },
    add: {
      title: '添加物品',
      selectRoom: '选择房间',
      selectLocation: '选择位置',
      selectLocationForRoom: '为 {room} 选择位置',
      addItemsToLocation: '向 {location} 添加物品',
      addItems: '添加物品',
      spaceSelection: '空间选择',
      noRooms: '还没有创建房间',
      createFirstRoom: '创建第一个房间',
      noLocations: '这个房间还没有位置',
      addLocation: '添加位置',
      selectRoomFirst: '请先选择房间',
      selectLocationFirst: '请先选择位置',
      itemNumber: '物品 {number}',
      itemName: '物品名称',
      itemNamePlaceholder: '如：苹果、洗发水',
      quantity: '数量',
      category: '分类',
      categoryPlaceholder: '如：食品、日用品',
      expireDate: '过期日期',
      value: '价值',
      valuePlaceholder: '如：99.99',
      brand: '品牌',
      brandPlaceholder: '如：苹果、海飞丝',
      purchaseDate: '购买日期',
      purchaseSource: '购买来源',
      purchaseSourcePlaceholder: '如：淘宝、实体店',
      condition: '状态',
      selectCondition: '选择状态',
      conditionNew: '全新',
      conditionLikeNew: '九成新',
      conditionGood: '良好',
      conditionFair: '一般',
      conditionPoor: '较差',
      priority: '优先级',
      priorityLow: '低',
      priorityNormal: '普通',
      priorityHigh: '高',
      priorityUrgent: '紧急',
      notes: '备注',
      notesPlaceholder: '添加备注信息...',
      itemImage: '物品图片',
      clickUploadImage: '点击上传图片',
      imageSupport: '支持 JPG、PNG 格式，最大 5MB',
      addMoreItems: '添加更多物品',
      addItemsCount: '添加 {count} 个物品',
      selectLocationAlert: '请选择存放位置',
      addAtLeastOneItem: '请至少添加一个物品',
      addValidItem: '请至少添加一个有效的物品',
      addFailed: '添加失败: {count} 个物品添加失败',
      addSuccess: '成功添加 {count} 个物品',
      addError: '添加物品失败'
    },
    spaces: {
      addTitle: '添加空间',
      selectOrCreateRoom: '选择或创建房间',
      addLocationForRoom: '为 {room} 添加具体位置',
      selectRoom: '选择房间',
      selectLocation: '选择位置',
      selectLocationForRoom: '为 {room} 选择具体位置',
      createCustomRoom: '或创建自定义房间',
      roomName: '房间名称',
      roomNamePlaceholder: '如：游戏室、健身房',
      roomIcon: '房间图标',
      selectIcon: '选择图标',
      clickToSelectIcon: '点击选择图标',
      description: '描述',
      roomDescriptionPlaceholder: '房间用途描述...',
      createRoom: '创建房间',
      createCustomLocation: '或创建自定义位置',
      locationName: '位置名称',
      locationNamePlaceholder: '如：床头柜、电视柜',
      locationIcon: '位置图标',
      locationDescriptionPlaceholder: '位置用途描述...',
      createLocation: '创建位置'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      back: 'Back',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      submit: 'Submit',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      optional: 'Optional'
    },
    navigation: {
      home: 'Home',
      addItem: 'Add Item',
      addSpace: 'Add Space',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      register: 'Register'
    },
    home: {
      title: 'Home Inventory',
      manageSpaces: 'Manage Spaces',
      manageItems: 'Manage Items',
      searchPlaceholder: 'Search spaces or items...',
      noSpaces: 'No spaces created yet',
      noItems: 'No items added yet',
      createFirstSpace: 'Create first space',
      createFirstItem: 'Add first item',
      totalSpaces: 'spaces',
      totalItems: 'items',
      recentItems: 'Recently Added',
      expiredItems: 'Expiring Soon'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      languageDesc: 'Choose app display language',
      chinese: '中文',
      english: 'English',
      account: 'Account',
      profile: 'Profile',
      preferences: 'Preferences',
      about: 'About',
      version: 'Version'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful',
      logoutSuccess: 'Logged out successfully',
      loginFailed: 'Login failed',
      registerFailed: 'Registration failed',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordMismatch: 'Passwords do not match',
      invalidEmail: 'Invalid email format',
      weakPassword: 'Password is too weak'
    },
    add: {
      title: 'Add Items',
      selectRoom: 'Select Room',
      selectLocation: 'Select Location',
      selectLocationForRoom: 'Select location for {room}',
      addItemsToLocation: 'Add items to {location}',
      addItems: 'Add Items',
      spaceSelection: 'Space Selection',
      noRooms: 'No rooms created yet',
      createFirstRoom: 'Create first room',
      noLocations: 'No locations in this room',
      addLocation: 'Add location',
      selectRoomFirst: 'Please select a room first',
      selectLocationFirst: 'Please select a location first',
      itemNumber: 'Item {number}',
      itemName: 'Item Name',
      itemNamePlaceholder: 'e.g., Apple, Shampoo',
      quantity: 'Quantity',
      category: 'Category',
      categoryPlaceholder: 'e.g., Food, Daily Use',
      expireDate: 'Expire Date',
      value: 'Value',
      valuePlaceholder: 'e.g., 99.99',
      brand: 'Brand',
      brandPlaceholder: 'e.g., Apple, Head & Shoulders',
      purchaseDate: 'Purchase Date',
      purchaseSource: 'Purchase Source',
      purchaseSourcePlaceholder: 'e.g., Taobao, Store',
      condition: 'Condition',
      selectCondition: 'Select condition',
      conditionNew: 'New',
      conditionLikeNew: 'Like New',
      conditionGood: 'Good',
      conditionFair: 'Fair',
      conditionPoor: 'Poor',
      priority: 'Priority',
      priorityLow: 'Low',
      priorityNormal: 'Normal',
      priorityHigh: 'High',
      priorityUrgent: 'Urgent',
      notes: 'Notes',
      notesPlaceholder: 'Add notes...',
      itemImage: 'Item Image',
      clickUploadImage: 'Click to upload image',
      imageSupport: 'Supports JPG, PNG format, max 5MB',
      addMoreItems: 'Add More Items',
      addItemsCount: 'Add {count} items',
      selectLocationAlert: 'Please select a location',
      addAtLeastOneItem: 'Please add at least one item',
      addValidItem: 'Please add at least one valid item',
      addFailed: 'Add failed: {count} items failed to add',
      addSuccess: 'Successfully added {count} items',
      addError: 'Failed to add items'
    },
    spaces: {
      addTitle: 'Add Space',
      selectOrCreateRoom: 'Select or Create Room',
      addLocationForRoom: 'Add specific location for {room}',
      selectRoom: 'Select Room',
      selectLocation: 'Select Location',
      selectLocationForRoom: 'Select specific location for {room}',
      createCustomRoom: 'or Create Custom Room',
      roomName: 'Room Name',
      roomNamePlaceholder: 'e.g., Game Room, Gym',
      roomIcon: 'Room Icon',
      selectIcon: 'Select Icon',
      clickToSelectIcon: 'Click to select icon',
      description: 'Description',
      roomDescriptionPlaceholder: 'Room description...',
      createRoom: 'Create Room',
      createCustomLocation: 'or Create Custom Location',
      locationName: 'Location Name',
      locationNamePlaceholder: 'e.g., Nightstand, TV Stand',
      locationIcon: 'Location Icon',
      locationDescriptionPlaceholder: 'Location description...',
      createLocation: 'Create Location'
    }
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    
    let result = typeof value === 'string' ? value : key
    
    // 替换参数
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(new RegExp(`{${param}}`, 'g'), params[param])
      })
    }
    
    return result
  }

  return createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children)
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 