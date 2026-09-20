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

    // Safe column migrations in case user_history pre-existed with older columns
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

// Helper: Normalize incoming crop keys
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

// 1. User Authentication (Login & Auto-Register)
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

// 2. Comprehensive Agronomic & Intercropping Recommendation Endpoint
app.post('/api/recommend', async (req, res) => {
  const { primaryCropKey, season = '', soilType = '', waterStatus = '', lang = 'en' } = req.body;

  try {
    const langCol = (lang === 'ta' || lang === 'hi') ? `_${lang}` : '_en';
    const normalizedKey = normalizeCropKey(primaryCropKey);

    // A. Primary Crop Details
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
        avgYield: parseFloat(c.avg_yield_per_acre || 18.0),
        safeMoisturePct: parseFloat(c.safe_moisture_pct || 12.0),
        ambientShelfLifeMonths: c.ambient_shelf_life_months || 6,
        coldShelfLifeMonths: c.cold_shelf_life_months || 18
      };
    } else {
      primaryCrop = {
        key: primaryCropKey,
        name: primaryCropKey,
        harvestDuration: '3 - 5 Months',
        avgYield: 22.0,
        safeMoisturePct: 13.0,
        ambientShelfLifeMonths: 6,
        coldShelfLifeMonths: 12
      };
    }

    const matchedCropKey = crops.length > 0 ? crops[0].crop_key : primaryCropKey;

    // B. Mandi Rates & MSP
    let marketData = {
      pricePerQuintal: 2300.00,
      officialMsp: 2300.00,
      lastUpdated: '2024-06-19'
    };
    try {
      const [prices] = await db.query(
        `SELECT * FROM market_prices WHERE crop_key = ? OR crop_key = ? LIMIT 1`,
        [matchedCropKey, normalizedKey]
      );
      if (prices.length > 0) {
        const p = prices[0];
        marketData = {
          pricePerQuintal: parseFloat(p.price_per_quintal || p.price || p.official_msp || 2300),
          officialMsp: parseFloat(p.official_msp || p.price_per_quintal || 2300),
          lastUpdated: p.last_updated ? new Date(p.last_updated).toISOString().slice(0, 10) : '2024-06-19'
        };
      }
    } catch (err) {
      console.warn('Price query fallback used:', err.message);
    }

    // C. AI Intercrop Decision Matrix Scoring & Fallback
    let intercrop = null;
    try {
      let [candidateRules] = await db.query(
        `SELECT * FROM intercrop_rules WHERE primary_crop_key = ? OR crop_key = ? OR primary_crop_key = ?`,
        [matchedCropKey, matchedCropKey, normalizedKey]
      );

      if (!candidateRules || candidateRules.length === 0) {
        const [anyRules] = await db.query(`SELECT * FROM intercrop_rules LIMIT 5`);
        candidateRules = anyRules;
      }

      if (candidateRules && candidateRules.length > 0) {
        const safeReqSeason = String(season || '').toLowerCase();
        const safeReqSoil = String(soilType || '').toLowerCase();
        const safeReqWater = String(waterStatus || '').toLowerCase();

        const scoredCandidates = candidateRules.map(rule => {
          let score = 0;
          const rSeason = String(rule.season || '').toLowerCase();
          const rSoil = String(rule.soil_type || '').toLowerCase();
          const rWater = String(rule.water_status || '').toLowerCase();

          if (rSeason && safeReqSeason && (rSeason === safeReqSeason || rSeason.includes(safeReqSeason) || safeReqSeason.includes(rSeason))) {
            score += 20;
          }
          if (rSoil && safeReqSoil && (rSoil === safeReqSoil || rSoil.includes(safeReqSoil) || safeReqSoil.includes(rSoil))) {
            score += 30;
          } else if (safeReqSoil.includes('loam') || rSoil.includes('loam')) {
            score += 15;
          }
          if (rWater && safeReqWater && (rWater === safeReqWater || rWater.includes(safeReqWater) || safeReqWater.includes(rWater))) {
            score += 30;
          } else if (safeReqWater.includes('medium')) {
            score += 15;
          }

          const lerVal = parseFloat(rule.ler_score || 1.25);
          score += Math.min((lerVal - 1.0) * 100, 40);

          return { rule, score };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        const bestMatch = scoredCandidates[0].rule;
        const targetIntercropKey = bestMatch.intercrop_key || bestMatch.companion_crop || 'Cowpea';

        let intercropName = targetIntercropKey;
        let intercropDuration = '60 - 75 Days';
        let companionPostHarvest = { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 };

        const [icCrops] = await db.query(
          `SELECT * FROM crops WHERE crop_key = ? OR name_en = ? LIMIT 1`,
          [targetIntercropKey, targetIntercropKey]
        );
        if (icCrops.length > 0) {
          intercropName = icCrops[0][`name${langCol}`] || icCrops[0].name_en || targetIntercropKey;
          intercropDuration = icCrops[0].harvest_duration || intercropDuration;
          companionPostHarvest = {
            safeMoisturePct: parseFloat(icCrops[0].safe_moisture_pct || 10.0),
            ambientMonths: icCrops[0].ambient_shelf_life_months || 6,
            coldMonths: icCrops[0].cold_shelf_life_months || 18
          };
        }

        intercrop = {
          key: targetIntercropKey,
          name: intercropName,
          harvestDuration: intercropDuration,
          rowRatio: bestMatch.row_ratio || '2:1',
          spacing: bestMatch.spacing_cm || '30 cm x 10 cm',
          nitrogenFixed: bestMatch.nitrogen_fixed_kg_ha || 25,
          lerScore: parseFloat(bestMatch.ler_score || 1.3),
          sowingOffset: bestMatch.sowing_offset || 'Simultaneous on Day 0',
          rootZoneSynergy: bestMatch.root_zone_synergy || 'Deep taproot + Shallow fibrous root system',
          reasoning: bestMatch[`reasoning${langCol}`] || bestMatch.reasoning_en || 'Atmospheric nitrogen fixation and weed suppression synergy.',
          postHarvest: companionPostHarvest
        };
      }
    } catch (err) {
      console.warn('Intercrop decision warning:', err.message);
    }

    // Fallback if database table yields no rules
    if (!intercrop) {
      const fallbackCompanions = {
        maize: {
          name: 'Cowpea (Lobia)',
          key: 'cowpea',
          ratio: '2:1',
          ler: 1.32,
          nitro: 35,
          spacing: '30 cm x 10 cm',
          reasoning: 'Cowpea provides ground cover, suppresses weed emergence, and fixes atmospheric nitrogen to meet the high nutrient demand of maize.'
        },
        paddy: {
          name: 'Azolla / Green Gram',
          key: 'greengram',
          ratio: 'Border / Bund Planting',
          ler: 1.25,
          nitro: 40,
          spacing: '20 cm x 10 cm on bunds',
          reasoning: 'Bio-fertilizing nitrogen fixer that stabilizes field bunds and prevents weed establishment without interfering with flooded paddy basins.'
        },
        cotton: {
          name: 'Black Gram (Urad)',
          key: 'blackgram',
          ratio: '1:2',
          ler: 1.28,
          nitro: 30,
          spacing: '30 cm x 10 cm',
          reasoning: 'Short-duration legume provides quick early-stage canopy cover before cotton branches out, reducing water runoff and weed competition.'
        },
        groundnut: {
          name: 'Pigeon Pea (Arhar/Tur)',
          key: 'pigeonpea',
          ratio: '6:1',
          ler: 1.35,
          nitro: 45,
          spacing: '60 cm x 15 cm',
          reasoning: 'Deep root system extracts nutrients from lower subsoil strata, complementing shallow groundnut root structures.'
        }
      };

      const defaultChoice = fallbackCompanions[normalizedKey] || fallbackCompanions.maize;

      intercrop = {
        key: defaultChoice.key,
        name: defaultChoice.name,
        harvestDuration: '65 - 75 Days',
        rowRatio: defaultChoice.ratio,
        spacing: defaultChoice.spacing,
        nitrogenFixed: defaultChoice.nitro,
        lerScore: defaultChoice.ler,
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot + Shallow fibrous root system',
        reasoning: defaultChoice.reasoning,
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      };
    }

    // D. Pest Management & Safety Protocol
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
      intercrop,
      pests
    });

  } catch (err) {
    console.error('Fatal /api/recommend error:', err);
    res.status(500).json({ error: 'Database execution failed: ' + err.message });
  }
});

// 3. Farmer History Plan Persistence
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