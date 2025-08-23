import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request) {
    try {
        const data = await request.json();
        
        const excelBuffer = await generateUserExcel(data);
        
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

async function generateUserExcel(data) {
    try {
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('JMD Quotation');
        
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

        // Set column widths (added Sr No column)
        worksheet.columns = [
            { width: 6 },   // Sr No
            { width: 12 },  // State
            { width: 20 },  // City
            { width: 25 },  // Medium
            { width: 8 },   // Type (Lighting)
            { width: 50 },  // Location
            { width: 8 },   // Hor
            { width: 8 },   // Ver
            { width: 8 },   // Faci
            { width: 10 },  // Units
            { width: 10 },  // SQFT
            { width: 25 },  // Display Charges Per Month
            { width: 15 },  // Printing
            { width: 15 },  // Mounting
            { width: 18 },  // Total Cost
            { width: 8 },   // GST
            { width: 15 },  // GST cost
            { width: 20 }   // Total Cost with GST
        ];

        // Row 1: Company header "From JMD - Advertisement"
        worksheet.mergeCells('A1:R1');
        const companyHeaderCell = worksheet.getCell('A1');
        companyHeaderCell.value = {
            richText: [
                { text: 'From ', font: { size: 14, color: { argb: 'FF000000' } } },
                { text: 'JMD - Advertisement', font: { bold: true, size: 14, color: { argb: 'FF000000' } } }
            ]
        };
        companyHeaderCell.style = {
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
        worksheet.getRow(1).height = 25;

        // Row 2: JMD Address
        worksheet.mergeCells('A2:R2');
        const addressCell = worksheet.getCell('A2');
        addressCell.value = 'B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002) | Phone: +91-9204965321 | Email: info.jmd.jsr@gmail.com';
        addressCell.style = {
            font: { size: 11, color: { argb: 'FF666666' } },
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
        worksheet.getRow(2).height = 20;

        // Row 3: Empty row for spacing
        worksheet.getRow(3).height = 15;

        // Row 4: Empty row for spacing
        worksheet.getRow(4).height = 15;

        // Row 5: QUOTATION header (merged across columns)
        worksheet.mergeCells('A5:R5');
        const quotationCell = worksheet.getCell('A5');
        quotationCell.value = 'QUOTATION';
        quotationCell.style = {
            font: { bold: true, size: 16, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thick' },
                left: { style: 'thick' },
                bottom: { style: 'thick' },
                right: { style: 'thick' }
            }
        };
        worksheet.getRow(5).height = 30;

        // Row 6: Column headers (added Sr No)
        const headers = [
            'Sr No', 'State', 'City', 'Medium', 'Type', 'Location', 'hor', 'ver', 'Faci', 'Units', 'SQFT', 
            'Display Charges Per Month', 'Printing', 'Mounting', 'Total Cost', 'GST', 'GST cost', 'Total Cost with GST'
        ];
        
        const headerRow = worksheet.getRow(6);
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header;
            cell.style = {
                font: { bold: true, color: { argb: 'FF000000' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            };
        });
        headerRow.height = 25;

        // Data rows (starting from row 7)
        let currentRow = 7;
        let displayChargesTotal = 0;
        let printingTotal = 0;
        let mountingTotal = 0;
        let totalCostSum = 0;
        let gstTotal = 0;
        let totalWithGstTotal = 0;

        data.ads?.forEach((ad, index) => {
            const sizeInfo = parseSizeAndCalculateSqft(ad.size, ad.height, ad.width);
            const monthlyRate = ad.pricePerMonth ? parseInt(ad.pricePerMonth.toString().replace(/[^0-9]/g, '')) || 0 : 0;
            const units = ad.unit || 1;
            const height = parseFloat(ad.height) || 0;
            const width = parseFloat(ad.width) || 0;
            const visibility = ad.visibility === 'Double' ? 2 : 1;
            const totalArea = height * width * units * visibility; // Total area for all units

            // Helper function to safely get cost value and calculate total cost
            const getCostValue = (value, multiplier = 1) => {
                if (value === undefined || value === null || value === '' || value === 'N/A') {
                    return { value: 0, display: 'N/A', isNumeric: false };
                }
                
                // Check if it's a number (stored as string or actual number)
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && parsed > 0) {
                    const totalCost = parsed * multiplier;
                    return { value: totalCost, display: totalCost.toLocaleString(), isNumeric: true };
                }
                
                // If not numeric, treat as type (like "Vinyl Print", "Wall Mount")
                return { value: 0, display: value.toString(), isNumeric: false };
            };
            
            // Calculate printing and mounting costs with area multiplication
            const printingResult = getCostValue(ad.printing, totalArea);
            const mountingResult = getCostValue(ad.mounting, totalArea);
            
            // Calculate total cost (only add numeric values)
            const totalCost = monthlyRate + printingResult.value + mountingResult.value;
            const gstCost = totalCost * 0.18;
            const totalWithGst = totalCost + gstCost;

            // Accumulate totals
            displayChargesTotal += monthlyRate;
            printingTotal += printingResult.value;
            mountingTotal += mountingResult.value;
            totalCostSum += totalCost;
            gstTotal += gstCost;
            totalWithGstTotal += totalWithGst;

            // Display total cost
            const displayTotalCost = (printingResult.value > 0 || mountingResult.value > 0) 
                ? totalCost.toLocaleString() 
                : monthlyRate > 0 
                    ? monthlyRate.toLocaleString() 
                    : 'N/A';

            // Add data row (added serial number as first column)
            const dataRow = worksheet.getRow(currentRow);
            const rowData = [
                index + 1, // Sr No
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
                printingResult.display,
                mountingResult.display,
                displayTotalCost,
                '18%',
                gstCost.toLocaleString(),
                totalWithGst.toLocaleString()
            ];

            rowData.forEach((value, colIndex) => {
                const cell = dataRow.getCell(colIndex + 1);
                cell.value = value;
                cell.style = {
                    alignment: { horizontal: 'center', vertical: 'middle' },
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            });
            dataRow.height = 20;
            currentRow++;
        });

        // Add "Total" row after all ads (updated with all totals)
        const totalRow = worksheet.getRow(currentRow);
        totalRow.getCell(11).value = 'Total'; // SQFT column (11th column)
        totalRow.getCell(12).value = displayChargesTotal.toLocaleString(); // Display Charges Per Month
        totalRow.getCell(13).value = printingTotal.toLocaleString(); // Printing
        totalRow.getCell(14).value = mountingTotal.toLocaleString(); // Mounting
        totalRow.getCell(15).value = totalCostSum.toLocaleString(); // Total Cost
        totalRow.getCell(16).value = '18%'; // GST (keep as 18%)
        totalRow.getCell(17).value = gstTotal.toLocaleString(); // GST cost
        totalRow.getCell(18).value = totalWithGstTotal.toLocaleString(); // Total Cost with GST
        
        // Style total row (updated to include SQFT column)
        [11, 12, 13, 14, 15, 16, 17, 18].forEach(colIndex => {
            const cell = totalRow.getCell(colIndex);
            cell.style = {
                font: { bold: true },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } }
            };
        });
        totalRow.height = 20;
        currentRow++;

        // Add empty rows before terms
        currentRow += 2;

        // Terms and Conditions - Create merged header row (updated column range)
        worksheet.mergeCells(`A${currentRow}:R${currentRow}`);
        const termsHeaderCell = worksheet.getCell(`A${currentRow}`);
        termsHeaderCell.value = 'Terms and Condition...';
        termsHeaderCell.style = {
            font: { bold: true, size: 12 },
            alignment: { horizontal: 'left', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
        worksheet.getRow(currentRow).height = 25;
        currentRow++;

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

        // Add each term as a merged row (updated column range)
        terms.forEach((term, index) => {
            worksheet.mergeCells(`A${currentRow}:R${currentRow}`);
            const termCell = worksheet.getCell(`A${currentRow}`);
            termCell.value = `${index + 1}. ${term}`;
            termCell.style = {
                font: { size: 10 },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                }
            };
            worksheet.getRow(currentRow).height = 20;
            currentRow++;
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        return buffer;
        
    } catch (error) {
        console.error('Error in generateUserExcel:', error);
        throw error;
    }
}