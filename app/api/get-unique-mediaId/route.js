import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import connectDB from "@/utils/connectdb";

export async function GET(request) {
    await connectDB();

    // Find the ad with the highest mediaId number
    const lastAd = await Ads.findOne({ mediaId: { $regex: /^JMD\d{4}$/ } })
        .sort({ mediaId: -1 })
        .lean();

    let nextNum = 1;
    if (lastAd && lastAd.mediaId) {
        // Extract the numeric part
        const match = lastAd.mediaId.match(/^JMD(\d{4})$/);
        if (match) {
            nextNum = parseInt(match[1], 10) + 1;
        }
    }

    let id;
    // Find the next available mediaId
    while (true) {
        id = `JMD${nextNum.toString().padStart(4, "0")}`;
        const exists = await Ads.findOne({ mediaId: id });
        if (!exists) break;
        nextNum++;
    }

    return NextResponse.json({ mediaId: id });
}