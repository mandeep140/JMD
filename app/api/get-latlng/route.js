import { NextResponse } from 'next/server';
import fetch from 'node-fetch'; // Only needed in Node <18, optional in Next.js

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url.startsWith("https://maps.app.goo.gl")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    const redirectedUrl = res.url;

    // Try extracting coordinates from the final URL
    const match = redirectedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) {
      return NextResponse.json({ error: "Coordinates not found in resolved URL" }, { status: 400 });
    }

    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    return NextResponse.json({ lat, lng });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong", details: err.message }, { status: 500 });
  }
}
