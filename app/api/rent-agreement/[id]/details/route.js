import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import HoardingRent from '@/Schema/HoardingRentSchema';

// POST - Add new detail to rent agreement
export async function POST(request, { params }) {
    try {
        await connectdb();
        const { id } = params;
        const detailData = await request.json();
        
        const updatedAgreement = await HoardingRent.findByIdAndUpdate(
            id,
            { $push: { moreDetails: detailData } },
            { new: true, runValidators: true }
        );
        
        if (!updatedAgreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedAgreement);
    } catch (error) {
        console.error('Error adding detail:', error);
        return NextResponse.json({ error: 'Failed to add detail' }, { status: 500 });
    }
}

// PUT - Update specific detail in rent agreement
export async function PUT(request, { params }) {
    try {
        await connectdb();
        const { id } = params;
        const { detailId, ...updateData } = await request.json();
        
        const updatedAgreement = await HoardingRent.findOneAndUpdate(
            { _id: id, "moreDetails._id": detailId },
            { $set: { "moreDetails.$": { ...updateData, _id: detailId } } },
            { new: true, runValidators: true }
        );
        
        if (!updatedAgreement) {
            return NextResponse.json({ error: 'Rent agreement or detail not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedAgreement);
    } catch (error) {
        console.error('Error updating detail:', error);
        return NextResponse.json({ error: 'Failed to update detail' }, { status: 500 });
    }
}

// DELETE - Delete specific detail from rent agreement
export async function DELETE(request, { params }) {
    try {
        await connectdb();
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const detailId = searchParams.get('detailId');
        
        const updatedAgreement = await HoardingRent.findByIdAndUpdate(
            id,
            { $pull: { moreDetails: { _id: detailId } } },
            { new: true }
        );
        
        if (!updatedAgreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedAgreement);
    } catch (error) {
        console.error('Error deleting detail:', error);
        return NextResponse.json({ error: 'Failed to delete detail' }, { status: 500 });
    }
}