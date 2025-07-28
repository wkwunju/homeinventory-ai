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
    const level = searchParams.get('level')

    let query = supabaseAuth
      .from('spaces')
      .select('*')
      .eq('user_id', user.id)

    // 按层级筛选
    if (level) {
      query = query.eq('level', parseInt(level))
    }

    const { data: spaces, error } = await query
      .order('level', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('获取空间失败:', error)
      return NextResponse.json(
        { error: '获取空间失败' },
        { status: 500 }
      )
    }

    // 构建层级结构
    const buildHierarchy = (items: any[], parentId: string | null = null): any[] => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildHierarchy(items, item.id)
        }))
    }

    const hierarchicalSpaces = buildHierarchy(spaces)

    return NextResponse.json({
      spaces: hierarchicalSpaces,
      flat: spaces
    })
  } catch (error) {
    console.error('获取空间错误:', error)
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
    const { name, description, parent_id, level = 1, icon, preset_id } = body

    if (!name) {
      return NextResponse.json(
        { error: '空间名称不能为空' },
        { status: 400 }
      )
    }

    // 如果是家具级别，需要验证父房间是否存在
    if (level === 2 && parent_id) {
      const { data: parentSpace, error: parentError } = await supabaseAuth
        .from('spaces')
        .select('id, name')
        .eq('id', parent_id)
        .eq('user_id', user.id)
        .eq('level', 1)
        .single()

      if (parentError || !parentSpace) {
        return NextResponse.json(
          { error: '父房间不存在或不属于当前用户' },
          { status: 400 }
        )
      }
    }

    // 创建新空间
    const { data: space, error } = await supabaseAuth
      .from('spaces')
      .insert({
        name,
        description,
        parent_id: parent_id || null,
        level,
        icon: icon || '📦',
        preset_id: preset_id || null,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('创建空间失败:', error)
      return NextResponse.json(
        { error: '创建空间失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      space,
      message: '空间创建成功'
    })
  } catch (error) {
    console.error('创建空间错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
} 