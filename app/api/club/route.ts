mport { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, code } = body;

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
  }

  const cookieStore = cookies();
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
        user: {
          connect: {
            id: Number(userId),
          },
        },
      },
    });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        clubCode: newClub.clubCode,
      },
    });

    return NextResponse.json({ success: true, club: newClub });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json({ error: "Failed to create club." }, { status: 500 });
  }
}