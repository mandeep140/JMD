import connectDB from "@/utils/connectdb";
import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Validation function (updated for new fields)
function validateAdData(adData) {
    // "date" field removed as per your latest frontend (no date field in form)
    const requiredFields = [
        "mediacode", "title", "city", "lighting", "status", "size",
        "type", "priceperday",
        "pricepermonth", "locationmap", "show", "message", "imageUrl", "imageId"
    ];
    for (const field of requiredFields) {
        if (
            adData[field] === undefined ||
            adData[field] === null ||
            adData[field].toString().trim() === ""
        ) {
            return `Missing or empty required field: ${field}`;
        }
    }
    // No longitude/latitude/date validation anymore
    return null;
}

// GET /api/ads/update?mediacode=...
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const mediacode = searchParams.get("mediacode");
        if (!mediacode) {
            return NextResponse.json({ error: "mediacode is required" }, { status: 400 });
        }
        const ad = await Ads.findOne({ mediacode });
        if (!ad) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }
        return NextResponse.json(ad, { status: 200 });
    } catch (error) {
        console.error("Error fetching ad:", error);
        return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
    }
}

// PUT /api/ads/update
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const adData = await request.json();

        // Validate required fields
        const validationError = validateAdData(adData);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // Find and update the ad by mediacode
        const updatedAd = await Ads.findOneAndUpdate(
            { mediacode: adData.mediacode },
            adData,
            { new: true, runValidators: true }
        );
        if (!updatedAd) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }
        return NextResponse.json(updatedAd, { status: 200 });
    } catch (error) {
        console.error("Error updating ad:", error);
        return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
    }
}