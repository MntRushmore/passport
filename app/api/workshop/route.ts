import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    // Convert workshopSlug to workshop ID
    const workshopId = parseInt(workshopSlug);
    
    // Find the existing workshop
    const existingWorkshop = await prisma.workshop.findUnique({
      where: { id: workshopId }
    });

    if (!existingWorkshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Update the workshop to mark it as completed
    const workshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        completed: true,
        submissionDate: new Date(),
        clubCode: eventCode,
      },
    });

    return NextResponse.json(workshop, { status: 200 });
  } catch (error) {
    console.error('Workshop submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}