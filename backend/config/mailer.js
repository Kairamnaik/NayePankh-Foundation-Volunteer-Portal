const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    // If running in development with mock/default credentials, log to console
    if (process.env.EMAIL_USER === 'mock_email_user@example.com' || !process.env.EMAIL_USER) {
      console.log('--- EMAIL SIMULATOR (DEV MODE) ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (HTML):\n${html}`);
      console.log('----------------------------------');
      return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard default, can customize via other variables
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NayePankh Foundation" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    // Return success: false, but don't throw to prevent API from crashing
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
