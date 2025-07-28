import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('space_id')
    const search = searchParams.get('search')

    let query = supabaseAuth
      .from('items')
      .select(`
        *,
        spaces (
          id,
          name,
          level,
          parent_id
        )
      `)
      .eq('user_id', user.id)

    // 按空间筛选
    if (spaceId) {
      query = query.eq('space_id', spaceId)
    }

    // 暂时移除搜索功能，让前端在本地搜索
    // if (search) {
    //   query = query.or(`name.ilike.%${search}%`)
    // }

    const { data: items, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取物品失败:', error)
      return NextResponse.json(
        { error: '获取物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: items || []
    })
  } catch (error) {
    console.error('获取物品错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const { 
      name, 
      quantity, 
      category, 
      expire_date, 
      space_id,
      value,
      brand,
      purchase_date,
      purchase_source,
      notes,
      condition,
      priority = 'normal',
      photo_url 
    } = body

    // 处理日期字段，空字符串转换为null
    const processedExpireDate = expire_date === '' ? null : expire_date
    const processedPurchaseDate = purchase_date === '' ? null : purchase_date

    if (!name) {
      return NextResponse.json(
        { error: '物品名称不能为空' },
        { status: 400 }
      )
    }

    if (!space_id) {
      return NextResponse.json(
        { error: '请选择物品存放位置' },
        { status: 400 }
      )
    }

    // 验证空间是否属于当前用户
    const { data: space, error: spaceError } = await supabaseAuth
      .from('spaces')
      .select('id')
      .eq('id', space_id)
      .eq('user_id', user.id)
      .single()

    if (spaceError || !space) {
      return NextResponse.json(
        { error: '无效的存放位置' },
        { status: 400 }
      )
    }

    // 创建新物品
    const { data: item, error } = await supabaseAuth
      .from('items')
      .insert({
        name,
        quantity,
        category,
        expire_date: processedExpireDate,
        space_id,
        user_id: user.id,
        value,
        brand,
        purchase_date: processedPurchaseDate,
        purchase_source,
        notes,
        condition,
        priority,
        photo_url
      })
      .select()
      .single()

    if (error) {
      console.error('创建物品失败:', error)
      return NextResponse.json(
        { error: '创建物品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      item,
      message: '物品添加成功'
    })
  } catch (error) {
    console.error('创建物品错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
} 