import mongoose, { Schema } from "mongoose";

const adSchema = new Schema({
    mediacode: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    lighting: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    // New fields - Height and Width stored separately
    height: {
        type: String,
        required: false // Make optional for existing ads
    },
    width: {
        type: String,
        required: false // Make optional for existing ads
    },
    unit: {
        type: Number,
        required: false, // Make optional for existing ads
        default: 1 // Default to 1 unit
    },
    printing: {
        type: String,
        required: false // Make optional for existing ads
    },
    mounting: {
        type: String,
        required: false // Make optional for existing ads
    },
    locality: {
        type: String,
        required: false
    },
    // User who uploaded this ad
    uploadedBy: {
        name: {
            type: String,
            required: false // Optional for existing ads
        },
        email: {
            type: String,
            required: false // Optional for existing ads
        }
    },
    clientname: {
        type: String,
    },
    bookedfrom: {
        type: String,
    },
    bookedtill: {
        type: String,
    },
    type: {
        type: String,
        required: true
    },
    priceperday: {
        type: String,
    },
    pricepermonth: {
        type: String,
        required: true
    },
    finalBookingPricePM: {
        type: String,
        default: null
    },
    visibility: {
        type: String,
        required: true,
        enum: ['Single', 'Double'],
        default: 'Single'
    },
    coordinates: {
        lat: {
            type: Number,
            required: false
        },
        lng: {
            type: Number,
            required: false
        }
    },
    show: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    state: { type: String, required: true },
    holdBookedBy: { type: String },
    mediaOwner: { type: String },
});

const Ads = mongoose.models.Ads || mongoose.model("Ads", adSchema);
export default Ads;