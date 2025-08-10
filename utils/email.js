const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        // service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'yahoo', etc.
        // secure: process.env.NODE_ENV === 'production', // Use TLS in production
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        // auth: {
        //     user: process.env.EMAIL_USERNAME,
        //     pass: process.env.EMAIL_PASSWORD
        // }
         service: 'Gmail',
    auth: {
      user: process.env.HOST_EMAIL,
      pass: process.env.EMAIL_PASS
    }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
}   
module.exports = sendEmail;
