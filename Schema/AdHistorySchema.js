import mongoose, {Schema} from "mongoose";

const AdHistorySchema = new Schema({
    mediaCode:{
        type: String,
        required: true,
        unique: true
    },
    mediaType:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    bookedFrom:{
        type: String,
        required: true
    },
    bookedTill:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    locality:{
        type: String,
        required: true
    },
    clientName:{
        type: String,
        required: true
    },
    ownedBy:{
        type: String,
        required: true
    }
});

export default mongoose.model("AdHistory", AdHistorySchema);
