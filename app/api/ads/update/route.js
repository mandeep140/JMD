import connectDB from "@/utils/connectdb";
import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAdChange } from "@/utils/historyHelper";

// Validation function (updated for new fields)
function validateAdData(adData) {
    const requiredFields = [
        "title", "city", "lighting", "status", "size", "state",
        "type", "pricepermonth", "show", "message", "imageUrl", "imageId"
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
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const updateData = await request.json();
        const { mediacode, ...adData } = updateData;

        if (!mediacode) {
            return NextResponse.json({ error: "Media code is required" }, { status: 400 });
        }

        // Validate the ad data
        const validationError = validateAdData(adData);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // Get old data for history comparison
        const oldAd = await Ads.findOne({ mediacode }).lean();
        if (!oldAd) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }

        // Update the ad
        const updatedAd = await Ads.findOneAndUpdate(
            { mediacode },
            { ...adData },
            { new: true, runValidators: true }
        );

        // Log the update in history
        await logAdChange('UPDATE', updatedAd, oldAd, {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email
        }, request);

        return NextResponse.json(updatedAd);
    } catch (error) {
        console.error("Error updating ad:", error);
        if (error.code === 11000 && error.keyPattern?.mediacode) {
            return NextResponse.json({ error: "Media code must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
    }
}