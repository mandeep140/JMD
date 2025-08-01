import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
    try {
        const data = await request.json();
        const { type, data: excelData } = data;
        
        let excelBuffer;
        
        switch (type) {
            case 'inventory':
                excelBuffer = generateInventoryExcel(excelData);
                break;
            case 'bookings':
                excelBuffer = generateBookingsExcel(excelData);
                break;
            case 'downloads':
                excelBuffer = generateDownloadsExcel(excelData);
                break;
            case 'reports':
                excelBuffer = generateReportsExcel(excelData);
                break;
            default:
                throw new Error('Invalid export type');
        }
        
        if (!excelBuffer || excelBuffer.length < 100) {
            throw new Error('Generated Excel buffer is too small or empty');
        }
        
        const filename = `JMD_${type.charAt(0).toUpperCase() + type.slice(1)}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': excelBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating admin Excel:', error);
        return NextResponse.json({ 
            error: 'Failed to generate Excel file', 
            details: error.message 
        }, { status: 500 });
    }
}

function generateInventoryExcel(data) {
    try {
        const workbook = XLSX.utils.book_new();
        
        // Helper function to parse size
        const parseSizeInfo = (sizeStr) => {
            if (!sizeStr) return { width: 'N/A', height: 'N/A', totalSqft: 'N/A' };
            
            const match = sizeStr.match(/(\d+)\s*[*x×]\s*(\d+)/i);
            if (match) {
                const width = parseInt(match[1]);
                const height = parseInt(match[2]);
                return {
                    width: `${width}ft`,
                    height: `${height}ft`,
                    totalSqft: `${width * height} sq ft`
                };
            }
            
            return { width: sizeStr, height: 'N/A', totalSqft: 'N/A' };
        };
        
        // Prepare inventory data
        const inventoryData = data.map((ad, index) => {
            const sizeInfo = parseSizeInfo(ad.size);
            
            return {
                'Sr.No': index + 1,
                'Media Code': ad.mediacode || 'N/A',
                'Title/Location': ad.title || 'N/A',
                'City': ad.city || 'N/A',
                'Type': ad.type || 'N/A',
                'Width': sizeInfo.width,
                'Height': sizeInfo.height,
                'Total Area': sizeInfo.totalSqft,
                'Lighting': ad.lighting || 'N/A',
                'Status': ad.status || 'Available',
                'Price/Day (₹)': ad.priceperday ? `₹${parseInt(ad.priceperday.toString().replace(/[^0-9]/g, '')).toLocaleString()}` : 'N/A',
                'Price/Month (₹)': ad.pricepermonth ? `₹${parseInt(ad.pricepermonth.toString().replace(/[^0-9]/g, '')).toLocaleString()}` : 'N/A',
                'Client Name': ad.clientname || 'N/A',
                'Booked From': ad.bookedfrom || 'N/A',
                'Booked Till': ad.bookedtill || 'N/A',
                'Coordinates': ad.coordinates ? `${ad.coordinates.lat}, ${ad.coordinates.lng}` : 'N/A',
                'Views': ad.views || 0,
                'Visible': ad.show ? 'Yes' : 'No',
                'Description': ad.message || 'N/A',
                'Image URL': ad.imageUrl || 'N/A',
                'Created Date': ad.date ? new Date(ad.date).toLocaleDateString() : 'N/A'
            };
        });
        
        const inventoryWorksheet = XLSX.utils.json_to_sheet(inventoryData);
        
        // Set column widths
        const colWidths = [
            { wch: 8 },   // Sr.No
            { wch: 15 },  // Media Code
            { wch: 30 },  // Title/Location
            { wch: 15 },  // City
            { wch: 20 },  // Type
            { wch: 10 },  // Width
            { wch: 10 },  // Height
            { wch: 15 },  // Total Area
            { wch: 12 },  // Lighting
            { wch: 12 },  // Status
            { wch: 15 },  // Price/Day
            { wch: 15 },  // Price/Month
            { wch: 20 },  // Client Name
            { wch: 15 },  // Booked From
            { wch: 15 },  // Booked Till
            { wch: 20 },  // Coordinates
            { wch: 10 },  // Views
            { wch: 10 },  // Visible
            { wch: 40 },  // Description
            { wch: 40 },  // Image URL
            { wch: 15 }   // Created Date
        ];
        inventoryWorksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, inventoryWorksheet, 'Inventory');
        
        // Generate summary
        const totalAds = data.length;
        const availableAds = data.filter(ad => ad.status !== 'Booked').length;
        const bookedAds = data.filter(ad => ad.status === 'Booked').length;
        const totalViews = data.reduce((sum, ad) => sum + (ad.views || 0), 0);
        const uniqueCities = [...new Set(data.map(ad => ad.city).filter(Boolean))];
        const uniqueTypes = [...new Set(data.map(ad => ad.type).filter(Boolean))];
        
        const summaryData = [
            { 'Metric': 'Inventory Summary', 'Value': '' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Total Hoardings', 'Value': totalAds },
            { 'Metric': 'Available', 'Value': availableAds },
            { 'Metric': 'Booked', 'Value': bookedAds },
            { 'Metric': 'Total Views', 'Value': totalViews },
            { 'Metric': 'Cities Covered', 'Value': uniqueCities.length },
            { 'Metric': 'Media Types', 'Value': uniqueTypes.length },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Generated On', 'Value': new Date().toLocaleString() },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Cities List', 'Value': uniqueCities.join(', ') },
            { 'Metric': 'Media Types List', 'Value': uniqueTypes.join(', ') }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
        
    } catch (error) {
        console.error('Error in generateInventoryExcel:', error);
        throw error;
    }
}

function generateBookingsExcel(data) {
    try {
        const workbook = XLSX.utils.book_new();
        
        const bookingData = data.map((booking, index) => ({
            'Sr.No': index + 1,
            'Request ID': booking.reqid || 'N/A',
            'Media Code': booking.mediacode || 'N/A',
            'Media Type': booking.mediatype || 'N/A',
            'Title': booking.title || 'N/A',
            'City': booking.city || 'N/A',
            'Status': booking.status || 'Pending',
            'Customer Name': booking.name || 'N/A',
            'Email': booking.email || 'N/A',
            'Phone': booking.phone || 'N/A',
            'Message': booking.message || 'N/A',
            'Callback Time': booking.callback || 'N/A',
            'Request Date': booking.date ? new Date(booking.date).toLocaleString() : 'N/A'
        }));
        
        const bookingWorksheet = XLSX.utils.json_to_sheet(bookingData);
        
        const colWidths = [
            { wch: 8 },   // Sr.No
            { wch: 20 },  // Request ID
            { wch: 15 },  // Media Code
            { wch: 20 },  // Media Type
            { wch: 30 },  // Title
            { wch: 15 },  // City
            { wch: 12 },  // Status
            { wch: 25 },  // Customer Name
            { wch: 30 },  // Email
            { wch: 15 },  // Phone
            { wch: 40 },  // Message
            { wch: 20 },  // Callback Time
            { wch: 20 }   // Request Date
        ];
        bookingWorksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, bookingWorksheet, 'Booking Requests');
        
        // Summary for bookings
        const totalRequests = data.length;
        const pendingRequests = data.filter(b => b.status === 'Pending').length;
        const confirmedRequests = data.filter(b => b.status === 'Confirmed').length;
        const rejectedRequests = data.filter(b => b.status === 'Rejected').length;
        
        const bookingSummary = [
            { 'Metric': 'Booking Requests Summary', 'Value': '' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Total Requests', 'Value': totalRequests },
            { 'Metric': 'Pending', 'Value': pendingRequests },
            { 'Metric': 'Confirmed', 'Value': confirmedRequests },
            { 'Metric': 'Rejected', 'Value': rejectedRequests },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Generated On', 'Value': new Date().toLocaleString() }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(bookingSummary);
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
        
    } catch (error) {
        console.error('Error in generateBookingsExcel:', error);
        throw error;
    }
}

function generateDownloadsExcel(data) {
    try {
        const workbook = XLSX.utils.book_new();
        
        const downloadData = data.map((download, index) => ({
            'Sr.No': index + 1,
            'Request ID': download.reqid || 'N/A',
            'Name': download.name || 'N/A',
            'Email': download.email || 'N/A',
            'Mobile': download.mobile || 'N/A',
            'Download Type': download.downloadType || 'N/A',
            'Reason': download.reason || 'N/A',
            'Total Ads Selected': download.totalAdsCount || 0,
            'Selected Ads': download.selectedAds?.map(ad => `${ad.mediaCode} (${ad.title})`).join(', ') || 'N/A',
            'Download Date': download.createdAt ? new Date(download.createdAt).toLocaleString() : 'N/A'
        }));
        
        const downloadWorksheet = XLSX.utils.json_to_sheet(downloadData);
        
        const colWidths = [
            { wch: 8 },   // Sr.No
            { wch: 20 },  // Request ID
            { wch: 25 },  // Name
            { wch: 30 },  // Email
            { wch: 15 },  // Mobile
            { wch: 15 },  // Download Type
            { wch: 40 },  // Reason
            { wch: 15 },  // Total Ads Selected
            { wch: 60 },  // Selected Ads
            { wch: 20 }   // Download Date
        ];
        downloadWorksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, downloadWorksheet, 'Download Requests');
        
        // Summary for downloads
        const totalDownloads = data.length;
        const pptDownloads = data.filter(d => d.downloadType === 'PPT').length;
        const excelDownloads = data.filter(d => d.downloadType === 'Excel').length;
        const totalAdsDownloaded = data.reduce((sum, d) => sum + (d.totalAdsCount || 0), 0);
        
        const downloadSummary = [
            { 'Metric': 'Download Requests Summary', 'Value': '' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Total Downloads', 'Value': totalDownloads },
            { 'Metric': 'PPT Downloads', 'Value': pptDownloads },
            { 'Metric': 'Excel Downloads', 'Value': excelDownloads },
            { 'Metric': 'Total Ads Downloaded', 'Value': totalAdsDownloaded },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Generated On', 'Value': new Date().toLocaleString() }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(downloadSummary);
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
        
    } catch (error) {
        console.error('Error in generateDownloadsExcel:', error);
        throw error;
    }
}

function generateReportsExcel(data) {
    try {
        const workbook = XLSX.utils.book_new();
        
        // Combine all data types into comprehensive report
        const { inventory = [], bookings = [], downloads = [] } = data;
        
        // Inventory sheet
        if (inventory.length > 0) {
            const inventoryData = inventory.map((ad, index) => ({
                'Sr.No': index + 1,
                'Media Code': ad.mediacode || 'N/A',
                'Title': ad.title || 'N/A',
                'City': ad.city || 'N/A',
                'Type': ad.type || 'N/A',
                'Status': ad.status || 'Available',
                'Price/Month': ad.pricepermonth ? `₹${parseInt(ad.pricepermonth.toString().replace(/[^0-9]/g, '')).toLocaleString()}` : 'N/A',
                'Views': ad.views || 0,
                'Visible': ad.show ? 'Yes' : 'No'
            }));
            
            const inventoryWorksheet = XLSX.utils.json_to_sheet(inventoryData);
            XLSX.utils.book_append_sheet(workbook, inventoryWorksheet, 'Inventory');
        }
        
        // Bookings sheet
        if (bookings.length > 0) {
            const bookingData = bookings.map((booking, index) => ({
                'Sr.No': index + 1,
                'Request ID': booking.reqid || 'N/A',
                'Customer': booking.name || 'N/A',
                'Media Code': booking.mediacode || 'N/A',
                'Status': booking.status || 'Pending',
                'Date': booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'
            }));
            
            const bookingWorksheet = XLSX.utils.json_to_sheet(bookingData);
            XLSX.utils.book_append_sheet(workbook, bookingWorksheet, 'Bookings');
        }
        
        // Downloads sheet
        if (downloads.length > 0) {
            const downloadData = downloads.map((download, index) => ({
                'Sr.No': index + 1,
                'Name': download.name || 'N/A',
                'Email': download.email || 'N/A',
                'Type': download.downloadType || 'N/A',
                'Ads Count': download.totalAdsCount || 0,
                'Date': download.createdAt ? new Date(download.createdAt).toLocaleDateString() : 'N/A'
            }));
            
            const downloadWorksheet = XLSX.utils.json_to_sheet(downloadData);
            XLSX.utils.book_append_sheet(workbook, downloadWorksheet, 'Downloads');
        }
        
        // Comprehensive summary
        const reportSummary = [
            { 'Category': 'Overall Report Summary', 'Count': '', 'Details': '' },
            { 'Category': '', 'Count': '', 'Details': '' },
            { 'Category': 'Total Inventory', 'Count': inventory.length, 'Details': 'Active hoardings in system' },
            { 'Category': 'Booking Requests', 'Count': bookings.length, 'Details': 'Customer booking inquiries' },
            { 'Category': 'Download Requests', 'Count': downloads.length, 'Details': 'Quotation downloads' },
            { 'Category': '', 'Count': '', 'Details': '' },
            { 'Category': 'Available Inventory', 'Count': inventory.filter(ad => ad.status !== 'Booked').length, 'Details': 'Ready for booking' },
            { 'Category': 'Booked Inventory', 'Count': inventory.filter(ad => ad.status === 'Booked').length, 'Details': 'Currently occupied' },
            { 'Category': 'Pending Bookings', 'Count': bookings.filter(b => b.status === 'Pending').length, 'Details': 'Awaiting response' },
            { 'Category': '', 'Count': '', 'Details': '' },
            { 'Category': 'Report Generated', 'Count': '', 'Details': new Date().toLocaleString() }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(reportSummary);
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
        
    } catch (error) {
        console.error('Error in generateReportsExcel:', error);
        throw error;
    }
}