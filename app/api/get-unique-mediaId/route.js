import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import connectDB from "@/utils/connectdb";

export async function GET(request) {
    await connectDB();

    // Get all ads with JMD format and extract their numbers
    const allAds = await Ads.find({ mediacode: { $regex: /^JMD\d{4}$/ } }, { mediacode: 1 })
        .lean();

    let highestNum = 0;
    
    // Find the highest number
    allAds.forEach(ad => {
        const match = ad.mediacode.match(/^JMD(\d{4})$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > highestNum) {
                highestNum = num;
            }
        }
    });

    let nextNum = highestNum + 1;
    if (nextNum > 9999) nextNum = 1;

    let id;
    // Find the next available mediacode
    while (true) {
        id = `JMD${nextNum.toString().padStart(4, "0")}`;
        const exists = await Ads.findOne({ mediacode: id });
        if (!exists) break;
        nextNum++;
        if (nextNum > 9999) nextNum = 1; // wrap around if needed
    }

    return NextResponse.json({ mediaId: id });
}