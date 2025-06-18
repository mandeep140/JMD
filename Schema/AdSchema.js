import mongoose, {Schema} from "mongoose";

const adSchema = new Schema({
    mediacode:{
        type: String,
        required: true,
        unique: true
    },
    title:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    lightning:{
        type: String,
        required: true
    },
    available:{
        type: Boolean,
        required: true
    },
    size:{
        type: String,
        required: true
    },
    clintname:{
        type: String,
        
    },
    bookedfrom:{
        type: String,
    },
    bookedto:{
        type: String,
    },
    type:{
        type: String,
        required: true
    },
    priceperday:{
        type: String,
        required: true
    },
    pricepermonth:{
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    codinates:{
        type: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        },
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
});

const Ads = mongoose.models.Ads || mongoose.model("Ads", adSchema);
export default Ads;