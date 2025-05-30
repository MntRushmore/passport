import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as {
      id: string
      name: string
      email: string
      avatar?: string
      role?: string
      clubId?: string
      isNewUser?: boolean
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      role: user.role || null,
      clubId: user.clubId || null,
      isNewUser: user.isNewUser ?? false,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}