import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get user ID from session
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    const userId = Number(session?.value);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and their club info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { club: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clubCode = user.club?.clubCode;

    // Fetch workshops and include only this user's submissions
    const rawWorkshops = await prisma.workshop.findMany({
      where: {
        OR: [
          { clubCode: 'global' },
          ...(clubCode ? [{ clubCode }] : []),
        ],
      },
      include: {
        userWorkshops: {
          where: { userId },
          select: { completed: true, submissionDate: true, eventCode: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Merge workshop data with user-specific submission data
    const workshopsWithUserData = rawWorkshops.map(w => {
      const uw = w.userWorkshops[0];
      return {
        id: w.id.toString(),
        title: w.title,
        emoji: w.emoji,
        description: w.description,
        clubCode: w.clubCode,
        completed: uw?.completed ?? false,
        submissionDate: uw?.submissionDate
          ? uw.submissionDate.toISOString().split('T')[0]
          : null,
        eventCode: uw?.eventCode ?? null,
        difficulty: "intermediate" as const,
        duration: "2-3 hours",
        skills: ["Coding", "Problem Solving"],
      };
    });

    return NextResponse.json(workshopsWithUserData);
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
