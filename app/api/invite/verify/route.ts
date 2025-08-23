import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json().catch(() => ({ code: '' }))

    const raw = process.env.INVITE_CODES || ''
    const codes = raw
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean)

    if (codes.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invites closed' }, { status: 403 })
    }

    const isValid = typeof code === 'string' && codes.includes(code.toLowerCase())
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 })
  }
}

export const dynamic = 'force-dynamic'

