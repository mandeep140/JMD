import { NextResponse } from "next/server";
import connectdb from "@/utils/connectdb";
import Conversion from "@/Schema/ConversionSchema";

export async function POST(request) {
    await connectdb();
    const { type } = await request.json();
    let update = {};
    if (type === "visitor") update = { $inc: { visitor: 1 } };
    if (type === "book") update = { $inc: { book: 1 } };
    if (!update.$inc) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    // Always update the same document (singleton pattern)
    const doc = await Conversion.findOneAndUpdate({}, update, { upsert: true, new: true });
    return NextResponse.json({ success: true, doc });
}

export async function GET() {
    await connectdb();
    const doc = await Conversion.findOne({});
    if (!doc) {
        return NextResponse.json({ error: "No conversion data found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, doc });
}