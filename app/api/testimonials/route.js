import { NextResponse } from 'next/server';
import connectDB from '@/utils/connectdb';
import Testimonial from '@/Schema/TestimonialSchema';

export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('showAll');
        
        let query = {};
        if (showAll !== 'true') {
            query.active = true;
        }
        
        const testimonials = await Testimonial.find(query).sort({ order: 1, createdAt: -1 });
        
        return NextResponse.json({ 
            success: true, 
            testimonials 
        });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch testimonials' 
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        const { name, designation, message, active, order } = data;
        
        if (!name || !designation || !message) {
            return NextResponse.json({ 
                success: false, 
                message: 'Name, designation, and message are required' 
            }, { status: 400 });
        }
        
        const testimonial = new Testimonial({
            name,
            designation,
            message,
            active: active !== undefined ? active : true,
            order: order || 0
        });
        
        await testimonial.save();
        
        return NextResponse.json({ 
            success: true, 
            message: 'Testimonial created successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to create testimonial' 
        }, { status: 500 });
    }
}