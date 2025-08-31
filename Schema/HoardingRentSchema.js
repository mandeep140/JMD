import mongoose, { Schema } from "mongoose";

const HoardingRentSchema = new Schema({
    adCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    rentType: { type: String, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    owners: { type: String, required: true },
    agreementFrom: { type: Date },
    agreementTo: { type: Date },
    annualRent: { type: Number, required: true },
    duesDate: { type: Date },
    duesAmount: { type: Number },
    expectedSales: { type: Number }
}, {
    timestamps: true // This will add createdAt and updatedAt to the main document
});

const HoardingRent = mongoose.models.HoardingRent || mongoose.model('HoardingRent', HoardingRentSchema);

export default HoardingRent;