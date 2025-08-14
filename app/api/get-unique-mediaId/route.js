import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import connectDB from "@/utils/connectdb";

export async function GET(request) {
    let id = `JMD00${Math.floor(Math.random() * 9000) + 1000}`;
    await connectDB();
    while (true) {
        const existingAd = await Ads.findOne({ mediaId: id });
        if (!existingAd) break;
        id = `JMD00${Math.floor(Math.random() * 9000) + 1000}`;
    }
    return NextResponse.json({ mediaId: id });
}