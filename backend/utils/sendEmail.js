const nodemailer = require('nodemailer')

// Serviciu de trimitere mailuri folosind arhitectura SMTP
const sendEmail = async (options) => {
  
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // Permitem injectarea de template-uri HTML pentru o prezentare curata catre client
  const mailOptions = {
    from: `Support Ticketing <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html, 
  }

  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail