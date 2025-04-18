require("dotenv").config();
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;
const DATA_FILE = "./data.json";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Mail functie
async function sendMatchEmail(to, subject, htmlContent) {
  console.log(`📤 Probeer mail te sturen naar ${to}...`); // Log de poging om de e-mail te sturen
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Bevestigingsmail gestuurd naar: ${to}`); // Log als de e-mail succesvol is verzonden
    console.log(`✅ Mail verzonden naar ${to}:`, info.response); // Log de reactie van de verzonden e-mail
  } catch (error) {
    console.error(`❌ Mailfout bij verzenden naar ${to}:`, error);
  }
}

// Check of data.json bestaat, anders aanmaken
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

app.post("/submit", async (req, res) => {
  const { email, interesse } = req.body;

  console.log("📥 Nieuwe inzending ontvangen:", req.body); // Log wat er precies ontvangen wordt

  if (!email || !interesse) {
    console.log("❌ Fout: email of interesse ontbreekt");
    return res
      .status(400)
      .json({ error: "Email en interesse zijn verplicht!" });
  }

  let data = JSON.parse(fs.readFileSync(DATA_FILE));
  console.log("📄 Bestaande data:", data); // Log de inhoud van data.json

  // Zoek naar match met dezelfde interesse en een ander e-mailadres
  const match = data.find(
    (item) => item.interesse === interesse && item.email !== email
  );

  console.log("🔍 Match gevonden:", match || "Geen match"); // Log of een match gevonden is

  if (match) {
    const subject = "🎉 Je hebt een match!";
    const html = `
      <p>Er is een match op interesse: <strong>${interesse}</strong></p>
      <p>Jullie kunnen elkaar mailen:</p>
      <ul>
        <li>Jij: ${email}</li>
        <li>Match: ${match.email}</li>
      </ul>
    `;

    await sendMatchEmail(email, subject, html); // Probeer de mail te sturen
    await sendMatchEmail(match.email, subject, html); // Probeer de mail te sturen naar de match
  } else {
    console.log("🚫 Geen match gevonden. Geen e-mail gestuurd.");
  }

  // Voeg de nieuwe inzending toe aan de data
  data.push({ email, interesse });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.json({ matchFound: !!match });
});

app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
});
