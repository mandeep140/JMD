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
            case 'expiring_bookings':
                excelBuffer = generateExpiringBookingsExcel(excelData);
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
        
        // Helper function to get field value safely
        const getFieldValue = (ad, field, defaultValue = 'N/A') => {
            const value = ad[field];
            if (value === undefined || value === null || value === '') {
                return defaultValue;
            }
            return value;
        };

        // Helper function to format price
        const formatPrice = (price) => {
            if (!price) return 'N/A';
            const numericPrice = parseInt(price.toString().replace(/[^0-9]/g, ''));
            return numericPrice ? `₹${numericPrice.toLocaleString()}` : 'N/A';
        };

        // Helper function to parse size info with fallback to individual width/height
        const parseSizeInfo = (ad) => {
            // First try to use individual width and height fields
            if (ad.width && ad.height) {
                const width = parseFloat(ad.width);
                const height = parseFloat(ad.height);
                return {
                    width: `${width}ft`,
                    height: `${height}ft`,
                    totalSqft: `${width * height} sq ft`
                };
            }
            
            // Fallback to parsing size string
            if (ad.size) {
                const match = ad.size.match(/(\d+)\s*[*x×]\s*(\d+)/i);
                if (match) {
                    const height = parseInt(match[1]);
                    const width = parseInt(match[2]);
                    return {
                        width: `${width}ft`,
                        height: `${height}ft`,
                        totalSqft: `${width * height} sq ft`
                    };
                }
                return { width: ad.size, height: 'N/A', totalSqft: 'N/A' };
            }
            
            return { width: 'N/A', height: 'N/A', totalSqft: 'N/A' };
        };
        
        // Prepare inventory data with selected fields (removed: Image ID, Views, Show on Site, Size String)
        const inventoryData = data.map((ad, index) => {
            const sizeInfo = parseSizeInfo(ad);
            
            return {
                // Basic Information
                'Sr.No': index + 1,
                'Media Code': getFieldValue(ad, 'mediacode'),
                'Title/Location': getFieldValue(ad, 'title'),
                'City': getFieldValue(ad, 'city'),
                'State': getFieldValue(ad, 'state'),
                'Locality': getFieldValue(ad, 'locality'),
                'Type': getFieldValue(ad, 'type'),
                
                // Size & Dimensions
                'Height (ft)': sizeInfo.height,
                'Width (ft)': sizeInfo.width,
                'Total Area': sizeInfo.totalSqft,
                'Units': getFieldValue(ad, 'unit', 1),
                'Visibility': getFieldValue(ad, 'visibility', 'Single'),
                
                // Technical Details
                'Lighting': getFieldValue(ad, 'lighting'),
                'Status': getFieldValue(ad, 'status', 'Available'),
                
                // Pricing
                'Price/Day (₹)': formatPrice(ad.priceperday),
                'Price/Month (₹)': formatPrice(ad.pricepermonth),
                'Printing Cost/sqft (₹)': getFieldValue(ad, 'printing'),
                'Mounting Cost/sqft (₹)': getFieldValue(ad, 'mounting'),
                
                // Booking Information
                'Client Name': getFieldValue(ad, 'clientname'),
                'Booked From': getFieldValue(ad, 'bookedfrom'),
                'Booked Till': getFieldValue(ad, 'bookedtill'),
                'Hold/Booked By': getFieldValue(ad, 'holdBookedBy'),
                'Media Owner': getFieldValue(ad, 'mediaOwner'),
                
                // Location & Technical
                'Coordinates': ad.coordinates ? `${ad.coordinates.lat}, ${ad.coordinates.lng}` : 'N/A',
                
                // Admin Information
                'Description/Message': getFieldValue(ad, 'message'),
                'Image URL': getFieldValue(ad, 'imageUrl'),
                'Created Date': ad.date ? new Date(ad.date).toLocaleDateString() : 'N/A',
                'Created Time': ad.date ? new Date(ad.date).toLocaleTimeString() : 'N/A',
                
                // Uploader Information
                'Uploaded By Name': ad.uploadedBy?.name || 'N/A',
                'Uploaded By Email': ad.uploadedBy?.email || 'N/A'
            };
        });
        
        const inventoryWorksheet = XLSX.utils.json_to_sheet(inventoryData);
        
        // Set column widths for remaining fields (removed 4 columns)
        const colWidths = [
            { wch: 8 },   // Sr.No
            { wch: 15 },  // Media Code
            { wch: 35 },  // Title/Location
            { wch: 15 },  // City
            { wch: 15 },  // State
            { wch: 20 },  // Locality
            { wch: 20 },  // Type
            { wch: 12 },  // Height
            { wch: 12 },  // Width
            { wch: 15 },  // Total Area
            { wch: 8 },   // Units
            { wch: 12 },  // Visibility
            { wch: 15 },  // Lighting
            { wch: 12 },  // Status
            { wch: 15 },  // Price/Day
            { wch: 16 },  // Price/Month
            { wch: 18 },  // Printing Cost
            { wch: 18 },  // Mounting Cost
            { wch: 25 },  // Client Name
            { wch: 15 },  // Booked From
            { wch: 15 },  // Booked Till
            { wch: 25 },  // Hold/Booked By
            { wch: 25 },  // Media Owner
            { wch: 25 },  // Coordinates
            { wch: 45 },  // Description/Message
            { wch: 50 },  // Image URL
            { wch: 15 },  // Created Date
            { wch: 15 },  // Created Time
            { wch: 25 },  // Uploaded By Name
            { wch: 30 }   // Uploaded By Email
        ];
        inventoryWorksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, inventoryWorksheet, 'Inventory');
        
        // Generate enhanced summary
        const totalAds = data.length;
        const availableAds = data.filter(ad => ad.status !== 'Booked' && ad.status !== 'Hold').length;
        const bookedAds = data.filter(ad => ad.status === 'Booked').length;
        const holdAds = data.filter(ad => ad.status === 'Hold').length;
        const totalViews = data.reduce((sum, ad) => sum + (ad.views || 0), 0);
        const totalArea = data.reduce((sum, ad) => {
            const width = parseFloat(ad.width) || 0;
            const height = parseFloat(ad.height) || 0;
            return sum + (width * height);
        }, 0);
        
        const uniqueCities = [...new Set(data.map(ad => ad.city).filter(Boolean))];
        const uniqueStates = [...new Set(data.map(ad => ad.state).filter(Boolean))];
        const uniqueTypes = [...new Set(data.map(ad => ad.type).filter(Boolean))];
        const uniqueMediaOwners = [...new Set(data.map(ad => ad.mediaOwner).filter(Boolean))];
        
        // Price analysis
        const pricesPerMonth = data.map(ad => parseInt(ad.pricepermonth?.toString().replace(/[^0-9]/g, '') || 0)).filter(p => p > 0);
        const avgPricePerMonth = pricesPerMonth.length > 0 ? Math.round(pricesPerMonth.reduce((a, b) => a + b, 0) / pricesPerMonth.length) : 0;
        const minPrice = pricesPerMonth.length > 0 ? Math.min(...pricesPerMonth) : 0;
        const maxPrice = pricesPerMonth.length > 0 ? Math.max(...pricesPerMonth) : 0;
        
        const summaryData = [
            { 'Metric': 'INVENTORY SUMMARY REPORT', 'Value': '', 'Details': '' },
            { 'Metric': '', 'Value': '', 'Details': '' },
            
            // Basic Stats
            { 'Metric': 'BASIC STATISTICS', 'Value': '', 'Details': '' },
            { 'Metric': 'Total Hoardings', 'Value': totalAds, 'Details': 'All media inventory' },
            { 'Metric': 'Available', 'Value': availableAds, 'Details': 'Ready for booking' },
            { 'Metric': 'Booked', 'Value': bookedAds, 'Details': 'Currently occupied' },
            { 'Metric': 'On Hold', 'Value': holdAds, 'Details': 'Reserved but not confirmed' },
            { 'Metric': 'Total Views', 'Value': totalViews, 'Details': 'Website page views' },
            { 'Metric': 'Total Area (sqft)', 'Value': totalArea.toLocaleString(), 'Details': 'Combined advertising space' },
            { 'Metric': '', 'Value': '', 'Details': '' },
            
            // Pricing Analysis
            { 'Metric': 'PRICING ANALYSIS', 'Value': '', 'Details': '' },
            { 'Metric': 'Average Price/Month', 'Value': `₹${avgPricePerMonth.toLocaleString()}`, 'Details': 'Mean monthly rate' },
            { 'Metric': 'Minimum Price', 'Value': `₹${minPrice.toLocaleString()}`, 'Details': 'Lowest monthly rate' },
            { 'Metric': 'Maximum Price', 'Value': `₹${maxPrice.toLocaleString()}`, 'Details': 'Highest monthly rate' },
            { 'Metric': '', 'Value': '', 'Details': '' },
            
            // Geographic Coverage
            { 'Metric': 'GEOGRAPHIC COVERAGE', 'Value': '', 'Details': '' },
            { 'Metric': 'States Covered', 'Value': uniqueStates.length, 'Details': uniqueStates.join(', ') || 'N/A' },
            { 'Metric': 'Cities Covered', 'Value': uniqueCities.length, 'Details': uniqueCities.slice(0, 10).join(', ') + (uniqueCities.length > 10 ? '...' : '') },
            { 'Metric': 'Media Types', 'Value': uniqueTypes.length, 'Details': uniqueTypes.join(', ') || 'N/A' },
            { 'Metric': 'Media Owners', 'Value': uniqueMediaOwners.length, 'Details': uniqueMediaOwners.slice(0, 5).join(', ') + (uniqueMediaOwners.length > 5 ? '...' : '') },
            { 'Metric': '', 'Value': '', 'Details': '' },
            
            // Report Info
            { 'Metric': 'REPORT INFORMATION', 'Value': '', 'Details': '' },
            { 'Metric': 'Generated On', 'Value': new Date().toLocaleDateString(), 'Details': new Date().toLocaleTimeString() },
            { 'Metric': 'Generated By', 'Value': 'JMD Admin Panel', 'Details': 'Automated inventory export' }
        ];
        
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        summaryWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 50 }];
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

        const bookingSummary = [
            { 'Metric': 'Booking Requests Summary', 'Value': '' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Total Requests', 'Value': totalRequests },
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

function generateExpiringBookingsExcel(data) {
    try{
        const workbook = XLSX.utils.book_new();

        const expiringData = data.map((booking, index) => ({
            'Sr.No': index + 1,
            'Media ID': booking.mediacode || 'N/A',
            'Customer Name': booking.clientname || 'N/A',
            'Media Owner': booking.mediaOwner || 'N/A',
            'Cost PM': booking.pricepermonth ? `₹${parseInt(booking.pricepermonth.toString().replace(/[^0-9]/g, '')).toLocaleString()}` : 'N/A',
            'Booking Date': booking.bookedfrom ? new Date(booking.bookedfrom).toLocaleDateString("en-IN") : 'N/A',
            'Expiry Date': booking.bookedtill ? new Date(booking.bookedtill).toLocaleDateString("en-IN") : 'N/A'
        }));

        const expiringWorksheet = XLSX.utils.json_to_sheet(expiringData);

        const colWidths = [
            { wch: 8 },   // Sr.No
            { wch: 20 },  // Media ID
            { wch: 25 },  // Customer Name
            { wch: 25 },  // Media Owner
            { wch: 15 },  // Cost PM
            { wch: 20 },  // Booking Date
            { wch: 20 }   // Expiry Date
        ];
        expiringWorksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, expiringWorksheet, 'Expiring Bookings');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });

    } catch (error) {
        console.error('Error in generateExpiringBookingsExcel:', error);
        throw error;
    }
}

function generateReportsExcel(data) {
    try {
        const workbook = XLSX.utils.book_new();
        
        // Since this is for reports page, data is the contact form data from home page
        const contactData = Array.isArray(data) ? data : [];
        
        // Main Contact Forms Sheet
        if (contactData.length > 0) {
            const formattedData = contactData.map((contact, index) => ({
                'Sr.No': index + 1,
                'Request ID': contact.reqid || 'N/A',
                'Name': contact.name || 'N/A',
                'Email': contact.email || 'N/A',
                'Phone': contact.phone || 'N/A',
                'Message': contact.message || 'N/A',
                'Date Submitted': contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A',
                'Time': contact.createdAt ? new Date(contact.createdAt).toLocaleTimeString() : 'N/A'
            }));
            
            const contactWorksheet = XLSX.utils.json_to_sheet(formattedData);
            
            // Auto-resize columns
            contactWorksheet['!cols'] = [
                { wch: 8 },  // Sr.No
                { wch: 15 }, // Request ID
                { wch: 20 }, // Name
                { wch: 25 }, // Email
                { wch: 15 }, // Phone
                { wch: 20 }, // Company
                { wch: 40 }, // Message
                { wch: 12 }, // Date
                { wch: 10 }  // Time
            ];
            
            XLSX.utils.book_append_sheet(workbook, contactWorksheet, 'Contact Forms');
        }
        
        // Summary Report Sheet
        const reportSummary = [
            { 'Metric': 'Contact Forms Report Summary', 'Count': '', 'Details': '' },
            { 'Metric': '', 'Count': '', 'Details': '' },
            { 'Metric': 'Total Contact Forms', 'Count': contactData.length, 'Details': 'All customer inquiries from website' },
            { 'Metric': '', 'Count': '', 'Details': '' },
            { 'Metric': 'Today\'s Forms', 'Count': contactData.filter(c => {
                if (!c.createdAt) return false;
                const today = new Date().toDateString();
                return new Date(c.createdAt).toDateString() === today;
            }).length, 'Details': 'Submitted today' },
            { 'Metric': 'This Week\'s Forms', 'Count': contactData.filter(c => {
                if (!c.createdAt) return false;
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(c.createdAt) >= weekAgo;
            }).length, 'Details': 'Last 7 days' },
            { 'Metric': 'This Month\'s Forms', 'Count': contactData.filter(c => {
                if (!c.createdAt) return false;
                const thisMonth = new Date().getMonth();
                const thisYear = new Date().getFullYear();
                const contactDate = new Date(c.createdAt);
                return contactDate.getMonth() === thisMonth && contactDate.getFullYear() === thisYear;
            }).length, 'Details': 'Current month' },
            { 'Metric': '', 'Count': '', 'Details': '' },
            { 'Metric': '', 'Count': '', 'Details': '' },
            { 'Metric': 'Report Generated On', 'Count': '', 'Details': new Date().toLocaleString() }
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