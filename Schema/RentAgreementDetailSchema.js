// Create new file: d:\freelance\jmd\Schema\RentAgreementDetailSchema.js
import mongoose, { Schema } from "mongoose";

const RentAgreementDetailSchema = new Schema({
    rentAgreementId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'HoardingRent', 
        required: true 
    },
    agreementYearFrom: { type: Date },
    agreementYearTo: { type: Date },
    installationEnd: { type: String },
    paymentPaidYearFrom: { type: Date },
    paymentPaidYearTo: { type: Date },
    paymentPaidAmount: { type: Number },
    paymentPaidDate: { type: Date },
    paymentMethod: { type: String },
    checkNo: { type: String },
    bank: { type: String },
    accountPayeeName: { type: String },
    dues: { type: Number },
    duesYear: { type: Date },
    remarks: { type: String }
}, {
    timestamps: true
});

const RentAgreementDetail = mongoose.models.RentAgreementDetail || mongoose.model('RentAgreementDetail', RentAgreementDetailSchema);

export default RentAgreementDetail;