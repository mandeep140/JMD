import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request) {
  try {
    const { agreements } = await request.json();

    if (!agreements || agreements.length === 0) {
      return NextResponse.json({ error: 'No agreements provided' }, { status: 400 });
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'JMD Rent Agreement System';
    workbook.created = new Date();

    // Create Master Sheet
    const masterSheet = workbook.addWorksheet('Master List', {
      properties: { tabColor: { argb: 'FF0066CC' } }
    });

    // Master Sheet Headers
    const masterHeaders = [
      'SL.NO', 'RFQ.NO', 'SIZE', 'Total sq ft', 'JMD/JOINT', 
      'AGREEMENT YEAR', 'ANNUAL RENT', 'DUES DATE', 'DUES AMOUNT', 'EXPECTED SALES'
    ];

    // Style master headers
    masterSheet.addRow(masterHeaders);
    const masterHeaderRow = masterSheet.getRow(1);
    masterHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    masterHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' }
    };
    masterHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Set column widths for master sheet
    masterSheet.columns = [
      { width: 8 },   // SL.NO
      { width: 15 },  // RFQ.NO
      { width: 15 },  // SIZE
      { width: 12 },  // Total sq ft
      { width: 12 },  // JMD/JOINT
      { width: 15 },  // AGREEMENT YEAR
      { width: 15 },  // ANNUAL RENT
      { width: 15 },  // DUES DATE
      { width: 15 },  // DUES AMOUNT
      { width: 15 }   // EXPECTED SALES
    ];

    // Add data to master sheet and create individual sheets
    agreements.forEach((agreement, index) => {
      const serialNo = index + 1;
      const totalSqFt = (parseFloat(agreement.width) || 0) * (parseFloat(agreement.height) || 0);
      
      // Add row to master sheet with hyperlink
      const masterRow = masterSheet.addRow([
        serialNo,
        agreement.adCode || '',
        `${agreement.width || 0} x ${agreement.height || 0} ft`,
        totalSqFt,
        agreement.rentType || '',
        agreement.agreementFrom ? new Date(agreement.agreementFrom).getFullYear() : '',
        agreement.annualRent || 0,
        agreement.duesDate ? new Date(agreement.duesDate).toLocaleDateString() : '',
        agreement.duesAmount || 0,
        agreement.expectedSales || 0
      ]);

      // Add hyperlink to serial number
      const serialCell = masterRow.getCell(1);
      serialCell.value = {
        text: serialNo.toString(),
        hyperlink: `#'${agreement.adCode || `Ad_${serialNo}`}'!A1`,
        tooltip: `Click to view details for ${agreement.adCode}`
      };
      serialCell.font = { color: { argb: 'FF0066CC' }, underline: true };

      // Style master row
      masterRow.alignment = { horizontal: 'center', vertical: 'middle' };
      if (index % 2 === 0) {
        masterRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      }

      // Format currency cells
      masterRow.getCell(7).numFmt = '₹#,##0'; // Annual Rent
      masterRow.getCell(9).numFmt = '₹#,##0'; // Dues Amount
      masterRow.getCell(10).numFmt = '₹#,##0'; // Expected Sales

      // Create individual sheet for this agreement
      const sheetName = agreement.adCode || `Ad_${serialNo}`;
      const individualSheet = workbook.addWorksheet(sheetName, {
        properties: { tabColor: { argb: 'FF28A745' } }
      });

      // Add title row
      individualSheet.addRow([agreement.title || agreement.adCode || `Agreement ${serialNo}`]);
      const titleRow = individualSheet.getRow(1);
      titleRow.font = { bold: true, size: 16, color: { argb: 'FF0066CC' } };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      individualSheet.mergeCells('A1:L1');

      // Add empty row
      individualSheet.addRow([]);

      // Individual sheet headers (as per your requirement)
      const individualHeaders = [
        'SL.NO', 'AGREEMENT YEAR', 'INSTALLATION EXP', 'PAYMENT PAID AMOUNT', 
        'PAYMENT PAID YEAR', 'CHQ/CASH', 'PAYMENT PAID DATE', 'CHQ NO/DD NO.', 
        'BANK', 'ACCOUNT PAYEE NAME', 'DUES', 'DUES YEAR'
      ];

      individualSheet.addRow(individualHeaders);
      const individualHeaderRow = individualSheet.getRow(3);
      individualHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      individualHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF28A745' }
      };
      individualHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Set column widths for individual sheet
      individualSheet.columns = [
        { width: 8 },   // SL.NO
        { width: 15 },  // AGREEMENT YEAR
        { width: 15 },  // INSTALLATION EXP
        { width: 18 },  // PAYMENT PAID AMOUNT
        { width: 18 },  // PAYMENT PAID YEAR
        { width: 12 },  // CHQ/CASH
        { width: 18 },  // PAYMENT PAID DATE
        { width: 15 },  // CHQ NO/DD NO.
        { width: 20 },  // BANK
        { width: 20 },  // ACCOUNT PAYEE NAME
        { width: 12 },  // DUES
        { width: 15 }   // DUES YEAR
      ];

      // Add payment details data
      if (agreement.moreDetails && agreement.moreDetails.length > 0) {
        agreement.moreDetails.forEach((detail, detailIndex) => {
          const detailRow = individualSheet.addRow([
            detailIndex + 1,
            detail.agreementYear || '',
            detail.installationEnd || '',
            detail.paymentPaidAmount || 0,
            detail.paymentPaidYear || '',
            detail.paymentMethod || '',
            detail.paymentPaidDate ? new Date(detail.paymentPaidDate).toLocaleDateString() : '',
            detail.checkNo || '',
            detail.bank || '',
            detail.accountPayeeName || '',
            detail.dues || 0,
            detail.duesYear ? new Date(detail.duesYear).toLocaleDateString() : ''
          ]);

          // Style detail row
          detailRow.alignment = { horizontal: 'center', vertical: 'middle' };
          if (detailIndex % 2 === 0) {
            detailRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8F9FA' }
            };
          }

          // Format currency cells
          detailRow.getCell(4).numFmt = '₹#,##0'; // Payment Paid Amount
          detailRow.getCell(11).numFmt = '₹#,##0'; // Dues
        });
      } else {
        // Add empty row if no details
        const emptyRow = individualSheet.addRow([
          1, '', '', 0, '', '', '', '', '', '', 0, ''
        ]);
        emptyRow.alignment = { horizontal: 'center', vertical: 'middle' };
        emptyRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF0F0' }
        };
      }

      // Add summary information at the bottom
      individualSheet.addRow([]); // Empty row
      individualSheet.addRow(['Summary Information']);
      const summaryTitleRow = individualSheet.getRow(individualSheet.rowCount);
      summaryTitleRow.font = { bold: true, size: 14, color: { argb: 'FF0066CC' } };
      
      individualSheet.addRow(['Owner:', agreement.owners || '']);
      individualSheet.addRow(['Size:', `${agreement.width || 0} x ${agreement.height || 0} ft`]);
      individualSheet.addRow(['Total Area:', `${totalSqFt} sq ft`]);
      individualSheet.addRow(['Annual Rent:', agreement.annualRent || 0]);
      individualSheet.addRow(['Agreement Period:', 
        `${agreement.agreementFrom ? new Date(agreement.agreementFrom).toLocaleDateString() : ''} - ${agreement.agreementTo ? new Date(agreement.agreementTo).toLocaleDateString() : ''}`
      ]);

      // Format summary currency
      const annualRentRow = individualSheet.getRow(individualSheet.rowCount - 1);
      annualRentRow.getCell(2).numFmt = '₹#,##0';
    });

    // Add borders to all sheets
    [masterSheet, ...workbook.worksheets.slice(1)].forEach(sheet => {
      sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Rent_Agreements_${currentDate}.xlsx`;

    // Return the Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file', details: error.message },
      { status: 500 }
    );
  }
}