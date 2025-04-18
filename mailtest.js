require("dotenv").config();
const nodemailer = require("nodemailer");

// Check of .env goed geladen is
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log(
  "GMAIL_PASS:",
  process.env.GMAIL_PASS ? "✅ geladen" : "❌ niet geladen"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: "sanderskliko3@gmail.com", // Hardcoded testontvanger
  subject: "Testmail vanaf matchmaking site 📬",
  html: `
    <h2>Dit is een testmail</h2>
    <p>Als je dit ziet, werkt het versturen van e-mails via Node.js! 🎉</p>
  `,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log("❌ Fout bij verzenden:", error);
  }
  console.log("✅ Mail verzonden:", info.response);
});
console.log("🔐 GMAIL_USER =", process.env.GMAIL_USER);
