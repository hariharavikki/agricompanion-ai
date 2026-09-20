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

    // C. AI Intercrop Decision Matrix: Database Search with Strict Multi-Variable Scoring
    let intercrop = null;
    try {
      let [candidateRules] = await db.query(
        `SELECT * FROM intercrop_rules WHERE primary_crop_key = ? OR crop_key = ? OR primary_crop_key = ?`,
        [matchedCropKey, matchedCropKey, normalizedKey]
      );

      if (candidateRules && candidateRules.length > 1) {
        const safeReqSeason = String(season || '').toLowerCase();
        const safeReqSoil = String(soilType || '').toLowerCase();
        const safeReqWater = String(waterStatus || '').toLowerCase();

        const scoredCandidates = candidateRules.map(rule => {
          let score = 0;
          const rSeason = String(rule.season || '').toLowerCase();
          const rSoil = String(rule.soil_type || '').toLowerCase();
          const rWater = String(rule.water_status || '').toLowerCase();

          // Exact variable matching
          if (rSeason && safeReqSeason && (rSeason === safeReqSeason || rSeason.includes(safeReqSeason))) {
            score += 40;
          }
          if (rSoil && safeReqSoil && (rSoil === safeReqSoil || rSoil.includes(safeReqSoil))) {
            score += 35;
          }
          if (rWater && safeReqWater && (rWater === safeReqWater || rWater.includes(safeReqWater))) {
            score += 35;
          }

          const lerVal = parseFloat(rule.ler_score || 1.25);
          score += Math.min((lerVal - 1.0) * 50, 30);

          return { rule, score };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        
        // Only accept if there is a meaningful correlation score
        if (scoredCandidates[0].score >= 35) {
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
      }
    } catch (err) {
      console.warn('Intercrop database scoring error:', err.message);
    }

    // D. Dynamic Multi-Variable Agronomic Decision Engine (Active when DB lacks specific matrix rules)
    if (!intercrop) {
      const getDynamicCompanion = (crop, szn, soil, water) => {
        const s = String(szn).toLowerCase();
        const so = String(soil).toLowerCase();
        const w = String(water).toLowerCase();

        // 1. MAIZE MATRIX
        if (crop === 'maize') {
          if (s.includes('zaid') || w.includes('high')) {
            return {
              key: 'greengram',
              name: 'Green Gram (Moong - Summer Special)',
              ratio: '1:2 or 2:2',
              spacing: '25 cm x 10 cm',
              ler: 1.38,
              nitro: 38,
              duration: '55 - 65 Days',
              reasoning: 'Under summer irrigation (Zaid), fast-maturing Green Gram establishes canopy before high heat, intercepting light between maize rows without draining subsoil reserves.'
            };
          }
          if (s.includes('rabi')) {
            return {
              key: 'frenchbean',
              name: 'French Bean (Rajma)',
              ratio: '2:1 Alternate Bed',
              spacing: '30 cm x 15 cm',
              ler: 1.34,
              nitro: 30,
              duration: '70 - 80 Days',
              reasoning: 'Winter (Rabi) temperatures are optimal for French Beans, generating superior market value per acre while matching the lower water requirements of winter maize.'
            };
          }
          if (w.includes('low') || so.includes('sandy')) {
            return {
              key: 'horsegram',
              name: 'Horse Gram (Kulthi)',
              ratio: '2:1',
              spacing: '30 cm x 10 cm',
              ler: 1.26,
              nitro: 28,
              duration: '80 - 90 Days',
              reasoning: 'In rainfed or sandy drought-prone profiles, Horse Gram develops deep sub-surface root tapestries that conserve soil moisture and prevent surface crusting.'
            };
          }
          return {
            key: 'cowpea',
            name: 'Cowpea (Lobia)',
            ratio: '2:1',
            spacing: '30 cm x 10 cm',
            ler: 1.32,
            nitro: 35,
            duration: '65 - 75 Days',
            reasoning: 'Standard Kharif monsoon pairing: rapid early vine growth smothers aggressive weeds and nodulates atmospheric nitrogen during maize peak vegetative expansion.'
          };
        }

        // 2. COTTON MATRIX
        if (crop === 'cotton') {
          if (so.includes('black')) {
            return {
              key: 'blackgram',
              name: 'Black Gram (Urad) / Marigold',
              ratio: '1:2',
              spacing: '30 cm x 10 cm',
              ler: 1.31,
              nitro: 32,
              duration: '70 - 75 Days',
              reasoning: 'Deep Vertisols (Black soil) retain moisture to support short-cycle Black Gram between wide cotton rows, with Marigold boundaries trapping American bollworm moths.'
            };
          }
          if (w.includes('low') || so.includes('sandy')) {
            return {
              key: 'clusterbean',
              name: 'Cluster Bean (Guar)',
              ratio: '1:1',
              spacing: '45 cm x 15 cm',
              ler: 1.24,
              nitro: 25,
              duration: '85 - 95 Days',
              reasoning: 'Guar exhibits extreme drought hardiness and deep osmotic adjustment, thriving alongside cotton in coarse or moisture-stressed topsoils.'
            };
          }
          return {
            key: 'soybean',
            name: 'Soybean',
            ratio: '1:2 Strip Cropping',
            spacing: '30 cm x 10 cm',
            ler: 1.29,
            nitro: 35,
            duration: '80 - 90 Days',
            reasoning: 'Erect soybean cultivars form a biological barrier against soil erosion during heavy rains and harvest before peak cotton boll maturation.'
          };
        }

        // 3. PADDY / RICE MATRIX
        if (crop === 'paddy') {
          if (w.includes('high')) {
            return {
              key: 'azolla',
              name: 'Azolla Pinnata (Dual-Culture Biofertilizer)',
              ratio: 'Floating Water Inoculation',
              spacing: 'Continuous Floating Biomass',
              ler: 1.27,
              nitro: 45,
              duration: 'Living Water Blanket',
              reasoning: 'Under standing water regimes, floating Azolla doubles biomass every 5 days, fixing up to 45 kg N/ha and lowering floodwater temperatures by 2-3°C.'
            };
          }
          return {
            key: 'greengram',
            name: 'Green Gram (Paddy Bund Planting)',
            ratio: 'Bund & Perimeter Rows',
            spacing: '20 cm x 10 cm on bunds',
            ler: 1.22,
            nitro: 25,
            duration: '60 - 65 Days',
            reasoning: 'Planted on peripheral bunds to exploit non-flooded edges, providing supplemental pulse harvest without competing for root basin area.'
          };
        }

        // 4. GROUNDNUT MATRIX
        if (crop === 'groundnut') {
          if (w.includes('low') || so.includes('sandy')) {
            return {
              key: 'pearlmillet',
              name: 'Pearl Millet (Bajra) Shelterbelt',
              ratio: '6:1 Border Barrier',
              spacing: '45 cm x 15 cm',
              ler: 1.28,
              nitro: 0,
              duration: '80 - 85 Days',
              reasoning: 'Tall Pearl Millet borders deflect hot drying winds in arid sandy zones, maintaining humidity around groundnut peg entry zones.'
            };
          }
          return {
            key: 'pigeonpea',
            name: 'Pigeon Pea (Arhar / Tur)',
            ratio: '6:1',
            spacing: '60 cm x 15 cm',
            ler: 1.36,
            nitro: 42,
            duration: '130 - 150 Days',
            reasoning: 'Deep taproot systems forage nutrients down to 1.5 meters, while groundnut roots occupy the top 20cm, eliminating nutrient competition.'
          };
        }

        return {
          key: 'cowpea',
          name: 'Cowpea (Universal Companion)',
          ratio: '2:1',
          spacing: '30 cm x 10 cm',
          ler: 1.25,
          nitro: 30,
          duration: '65 - 75 Days',
          reasoning: 'General grain-legume synergy providing nitrogen credits and weed reduction.'
        };
      };

      const matchedChoice = getDynamicCompanion(normalizedKey, season, soilType, waterStatus);

      intercrop = {
        key: matchedChoice.key,
        name: matchedChoice.name,
        harvestDuration: matchedChoice.duration,
        rowRatio: matchedChoice.ratio,
        spacing: matchedChoice.spacing,
        nitrogenFixed: matchedChoice.nitro,
        lerScore: matchedChoice.ler,
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot + Shallow fibrous root zone partitioning',
        reasoning: matchedChoice.reasoning,
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      };
    }

    // E. Pest Management & Safety Protocol
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