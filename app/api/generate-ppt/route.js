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
            fullUrl = `https://adjmd.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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

// Helper function to get lighting abbreviation
function getLightingAbbreviation(lighting) {
    if (!lighting) return '';

    const lightingLower = lighting.toLowerCase();

    if (lightingLower.includes('no light')) {
        return 'NL';
    } else if (lightingLower.includes('fully light')) {
        return 'FLL';
    } else if (lightingLower.includes('front light')) {
        return 'FL';
    } else if (lightingLower.includes('back light')) {
        return 'BL';
    }

    return ''; // Default if no match
}

async function generatePowerPoint(data) {
    try {
        // Create new presentation
        const pres = new pptxgen();

        // Set slide dimensions to standard 16:9 ratio
        pres.defineLayout({ name: 'JMD_LAYOUT', width: 10, height: 5.625 });
        pres.layout = 'JMD_LAYOUT';

        // Set presentation properties
        pres.author = 'JMD Advertisement';
        pres.company = 'JMD Advertisement';
        pres.title = data.title || 'JMD Hoardings Presentation';
        pres.subject = 'Outdoor Advertising Hoardings';

        // Define color scheme with proper hex codes
        const colors = {
            white: 'FFFFFF',
            black: '000000',
            red: 'FF0000',
            gray: '666666'
        };

        // ===== SLIDE 1: Title Slide with JMD Logo =====
        const titleSlide = pres.addSlide();
        titleSlide.background = { color: colors.white };

        // Fetch and add the PPT logo as full page image
        const logoImageData = await fetchImageAsBase64('/images/ppt_logo.png');

        if (logoImageData) {
            // Add full page logo image
            titleSlide.addImage({
                data: `data:image/${logoImageData.extension};base64,${logoImageData.data}`,
                x: 0,
                y: 0,
                w: 10,
                h: 5.625,
                sizing: { type: 'cover', w: 10, h: 5.625 }
            });
        } else {
            // Fallback: Use the previous design if logo image fails to load
            console.warn('Logo image not found, using fallback design');

            // JMD Logo Area - Centered Red Oval Background
            titleSlide.addShape(pres.shapes.OVAL, {
                x: 3.0,
                y: 1.0,
                w: 4.0,
                h: 2.0,
                fill: { color: colors.red },
                line: { width: 0 }
            });

            // JMD Text in Logo - Properly centered
            titleSlide.addText('JMD', {
                x: 3.0,
                y: 1.4,
                w: 4.0,
                h: 1.2,
                fontSize: 48,
                fontFace: 'Arial',
                color: colors.white,
                bold: true,
                align: 'center',
                valign: 'middle'
            });

            // JAI MATA DI Text - Centered below logo
            titleSlide.addText('JAI MATA DI', {
                x: 1.0,
                y: 3.2,
                w: 8.0,
                h: 0.8,
                fontSize: 36,
                fontFace: 'Arial',
                color: colors.red,
                bold: true,
                align: 'center',
                valign: 'middle'
            });

            // OUTDOOR ADVERTISEMENT Text - Centered at bottom
            titleSlide.addText('OUTDOOR ADVERTISEMENT', {
                x: 1.0,
                y: 4.2,
                w: 8.0,
                h: 0.6,
                fontSize: 18,
                fontFace: 'Arial',
                color: colors.black,
                bold: true,
                align: 'center',
                valign: 'middle'
            });
        }

        // ===== CONTENT SLIDES: One slide per hoarding =====
        if (data.ads && data.ads.length > 0) {
            for (let i = 0; i < data.ads.length; i++) {
                const ad = data.ads[i];
                const contentSlide = pres.addSlide();
                contentSlide.background = { color: colors.white };

                // Try to fetch and add the hoarding image at the top
                const imageData = await fetchImageAsBase64(ad.imageUrl);

                if (imageData) {
                    // Add image with proper centering and aspect ratio preservation
                    contentSlide.addImage({
                        data: `data:image/${imageData.extension};base64,${imageData.data}`,
                        x: 1.5,    // Left margin
                        y: 0.3,    // Top position
                        w: 7.0,    // Maximum width
                        h: 3.8,    // Maximum height
                        sizing: { 
                            type: 'contain'  // This maintains aspect ratio and fits within bounds
                        },
                        // Add border around image
                        line: { 
                            color: '999999',  // Gray border
                            width: 2          // Border width in points
                        }
                    });
                } else {
                    // Fallback: Add a placeholder rectangle
                    contentSlide.addShape(pres.shapes.RECTANGLE, {
                        x: 0.5,
                        y: 0.3,
                        w: 9.0,
                        h: 3.8,
                        fill: { color: 'F0F0F0' },
                        line: { color: colors.gray, width: 1 }
                    });

                    contentSlide.addText('IMAGE NOT AVAILABLE', {
                        x: 0.5,
                        y: 2.0,
                        w: 9.0,
                        h: 0.5,
                        fontSize: 16,
                        fontFace: 'Arial',
                        color: colors.gray,
                        align: 'center',
                        valign: 'middle'
                    });
                }

                // All information in one line below the image (moved down slightly)
                const city = ad.city || 'N/A';
                const title = ad.title || 'N/A';

                // Fix size calculation with proper null checks
                let size = 'N/A';
                if (ad.width && ad.height) {
                    const width = parseFloat(ad.width);
                    const height = parseFloat(ad.height);
                    if (!isNaN(width) && !isNaN(height)) {
                        size = `${width}*${height} - ${Math.round(width * height)}sqft`;
                    }
                } else if (ad.size) {
                    size = ad.size; // Fallback to existing size field
                }

                const lightingAbbr = getLightingAbbreviation(ad.lighting);

                // Create single line text with all information
                let infoText = `${i + 1}) ${city} - ${title} - ${size}`;
                if (lightingAbbr) {
                    infoText += ` - ${lightingAbbr}`;
                }

                // Single line with all information (adjusted Y position)
                contentSlide.addText(infoText, {
                    x: 0.5,
                    y: 4.8, // Moved down to accommodate fixed image height
                    w: 9.0,
                    h: 0.4,
                    fontSize: 14,
                    fontFace: 'Arial',
                    color: colors.black,
                    bold: true,
                    align: 'center',
                    valign: 'middle'
                });
            }
        }

        // ===== LAST SLIDE: Terms and Conditions =====
        const termsSlide = pres.addSlide();
        termsSlide.background = { color: colors.white };

        // General Terms & Conditions Header
        termsSlide.addText('* GENERAL TERMS & CONDITIONS :-', {
            x: 0.3,
            y: 0.2,
            w: 9.4,
            h: 0.3,
            fontSize: 12,
            fontFace: 'Arial',
            color: colors.red,
            bold: true,
            align: 'left'
        });

        // General Terms
        const generalTerms = [
            '1) Display Location is Subject to Availability at The Time of Receiving Your Confirm Written Orders .',
            '2) Media Display Extension through Written Mail .',
            '3) Site Once Booked Can\'t be Cancelled / Postponed.',
            '4) Billing For All The Sites Will Be From Date of Booking & Won\'t Be Postponed Due to Delay in Supply of Creative From Your Side .',
            '5 ) Site Booking And Dropping Mail is Provide By Client.'
        ];

        let yPos = 0.6;
        generalTerms.forEach((term) => {
            termsSlide.addText(term, {
                x: 0.3,
                y: yPos,
                w: 9.4,
                h: 0.25,
                fontSize: 9,
                fontFace: 'Arial',
                color: colors.black,
                align: 'left'
            });
            yPos += 0.3;
        });

        // Business Terms Header
        termsSlide.addText('* BUSINESS TERMS :-', {
            x: 0.3,
            y: yPos + 0.1,
            w: 9.4,
            h: 0.3,
            fontSize: 12,
            fontFace: 'Arial',
            color: colors.red,
            bold: true,
            align: 'left'
        });

        yPos += 0.5;

        // Business Terms
        const businessTerms = [
            '1) Payment to Be Made 100 % in advance',
            '2) 18% Advertisement Service Tax Shall Be Charged Extra on Mounting / Installation Billing.',
            '3) Additional Taxes Shall Be Charged if Levied By The Government .',
            '4) Any Special Photography / Monitoring etc Will Attract Additional Cost .',
            '5) Flex Printing Charges Will Be Extra i.e For NonLit / Frontlit Flex @ Rs. 11 /- Per Sqft & For Backlit Flex @ Rs. 30 Per Sqft.',
            '6) Flex Mounting Charges Will Be Extra .',
            '7) Sites Once Confirmed (Verbally or Written ) Can Be Cancelled only After Giving 3 Days Clear Prior Notice ( From Campaign Start Date )in Writing , in Case its Unavoidable Client Agrees To Suitably Compensate M/S Jai Mata Di. If Cancellation is Made 4- 5 Days Prior to Campaign Start Date Client Agrees To Pay For 7 Days Display Charges + Taxes There on .',
            '8 ) If Cancellation is Made After The Start Date of Campaign Client Agrees to Pay For 15 Days Display Charges + Taxes There on.'
        ];

        businessTerms.forEach((term) => {
            termsSlide.addText(term, {
                x: 0.3,
                y: yPos,
                w: 9.4,
                h: 0.25,
                fontSize: 8,
                fontFace: 'Arial',
                color: colors.black,
                align: 'left'
            });
            yPos += 0.28;
        });

        // Generate and return the PPT buffer
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