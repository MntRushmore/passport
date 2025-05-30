import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(req: NextRequest) {
  console.log("🔥 /api/auth/user route hit")
  const allCookies = req.cookies.getAll()
  console.log("🍪 Incoming cookies:", allCookies)
  const token = req.cookies.get('session')?.value
  console.log("🔎 Session token:", token)

  if (!token) {
    console.warn("⚠️ No session token found in cookies")
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
    console.log("✅ JWT verified, user:", user)

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
    console.error("❌ JWT verification failed:", err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}