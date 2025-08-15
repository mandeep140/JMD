import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/connectdb';
import MediaCoverage from '@/Schema/MediaCoverageSchema';
import ImageKit from 'imagekit';
import { getServerSession } from 'next-auth';

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// GET - Fetch all media coverage items
export async function GET() {
    try {
        await connectDB();
        
        const mediaItems = await MediaCoverage.find()
            .sort({ order: 1, createdAt: -1 });
            
        return NextResponse.json({
            success: true,
            items: mediaItems
        });
    } catch (error) {
        console.error('Error fetching media coverage:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch media coverage' },
            { status: 500 }
        );
    }
}

// POST - Create new media coverage item
export async function POST(request) {
    try {
        await connectDB();
        
        const { title, imageUrl, imageId, order = 0 } = await request.json();
        
        if (!title || !imageUrl || !imageId) {
            return NextResponse.json(
                { success: false, message: 'Title, imageUrl, and imageId are required' },
                { status: 400 }
            );
        }
        
        const newMediaItem = new MediaCoverage({
            title,
            imageUrl,
            imageId,
            order
        });
        
        const savedItem = await newMediaItem.save();
        
        return NextResponse.json({
            success: true,
            message: 'Media coverage item created successfully',
            item: savedItem
        });
    } catch (error) {
        console.error('Error creating media coverage:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create media coverage item' },
            { status: 500 }
        );
    }
}

// PUT - Update media coverage item
export async function PUT(request) {
    try {
        await connectDB();
        
        const { id, title, imageUrl, imageId, order, active } = await request.json();
        
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Item ID is required' },
                { status: 400 }
            );
        }
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (imageId !== undefined) updateData.imageId = imageId;
        if (order !== undefined) updateData.order = order;
        if (active !== undefined) updateData.active = active;
        
        const updatedItem = await MediaCoverage.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!updatedItem) {
            return NextResponse.json(
                { success: false, message: 'Media coverage item not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: 'Media coverage item updated successfully',
            item: updatedItem
        });
    } catch (error) {
        console.error('Error updating media coverage:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update media coverage item' },
            { status: 500 }
        );
    }
}

// DELETE - Delete media coverage item
export async function DELETE(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!session.user.isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Forbidden' },
                { status: 403 }
            );
        }

        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Item ID is required' },
                { status: 400 }
            );
        }
        
        // Find the item to get imageId for deletion from ImageKit
        const mediaItem = await MediaCoverage.findById(id);
        
        if (!mediaItem) {
            return NextResponse.json(
                { success: false, message: 'Media coverage item not found' },
                { status: 404 }
            );
        }
        
        // Delete image from ImageKit
        try {
            if (mediaItem.imageId) {
                await imagekit.deleteFile(mediaItem.imageId);
                console.log('Image deleted from ImageKit:', mediaItem.imageId);
            }
        } catch (imagekitError) {
            console.error('Error deleting image from ImageKit:', imagekitError);
            // Continue with database deletion even if ImageKit deletion fails
        }
        
        // Delete from database
        await MediaCoverage.findByIdAndDelete(id);
        
        return NextResponse.json({
            success: true,
            message: 'Media coverage item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting media coverage:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete media coverage item' },
            { status: 500 }
        );
    }
}