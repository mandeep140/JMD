import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password
    },
  });
};

// Send contact form notification
export const sendContactFormNotification = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO_SEND, // Admin email
      subject: `🆕 New Contact Form Submission - ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              📝 New Contact Form Submission
            </h2>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin: 0;">Request ID: <span style="color: #059669;">${contactData.reqid}</span></h3>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">👤 Name:</strong>
              <span style="color: #111827; margin-left: 10px;">${contactData.name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📧 Email:</strong>
              <span style="color: #111827; margin-left: 10px;">${contactData.email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📱 Phone:</strong>
              <span style="color: #111827; margin-left: 10px;">${contactData.phone}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📞 Callback:</strong>
              <span style="color: #111827; margin-left: 10px;">${contactData.callback}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">💬 Message:</strong>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #2563eb;">
                ${contactData.message}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>📅 Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              <p>🌐 JMD Advertisement - Admin notification system | Showa</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact form notification sent successfully');
  } catch (error) {
    console.error('Error sending contact form notification:', error);
    throw error;
  }
};

// Send booking form notification
export const sendBookingFormNotification = async (bookingData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO_SEND,
      subject: `🎯 New Booking Request - ${bookingData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
              🎯 New Booking Request
            </h2>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="color: #991b1b; margin: 0;">Request ID: <span style="color: #059669;">${bookingData.reqid}</span></h3>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">🏢 Media Details</h3>
              <div><strong>Media Code:</strong> ${bookingData.mediacode}</div>
              <div><strong>Title:</strong> ${bookingData.title}</div>
              <div><strong>City:</strong> ${bookingData.city}</div>
              <div><strong>Type:</strong> ${bookingData.mediatype}</div>
              <div><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">${bookingData.status}</span></div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">👤 Name:</strong>
              <span style="color: #111827; margin-left: 10px;">${bookingData.name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📧 Email:</strong>
              <span style="color: #111827; margin-left: 10px;">${bookingData.email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📱 Phone:</strong>
              <span style="color: #111827; margin-left: 10px;">${bookingData.phone}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📞 Callback:</strong>
              <span style="color: #111827; margin-left: 10px;">${bookingData.callback}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">💬 Message:</strong>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #dc2626;">
                ${bookingData.message}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>📅 Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              <p>🌐 JMD Advertisement - Admin notification system | Showa</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking form notification sent successfully');
  } catch (error) {
    console.error('Error sending booking form notification:', error);
    throw error;
  }
};

// Send download form notification
export const sendDownloadFormNotification = async (downloadData) => {
  try {
    const transporter = createTransporter();
    
    const adsListHtml = downloadData.selectedAds.map((ad, index) => `
      <div style="background-color: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #059669;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span><strong>${index + 1}. ${ad.title}</strong></span>
          <span style="color: #059669; font-weight: bold;">₹${ad.pricePerMonth || 'N/A'}</span>
        </div>
        <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">
          📍 ${ad.city} | 🏷️ ${ad.type} | 🆔 ${ad.mediaCode}
        </div>
      </div>
    `).join('');

    const additionalPacksHtml = downloadData.additionalPacks && downloadData.additionalPacks.length > 0 
      ? downloadData.additionalPacks.map((pack, index) => `
          <div style="background-color: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #f59e0b;">
            <strong>${index + 1}. ${pack.title}</strong> - ₹${pack.cost}
            <div style="color: #92400e; font-size: 12px;">₹${pack.unitCost} ${pack.unit}</div>
          </div>
        `).join('')
      : '<div style="color: #6b7280; font-style: italic;">No additional services selected</div>';

    // Determine download type display
    let downloadTypeDisplay = downloadData.downloadType;
    let downloadTypeColor = '#059669';
    if (downloadData.downloadType === 'BOTH') {
      downloadTypeDisplay = '📄 PPT & 📊 Excel (Both Files)';
      downloadTypeColor = '#7c3aed';
    } else if (downloadData.downloadType === 'PPT') {
      downloadTypeDisplay = '📄 PowerPoint Presentation';
      downloadTypeColor = '#dc2626';
    } else if (downloadData.downloadType === 'Excel') {
      downloadTypeDisplay = '📊 Excel Spreadsheet';
      downloadTypeColor = '#059669';
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO_SEND,
      subject: `📥 New Download Request (${downloadData.downloadType === 'BOTH' ? 'PPT & Excel' : downloadData.downloadType}) - ${downloadData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: ${downloadTypeColor}; margin-bottom: 20px; border-bottom: 2px solid ${downloadTypeColor}; padding-bottom: 10px;">
              📥 New Download Request
            </h2>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
              <h3 style="color: #047857; margin: 0;">Request ID: <span style="color: #dc2626; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">${downloadData.reqid}</span></h3>
            </div>
            
            <!-- Customer Information -->
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">👤 Customer Information</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <strong style="color: #374151;">📝 Name:</strong><br>
                  <span style="color: #111827; font-size: 16px;">${downloadData.name}</span>
                </div>
                
                <div>
                  <strong style="color: #374151;">📧 Email:</strong><br>
                  <span style="color: #111827; font-size: 16px;">${downloadData.email}</span>
                </div>
                
                <div>
                  <strong style="color: #374151;">📱 Mobile:</strong><br>
                  <span style="color: #111827; font-size: 16px;">${downloadData.mobile}</span>
                </div>
                
                <div>
                  <strong style="color: #374151;">📥 Download Type:</strong><br>
                  <span style="color: ${downloadTypeColor}; font-size: 16px; font-weight: bold;">${downloadTypeDisplay}</span>
                </div>
              </div>
            </div>

            <!-- Request Details -->
            <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fef08a;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; border-bottom: 1px solid #fbbf24; padding-bottom: 8px;">📊 Request Summary</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                <div style="background-color: #ffffff; padding: 15px; border-radius: 5px;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${downloadData.selectedAds.length}</div>
                  <div style="color: #6b7280; font-size: 12px;">Selected Ads</div>
                </div>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 5px;">
                  <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${downloadData.additionalPacks?.length || 0}</div>
                  <div style="color: #6b7280; font-size: 12px;">Additional Services</div>
                </div>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 5px;">
                  <div style="font-size: 20px; font-weight: bold; color: #dc2626;">₹${downloadData.totalValue}</div>
                  <div style="color: #6b7280; font-size: 12px;">Total Value (incl. tax)</div>
                </div>
              </div>
            </div>
            
            ${downloadData.reason ? `
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">🎯 Reason for Interest:</strong>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 8px; border-left: 4px solid #059669;">
                ${downloadData.reason}
              </div>
            </div>
            ` : ''}
            
            <!-- Selected Ads -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">📋 Selected Advertisements (${downloadData.selectedAds.length} items)</h3>
              <div style="margin-top: 15px; max-height: 300px; overflow-y: auto;">
                ${adsListHtml}
              </div>
            </div>
            
            <!-- Additional Services -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">🛠️ Additional Services (${downloadData.additionalPacks?.length || 0} items)</h3>
              <div style="margin-top: 15px;">
                ${additionalPacksHtml}
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 25px; border: 1px solid #bfdbfe;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">⚡ Action Required</h3>
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                ${downloadData.downloadType === 'BOTH' 
                  ? '🔄 Customer has downloaded both PPT and Excel files. Please follow up for potential booking.' 
                  : `📄 Customer has downloaded ${downloadData.downloadType} file. Consider reaching out for consultation.`
                }
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
              <p>📅 Submitted on: <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</strong></p>
              <p>🌐 JMD Advertisement - Admin Notification System | Powered by Showa.online</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Download form notification sent successfully');
  } catch (error) {
    console.error('Error sending download form notification:', error);
    throw error;
  }
};