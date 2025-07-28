import { NextRequest, NextResponse } from 'next/server'

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

    // 将文件转换为 base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // 使用 Roboflow 通用物体检测模型
    const roboflowApiKey = process.env.ROBOFLOW_API_KEY
    const roboflowModelUrl = process.env.ROBOFLOW_MODEL_URL

    if (!roboflowApiKey || !roboflowModelUrl) {
      // 如果没有配置 Roboflow，返回模拟数据
      console.log('Roboflow 未配置，返回模拟数据')
      return NextResponse.json({
        items: [
          {
            name: '苹果',
            confidence: 0.85,
            bbox: [100, 100, 200, 200]
          },
          {
            name: '牛奶',
            confidence: 0.78,
            bbox: [300, 150, 400, 250]
          },
          {
            name: '书籍',
            confidence: 0.92,
            bbox: [50, 300, 150, 400]
          }
        ],
        image: base64Image,
        note: '这是模拟数据，请配置 Roboflow 获取真实识别结果'
      })
    }

    const response = await fetch(roboflowModelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: roboflowApiKey,
        image: base64Image,
      }),
    })

    if (!response.ok) {
      throw new Error(`Roboflow API 请求失败: ${response.status}`)
    }

    const result = await response.json()

    // 处理识别结果
    const recognizedItems = result.predictions?.map((pred: any) => ({
      name: pred.class,
      confidence: pred.confidence,
      bbox: pred.bbox,
    })) || []

    return NextResponse.json({
      items: recognizedItems,
      image: base64Image,
    })
  } catch (error) {
    console.error('图像识别错误:', error)
    return NextResponse.json(
      { error: '图像识别失败' },
      { status: 500 }
    )
  }
} 