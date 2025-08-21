import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = createServerSupabaseClient()

    if (!supabaseAuth) {
      return NextResponse.json(
        { error: 'Supabase 环境变量未正确配置' },
        { status: 500 }
      )
    }

    // 获取用户信息
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      )
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只能上传图片文件' },
        { status: 400 }
      )
    }

    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // 上传到Supabase Storage
    const { data, error } = await supabaseAuth.storage
      .from('item-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('上传文件失败:', error)
      return NextResponse.json(
        { error: '上传文件失败' },
        { status: 500 }
      )
    }

    // 获取公共URL或签名URL
    let imageUrl
    if (data.path) {
      // 对于private bucket，使用签名URL
      const { data: signedData, error: signedErr } = await supabaseAuth.storage
        .from('item-photos')
        .createSignedUrl(data.path, 60 * 60) // 1小时有效期

      if (signedErr || !signedData?.signedUrl) {
        console.warn('生成签名URL失败，回退到公共URL:', signedErr)
        const { data: pub } = await supabaseAuth.storage
          .from('item-photos')
          .getPublicUrl(fileName)
        imageUrl = pub.publicUrl
      } else {
        imageUrl = signedData.signedUrl
      }
    } else {
      // 对于public bucket，使用公共URL
      const { data: { publicUrl } } = supabaseAuth.storage
        .from('item-photos')
        .getPublicUrl(fileName)
      imageUrl = publicUrl
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: '无法生成图片URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: imageUrl,
      message: '文件上传成功'
    })
  } catch (error) {
    console.error('上传文件错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
} 