import { NextResponse } from 'next/server';
import pptxgen from 'pptxgenjs';

export async function POST(request) {
    try {
        const data = await request.json();
        
        const pptBuffer = await generatePowerPoint(data);
        
        if (!pptBuffer || pptBuffer.length < 1000) {
            throw new Error('Generated PPT buffer is too small or empty');
        }
        
        return new NextResponse(pptBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': `attachment; filename="JMD_Hoardings_${new Date().toISOString().split('T')[0]}.pptx"`,
                'Content-Length': pptBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error generating PPT:', error);
        return NextResponse.json({ 
            error: 'Failed to generate presentation', 
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

// Helper function to fetch image as base64
async function fetchImageAsBase64(imageUrl) {
    try {
        // Handle different URL formats
        let fullUrl = imageUrl;
        if (imageUrl && !imageUrl.startsWith('http')) {
            // If it's a relative URL, make it absolute
            fullUrl = `https://jmd-kohl.vercel.app${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        
        const response = await fetch(fullUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        
        // Determine image type from URL or response
        const contentType = response.headers.get('content-type') || '';
        let extension = 'jpg';
        
        if (contentType.includes('png') || imageUrl.toLowerCase().includes('.png')) {
            extension = 'png';
        } else if (contentType.includes('jpeg') || contentType.includes('jpg') || imageUrl.toLowerCase().includes('.jpg')) {
            extension = 'jpg';
        } else if (contentType.includes('webp') || imageUrl.toLowerCase().includes('.webp')) {
            extension = 'jpg'; // Convert webp to jpg for PowerPoint compatibility
        }
        
        return {
            data: base64,
            extension: extension
        };
        
    } catch (error) {
        console.error('Error fetching image:', error.message);
        return null;
    }
}

async function generatePowerPoint(data) {
    try {
        // Create new presentation
        const pres = new pptxgen();
        
        // Set presentation properties
        pres.author = 'JMD Advertisement';
        pres.company = 'JMD Advertisement';
        pres.title = data.title || 'JMD Hoardings Presentation';
        pres.subject = 'Outdoor Advertising Hoardings';
        
        // Define color scheme (pptxgenjs v4 requires hex format with #)
        const colors = {
            primary: '#D44E51',    // JMD Red
            secondary: '#FFFFFF',  // White
            accent: '#000000',     // Black
            background: '#F5F5F5', // Light Gray
            text: '#333333'        // Dark Gray
        };

        // ===== SLIDE 1: Title Slide =====
        const titleSlide = pres.addSlide();
        titleSlide.background = { color: colors.primary };
        
        // JMD Title
        titleSlide.addText('JMD ADVERTISEMENT', {
            x: 1,
            y: 2,
            w: 8,
            h: 1.5,
            fontSize: 36,
            fontFace: 'Arial',
            color: colors.secondary,
            bold: true,
            align: 'center'
        });
        
        // Main title
        titleSlide.addText(data.title || 'Selected Hoardings Presentation', {
            x: 1,
            y: 3.5,
            w: 8,
            h: 1,
            fontSize: 24,
            fontFace: 'Arial',
            color: colors.secondary,
            bold: true,
            align: 'center'
        });
        
        // Subtitle
        titleSlide.addText(data.subtitle || `Generated on ${new Date().toLocaleDateString()}`, {
            x: 1,
            y: 4.5,
            w: 8,
            h: 0.8,
            fontSize: 16,
            fontFace: 'Arial',
            color: colors.secondary,
            align: 'center'
        });

        // ===== SLIDE 2: Overview Slide =====
        const overviewSlide = pres.addSlide();
        overviewSlide.background = { color: colors.secondary };
        
        // Header
        overviewSlide.addText('Presentation Overview', {
            x: 1,
            y: 0.5,
            w: 8,
            h: 1,
            fontSize: 28,
            fontFace: 'Arial',
            color: colors.primary,
            bold: true,
            align: 'center'
        });
        
        // Statistics
        const totalDailyPrice = data.ads?.reduce((sum, ad) => {
            const price = parseInt(ad.pricePerDay?.toString().replace(/[^0-9]/g, '')) || 0;
            return sum + price;
        }, 0) || 0;
        
        const totalMonthlyPrice = data.ads?.reduce((sum, ad) => {
            const price = parseInt(ad.pricePerMonth?.toString().replace(/[^0-9]/g, '')) || 0;
            return sum + price;
        }, 0) || 0;
        
        const uniqueCities = [...new Set((data.ads || []).map(ad => ad.city).filter(Boolean))];
        const uniqueTypes = [...new Set((data.ads || []).map(ad => ad.type).filter(Boolean))];
        
        const stats = [
            { label: 'Total Hoardings Selected', value: (data.ads?.length || 0).toString() },
            { label: 'Cities Covered', value: uniqueCities.length.toString() },
            { label: 'Ad Types', value: uniqueTypes.length.toString() },
            { label: 'Total Daily Investment', value: `₹${totalDailyPrice.toLocaleString()}` },
            { label: 'Total Monthly Investment', value: `₹${totalMonthlyPrice.toLocaleString()}` }
        ];
        
        stats.forEach((stat, index) => {
            const yPos = 2 + (index * 0.7);
            
            overviewSlide.addText(stat.label + ':', {
                x: 1.5,
                y: yPos,
                w: 4,
                h: 0.6,
                fontSize: 16,
                fontFace: 'Arial',
                color: colors.text,
                bold: true
            });
            
            overviewSlide.addText(stat.value, {
                x: 5.5,
                y: yPos,
                w: 3,
                h: 0.6,
                fontSize: 16,
                fontFace: 'Arial',
                color: colors.primary,
                bold: true
            });
        });

        // ===== Individual Ad Slides =====
        if (data.ads && data.ads.length > 0) {
            for (let i = 0; i < data.ads.length; i++) {
                const ad = data.ads[i];
                
                const slide = pres.addSlide();
                slide.background = { color: colors.secondary };
                
                // Slide header with ad number
                slide.addText(`Hoarding ${i + 1} of ${data.ads.length}`, {
                    x: 0.5,
                    y: 0.2,
                    w: 9,
                    h: 0.5,
                    fontSize: 12,
                    fontFace: 'Arial',
                    color: colors.text,
                    align: 'right'
                });
                
                // Ad title
                slide.addText(ad.title || 'Untitled Hoarding', {
                    x: 0.5,
                    y: 0.8,
                    w: 9,
                    h: 0.8,
                    fontSize: 20,
                    fontFace: 'Arial',
                    color: colors.primary,
                    bold: true
                });
                
                // Try to add actual image
                let imageAdded = false;
                if (ad.imageUrl) {
                    try {
                        const imageData = await fetchImageAsBase64(ad.imageUrl);
                        if (imageData) {
                            slide.addImage({
                                data: `data:image/${imageData.extension};base64,${imageData.data}`,
                                x: 0.5,
                                y: 1.8,
                                w: 4.5,
                                h: 2.8,
                                sizing: {
                                    type: 'contain',
                                    w: 4.5,
                                    h: 2.8
                                }
                            });
                            imageAdded = true;
                        }
                    } catch (error) {
                        console.error(`Failed to add image for ad ${i + 1}:`, error.message);
                    }
                }
                
                // If image couldn't be added, show placeholder
                if (!imageAdded) {
                    slide.addText('Image Available Online', {
                        x: 0.5,
                        y: 1.8,
                        w: 4.5,
                        h: 2.8,
                        fontSize: 14,
                        fontFace: 'Arial',
                        color: colors.text,
                        align: 'center',
                        valign: 'middle',
                        border: { pt: 1, color: colors.text }
                    });
                }
                
                // Ad details - Adjusted positioning
                const details = [
                    { label: 'Media Code', value: ad.mediaCode || 'N/A' },
                    { label: 'Type', value: ad.type || 'N/A' },
                    { label: 'City', value: ad.city || 'N/A' },
                    { label: 'Size', value: ad.size || 'N/A' },
                    { label: 'Lighting', value: ad.lighting || 'N/A' },
                    { label: 'Price/Day', value: ad.pricePerDay ? `₹${parseInt(ad.pricePerDay.toString().replace(/[^0-9]/g, '')).toLocaleString()}` : 'N/A' },
                    { label: 'Price/Month', value: ad.pricePerMonth ? `₹${parseInt(ad.pricePerMonth.toString().replace(/[^0-9]/g, '')).toLocaleString()}` : 'N/A' }
                ];
                
                details.forEach((detail, index) => {
                    const yPos = 1.8 + (index * 0.35);
                    
                    slide.addText(detail.label + ':', {
                        x: 5.2,
                        y: yPos,
                        w: 2,
                        h: 0.3,
                        fontSize: 11,
                        fontFace: 'Arial',
                        color: colors.text,
                        bold: true
                    });
                    
                    slide.addText(detail.value, {
                        x: 7.2,
                        y: yPos,
                        w: 2.3,
                        h: 0.3,
                        fontSize: 11,
                        fontFace: 'Arial',
                        color: colors.primary
                    });
                });
                
                // Ad description/message - Better positioning within slide bounds
                slide.addText('Description:', {
                    x: 0.5,
                    y: 4.8,
                    w: 9,
                    h: 0.3,
                    fontSize: 12,
                    fontFace: 'Arial',
                    color: colors.text,
                    bold: true
                });
                
                // Check for message content and limit it to fit within slide
                const messageContent = ad.message && ad.message.trim() !== '' 
                    ? (ad.message.length > 150 ? ad.message.substring(0, 150) + '...' : ad.message)
                    : 'Strategic outdoor advertising location perfect for brand visibility and maximum audience reach.';
                
                slide.addText(messageContent, {
                    x: 0.5,
                    y: 5.1,
                    w: 9,
                    h: 2.3,  // Increased height to accommodate text
                    fontSize: 10,
                    fontFace: 'Arial',
                    color: colors.text,
                    wrap: true,
                    valign: 'top'
                });
            }
        }

        // ===== FINAL SLIDE: Contact Information =====
        const contactSlide = pres.addSlide();
        contactSlide.background = { color: colors.primary };
        
        contactSlide.addText('Thank You', {
            x: 1,
            y: 1.2,
            w: 8,
            h: 1.2,
            fontSize: 32,
            fontFace: 'Arial',
            color: colors.secondary,
            bold: true,
            align: 'center'
        });
        
        contactSlide.addText('For more information, contact JMD Advertisement', {
            x: 1,
            y: 2.6,
            w: 8,
            h: 0.6,
            fontSize: 16,
            fontFace: 'Arial',
            color: colors.secondary,
            align: 'center'
        });
        
        const contactInfo = [
            '🏢 B-5 Murli Garden, TRF Colony, Harhargutu Jamshedpur, Jharkhand (831002)',
            '📞 Contact: +91-9204965321',
            '✉️ Email: info.jmd.jsr@gmail.com',
            '🌐 Website: https://jmd-kohl.vercel.app/'
        ];
        
        contactInfo.forEach((info, index) => {
            contactSlide.addText(info, {
                x: 1,
                y: 3.4 + (index * 0.35),
                w: 8,
                h: 0.3,
                fontSize: 11,
                fontFace: 'Arial',
                color: colors.secondary,
                align: 'center'
            });
        });
        
        contactSlide.addText('🎯 Thinking of Branding? Think JMD!', {
            x: 1,
            y: 5.2,
            w: 8,
            h: 0.5,
            fontSize: 14,
            fontFace: 'Arial',
            color: colors.secondary,
            bold: true,
            align: 'center'
        });
        
        // Use the synchronous write method for better compatibility
        const buffer = pres.write('nodebuffer');
        
        if (!buffer || buffer.length < 1000) {
            throw new Error('Generated buffer is too small');
        }
        
        return buffer;
        
    } catch (error) {
        console.error('Error in generatePowerPoint:', error);
        throw error;
    }
}