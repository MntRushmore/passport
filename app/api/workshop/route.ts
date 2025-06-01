import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET() {
  const workshops = await prisma.workshop.findMany();
  return NextResponse.json(workshops);
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const title = formData.get('workshopSlug') as string;
  const description = formData.get('eventCode') as string;

  if (!title || !description) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newWorkshop = await prisma.workshop.create({
    data: {
      title,
      description,
    },
  });

  return NextResponse.json(newWorkshop, { status: 201 });
}