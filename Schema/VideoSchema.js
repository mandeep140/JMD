import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    youtubeUrl: {
        type: String,
        required: true,
        trim: true
    },
    videoId: {
        type: String,
        required: true,
        trim: true
    },
    embedUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better performance
VideoSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);