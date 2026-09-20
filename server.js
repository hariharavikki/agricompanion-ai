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

// Auto-check and initialize/migrate tables on boot
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

// Helper: 3-tier hierarchy generator with normalized property keys
function getTop3Companions(cropKey, szn, soil, water) {
  const s = String(szn || '').toLowerCase();
  const so = String(soil || '').toLowerCase();
  const w = String(water || '').toLowerCase();

  // 1. MAIZE MATRIX
  if (cropKey === 'maize') {
    if (s.includes('zaid') || w.includes('high')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'greengram',
          name: 'Green Gram (Moong)',
          rowRatio: '1:2 or 2:2',
          spacing: '25 cm x 10 cm',
          lerScore: 1.38,
          nitrogenFixed: 38,
          harvestDuration: '55 - 65 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Shallow root zone complements deep maize taproot',
          reasoning: 'Under summer irrigation (Zaid), fast 60-day Moong captures light between tall maize stalks before peak heat, fixing high soil nitrogen.'
        },
        {
          tier: 'Recommended',
          key: 'cowpea',
          name: 'Cowpea (Lobia)',
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.32,
          nitrogenFixed: 35,
          harvestDuration: '65 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Spreading canopy creates living mulch over topsoil',
          reasoning: 'Provides heavy foliage to suppress summer weeds while offering dual food and fodder harvests.'
        },
        {
          tier: 'Feasible Alternative',
          key: 'blackgram',
          name: 'Black Gram (Urad)',
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.27,
          nitrogenFixed: 30,
          harvestDuration: '70 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Compact root zone with balanced moisture uptake',
          reasoning: 'Stable pulse option with high Mandi liquidity if Green Gram seed availability is constrained.'
        }
      ];
    }
    if (s.includes('rabi')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'frenchbean',
          name: 'French Bean (Rajma)',
          rowRatio: '2:1 Alternate Bed',
          spacing: '30 cm x 15 cm',
          lerScore: 1.34,
          nitrogenFixed: 30,
          harvestDuration: '70 - 80 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Erect cool-season legume architecture',
          reasoning: 'Thrives in crisp winter temperatures, earning high premium market value alongside winter maize.'
        },
        {
          tier: 'Recommended',
          key: 'pea',
          name: 'Field Pea (Matar)',
          rowRatio: '2:2',
          spacing: '30 cm x 10 cm',
          lerScore: 1.30,
          nitrogenFixed: 32,
          harvestDuration: '65 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Light climbing tendrils on lower maize stems',
          reasoning: 'Rapid cold-tolerant green pod harvesting provides quick early cash flow for the farmer.'
        },
        {
          tier: 'Feasible Alternative',
          key: 'chickpea',
          name: 'Chickpea (Gram)',
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          lerScore: 1.25,
          nitrogenFixed: 28,
          harvestDuration: '85 - 100 Days',
          sowingOffset: 'Day 0 with seed treatment',
          rootZoneSynergy: 'Deep winter taproots mining subsoil phosphorus',
          reasoning: 'Durable winter legume with very low pest overlap with maize.'
        }
      ];
    }
    return [
      {
        tier: 'Highly Recommended',
        key: 'cowpea',
        name: 'Cowpea (Lobia)',
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.32,
        nitrogenFixed: 35,
        harvestDuration: '65 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot + Shallow fibrous root system',
        reasoning: 'Best monsoon cover: rapid vegetative canopy suffocates weeds and fixes biological nitrogen during maize vegetative burst.'
      },
      {
        tier: 'Recommended',
        key: 'soybean',
        name: 'Soybean',
        rowRatio: '2:2 or 2:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.29,
        nitrogenFixed: 36,
        harvestDuration: '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Vertical erect profile reducing wind lodging',
        reasoning: 'Substantial commercial oilseed value with robust atmospheric nitrogen contribution in loamy and clay soils.'
      },
      {
        tier: 'Feasible Alternative',
        key: 'horsegram',
        name: 'Horse Gram (Kulthi)',
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.26,
        nitrogenFixed: 28,
        harvestDuration: '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Fibrous soil-binding mulch layer',
        reasoning: 'Extreme drought insurance; thrives even if monsoon breaks occur or in nutrient-deficient sandy soils.'
      }
    ];
  }

  // 2. COTTON MATRIX
  if (cropKey === 'cotton') {
    if (so.includes('black')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'blackgram',
          name: 'Black Gram (Urad) / Marigold',
          rowRatio: '1:2',
          spacing: '30 cm x 10 cm',
          lerScore: 1.31,
          nitrogenFixed: 32,
          harvestDuration: '70 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Shallow pulse zone utilizing moisture between 90cm cotton rows',
          reasoning: 'Deep Vertisols (Black soil) hold moisture to finish short Black Gram, while Marigold borders lure away American bollworms.'
        },
        {
          tier: 'Recommended',
          key: 'greengram',
          name: 'Green Gram (Moong)',
          rowRatio: '1:2',
          spacing: '25 cm x 10 cm',
          lerScore: 1.28,
          nitrogenFixed: 30,
          harvestDuration: '60 - 65 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Quick maturity before cotton branches wide',
          reasoning: 'Harvested before cotton reaches peak vegetative branching, ensuring zero competition for sunlight.'
        },
        {
          tier: 'Feasible Alternative',
          key: 'soybean',
          name: 'Soybean',
          rowRatio: '1:2 Strip Cropping',
          spacing: '30 cm x 10 cm',
          lerScore: 1.26,
          nitrogenFixed: 34,
          harvestDuration: '80 - 90 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Mid-tier canopy cover protecting wide ridges',
          reasoning: 'Generates early cash income before cotton picking starts; requires timely picking of soybean pods.'
        }
      ];
    }
    return [
      {
        tier: 'Highly Recommended',
        key: 'clusterbean',
        name: 'Cluster Bean (Guar)',
        rowRatio: '1:1',
        spacing: '45 cm x 15 cm',
        lerScore: 1.24,
        nitrogenFixed: 25,
        harvestDuration: '85 - 95 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Extreme osmotic adjustment for dry soils',
        reasoning: 'Outstanding drought and heat resilience; deep taproot extracts nutrients without invading wide cotton root balls.'
      },
      {
        tier: 'Recommended',
        key: 'blackgram',
        name: 'Black Gram (Urad)',
        rowRatio: '1:2',
        spacing: '30 cm x 10 cm',
        lerScore: 1.28,
        nitrogenFixed: 30,
        harvestDuration: '70 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Low sprawling canopy reducing soil crusting',
        reasoning: 'Proven commercial pulse intercrop that provides weed control during cotton’s slow juvenile phase.'
      },
      {
        tier: 'Feasible Alternative',
        key: 'cowpea',
        name: 'Cowpea (Trap / Cover)',
        rowRatio: '1:1 Border',
        spacing: '30 cm x 10 cm',
        lerScore: 1.22,
        nitrogenFixed: 32,
        harvestDuration: '65 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Aggressive topsoil shading',
        reasoning: 'Effective cover against erosion, but requires pruning if vegetative vines begin climbing young cotton stalks.'
      }
    ];
  }

  // 3. PADDY / RICE MATRIX
  if (cropKey === 'paddy') {
    if (w.includes('high')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'azolla',
          name: 'Azolla Pinnata (Biofertilizer Mat)',
          rowRatio: 'Inoculated Floating Blanket',
          spacing: 'Continuous Biomass Layer',
          lerScore: 1.27,
          nitrogenFixed: 45,
          harvestDuration: 'Living Water Blanket',
          sowingOffset: 'Inoculated on Day 7 after transplanting',
          rootZoneSynergy: 'Floating aquatic symbiosis in standing water',
          reasoning: 'Multiplies every 5 days on floodwaters, fixing up to 45 kg N/ha, smothering aquatic weeds, and lowering root temperatures.'
        },
        {
          tier: 'Recommended',
          key: 'greengram',
          name: 'Green Gram (Paddy Bund Intercrop)',
          rowRatio: 'Bund & Perimeter Rows',
          spacing: '20 cm x 10 cm on bunds',
          lerScore: 1.22,
          nitrogenFixed: 25,
          harvestDuration: '60 - 65 Days',
          sowingOffset: 'Day 0 along field bunds',
          rootZoneSynergy: 'Perimeter pulse taking advantage of non-flooded edges',
          reasoning: 'Converts uncultivated bund margins into productive pulse ground without interfering with flooded basin paddy.'
        },
        {
          tier: 'Feasible Alternative',
          key: 'blackgram',
          name: 'Black Gram (Relay / Bund)',
          rowRatio: 'Bund or Relay Sowing',
          spacing: '20 cm x 10 cm on bunds',
          lerScore: 1.18,
          nitrogenFixed: 22,
          harvestDuration: '65 - 70 Days',
          sowingOffset: 'Sown on bunds or broadcast into relay moisture',
          rootZoneSynergy: 'Utilizes residual soil moisture profile',
          reasoning: 'Traditional rice-fallow relay companion that sprouts in residual mud moisture before paddy harvest.'
        }
      ];
    }
    return [
      {
        tier: 'Highly Recommended',
        key: 'greengram',
        name: 'Green Gram (Paddy Bund Intercrop)',
        rowRatio: 'Bund & Perimeter Rows',
        spacing: '20 cm x 10 cm on bunds',
        lerScore: 1.22,
        nitrogenFixed: 25,
        harvestDuration: '60 - 65 Days',
        sowingOffset: 'Day 0 along field bunds',
        rootZoneSynergy: 'Perimeter root zone without flooding competition',
        reasoning: 'Monetizes raised bunds and binds bund soil against erosion under partial irrigation regimes.'
      },
      {
        tier: 'Recommended',
        key: 'blackgram',
        name: 'Black Gram (Urad)',
        rowRatio: 'Bund Rows',
        spacing: '25 cm x 10 cm on bunds',
        lerScore: 1.20,
        nitrogenFixed: 22,
        harvestDuration: '70 - 75 Days',
        sowingOffset: 'Day 0 along field bunds',
        rootZoneSynergy: 'Low canopy stabilizing farm path edges',
        reasoning: 'Resilient bund legume that thrives on splash moisture and minimal management.'
      },
      {
        tier: 'Feasible Alternative',
        key: 'sesbania',
        name: 'Sesbania (Dhaincha Bund Barrier)',
        rowRatio: 'Peripheral Windbreak',
        spacing: '30 cm x 15 cm on borders',
        lerScore: 1.16,
        nitrogenFixed: 40,
        harvestDuration: 'Green Manure / Border',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep nitrogen nodules on bund perimeters',
        reasoning: 'Excellent green manure boundary that buffers strong winds and can be lopped into paddy basins as bio-fertilizer.'
      }
    ];
  }

  // 4. GROUNDNUT MATRIX
  if (cropKey === 'groundnut') {
    if (w.includes('low') || so.includes('sandy')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'pearlmillet',
          name: 'Pearl Millet (Bajra) Windbreak',
          rowRatio: '6:1 or 8:1 Border Rows',
          spacing: '45 cm x 15 cm',
          lerScore: 1.28,
          nitrogenFixed: 0,
          harvestDuration: '80 - 85 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Tall perimeter micro-climate barrier',
          reasoning: 'Tall Bajra border rows deflect hot desiccating winds in sandy zones, conserving topsoil humidity for groundnut pegging.'
        },
        {
          tier: 'Recommended',
          key: 'pigeonpea',
          name: 'Pigeon Pea (Arhar / Tur)',
          rowRatio: '6:1 or 8:1',
          spacing: '60 cm x 15 cm',
          lerScore: 1.34,
          nitrogenFixed: 40,
          harvestDuration: '130 - 150 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Deep taproot foraging lower subsoil water',
          reasoning: 'Pigeon Pea taproots tap deep moisture reserves without competing with shallow groundnut pods.'
        },
        {
          tier: 'Feasible Alternative',
          key: 'sesame',
          name: 'Sesame (Til)',
          rowRatio: '4:1 or Border Rows',
          spacing: '30 cm x 10 cm',
          lerScore: 1.21,
          nitrogenFixed: 0,
          harvestDuration: '75 - 85 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Low water requirement oilseed canopy',
          reasoning: 'Drought-tolerant dual oilseed pairing that thrives in sandy loam under low water availability.'
        }
      ];
    }
    return [
      {
        tier: 'Highly Recommended',
        key: 'pigeonpea',
        name: 'Pigeon Pea (Arhar / Tur)',
        rowRatio: '6:1',
        spacing: '60 cm x 15 cm',
        lerScore: 1.36,
        nitrogenFixed: 42,
        harvestDuration: '130 - 150 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot (1.5m) + Shallow groundnut peg layer (20cm)',
        reasoning: 'Classic ICAR pairing: groundnut harvests in 105 days, leaving Pigeon Pea to exploit the full field and late season sunlight.'
      },
      {
        tier: 'Recommended',
        key: 'castor',
        name: 'Castor (Wide Strip Companion)',
        rowRatio: '8:1',
        spacing: '90 cm x 30 cm',
        lerScore: 1.30,
        nitrogenFixed: 0,
        harvestDuration: '140 - 160 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot with vertical canopy branching',
        reasoning: 'Castor generates heavy secondary commercial returns and acts as an effective trap crop for Spodoptera caterpillars.'
      },
      {
        tier: 'Feasible Alternative',
        key: 'blackgram',
        name: 'Black Gram (Urad)',
        rowRatio: '4:1',
        spacing: '30 cm x 10 cm',
        lerScore: 1.23,
        nitrogenFixed: 28,
        harvestDuration: '65 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Fast pulse harvest before groundnut canopy locks',
        reasoning: 'Short-duration pulse that gives an early grain harvest before groundnut pods mature.'
      }
    ];
  }

  return [
    {
      tier: 'Highly Recommended',
      key: 'cowpea',
      name: 'Cowpea (Universal Companion)',
      rowRatio: '2:1',
      spacing: '30 cm x 10 cm',
      lerScore: 1.30,
      nitrogenFixed: 32,
      harvestDuration: '65 - 75 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Deep taproot + Shallow fibrous root system',
      reasoning: 'Dependable biological nitrogen fixation, weed suppression, and soil cover.'
    },
    {
      tier: 'Recommended',
      key: 'greengram',
      name: 'Green Gram (Moong)',
      rowRatio: '2:1',
      spacing: '25 cm x 10 cm',
      lerScore: 1.25,
      nitrogenFixed: 28,
      harvestDuration: '60 - 65 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Rapid pulse canopy development',
      reasoning: 'Fast-maturing pulse that clears early and enriches topsoil.'
    },
    {
      tier: 'Feasible Alternative',
      key: 'blackgram',
      name: 'Black Gram (Urad)',
      rowRatio: '2:1',
      spacing: '30 cm x 10 cm',
      lerScore: 1.20,
      nitrogenFixed: 25,
      harvestDuration: '70 - 75 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Compact root architecture',
      reasoning: 'Stable cash legume with modest moisture requirements.'
    }
  ];
}

// 2. Comprehensive Agronomic & Intercropping Recommendation Endpoint
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
      primaryCrop = {
        key: primaryCropKey,
        name: primaryCropKey,
        harvestDuration: '3 - 5 Months',
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

    const companionList = getTop3Companions(normalizedKey, season, soilType, waterStatus).map(comp => ({
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

// 3. History Persistence Endpoints
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