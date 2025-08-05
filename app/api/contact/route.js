import Contacts from "@/Schema/ContactSchema";
import connectdb from "@/utils/connectdb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendContactFormNotification } from "@/utils/emailService";

export async function POST(request) {
    await connectdb();
    try {
        const body = await request.json();
        const { name, email, phone, message, callback } = body;

        // Basic validation
        if (!name || !email || !phone || !callback || !message) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Generate unique reqid: CON + YYYYMMDD + 4 random digits
        let reqid;
        let exists = true;
        while (exists) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const rand = Math.floor(1000 + Math.random() * 9000); // 4 random digits
            reqid = `CON${year}${month}${day}${rand}`;
            exists = await Contacts.exists({ reqid });
        }

        // Create new contact
        const newContact = new Contacts({
            reqid,
            name,
            email,
            phone,
            message,
            callback
        });

        await newContact.save();

        // Send email notification to admin
        try {
            await sendContactFormNotification({
                reqid,
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

        return NextResponse.json({ message: "Contact request submitted successfully.", reqid }, { status: 201 });
    } catch (error) {
        console.error("Error creating contact:", error);
        return NextResponse.json({ error: "Failed to create contact request." }, { status: 500 });
    }
}

export async function GET() {
    await connectdb();
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contacts = await Contacts.find().sort({ createdAt: -1 });
        return NextResponse.json(contacts, { status: 200 });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Failed to fetch contacts." }, { status: 500 });
    }
}

export async function DELETE(request) {
    await connectdb();
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        if (!session.user.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { reqid } = body;

        if (!reqid) {
            return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
        }

        const deletedContact = await Contacts.findOneAndDelete({ reqid });
        if (!deletedContact) {
            return NextResponse.json({ error: "Contact not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Contact deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json({ error: "Failed to delete contact." }, { status: 500 });
    }
}