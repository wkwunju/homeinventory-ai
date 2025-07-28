import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 获取单个物品
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查环境变量是否配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: '数据库未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    // 检查 Supabase URL 是否有效
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
      return NextResponse.json(
        { error: '请配置正确的 Supabase URL' },
        { status: 500 }
      )
    }

    const supabaseAuth = createServerSupabaseClient()
    if (!supabaseAuth) {
      return NextResponse.json(
        { error: '数据库未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseAuth
      .from('items')
      .select(`
        *,
        spaces (
          id,
          name,
          level
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('获取物品详情失败:', error)
      return NextResponse.json(
        { error: '获取物品详情失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: '获取物品详情失败' },
      { status: 500 }
    )
  }
}

// 更新物品
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查环境变量是否配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: '数据库未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    // 检查 Supabase URL 是否有效
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
      return NextResponse.json(
        { error: '请配置正确的 Supabase URL' },
        { status: 500 }
      )
    }

    const supabaseAuth = createServerSupabaseClient()
    if (!supabaseAuth) {
      return NextResponse.json(
        { error: '数据库未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      quantity, 
      category, 
      expire_date, 
      value,
      brand,
      purchase_date,
      purchase_source,
      notes,
      condition,
      priority,
      photo_url 
    } = body

    // 处理日期字段，空字符串转换为null
    const processedExpireDate = expire_date === '' ? null : expire_date
    const processedPurchaseDate = purchase_date === '' ? null : purchase_date

    const { data, error } = await supabaseAuth
      .from('items')
      .update({
        name,
        quantity,
        category,
        expire_date: processedExpireDate,
        value,
        brand,
        purchase_date: processedPurchaseDate,
        purchase_source,
        notes,
        condition,
        priority,
        photo_url,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select(`
        *,
        spaces (
          id,
          name,
          level
        )
      `)
      .single()

    if (error) {
      console.error('更新物品失败:', error)
      return NextResponse.json(
        { error: '更新物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: '更新物品失败' },
      { status: 500 }
    )
  }
}

// 删除物品
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查环境变量是否配置
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: '数据库未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    // 检查 Supabase URL 是否有效
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url') {
      return NextResponse.json(
        { error: '请配置正确的 Supabase URL' },
        { status: 500 }
      )
    }

    const supabaseAuth = createServerSupabaseClient()
    if (!supabaseAuth) {
      return NextResponse.json(
        { error: '数据库未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const { error } = await supabaseAuth
      .from('items')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除物品失败:', error)
      return NextResponse.json(
        { error: '删除物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '删除物品失败' },
      { status: 500 }
    )
  }
} 