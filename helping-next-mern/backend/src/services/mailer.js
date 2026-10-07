const nodemailer = require("nodemailer");

// Sends mail through SMTP when configured; otherwise prints it to the console,
// which mirrors Laravel's default MAIL_MAILER=log for local development.
let transporter = null;
function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const from = `"${process.env.MAIL_FROM_NAME || "Helping Next"}" <${process.env.MAIL_FROM_ADDRESS || "hello@example.com"}>`;
  const t = getTransport();
  if (!t) {
    console.log(`\n----- MAIL (not sent: SMTP not configured) -----\nTo: ${to}\nSubject: ${subject}\n\n${text}\n------------------------------------------------\n`);
    return;
  }
  await t.sendMail({ from, to, subject, text, html });
}

module.exports = { sendMail };
