import { NextResponse } from 'next/server';
import connectDB from '@/utils/connectdb';
import Testimonial from '@/Schema/TestimonialSchema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request, { params }) {
    try {
        await connectDB();
        
        const { id } = params;
        const data = await request.json();
        
        const testimonial = await Testimonial.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
        
        if (!testimonial) {
            return NextResponse.json({ 
                success: false, 
                message: 'Testimonial not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Testimonial updated successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to update testimonial' 
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
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
        
        const { id } = params;
        
        const testimonial = await Testimonial.findByIdAndDelete(id);
        
        if (!testimonial) {
            return NextResponse.json({ 
                success: false, 
                message: 'Testimonial not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to delete testimonial' 
        }, { status: 500 });
    }
}