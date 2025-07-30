import mongoose, {Schema} from "mongoose";

const DownloadContactSchema = new Schema({
    reqid:{
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    downloadType: {
        type: String,
        required: true,
        enum: ['PPT', 'Excel']
    },
    selectedAds: [{
        mediaCode: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    }],
    totalAdsCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DownloadContact = mongoose.models.DownloadContact || mongoose.model("DownloadContact", DownloadContactSchema);
export default DownloadContact;