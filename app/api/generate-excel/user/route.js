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
            'City', 'Medium', 'Type', 'Location', 'Hor', 'Ver', 'Faci', 'Units', 'SQFT', 
            'Display Charges Per Month', 'Printing', 'Mounting', 'Total Cost'
        ]);

        // Data rows
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
            
            // Display total cost
            const displayTotalCost = (printingResult.value > 0 || mountingResult.value > 0) 
                ? totalCost.toLocaleString() 
                : monthlyRate > 0 
                    ? monthlyRate.toLocaleString() 
                    : 'N/A';
            
            sheetData.push([
                ad.city || '',
                ad.type || 'Billboard',
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
                displayTotalCost
            ]);
        });

        // Add empty rows before terms
        sheetData.push(new Array(13).fill(''));
        sheetData.push(new Array(13).fill(''));

        // Terms and Conditions
        sheetData.push(['Terms and Condition...', '', '', '', '', '', '', '', '', '', '', '', '']);
        
        const terms = [
            ['1', 'Inventries will be provided absolutely on First Come n\' First Serve basis'],
            ['2', 'To prevent loosing a perticular inventory, quick booking is advisable.'],
            ['3', 'Please confirm the availability at the time of booking.'],
            ['4', 'Please inform atleast 10 days before to drop out the inventory by mail only.'],
            ['5', 'Raise an Work Order duly Sealed n\' Signature by the client at the time of booking confirmation.'],
            ['6', 'The company will not been responsible for any damage or lost of the flex once installed.'],
            ['7', 'Except Authorised mail all other medium of conversation will be treated as null n\' void.'],
            ['8', '50% advance along with a Security Cheque along with xerox copy of Aadhar and GST Certificate is required'],
            ['9', 'Any payment made is only in favour of "JAI MATA DI" only.'],
            ['10', 'Any dispute is subject to Jamshedpur Juridiction only.']
        ];

        terms.forEach(term => {
            const termRow = new Array(13).fill('');
            termRow[0] = term[0];
            termRow[1] = term[1];
            sheetData.push(termRow);
        });

        // Create worksheet from array of arrays
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        
        // Set column widths to match attachment
        const colWidths = [
            { wch: 20 },  // City
            { wch: 90 },  // Medium
            { wch: 6 },   // Type (Lighting)
            { wch: 50 },  // Location
            { wch: 6 },   // Hor
            { wch: 6 },   // Ver
            { wch: 6 },   // Faci
            { wch: 8 },   // Units
            { wch: 8 },   // SQFT
            { wch: 20 },  // Display Charges Per Month
            { wch: 12 },  // Printing
            { wch: 12 },  // Mounting
            { wch: 15 }   // Total Cost
        ];
        worksheet['!cols'] = colWidths;

        // Merge cells for QUOTATION header (A1:M1)
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }
        ];

        // Get the range
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const dataEndRow = 2 + (data.ads?.length || 0) - 1;

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

        // Style Terms header
        const termsStartRow = dataEndRow + 3;
        const termsHeaderCell = XLSX.utils.encode_cell({ r: termsStartRow, c: 0 });
        if (worksheet[termsHeaderCell]) {
            worksheet[termsHeaderCell].s = {
                font: { bold: true, sz: 12 }
            };
        }

        // Set row heights
        worksheet['!rows'] = [];
        worksheet['!rows'][0] = { hpt: 25 }; // QUOTATION header height
        worksheet['!rows'][1] = { hpt: 20 }; // Column headers height
        
        // Set heights for terms section
        worksheet['!rows'][termsStartRow] = { hpt: 25 }; // "Terms and Condition..." header

        // Make terms rows taller for better readability
        for (let i = 1; i <= 10; i++) {
            const termRowIndex = termsStartRow + i;
            worksheet['!rows'][termRowIndex] = { hpt: 35 }; // Increased height for terms rows
        }

        // Style terms rows with better spacing
        for (let i = 1; i <= 10; i++) {
            const termRow = termsStartRow + i;
            
            // Number column
            const numCell = XLSX.utils.encode_cell({ r: termRow, c: 0 });
            if (worksheet[numCell]) {
                worksheet[numCell].s = {
                    font: { bold: true, sz: 11 },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }

            // Text column with better formatting
            const textCell = XLSX.utils.encode_cell({ r: termRow, c: 1 });
            if (worksheet[textCell]) {
                worksheet[textCell].s = {
                    font: { sz: 10 },
                    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
                    border: {
                        top: { style: "thin", color: { rgb: "CCCCCC" } },
                        bottom: { style: "thin", color: { rgb: "CCCCCC" } }
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