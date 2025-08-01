import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import DownloadContact from '@/Schema/DownloadContactSchema';
import { sendDownloadFormNotification } from '@/utils/emailService';

export async function POST(request) {
    try {
        await connectdb();
        
        const data = await request.json();
        const { name, email, mobile, reason, downloadType, selectedAds } = data;
        
        // Generate unique request ID
        const reqid = `DL${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare ads data
        const adsData = selectedAds.map(ad => ({
            mediaCode: ad.mediacode || ad.mediaCode,
            title: ad.title,
            city: ad.city,
            type: ad.type
        }));
        
        // Create new download contact record
        const downloadContact = new DownloadContact({
            reqid,
            name: name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            reason: reason.trim(),
            downloadType,
            selectedAds: adsData,
            totalAdsCount: selectedAds.length
        });
        
        await downloadContact.save();

        // Send email notification to admin
        try {
            await sendDownloadFormNotification({
                reqid,
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                reason: reason.trim(),
                downloadType,
                selectedAds: adsData,
                totalAdsCount: selectedAds.length
            });
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request if email fails
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Contact details saved successfully',
            reqid 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error saving download contact:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to save contact details',
            details: error.message 
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectdb();
        const downloadContacts = await DownloadContact.find().sort({ createdAt: -1 });
        return NextResponse.json(downloadContacts, { status: 200 });
    } catch (error) {
        console.error('Error fetching download contacts:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch download contacts' 
        }, { status: 500 });
    }
}