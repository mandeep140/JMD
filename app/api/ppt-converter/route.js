import { NextResponse } from 'next/server';
import PPTX2Json from 'pptx2json';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

// Enhanced lighting abbreviation mapping with better detection
function getFullLighting(abbr) {
  if (!abbr) return '';
  
  const upperAbbr = abbr.toUpperCase().trim();
  
  const lightingMap = {
    'NL': 'No Light',
    'FLL': 'Fully Light',
    'FFL': 'Fully Light',
    'FL': 'Front Light', 
    'BL': 'Back Light',
    'SL': 'Side Light',
    'LL': 'LED Light',
    'UL': 'Under Light'
  };
  
  return lightingMap[upperAbbr] || abbr;
}

// Enhanced visibility detection from text
function detectVisibility(text) {
  if (!text) return '';
  
  const upperText = text.toUpperCase();
  
  // Look for visibility codes in order of specificity
  const visibilityPatterns = [
    { pattern: /\bFFL\b|\bFLL\b/, value: 'FFL' },
    { pattern: /\bFL\b/, value: 'FL' },
    { pattern: /\bBL\b/, value: 'BL' },
    { pattern: /\bNL\b/, value: 'NL' },
    { pattern: /\bSL\b/, value: 'SL' },
    { pattern: /\bLL\b/, value: 'LL' },
    { pattern: /\bUL\b/, value: 'UL' }
  ];
  
  for (const pattern of visibilityPatterns) {
    if (pattern.pattern.test(upperText)) {
      return getFullLighting(pattern.value);
    }
  }
  
  return '';
}

// Enhanced state detection with more cities
function detectState(city) {
  const stateMap = {
    // Andhra Pradesh
    'visakhapatnam': 'Andhra Pradesh',
    'vijayawada': 'Andhra Pradesh',
    'guntur': 'Andhra Pradesh',
    'nellore': 'Andhra Pradesh',
    'kurnool': 'Andhra Pradesh',
    'rajahmundry': 'Andhra Pradesh',
    'tirupati': 'Andhra Pradesh',
    'kadapa': 'Andhra Pradesh',
    
    // Assam
    'guwahati': 'Assam',
    'dibrugarh': 'Assam',
    'jorhat': 'Assam',
    'silchar': 'Assam',
    'nagaon': 'Assam',
    'tinsukia': 'Assam',
    
    // Bihar
    'patna': 'Bihar',
    'gaya': 'Bihar',
    'bhagalpur': 'Bihar',
    'muzaffarpur': 'Bihar',
    'purnia': 'Bihar',
    'darbhanga': 'Bihar',
    'bihar sharif': 'Bihar',
    'arrah': 'Bihar',
    
    // Chhattisgarh
    'raipur': 'Chhattisgarh',
    'bhilai': 'Chhattisgarh',
    'korba': 'Chhattisgarh',
    'bilaspur': 'Chhattisgarh',
    'durg': 'Chhattisgarh',
    'rajnandgaon': 'Chhattisgarh',
    
    // Delhi
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'noida': 'Uttar Pradesh',
    'gurgaon': 'Haryana',
    'gurugram': 'Haryana',
    'faridabad': 'Haryana',
    'ghaziabad': 'Uttar Pradesh',
    
    // Gujarat
    'ahmedabad': 'Gujarat',
    'surat': 'Gujarat',
    'vadodara': 'Gujarat',
    'rajkot': 'Gujarat',
    'bhavnagar': 'Gujarat',
    'jamnagar': 'Gujarat',
    'junagadh': 'Gujarat',
    'gandhinagar': 'Gujarat',
    'anand': 'Gujarat',
    'bharuch': 'Gujarat',
    
    // Haryana
    'chandigarh': 'Chandigarh',
    'panipat': 'Haryana',
    'ambala': 'Haryana',
    'yamunanagar': 'Haryana',
    'rohtak': 'Haryana',
    'hisar': 'Haryana',
    'karnal': 'Haryana',
    'sonipat': 'Haryana',
    
    // Himachal Pradesh
    'shimla': 'Himachal Pradesh',
    'dharamshala': 'Himachal Pradesh',
    'manali': 'Himachal Pradesh',
    'solan': 'Himachal Pradesh',
    'mandi': 'Himachal Pradesh',
    
    // Jharkhand
    'jamshedpur': 'Jharkhand',
    'ranchi': 'Jharkhand',
    'dhanbad': 'Jharkhand',
    'bokaro': 'Jharkhand',
    'deoghar': 'Jharkhand',
    'hazaribagh': 'Jharkhand',
    'giridih': 'Jharkhand',
    'ramgarh': 'Jharkhand',
    
    // Karnataka
    'bangalore': 'Karnataka',
    'bengaluru': 'Karnataka',
    'mysore': 'Karnataka',
    'hubli': 'Karnataka',
    'mangalore': 'Karnataka',
    'belgaum': 'Karnataka',
    'gulbarga': 'Karnataka',
    'davanagere': 'Karnataka',
    'bellary': 'Karnataka',
    'bijapur': 'Karnataka',
    
    // Kerala
    'kochi': 'Kerala',
    'thiruvananthapuram': 'Kerala',
    'kozhikode': 'Kerala',
    'thrissur': 'Kerala',
    'kollam': 'Kerala',
    'palakkad': 'Kerala',
    'alappuzha': 'Kerala',
    'kannur': 'Kerala',
    'kottayam': 'Kerala',
    
    // Madhya Pradesh
    'bhopal': 'Madhya Pradesh',
    'indore': 'Madhya Pradesh',
    'gwalior': 'Madhya Pradesh',
    'jabalpur': 'Madhya Pradesh',
    'ujjain': 'Madhya Pradesh',
    'sagar': 'Madhya Pradesh',
    'dewas': 'Madhya Pradesh',
    'satna': 'Madhya Pradesh',
    'ratlam': 'Madhya Pradesh',
    
    // Maharashtra
    'mumbai': 'Maharashtra',
    'pune': 'Maharashtra',
    'nagpur': 'Maharashtra',
    'nashik': 'Maharashtra',
    'aurangabad': 'Maharashtra',
    'solapur': 'Maharashtra',
    'kolhapur': 'Maharashtra',
    'amravati': 'Maharashtra',
    'nanded': 'Maharashtra',
    'sangli': 'Maharashtra',
    'malegaon': 'Maharashtra',
    'akola': 'Maharashtra',
    
    // Odisha
    'bhubaneswar': 'Odisha',
    'cuttack': 'Odisha',
    'rourkela': 'Odisha',
    'berhampur': 'Odisha',
    'sambalpur': 'Odisha',
    'puri': 'Odisha',
    'balasore': 'Odisha',
    
    // Punjab
    'ludhiana': 'Punjab',
    'amritsar': 'Punjab',
    'jalandhar': 'Punjab',
    'patiala': 'Punjab',
    'bathinda': 'Punjab',
    'mohali': 'Punjab',
    'hoshiarpur': 'Punjab',
    'batala': 'Punjab',
    
    // Rajasthan
    'jaipur': 'Rajasthan',
    'jodhpur': 'Rajasthan',
    'kota': 'Rajasthan',
    'bikaner': 'Rajasthan',
    'udaipur': 'Rajasthan',
    'ajmer': 'Rajasthan',
    'bhilwara': 'Rajasthan',
    'alwar': 'Rajasthan',
    'bharatpur': 'Rajasthan',
    'sikar': 'Rajasthan',
    
    // Tamil Nadu
    'chennai': 'Tamil Nadu',
    'coimbatore': 'Tamil Nadu',
    'madurai': 'Tamil Nadu',
    'tiruchirappalli': 'Tamil Nadu',
    'salem': 'Tamil Nadu',
    'tirunelveli': 'Tamil Nadu',
    'erode': 'Tamil Nadu',
    'vellore': 'Tamil Nadu',
    'thoothukudi': 'Tamil Nadu',
    'dindigul': 'Tamil Nadu',
    
    // Telangana
    'hyderabad': 'Telangana',
    'warangal': 'Telangana',
    'nizamabad': 'Telangana',
    'karimnagar': 'Telangana',
    'ramagundam': 'Telangana',
    'mahbubnagar': 'Telangana',
    
    // Uttar Pradesh
    'lucknow': 'Uttar Pradesh',
    'kanpur': 'Uttar Pradesh',
    'agra': 'Uttar Pradesh',
    'varanasi': 'Uttar Pradesh',
    'meerut': 'Uttar Pradesh',
    'allahabad': 'Uttar Pradesh',
    'prayagraj': 'Uttar Pradesh',
    'bareilly': 'Uttar Pradesh',
    'aligarh': 'Uttar Pradesh',
    'moradabad': 'Uttar Pradesh',
    'saharanpur': 'Uttar Pradesh',
    'gorakhpur': 'Uttar Pradesh',
    'firozabad': 'Uttar Pradesh',
    'jhansi': 'Uttar Pradesh',
    'muzaffarnagar': 'Uttar Pradesh',
    
    // West Bengal
    'kolkata': 'West Bengal',
    'howrah': 'West Bengal',
    'durgapur': 'West Bengal',
    'asansol': 'West Bengal',
    'siliguri': 'West Bengal',
    'malda': 'West Bengal',
    'kharagpur': 'West Bengal',
    'haldia': 'West Bengal'
  };
  
  return stateMap[city.toLowerCase()] || 'Unknown';
}

// Enhanced media type detection (billboard = hoarding)
function detectMediaType(description) {
  const desc = description.toLowerCase();
  
  if (desc.includes('unipole')) {
    return { mediaType: 'Unipole', facility: 1 };
  } else if (desc.includes('railway') || desc.includes('rail') || desc.includes('station') || desc.includes('platform')) {
    return { mediaType: 'Railway Station Branding', facility: 1 };
  } else if (desc.includes('chowk') || desc.includes('circle') || desc.includes('crossing')) {
    return { mediaType: 'Pole Kiosk', facility: 2 };
  } else if (desc.includes('mall') || desc.includes('shopping')) {
    return { mediaType: 'Mall Media', facility: 1 };
  } else if (desc.includes('bus') || desc.includes('shelter')) {
    return { mediaType: 'Bus Shelter Branding', facility: 1 };
  } else if (desc.includes('airport')) {
    return { mediaType: 'Airport Branding', facility: 1 };
  } else if (desc.includes('digital') || desc.includes('led')) {
    return { mediaType: 'Digital Billboard', facility: 1 };
  } else if (desc.includes('gantry')) {
    return { mediaType: 'Gantry', facility: 1 };
  } else if (desc.includes('pole') && !desc.includes('unipole')) {
    return { mediaType: 'Pole Kiosk', facility: 1 };
  } else if (desc.includes('billboard')) {
    return { mediaType: 'Hoarding', facility: 1 };
  } else {
    return { mediaType: 'Hoarding', facility: 1 };
  }
}

// Enhanced XML extraction method
function extractWithXML(buffer) {
  try {
    const zip = new AdmZip(buffer);
    const slideTexts = [];
    
    const entries = zip.getEntries()
      .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/slide(\d+)/)[1]);
        const numB = parseInt(b.entryName.match(/slide(\d+)/)[1]);
        return numA - numB;
      });

    entries.forEach((entry, idx) => {
      const slideNumber = idx + 1;
      
      // Skip first and last slide
      if (slideNumber === 1 || slideNumber === entries.length) {
        return;
      }

      try {
        const slideXml = entry.getData().toString('utf8');
        const texts = [];
        
        // More comprehensive text extraction patterns
        const textPatterns = [
          /<a:t[^>]*>(.*?)<\/a:t>/g,
          /<w:t[^>]*>(.*?)<\/w:t>/g,
          /<text[^>]*>(.*?)<\/text>/g,
          /<p:txBody[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>[\s\S]*?<\/p:txBody>/g,
          /<a:p[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>[\s\S]*?<\/a:p>/g,
          /<p:sp[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>[\s\S]*?<\/p:sp>/g
        ];
        
        textPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(slideXml)) !== null) {
            const text = match[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&apos;/g, "'")
              .trim();
            
            if (text && 
                !text.includes('schemas.openxmlformats') && 
                !text.startsWith('http') &&
                !text.includes('xmlns') &&
                text.length > 1) {
              texts.push(text);
            }
          }
        });

        // Additional extraction for text nodes without specific tags
        const generalTextPattern = />([^<>]+)</g;
        let generalMatch;
        while ((generalMatch = generalTextPattern.exec(slideXml)) !== null) {
          const text = generalMatch[1].trim();
          if (text && 
              text.length > 2 && 
              /[a-zA-Z0-9]/.test(text) &&
              !text.includes('schemas') &&
              !text.includes('xmlns') &&
              !text.includes('http') &&
              !text.includes('rId') &&
              !text.includes('slide')) {
            texts.push(text);
          }
        }

        if (texts.length > 0) {
          const uniqueTexts = [...new Set(texts)];
          slideTexts.push({
            slideNumber,
            texts: uniqueTexts,
            combinedText: uniqueTexts.join(' ')
          });
        }
      } catch (slideError) {
        console.error('Error processing slide', slideNumber, ':', slideError.message);
      }
    });

    return slideTexts;
  } catch (error) {
    console.error('XML extraction failed:', error.message);
    return [];
  }
}

// Enhanced slide text extraction with improved raw text handling
async function extractSlideTexts(buffer) {
  const tmpDir = path.join(process.cwd(), '.pptx_tmp');
  await fs.mkdir(tmpDir, { recursive: true });
  const tempPath = path.join(tmpDir, crypto.randomUUID() + '.pptx');
  
  try {
    await fs.writeFile(tempPath, buffer);

    const parser = new PPTX2Json();
    const data = await parser.toJson(tempPath);
    
    const slides = Array.isArray(data.slides) ? data.slides : [];
    const slideTexts = [];

    if (slides.length === 0) {
      return extractWithXML(buffer);
    }

    slides.forEach((slide, idx) => {
      // Skip first and last slide
      if (idx === 0 || idx === slides.length - 1) {
        return;
      }

      try {
        const texts = [];
        
        // Enhanced text collection with improved raw text extraction
        const collectTexts = (node, depth = 0) => {
          if (!node || typeof node !== 'object' || depth > 25) return;
          
          // Direct text properties
          const textProps = ['text', 'value', 'content', 'data', '_text', 'textContent'];
          textProps.forEach(prop => {
            if (typeof node[prop] === 'string') {
              const t = node[prop].trim();
              if (t && t.length > 1) texts.push(t);
            }
          });
          
          // Special handling for PowerPoint text structures
          if (node.type === 'text' && node.text) {
            texts.push(node.text.trim());
          }
          
          // Check for text in nested structures
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => collectTexts(child, depth + 1));
          }
          
          // Traverse all object properties
          for (const [key, value] of Object.entries(node)) {
            if (key.includes('text') || key.includes('Text')) {
              if (typeof value === 'string' && value.trim().length > 1) {
                texts.push(value.trim());
              }
            }
            
            if (Array.isArray(value)) {
              value.forEach(item => collectTexts(item, depth + 1));
            } else if (typeof value === 'object' && value !== null) {
              collectTexts(value, depth + 1);
            }
          }
        };
        
        collectTexts(slide);

        // Enhanced text cleaning and filtering
        const cleanTexts = texts
          .filter(t => t && 
            !/^http/i.test(t) && 
            !/schemas\.openxmlformats/i.test(t) &&
            !/^(click|slide|title)$/i.test(t) &&
            !/xmlns/i.test(t) &&
            !/rId\d+/i.test(t) &&
            !/^[0-9]+$/.test(t.trim()) && // Skip pure numbers
            t.length > 1
          )
          .map(t => t.replace(/\s+/g, ' ').trim())
          .filter(t => t.length > 1);

        if (cleanTexts.length > 0) {
          const uniqueTexts = [...new Set(cleanTexts)];
          
          // Improved raw text generation - keep original formatting better
          const rawText = uniqueTexts.join(' | ');
          
          slideTexts.push({
            slideNumber: idx + 1,
            texts: uniqueTexts,
            combinedText: rawText
          });
        }
      } catch (slideError) {
        console.error('Error processing slide', idx + 1, ':', slideError.message);
      }
    });
    
    // If primary extraction seems incomplete, try XML extraction
    if (slideTexts.length < slides.length * 0.3) {
      const xmlTexts = extractWithXML(buffer);
      
      // Merge results, preferring more comprehensive text
      xmlTexts.forEach(xmlSlide => {
        const existingSlide = slideTexts.find(s => s.slideNumber === xmlSlide.slideNumber);
        if (!existingSlide) {
          slideTexts.push(xmlSlide);
        } else if (xmlSlide.texts.length > existingSlide.texts.length) {
          const index = slideTexts.findIndex(s => s.slideNumber === xmlSlide.slideNumber);
          slideTexts[index] = xmlSlide;
        }
      });
      
      slideTexts.sort((a, b) => a.slideNumber - b.slideNumber);
    }
    
    return slideTexts;
  } catch (error) {
    console.error('Primary extraction failed:', error.message);
    return extractWithXML(buffer);
  } finally {
    try { 
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
  }
}

// Enhanced parsing function with better raw text preservation
function parseSlideContent(slideTexts) {
  const records = [];
  const seenRecords = new Set();
  const parseErrors = [];
  
  slideTexts.forEach(slide => {
    const allTexts = [...slide.texts, slide.combinedText];
    
    allTexts.forEach(text => {
      if (!text || text.length < 5) return;
      
      const patterns = [
        // Pattern 1: "2) Ranchi - Railway Station - 8*3 - 24sqft - NL"
        /(\d+)\)\s*([^-]+?)\s*-\s*([^-]+?)\s*-\s*(\d+)\s*\*\s*(\d+)\s*(?:-\s*(\d+)sqft)?\s*-\s*([A-Z]{1,4})/i,
        
        // Pattern 2: "Jamshedpur, Station Main Road 20x10 NL Unipole"
        /^([^,]+),\s*([^0-9]+?)\s*(\d+)\s*[x*]\s*(\d+)\s*([A-Z]{1,4})\s*(.+?)$/i,
        
        // Pattern 3: "City - Location - Size - Type - Lighting"
        /([^-]+?)\s*-\s*([^-]+?)\s*-\s*(\d+)\s*[x*]\s*(\d+)\s*-\s*([^-]+?)\s*-\s*([A-Z]{1,4})/i,
        
        // Pattern 4: Just extract components separately
        /(\d+)\)\s*(.+)/i
      ];
      
      let matched = false;
      
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = text.match(pattern);
        
        if (match) {
          matched = true;
          let srNumber, city, title, width, height, lighting, type, sqft;
          
          if (i === 0) { // Pattern 1
            [, srNumber, city, title, width, height, sqft, lighting] = match;
            type = title;
          } else if (i === 1) { // Pattern 2
            [, city, title, width, height, lighting, type] = match;
            srNumber = extractNumberFromText(text);
          } else if (i === 2) { // Pattern 3
            [, city, title, width, height, type, lighting] = match;
            srNumber = extractNumberFromText(text);
          } else if (i === 3) { // Pattern 4
            const [, matchedSrNumber, restOfText] = match;
            srNumber = matchedSrNumber;
            const extracted = extractComponentsFromText(restOfText);
            city = extracted.city;
            title = extracted.title;
            width = extracted.width;
            height = extracted.height;
            lighting = extracted.lighting;
            type = extracted.type;
          }
          
          // Clean up extracted values
          city = city ? city.trim() : '';
          title = title ? title.trim() : '';
          lighting = lighting ? lighting.trim() : '';
          type = type ? type.trim() : '';
          
          // Parse dimensions
          const parsedWidth = parseInt(width);
          const parsedHeight = parseInt(height);
          const calculatedSqft = parsedWidth * parsedHeight;
          const finalSqft = sqft ? parseInt(sqft) : calculatedSqft;
          
          // Detect media type and state
          const { mediaType, facility } = detectMediaType(type || title);
          const state = detectState(city);
          
          // Enhanced visibility detection
          const visibility = detectVisibility(text) || getFullLighting(lighting);
          
          // Create unique key to prevent duplicates
          const uniqueKey = `${srNumber || 'na'}-${city}-${title}-${parsedWidth}x${parsedHeight}`;
          
          if (!seenRecords.has(uniqueKey) && city && (title || type)) {
            const record = {
              srNumber: parseInt(srNumber) || records.length + 1,
              state: state,
              city: city,
              mediaType: mediaType,
              visibility: visibility,
              title: title,
              width: parsedWidth || 0,
              height: parsedHeight || 0,
              facility: facility,
              units: 1,
              sqft: finalSqft || 0,
              rawText: text.trim(), // Keep original text for better raw text representation
              slideNumber: slide.slideNumber
            };
            
            records.push(record);
            seenRecords.add(uniqueKey);
          }
          break;
        }
      }
      
      if (!matched) {
        const hasNumber = /\d/.test(text);
        const hasCity = /[A-Za-z]{3,}/.test(text);
        
        if (hasNumber && hasCity && text.length > 10) {
          parseErrors.push({
            slideNumber: slide.slideNumber,
            text: text,
            error: 'No pattern matched but looks like data'
          });
        }
      }
    });
  });
  
  return {
    records: records.sort((a, b) => a.srNumber - b.srNumber),
    parseErrors
  };
}

// Helper function to extract number from text
function extractNumberFromText(text) {
  const match = text.match(/(\d+)\)/);
  return match ? match[1] : null;
}

// Helper function to extract components from complex text
function extractComponentsFromText(text) {
  const result = {
    city: '',
    title: '',
    width: 0,
    height: 0,
    lighting: '',
    type: ''
  };
  
  // Extract dimensions
  const sizeMatch = text.match(/(\d+)\s*[x*]\s*(\d+)/i);
  if (sizeMatch) {
    result.width = parseInt(sizeMatch[1]);
    result.height = parseInt(sizeMatch[2]);
  }
  
  // Extract lighting codes with better detection
  result.lighting = detectVisibility(text);
  
  // Extract city and title (everything before dimensions)
  const beforeSize = text.split(/\d+\s*[x*]\s*\d+/i)[0].trim();
  const parts = beforeSize.split(/[-,]/);
  
  if (parts.length >= 2) {
    result.city = parts[0].trim();
    result.title = parts.slice(1).join(' ').trim();
  } else if (parts.length === 1) {
    result.city = parts[0].trim();
    result.title = parts[0].trim();
  }
  
  // Extract type (everything after dimensions)
  const afterSize = text.split(/\d+\s*[x*]\s*\d+/i)[1];
  if (afterSize) {
    result.type = afterSize.replace(/\b[A-Z]{1,4}\b/gi, '').trim();
  }
  
  return result;
}

// Enhanced Excel generation without location column
function buildExcel(parseResult) {
  const { records, parseErrors } = parseResult;
  const wb = new ExcelJS.Workbook();
  
  wb.creator = 'JMD Advertisement - Enhanced PPT to Excel Converter';
  wb.created = new Date();
  wb.company = 'JMD Advertisement';

  // Main data sheet
  const ws = wb.addWorksheet('JMD Quotation', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  // Company header
  ws.addRow(['JMD ADVERTISEMENT - QUOTATION']);
  ws.mergeCells('A1:L1');
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC143C' } };
  headerRow.height = 30;

  // Company details
  ws.addRow(['B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002)']);
  ws.mergeCells('A2:L2');
  const detailsRow = ws.getRow(2);
  detailsRow.font = { italic: true, size: 11, color: { argb: 'FF666666' } };
  detailsRow.alignment = { horizontal: 'center' };

  ws.addRow(['Phone: +91-9204965321 | Email: info.jmd.jsr@gmail.com']);
  ws.mergeCells('A3:L3');
  const contactRow = ws.getRow(3);
  contactRow.font = { italic: true, size: 11, color: { argb: 'FF666666' } };
  contactRow.alignment = { horizontal: 'center' };

  // Generation info
  ws.addRow([`Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${records.length} | Total SQFT: ${records.reduce((sum, r) => sum + r.sqft, 0)}`]);
  ws.mergeCells('A4:L4');
  const infoRow = ws.getRow(4);
  infoRow.font = { bold: true, size: 10, color: { argb: 'FF2E86AB' } };
  infoRow.alignment = { horizontal: 'center' };
  
  ws.addRow([]);

  // Updated column headers (removed Location, renamed columns)
  const headers = ['Sr No', 'State', 'City', 'Media Type', 'Visibility', 'Title', 'Width', 'Height', 'Facility', 'Units', 'SQFT', 'Raw Text'];
  
  ws.addRow(headers);
  const headerDataRow = ws.getRow(6);
  headerDataRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerDataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
  headerDataRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerDataRow.height = 25;

  // Data rows
  if (records.length > 0) {
    records.forEach((record, index) => {
      const row = ws.addRow([
        record.srNumber,
        record.state,
        record.city,
        record.mediaType,
        record.visibility,
        record.title,
        record.width,
        record.height,
        record.facility,
        record.units,
        record.sqft,
        record.rawText
      ]);
      
      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
      }
      
      // Wrap text for title and raw text columns
      row.getCell(6).alignment = { wrapText: true };
      row.getCell(12).alignment = { wrapText: true };
      row.height = 20;
    });

    // Total row
    const totalRow = ws.addRow([
      '', '', '', '', 'TOTAL', '', '', '', '', 
      records.length, 
      records.reduce((sum, r) => sum + r.sqft, 0),
      ''
    ]);
    totalRow.font = { bold: true };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE599' } };
  } else {
    const noDataRow = ws.addRow([
      '', '', 'No valid data found in expected format', '', '', 
      'Please check PPT format and try again', '', '', '', '', '', ''
    ]);
    noDataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEAA7' } };
  }

  // Updated column widths (removed Location column)
  ws.columns = [
    { width: 8 },   // Sr No
    { width: 15 },  // State
    { width: 15 },  // City
    { width: 25 },  // Media Type
    { width: 15 },  // Visibility
    { width: 35 },  // Title
    { width: 10 },  // Width
    { width: 10 },  // Height
    { width: 10 },  // Facility
    { width: 8 },   // Units
    { width: 10 },  // SQFT
    { width: 60 }   // Raw Text
  ];

  // Add borders to all data cells
  ws.eachRow((row, rowNumber) => {
    if (rowNumber >= 6) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });

  // Parse Errors Sheet (if any)
  if (parseErrors.length > 0) {
    const errorWs = wb.addWorksheet('Parse Errors');
    errorWs.addRow(['Parse Errors and Debugging Information']);
    errorWs.addRow(['Slide Number', 'Text Content', 'Error Description']);
    
    parseErrors.forEach(error => {
      errorWs.addRow([error.slideNumber, error.text, error.error]);
    });
    
    errorWs.columns = [
      { width: 15 },
      { width: 80 },
      { width: 40 }
    ];
  }

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
    const slideTexts = await extractSlideTexts(buffer);

    if (slideTexts.length === 0) {
      return NextResponse.json({ 
        error: 'No text could be extracted from the PPTX file',
        suggestion: 'Ensure the PPTX contains text content and is not corrupted'
      }, { status: 400 });
    }

    const parseResult = parseSlideContent(slideTexts);
    const workbook = buildExcel(parseResult);
    const excelBuffer = await workbook.xlsx.writeBuffer();
    
    const outputFileName = file.name.replace(/\.pptx$/i, '_JMD_Quotation.xlsx');

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('PPT Conversion Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to convert PPTX to Excel', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'JMD Enhanced PPT to Excel Converter',
    version: '4.1',
    supportedFormats: [
      'n) City - Title - Size - Lighting',
      'City, Location SizexSize Lighting Type',
      'Mixed formats with automatic detection'
    ],
    enhancements: [
      'Enhanced state and city mapping for all Indian states',
      'Improved raw text extraction for all slides',
      'Better text preservation and formatting',
      'Comprehensive error handling',
      'Removed console logs except errors'
    ],
    outputColumns: ['Sr No', 'State', 'City', 'Media Type', 'Visibility', 'Title', 'Width', 'Height', 'Facility', 'Units', 'SQFT', 'Raw Text'],
    usage: 'POST multipart/form-data with "file" field containing .pptx'
  });
}