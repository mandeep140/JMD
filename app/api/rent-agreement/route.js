import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import HoardingRent from '@/Schema/HoardingRentSchema';
import RentAgreementDetail from '@/Schema/RentAgreementDetailSchema';

// GET - Fetch all rent agreements with populated details
export async function GET() {
    try {
        await connectdb();
        
        // Get all rent agreements
        const rentAgreements = await HoardingRent.find().sort({ createdAt: -1 });
        
        // For each agreement, get its details from the separate collection
        const agreementsWithDetails = await Promise.all(
            rentAgreements.map(async (agreement) => {
                const details = await RentAgreementDetail.find({ 
                    rentAgreementId: agreement._id 
                }).sort({ createdAt: -1 });
                
                // Convert to plain object and add details
                const agreementObj = agreement.toObject();
                
                // Map separate collection details to match old moreDetails structure for backward compatibility
                agreementObj.moreDetails = details.map(detail => ({
                    _id: detail._id,
                    // Keep new fields for frontend
                    agreementYearFrom: detail.agreementYearFrom,
                    agreementYearTo: detail.agreementYearTo,
                    paymentPaidYearFrom: detail.paymentPaidYearFrom,
                    paymentPaidYearTo: detail.paymentPaidYearTo,
                    // Legacy fields for Excel export compatibility
                    agreementYear: detail.agreementYearFrom ? detail.agreementYearFrom.getFullYear().toString() : '',
                    paymentPaidYear: detail.paymentPaidYearFrom ? detail.paymentPaidYearFrom.getFullYear().toString() : '',
                    // Rest of the fields
                    installationEnd: detail.installationEnd || '',
                    paymentPaidAmount: detail.paymentPaidAmount || 0,
                    paymentPaidDate: detail.paymentPaidDate,
                    paymentMethod: detail.paymentMethod || '',
                    checkNo: detail.checkNo || '',
                    bank: detail.bank || '',
                    accountPayeeName: detail.accountPayeeName || '',
                    dues: detail.dues || 0,
                    duesYear: detail.duesYear,
                    createdAt: detail.createdAt,
                    remarks: detail.remarks || ''
                }));
                
                return agreementObj;
            })
        );
        
        return NextResponse.json(agreementsWithDetails);
    } catch (error) {
        console.error('Error fetching rent agreements:', error);
        return NextResponse.json({ error: 'Failed to fetch rent agreements' }, { status: 500 });
    }
}

// POST - Create new rent agreement
export async function POST(request) {
    try {
        await connectdb();
        const data = await request.json();
        
        // Check if adCode already exists
        const existingAgreement = await HoardingRent.findOne({ adCode: data.adCode });
        if (existingAgreement) {
            return NextResponse.json({ error: 'Media Code already exists' }, { status: 400 });
        }
        
        // Remove moreDetails from main agreement data if present
        const { moreDetails, ...agreementData } = data;
        
        // Create new rent agreement (without moreDetails)
        const newRentAgreement = new HoardingRent(agreementData);
        await newRentAgreement.save();
        
        // If moreDetails were provided, save them to separate collection
        if (moreDetails && moreDetails.length > 0) {
            const detailsToSave = moreDetails.map(detail => ({
                rentAgreementId: newRentAgreement._id,
                agreementYearFrom: detail.agreementYearFrom || (detail.agreementYear ? new Date(detail.agreementYear, 0, 1) : undefined),
                agreementYearTo: detail.agreementYearTo || (detail.agreementYear ? new Date(detail.agreementYear, 11, 31) : undefined),
                installationEnd: detail.installationEnd,
                paymentPaidYearFrom: detail.paymentPaidYearFrom || (detail.paymentPaidYear ? new Date(detail.paymentPaidYear, 0, 1) : undefined),
                paymentPaidYearTo: detail.paymentPaidYearTo || (detail.paymentPaidYear ? new Date(detail.paymentPaidYear, 11, 31) : undefined),
                paymentPaidAmount: detail.paymentPaidAmount,
                paymentPaidDate: detail.paymentPaidDate,
                paymentMethod: detail.paymentMethod,
                checkNo: detail.checkNo,
                bank: detail.bank,
                accountPayeeName: detail.accountPayeeName,
                dues: detail.dues,
                duesYear: detail.duesYear,
                remarks: detail.remarks
            }));
            
            await RentAgreementDetail.insertMany(detailsToSave);
        }
        
        // Fetch the complete agreement with details to return
        const details = await RentAgreementDetail.find({ 
            rentAgreementId: newRentAgreement._id 
        }).sort({ createdAt: -1 });
        
        const agreementObj = newRentAgreement.toObject();
        agreementObj.moreDetails = details.map(detail => ({
            _id: detail._id,
            agreementYearFrom: detail.agreementYearFrom,
            agreementYearTo: detail.agreementYearTo,
            paymentPaidYearFrom: detail.paymentPaidYearFrom,
            paymentPaidYearTo: detail.paymentPaidYearTo,
            agreementYear: detail.agreementYearFrom ? detail.agreementYearFrom.getFullYear().toString() : '',
            paymentPaidYear: detail.paymentPaidYearFrom ? detail.paymentPaidYearFrom.getFullYear().toString() : '',
            installationEnd: detail.installationEnd || '',
            paymentPaidAmount: detail.paymentPaidAmount || 0,
            paymentPaidDate: detail.paymentPaidDate,
            paymentMethod: detail.paymentMethod || '',
            checkNo: detail.checkNo || '',
            bank: detail.bank || '',
            accountPayeeName: detail.accountPayeeName || '',
            dues: detail.dues || 0,
            duesYear: detail.duesYear,
            createdAt: detail.createdAt,
            remarks: detail.remarks || ''
        }));
        
        return NextResponse.json(agreementObj, { status: 201 });
    } catch (error) {
        console.error('Error creating rent agreement:', error);
        return NextResponse.json({ error: 'Failed to create rent agreement' }, { status: 500 });
    }
}

// PUT - Update rent agreement
export async function PUT(request) {
    try {
        await connectdb();
        const data = await request.json();
        const { _id, moreDetails, ...updateData } = data;
        
        // Update main agreement
        const updatedAgreement = await HoardingRent.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedAgreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        // Handle moreDetails updates if provided
        if (moreDetails) {
            // Remove existing details for this agreement
            await RentAgreementDetail.deleteMany({ rentAgreementId: _id });
            
            // Add new details if provided
            if (moreDetails.length > 0) {
                const detailsToSave = moreDetails.map(detail => ({
                    rentAgreementId: _id,
                    agreementYearFrom: detail.agreementYearFrom || (detail.agreementYear ? new Date(detail.agreementYear, 0, 1) : undefined),
                    agreementYearTo: detail.agreementYearTo || (detail.agreementYear ? new Date(detail.agreementYear, 11, 31) : undefined),
                    installationEnd: detail.installationEnd,
                    paymentPaidYearFrom: detail.paymentPaidYearFrom || (detail.paymentPaidYear ? new Date(detail.paymentPaidYear, 0, 1) : undefined),
                    paymentPaidYearTo: detail.paymentPaidYearTo || (detail.paymentPaidYear ? new Date(detail.paymentPaidYear, 11, 31) : undefined),
                    paymentPaidAmount: detail.paymentPaidAmount,
                    paymentPaidDate: detail.paymentPaidDate,
                    paymentMethod: detail.paymentMethod,
                    checkNo: detail.checkNo,
                    bank: detail.bank,
                    accountPayeeName: detail.accountPayeeName,
                    dues: detail.dues,
                    duesYear: detail.duesYear,
                    remarks: detail.remarks
                }));
                
                await RentAgreementDetail.insertMany(detailsToSave);
            }
        }
        
        // Fetch complete agreement with details to return
        const details = await RentAgreementDetail.find({ 
            rentAgreementId: _id 
        }).sort({ createdAt: -1 });
        
        const agreementObj = updatedAgreement.toObject();
        agreementObj.moreDetails = details.map(detail => ({
            _id: detail._id,
            agreementYearFrom: detail.agreementYearFrom,
            agreementYearTo: detail.agreementYearTo,
            paymentPaidYearFrom: detail.paymentPaidYearFrom,
            paymentPaidYearTo: detail.paymentPaidYearTo,
            agreementYear: detail.agreementYearFrom ? detail.agreementYearFrom.getFullYear().toString() : '',
            paymentPaidYear: detail.paymentPaidYearFrom ? detail.paymentPaidYearFrom.getFullYear().toString() : '',
            installationEnd: detail.installationEnd || '',
            paymentPaidAmount: detail.paymentPaidAmount || 0,
            paymentPaidDate: detail.paymentPaidDate,
            paymentMethod: detail.paymentMethod || '',
            checkNo: detail.checkNo || '',
            bank: detail.bank || '',
            accountPayeeName: detail.accountPayeeName || '',
            dues: detail.dues || 0,
            duesYear: detail.duesYear,
            createdAt: detail.createdAt,
            remarks: detail.remarks || ''
        }));
        
        return NextResponse.json(agreementObj);
    } catch (error) {
        console.error('Error updating rent agreement:', error);
        return NextResponse.json({ error: 'Failed to update rent agreement' }, { status: 500 });
    }
}

// DELETE - Delete rent agreement and all its details
export async function DELETE(request) {
    try {
        await connectdb();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        // Delete the main agreement
        const deletedAgreement = await HoardingRent.findByIdAndDelete(id);
        
        if (!deletedAgreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        // Delete all associated details from separate collection
        await RentAgreementDetail.deleteMany({ rentAgreementId: id });
        
        return NextResponse.json({ message: 'Rent agreement and all details deleted successfully' });
    } catch (error) {
        console.error('Error deleting rent agreement:', error);
        return NextResponse.json({ error: 'Failed to delete rent agreement' }, { status: 500 });
    }
}