const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        // service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'yahoo', etc.
        secure: true, // Use TLS in production
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        //  service: 'gmail',
    auth: {
      user: process.env.HOST_EMAIL,
      pass: process.env.EMAIL_PASS
    },
    debug: true,
  logger: true,
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.html
    };
    await transporter.verify();
    await transporter.sendMail(mailOptions);
}   
module.exports = sendEmail;
