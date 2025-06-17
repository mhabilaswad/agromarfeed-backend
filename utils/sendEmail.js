const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // Email kamu
      pass: process.env.EMAIL_PASSWORD, // App password Gmail
    },
  });

  const mailOptions = {
    from: `"AgroMarFeed" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
