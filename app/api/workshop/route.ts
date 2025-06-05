import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const workshops = await prisma.workshop.findMany();
  return NextResponse.json(workshops);
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const eventCode = formData.get('eventCode') as string;
  const clubName = formData.get('clubName') as string;
  const leaderName = formData.get('leaderName') as string;
  const workshopSlug = formData.get('workshopSlug') as string;

  if (!eventCode || !workshopSlug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Get user ID from session
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    const userId = Number(session?.value);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert workshopSlug to workshop ID
    const workshopId = parseInt(workshopSlug);
    
    if (isNaN(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop ID' }, { status: 400 });
    }
    
    // Find the existing workshop
    const existingWorkshop = await prisma.workshop.findUnique({
      where: { id: workshopId }
    });

    if (!existingWorkshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Create or update the user workshop submission
    const userWorkshop = await prisma.userWorkshop.upsert({
      where: { 
        userId_workshopId: {
          userId: userId,
          workshopId: workshopId
        }
      },
      update: {
        completed: true,
        submissionDate: new Date(),
        eventCode: eventCode,
      },
      create: {
        userId: userId,
        workshopId: workshopId,
        completed: true,
        submissionDate: new Date(),
        eventCode: eventCode,
      },
    });

    return NextResponse.json(userWorkshop, { status: 200 });
  } catch (error) {
    console.error('Workshop submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}