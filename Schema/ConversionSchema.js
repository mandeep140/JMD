import mongoose,{Schema} from "mongoose";

const ConversionSchema = new Schema({
    book:{
        Type: Number,
    },
    visitor:{
        Type: Number,
    }
});

const Conversion =  mongoose.models.Conversion || mongoose.model("Conversion", ConversionSchema);
export default Conversion;