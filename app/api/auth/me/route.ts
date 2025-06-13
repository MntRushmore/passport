import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let userId: number | undefined;
  try {
    const parsed = JSON.parse(session.value);
    userId = parsed?.user?.id;
  } catch {
    return NextResponse.json({ error: 'Invalid session format' }, { status: 401 });
  }

  if (!userId || isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid userId in session' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { club: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      club: user.club,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
