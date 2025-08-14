import { NextResponse } from 'next/server';

export async function DELETE(request) {
    try {
        const { fileId } = await request.json();
        
        if (!fileId) {
            return NextResponse.json(
                { error: 'File ID is required' },
                { status: 400 }
            );
        }

        // Delete file from ImageKit
        const deleteResponse = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ':').toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            console.error('ImageKit delete error:', errorData);
            return NextResponse.json(
                { error: 'Failed to delete image from ImageKit', details: errorData },
                { status: deleteResponse.status }
            );
        }

        return NextResponse.json(
            { message: 'Image deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}