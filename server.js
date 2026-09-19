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
  database: process.env.DB_NAME || 'agri',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-check tables on boot
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
    conn.release();
    console.log('Database connected: Users table ready.');
  } catch (err) {
    console.error('DB Init Error:', err.message);
  }
})();

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
  const { primaryCropKey, season, soilType, waterStatus, lang = 'en' } = req.body;

  try {
    const langCol = (lang === 'ta' || lang === 'hi') ? `_${lang}` : '_en';

    // A. Primary Crop Details & Post-Harvest Storage Specs
    let primaryCrop = null;
    const [crops] = await db.query(
      `SELECT * FROM crops WHERE crop_key = ? LIMIT 1`,
      [primaryCropKey]
    );

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
      return res.status(404).json({ error: 'Primary crop not found' });
    }

    // B. Mandi Rates & Official Government MSP
    let marketData = {
      pricePerQuintal: 2225.00,
      officialMsp: 2225.00,
      lastUpdated: '2024-06-19'
    };
    try {
      const [prices] = await db.query(
        `SELECT price_per_quintal, official_msp, DATE_FORMAT(last_updated, '%Y-%m-%d') as last_updated 
         FROM market_prices WHERE crop_key = ? LIMIT 1`,
        [primaryCropKey]
      );
      if (prices.length > 0) {
        marketData = {
          pricePerQuintal: parseFloat(prices[0].price_per_quintal),
          officialMsp: parseFloat(prices[0].official_msp),
          lastUpdated: prices[0].last_updated
        };
      }
    } catch (err) {
      console.warn('Price query fallback used:', err.message);
    }

    // C. AI Intercrop Decision Matrix Scoring
    let intercrop = null;
    try {
      const [candidateRules] = await db.query(
        `SELECT * FROM intercrop_rules WHERE primary_crop_key = ?`,
        [primaryCropKey]
      );

      if (candidateRules.length > 0) {
        const scoredCandidates = candidateRules.map(rule => {
          let score = 0;
          if (rule.season.toLowerCase() === season.toLowerCase()) score += 20;

          if (rule.soil_type.toLowerCase() === soilType.toLowerCase()) {
            score += 30;
          } else if (soilType === 'Loamy' || rule.soil_type === 'Loamy') {
            score += 15;
          }

          if (rule.water_status.toLowerCase() === waterStatus.toLowerCase()) {
            score += 30;
          } else if (waterStatus === 'Medium') {
            score += 15;
          }

          const lerContribution = (parseFloat(rule.ler_score || 1.2) - 1.0) * 100;
          score += Math.min(lerContribution, 40);

          return { rule, score };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        const bestMatch = scoredCandidates[0].rule;

        let intercropName = bestMatch.intercrop_key;
        let intercropDuration = '60 - 75 Days';
        let companionPostHarvest = { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 };

        const [icCrops] = await db.query(
          `SELECT * FROM crops WHERE crop_key = ? LIMIT 1`,
          [bestMatch.intercrop_key]
        );
        if (icCrops.length > 0) {
          intercropName = icCrops[0][`name${langCol}`] || icCrops[0].name_en || bestMatch.intercrop_key;
          intercropDuration = icCrops[0].harvest_duration || intercropDuration;
          companionPostHarvest = {
            safeMoisturePct: parseFloat(icCrops[0].safe_moisture_pct || 10.0),
            ambientMonths: icCrops[0].ambient_shelf_life_months || 6,
            coldMonths: icCrops[0].cold_shelf_life_months || 18
          };
        }

        intercrop = {
          key: bestMatch.intercrop_key,
          name: intercropName,
          harvestDuration: intercropDuration,
          rowRatio: bestMatch.row_ratio || '2:1',
          spacing: bestMatch.spacing_cm || 'Standard Spacing',
          nitrogenFixed: bestMatch.nitrogen_fixed_kg_ha || 0,
          lerScore: parseFloat(bestMatch.ler_score || 1.25),
          sowingOffset: bestMatch.sowing_offset || 'Simultaneous on Day 0',
          rootZoneSynergy: bestMatch.root_zone_synergy || 'Deep + Shallow Stratification',
          reasoning: bestMatch[`reasoning${langCol}`] || bestMatch.reasoning_en || 'Synergistic intercropping.',
          postHarvest: companionPostHarvest
        };
      }
    } catch (err) {
      console.warn('Intercrop decision warning:', err.message);
    }

    // D. Pest Management & Safety Protocol
    let pests = [];
    try {
      const [pestRows] = await db.query(
        `SELECT DISTINCT pest_name_en, pest_name_ta, pest_name_hi,
                cultural_control_en, cultural_control_ta, cultural_control_hi,
                bio_control_en, bio_control_ta, bio_control_hi,
                chemical_last_resort_en, chemical_last_resort_ta, chemical_last_resort_hi,
                toxicity_level, phi_days
         FROM pest_controls WHERE crop_key = ?`,
        [primaryCropKey]
      );

      pests = pestRows.map(p => ({
        pestName: p[`pest_name${langCol}`] || p.pest_name_en || 'Field Pest',
        cultural: p[`cultural_control${langCol}`] || p.cultural_control_en || 'Standard crop rotation',
        bio: p[`bio_control${langCol}`] || p.bio_control_en || 'Neem oil spray (5ml/L)',
        chemical: p[`chemical_last_resort${langCol}`] || p.chemical_last_resort_en || 'Approved targeted chemical',
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
    await db.query(
      `INSERT INTO user_history (user_id, primary_crop, intercrop, season, soil_type, water_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, primaryCrop, intercrop || 'none', season, soilType, waterStatus]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in /api/history/save:', err);
    res.status(500).json({ error: 'Could not save blueprint' });
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
    res.status(500).json({ error: 'Could not fetch history' });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM user_history WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting history entry:', err);
    res.status(500).json({ error: 'Could not delete entry' });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgriCompanion AI Engine operational at http://localhost:${PORT}`);
});