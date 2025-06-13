import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}