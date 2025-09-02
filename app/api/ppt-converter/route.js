import { NextResponse } from 'next/server';
import PPTX2Json from 'pptx2json';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

// Reverse lighting abbreviation to full form
function getFullLighting(abbr) {
  if (!abbr) return '';
  
  const upperAbbr = abbr.toUpperCase();
  
  switch(upperAbbr) {
    case 'NL': return 'No Light';
    case 'FLL': return 'Fully Light'; 
    case 'FL': return 'Front Light';
    case 'BL': return 'Back Light';
    default: return abbr;
  }
}

// Fallback XML extraction method
function extractWithXML(buffer) {
  try {
    console.log('Using fallback XML extraction method...');
    const zip = new AdmZip(buffer);
    const slideTexts = [];
    
    const entries = zip.getEntries()
      .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/slide(\d+)/)[1]);
        const numB = parseInt(b.entryName.match(/slide(\d+)/)[1]);
        return numA - numB;
      });

    console.log(`Found ${entries.length} slides total`);

    entries.forEach((entry, idx) => {
      const slideNumber = idx + 1;
      
      // Skip first and last slide
      if (slideNumber === 1 || slideNumber === entries.length) {
        console.log(`Skipping slide ${slideNumber} (first/last)`);
        return;
      }

      const slideXml = entry.getData().toString('utf8');
      const texts = [];
      
      // Extract text from <a:t> tags
      const textPattern = /<a:t[^>]*>(.*?)<\/a:t>/g;
      let match;
      
      while ((match = textPattern.exec(slideXml)) !== null) {
        const text = match[1]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        
        if (text && !text.includes('schemas.openxmlformats') && !text.startsWith('http')) {
          texts.push(text);
        }
      }

      if (texts.length > 0) {
        slideTexts.push({
          slideNumber,
          texts,
          combinedText: texts.join(' ')
        });
        console.log(`Slide ${slideNumber} extracted ${texts.length} text elements:`, texts);
      }
    });

    return slideTexts;
  } catch (error) {
    console.error('XML extraction failed:', error);
    return [];
  }
}

// Extract slide texts (skip first and last slide)
async function extractSlideTexts(buffer) {
  const tmpDir = path.join(process.cwd(), '.pptx_tmp');
  await fs.mkdir(tmpDir, { recursive: true });
  const tempPath = path.join(tmpDir, crypto.randomUUID() + '.pptx');
  await fs.writeFile(tempPath, buffer);

  try {
    console.log('Trying pptx2json extraction...');
    const parser = new PPTX2Json();
    const data = await parser.toJson(tempPath);
    
    const slides = Array.isArray(data.slides) ? data.slides : [];
    const slideTexts = [];

    if (slides.length === 0) {
      console.log('No slides found with pptx2json, trying fallback...');
      return extractWithXML(buffer);
    }

    slides.forEach((slide, idx) => {
      // Skip first and last slide
      if (idx === 0 || idx === slides.length - 1) {
        console.log(`Skipping slide ${idx + 1} (first/last)`);
        return;
      }

      const texts = [];
      
      const collect = (node) => {
        if (!node || typeof node !== 'object') return;
        if (typeof node.text === 'string') {
          const t = node.text.trim();
          if (t) texts.push(t);
        }
        for (const v of Object.values(node)) {
          if (Array.isArray(v)) v.forEach(collect);
          else if (typeof v === 'object') collect(v);
        }
      };
      
      collect(slide);

      // Keep individual text elements instead of joining
      const cleanTexts = texts
        .filter(t => t && !/^http/i.test(t) && !/schemas\.openxmlformats/i.test(t))
        .map(t => t.replace(/\s+/g, ' ').trim())
        .filter(t => t.length > 0);

      if (cleanTexts.length > 0) {
        slideTexts.push({
          slideNumber: idx + 1,
          texts: cleanTexts,
          combinedText: cleanTexts.join(' ')
        });
        console.log(`Slide ${idx + 1} extracted ${cleanTexts.length} text elements:`, cleanTexts);
      }
    });

    return slideTexts;
  } catch (error) {
    console.error('pptx2json failed:', error);
    console.log('Falling back to XML extraction...');
    return extractWithXML(buffer);
  } finally {
    try { await fs.unlink(tempPath); } catch {}
  }
}

// Parse slide content - fix duplicate and size parsing issues
function parseSlideContent(slideTexts) {
  const records = [];
  const seenRecords = new Set(); // To prevent duplicates
  
  slideTexts.forEach(slide => {
    console.log(`\n--- SLIDE ${slide.slideNumber} ---`);
    console.log(`Individual texts:`, slide.texts);
    console.log(`Combined text:`, slide.combinedText);
    
    // Only process combined text to avoid duplicates
    const text = slide.combinedText;
    if (!text) return;
    
    console.log(`\nAnalyzing text: "${text}"`);
    
    // Look for pattern that starts with number)
    const mainPattern = /(\d+)\)\s*(.+)/i;
    const match = text.match(mainPattern);
    
    if (match) {
      const srNumber = parseInt(match[1]);
      const remaining = match[2];
      
      console.log(`Found entry ${srNumber}: "${remaining}"`);
      
      // Split by dashes and clean up
      const parts = remaining.split('-').map(p => p.trim()).filter(p => p);
      
      console.log(`Parts after splitting by dashes:`, parts);
      
      if (parts.length >= 3) {
        const city = parts[0];
        const title = parts[1];
        
        // Handle size - it might be "20*20" or "20*20 - 400sqft" combined
        let size = '';
        let visibility = '';
        
        // Look for size pattern in parts[2] and beyond
        for (let i = 2; i < parts.length; i++) {
          const part = parts[i];
          
          // Check if this part contains size (dimensions)
          if (/\d+\*\d+/.test(part)) {
            size = part;
          }
          // Check if this part is lighting abbreviation
          else if (/^[A-Z]{1,4}$/i.test(part)) {
            visibility = getFullLighting(part);
          }
        }
        
        // If size not found in parts, try to extract from remaining text
        if (!size) {
          const sizeMatch = remaining.match(/(\d+\*\d+(?:\s*-\s*\d+sqft)?)/i);
          if (sizeMatch) {
            size = sizeMatch[1];
          }
        }
        
        // If visibility not found, look for lighting abbreviation in the text
        if (!visibility) {
          const lightingMatch = remaining.match(/\b([A-Z]{1,4})\b/g);
          if (lightingMatch) {
            for (const abbr of lightingMatch) {
              const fullLighting = getFullLighting(abbr);
              if (fullLighting && fullLighting !== abbr) {
                visibility = fullLighting;
                break;
              }
            }
          }
        }
        
        // Create unique key to prevent duplicates
        const uniqueKey = `${srNumber}-${city}-${title}-${size}`;
        
        if (!seenRecords.has(uniqueKey) && srNumber && city && title) {
          const record = {
            srNumber,
            city,
            title,
            size,
            visibility,
            rawText: text.trim(),
            slideNumber: slide.slideNumber
          };
          
          records.push(record);
          seenRecords.add(uniqueKey);
          console.log(`✅ Added unique record:`, record);
        } else {
          console.log(`⚠️ Skipping duplicate or invalid record:`, { srNumber, city, title, size });
        }
      } else {
        console.log(`❌ Not enough parts (need at least 3, got ${parts.length})`);
      }
    } else {
      console.log(`❌ No number) pattern found in text`);
    }
  });
  
  console.log(`\n📊 Total unique records found: ${records.length}`);
  
  // Sort by serial number
  return records.sort((a, b) => a.srNumber - b.srNumber);
}

// Build Excel file with specified columns
function buildExcel(records) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'JMD PPT to Excel Converter';
  wb.created = new Date();
  
  const ws = wb.addWorksheet('PPT Data');

  // Header
  ws.addRow(['JMD ADVERTISEMENT - PPT TO EXCEL CONVERSION']);
  ws.mergeCells('A1:F1');
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC143C' } };

  // Info row
  ws.addRow([`Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${records.length}`]);
  ws.mergeCells('A2:F2');
  const infoRow = ws.getRow(2);
  infoRow.font = { italic: true, color: { argb: 'FF666666' } };
  infoRow.alignment = { horizontal: 'center' };
  
  ws.addRow([]);

  // Column headers: Sr No, City, Title, Size, Visibility, Raw Text
  const headers = ['Sr No', 'City', 'Title', 'Size', 'Visibility', 'Raw Text'];
  
  ws.addRow(headers);
  const headerDataRow = ws.getRow(4);
  headerDataRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerDataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
  headerDataRow.alignment = { horizontal: 'center' };

  // Data rows
  if (records.length > 0) {
    records.forEach((record, index) => {
      const row = ws.addRow([
        record.srNumber,
        record.city,
        record.title,
        record.size,
        record.visibility,
        record.rawText
      ]);
      
      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
      }
      
      // Wrap text for raw text column
      row.getCell(6).alignment = { wrapText: true };
    });
  } else {
    // No data message
    const noDataRow = ws.addRow([
      '', '', 'No data found in expected format', '', '', 
      'Expected format: n) City - Title - Size - LightingAbbr'
    ]);
    noDataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEAA7' } };
  }

  // Set column widths
  ws.columns = [
    { width: 8 },   // Sr No
    { width: 20 },  // City
    { width: 30 },  // Title
    { width: 20 },  // Size
    { width: 15 },  // Visibility
    { width: 60 }   // Raw Text
  ];

  // Add borders to all cells
  ws.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  return wb;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json({ 
        error: 'Only .pptx files are supported. Please convert .ppt to .pptx first.' 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`🔄 Processing: ${file.name} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

    // Extract slide texts (excluding first and last slide)
    const slideTexts = await extractSlideTexts(buffer);
    console.log(`📄 Extracted text from ${slideTexts.length} slides`);

    if (slideTexts.length === 0) {
      console.log('❌ No text extracted from any slides');
      return NextResponse.json({ 
        error: 'No text could be extracted from the PPTX file',
        suggestion: 'Ensure the PPTX contains text content and is not corrupted'
      }, { status: 400 });
    }

    // Parse the specific format
    const records = parseSlideContent(slideTexts);
    console.log(`📊 Parsed ${records.length} records`);

    // Build Excel file
    const workbook = buildExcel(records);
    const excelBuffer = await workbook.xlsx.writeBuffer();
    
    const outputFileName = file.name.replace(/\.pptx$/i, '_converted.xlsx');

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to convert PPTX to Excel', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'JMD PPT to Excel Converter (Fixed)',
    expectedFormat: 'n) City - Title - Size - LightingAbbr',
    fixes: [
      'Prevents duplicate entries',
      'Better size parsing (handles "20*20 - 400sqft")',
      'Improved visibility detection',
      'Only processes combined text to avoid duplicates'
    ],
    outputColumns: ['Sr No', 'City', 'Title', 'Size', 'Visibility', 'Raw Text'],
    usage: 'POST multipart/form-data with "file" field containing .pptx'
  });
}