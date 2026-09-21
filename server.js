require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'defaultdb',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')
    ? { rejectUnauthorized: false }
    : false
});

// Boot-time table migrations
(async () => {
  try {
    const conn = await db.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) DEFAULT 'Farmer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        primary_crop VARCHAR(50) NOT NULL DEFAULT '',
        intercrop VARCHAR(50) DEFAULT 'none',
        season VARCHAR(50) DEFAULT '',
        soil_type VARCHAR(50) DEFAULT '',
        water_status VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const columnsToAdd = [
      { name: 'user_id', def: 'INT NULL AFTER id' },
      { name: 'primary_crop', def: "VARCHAR(50) NOT NULL DEFAULT ''" },
      { name: 'intercrop', def: "VARCHAR(50) DEFAULT 'none'" },
      { name: 'season', def: "VARCHAR(50) DEFAULT ''" },
      { name: 'soil_type', def: "VARCHAR(50) DEFAULT ''" },
      { name: 'water_status', def: "VARCHAR(50) DEFAULT ''" }
    ];

    for (const col of columnsToAdd) {
      try {
        await conn.query(`ALTER TABLE user_history ADD COLUMN ${col.name} ${col.def}`);
      } catch (colErr) {
        if (colErr.errno !== 1060 && !String(colErr.message).includes('Duplicate column')) {
          console.warn(`Migration notice for ${col.name}:`, colErr.message);
        }
      }
    }

    conn.release();
    console.log('Database connected: Users & User History schema synchronized.');
  } catch (err) {
    console.error('DB Init Error:', err.message);
  }
})();

function normalizeCropKey(key = '') {
  const k = String(key).toLowerCase().trim();
  if (k.includes('rice') || k.includes('paddy')) return 'paddy';
  if (k.includes('maize') || k.includes('corn')) return 'maize';
  if (k.includes('cotton')) return 'cotton';
  if (k.includes('groundnut') || k.includes('peanut')) return 'groundnut';
  if (k.includes('sugarcane')) return 'sugarcane';
  if (k.includes('wheat')) return 'wheat';
  return k;
}

// 1. User Authentication
app.post('/api/auth/login', async (req, res) => {
  const { contactInfo, password } = req.body;
  if (!contactInfo || !password) {
    return res.status(400).json({ error: 'Contact and password are required' });
  }

  try {
    const [existing] = await db.query(
      `SELECT id, contact, password, name FROM users WHERE contact = ? LIMIT 1`,
      [contactInfo]
    );

    if (existing.length > 0) {
      const user = existing[0];
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
      }
      return res.json({
        user: { id: user.id, contact: user.contact, name: user.name }
      });
    }

    const derivedName = contactInfo.includes('@')
      ? contactInfo.split('@')[0]
      : `Farmer ${contactInfo.slice(-4)}`;

    const [result] = await db.query(
      `INSERT INTO users (contact, password, name) VALUES (?, ?, ?)`,
      [contactInfo, password, derivedName]
    );

    res.json({
      user: { id: result.insertId, contact: contactInfo, name: derivedName }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

// Helper: 3-tier hierarchy generator with trilingual localization
function getTop3Companions(cropKey, szn, soil, water, lang = 'en') {
  const s = String(szn || '').toLowerCase();
  const so = String(soil || '').toLowerCase();
  const w = String(water || '').toLowerCase();

  const TIER_LABELS = {
    en: { high: '⭐ Highly Recommended', rec: '👍 Recommended', alt: '🌾 Feasible Alternative' },
    ta: { high: '⭐ மிகச் சிறந்த பரிந்துரை', rec: '👍 பரிந்துரைக்கப்படுகிறது', alt: '🌾 சாத்தியமான மாற்றுப் பயிர்' },
    hi: { high: '⭐ अत्यधिक अनुशंसित', rec: '👍 अनुशंसित', alt: '🌾 व्यावहारिक विकल्प' }
  };
  const t = TIER_LABELS[lang] || TIER_LABELS.en;

  const CROP_NAMES = {
    greengram: { en: 'Green Gram (Moong)', ta: 'பாசிப்பயறு (பச்சைப்பயறு)', hi: 'मूंग (Green Gram)' },
    cowpea: { en: 'Cowpea (Lobia)', ta: 'காராமணி (தட்டப்பயறு)', hi: 'लोबिया (चौलाई)' },
    blackgram: { en: 'Black Gram (Urad)', ta: 'உளுந்து (கருப்பு உளுந்து)', hi: 'उड़द (Black Gram)' },
    frenchbean: { en: 'French Bean (Rajma)', ta: 'பீன்ஸ் / ராஜ்மா', hi: 'राजमा / फ्रेंच बीन' },
    pea: { en: 'Field Pea (Matar)', ta: 'பச்சை பட்டாணி', hi: 'मटर (Field Pea)' },
    chickpea: { en: 'Chickpea (Chana)', ta: 'கொண்டைக்கடலை', hi: 'चना (Chickpea)' },
    soybean: { en: 'Soybean', ta: 'சோயாபீன்', hi: 'सोयाबीन (Soybean)' },
    horsegram: { en: 'Horse Gram (Kulthi)', ta: 'கொள்ளு (Horse Gram)', hi: 'कुलथी (Horse Gram)' },
    clusterbean: { en: 'Cluster Bean (Guar)', ta: 'கொத்தவரங்காய் (Guar)', hi: 'ग्वारफली (Cluster Bean)' },
    azolla: { en: 'Azolla Pinnata (Biofertilizer)', ta: 'அசோலா உயிர் உரம்', hi: 'अजोला जैव उर्वरक' },
    sesbania: { en: 'Sesbania (Dhaincha)', ta: 'தக்கைப்பூண்டு (சணப்பை)', hi: 'ढैंचा (हरी खाद)' },
    pearlmillet: { en: 'Pearl Millet (Bajra)', ta: 'கம்பு (Bajra)', hi: 'बाजरा (Pearl Millet)' },
    pigeonpea: { en: 'Pigeon Pea (Tur / Arhar)', ta: 'துவரை (Red Gram)', hi: 'अरहर / तूर दाल' },
    sesame: { en: 'Sesame (Til)', ta: 'எள்ளு (Sesame)', hi: 'तिल (Sesame)' },
    castor: { en: 'Castor', ta: 'ஆமணக்கு (விளக்கெண்ணெய் விதை)', hi: 'अरंडी (Castor)' }
  };
  const getName = (k) => (CROP_NAMES[k] ? CROP_NAMES[k][lang] || CROP_NAMES[k].en : k);

  // 1. MAIZE MATRIX
  if (cropKey === 'maize') {
    if (s.includes('zaid') || w.includes('high')) {
      return [
        {
          tier: t.high,
          key: 'greengram',
          name: getName('greengram'),
          rowRatio: '1:2 / 2:2',
          spacing: '25 cm x 10 cm',
          lerScore: 1.38,
          nitrogenFixed: 38,
          harvestDuration: lang === 'ta' ? '55 - 65 நாட்கள்' : lang === 'hi' ? '55 - 65 दिन' : '55 - 65 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் உடனடி விதைப்பு' : lang === 'hi' ? 'दिन 0 पर एक साथ बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'ஆழமற்ற வேர் அமைப்பு மக்காச்சோள வேர்களுக்கு இடமளிக்கிறது' : lang === 'hi' ? 'उथली जड़ें मक्के की गहरी जड़ों को बाधित नहीं करतीं' : 'Shallow root zone complements deep maize taproot',
          reasoning: lang === 'ta' ? 'கோடை பாசனத்தில் (சையத்), 60 நாள் பாசிப்பயறு வெயில் உக்கிரமடைவதற்குள் விரைவாக பலன் தருகிறது.' : lang === 'hi' ? 'ग्रीष्मकालीन सिंचाई (जायद) में, 60 दिन की मूंग तेज गर्मी से पहले तैयार होकर मिट्टी में नाइट्रोजन जोड़ती है।' : 'Under summer irrigation (Zaid), fast 60-day Moong captures light between tall maize stalks before heat peaks, fixing high soil nitrogen.'
        },
        {
          tier: t.rec,
          key: 'cowpea',
          name: getName('cowpea'),
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.32,
          nitrogenFixed: 35,
          harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் உடனடி விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'படரும் இலைகள் மேல்மண்ணை ஈரப்பதமாக பாதுகாக்கும்' : lang === 'hi' ? 'सघन पत्तियां नमी बनाए रखती हैं' : 'Spreading canopy creates living mulch over topsoil',
          reasoning: lang === 'ta' ? 'கோடைகால களைகளைக் கட்டுப்படுத்தி தீவனம் மற்றும் தானிய மகசூலை வழங்குகிறது.' : lang === 'hi' ? 'गर्मियों में खरपतवार दबाती है और अतिरिक्त चारा व दाना प्रदान करती है।' : 'Provides heavy foliage to suppress summer weeds while offering dual food and fodder harvests.'
        },
        {
          tier: t.alt,
          key: 'blackgram',
          name: getName('blackgram'),
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.27,
          nitrogenFixed: 30,
          harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் உடனடி விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'சமச்சீர் வேர் அமைப்பு' : lang === 'hi' ? 'संतुलित जड़ प्रणाली' : 'Compact root zone with balanced moisture uptake',
          reasoning: lang === 'ta' ? 'சந்தையில் எளிதாக விற்பனையாகும் நிலையான மாற்று பயறு.' : lang === 'hi' ? 'मंडी में तुरंत बिकने वाली स्थिर दाल की फसल।' : 'Stable pulse option with high Mandi liquidity if Green Gram seed availability is constrained.'
        }
      ];
    }
    if (s.includes('rabi')) {
      return [
        {
          tier: t.high,
          key: 'frenchbean',
          name: getName('frenchbean'),
          rowRatio: '2:1 Alternate Bed',
          spacing: '30 cm x 15 cm',
          lerScore: 1.34,
          nitrogenFixed: 30,
          harvestDuration: lang === 'ta' ? '70 - 80 நாட்கள்' : lang === 'hi' ? '70 - 80 दिन' : '70 - 80 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'குளிர்காலத்திற்கேற்ற நேரான கட்டமைப்பு' : lang === 'hi' ? 'सर्दियों के अनुकूल सीधा ढांचा' : 'Erect cool-season legume architecture',
          reasoning: lang === 'ta' ? 'குளிர்காலத்தில் சிறந்த சந்தை விலையுடன் அதிக லாபம் தரும் பயறு வகை.' : lang === 'hi' ? 'सर्दियों के मौसम में उच्च बाजार मूल्य देने वाली प्रीमियम सह-फसल।' : 'Thrives in crisp winter temperatures, earning high premium market value alongside winter maize.'
        },
        {
          tier: t.rec,
          key: 'pea',
          name: getName('pea'),
          rowRatio: '2:2',
          spacing: '30 cm x 10 cm',
          lerScore: 1.30,
          nitrogenFixed: 32,
          harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'தண்டில் படரும் இலகுவான கொடிகள்' : lang === 'hi' ? 'मक्के के तने पर चढ़ती बेलें' : 'Light climbing tendrils on lower maize stems',
          reasoning: lang === 'ta' ? 'பச்சை பட்டாணி அறுவடை மூலம் விரைவான இடைக்கால பணவரவு.' : lang === 'hi' ? 'हरी मटर की जल्दी तुड़ाई से किसान को शुरुआती नकद आमदनी।' : 'Rapid cold-tolerant green pod harvesting provides quick early cash flow for the farmer.'
        },
        {
          tier: t.alt,
          key: 'chickpea',
          name: getName('chickpea'),
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.25,
          nitrogenFixed: 28,
          harvestDuration: lang === 'ta' ? '85 - 100 நாட்கள்' : lang === 'hi' ? '85 - 100 दिन' : '85 - 100 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Day 0 with seed treatment',
          rootZoneSynergy: lang === 'ta' ? 'ஆழமான வேர்கள்' : lang === 'hi' ? 'गहरी जड़ें' : 'Deep winter taproots mining subsoil phosphorus',
          reasoning: lang === 'ta' ? 'பூச்சி தாக்குதல் இல்லாத மிகக் குறைந்த பராமரிப்பு கொண்ட பயிர்.' : lang === 'hi' ? 'कम कीट प्रकोप वाली टिकाऊ दलहनी फसल।' : 'Durable winter legume with very low pest overlap with maize.'
        }
      ];
    }
    return [
      {
        tier: t.high,
        key: 'cowpea',
        name: getName('cowpea'),
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.32,
        nitrogenFixed: 35,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'ஆழமான மற்றும் சல்லி வேர்களின் கூட்டு' : lang === 'hi' ? 'गहरी व रेशेदार जड़ों का बेहतर संयोजन' : 'Deep taproot + Shallow fibrous root system',
        reasoning: lang === 'ta' ? 'மழைக்கால களைகளை அடக்கி மண்ணிற்கு தழைச்சத்தை உடனடியாக சேர்க்கிறது.' : lang === 'hi' ? 'मानसून के खरपतवार दबाती है और मिट्टी में प्रचुर जैविक नाइट्रोजन जोड़ती है।' : 'Best monsoon cover: rapid vegetative canopy suffocates weeds and fixes biological nitrogen during maize vegetative burst.'
      },
      {
        tier: t.rec,
        key: 'soybean',
        name: getName('soybean'),
        rowRatio: '2:2 / 2:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.29,
        nitrogenFixed: 36,
        harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'நேரான தண்டு அமைப்பு' : lang === 'hi' ? 'सीधा तना जो गिरता नहीं' : 'Vertical erect profile reducing wind lodging',
        reasoning: lang === 'ta' ? 'எண்ணெய்வித்து மூலம் அதிக வருமானம் மற்றும் மண்ணிற்கு ஊட்டச்சத்து.' : lang === 'hi' ? 'तिलहन से अतिरिक्त मुनाफा और दोमट मिट्टी में मजबूत नाइट्रोजन लाभ।' : 'Substantial commercial oilseed value with robust atmospheric nitrogen contribution in loamy and clay soils.'
      },
      {
        tier: t.alt,
        key: 'horsegram',
        name: getName('horsegram'),
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.26,
        nitrogenFixed: 28,
        harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'மண்ணை இறுகப் பிடிக்கும் வேர்கள்' : lang === 'hi' ? 'मिट्टी को बांधने वाली जड़ें' : 'Fibrous soil-binding mulch layer',
        reasoning: lang === 'ta' ? 'வறட்சி மற்றும் மணல் பாங்கான நிலங்களில் தாங்கி வளரும் சிறந்த காப்பீட்டுப் பயிர்.' : lang === 'hi' ? 'सूखे और रेतीली जमीन में बिना पानी के भी टिकने वाली फसल।' : 'Extreme drought insurance; thrives even if monsoon breaks occur or in nutrient-deficient sandy soils.'
      }
    ];
  }

  // 2. COTTON MATRIX
  if (cropKey === 'cotton') {
    if (so.includes('black')) {
      return [
        {
          tier: t.high,
          key: 'blackgram',
          name: getName('blackgram'),
          rowRatio: '1:2',
          spacing: '30 cm x 10 cm',
          lerScore: 1.31,
          nitrogenFixed: 32,
          harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'பருத்தி வரிசைகளுக்கு இடையே உள்ள ஈரப்பதத்தை பயன்படுத்தும்' : lang === 'hi' ? 'कपास की चौड़ी कतारों के बीच की नमी का सदुपयोग' : 'Shallow pulse zone utilizing moisture between 90cm cotton rows',
          reasoning: lang === 'ta' ? 'கரிசல் மண்ணின் ஈரப்பதத்தில் உளுந்து நன்கு வளரும், காய்ப்புழுக்களை கட்டுப்படுத்த செண்டுமல்லி வரப்பு பயிராகிறது.' : lang === 'hi' ? 'काली मिट्टी की नमी में उड़द जल्दी पकती है और गेंदा सुंडी को आकर्षित कर रोकता है।' : 'Deep Vertisols (Black soil) hold moisture to finish short Black Gram, while Marigold borders lure away American bollworms.'
        },
        {
          tier: t.rec,
          key: 'greengram',
          name: getName('greengram'),
          rowRatio: '1:2',
          spacing: '25 cm x 10 cm',
          lerScore: 1.28,
          nitrogenFixed: 30,
          harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'பருத்தி கிளை விரிக்கும் முன் அறுவடை' : lang === 'hi' ? 'कपास के फैलने से पहले तुड़ाई' : 'Quick maturity before cotton branches wide',
          reasoning: lang === 'ta' ? 'பருத்தி பெரிதாக வளர்வதற்கு முன்பே அறுவடை முடிந்து விடுகிறது.' : lang === 'hi' ? 'कपास के बड़े होने से पहले कटाई पूरी हो जाती है, जिससे धूप की कोई प्रतिस्पर्धा नहीं होती।' : 'Harvested before cotton reaches peak vegetative branching, ensuring zero competition for sunlight.'
        },
        {
          tier: t.alt,
          key: 'soybean',
          name: getName('soybean'),
          rowRatio: '1:2 Strip Cropping',
          spacing: '30 cm x 10 cm',
          lerScore: 1.26,
          nitrogenFixed: 34,
          harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'மண் அரிப்பை தடுக்கும் அடர்ந்த இலைகள்' : lang === 'hi' ? 'कतारों को ढकने वाला तना' : 'Mid-tier canopy cover protecting wide ridges',
          reasoning: lang === 'ta' ? 'பருத்தி எடுப்பதற்கு முன்பே நல்ல கூடுதல் வருமானம் தரும் பயிர்.' : lang === 'hi' ? 'कपास की चुगाई शुरू होने से पहले ही अच्छी आमदनी देती है।' : 'Generates early cash income before cotton picking starts; requires timely picking of soybean pods.'
        }
      ];
    }
    return [
      {
        tier: t.high,
        key: 'clusterbean',
        name: getName('clusterbean'),
        rowRatio: '1:1',
        spacing: '45 cm x 15 cm',
        lerScore: 1.24,
        nitrogenFixed: 25,
        harvestDuration: lang === 'ta' ? '85 - 95 நாட்கள்' : lang === 'hi' ? '85 - 95 दिन' : '85 - 95 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'வறட்சியைத் தாங்கும் ஆழமான வேர்' : lang === 'hi' ? 'गहरी सूखा सहनशील जड़ें' : 'Extreme osmotic adjustment for dry soils',
        reasoning: lang === 'ta' ? 'வறண்ட நிலத்திலும் வெயிலிலும் கூட பருத்தியுடன் இணைந்து நன்கு வளரும்.' : lang === 'hi' ? 'गंभीर सूखे और गर्मी में भी कपास को नुकसान पहुंचाए बिना टिकती है।' : 'Outstanding drought and heat resilience; deep taproot extracts nutrients without invading wide cotton root balls.'
      },
      {
        tier: t.rec,
        key: 'blackgram',
        name: getName('blackgram'),
        rowRatio: '1:2',
        spacing: '30 cm x 10 cm',
        lerScore: 1.28,
        nitrogenFixed: 30,
        harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'மண்ணை மூடி ஈரத்தை காக்கும்' : lang === 'hi' ? 'जमीन को ढकने वाली फसल' : 'Low sprawling canopy reducing soil crusting',
        reasoning: lang === 'ta' ? 'பருத்தி சிறியதாக இருக்கும் காலத்தில் களைகளைக் கட்டுப்படுத்துகிறது.' : lang === 'hi' ? 'शुरुआती दौर में खरपतवार को रोककर दलहन का अच्छा उत्पादन देती है।' : 'Proven commercial pulse intercrop that provides weed control during cotton’s slow juvenile phase.'
      },
      {
        tier: t.alt,
        key: 'cowpea',
        name: getName('cowpea'),
        rowRatio: '1:1 Border',
        spacing: '30 cm x 10 cm',
        lerScore: 1.22,
        nitrogenFixed: 32,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'மண்ணிற்கு பாதுகாப்பு மூடாக்கு' : lang === 'hi' ? 'मृदा संरक्षण आवरण' : 'Aggressive topsoil shading',
        reasoning: lang === 'ta' ? 'மண்ணை பாதுகாக்கும்; கொடிகள் பருத்தி மீது படராமல் கண்காணிக்க வேண்டும்.' : lang === 'hi' ? 'मिट्टी कटाव रोकती है, बस कपास पर बेल न चढ़ने दें।' : 'Effective cover against erosion, but requires pruning if vegetative vines begin climbing young cotton stalks.'
      }
    ];
  }

  // 3. PADDY / RICE MATRIX
  if (cropKey === 'paddy') {
    if (w.includes('high')) {
      return [
        {
          tier: t.high,
          key: 'azolla',
          name: getName('azolla'),
          rowRatio: lang === 'ta' ? 'நீரில் மிதக்கும் முறை' : lang === 'hi' ? 'पानी पर तैरती परत' : 'Inoculated Floating Blanket',
          spacing: lang === 'ta' ? 'வயல் முழுவதும் தொடர் படர்ச்சி' : lang === 'hi' ? 'सतत बायोमास आवरण' : 'Continuous Biomass Layer',
          lerScore: 1.27,
          nitrogenFixed: 45,
          harvestDuration: lang === 'ta' ? 'பயிர்க்காலம் முழுவதும்' : lang === 'hi' ? 'पूरी फसल अवधि' : 'Living Water Blanket',
          sowingOffset: lang === 'ta' ? 'நடவு நட்ட 7-ம் நாள் இடவும்' : lang === 'hi' ? 'रोपाई के 7वें दिन छोड़ें' : 'Inoculated on Day 7 after transplanting',
          rootZoneSynergy: lang === 'ta' ? 'நீரில் மிதந்து வேர்களுக்கு குளிர்ச்சி தருகிறது' : lang === 'hi' ? 'खड़े पानी में जड़ों को ठंडक देती है' : 'Floating aquatic symbiosis in standing water',
          reasoning: lang === 'ta' ? 'தேங்கிய நீரில் 5 நாட்களில் இரட்டிப்பாகி, 45 கிலோ வரை தழைச்சத்து தருகிறது; பாசிகளை ஒழிக்கும்.' : lang === 'hi' ? 'खड़े पानी में तेजी से फैलकर 45 किलो नाइट्रोजन जोड़ती है और जलीय खरपतवार मिटाती है।' : 'Multiplies every 5 days on floodwaters, fixing up to 45 kg N/ha, smothering aquatic weeds, and lowering root temperatures.'
        },
        {
          tier: t.rec,
          key: 'greengram',
          name: getName('greengram'),
          rowRatio: lang === 'ta' ? 'வரப்பு ஓரங்களில் நடுதல்' : lang === 'hi' ? 'मेड़ों पर बुवाई' : 'Bund & Perimeter Rows',
          spacing: '20 cm x 10 cm',
          lerScore: 1.22,
          nitrogenFixed: 25,
          harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
          sowingOffset: lang === 'ta' ? 'வரப்புகளில் முதல் நாளில்' : lang === 'hi' ? 'मेड़ों पर दिन 0' : 'Day 0 along field bunds',
          rootZoneSynergy: lang === 'ta' ? 'வரப்பு மண்ணை பலப்படுத்துகிறது' : lang === 'hi' ? 'मेड़ की मिट्टी को मजबूत रखती है' : 'Perimeter pulse taking advantage of non-flooded edges',
          reasoning: lang === 'ta' ? 'பயன்பாடற்ற வரப்புகளில் பயிர் செய்து கூடுதல் பயறு மகசூல் பெறலாம்.' : lang === 'hi' ? 'खाली मेड़ों का सदुपयोग करके बिना अतिरिक्त लागत दाल उत्पादन।' : 'Converts uncultivated bund margins into productive pulse ground without interfering with flooded basin paddy.'
        },
        {
          tier: t.alt,
          key: 'blackgram',
          name: getName('blackgram'),
          rowRatio: lang === 'ta' ? 'வரப்பு அல்லது அறுவடைக்கு முன் விதைப்பு' : lang === 'hi' ? 'मेड़ या रिले बुवाई' : 'Bund or Relay Sowing',
          spacing: '20 cm x 10 cm',
          lerScore: 1.18,
          nitrogenFixed: 22,
          harvestDuration: lang === 'ta' ? '65 - 70 நாட்கள்' : lang === 'hi' ? '65 - 70 दिन' : '65 - 70 Days',
          sowingOffset: lang === 'ta' ? 'நெல் அறுவடைக்கு முன் விதைத்தல்' : lang === 'hi' ? 'कटाई से पहले गीली मिट्टी में' : 'Sown on bunds or broadcast into relay moisture',
          rootZoneSynergy: lang === 'ta' ? 'எஞ்சிய ஈரப்பதத்தை பயன்படுத்தும்' : lang === 'hi' ? 'अवशिष्ट नमी का उपयोग' : 'Utilizes residual soil moisture profile',
          reasoning: lang === 'ta' ? 'பாரம்பரிய நெல் தரிசு உளுந்து சாகுபடி முறை.' : lang === 'hi' ? 'चावल कटाई के बाद खेत की बची हुई नमी में पकने वाली दलहन।' : 'Traditional rice-fallow relay companion that sprouts in residual mud moisture before paddy harvest.'
        }
      ];
    }
    return [
      {
        tier: t.high,
        key: 'greengram',
        name: getName('greengram'),
        rowRatio: lang === 'ta' ? 'வரப்பு ஓரங்களில் நடுதல்' : lang === 'hi' ? 'मेड़ों पर बुवाई' : 'Bund & Perimeter Rows',
        spacing: '20 cm x 10 cm',
        lerScore: 1.22,
        nitrogenFixed: 25,
        harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் வரப்பில்' : lang === 'hi' ? 'मेड़ों पर दिन 0' : 'Day 0 along field bunds',
        rootZoneSynergy: lang === 'ta' ? 'வரப்பு வேர் அமைப்பு' : lang === 'hi' ? 'मेड़ सुरक्षा जड़ें' : 'Perimeter root zone without flooding competition',
        reasoning: lang === 'ta' ? 'வரப்புகளை மண் அரிப்பிலிருந்து காத்து கூடுதல் வருவாய் தரும்.' : lang === 'hi' ? 'मेड़ को सुरक्षित रखती है और दलहन की अतिरिक्त उपज देती है।' : 'Monetizes raised bunds and binds bund soil against erosion under partial irrigation regimes.'
      },
      {
        tier: t.rec,
        key: 'blackgram',
        name: getName('blackgram'),
        rowRatio: lang === 'ta' ? 'வரப்பு வரிசைகள்' : lang === 'hi' ? 'मेड़ कतारें' : 'Bund Rows',
        spacing: '25 cm x 10 cm',
        lerScore: 1.20,
        nitrogenFixed: 22,
        harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
        sowingOffset: lang === 'ta' ? 'வரப்புகளில்' : lang === 'hi' ? 'मेड़ों पर' : 'Day 0 along field bunds',
        rootZoneSynergy: lang === 'ta' ? 'வரப்பு ஓரங்களை நிலைநிறுத்தும்' : lang === 'hi' ? 'मेड़ को मजबूती' : 'Low canopy stabilizing farm path edges',
        reasoning: lang === 'ta' ? 'குறைந்த பராமரிப்பில் வரப்புகளில் வளரக்கூடியது.' : lang === 'hi' ? 'बिना अतिरिक्त पानी के मेड़ों पर पनपने वाली मजबूत फसल।' : 'Resilient bund legume that thrives on splash moisture and minimal management.'
      },
      {
        tier: t.alt,
        key: 'sesbania',
        name: getName('sesbania'),
        rowRatio: lang === 'ta' ? 'வரப்பு வேலி' : lang === 'hi' ? 'मेड़ सुरक्षा पट्टी' : 'Peripheral Windbreak',
        spacing: '30 cm x 15 cm',
        lerScore: 1.16,
        nitrogenFixed: 40,
        harvestDuration: lang === 'ta' ? 'தழை உரம் / எல்லை பயிர்' : lang === 'hi' ? 'हरी खाद पट्टी' : 'Green Manure / Border',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'அதிக தழைச்சத்து முடிச்சுகள்' : lang === 'hi' ? 'प्रचुर नाइट्रोजन ग्रंथियां' : 'Deep nitrogen nodules on bund perimeters',
        reasoning: lang === 'ta' ? 'காற்றைத் தடுத்து, பின்னர் வயலுக்கு தழை உரமாகவும் பயன்படும்.' : lang === 'hi' ? 'हवा से बचाती है और बाद में धान के खेत में हरी खाद का काम करती है।' : 'Excellent green manure boundary that buffers strong winds and can be lopped into paddy basins as bio-fertilizer.'
      }
    ];
  }

  // 4. GROUNDNUT MATRIX
  if (cropKey === 'groundnut') {
    if (w.includes('low') || so.includes('sandy')) {
      return [
        {
          tier: t.high,
          key: 'pearlmillet',
          name: getName('pearlmillet'),
          rowRatio: lang === 'ta' ? '6:1 அல்லது 8:1 வரப்பு வரிசை' : lang === 'hi' ? '6:1 या 8:1 सीमा कतारें' : '6:1 or 8:1 Border Rows',
          spacing: '45 cm x 15 cm',
          lerScore: 1.28,
          nitrogenFixed: 0,
          harvestDuration: lang === 'ta' ? '80 - 85 நாட்கள்' : lang === 'hi' ? '80 - 85 दिन' : '80 - 85 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் எல்லை வரிசை' : lang === 'hi' ? 'दिन 0 पर सीमा बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'காற்றுத் தடுப்பு சுவர்' : lang === 'hi' ? 'हवा रोधक आवरण' : 'Tall perimeter micro-climate barrier',
          reasoning: lang === 'ta' ? 'உயரமான கம்பு வெப்பக் காற்றைத் தடுத்து, வேர்க்கடலை விழுதுகள் இறங்க ஈரப்பதத்தைக் காக்கிறது.' : lang === 'hi' ? 'ऊंचा बाजरा गर्म हवा रोकता है, जिससे मूंगफली की सुइयां (Pegs) आसानी से जमीन में धंसती हैं।' : 'Tall Bajra border rows deflect hot desiccating winds in sandy zones, conserving topsoil humidity for groundnut pegging.'
        },
        {
          tier: t.rec,
          key: 'pigeonpea',
          name: getName('pigeonpea'),
          rowRatio: '6:1 / 8:1',
          spacing: '60 cm x 15 cm',
          lerScore: 1.34,
          nitrogenFixed: 40,
          harvestDuration: lang === 'ta' ? '130 - 150 நாட்கள்' : lang === 'hi' ? '130 - 150 दिन' : '130 - 150 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'ஆழமான ஆணிவேர்' : lang === 'hi' ? 'गहरी मूसला जड़' : 'Deep taproot foraging lower subsoil water',
          reasoning: lang === 'ta' ? 'துவரை ஆழமான மண்ணிலிருந்து நீர் எடுப்பதால் வேர்க்கடலையுடன் போட்டி போடுவதில்லை.' : lang === 'hi' ? 'अरहर जमीन की गहराई से पानी लेती है, इसलिए मूंगफली से कोई प्रतिस्पर्धा नहीं होती।' : 'Pigeon Pea taproots tap deep moisture reserves without competing with shallow groundnut pods.'
        },
        {
          tier: t.alt,
          key: 'sesame',
          name: getName('sesame'),
          rowRatio: '4:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.21,
          nitrogenFixed: 0,
          harvestDuration: lang === 'ta' ? '75 - 85 நாட்கள்' : lang === 'hi' ? '75 - 85 दिन' : '75 - 85 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'குறைந்த நீர் தேவை' : lang === 'hi' ? 'कम पानी में गहरी जड़ें' : 'Low water requirement oilseed canopy',
          reasoning: lang === 'ta' ? 'மணல் பாங்கான நிலங்களில் குறைந்த நீரிலும் விளையக்கூடிய இரட்டை எண்ணெய்வித்து பயிர்.' : lang === 'hi' ? 'रेतीली जमीन में कम पानी पर भी पकने वाली दोहरी तिलहन जोड़ी।' : 'Drought-tolerant dual oilseed pairing that thrives in sandy loam under low water availability.'
        }
      ];
    }
    return [
      {
        tier: t.high,
        key: 'pigeonpea',
        name: getName('pigeonpea'),
        rowRatio: '6:1',
        spacing: '60 cm x 15 cm',
        lerScore: 1.36,
        nitrogenFixed: 42,
        harvestDuration: lang === 'ta' ? '130 - 150 நாட்கள்' : lang === 'hi' ? '130 - 150 दिन' : '130 - 150 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'துவரை ஆழமான வேர் (1.5 மீ) + வேர்க்கடலை மேல் வேர் (20 செ.மீ)' : lang === 'hi' ? 'अरहर गहरी जड़ (1.5 मी) + मूंगफली ऊपरी जड़ (20 सेमी)' : 'Deep taproot (1.5m) + Shallow groundnut peg layer (20cm)',
        reasoning: lang === 'ta' ? 'வேர்க்கடலை 105 நாட்களில் முடிந்ததும், துவரை முழு நிலத்தையும் பயன்படுத்தி அதிக மகசூல் தரும்.' : lang === 'hi' ? 'मूंगफली 105 दिन में कट जाती है, फिर अरहर को पूरी धूप व जमीन मिलती है।' : 'Classic ICAR pairing: groundnut harvests in 105 days, leaving Pigeon Pea to exploit the full field and late season sunlight.'
      },
      {
        tier: t.rec,
        key: 'castor',
        name: getName('castor'),
        rowRatio: '8:1',
        spacing: '90 cm x 30 cm',
        lerScore: 1.30,
        nitrogenFixed: 0,
        harvestDuration: lang === 'ta' ? '140 - 160 நாட்கள்' : lang === 'hi' ? '140 - 160 दिन' : '140 - 160 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'ஆழமான வேர் மற்றும் அகன்ற இலைகள்' : lang === 'hi' ? 'गहरी जड़ व चौड़ी छतरी' : 'Deep taproot with vertical canopy branching',
        reasoning: lang === 'ta' ? 'அதிக வணிக வருவாய் தருவதுடன் புழுக்களுக்கு கவர்ச்சிப் பயிராகவும் செயல்படும்.' : lang === 'hi' ? 'उत्कृष्ट व्यावसायिक आमदनी और कीटों को आकर्षित करने वाली ट्रैप फसल।' : 'Castor generates heavy secondary commercial returns and acts as an effective trap crop for Spodoptera caterpillars.'
      },
      {
        tier: t.alt,
        key: 'blackgram',
        name: getName('blackgram'),
        rowRatio: '4:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.23,
        nitrogenFixed: 28,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'விரைவான வேர் வளர்ச்சி' : lang === 'hi' ? 'शीघ्र पकने वाली जड़ें' : 'Fast pulse harvest before groundnut canopy locks',
        reasoning: lang === 'ta' ? 'வேர்க்கடலை முதிர்வதற்கு முன்பே விரைவான பயறு அறுவடையைத் தருகிறது.' : lang === 'hi' ? 'मूंगफली पकने से पहले ही जल्दी दाल की कटाई पूरी हो जाती है।' : 'Short-duration pulse that gives an early grain harvest before groundnut pods mature.'
      }
    ];
  }

  return [
    {
      tier: t.high,
      key: 'cowpea',
      name: getName('cowpea'),
      rowRatio: '2:1',
      spacing: '30 cm x 10 cm',
      lerScore: 1.30,
      nitrogenFixed: 32,
      harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
      sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
      rootZoneSynergy: lang === 'ta' ? 'கூட்டு வேர் கட்டமைப்பு' : lang === 'hi' ? 'संतुलित जड़ प्रणाली' : 'Deep taproot + Shallow fibrous root system',
      reasoning: lang === 'ta' ? 'இயற்கை தழைச்சத்து மற்றும் களை கட்டுப்பாடு.' : lang === 'hi' ? 'प्राकृतिक नाइट्रोजन और खरपतवार नियंत्रण।' : 'Dependable biological nitrogen fixation, weed suppression, and soil cover.'
    }
  ];
}

// 2. Recommendation Engine Endpoint
app.post('/api/recommend', async (req, res) => {
  const { primaryCropKey, season = '', soilType = '', waterStatus = '', lang = 'en' } = req.body;

  try {
    const langCol = (lang === 'ta' || lang === 'hi') ? `_${lang}` : '_en';
    const normalizedKey = normalizeCropKey(primaryCropKey);

    let primaryCrop = null;
    let [crops] = await db.query(
      `SELECT * FROM crops WHERE LOWER(crop_key) = ? OR LOWER(crop_key) = ? LIMIT 1`,
      [String(primaryCropKey).toLowerCase(), normalizedKey]
    );

    if (crops.length === 0) {
      [crops] = await db.query(
        `SELECT * FROM crops WHERE LOWER(name_en) LIKE ? LIMIT 1`,
        [`%${normalizedKey}%`]
      );
    }

    if (crops.length > 0) {
      const c = crops[0];
      primaryCrop = {
        key: c.crop_key,
        name: c[`name${langCol}`] || c.name_en || primaryCropKey,
        harvestDuration: c.harvest_duration || '3 - 4 Months',
        avgYield: parseFloat(c.avg_yield_per_acre || (normalizedKey === 'cotton' ? 8.5 : normalizedKey === 'groundnut' ? 12.0 : 18.0)),
        safeMoisturePct: parseFloat(c.safe_moisture_pct || 12.0),
        ambientShelfLifeMonths: c.ambient_shelf_life_months || 6,
        coldShelfLifeMonths: c.cold_shelf_life_months || 18
      };
    } else {
      const primaryNames = {
        maize: { en: 'Maize / Corn', ta: 'மக்காச்சோளம்', hi: 'मक्का' },
        cotton: { en: 'Cotton', ta: 'பருத்தி', hi: 'कपास' },
        groundnut: { en: 'Groundnut', ta: 'வேர்க்கடலை', hi: 'मूंगफली' },
        paddy: { en: 'Paddy / Rice', ta: 'நெல்', hi: 'धान / चावल' }
      };
      const pName = (primaryNames[normalizedKey] && primaryNames[normalizedKey][lang]) || primaryNames[normalizedKey]?.en || primaryCropKey;

      primaryCrop = {
        key: primaryCropKey,
        name: pName,
        harvestDuration: lang === 'ta' ? '3 - 4 மாதங்கள்' : lang === 'hi' ? '3 - 4 महीने' : '3 - 4 Months',
        avgYield: normalizedKey === 'cotton' ? 8.5 : normalizedKey === 'groundnut' ? 12.0 : 20.0,
        safeMoisturePct: 12.0,
        ambientShelfLifeMonths: 6,
        coldShelfLifeMonths: 18
      };
    }

    const matchedCropKey = crops.length > 0 ? crops[0].crop_key : primaryCropKey;

    const CURRENT_MSP_DIRECTORY = {
      paddy: { msp: 2441.00, mandi: 2520.00, date: '2026-06-15' },
      rice: { msp: 2441.00, mandi: 2520.00, date: '2026-06-15' },
      maize: { msp: 2410.00, mandi: 2490.00, date: '2026-06-15' },
      cotton: { msp: 8267.00, mandi: 8450.00, date: '2026-06-15' },
      groundnut: { msp: 7517.00, mandi: 7680.00, date: '2026-06-15' }
    };

    const defaultCropMarket = CURRENT_MSP_DIRECTORY[normalizedKey] || CURRENT_MSP_DIRECTORY.maize;

    let marketData = {
      pricePerQuintal: defaultCropMarket.mandi,
      officialMsp: defaultCropMarket.msp,
      lastUpdated: defaultCropMarket.date
    };

    try {
      const [prices] = await db.query(
        `SELECT * FROM market_prices WHERE crop_key = ? OR crop_key = ? LIMIT 1`,
        [matchedCropKey, normalizedKey]
      );
      if (prices.length > 0) {
        const p = prices[0];
        const dbMsp = parseFloat(p.official_msp || p.price_per_quintal || defaultCropMarket.msp);
        marketData = {
          pricePerQuintal: Math.max(dbMsp, defaultCropMarket.mandi),
          officialMsp: Math.max(dbMsp, defaultCropMarket.msp),
          lastUpdated: p.last_updated ? new Date(p.last_updated).toISOString().slice(0, 10) : defaultCropMarket.date
        };
      }
    } catch (err) {
      console.warn('Price query fallback used:', err.message);
    }

    const companionList = getTop3Companions(normalizedKey, season, soilType, waterStatus, lang).map(comp => ({
      ...comp,
      postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
    }));

    const activeCompanion = companionList[0];

    let pests = [];
    try {
      const [pestRows] = await db.query(
        `SELECT * FROM pest_controls WHERE crop_key = ? OR crop_key = ?`,
        [matchedCropKey, normalizedKey]
      );

      pests = pestRows.map(p => ({
        pestName: p[`pest_name${langCol}`] || p.pest_name_en || p.pest_name || p.name || 'Field Pest',
        cultural: p[`cultural_control${langCol}`] || p.cultural_control_en || p.cultural_control || 'Crop rotation & clean tillage',
        bio: p[`bio_control${langCol}`] || p.bio_control_en || p.bio_control || 'Neem oil spray (5ml/L)',
        chemical: p[`chemical_last_resort${langCol}`] || p.chemical_last_resort_en || p.chemical_control || 'Approved targeted chemical spray',
        toxicity: p.toxicity_level || 'Moderate',
        phiDays: p.phi_days || 14
      }));
    } catch (err) {
      console.warn('Pest query warning:', err.message);
    }

    res.json({
      primaryCrop,
      marketData,
      intercrop: activeCompanion,
      companionOptions: companionList,
      pests
    });

  } catch (err) {
    console.error('Fatal /api/recommend error:', err);
    res.status(500).json({ error: 'Database execution failed: ' + err.message });
  }
});

// 3. SECURE WEATHER PROXY ENDPOINT
app.get('/api/weather', async (req, res) => {
  const { lat, lon, lang = 'en' } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server weather API key is not configured in .env' });
  }

  const latitude = lat || '10.7905';
  const longitude = lon || '78.7047';

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather HTTP status ${response.status}`);
    }

    const data = await response.json();
    const city = data.city?.name || 'Local Farm Station';

    const dailyMap = {};
    data.list.forEach((item) => {
      const dateKey = item.dt_txt.split(' ')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          temps: [],
          rainProb: [],
          windSpeeds: []
        };
      }
      dailyMap[dateKey].temps.push(item.main.temp);
      dailyMap[dateKey].rainProb.push((item.pop || 0) * 100);
      dailyMap[dateKey].windSpeeds.push(Math.round(item.wind.speed * 3.6));
    });

    const dayLabels = {
      en: ['Day 1 (Today)', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
      ta: ['நாள் 1 (இன்று)', 'நாள் 2', 'நாள் 3', 'நாள் 4', 'நாள் 5'],
      hi: ['दिन 1 (आज)', 'दिन 2', 'दिन 3', 'दिन 4', 'दिन 5']
    };
    const labels = dayLabels[lang] || dayLabels.en;

    const forecast = Object.keys(dailyMap).slice(0, 5).map((dKey, idx) => {
      const dData = dailyMap[dKey];
      const maxT = Math.round(Math.max(...dData.temps));
      const maxRain = Math.round(Math.max(...dData.rainProb));
      const maxW = Math.round(Math.max(...dData.windSpeeds));
      const isHighRisk = maxRain >= 50 || maxW >= 20;

      return {
        day: labels[idx] || `Day ${idx + 1}`,
        date: dKey,
        temp: maxT,
        rainProb: maxRain,
        windKmh: maxW,
        sprayRisk: isHighRisk ? 'High' : 'Low'
      };
    });

    res.json({ city, forecast });
  } catch (err) {
    console.error('Proxy weather fetch error:', err.message);
    res.status(500).json({ error: 'Weather proxy failed: ' + err.message });
  }
});

// 4. User History Endpoints
app.post('/api/history/save', async (req, res) => {
  const { userId, primaryCrop, intercrop, season, soilType, waterStatus } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO user_history (user_id, primary_crop, intercrop, season, soil_type, water_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, primaryCrop || '', intercrop || 'none', season || '', soilType || '', waterStatus || '']
    );
    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error('Error in /api/history/save:', err);
    res.status(500).json({ error: 'Database could not save blueprint: ' + err.message });
  }
});

app.get('/api/history/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM user_history WHERE user_id = ? ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Could not fetch history: ' + err.message });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM user_history WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting history entry:', err);
    res.status(500).json({ error: 'Could not delete entry: ' + err.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgriCompanion AI Engine operational on port ${PORT}`);
});