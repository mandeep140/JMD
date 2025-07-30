import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
    try {
        const data = await request.json();
        
        const excelBuffer = generateExcel(data);
        
        if (!excelBuffer || excelBuffer.length < 100) {
            throw new Error('Generated Excel buffer is too small or empty');
        }
        
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="JMD_Hoardings_${new Date().toISOString().split('T')[0]}.xlsx"`,
                'Content-Length': excelBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating Excel:', error);
        return NextResponse.json({ 
            error: 'Failed to generate Excel file', 
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

function generateExcel(data) {
    try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // Prepare data for the main sheet
        const adsData = data.ads?.map((ad, index) => ({
            'S.No': index + 1,
            'Media Code': ad.mediaCode || 'N/A',
            'Title': ad.title || 'Untitled Hoarding',
            'Type': ad.type || 'N/A',
            'City': ad.city || 'N/A',
            'Size': ad.size || 'N/A',
            'Lighting': ad.lighting || 'N/A',
            'Price/Day (₹)': ad.pricePerDay ? parseInt(ad.pricePerDay.toString().replace(/[^0-9]/g, '')).toLocaleString() : 'N/A',
            'Price/Month (₹)': ad.pricePerMonth ? parseInt(ad.pricePerMonth.toString().replace(/[^0-9]/g, '')).toLocaleString() : 'N/A',
            'Description': ad.message && ad.message.trim() !== '' ? ad.message : 'Strategic outdoor advertising location perfect for brand visibility and maximum audience reach.',
            'Image URL': ad.imageUrl || 'N/A',
            'Location Map': ad.locationMap || 'N/A'
        })) || [];
        
        // Create the main ads worksheet
        const adsWorksheet = XLSX.utils.json_to_sheet(adsData);
        
        // Set column widths
        const colWidths = [
            { wch: 8 },   // S.No
            { wch: 15 },  // Media Code
            { wch: 30 },  // Title
            { wch: 20 },  // Type
            { wch: 15 },  // City
            { wch: 15 },  // Size
            { wch: 12 },  // Lighting
            { wch: 15 },  // Price/Day
            { wch: 15 },  // Price/Month
            { wch: 60 },  // Description
            { wch: 40 },  // Image URL
            { wch: 40 }   // Location Map
        ];
        adsWorksheet['!cols'] = colWidths;
        
        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, adsWorksheet, 'Selected Hoardings');
        
        // Create summary sheet
        const totalDailyPrice = data.ads?.reduce((sum, ad) => {
            const price = parseInt(ad.pricePerDay?.toString().replace(/[^0-9]/g, '')) || 0;
            return sum + price;
        }, 0) || 0;
        
        const totalMonthlyPrice = data.ads?.reduce((sum, ad) => {
            const price = parseInt(ad.pricePerMonth?.toString().replace(/[^0-9]/g, '')) || 0;
            return sum + price;
        }, 0) || 0;
        
        const uniqueCities = [...new Set((data.ads || []).map(ad => ad.city).filter(Boolean))];
        const uniqueTypes = [...new Set((data.ads || []).map(ad => ad.type).filter(Boolean))];
        
        const summaryData = [
            { 'Metric': 'Report Title', 'Value': data.title || 'JMD Advertisement - Selected Hoardings' },
            { 'Metric': 'Generated On', 'Value': new Date().toLocaleDateString() },
            { 'Metric': 'Generated At', 'Value': new Date().toLocaleTimeString() },
            { 'Metric': '', 'Value': '' }, // Empty row
            { 'Metric': 'Total Hoardings Selected', 'Value': data.ads?.length || 0 },
            { 'Metric': 'Cities Covered', 'Value': uniqueCities.length },
            { 'Metric': 'Ad Types', 'Value': uniqueTypes.length },
            { 'Metric': '', 'Value': '' }, // Empty row
            { 'Metric': 'Total Daily Investment', 'Value': `₹${totalDailyPrice.toLocaleString()}` },
            { 'Metric': 'Total Monthly Investment', 'Value': `₹${totalMonthlyPrice.toLocaleString()}` },
            { 'Metric': '', 'Value': '' }, // Empty row
            { 'Metric': 'Cities Covered', 'Value': uniqueCities.join(', ') },
            { 'Metric': 'Ad Types Covered', 'Value': uniqueTypes.join(', ') },
            { 'Metric': '', 'Value': '' }, // Empty row
            { 'Metric': 'Contact Information', 'Value': '' },
            { 'Metric': 'Company', 'Value': 'JMD Advertisement' },
            { 'Metric': 'Address', 'Value': 'B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002)' },
            { 'Metric': 'Phone', 'Value': '+91-9204965321' },
            { 'Metric': 'Email', 'Value': 'info.jmd.jsr@gmail.com' },
            { 'Metric': 'Website', 'Value': 'https://jmd-kohl.vercel.app/' }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        
        // Set column widths for summary
        summaryWorksheet['!cols'] = [
            { wch: 25 }, // Metric
            { wch: 50 }  // Value
        ];
        
        // Add summary sheet to workbook
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        
        // Generate buffer
        const buffer = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx',
            compression: true 
        });
        
        return buffer;
        
    } catch (error) {
        console.error('Error in generateExcel:', error);
        throw error;
    }
}