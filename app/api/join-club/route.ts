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

  let club = await prisma.club.findUnique({
    where: { clubCode: parseInt(clubCode) },
  });

  if (!club) {
    let page = 1;
    let clubs: any[] = [];

    while (true) {
      const res = await fetch(`https://dashboard.hackclub.com/api/v1/clubs?page=${page}&per_page=100`, {
        headers: {
          Authorization: `Bearer ${process.env.HC_API_KEY}`,
        },
      });
      const data = await res.json();
      clubs = clubs.concat(data.clubs);

      if (!data.pagination?.has_next) break;
      page++;
    }

    const match = clubs.find((c: any) => c.id.toString() === clubCode);

    if (!match) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    club = await prisma.club.create({
      data: {
        name: match.name,
        clubCode: match.id,
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
