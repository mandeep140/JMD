import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import Video from '@/Schema/VideoSchema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Helper function to generate thumbnail URL
function generateThumbnailUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Helper function to generate embed URL
function generateEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}?si=auto_generated`;
}

// GET - Fetch videos (with optional filtering)
export async function GET(request) {
    try {
        await connectdb();
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('showAll');
        
        // If showAll is true (for admin), show all videos, otherwise show only active ones
        const filter = showAll === 'true' ? {} : { isActive: true };
        
        const videos = await Video.find(filter)
            .sort({ order: 1, createdAt: -1 });

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }
}

// POST - Create new video (Admin only)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectdb();
        
        // Check if current user is admin
        if (!session.user.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { title, youtubeUrl, order } = await request.json();

        // Validate required fields
        if (!title || !youtubeUrl) {
            return NextResponse.json({ error: 'Title and YouTube URL are required' }, { status: 400 });
        }

        // Extract video ID
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // Generate URLs
        const embedUrl = generateEmbedUrl(videoId);
        const thumbnailUrl = generateThumbnailUrl(videoId);

        // Create new video
        const newVideo = new Video({
            title,
            youtubeUrl,
            videoId,
            embedUrl,
            thumbnailUrl,
            order: order || 0
        });

        await newVideo.save();

        return NextResponse.json({ 
            message: 'Video added successfully', 
            video: newVideo 
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }
}

// PUT - Update video (Admin only)
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectdb();
        
        // Check if current user is admin
        if (!session.user.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { videoId: id, title, youtubeUrl, order, isActive } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        const updateData = { updatedAt: new Date() };
        
        if (title) updateData.title = title;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (typeof order === 'number') updateData.order = order;

        // If YouTube URL is being updated
        if (youtubeUrl) {
            const extractedVideoId = extractVideoId(youtubeUrl);
            if (!extractedVideoId) {
                return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
            }
            
            updateData.youtubeUrl = youtubeUrl;
            updateData.videoId = extractedVideoId;
            updateData.embedUrl = generateEmbedUrl(extractedVideoId);
            updateData.thumbnailUrl = generateThumbnailUrl(extractedVideoId);
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Video updated successfully', 
            video: updatedVideo 
        });

    } catch (error) {
        console.error('Error updating video:', error);
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }
}

// DELETE - Delete video (Admin only)
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectdb();
        
        // Check if current user is admin
        if (!session.user.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { videoId } = await request.json();

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        const deletedVideo = await Video.findByIdAndDelete(videoId);

        if (!deletedVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Video deleted successfully' });

    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }
}