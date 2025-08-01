import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
    try {
        const data = await request.json();
        
        const excelBuffer = generateUserExcel(data);
        
        if (!excelBuffer || excelBuffer.length < 100) {
            throw new Error('Generated Excel buffer is too small or empty');
        }
        
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="JMD_Quotation_${new Date().toISOString().split('T')[0]}.xlsx"`,
                'Content-Length': excelBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating user Excel:', error);
        return NextResponse.json({ 
            error: 'Failed to generate Excel file', 
            details: error.message 
        }, { status: 500 });
    }
}

function generateUserExcel(data) {
    try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // Helper function to parse size and calculate sqft
        const parseSizeAndCalculateSqft = (sizeStr) => {
            if (!sizeStr) return { width: 'N/A', height: 'N/A', totalSqft: 'N/A' };
            
            // Try to extract dimensions like "10*20ft (200sqft)" or "10x20ft" or "10*20"
            const match = sizeStr.match(/(\d+)\s*[*x×]\s*(\d+)/i);
            if (match) {
                const width = parseInt(match[1]);
                const height = parseInt(match[2]);
                const totalSqft = width * height;
                return {
                    width: width,
                    height: height,
                    totalSqft: totalSqft
                };
            }
            
            // If no dimensions found, return original string
            return { width: 'N/A', height: 'N/A', totalSqft: 'N/A' };
        };
        
        // Prepare data for the quotation sheet (user format)
        const quotationData = data.ads?.map((ad, index) => {
            const sizeInfo = parseSizeAndCalculateSqft(ad.size);
            const rate = ad.pricePerMonth ? parseInt(ad.pricePerMonth.toString().replace(/[^0-9]/g, '')) || 0 : 0;
            
            return {
                'Sr.no': index + 1,
                'LOCATION': ad.title || 'N/A',
                'CITY': ad.city || 'N/A',
                '(W) Size': sizeInfo.width,
                '(H)': sizeInfo.height,
                'Media Type': ad.type || 'Hoarding',
                'Media Code': ad.mediaCode || 'N/A',
                'Total Sq Ft': sizeInfo.totalSqft,
                'Rate': rate > 0 ? `₹${rate.toLocaleString()}` : 'N/A'
            };
        }) || [];
        
        // Create the quotation worksheet
        const quotationWorksheet = XLSX.utils.json_to_sheet(quotationData);
        
        // Set column widths to match the screenshot format
        const colWidths = [
            { wch: 8 },   // Sr.no
            { wch: 35 },  // LOCATION
            { wch: 15 },  // CITY
            { wch: 12 },  // (W) Size
            { wch: 8 },   // (H)
            { wch: 15 },  // Media Type
            { wch: 15 },  // Media Code
            { wch: 12 },  // Total Sq Ft
            { wch: 15 }   // Rate
        ];
        quotationWorksheet['!cols'] = colWidths;
        
        // Add header styling (make first row bold)
        const range = XLSX.utils.decode_range(quotationWorksheet['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!quotationWorksheet[cellAddress]) continue;
            quotationWorksheet[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E2E8F0" } },
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" }
                }
            };
        }
        
        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, quotationWorksheet, 'Quotation');
        
        // Create summary sheet for user
        const totalRate = data.ads?.reduce((sum, ad) => {
            const rate = parseInt(ad.pricePerMonth?.toString().replace(/[^0-9]/g, '')) || 0;
            return sum + rate;
        }, 0) || 0;
        
        const totalSqft = data.ads?.reduce((sum, ad) => {
            const sizeInfo = parseSizeAndCalculateSqft(ad.size);
            const sqft = typeof sizeInfo.totalSqft === 'number' ? sizeInfo.totalSqft : 0;
            return sum + sqft;
        }, 0) || 0;
        
        const uniqueCities = [...new Set((data.ads || []).map(ad => ad.city).filter(Boolean))];
        
        const summaryData = [
            { 'Details': 'Quotation Summary', 'Information': '' },
            { 'Details': '', 'Information': '' }, // Empty row
            { 'Details': 'Total Hoardings', 'Information': data.ads?.length || 0 },
            { 'Details': 'Total Coverage Area', 'Information': `${totalSqft} Sq Ft` },
            { 'Details': 'Cities Covered', 'Information': uniqueCities.join(', ') },
            { 'Details': 'Total Monthly Investment', 'Information': `₹${totalRate.toLocaleString()}` },
            { 'Details': 'Total Annual Investment', 'Information': `₹${(totalRate * 12).toLocaleString()}` },
            { 'Details': '', 'Information': '' }, // Empty row
            { 'Details': 'Generated On', 'Information': new Date().toLocaleDateString() },
            { 'Details': 'Valid Till', 'Information': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() },
            { 'Details': '', 'Information': '' }, // Empty row
            { 'Details': 'Contact Information', 'Information': '' },
            { 'Details': 'Company', 'Information': 'JMD Advertisement' },
            { 'Details': 'Address', 'Information': 'B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002)' },
            { 'Details': 'Phone', 'Information': '+91-9204965321' },
            { 'Details': 'Email', 'Information': 'info.jmd.jsr@gmail.com' },
            { 'Details': 'Website', 'Information': 'https://jmd-kohl.vercel.app/' }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        
        // Set column widths for summary
        summaryWorksheet['!cols'] = [
            { wch: 25 }, // Details
            { wch: 50 }  // Information
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
        console.error('Error in generateUserExcel:', error);
        throw error;
    }
}