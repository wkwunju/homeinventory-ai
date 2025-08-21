import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 环境未配置' }, { status: 500 })
    }
    
    // 获取用户会话
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const spaceId = params.id

    // 获取空间信息（可能是房间或位置）
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .eq('user_id', user.id)
      .single()

    if (spaceError || !space) {
      return NextResponse.json(
        { error: '空间不存在或不属于当前用户' },
        { status: 404 }
      )
    }

    // 如果是房间（level=1），获取房间内的位置
    if (space.level === 1) {
      const { data: locations, error: locationsError } = await supabase
        .from('spaces')
        .select('*')
        .eq('parent_id', spaceId)
        .eq('user_id', user.id)
        .eq('level', 2)
        .order('name', { ascending: true })

      if (locationsError) {
        console.error('获取位置失败:', locationsError)
        return NextResponse.json(
          { error: '获取位置失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        room: space,
        locations: locations || []
      })
    } else {
      // 如果是位置（level=2），返回位置信息
      return NextResponse.json({
        room: space,
        locations: []
      })
    }
  } catch (error) {
    console.error('获取房间详情错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 环境未配置' }, { status: 500 })
    }
    
    // 获取用户会话
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 首先检查空间是否存在且属于当前用户
    const { data: space, error: fetchError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !space) {
      return NextResponse.json({ error: '空间不存在' }, { status: 404 })
    }

    // 如果是房间（level=1），需要先删除所有子位置
    if (space.level === 1) {
      // 删除所有子位置
      const { error: deleteChildrenError } = await supabase
        .from('spaces')
        .delete()
        .eq('parent_id', params.id)
        .eq('user_id', user.id)

      if (deleteChildrenError) {
        console.error('删除子位置失败:', deleteChildrenError)
        return NextResponse.json({ error: '删除子位置失败' }, { status: 500 })
      }
    }

    // 删除空间本身
    const { error: deleteError } = await supabase
      .from('spaces')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('删除空间失败:', deleteError)
      return NextResponse.json({ error: '删除空间失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除空间失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 