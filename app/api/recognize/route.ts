import { NextRequest, NextResponse } from 'next/server'
import { recognizeImage } from '@/lib/aws-rekognition'

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
    const base64Image = buffer.toString('base64')

    // 检查 AWS 配置
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      // 如果没有配置 AWS，返回模拟数据
      console.log('AWS Rekognition 未配置，返回模拟数据')
      return NextResponse.json({
        items: [
          {
            name: '苹果',
            confidence: 0.85,
            type: 'label'
          },
          {
            name: '牛奶',
            confidence: 0.78,
            type: 'label'
          },
          {
            name: '书籍',
            confidence: 0.92,
            type: 'label'
          }
        ],
        image: base64Image,
        note: '这是模拟数据，请配置 AWS Rekognition 获取真实识别结果'
      })
    }

    // 使用 AWS Rekognition 进行图像识别
    const recognizedItems = await recognizeImage(buffer)

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