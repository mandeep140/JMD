import Booking from "@/Schema/BookingSchema";
import connectdb from "@/utils/connectdb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendBookingFormNotification } from "@/utils/emailService";

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

        // Create new booking
        const newBooking = new Booking({
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
            callback
        });

        await newBooking.save();

        // Send email notification to admin
        try {
            await sendBookingFormNotification({
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
                callback
            });
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({ message: "Booking request submitted successfully.", reqid }, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: "Failed to create booking request." }, { status: 500 });
    }
}

export async function DELETE(request) {
    await connectdb();
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { reqid } = body;

        if (!reqid) {
            return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
        }

        const deletedBooking = await Booking.findOneAndDelete({ reqid });
        if (!deletedBooking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Booking deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error deleting booking:", error);
        return NextResponse.json({ error: "Failed to delete booking." }, { status: 500 });
    }
}

export async function PUT(request) {
    await connectdb();
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { reqid, status } = body;

        if (!reqid || !status) {
            return NextResponse.json({ error: "Request ID and status are required." }, { status: 400 });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            { reqid },
            { status },
            { new: true }
        );

        if (!updatedBooking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Booking status updated successfully.", booking: updatedBooking }, { status: 200 });
    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json({ error: "Failed to update booking status." }, { status: 500 });
    }
}