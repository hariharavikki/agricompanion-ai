import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agricompanion_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database Migration & Seeding Routine
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        preferred_lang VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Crop Plans History Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crop_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        primary_crop VARCHAR(50) NOT NULL,
        intercrop VARCHAR(50) NOT NULL,
        season VARCHAR(20) NOT NULL,
        soil_type VARCHAR(50) NOT NULL,
        water_status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Primary Crops Metadata
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crops (
        crop_key VARCHAR(50) PRIMARY KEY,
        name_en VARCHAR(100),
        name_ta VARCHAR(100),
        name_hi VARCHAR(100),
        harvest_duration_en VARCHAR(50),
        harvest_duration_ta VARCHAR(50),
        harvest_duration_hi VARCHAR(50),
        avg_yield DECIMAL(5,2),
        safe_moisture_pct DECIMAL(4,1),
        ambient_shelf_life_months INT,
        cold_shelf_life_months INT
      )
    `);

    // 4. Market MSP & Mandi Rates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS msp_directory (
        crop_key VARCHAR(50) PRIMARY KEY,
        msp_rate DECIMAL(8,2),
        mandi_benchmark DECIMAL(8,2),
        last_updated DATE
      )
    `);

    // 5. Integrated Pest Management
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pest_protocols (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crop_key VARCHAR(50),
        pest_name_en VARCHAR(100),
        pest_name_ta VARCHAR(100),
        pest_name_hi VARCHAR(100),
        cultural_en TEXT,
        cultural_ta TEXT,
        cultural_hi TEXT,
        bio_en TEXT,
        bio_ta TEXT,
        bio_hi TEXT,
        chemical TEXT,
        toxicity_level VARCHAR(20),
        phi_days INT
      )
    `);

    // Seed Crops (Brinjal, Maize, Cotton, Groundnut)
    await connection.query(`
      INSERT INTO crops (crop_key, name_en, name_ta, name_hi, harvest_duration_en, harvest_duration_ta, harvest_duration_hi, avg_yield, safe_moisture_pct, ambient_shelf_life_months, cold_shelf_life_months)
      VALUES
        ('brinjal', 'Brinjal / Eggplant (Thanjavur)', 'கத்தரிக்காய் (Brinjal)', 'बैंगन (Brinjal)', '4 - 5 Months', '4 - 5 மாதங்கள்', '4 - 5 महीने', 110.0, 85.0, 0, 1),
        ('maize', 'Maize / Corn', 'மக்காச்சோளம்', 'मक्का', '3 - 4 Months', '3 - 4 மாதங்கள்', '3 - 4 महीने', 18.0, 12.0, 6, 18),
        ('cotton', 'Cotton', 'பருத்தி', 'कपास', '5 - 6 Months', '5 - 6 மாதங்கள்', '5 - 6 महीने', 8.5, 9.0, 8, 24),
        ('groundnut', 'Groundnut', 'வேர்க்கடலை', 'मूंगफली', '3 - 4 Months', '3 - 4 மாதங்கள்', '3 - 4 महीने', 12.0, 8.0, 6, 18)
      ON DUPLICATE KEY UPDATE 
        name_en = VALUES(name_en),
        avg_yield = VALUES(avg_yield)
    `);

    // Seed Market Rates (Updated 2026 Directory)
    await connection.query(`
      INSERT INTO msp_directory (crop_key, msp_rate, mandi_benchmark, last_updated)
      VALUES
        ('brinjal', 1800.00, 2200.00, '2026-06-15'),
        ('maize', 2410.00, 2490.00, '2026-06-15'),
        ('cotton', 8267.00, 8450.00, '2026-06-15'),
        ('groundnut', 7517.00, 7680.00, '2026-06-15')
      ON DUPLICATE KEY UPDATE
        msp_rate = VALUES(msp_rate),
        mandi_benchmark = VALUES(mandi_benchmark),
        last_updated = VALUES(last_updated)
    `);

    // Seed Pest Protocols (including Brinjal Shoot & Fruit Borer)
    await connection.query(`
      INSERT INTO pest_protocols (crop_key, pest_name_en, pest_name_ta, pest_name_hi, cultural_en, cultural_ta, cultural_hi, bio_en, bio_ta, bio_hi, chemical, toxicity_level, phi_days)
      VALUES
        ('brinjal', 
         'Shoot & Fruit Borer (Leucinodes orbonalis)', 
         'காய் மற்றும் தண்டு துளைப்பான் (Leucinodes)', 
         'तना व फल छेदक (Shoot & Fruit Borer)',
         'Prompt clipping and destruction of wilted shoots; plant Marigold trap borders.',
         'பாதிக்கப்பட்ட குருத்துகளை உடனுக்குடன் அகற்றி அழித்தல், சாமந்தி செடிகளை வரப்புகளில் நடுதல்.',
         'संक्रमित टहनियों को काटकर नष्ट करें व गेंदा की ट्रैप फसल लगाएं।',
         'Neem oil 3% or Bacillus thuringiensis (Bt) @ 2g/L water.',
         'வேப்பெண்ணெய் கரைசல் (3%) அல்லது பேசிலஸ் துரிஞ்சியென்சிஸ் (Bt).',
         'नीम का तेल (3%) या बीटी (Bt) स्प्रे।',
         'Chlorantraniliprole 18.5% SC @ 0.3 ml/L water.',
         'Moderate',
         3),
        ('maize', 
         'Fall Armyworm (Spodoptera frugiperda)', 
         'படைப்புழு (Fall Armyworm)', 
         'फॉल आर्मीवर्म (Fall Armyworm)',
         'Deep summer ploughing and clean seedbed tillage.',
         'ஆழ உழவு மற்றும் தூய விதைப்படுக்கை உழவு.',
         'गहरी जुताई व शुद्ध क्यारी तैयार करें।',
         'Neem seed kernel extract (NSKE 5%) or Trichogramma cards.',
         'வேப்ப எண்ணெய் கரைசல் (5 மிலி/லி) அல்லது டிரைக்கோடெர்மா அட்டைகள்.',
         'नीम तेल स्प्रे (5ml/L) या ट्राइकोग्रामा कार्ड।',
         'Emamectin benzoate 5% SG @ 4g/10L water.',
         'Moderate',
         14),
        ('cotton', 
         'Bollworm Complex & Whitefly', 
         'காய்ப்புழு மற்றும் வெள்ளை ஈ', 
         'गुलाबी सुंडी व सफेद मक्खी',
         'Install yellow sticky traps (15/acre) and remove alternate host weeds.',
         'மஞ்சள் ஒட்டும் பொறிகள் (ஏக்கருக்கு 15) வைத்தல் மற்றும் களைகளை அகற்றுதல்.',
         'पीले चिपचिपे कार्ड लगाएं व खरपतवार साफ रखें।',
         'Beauveria bassiana 10g/L or release Chrysoperla predators.',
         'பவேரியா பேசியானா (10 கிராம்/லி) தெளித்தல்.',
         'व्यूवेरिया बेसियाना स्प्रे करें।',
         'Flonicamid 50% WG @ 4g/10L water.',
         'Moderate',
         21),
        ('groundnut', 
         'Leaf Miner & Spodoptera Caterpillars', 
         'சுருள் பூச்சி மற்றும் இலை தின்னும் புழு', 
         'पत्ती सुरंगक व सुंडी',
         'Intercrop with Bajra or Castor trap lines to catch egg clutches.',
         'கம்பு அல்லது ஆமணக்கு பயிர்களை கவர்ச்சி பயிராக நடுதல்.',
         'बाजरा या अरंडी को सीमा पर ट्रैप फसल के रूप में लगाएं।',
         'Nuclear Polyhedrosis Virus (NPV @ 250 LE/acre) + Jaggery.',
         'என்.பி.வி (NPV) வைரஸ் கரைசல் தெளித்தல்.',
         'एनपीवी स्प्रे का उपयोग करें।',
         'Indoxacarb 14.5% SC @ 5ml/10L water.',
         'Low',
         10)
      ON DUPLICATE KEY UPDATE chemical = VALUES(chemical)
    `);

    connection.release();
    console.log('✅ AgriCompanion MySQL database initialized and seeded successfully.');
  } catch (err) {
    console.error('⚠️ Database setup error (running with in-memory fallbacks):', err.message);
  }
};

initDatabase();

// 3-Tier Agronomic Decision Matrix
const getTop3Companions = (crop, szn, soil, water, lang = 'en') => {
  const s = String(szn || '').toLowerCase();
  const so = String(soil || '').toLowerCase();
  const w = String(water || '').toLowerCase();
  const c = String(crop || '').toLowerCase();

  const TIER_LABELS = {
    en: { high: '⭐ Highly Recommended', rec: '👍 Recommended', alt: '🌾 Feasible Alternative' },
    ta: { high: '⭐ மிகச் சிறந்த பரிந்துரை', rec: '👍 பரிந்துரைக்கப்படுகிறது', alt: '🌾 சாத்தியமான மாற்றுப் பயிர்' },
    hi: { high: '⭐ अत्यधिक अनुशंसित', rec: '👍 अनुशंसित', alt: '🌾 व्यावहारिक विकल्प' }
  };
  const t = TIER_LABELS[lang] || TIER_LABELS.en;

  // 1. BRINJAL (THANJAVUR CAUVERY DELTA ALLUVIUM)
  if (c.includes('brinjal') || c.includes('eggplant') || c.includes('aubergine')) {
    return [
      {
        tier: t.high,
        key: 'coriander',
        name: lang === 'ta' ? 'கொத்தமல்லி (Coriander)' : lang === 'hi' ? 'धनिया (Coriander)' : 'Coriander (Kothamalli)',
        rowRatio: '1:2 (Between 75cm ridges)',
        spacing: '15 cm x 5 cm',
        nitrogenFixed: 0,
        lerScore: 1.34,
        harvestDuration: lang === 'ta' ? '35 - 45 நாட்கள்' : lang === 'hi' ? '35 - 45 दिन' : '35 - 45 Days',
        sowingOffset: lang === 'ta' ? 'கத்தரி நடவு செய்த அன்றே பாத்திகளில் விதைக்க வேண்டும்' : lang === 'hi' ? 'बैंगन रोपाई के दिन ही मेड़ों के बीच' : 'Sown on Day 0 along ridge sides',
        rootZoneSynergy: lang === 'ta' ? 'மேல்மண் சல்லிவேர்கள் கத்தரி வேரை பாதிக்காது' : lang === 'hi' ? 'उथली जड़ें बैंगन को नुकसान नहीं पहुंचातीं' : 'Ultra-shallow fibrous root zone with zero competition for brinjal taproots',
        reasoning: lang === 'ta' ? 'தஞ்சாவூர் வண்டல் மண்ணில் 40 நாட்களில் அறுவடை முடிந்து கத்தரி கிளை விரிக்கும் முன்பே உடனடி வருமானம் தரும்.' : lang === 'hi' ? 'तंजावुर की दोमट मिट्टी में 40 दिनों में पहली नकदी देता है, बैंगन के फैलने से पहले कटाई पूरी।' : 'Harvested in 40 days before brinjal reaches peak canopy spread, generating immediate early cash flow from wide ridges.',
        postHarvest: { safeMoisturePct: 12.0, ambientMonths: 1, coldMonths: 3 }
      },
      {
        tier: t.rec,
        key: 'frenchbean',
        name: lang === 'ta' ? 'பீன்ஸ் (French Bean)' : lang === 'hi' ? 'फ्रेंच बीन (राजमा)' : 'French Bean (Bush Bean)',
        rowRatio: '1:1 Alternate Plant',
        spacing: '30 cm x 15 cm',
        nitrogenFixed: 26,
        lerScore: 1.29,
        harvestDuration: lang === 'ta' ? '55 - 65 நாட்கள்' : lang === 'hi' ? '55 - 65 दिन' : '55 - 65 Days',
        sowingOffset: lang === 'ta' ? 'கத்தரி நட்ட 3-ம் நாள்' : lang === 'hi' ? 'रोपाई के तीसरे दिन' : 'Sown on Day 3 after brinjal transplant',
        rootZoneSynergy: lang === 'ta' ? 'கத்தரிக்கு தழைச்சத்து வழங்கும் பயறு வேர்' : lang === 'hi' ? 'बैंगन को जैविक नाइट्रोजन देती है' : 'Bush legume adding active atmospheric nitrogen into heavy-feeder brinjal rhizosphere',
        reasoning: lang === 'ta' ? 'கத்தரி அதிக சத்து உறிஞ்சும் பயிர்; பீன்ஸ் வேர்கள் மண்ணில் தழைச்சத்தை சேர்த்து உரம் மிச்சப்படுத்தும்.' : lang === 'hi' ? 'बैंगन को भारी खाद चाहिए; बीन्स मिट्टी में नाइट्रोजन जोड़कर यूरिया का खर्च बचाती है।' : 'Brinjal is a heavy feeder; bush beans fix 26 kg N/ha, boosting brinjal fruit setting while giving high-value pods.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 3, coldMonths: 6 }
      },
      {
        tier: t.alt,
        key: 'marigold',
        name: lang === 'ta' ? 'செவ்வந்தி / சாமந்தி (பூச்சி கவர்ச்சி)' : lang === 'hi' ? 'गेंदा (कीट ट्रैप)' : 'Marigold (Trap Crop)',
        rowRatio: '1:6 Perimeter & Inter-plot',
        spacing: '45 cm x 30 cm',
        nitrogenFixed: 0,
        lerScore: 1.25,
        harvestDuration: lang === 'ta' ? '60 - 75 நாட்கள்' : lang === 'hi' ? '60 - 75 दिन' : '60 - 75 Days',
        sowingOffset: lang === 'ta' ? 'வரப்புகளிலும் 6 கத்தரிக்கு ஒரு பூ செடியும்' : lang === 'hi' ? 'मेड़ों पर और प्रत्येक 6 पौधों के बाद' : 'Planted on borders and every 6th brinjal plant',
        rootZoneSynergy: lang === 'ta' ? 'வேர்ப் புழுக்களை அழிக்கும் வேர் சுரப்பு' : lang === 'hi' ? 'निमेटोड व कीटों को रोकने वाली जड़ें' : 'Exudes alpha-terthienyl, suppressing soil nematodes and attracting borers away',
        reasoning: lang === 'ta' ? 'தஞ்சை பகுதியில் கத்தரிக்காயைத் தாக்கும் காய் துளைப்பான் மற்றும் வேர் நூற்புழுக்களை கட்டுப்படுத்தும் இயற்கை அரண்.' : lang === 'hi' ? 'बैंगन के तना व फल छेदक कीट को अपनी ओर खींचकर फसल को सुरक्षित रखता है।' : 'ICAR-recommended trap crop that lures fruit and shoot borers away from brinjal while suppressing root-knot nematodes.',
        postHarvest: { safeMoisturePct: 14.0, ambientMonths: 1, coldMonths: 2 }
      }
    ];
  }

  // 2. MAIZE
  if (c.includes('maize') || c.includes('corn')) {
    return [
      {
        tier: t.high,
        key: 'cowpea',
        name: lang === 'ta' ? 'காராமணி (தட்டப்பயறு)' : lang === 'hi' ? 'लोबिया (चौलाई)' : 'Cowpea (Lobia)',
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 35,
        lerScore: 1.32,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot + Shallow fibrous root system',
        reasoning: 'Monsoon weed smothering crop fixing high soil nitrogen.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.rec,
        key: 'soybean',
        name: lang === 'ta' ? 'சோயாபீன்' : lang === 'hi' ? 'सोयाबीन' : 'Soybean',
        rowRatio: '2:2 / 2:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 36,
        lerScore: 1.29,
        harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Erect vertical architecture',
        reasoning: 'Commercial oilseed value with atmospheric nitrogen enrichment.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.alt,
        key: 'horsegram',
        name: lang === 'ta' ? 'கொள்ளு (Horse Gram)' : lang === 'hi' ? 'कुलथी' : 'Horse Gram (Kulthi)',
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 28,
        lerScore: 1.26,
        harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Fibrous root mulch layer',
        reasoning: 'Extreme drought insurance; thrives if rains break.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  // 3. COTTON
  if (c.includes('cotton')) {
    return [
      {
        tier: t.high,
        key: 'blackgram',
        name: lang === 'ta' ? 'உளுந்து (கருப்பு உளுந்து)' : lang === 'hi' ? 'उड़द (Black Gram)' : 'Black Gram (Urad)',
        rowRatio: '1:2',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 32,
        lerScore: 1.31,
        harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Shallow pulse zone utilizing moisture between 90cm rows',
        reasoning: 'Deep Vertisols finish short Black Gram, maximizing cash return.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.rec,
        key: 'greengram',
        name: lang === 'ta' ? 'பாசிப்பயறு' : lang === 'hi' ? 'मूंग' : 'Green Gram (Moong)',
        rowRatio: '1:2',
        spacing: '25 cm x 10 cm',
        nitrogenFixed: 30,
        lerScore: 1.28,
        harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Quick maturity before cotton branches wide',
        reasoning: 'Harvested in 60 days before peak cotton branching.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.alt,
        key: 'soybean',
        name: lang === 'ta' ? 'சோயாபீன்' : lang === 'hi' ? 'सोयाबीन' : 'Soybean',
        rowRatio: '1:2 Strip Cropping',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 34,
        lerScore: 1.26,
        harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Mid-tier canopy cover',
        reasoning: 'High cash income before cotton picking starts.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  // 4. GROUNDNUT
  return [
    {
      tier: t.high,
      key: 'pigeonpea',
      name: lang === 'ta' ? 'துவரை (Red Gram)' : lang === 'hi' ? 'अरहर / तूर दाल' : 'Pigeon Pea (Arhar / Tur)',
      rowRatio: '6:1',
      spacing: '60 cm x 15 cm',
      nitrogenFixed: 42,
      lerScore: 1.36,
      harvestDuration: lang === 'ta' ? '130 - 150 நாட்கள்' : lang === 'hi' ? '130 - 150 दिन' : '130 - 150 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Deep taproot (1.5m) + Shallow groundnut peg layer (20cm)',
      reasoning: 'Classic ICAR pairing: groundnut finishes first, pigeon pea exploits late season sunlight.',
      postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
    },
    {
      tier: t.rec,
      key: 'castor',
      name: lang === 'ta' ? 'ஆமணக்கு' : lang === 'hi' ? 'अरंडी' : 'Castor',
      rowRatio: '8:1',
      spacing: '90 cm x 30 cm',
      nitrogenFixed: 0,
      lerScore: 1.30,
      harvestDuration: lang === 'ta' ? '140 - 160 நாட்கள்' : lang === 'hi' ? '140 - 160 दिन' : '140 - 160 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Deep taproot with vertical canopy branching',
      reasoning: 'Commercial oilseed returns while functioning as Spodoptera trap lines.',
      postHarvest: { safeMoisturePct: 8.0, ambientMonths: 6, coldMonths: 18 }
    },
    {
      tier: t.alt,
      key: 'blackgram',
      name: lang === 'ta' ? 'உளுந்து' : lang === 'hi' ? 'उड़द' : 'Black Gram (Urad)',
      rowRatio: '4:1',
      spacing: '30 cm x 10 cm',
      nitrogenFixed: 28,
      lerScore: 1.23,
      harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Fast pulse harvest',
      reasoning: 'Quick pulse cash return before groundnut pegging locks ground.',
      postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
    }
  ];
};

// --- API ROUTES ---

// 1. Recommendation Endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { primaryCropKey, season, soilType, waterStatus, lang } = req.body;
    const currentLang = lang || 'en';
    const cKey = String(primaryCropKey || 'brinjal').toLowerCase();

    // Fetch primary crop metadata from DB
    let primaryCrop = null;
    try {
      const [rows] = await pool.query('SELECT * FROM crops WHERE crop_key = ?', [cKey]);
      if (rows.length > 0) {
        const row = rows[0];
        primaryCrop = {
          key: row.crop_key,
          name: row[`name_${currentLang}`] || row.name_en,
          harvestDuration: row[`harvest_duration_${currentLang}`] || row.harvest_duration_en,
          avgYield: Number(row.avg_yield),
          safeMoisturePct: Number(row.safe_moisture_pct),
          ambientShelfLifeMonths: row.ambient_shelf_life_months,
          coldShelfLifeMonths: row.cold_shelf_life_months
        };
      }
    } catch (dbErr) {
      console.warn('DB crop query fallback:', dbErr.message);
    }

    if (!primaryCrop) {
      primaryCrop = {
        key: cKey,
        name: cKey === 'brinjal' ? 'Brinjal / Eggplant (Thanjavur)' : cKey.toUpperCase(),
        harvestDuration: currentLang === 'ta' ? '4 - 5 மாதங்கள்' : '4 - 5 Months',
        avgYield: cKey === 'brinjal' ? 110.0 : 18.0,
        safeMoisturePct: cKey === 'brinjal' ? 85.0 : 12.0,
        ambientShelfLifeMonths: cKey === 'brinjal' ? 0 : 6,
        coldShelfLifeMonths: cKey === 'brinjal' ? 1 : 18
      };
    }

    // Fetch MSP / Market Data
    let marketData = { pricePerQuintal: 2200.0, officialMsp: 1800.0, lastUpdated: '2026-06-15' };
    try {
      const [mRows] = await pool.query('SELECT * FROM msp_directory WHERE crop_key = ?', [cKey]);
      if (mRows.length > 0) {
        marketData = {
          pricePerQuintal: Number(mRows[0].mandi_benchmark),
          officialMsp: Number(mRows[0].msp_rate),
          lastUpdated: mRows[0].last_updated
        };
      }
    } catch (dbErr) {
      console.warn('DB market query fallback:', dbErr.message);
    }

    // Fetch IPM Pest Protocols
    let pests = [];
    try {
      const [pRows] = await pool.query('SELECT * FROM pest_protocols WHERE crop_key = ?', [cKey]);
      if (pRows.length > 0) {
        pests = pRows.map(p => ({
          pestName: p[`pest_name_${currentLang}`] || p.pest_name_en,
          cultural: p[`cultural_${currentLang}`] || p.cultural_en,
          bio: p[`bio_${currentLang}`] || p.bio_en,
          chemical: p.chemical,
          toxicity: p.toxicity_level,
          phiDays: p.phi_days
        }));
      }
    } catch (dbErr) {
      console.warn('DB pest query fallback:', dbErr.message);
    }

    if (pests.length === 0) {
      pests = [{
        pestName: currentLang === 'ta' ? 'காய் மற்றும் தண்டு துளைப்பான்' : 'Shoot and Fruit Borer',
        cultural: 'Prompt clipping of wilted shoots; plant Marigold trap borders.',
        bio: 'Neem oil 3% or Bt spray @ 2g/L.',
        chemical: 'Chlorantraniliprole 18.5% SC @ 0.3 ml/L water.',
        toxicity: 'Moderate',
        phiDays: 3
      }];
    }

    // Compute 3-Tier Companions
    const companionOptions = getTop3Companions(cKey, season, soilType, waterStatus, currentLang);

    res.json({
      primaryCrop,
      marketData,
      intercrop: companionOptions[0],
      companionOptions,
      pests
    });
  } catch (err) {
    console.error('Recommend endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate intercrop blueprint' });
  }
});

// 2. Weather Proxy (Defaults to Thanjavur / Trichy delta basin)
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon, lang } = req.query;
    // Thanjavur baseline coordinates: 10.7870° N, 79.1378° E
    const latitude = lat || '10.7870';
    const longitude = lon || '79.1378';
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.json({
        city: 'Thanjavur Delta Basin (Baseline)',
        forecast: [
          { day: 'Day 1 (Today)', temp: 32, rainProb: 10, windKmh: 12, sprayRisk: 'Low' },
          { day: 'Day 2', temp: 31, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
          { day: 'Day 3', temp: 28, rainProb: 70, windKmh: 22, sprayRisk: 'High' },
          { day: 'Day 4', temp: 27, rainProb: 60, windKmh: 18, sprayRisk: 'High' },
          { day: 'Day 5', temp: 30, rainProb: 15, windKmh: 11, sprayRisk: 'Low' }
        ]
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OpenWeather query failed');
    }

    const dailyMap = {};
    data.list.forEach((item) => {
      const dateKey = item.dt_txt.split(' ')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { temps: [], rainProb: [], windSpeeds: [] };
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
      const maxTemp = Math.round(Math.max(...dData.temps));
      const maxRain = Math.round(Math.max(...dData.rainProb));
      const maxWind = Math.round(Math.max(...dData.windSpeeds));
      const highRisk = maxRain >= 50 || maxWind >= 20;

      return {
        day: labels[idx] || `Day ${idx + 1}`,
        temp: maxTemp,
        rainProb: maxRain,
        windKmh: maxWind,
        sprayRisk: highRisk ? 'High' : 'Low'
      };
    });

    res.json({
      city: data.city?.name || 'Thanjavur Delta Basin',
      forecast
    });
  } catch (err) {
    console.error('Weather Proxy Error:', err.message);
    res.json({
      city: 'Thanjavur Weather Station (Fallback)',
      forecast: [
        { day: 'Day 1 (Today)', temp: 32, rainProb: 10, windKmh: 12, sprayRisk: 'Low' },
        { day: 'Day 2', temp: 31, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
        { day: 'Day 3', temp: 28, rainProb: 70, windKmh: 22, sprayRisk: 'High' },
        { day: 'Day 4', temp: 27, rainProb: 60, windKmh: 18, sprayRisk: 'High' },
        { day: 'Day 5', temp: 30, rainProb: 15, windKmh: 11, sprayRisk: 'Low' }
      ]
    });
  }
});

// 3. User Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { contactInfo, password, lang } = req.body;
    if (!contactInfo || !password) {
      return res.status(400).json({ error: 'Contact and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE contact = ?', [contactInfo]);
    if (rows.length > 0) {
      const user = rows[0];
      if (user.password === password) {
        return res.json({
          user: { id: user.id, contact: user.contact, name: user.name || user.contact }
        });
      }
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Auto-register new farmer account
    const [result] = await pool.query(
      'INSERT INTO users (contact, password, name, preferred_lang) VALUES (?, ?, ?, ?)',
      [contactInfo, password, contactInfo.split('@')[0], lang || 'en']
    );

    res.json({
      user: { id: result.insertId, contact: contactInfo, name: contactInfo.split('@')[0] }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 4. Save Blueprint to History
app.post('/api/history/save', async (req, res) => {
  try {
    const { userId, primaryCrop, intercrop, season, soilType, waterStatus } = req.body;
    if (!userId || !primaryCrop) {
      return res.status(400).json({ error: 'Missing required history fields' });
    }

    await pool.query(
      'INSERT INTO crop_history (user_id, primary_crop, intercrop, season, soil_type, water_status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, primaryCrop, intercrop, season, soilType, waterStatus]
    );

    res.json({ success: true, message: 'Plan saved successfully' });
  } catch (err) {
    console.error('History save error:', err);
    res.status(500).json({ error: 'Failed to save blueprint' });
  }
});

// 5. Retrieve User History
app.get('/api/history/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM crop_history WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 6. Delete History Record
app.delete('/api/history/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM crop_history WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    console.error('History delete error:', err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.listen(PORT, () => {
  console.log(`🌾 AgriCompanion Backend running on port ${PORT}`);
});