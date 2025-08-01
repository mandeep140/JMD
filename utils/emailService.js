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
      to: process.env.ADMIN_EMAIL,
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
      to: process.env.ADMIN_EMAIL,
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
      <div style="background-color: #f9fafb; padding: 10px; margin: 5px 0; border-radius: 3px;">
        ${index + 1}. <strong>${ad.title}</strong> - ${ad.city} (${ad.type}) [${ad.mediaCode}]
      </div>
    `).join('');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `📥 New Download Request - ${downloadData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #059669; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 10px;">
              📥 New Download Request
            </h2>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="color: #047857; margin: 0;">Request ID: <span style="color: #dc2626;">${downloadData.reqid}</span></h3>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">👤 Name:</strong>
              <span style="color: #111827; margin-left: 10px;">${downloadData.name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📧 Email:</strong>
              <span style="color: #111827; margin-left: 10px;">${downloadData.email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📱 Mobile:</strong>
              <span style="color: #111827; margin-left: 10px;">${downloadData.mobile}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📋 Download Type:</strong>
              <span style="color: #111827; margin-left: 10px; background-color: #ddd6fe; padding: 3px 8px; border-radius: 3px;">${downloadData.downloadType}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151;">📊 Total Ads:</strong>
              <span style="color: #111827; margin-left: 10px; background-color: #fef3c7; padding: 3px 8px; border-radius: 3px;">${downloadData.totalAdsCount}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">🎯 Reason:</strong>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #059669;">
                ${downloadData.reason}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">📋 Selected Ads:</strong>
              <div style="margin-top: 10px;">
                ${adsListHtml}
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
    console.log('Download form notification sent successfully');
  } catch (error) {
    console.error('Error sending download form notification:', error);
    throw error;
  }
};