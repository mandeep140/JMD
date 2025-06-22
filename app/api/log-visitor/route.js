import { NextResponse } from "next/server";
import connectdb from "@/utils/connectdb";
import City from "@/Schema/CitySchema";

export async function POST(request) {
    await connectdb();
    try {
        const { city } = await request.json();
        if (!city) {
            return NextResponse.json({ error: "City is required" }, { status: 400 });
        }
        // Try to increment if exists, else create
        const updated = await City.findOneAndUpdate(
            { name: city },
            { $inc: { count: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return NextResponse.json({ success: true, city: updated }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log city" }, { status: 500 });
    }
}

export async function GET() {
    await connectdb();
    try {
        const cities = await City.find().sort({ count: -1 }).limit(3);
        return NextResponse.json(cities, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
    }
}