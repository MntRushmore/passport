import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clubCode } = await req.json();

  if (!clubCode) {
    return NextResponse.json({ error: "Missing clubCode" }, { status: 400 });
  }

  const club = await prisma.club.findUnique({
    where: { clubCode },
  });

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { club: { connect: { id: club.id } } },
  });

  return NextResponse.json({ success: true });
}
