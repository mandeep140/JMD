import mongoose, {Schema} from "mongoose";

const CitySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    count:{
        type: Number,
        default: 1
    }
});

const City = mongoose.models.City || mongoose.model("City", CitySchema);
export default City;