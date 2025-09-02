import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request) {
  try {
    const { agreements } = await request.json();

    if (!agreements || agreements.length === 0) {
      return NextResponse.json({ error: 'No agreements provided' }, { status: 400 });
    }

    // Sort agreements by locality (if available) then by adCode
    const sortedAgreements = agreements.sort((a, b) => {
      const localityA = a.locality || a.city || '';
      const localityB = b.locality || b.city || '';
      
      if (localityA !== localityB) {
        return localityA.localeCompare(localityB);
      }
      
      return (a.adCode || '').localeCompare(b.adCode || '');
    });

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'JMD Advertisement - Rent Agreement System';
    workbook.created = new Date();
    workbook.company = 'JMD Advertisement';

    // Create Master Sheet
    const masterSheet = workbook.addWorksheet('Master List', {
      properties: { tabColor: { argb: 'FFDC143C' } } // JMD Red color
    });

    // Add JMD Branding Header
    masterSheet.addRow(['JMD - RENT AGREEMENT EXPORT']);
    const brandingRow = masterSheet.getRow(1);
    brandingRow.font = { 
      bold: true, 
      size: 20, 
      color: { argb: 'FFFFFFFF' },
      name: 'Arial Black'
    };
    brandingRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC143C' } // JMD Red
    };
    brandingRow.alignment = { horizontal: 'center', vertical: 'middle' };
    brandingRow.height = 40;
    masterSheet.mergeCells('A1:L1');

    // Add export details row
    const exportDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    masterSheet.addRow([`Export Date: ${exportDate} | Total Agreements: ${sortedAgreements.length}`]);
    const detailsRow = masterSheet.getRow(2);
    detailsRow.font = { 
      bold: true, 
      size: 11, 
      color: { argb: 'FF333333' },
      italic: true
    };
    detailsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' }
    };
    detailsRow.alignment = { horizontal: 'center', vertical: 'middle' };
    detailsRow.height = 25;
    masterSheet.mergeCells('A2:L2');

    // Add empty row for spacing
    masterSheet.addRow([]);

    // Master Sheet Headers
    const masterHeaders = [
      'SL.NO', 'MEDIA CODE', 'TITLE', 'SIZE', 'Total sq ft', 'RENT TYPE', 
      'OWNERS', 'AGREEMENT PERIOD', 'ANNUAL RENT', 'DUES DATE', 'DUES AMOUNT', 'EXPECTED SALES'
    ];

    // Style master headers
    masterSheet.addRow(masterHeaders);
    const masterHeaderRow = masterSheet.getRow(4);
    masterHeaderRow.font = { 
      bold: true, 
      color: { argb: 'FFFFFFFF' },
      size: 12,
      name: 'Arial'
    };
    masterHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' } // Dark blue-gray
    };
    masterHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
    masterHeaderRow.height = 35;

    // Set column widths for master sheet
    masterSheet.columns = [
      { width: 8 },   // SL.NO
      { width: 16 },  // MEDIA CODE
      { width: 30 },  // TITLE
      { width: 16 },  // SIZE
      { width: 12 },  // Total sq ft
      { width: 14 },  // RENT TYPE
      { width: 25 },  // OWNERS
      { width: 25 },  // AGREEMENT PERIOD
      { width: 17 },  // ANNUAL RENT
      { width: 16 },  // DUES DATE
      { width: 18 },  // DUES AMOUNT
      { width: 20 }   // EXPECTED SALES
    ];

    // Add data to master sheet and create individual sheets
    sortedAgreements.forEach((agreement, index) => {
      const serialNo = index + 1;
      const totalSqFt = (parseFloat(agreement.width) || 0) * (parseFloat(agreement.height) || 0);
      
      // Format agreement period
      const agreementPeriod = agreement.agreementFrom && agreement.agreementTo 
        ? `${new Date(agreement.agreementFrom).toLocaleDateString('en-IN')} - ${new Date(agreement.agreementTo).toLocaleDateString('en-IN')}`
        : 'Not set';
      
      // Add row to master sheet with hyperlink
      const masterRow = masterSheet.addRow([
        serialNo,
        agreement.adCode || '',
        agreement.title || '',
        `${agreement.width || 0} x ${agreement.height || 0} ft`,
        totalSqFt,
        agreement.rentType || '',
        agreement.owners || '',
        agreementPeriod,
        agreement.annualRent || 0,
        agreement.duesDate ? new Date(agreement.duesDate).toLocaleDateString('en-IN') : '',
        agreement.duesAmount || 0,
        agreement.expectedSales || 0
      ]);

      // Add hyperlink to serial number
      const serialCell = masterRow.getCell(1);
      serialCell.value = {
        text: serialNo.toString(),
        hyperlink: `#'${agreement.adCode || `Agreement_${serialNo}`}'!A1`,
        tooltip: `Click to view details for ${agreement.adCode}`
      };
      serialCell.font = { color: { argb: 'FFDC143C' }, underline: true, bold: true };

      // Style master row
      masterRow.alignment = { horizontal: 'center', vertical: 'middle' };
      masterRow.height = 25;
      masterRow.font = { size: 10, name: 'Arial' };
      
      // Alternating row colors
      if (index % 2 === 0) {
        masterRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      } else {
        masterRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }
        };
      }

      // Format currency cells
      masterRow.getCell(9).numFmt = '₹#,##0.00'; // Annual Rent
      masterRow.getCell(11).numFmt = '₹#,##0.00'; // Dues Amount
      masterRow.getCell(12).numFmt = '₹#,##0.00'; // Expected Sales

      // Create individual sheet for this agreement
      const sheetName = agreement.adCode || `Agreement_${serialNo}`;
      const individualSheet = workbook.addWorksheet(sheetName, {
        properties: { tabColor: { argb: 'FF28A745' } }
      });

      // Add JMD Branding Header for individual sheet
      individualSheet.addRow(['JMD - RENT AGREEMENT DETAILS']);
      const individualBrandingRow = individualSheet.getRow(1);
      individualBrandingRow.font = { 
        bold: true, 
        size: 18, 
        color: { argb: 'FFFFFFFF' },
        name: 'Arial Black'
      };
      individualBrandingRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC143C' }
      };
      individualBrandingRow.alignment = { horizontal: 'center', vertical: 'middle' };
      individualBrandingRow.height = 35;
      individualSheet.mergeCells('A1:M1');

      // Add agreement title row
      individualSheet.addRow([`${agreement.title || agreement.adCode || `Agreement ${serialNo}`} - ${agreement.adCode}`]);
      const titleRow = individualSheet.getRow(2);
      titleRow.font = { 
        bold: true, 
        size: 16, 
        color: { argb: 'FF2C3E50' },
        name: 'Arial'
      };
      titleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F6F3' }
      };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.height = 30;
      individualSheet.mergeCells('A2:M2');

      // Add empty row
      individualSheet.addRow([]);

      // Individual sheet headers (updated with new fields)
      const individualHeaders = [
        'SL.NO', 'AGREEMENT PERIOD', 'INSTALLATION EXP', 'PAYMENT PERIOD', 
        'PAYMENT PAID AMOUNT', 'PAYMENT PAID DATE', 'PAYMENT METHOD', 'CHQ/DD NO.', 
        'BANK', 'ACCOUNT PAYEE NAME', 'DUES', 'DUES DATE', 'REMARKS'
      ];

      individualSheet.addRow(individualHeaders);
      const individualHeaderRow = individualSheet.getRow(4);
      individualHeaderRow.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 11,
        name: 'Arial'
      };
      individualHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF28A745' }
      };
      individualHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
      individualHeaderRow.height = 30;

      // Set column widths for individual sheet
      individualSheet.columns = [
        { width: 19 },   // SL.NO
        { width: 23 },  // AGREEMENT PERIOD
        { width: 22 },  // INSTALLATION EXP
        { width: 20 },  // PAYMENT PERIOD
        { width: 27 },  // PAYMENT PAID AMOUNT
        { width: 23 },  // PAYMENT PAID DATE
        { width: 20 },  // PAYMENT METHOD
        { width: 16 },  // CHQ/DD NO.
        { width: 22 },  // BANK
        { width: 25 },  // ACCOUNT PAYEE NAME
        { width: 14 },  // DUES
        { width: 16 },  // DUES DATE
        { width: 30 }   // REMARKS
      ];

      // Add payment details data
      if (agreement.moreDetails && agreement.moreDetails.length > 0) {
        agreement.moreDetails.forEach((detail, detailIndex) => {
          // Format agreement period
          const agreementPeriod = detail.agreementYearFrom && detail.agreementYearTo
            ? `${new Date(detail.agreementYearFrom).toLocaleDateString('en-IN')} - ${new Date(detail.agreementYearTo).toLocaleDateString('en-IN')}`
            : (detail.agreementYear || '');

          // Format payment period
          const paymentPeriod = detail.paymentPaidYearFrom && detail.paymentPaidYearTo
            ? `${new Date(detail.paymentPaidYearFrom).toLocaleDateString('en-IN')} - ${new Date(detail.paymentPaidYearTo).toLocaleDateString('en-IN')}`
            : (detail.paymentPaidYear || '');

          const detailRow = individualSheet.addRow([
            detailIndex + 1,
            agreementPeriod,
            detail.installationEnd || '',
            paymentPeriod,
            detail.paymentPaidAmount || 0,
            detail.paymentPaidDate ? new Date(detail.paymentPaidDate).toLocaleDateString('en-IN') : '',
            detail.paymentMethod || '',
            detail.checkNo || '',
            detail.bank || '',
            detail.accountPayeeName || '',
            detail.dues || 0,
            detail.duesYear ? new Date(detail.duesYear).toLocaleDateString('en-IN') : '',
            detail.remarks || ''
          ]);

          // Style detail row
          detailRow.alignment = { horizontal: 'center', vertical: 'middle' };
          detailRow.height = 25;
          detailRow.font = { size: 10, name: 'Arial' };
          
          // Alternating row colors
          if (detailIndex % 2 === 0) {
            detailRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8F9FA' }
            };
          }

          // Format currency cells
          detailRow.getCell(5).numFmt = '₹#,##0.00'; // Payment Paid Amount
          detailRow.getCell(11).numFmt = '₹#,##0.00'; // Dues

          // Wrap text for remarks
          detailRow.getCell(13).alignment = { 
            horizontal: 'left', 
            vertical: 'top', 
            wrapText: true 
          };
        });
      } else {
        // Add empty row if no details
        const emptyRow = individualSheet.addRow([
          1, '', '', '', 0, '', '', '', '', '', 0, '', 'No payment details added'
        ]);
        emptyRow.alignment = { horizontal: 'center', vertical: 'middle' };
        emptyRow.height = 25;
        emptyRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEAA7' }
        };
        emptyRow.font = { italic: true, color: { argb: 'FF856404' } };
      }

      // Add summary information at the bottom
      individualSheet.addRow([]); // Empty row
      individualSheet.addRow(['AGREEMENT SUMMARY']);
      const summaryTitleRow = individualSheet.getRow(individualSheet.rowCount);
      summaryTitleRow.font = { 
        bold: true, 
        size: 14, 
        color: { argb: 'FFFFFFFF' },
        name: 'Arial'
      };
      summaryTitleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C3E50' }
      };
      summaryTitleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      summaryTitleRow.height = 30;
      individualSheet.mergeCells(`A${individualSheet.rowCount}:M${individualSheet.rowCount}`);
      
      // Summary data
      const summaryData = [
        ['Media Code:', agreement.adCode || ''],
        ['Owner:', agreement.owners || ''],
        ['Size:', `${agreement.width || 0} x ${agreement.height || 0} ft`],
        ['Total Area:', `${totalSqFt} sq ft`],
        ['Rent Type:', agreement.rentType || ''],
        ['Annual Rent:', agreement.annualRent || 0],
        ['Agreement Period:', agreementPeriod],
        ['Expected Sales:', agreement.expectedSales || 0]
      ];

      summaryData.forEach((data, idx) => {
        const row = individualSheet.addRow(data);
        row.getCell(1).font = { bold: true, size: 11, name: 'Arial' };
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F6F3' }
        };
        row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(2).font = { size: 11, name: 'Arial' };
        row.height = 22;

        // Format currency cells in summary
        if (data[0].includes('Rent') || data[0].includes('Sales')) {
          row.getCell(2).numFmt = '₹#,##0.00';
        }
      });
    });

    // Add borders to all sheets
    workbook.worksheets.forEach(sheet => {
      sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF999999' } },
            left: { style: 'thin', color: { argb: 'FF999999' } },
            bottom: { style: 'thin', color: { argb: 'FF999999' } },
            right: { style: 'thin', color: { argb: 'FF999999' } }
          };
        });
      });
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `JMD_Rent_Agreements_${currentDate}.xlsx`;

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