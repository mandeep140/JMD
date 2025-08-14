import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import connectDB from "@/utils/connectdb";

export async function GET(request) {
    await connectDB();
    let id;
    while (true) {
        // Generate a number between 1 and 9999, pad with zeros to 4 digits
        const num = Math.floor(Math.random() * 9999) + 1;
        id = `JMD${num.toString().padStart(4, "0")}`;
        const existingAd = await Ads.findOne({ mediaId: id });
        if (!existingAd) break;
    }
    return NextResponse.json({ mediaId: id });
}