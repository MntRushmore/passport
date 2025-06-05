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

    // Get workshops available to this user
    const workshops = await prisma.workshop.findMany({
      where: {
        OR: [
          { clubCode: "global" },
          ...(clubCode ? [{ clubCode: clubCode }] : [])
        ]
      }
    });

    // Get user's workshop submissions
    const userWorkshops = await prisma.userWorkshop.findMany({
      where: { userId: userId },
      include: { workshop: true }
    });

    // Create a map of workshop submissions by workshop ID
    const submissionMap = new Map(
      userWorkshops.map((uw: any) => [uw.workshopId, uw])
    );

    // Merge workshop data with user submission data
    const workshopsWithUserData = workshops.map((workshop: any) => {
      const userSubmission: any = submissionMap.get(workshop.id);
      return {
        id: workshop.id.toString(), // Convert to string for component compatibility
        title: workshop.title,
        emoji: workshop.emoji,
        description: workshop.description,
        clubCode: workshop.clubCode,
        completed: userSubmission?.completed || false,
        submissionDate: userSubmission?.submissionDate?.toISOString().split('T')[0] || null, // Format as YYYY-MM-DD
        eventCode: userSubmission?.eventCode || null,
        // Add default values for passport page compatibility
        difficulty: "intermediate" as const,
        duration: "2-3 hours",
        skills: ["Coding", "Problem Solving"]
      };
    });

    return NextResponse.json(workshopsWithUserData);
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
