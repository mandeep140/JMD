import { NextResponse } from 'next/server';
import connectdb from '@/utils/connectdb';
import DownloadContact from '@/Schema/DownloadContactSchema';
import { sendDownloadFormNotification } from '@/utils/emailService';

// Add the calculateTotal function
const calculateTotal = (selectedAds, additionalPacks) => {
    const mainCost = selectedAds.reduce((sum, ad) => sum + (parseFloat(ad.pricepermonth) || 0), 0);
    const additionalCost = additionalPacks?.reduce((sum, pack) => sum + (pack.cost || 0), 0) || 0;
    const totalCost = mainCost + additionalCost;
    const taxCost = totalCost * 0.18;
    return (totalCost + taxCost).toLocaleString();
};

export async function POST(request) {
    try {
        await connectdb();
        
        const data = await request.json();
        const { name, email, mobile, reason, downloadType, selectedAds, additionalPacks } = data;
        
        // Generate unique request ID
        const reqid = `DL${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare ads data
        const adsData = selectedAds.map(ad => ({
            mediaCode: ad.mediacode || ad.mediaCode,
            title: ad.title,
            city: ad.city,
            type: ad.type,
            pricePerMonth: ad.pricepermonth
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
            additionalPacks: additionalPacks || [],
            totalAdsCount: selectedAds.length
        });
        
        await downloadContact.save();
        
        // Send email notification using the proper function
        await sendDownloadFormNotification({
            name: name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            reason: reason.trim(),
            downloadType,
            selectedAds: adsData,
            additionalPacks: additionalPacks || [],
            reqid,
            totalValue: calculateTotal(selectedAds, additionalPacks)
        });
        
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