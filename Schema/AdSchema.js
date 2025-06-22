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
    lighting:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    size:{
        type: String,
        required: true
    },
    clientname:{
        type: String,
        required: true
    },
    bookedfrom:{
        type: String,
        required: true
    },
    bookedtill:{
        type: String,
        required: true
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
    locationmap:{ 
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
    message:{ 
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    imageId:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    views:{
        type: Number,
        default: 0
    },
});

const Ads = mongoose.models.Ads || mongoose.model("Ads", adSchema);
export default Ads;