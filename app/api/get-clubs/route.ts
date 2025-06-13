

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch("https://dashboard.hackclub.com/api/v1/clubs?per_page=100", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch clubs" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data.clubs);
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}