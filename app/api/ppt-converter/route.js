import { NextResponse } from 'next/server';
import PPTX2Json from 'pptx2json';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

// PPTX text extraction using both methods (matches C# OpenXML extraction)
async function extractSlideTexts(buffer) {
  const tmpDir = path.join(process.cwd(), '.pptx_tmp');
  await fs.mkdir(tmpDir, { recursive: true });
  const tempPath = path.join(tmpDir, crypto.randomUUID() + '.pptx');
  await fs.writeFile(tempPath, buffer);

  try {
    const parser = new PPTX2Json();
    const data = await parser.toJson(tempPath);
    const slides = Array.isArray(data.slides) ? data.slides : [];
    const allTexts = [];

    if (slides.length === 0) {
      // Fallback to XML extraction (equivalent to C# OpenXML)
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries()
        .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
        .sort((a, b) => {
          const numA = parseInt(a.entryName.match(/slide(\d+)/)[1]);
          const numB = parseInt(b.entryName.match(/slide(\d+)/)[1]);
          return numA - numB;
        });
      
      entries.forEach((entry) => {
        const xml = entry.getData().toString('utf8');
        const matches = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)];
        matches.forEach(match => {
          const text = match[1].trim();
          if (text) allTexts.push(text);
        });
      });
      return allTexts;
    }

    // Extract all text from all slides (like C# processes all slides)
    slides.forEach((slide) => {
      const texts = [];
      const collectTexts = node => {
        if (!node || typeof node !== 'object') return;
        if (typeof node.text === 'string' && node.text.trim()) {
          texts.push(node.text.trim());
        }
        for (const v of Object.values(node)) {
          if (Array.isArray(v)) v.forEach(collectTexts);
          else if (typeof v === 'object') collectTexts(v);
        }
      };
      collectTexts(slide);
      allTexts.push(...texts);
    });
    
    return allTexts;
  } finally {
    try { await fs.unlink(tempPath); } catch {}
  }
}

// Check if line is availability (matches C# IsAvailability method)
function isAvailability(text) {
  return /^(IMMEDIATE )?AVAILABLE( FROM \d{2}\.\d{2}\.\d{2})?$/i.test(text);
}

// Parse line (matches C# ParseLine method exactly)
function parseLine(line, autoSerialNumber) {
  // Exact same regex as C# version
  const pattern = /^(?:(\d+)\)\s*)?([\w]+)\s*[-–]\s*(.*?)\s*-\s*(\d+)\s*[*x]\s*(\d+)\s*(?:-\s*(\d+)sqft)?\s*-\s*(\w+)$/i;
  const match = line.trim().match(pattern);

  if (match) {
    // Use provided serial number or auto-increment (same logic as C#)
    const num = match[1] ? parseInt(match[1]) : ++autoSerialNumber.value;
    const city = match[2];
    const desc = match[3].trim();
    const hor = parseInt(match[4]);
    const ver = parseInt(match[5]);
    // Calculate sqft if not provided, else use provided value (same as C#)
    const sqft = match[6] ? parseInt(match[6]) : hor * ver;
    const typ = match[7];

    // Same location logic as C#
    const location = city === "Jamshedpur" ? `${desc}` : `${city} - ${desc}`;

    // Same medium/faci logic as C#
    let medium, faci;
    const descLower = desc.toLowerCase();
    if (descLower.includes("unipole")) {
      medium = "Unipole";
      faci = 2;
    } else if (descLower.includes("ticket counter")) {
      medium = "Railway Station Branding";
      faci = 1;
    } else {
      medium = "Hoarding";
      faci = 1;
    }

    return {
      "Sr No": num,
      "State": "Jharkhand",
      "City": city,
      "Medium": medium,
      "Type": typ,
      "Location": location,
      "hor": hor,
      "ver": ver,
      "Faci": faci,
      "Units": 1,
      "SQFT": sqft,
      "Display Charges Per Month": "",
      "Printing": "",
      "Mounting": "",
      "Total Cost": "",
      "GST": "18%",
      "GST cost": "",
      "Total Cost with GST": "",
      "Media availability": ""
    };
  }
  return null;
}

// Main API handler (matches C# btnConvert_Click logic)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json({ error: 'Only .pptx files are supported.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const allTexts = await extractSlideTexts(buffer);

    let data = [];
    let terms = [];
    let parseLogs = [];
    let nonMatchingLines = [];
    let isTermsSection = false;
    let autoSerialNumber = { value: 0 }; // Use object to pass by reference
    let lastData = null;

    // Process each line (same logic as C# foreach loop)
    for (const text of allTexts) {
      parseLogs.push(`Processing line: '${text}'`);

      // Check for terms and conditions section (same regex as C#)
      if (/\*?\s*(GENERAL|BUSINESS)?\s*TERMS\s*(&|AND)?\s*CONDITIONS?\s*[:-]?\s*-?/i.test(text)) {
        isTermsSection = true;
        parseLogs.push("Detected start of terms section.");
        continue;
      }

      // Collect terms if in terms section (same logic as C#)
      if (isTermsSection) {
        if (text && text.trim() && !/^image\d+\.\w+$/i.test(text)) {
          terms.push(text);
          parseLogs.push("Added to terms.");
        } else {
          parseLogs.push("Skipped (empty or image reference).");
        }
        continue;
      }

      // Try parsing as data line (same logic as C#)
      const result = parseLine(text, autoSerialNumber);
      if (result) {
        data.push(result);
        lastData = result;
        parseLogs.push("Match found.");
        continue;
      }

      // Check for availability (same logic as C#)
      if (lastData && isAvailability(text)) {
        lastData["Media availability"] = text;
        parseLogs.push("Added availability to last data.");
        continue;
      }

      // Non-matching potential data line (same regex as C#)
      if (/^(\d+\)\s*)?[\w]+.*[-–].*\d+\s*[*x]\s*\d+/.test(text)) {
        nonMatchingLines.push(text);
        parseLogs.push("No match, but looks like potential data line.");
      } else {
        parseLogs.push("Skipped, not a data line.");
      }
    }

    // Set default availability if not set (same logic as C#)
    data.forEach(d => {
      if (!d["Media availability"]) {
        d["Media availability"] = "IMMEDIATE AVAILABLE";
      }
    });

    // Save logs for debugging (same as C#)
    try {
      const logsPath = path.join(process.cwd(), 'parse_logs.txt');
      await fs.writeFile(logsPath, parseLogs.join('\n'));
    } catch (ex) {
      console.error('Error saving parse logs:', ex.message);
    }

    if (data.length === 0) {
      let errorMsg = "No valid data found in the PPTX. Ensure the PPTX follows the expected format (e.g., '[optional number)] City - Description - Width*Height [or WidthxHeight] - Type' or '1) Jamshedpur - Station main road - 62*16 - 992sqft - NL').";
      if (nonMatchingLines.length > 0) {
        errorMsg += "\n\nNon-matching potential data lines:\n" + nonMatchingLines.join('\n');
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Generate Excel with exact same structure as C#
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('JMD Quotation');

    // Set column widths (same as C# columns setup)
    worksheet.columns = [
      { key: 'srno', width: 5 },
      { key: 'state', width: 15 },
      { key: 'city', width: 15 },
      { key: 'medium', width: 15 },
      { key: 'type', width: 15 },
      { key: 'location', width: 50 }, // Wider column for Location (same as C#)
      { key: 'hor', width: 15 },
      { key: 'ver', width: 15 },
      { key: 'faci', width: 15 },
      { key: 'units', width: 15 },
      { key: 'sqft', width: 15 },
      { key: 'display', width: 23 },
      { key: 'printing', width: 15 },
      { key: 'mounting', width: 15 },
      { key: 'total', width: 15 },
      { key: 'gst', width: 15 },
      { key: 'gstcost', width: 15 },
      { key: 'totalwithgst', width: 17 },
      { key: 'availability', width: 25 }
    ];

    // Add header rows (exact same as C#)
    worksheet.addRow(['From JMD - Advertisement']);
    worksheet.mergeCells('A1:S1');
    worksheet.getCell('A1').font = { bold: true };
    
    worksheet.addRow(['B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002) | Phone: +91-9204965321 | Email: info.jmd.jsr@gmail.com']);
    worksheet.mergeCells('A2:S2');
    worksheet.getCell('A2').font = { bold: true };
    
    worksheet.addRow([]);
    worksheet.addRow([]);
    
    worksheet.addRow(['QUOTATION']);
    worksheet.mergeCells('A5:S5');
    worksheet.getCell('A5').font = { bold: true };

    // Add table headers with exact same columns as C#
    const headers = [
      "Sr No", "State", "City", "Medium", "Type", "Location", 
      "hor", "ver", "Faci", "Units", "SQFT", 
      "Display Charges Per Month", "Printing", "Mounting", 
      "Total Cost", "GST", "GST cost", "Total Cost with GST", 
      "Media availability"
    ];
    
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFADD8E6' } // Light blue (same as C#)
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows (same structure as C#)
    data.forEach(row => {
      const dataRow = worksheet.addRow([
        row["Sr No"], row["State"], row["City"], row["Medium"], 
        row["Type"], row["Location"], row["hor"], row["ver"], 
        row["Faci"], row["Units"], row["SQFT"], 
        row["Display Charges Per Month"], row["Printing"], 
        row["Mounting"], row["Total Cost"], row["GST"], 
        row["GST cost"], row["Total Cost with GST"], 
        row["Media availability"]
      ]);
      
      // Add borders to data cells (same as C#)
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Add total row (same calculation and position as C#)
    const totalSqft = data.reduce((sum, d) => sum + d["SQFT"], 0);
    const totalRowValues = new Array(19).fill('');
    totalRowValues[9] = 'Total'; // Column J (Units)
    totalRowValues[10] = totalSqft; // Column K (SQFT)

    const totalRow = worksheet.addRow(totalRowValues);
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Skip rows for terms (same as C#)
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Add terms and conditions section header
    const termsHeaderRow = worksheet.addRow(['Terms and Condition...']);
    termsHeaderRow.getCell(1).font = { bold: true };
    
    // Add terms from PPT if any
    if (terms.length > 0) {
      terms.forEach(term => {
        const termRow = worksheet.addRow([term]);
        termRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    }

    // Add default JMD terms and conditions
    const defaultTerms = [
      "1. Inventries will be provided absolutely on First Come n' First Serve basis",
      "2. To prevent loosing a perticular inventory, quick booking is advisable.",
      "3. Please confirm the availability at the time of booking.",
      "4. Please inform atleast 10 days before to drop out the inventory by mail only.",
      "5. Raise an Work Order duly Sealed n' Signature by the client at the time of booking confirmation.",
      "6. The company will not been responsible for any damage or lost of the flex once installed.",
      "7. Except Authorised mail all other medium of conversation will be treated as null n' void.",
      "8. 50% advance along with a Security Cheque along with xerox copy of Aadhar and GST Certificate is required",
      "9. Any payment made is only in favour of \"JAI MATA DI\" only.",
      "10. Any dispute is subject to Jamshedpur Juridiction only."
    ];

    defaultTerms.forEach(term => {
      const termRow = worksheet.addRow([term]);
      termRow.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });
    });

    // Generate Excel buffer and return (same as C# save functionality)
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const outputFileName = 'JMD_Quotation.xlsx'; // Same default name as C#

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error in PPT conversion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}