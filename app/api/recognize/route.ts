import { NextRequest, NextResponse } from 'next/server'
import { recognizeImageWithOpenAI } from '@/lib/openai-vision'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: '请上传图片' },
        { status: 400 }
      )
    }

    // 将文件转换为 buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 检查 OpenAI 配置
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      // 如果没有配置 OpenAI，返回模拟数据
      console.log('OpenAI 未配置，返回模拟数据')
      return NextResponse.json({
        items: [
          { 
            name: '红富士苹果', 
            confidence: 0.85, 
            type: 'label',
            quantity: 6,
            category: '食品',
            expire_date: null,
            value: 24.00,
            brand: '农夫山泉',
            purchase_date: null,
            purchase_source: null,
            notes: '新鲜红富士苹果，脆甜多汁，中号，红色',
            condition: 'new',
            priority: 'normal',
            suggestedLocation: '冰箱冷藏室',
            needsExpiryDate: true,
            expiryDateHint: '苹果通常可保存7-14天',
            unit: '个',
            size: '中号',
            color: '红色'
          },
          { 
            name: '蒙牛纯牛奶', 
            confidence: 0.78, 
            type: 'text',
            quantity: 2,
            category: '食品',
            expire_date: null,
            value: 15.00,
            brand: '蒙牛',
            purchase_date: null,
            purchase_source: null,
            notes: '250ml 纯牛奶，纸盒包装，需要冷藏保存，开封后24小时内饮用',
            condition: 'new',
            priority: 'normal',
            suggestedLocation: '冰箱冷藏室',
            needsExpiryDate: true,
            expiryDateHint: '牛奶通常保质期7-14天',
            unit: '盒',
            size: '250ml',
            color: '白色'
          },
          { 
            name: '全麦面包', 
            confidence: 0.82, 
            type: 'label',
            quantity: 1,
            category: '食品',
            expire_date: null,
            value: 8.50,
            brand: '桃李',
            purchase_date: null,
            purchase_source: null,
            notes: '全麦面包，营养丰富，400g，避免阳光直射，保持干燥',
            condition: 'new',
            priority: 'normal',
            suggestedLocation: '厨房面包盒',
            needsExpiryDate: true,
            expiryDateHint: '面包通常保质期3-5天',
            unit: '包',
            size: '400g',
            color: '棕色'
          }
        ],
        note: '这是模拟数据，请配置 OpenAI 获取真实识别结果'
      })
    }

    // 使用 OpenAI 视觉模型进行图像识别
    const recognizedItems = await recognizeImageWithOpenAI(buffer, file.type || 'image/jpeg')

    return NextResponse.json({
      items: recognizedItems
    })
  } catch (error) {
    console.error('图像识别错误:', error)
    return NextResponse.json(
      { error: '图像识别失败' },
      { status: 500 }
    )
  }
} 