import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import HoardingRent from '@/Schema/HoardingRentSchema';
import RentAgreementDetail from '@/Schema/RentAgreementDetailSchema';

// GET - Fetch all details for a specific rent agreement
export async function GET(request, { params }) {
    try {
        await connectdb();
        const { id } = await params;
        
        // Verify that the rent agreement exists
        const agreement = await HoardingRent.findById(id);
        if (!agreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        // Fetch all details for this agreement
        const details = await RentAgreementDetail.find({ 
            rentAgreementId: id 
        }).sort({ createdAt: -1 });
        
        // Map to frontend expected format
        const mappedDetails = details.map(detail => ({
            _id: detail._id,
            agreementYearFrom: detail.agreementYearFrom,
            agreementYearTo: detail.agreementYearTo,
            installationEnd: detail.installationEnd || '',
            paymentPaidYearFrom: detail.paymentPaidYearFrom,
            paymentPaidYearTo: detail.paymentPaidYearTo,
            paymentPaidAmount: detail.paymentPaidAmount || 0,
            paymentPaidDate: detail.paymentPaidDate,
            paymentMethod: detail.paymentMethod || 'Cash',
            checkNo: detail.checkNo || '',
            bank: detail.bank || '',
            accountPayeeName: detail.accountPayeeName || '',
            dues: detail.dues || 0,
            duesYear: detail.duesYear,
            remarks: detail.remarks || '',
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt
        }));
        
        return NextResponse.json({
            agreement: agreement,
            details: mappedDetails
        });
    } catch (error) {
        console.error('Error fetching agreement details:', error);
        return NextResponse.json({ error: 'Failed to fetch agreement details' }, { status: 500 });
    }
}

// POST - Add new detail to rent agreement
export async function POST(request, { params }) {
    try {
        await connectdb();
        const { id } = await params;
        const detailData = await request.json();
        
        // Verify that the rent agreement exists
        const agreement = await HoardingRent.findById(id);
        if (!agreement) {
            return NextResponse.json({ error: 'Rent agreement not found' }, { status: 404 });
        }
        
        // Create new detail with proper field mapping
        const newDetail = new RentAgreementDetail({
            rentAgreementId: id,
            agreementYearFrom: detailData.agreementYearFrom,
            agreementYearTo: detailData.agreementYearTo,
            installationEnd: detailData.installationEnd,
            paymentPaidYearFrom: detailData.paymentPaidYearFrom,
            paymentPaidYearTo: detailData.paymentPaidYearTo,
            paymentPaidAmount: detailData.paymentPaidAmount,
            paymentPaidDate: detailData.paymentPaidDate,
            paymentMethod: detailData.paymentMethod || 'Cash',
            checkNo: detailData.checkNo,
            bank: detailData.bank,
            accountPayeeName: detailData.accountPayeeName,
            dues: detailData.dues,
            duesYear: detailData.duesYear,
            remarks: detailData.remarks
        });
        
        await newDetail.save();
        
        // Fetch complete agreement with all details to return
        const details = await RentAgreementDetail.find({ 
            rentAgreementId: id 
        }).sort({ createdAt: -1 });
        
        const agreementObj = agreement.toObject();
        agreementObj.moreDetails = details.map(detail => ({
            _id: detail._id,
            agreementYearFrom: detail.agreementYearFrom,
            agreementYearTo: detail.agreementYearTo,
            installationEnd: detail.installationEnd || '',
            paymentPaidYearFrom: detail.paymentPaidYearFrom,
            paymentPaidYearTo: detail.paymentPaidYearTo,
            paymentPaidAmount: detail.paymentPaidAmount || 0,
            paymentPaidDate: detail.paymentPaidDate,
            paymentMethod: detail.paymentMethod || 'Cash',
            checkNo: detail.checkNo || '',
            bank: detail.bank || '',
            accountPayeeName: detail.accountPayeeName || '',
            dues: detail.dues || 0,
            duesYear: detail.duesYear,
            remarks: detail.remarks || '',
            createdAt: detail.createdAt
        }));
        
        return NextResponse.json(agreementObj, { status: 201 });
    } catch (error) {
        console.error('Error adding detail:', error);
        return NextResponse.json({ error: 'Failed to add detail' }, { status: 500 });
    }
}

// PUT - Update specific detail in rent agreement
export async function PUT(request, { params }) {
    try {
        await connectdb();
        const { id } = await params;
        const { detailId, ...updateData } = await request.json();
        
        if (!detailId) {
            return NextResponse.json({ error: 'Detail ID is required' }, { status: 400 });
        }
        
        // Find and update the detail
        const updatedDetail = await RentAgreementDetail.findOneAndUpdate(
            { 
                _id: detailId,
                rentAgreementId: id 
            },
            {
                agreementYearFrom: updateData.agreementYearFrom,
                agreementYearTo: updateData.agreementYearTo,
                installationEnd: updateData.installationEnd,
                paymentPaidYearFrom: updateData.paymentPaidYearFrom,
                paymentPaidYearTo: updateData.paymentPaidYearTo,
                paymentPaidAmount: updateData.paymentPaidAmount,
                paymentPaidDate: updateData.paymentPaidDate,
                paymentMethod: updateData.paymentMethod,
                checkNo: updateData.checkNo,
                bank: updateData.bank,
                accountPayeeName: updateData.accountPayeeName,
                dues: updateData.dues,
                duesYear: updateData.duesYear,
                remarks: updateData.remarks
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedDetail) {
            return NextResponse.json({ error: 'Detail not found or does not belong to this agreement' }, { status: 404 });
        }
        
        // Fetch complete agreement with all details to return
        const agreement = await HoardingRent.findById(id);
        const details = await RentAgreementDetail.find({ 
            rentAgreementId: id 
        }).sort({ createdAt: -1 });
        
        const agreementObj = agreement.toObject();
        agreementObj.moreDetails = details.map(detail => ({
            _id: detail._id,
            agreementYearFrom: detail.agreementYearFrom,
            agreementYearTo: detail.agreementYearTo,
            installationEnd: detail.installationEnd || '',
            paymentPaidYearFrom: detail.paymentPaidYearFrom,
            paymentPaidYearTo: detail.paymentPaidYearTo,
            paymentPaidAmount: detail.paymentPaidAmount || 0,
            paymentPaidDate: detail.paymentPaidDate,
            paymentMethod: detail.paymentMethod || 'Cash',
            checkNo: detail.checkNo || '',
            bank: detail.bank || '',
            accountPayeeName: detail.accountPayeeName || '',
            dues: detail.dues || 0,
            duesYear: detail.duesYear,
            remarks: detail.remarks || '',
            createdAt: detail.createdAt
        }));
        
        return NextResponse.json(agreementObj);
    } catch (error) {
        console.error('Error updating detail:', error);
        return NextResponse.json({ error: 'Failed to update detail' }, { status: 500 });
    }
}

// DELETE - Delete specific detail from rent agreement
export async function DELETE(request, { params }) {
    try {
        await connectdb();
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const detailId = searchParams.get('detailId');
        
        if (!detailId) {
            return NextResponse.json({ error: 'Detail ID is required' }, { status: 400 });
        }
        
        // Find and delete the detail
        const deletedDetail = await RentAgreementDetail.findOneAndDelete({
            _id: detailId,
            rentAgreementId: id
        });
        
        if (!deletedDetail) {
            return NextResponse.json({ error: 'Detail not found or does not belong to this agreement' }, { status: 404 });
        }
        
        // Fetch complete agreement with remaining details to return
        const agreement = await HoardingRent.findById(id);
        const details = await RentAgreementDetail.find({ 
            rentAgreementId: id 
        }).sort({ createdAt: -1 });
        
        const agreementObj = agreement.toObject();
        agreementObj.moreDetails = details.map(detail => ({
            _id: detail._id,
            agreementYearFrom: detail.agreementYearFrom,
            agreementYearTo: detail.agreementYearTo,
            installationEnd: detail.installationEnd || '',
            paymentPaidYearFrom: detail.paymentPaidYearFrom,
            paymentPaidYearTo: detail.paymentPaidYearTo,
            paymentPaidAmount: detail.paymentPaidAmount || 0,
            paymentPaidDate: detail.paymentPaidDate,
            paymentMethod: detail.paymentMethod || 'Cash',
            checkNo: detail.checkNo || '',
            bank: detail.bank || '',
            accountPayeeName: detail.accountPayeeName || '',
            dues: detail.dues || 0,
            duesYear: detail.duesYear,
            remarks: detail.remarks || '',
            createdAt: detail.createdAt
        }));
        
        return NextResponse.json({
            message: 'Detail deleted successfully',
            agreement: agreementObj
        });
    } catch (error) {
        console.error('Error deleting detail:', error);
        return NextResponse.json({ error: 'Failed to delete detail' }, { status: 500 });
    }
}