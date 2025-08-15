const mongoose = require('mongoose');

const MediaCoverageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    imageUrl: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        required: true // For ImageKit deletion
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
MediaCoverageSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.models.MediaCoverage || mongoose.model('MediaCoverage', MediaCoverageSchema);