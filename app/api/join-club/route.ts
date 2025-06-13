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
  const hcId = formData.get("hcId");

  if (typeof hcId !== "string") {
    return NextResponse.json({ error: "Missing hcId" }, { status: 400 });
  }

  let club = await prisma.club.findUnique({
    where: { hcId: parseInt(hcId) },
  });

  if (!club) {
    const res = await fetch("https://dashboard.hackclub.com/api/v1/clubs", {
      headers: {
        Authorization: `Bearer ${process.env.HC_API_KEY}`,
      },
    });
    const data = await res.json();
    const match = data.clubs.find((c: any) => c.id.toString() === hcId);

    if (!match) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    club = await prisma.club.create({
      data: {
        name: match.name,
        hcId: match.id,
      },
    });
  }

  await prisma.user.update({
    where: { email },
    data: { club: { connect: { id: club.id } } },
  });

  const workshops = await prisma.workshop.findMany();

  await Promise.all(
    workshops.map((workshop) =>
      prisma.userWorkshop.upsert({
        where: {
          userId_workshopId: {
            userId: session.user.id,
            workshopId: workshop.id,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          workshopId: workshop.id,
          status: "INCOMPLETE",
        },
      })
    )
  );

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
