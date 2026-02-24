const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  // 1. Configurare Transporter (curierul)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // 2. Definire opțiuni email
  const mailOptions = {
    from: `Support Ticketing <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html, // Folosim HTML pentru design frumos
  }

  // 3. Trimitere efectivă
  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail