import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const workshops = await prisma.workshop.findMany();
  return NextResponse.json(workshops);
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const emoji = formData.get('emoji') as string;
  const clubCode = (formData.get('clubCode') as string) || "global";

  if (!title || !description || !emoji) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newWorkshop = await prisma.workshop.create({
    data: {
      title,
      description,
      emoji,
      clubCode,
      completed: false,
      submissionDate: null,
    },
  });

  return NextResponse.json(newWorkshop, { status: 201 });
}