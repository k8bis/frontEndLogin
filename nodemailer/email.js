const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: process.env.MAIL_AUTH,
    tls: process.env.MAIL_TLS
});

module.exports = transporter;