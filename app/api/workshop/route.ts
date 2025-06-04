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

  // Create a workshop submission record
  const workshop = await prisma.workshop.create({
    data: {
      title: workshopSlug,
      description: `Workshop submission for ${workshopSlug}`,
      emoji: "🎯",
      clubCode: eventCode,
      completed: true,
      submissionDate: new Date(),
    },
  });

  return NextResponse.json(workshop, { status: 201 });
}