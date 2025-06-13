import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const cookie = cookies().get("session")?.value;
  const session = cookie ? JSON.parse(cookie) : null;
  console.log("🔍 Raw session cookie:", cookie);
  console.log("🔍 Parsed session object:", session);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const clubCode = formData.get("clubCode");

  if (typeof clubCode !== "string") {
    return NextResponse.json({ error: "Missing clubCode" }, { status: 400 });
  }

  const club = await prisma.club.findUnique({
    where: { clubCode },
  });

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { email },
    data: { club: { connect: { id: club.id } } },
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
