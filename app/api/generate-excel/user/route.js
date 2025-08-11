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
        
        // Helper function to parse size and get dimensions
        const parseSizeAndCalculateSqft = (sizeStr, height, width) => {
            // Use separate height/width if available, otherwise parse from size string
            if (height && width) {
                const h = parseFloat(height);
                const w = parseFloat(width);
                return {
                    horizontal: w, // Width = Horizontal
                    vertical: h,   // Height = Vertical
                    totalSqft: h * w
                };
            }
            
            if (!sizeStr) return { horizontal: '', vertical: '', totalSqft: '' };
            
            // Try to extract dimensions like "10*20ft (200sqft)" or "10x20ft" or "10*20"
            const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*[*x×]\s*(\d+(?:\.\d+)?)/i);
            if (match) {
                const h = parseFloat(match[1]);
                const w = parseFloat(match[2]);
                return {
                    horizontal: w, // Width = Horizontal
                    vertical: h,   // Height = Vertical
                    totalSqft: h * w
                };
            }
            
            return { horizontal: '', vertical: '', totalSqft: '' };
        };

        // Helper function to convert lighting to short form
        const getLightingCode = (lighting) => {
            if (!lighting) return 'NL';
            const lightingMap = {
                'No Light': 'NL',
                'Fully Light': 'FL', 
                'Front Light': 'FRL',
                'Back Light': 'BL'
            };
            return lightingMap[lighting] || 'NL';
        };

        // Build the complete sheet data
        const sheetData = [];
        
        // Row 1: QUOTATION header (merged across columns)
        const headerRow = new Array(13).fill('');
        headerRow[0] = 'QUOTATION';
        sheetData.push(headerRow);
        
        // Row 2: Column headers
        sheetData.push([
            'State', 'City', 'Medium', 'Type', 'Location', 'Hor', 'Ver', 'Faci', 'Units', 'SQFT', 
            'Display Charges Per Month', 'Printing', 'Mounting', 'Total Cost', 'GST', 'GST cost', 'Total Cost with GST'
        ]);

        // Data rows
        let gstTotal = 0;
        let totalWithGstTotal = 0;

        data.ads?.forEach((ad, index) => {
            const sizeInfo = parseSizeAndCalculateSqft(ad.size, ad.height, ad.width);
            const monthlyRate = ad.pricePerMonth ? parseInt(ad.pricePerMonth.toString().replace(/[^0-9]/g, '')) || 0 : 0;
            const units = ad.unit || 1;
            
            // Helper function to safely get cost value from printing/mounting fields
            const getCostValue = (value) => {
                if (value === undefined || value === null || value === '' || value === 'N/A') {
                    return { value: 0, display: 'N/A', isNumeric: false };
                }
                
                // Check if it's a number (stored as string or actual number)
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && parsed > 0) {
                    return { value: parsed, display: parsed.toLocaleString(), isNumeric: true };
                }
                
                // If not numeric, treat as type (like "Vinyl Print", "Wall Mount")
                return { value: 0, display: value.toString(), isNumeric: false };
            };
            
            // Get printing and mounting costs/types
            const printingResult = getCostValue(ad.printing);
            const mountingResult = getCostValue(ad.mounting);
            
            // Calculate total cost (only add numeric values)
            const totalCost = monthlyRate + printingResult.value + mountingResult.value;
            const gstCost = totalCost * 0.18;
            const totalWithGst = totalCost + gstCost;

            // Accumulate totals
            gstTotal += gstCost;
            totalWithGstTotal += totalWithGst;

            // Display total cost
            const displayTotalCost = (printingResult.value > 0 || mountingResult.value > 0) 
                ? totalCost.toLocaleString() 
                : monthlyRate > 0 
                    ? monthlyRate.toLocaleString() 
                    : 'N/A';

            sheetData.push([
                ad.state || '',
                ad.city || '',
                ad.type || '',
                getLightingCode(ad.lighting),
                ad.title || '',
                sizeInfo.horizontal || '',
                sizeInfo.vertical || '',
                ad.visibility === 'Double' ? 2 : 1,
                units,
                sizeInfo.totalSqft || '',
                monthlyRate ? monthlyRate.toLocaleString() : '',
                printingResult.display, // Will show cost if numeric, type if text
                mountingResult.display,  // Will show cost if numeric, type if text
                displayTotalCost,
                '18%',
                gstCost.toLocaleString(),
                totalWithGst.toLocaleString()
            ]);
        });

        // Add "Total" row after all ads
        const totalRow = new Array(14).fill('');
        totalRow[15] = gstTotal.toLocaleString(); // GST total column
        totalRow[16] = totalWithGstTotal.toLocaleString(); // Total with GST column
        totalRow[14] = 'Total'; // Label in first column
        sheetData.push(totalRow);

        // Add empty rows before terms (only once)
        sheetData.push(new Array(17).fill(''));
        sheetData.push(new Array(17).fill(''));

        // Terms and Conditions - Create merged header row (only once)
        const termsHeaderRow = new Array(17).fill('');
        termsHeaderRow[0] = 'Terms and Condition...';
        sheetData.push(termsHeaderRow);

        const terms = [
            'Inventries will be provided absolutely on First Come n\' First Serve basis',
            'To prevent loosing a perticular inventory, quick booking is advisable.',
            'Please confirm the availability at the time of booking.',
            'Please inform atleast 10 days before to drop out the inventory by mail only.',
            'Raise an Work Order duly Sealed n\' Signature by the client at the time of booking confirmation.',
            'The company will not been responsible for any damage or lost of the flex once installed.',
            'Except Authorised mail all other medium of conversation will be treated as null n\' void.',
            '50% advance along with a Security Cheque along with xerox copy of Aadhar and GST Certificate is required',
            'Any payment made is only in favour of "JAI MATA DI" only.',
            'Any dispute is subject to Jamshedpur Juridiction only.',
        ];

        // Add each term as a merged row
        terms.forEach((term, index) => {
            const termRow = new Array(17).fill('');
            termRow[0] = `${index + 1}. ${term}`;
            sheetData.push(termRow);
        });

        // Create worksheet from array of arrays
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        
        // Set column widths to match attachment
        const colWidths = [
            { wch: 10 },  // State
            { wch: 20 },  // City
            { wch: 22 },  // Medium
            { wch: 6 },   // Type (Lighting)
            { wch: 50 },  // Location
            { wch: 6 },   // Hor
            { wch: 6 },   // Ver
            { wch: 6 },   // Faci
            { wch: 8 },   // Units
            { wch: 8 },   // SQFT
            { wch: 23 },  // Display Charges Per Month
            { wch: 12 },  // Printing
            { wch: 12 },  // Mounting
            { wch: 15 },  // Cost
            { wch: 15 },  // gst
            { wch: 15 },  // gst cost
            { wch: 18 }   // total cost with gst
        ];
        worksheet['!cols'] = colWidths;

        // Calculate terms header row index
        const dataEndRow = 2 + (data.ads?.length || 0) - 1;
        const termsStartRow = dataEndRow + 3;

        // Create merge array for all terms rows
        const merges = [
            // QUOTATION header (A1:M1)
            { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
            // Terms and Condition header (merge across all columns)
            { s: { r: termsStartRow, c: 0 }, e: { r: termsStartRow, c: 12 } }
        ];

        // Add merges for all 10 terms rows
        for (let i = 1; i <= 11; i++) {
            merges.push({
                s: { r: termsStartRow + i, c: 0 }, 
                e: { r: termsStartRow + i, c: 12 }
            });
        }

        worksheet['!merges'] = merges;

        // Get the range
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // Style QUOTATION header (Row 1) - Red background like attachment
        const quotationCell = 'A1';
        worksheet[quotationCell] = { 
            v: 'QUOTATION', 
            t: 's', 
            s: { 
                font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } }, 
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "FF0000" } }, // Red background
                border: {
                    top: { style: "thick", color: { rgb: "000000" } },
                    bottom: { style: "thick", color: { rgb: "000000" } },
                    left: { style: "thick", color: { rgb: "000000" } },
                    right: { style: "thick", color: { rgb: "000000" } }
                }
            }
        };

        // Style column headers (Row 2) - Yellow background like attachment
        for (let col = 0; col < 13; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    font: { bold: true, color: { rgb: "000000" } },
                    fill: { fgColor: { rgb: "FFFF00" } }, // Yellow background
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
        }

        // Style data rows with borders
        for (let row = 2; row <= dataEndRow; row++) {
            for (let col = 0; col < 13; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (worksheet[cellAddress]) {
                    worksheet[cellAddress].s = {
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        },
                        alignment: { horizontal: 'center', vertical: 'center' }
                    };
                }
            }
        }

        // Set normal row heights for all rows
        worksheet['!rows'] = [];
        worksheet['!rows'][0] = { hpt: 25 }; // QUOTATION header height
        worksheet['!rows'][1] = { hpt: 20 }; // Column headers height
        
        // Normal height for terms header
        worksheet['!rows'][termsStartRow] = { hpt: 25 }; // Terms header - normal height

        // Set normal heights for terms rows (remove the increased height)
        for (let i = 1; i <= 10; i++) {
            const termRowIndex = termsStartRow + i;
            worksheet['!rows'][termRowIndex] = { hpt: 20 }; // Normal height for terms rows
        }

        // Style all terms rows - merged across all columns
        for (let i = 1; i <= 10; i++) {
            const termRow = termsStartRow + i;
            const termCell = XLSX.utils.encode_cell({ r: termRow, c: 0 });
            
            if (worksheet[termCell]) {
                worksheet[termCell].s = {
                    font: { sz: 10 },
                    alignment: { horizontal: 'left', vertical: 'center' },
                    border: {
                        top: { style: "thin", color: { rgb: "CCCCCC" } },
                        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                        left: { style: "thin", color: { rgb: "CCCCCC" } },
                        right: { style: "thin", color: { rgb: "CCCCCC" } }
                    }
                };
            }
        }

        // Add the single worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'JMD Quotation');
        
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