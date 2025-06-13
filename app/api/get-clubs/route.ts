import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.HC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const endpoint = process.env.HC_API_URL || "https://dashboard.hackclub.com/api/v1/clubs?per_page=100";
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Fetch failed", res.status, errorText);
      return NextResponse.json({ error: "Failed to fetch clubs" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ clubs: data.clubs });
  } catch (err) {
    console.error("Internal error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}