// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter, use Mailtrap here
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    //service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });
  // 2) Define the email option
  const mailOptions = {
    from: 'Ye <hello@hotmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  // 3) Acutally send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
