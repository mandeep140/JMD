import mongoose, {Schema} from "mongoose";

const ContactSchema = new Schema({
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
    phone: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    callback: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contacts = mongoose.models.Contacts || mongoose.model("Contacts", ContactSchema);
export default Contacts;