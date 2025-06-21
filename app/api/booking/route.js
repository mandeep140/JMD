import Booking from "@/Schema/BookingSchema";
import connectdb from "@/utils/connectdb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    await connectdb();
    try {
        const reqid = request.nextUrl.searchParams.get("reqid");
        if (reqid) {
            const booking = await Booking.findOne({ reqid });
            if (!booking) {
                return NextResponse.json({ error: "Booking not found." }, { status: 404 });
            }
            return NextResponse.json(booking, { status: 200 });
        } else {
            const bookings = await Booking.find().sort({ date: -1 });
            return NextResponse.json(bookings, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
    }
}

export async function POST(request) {
    await connectdb();
    try {
        const body = await request.json();
        const {
            mediacode,
            mediatype,
            title,
            city,
            status,
            name,
            email,
            phone,
            message,
            callback
        } = body;

        // Basic validation
        if (!mediacode || !mediatype || !title || !city || !status || !name || !email || !phone || !message || !callback) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Generate unique reqid: REQ + YYYYMMDD + 4 random digits
        let reqid;
        let exists = true;
        while (exists) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const rand = Math.floor(1000 + Math.random() * 9000); // 4 random digits
            reqid = `REQ${year}${month}${day}${rand}`;
            exists = await Booking.exists({ reqid });
        }

        const booking = new Booking({
            reqid,
            mediacode,
            mediatype,
            title,
            city,
            status,
            name,
            email,
            phone,
            message,
            callback,
            date: new Date()
        });

        await booking.save();

        return NextResponse.json({ message: "Booking request submitted successfully." }, { status: 201 });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to submit booking." }, { status: 500 });
    }
}

export async function PUT(request) {
    await connectdb();

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { reqid, status } = await request.json();
        const booking = await Booking.findOneAndUpdate({ reqid }, { status }, { new: true });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }
        return NextResponse.json({ message: "Status updated", booking }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
    }
}

export async function DELETE(request) {
    await connectdb();

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { reqid } = await request.json();
        if (!reqid) {
            return NextResponse.json({ error: "reqid is required." }, { status: 400 });
        }
        const deleted = await Booking.findOneAndDelete({ reqid });
        if (!deleted) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }
        return NextResponse.json({ message: "Booking deleted successfully." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete booking." }, { status: 500 });
    }
}