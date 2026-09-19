require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixData() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agri',
    charset: 'utf8mb4'
  });

  console.log('Connected to MySQL...');

  // Ensure charset is utf8mb4
  await conn.query('ALTER DATABASE agri CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
  await conn.query('ALTER TABLE intercrop_rules CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('ALTER TABLE pest_controls CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

  // 1. Intercrop Reasoning (Tamil & Hindi)
  await conn.execute(
    `UPDATE intercrop_rules SET 
      reasoning_ta = ?, 
      reasoning_hi = ? 
    WHERE id = 1`,
    [
      'மக்காச்சோளத்துடன் காராமணி பயிரிடுவதால் தழைச்சத்து கிடைப்பதுடன் களைகளும் கட்டுப்படுத்தப்படும்; பூச்சிகளும் குறையும்.',
      'मक्का के साथ लोबिया की खेती से मिट्टी में नाइट्रोजन बढ़ता है, खरपतवार रुकते हैं और कीटों का प्रभाव कम होता है।'
    ]
  );

  // 2. Pest Control Details (Tamil & Hindi)
  await conn.execute(
    `UPDATE pest_controls SET 
      pest_name_ta = ?, pest_name_hi = ?,
      cultural_control_ta = ?, cultural_control_hi = ?,
      bio_control_ta = ?, bio_control_hi = ?,
      chemical_last_resort_ta = ?, chemical_last_resort_hi = ?
    WHERE id = 1`,
    [
      // Tamil
      'படைப்புழு',
      // Hindi
      'फॉल आर्मीवर्म (सैनिक कीट)',
      // Tamil cultural
      'ஆழ உழவு செய்து கூட்டுப்புழுக்களை அழிக்கவும்',
      // Hindi cultural
      'गहरी जुताई करें ताकि प्यूपा नष्ट हो जाएं और फसल अवशेष साफ रखें',
      // Tamil bio
      'வேப்பங்கொட்டை கரைசல் மற்றும் பேசிலஸ் துரிஞ்சியென்சிஸ் தெளிக்கவும்',
      // Hindi bio
      'नीम का अर्क (NSKE 5%) या बैसिलस थुरिंजिएंसिस (Bt) का छिड़काव करें',
      // Tamil chemical
      'எமமெக்டின் பென்சோயேட் (கடைசி வாய்ப்பாக மட்டும்)',
      // Hindi chemical
      'इमामेक्टिन बेंजोएट 5% एसजी (अंतिम उपाय के रूप में)'
    ]
  );

  console.log('Database updated successfully with clean Tamil and Hindi strings.');
  await conn.end();
}

fixData().catch(console.error);