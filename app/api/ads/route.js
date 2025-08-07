import connectDB from "@/utils/connectdb";
import { NextResponse } from "next/server";
import Ads from "@/Schema/AdSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import imagekit from "@/utils/imagekit";
import { logAdChange } from "@/utils/historyHelper";

function validateAdData(adData) {
    // Only fields that are always required
    const requiredFields = [
        "mediacode", "title", "city", "lighting", "status", "size",
        "type", "pricepermonth",
        "message", "imageUrl", "show"
    ];
    for (const field of requiredFields) {
        if (!adData[field] || adData[field].toString().trim() === "") {
            return `Missing or empty required field: ${field}`;
        }
    }
    return null;
}

export async function GET(request) {
    await connectDB();
    const mediacode = request.nextUrl.searchParams.get("mediacode");
    
    if (mediacode) {
        // Check if this is for availability check (exact match)
        const checkAvailability = request.nextUrl.searchParams.get("check");
        
        if (checkAvailability === "availability") {
            // For availability check, do exact match
            const existingAd = await Ads.findOne({ mediacode: mediacode });
            return NextResponse.json({ 
                exists: !!existingAd,
                mediacode: mediacode
            }, { status: 200 });
        } else {
            // For search, do regex match
            const ads = await Ads.find({ mediacode: { $regex: mediacode, $options: "i" } }).limit(10);
            return NextResponse.json(ads, { status: 200 });
        }
    }

    const topThreeParam = request.nextUrl.searchParams.get("topthree");
    if (topThreeParam) {
        try {
            await connectDB();
            const ads = await Ads.find({})
                .sort({ views: -1 })
                .limit(3);
            return NextResponse.json(ads, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch top ads" }, { status: 500 });
        }
    }

    const dateParam = request.nextUrl.searchParams.get("date");
    if (dateParam) {
        try {
            await connectDB();

            // If dateParam is a number, treat it as "last N days"
            if (!isNaN(Number(dateParam))) {
                const lastNDays = Number(dateParam);
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - lastNDays);
                
                const ads = await Ads.find({
                    date: { $gte: startDate }
                }).sort({ date: -1 });
                
                return NextResponse.json(ads, { status: 200 });
            }
            
            // Otherwise, treat it as a specific date
            const startDate = new Date(dateParam);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const ads = await Ads.find({
                date: {
                    $gte: startDate,
                    $lt: endDate
                }
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

        // Save everything (including optional/extra fields like coordinates)
        const newAd = new Ads(adData);
        const savedAd = await newAd.save();

        // Log history - only add this
        await logAdChange('CREATE', savedAd, null, {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email
        }, request);

        return NextResponse.json(savedAd, { status: 201 });
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

        // Check if user is admin
        if (!session.user.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();
        const { mediacode } = await request.json();
        if (!mediacode) {
            return NextResponse.json({ error: "Media code is required" }, { status: 400 });
        }

        // Get old data for history - only add this line
        const oldAd = await Ads.findOne({ mediacode }).lean();

        const deleted = await Ads.findOneAndDelete({ mediacode });
        if (!deleted) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }
        if (deleted.imageId) {
            await imagekit.deleteFile(deleted.imageId);
        }

        // Log history - only add this
        if (oldAd) {
            await logAdChange('DELETE', oldAd, null, {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email
            }, request);
        }

        return NextResponse.json({ message: "Ad deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting ad:", error);
        return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const { mediacode } = await request.json();
        if (!mediacode) {
            return NextResponse.json({ error: "Media code is required" }, { status: 400 });
        }
        const updated = await Ads.findOneAndUpdate(
            { mediacode },
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!updated) {
            return NextResponse.json({ error: "Ad not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "View count incremented", views: updated.views }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
    }
}