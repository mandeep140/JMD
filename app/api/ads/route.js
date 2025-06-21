import connectDB from "@/utils/connectdb";
import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function validateAdData(adData) {
    // List all required fields
    const requiredFields = [
        "mediacode", "title", "city", "lighting", "status", "size",
        "type", "priceperday", "pricepermonth", "locationmap",
        "message", "imageUrl", "longitude", "latitude"
    ];
    for (const field of requiredFields) {
        if (!adData[field] || adData[field].toString().trim() === "") {
            return `Missing or empty required field: ${field}`;
        }
    }
    // Validate coordinates as numbers
    if (isNaN(Number(adData.latitude)) || isNaN(Number(adData.longitude))) {
        return "Latitude and Longitude must be numbers";
    }
    return null;
}

export async function GET(request) {
    const dateParam = request.nextUrl.searchParams.get("date");
    if (dateParam) {
        try {
            await connectDB();

            // If dateParam is a number, treat it as "last N days"
            if (!isNaN(Number(dateParam))) {
                const days = Number(dateParam);
                const now = new Date();
                const from = new Date();
                from.setDate(now.getDate() - days + 1); // include today

                // Set from to 00:00:00 and now to 23:59:59 for full day coverage
                from.setHours(0, 0, 0, 0);
                now.setHours(23, 59, 59, 999);

                const ads = await Ads.find({
                    date: { $gte: from, $lte: now }
                }).sort({ date: -1 });

                return NextResponse.json(ads, { status: 200 });
            }

            // Otherwise, treat as a specific date (YYYY-MM-DD)
            const start = new Date(dateParam);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateParam);
            end.setHours(23, 59, 59, 999);

            const ads = await Ads.find({
                date: { $gte: start, $lt: end }
            }).sort({ date: -1 });

            return NextResponse.json(ads, { status: 200 });
        } catch (error) {
            console.error("Error fetching ads by date:", error);
            return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
        }
    }
    // Default: return all ads
    try {
        await connectDB();
        const ads = await Ads.find({}).sort({ date: -1 });
        return NextResponse.json(ads, { status: 200 });
    } catch (error) {
        console.error("Error fetching ads:", error);
        return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        // Check if user is authenticated
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

        // Prepare coordinates for schema
        adData.codinates = {
            lat: Number(adData.latitude),
            lng: Number(adData.longitude),
        };

        const newAd = new Ads(adData);
        await newAd.save();
        return NextResponse.json(newAd, { status: 201 });
    } catch (error) {
        console.error("Error creating ad:", error);
        // Handle duplicate mediacode error
        if (error.code === 11000) {
            return NextResponse.json({ error: "Media code must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { mediacode } = await request.json();
        if (!mediacode) {
            return NextResponse.json({ error: "Media code is required" }, { status: 400 });
        }

        const deleted = await Ads.findOneAndDelete({ mediacode });
        if (!deleted) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Ad deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting ad:", error);
        return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
    }
}