import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import HoardingRent from '@/Schema/HoardingRentSchema';

// GET - Fetch all rent agreements
export async function GET() {
    try {
        await connectdb();
        const rentAgreements = await HoardingRent.find().sort({ createdAt: -1 });
        return NextResponse.json(rentAgreements);
    } catch (error) {
        console.error('Error fetching rent agreements:', error);
        return NextResponse.json({ error: 'Failed to fetch rent agreements' }, { status: 500 });
    }
}

// POST - Create new rent agreement
export async function POST(request) {
    try {
        await connectdb();
        const data = await request.json();
        
        // Check if adCode already exists
        const existingAgreement = await HoardingRent.findOne({ adCode: data.adCode });
        if (existingAgreement) {
            return NextResponse.json({ error: 'Ad Code already exists' }, { status: 400 });
        }
        
        const newRentAgreement = new HoardingRent(data);
        await newRentAgreement.save();
        
        return NextResponse.json(newRentAgreement, { status: 201 });
    } catch (error) {
        console.error('Error creating rent agreement:', error);
        return NextResponse.json({ error: 'Failed to create rent agreement' }, { status: 500 });
    }
}

// PUT - Update rent agreement
export async function PUT(request) {
    try {
        await connectdb();
        const data = await request.json();
        const { _id, ...updateData } = data;
        
        const updatedAgreement = await HoardingRent.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedAgreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedAgreement);
    } catch (error) {
        console.error('Error updating rent agreement:', error);
        return NextResponse.json({ error: 'Failed to update rent agreement' }, { status: 500 });
    }
}

// DELETE - Delete rent agreement
export async function DELETE(request) {
    try {
        await connectdb();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        const deletedAgreement = await HoardingRent.findByIdAndDelete(id);
        
        if (!deletedAgreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Rent agreement deleted successfully' });
    } catch (error) {
        console.error('Error deleting rent agreement:', error);
        return NextResponse.json({ error: 'Failed to delete rent agreement' }, { status: 500 });
    }
}