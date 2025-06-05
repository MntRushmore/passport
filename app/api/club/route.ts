import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, code } = body;

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const userId = session?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newClub = await prisma.club.create({
      data: {
        name,
        clubCode: code,
        userId: Number(userId),
      },
    });

    return NextResponse.json({ success: true, club: newClub });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json({ error: "Failed to create club." }, { status: 500 });
  }
}