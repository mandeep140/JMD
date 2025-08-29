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
    expectedSales: { type: Number },
    moreDetails: [{
        agreementYear: { type: String },
        installationEnd: { type: String },
        paymentPaidYear: { type: String },
        paymentPaidAmount: { type: Number },
        paymentPaidDate: { type: Date },
        paymentMethod: { type: String },
        checkNo: { type: String },
        bank: { type: String },
        accountPayeeName: { type: String },
        dues: { type: Number },
        duesYear: { type: Date },
        createdAt: { type: Date, default: Date.now },
        remarks: { type: String }
    }]
}, {
    timestamps: true // This will add createdAt and updatedAt to the main document
});

const HoardingRent = mongoose.models.HoardingRent || mongoose.model('HoardingRent', HoardingRentSchema);

export default HoardingRent;