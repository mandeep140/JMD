import { Type } from "lucide-react";
import mongoose, {Schema} from "mongoose";

const bookingSchema = new Schema({ 
    reqid:{
        type: String,
        required: true,
        unique: true,
    },
    mediacode: {
        type: String,
        required: true,
    },
    mediatype:{
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: "Pending",
    },
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true,
    },
    callback:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;