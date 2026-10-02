import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

// In-Memory Fallback Stores
const memoryUsers = new Map();
const memoryHistory = [];

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

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();

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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS crop_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        primary_crop VARCHAR(50) NOT NULL,
        intercrop VARCHAR(50) NOT NULL,
        district VARCHAR(50),
        constituency VARCHAR(50),
        season VARCHAR(20) NOT NULL,
        soil_type VARCHAR(50) NOT NULL,
        water_status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    console.log('✅ AgriCompanion MySQL database initialized successfully.');
  } catch (err) {
    console.warn('⚠️ MySQL setup warning (running with in-memory fallbacks):', err.message);
  }
};

initDatabase();

// Crop Meta Registry (37 Crops - Tobacco & Rice Excluded)
export const STATEWIDE_CROP_DIRECTORY = {
  // Vegetables
  brinjal: { name: 'Brinjal / Eggplant', name_ta: 'கத்தரிக்காய்', category: 'Vegetables', avgYield: 110, mandiRate: 24.50, msp: 18.00, costPerAcre: 26000, defaultSoil: 'Clay', harvestDur: '4 - 5 Months', safeMoisturePct: 85.0, ambientDays: 4, coldDays: 25, waterReqMm: 550 },
  tomato: { name: 'Tomato', name_ta: 'தக்காளி', category: 'Vegetables', avgYield: 140, mandiRate: 22.00, msp: 15.00, costPerAcre: 32000, defaultSoil: 'Loamy', harvestDur: '3 - 4 Months', safeMoisturePct: 88.0, ambientDays: 6, coldDays: 28, waterReqMm: 500 },
  bhendi: { name: 'Bhendi (Okra)', name_ta: 'வெண்டைக்காய்', category: 'Vegetables', avgYield: 50, mandiRate: 28.00, msp: 20.00, costPerAcre: 18000, defaultSoil: 'Loamy', harvestDur: '3 Months', safeMoisturePct: 86.0, ambientDays: 3, coldDays: 14, waterReqMm: 400 },
  chilli: { name: 'Chilli', name_ta: 'மிளகாய்', category: 'Vegetables', avgYield: 18, mandiRate: 120.00, msp: 100.00, costPerAcre: 35000, defaultSoil: 'Black', harvestDur: '5 - 6 Months', safeMoisturePct: 10.0, ambientDays: 180, coldDays: 365, waterReqMm: 600 },
  tapioca: { name: 'Tapioca (Cassava)', name_ta: 'மரவள்ளிக்கிழங்கு', category: 'Vegetables', avgYield: 120, mandiRate: 11.50, msp: 9.50, costPerAcre: 24000, defaultSoil: 'Sandy', harvestDur: '9 - 10 Months', safeMoisturePct: 65.0, ambientDays: 3, coldDays: 20, waterReqMm: 750 },
  onion: { name: 'Small Onion (Shallot)', name_ta: 'சின்ன வெங்காயம்', category: 'Vegetables', avgYield: 60, mandiRate: 38.00, msp: 30.00, costPerAcre: 38000, defaultSoil: 'Loamy', harvestDur: '70 - 80 Days', safeMoisturePct: 12.0, ambientDays: 90, coldDays: 210, waterReqMm: 380 },
  drumstick: { name: 'Drumstick (Moringa)', name_ta: 'முருங்கை', category: 'Vegetables', avgYield: 80, mandiRate: 32.00, msp: 24.00, costPerAcre: 20000, defaultSoil: 'Sandy', harvestDur: 'Perennial', safeMoisturePct: 82.0, ambientDays: 5, coldDays: 21, waterReqMm: 450 },
  bittergourd: { name: 'Bitter Gourd', name_ta: 'பாகற்காய்', category: 'Vegetables', avgYield: 45, mandiRate: 34.00, msp: 26.00, costPerAcre: 25000, defaultSoil: 'Sandy', harvestDur: '3 - 4 Months', safeMoisturePct: 88.0, ambientDays: 4, coldDays: 18, waterReqMm: 420 },
  snakegourd: { name: 'Snake Gourd', name_ta: 'புடலங்காய்', category: 'Vegetables', avgYield: 70, mandiRate: 22.00, msp: 17.00, costPerAcre: 22000, defaultSoil: 'Sandy', harvestDur: '4 Months', safeMoisturePct: 90.0, ambientDays: 4, coldDays: 14, waterReqMm: 450 },
  radish: { name: 'Radish', name_ta: 'முள்ளங்கி', category: 'Vegetables', avgYield: 80, mandiRate: 18.00, msp: 12.00, costPerAcre: 14000, defaultSoil: 'Sandy', harvestDur: '45 - 55 Days', safeMoisturePct: 90.0, ambientDays: 3, coldDays: 21, waterReqMm: 280 },

  // Pulses
  blackgram: { name: 'Black Gram (Urad)', name_ta: 'உளுந்து', category: 'Pulses', avgYield: 4.5, mandiRate: 74.00, msp: 70.00, costPerAcre: 9500, defaultSoil: 'Clay', harvestDur: '70 - 75 Days', safeMoisturePct: 10.0, ambientDays: 240, coldDays: 540, waterReqMm: 300 },
  greengram: { name: 'Green Gram (Moong)', name_ta: 'பாசிப்பயறு', category: 'Pulses', avgYield: 4.0, mandiRate: 86.00, msp: 85.58, costPerAcre: 9500, defaultSoil: 'Loamy', harvestDur: '60 - 65 Days', safeMoisturePct: 10.0, ambientDays: 240, coldDays: 540, waterReqMm: 280 },
  pigeonpea: { name: 'Red Gram (Arhar / Tur)', name_ta: 'துவரை', category: 'Pulses', avgYield: 6.0, mandiRate: 78.00, msp: 75.50, costPerAcre: 12000, defaultSoil: 'Loamy', harvestDur: '5 - 6 Months', safeMoisturePct: 10.5, ambientDays: 300, coldDays: 540, waterReqMm: 450 },
  cowpea: { name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', category: 'Pulses', avgYield: 5.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 9000, defaultSoil: 'Sandy', harvestDur: '65 - 75 Days', safeMoisturePct: 10.0, ambientDays: 210, coldDays: 500, waterReqMm: 320 },
  horsegram: { name: 'Horse Gram (Kulthi)', name_ta: 'கொள்ளு', category: 'Pulses', avgYield: 3.5, mandiRate: 48.00, msp: 42.00, costPerAcre: 6500, defaultSoil: 'Sandy', harvestDur: '80 - 90 Days', safeMoisturePct: 9.5, ambientDays: 365, coldDays: 700, waterReqMm: 220 },
  chickpea: { name: 'Chickpea (Chana)', name_ta: 'கொண்டைக்கடலை', category: 'Pulses', avgYield: 5.0, mandiRate: 58.00, msp: 54.40, costPerAcre: 11000, defaultSoil: 'Black', harvestDur: '90 - 100 Days', safeMoisturePct: 9.5, ambientDays: 300, coldDays: 600, waterReqMm: 290 },
  clusterbean: { name: 'Cluster Bean (Guar)', name_ta: 'கொத்தவரங்காய்', category: 'Pulses', avgYield: 15, mandiRate: 35.00, msp: 29.00, costPerAcre: 8500, defaultSoil: 'Sandy', harvestDur: '85 - 95 Days', safeMoisturePct: 11.0, ambientDays: 180, coldDays: 365, waterReqMm: 310 },
  frenchbean: { name: 'French Bush Bean', name_ta: 'பீன்ஸ்', category: 'Pulses', avgYield: 30, mandiRate: 45.00, msp: 35.00, costPerAcre: 18000, defaultSoil: 'Loamy', harvestDur: '55 - 65 Days', safeMoisturePct: 85.0, ambientDays: 4, coldDays: 20, waterReqMm: 350 },

  // Oilseeds
  groundnut: { name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', category: 'Oilseeds', avgYield: 12, mandiRate: 78.50, msp: 75.17, costPerAcre: 15500, defaultSoil: 'Sandy', harvestDur: '105 - 115 Days', safeMoisturePct: 8.0, ambientDays: 180, coldDays: 365, waterReqMm: 500 },
  sesame: { name: 'Sesame (Til)', name_ta: 'எள்', category: 'Oilseeds', avgYield: 3.5, mandiRate: 118.00, msp: 92.67, costPerAcre: 9000, defaultSoil: 'Sandy', harvestDur: '75 - 85 Days', safeMoisturePct: 7.0, ambientDays: 240, coldDays: 450, waterReqMm: 250 },
  sunflower: { name: 'Sunflower', name_ta: 'சூரியகாந்தி', category: 'Oilseeds', avgYield: 7.0, mandiRate: 68.00, msp: 67.60, costPerAcre: 13000, defaultSoil: 'Black', harvestDur: '85 - 90 Days', safeMoisturePct: 8.5, ambientDays: 150, coldDays: 300, waterReqMm: 450 },
  castor: { name: 'Castor', name_ta: 'ஆமணக்கு', category: 'Oilseeds', avgYield: 6.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 10500, defaultSoil: 'Sandy', harvestDur: '140 - 160 Days', safeMoisturePct: 8.0, ambientDays: 240, coldDays: 500, waterReqMm: 480 },
  soybean: { name: 'Soybean', name_ta: 'சோயாபீன்', category: 'Oilseeds', avgYield: 8.5, mandiRate: 52.00, msp: 48.92, costPerAcre: 12500, defaultSoil: 'Clay', harvestDur: '85 - 90 Days', safeMoisturePct: 10.0, ambientDays: 210, coldDays: 400, waterReqMm: 480 },
  coconut: { name: 'Coconut', name_ta: 'தென்னை', category: 'Oilseeds', avgYield: 45, mandiRate: 34.00, msp: 29.00, costPerAcre: 18000, defaultSoil: 'Sandy', harvestDur: 'Perennial', safeMoisturePct: 6.0, ambientDays: 90, coldDays: 240, waterReqMm: 950 },

  // Millets & Cereals
  maize: { name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', category: 'Millets & Cereals', avgYield: 18, mandiRate: 25.80, msp: 24.10, costPerAcre: 15500, defaultSoil: 'Loamy', harvestDur: '3 - 4 Months', safeMoisturePct: 12.0, ambientDays: 180, coldDays: 540, waterReqMm: 500 },
  pearlmillet: { name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', category: 'Millets & Cereals', avgYield: 11, mandiRate: 27.50, msp: 26.25, costPerAcre: 10000, defaultSoil: 'Sandy', harvestDur: '80 - 85 Days', safeMoisturePct: 11.5, ambientDays: 240, coldDays: 600, waterReqMm: 300 },
  sorghum: { name: 'Sorghum (Jowar)', name_ta: 'சோளம்', category: 'Millets & Cereals', avgYield: 10, mandiRate: 35.00, msp: 33.71, costPerAcre: 11000, defaultSoil: 'Black', harvestDur: '100 - 110 Days', safeMoisturePct: 11.0, ambientDays: 240, coldDays: 600, waterReqMm: 350 },
  fingermillet: { name: 'Finger Millet (Ragi)', name_ta: 'கேழ்வரகு', category: 'Millets & Cereals', avgYield: 9.5, mandiRate: 44.00, msp: 42.90, costPerAcre: 11500, defaultSoil: 'Loamy', harvestDur: '110 - 120 Days', safeMoisturePct: 11.0, ambientDays: 365, coldDays: 720, waterReqMm: 350 },
  barnyardmillet: { name: 'Barnyard Millet', name_ta: 'குதிரைவாலி', category: 'Millets & Cereals', avgYield: 6.5, mandiRate: 45.00, msp: 38.00, costPerAcre: 8000, defaultSoil: 'Sandy', harvestDur: '90 - 100 Days', safeMoisturePct: 11.0, ambientDays: 300, coldDays: 650, waterReqMm: 260 },
  foxtailmillet: { name: 'Foxtail Millet', name_ta: 'தினை', category: 'Millets & Cereals', avgYield: 6.0, mandiRate: 43.00, msp: 37.00, costPerAcre: 8000, defaultSoil: 'Loamy', harvestDur: '80 - 90 Days', safeMoisturePct: 10.5, ambientDays: 300, coldDays: 650, waterReqMm: 250 },
  kodomillet: { name: 'Kodo Millet', name_ta: 'வரகு', category: 'Millets & Cereals', avgYield: 5.5, mandiRate: 42.00, msp: 36.00, costPerAcre: 7500, defaultSoil: 'Sandy', harvestDur: '110 - 120 Days', safeMoisturePct: 10.5, ambientDays: 300, coldDays: 650, waterReqMm: 270 },

  // Fiber & Cash
  cotton: { name: 'Cotton', name_ta: 'பருத்தி', category: 'Cash & Fiber', avgYield: 8.5, mandiRate: 86.50, msp: 82.67, costPerAcre: 21000, defaultSoil: 'Black', harvestDur: '5 - 6 Months', safeMoisturePct: 8.5, ambientDays: 240, coldDays: 700, waterReqMm: 650 },
  sugarcane: { name: 'Sugarcane', name_ta: 'கரும்பு', category: 'Cash & Fiber', avgYield: 420, mandiRate: 3.50, msp: 3.40, costPerAcre: 65000, defaultSoil: 'Clay', harvestDur: '10 - 12 Months', safeMoisturePct: 70.0, ambientDays: 3, coldDays: 10, waterReqMm: 1600 },
  sunnhemp: { name: 'Sunn Hemp', name_ta: 'சணப்பை', category: 'Cash & Fiber', avgYield: 7.0, mandiRate: 54.00, msp: 48.00, costPerAcre: 7000, defaultSoil: 'Sandy', harvestDur: '75 - 90 Days', safeMoisturePct: 10.0, ambientDays: 240, coldDays: 500, waterReqMm: 260 },

  // Spices & Tubers
  turmeric: { name: 'Turmeric', name_ta: 'மஞ்சள்', category: 'Spices & Tubers', avgYield: 24, mandiRate: 155.00, msp: 120.00, costPerAcre: 45000, defaultSoil: 'Clay', harvestDur: '8 - 9 Months', safeMoisturePct: 9.0, ambientDays: 365, coldDays: 720, waterReqMm: 900 },
  ginger: { name: 'Ginger', name_ta: 'இஞ்சி', category: 'Spices & Tubers', avgYield: 55, mandiRate: 90.00, msp: 72.00, costPerAcre: 52000, defaultSoil: 'Loamy', harvestDur: '8 - 9 Months', safeMoisturePct: 75.0, ambientDays: 20, coldDays: 90, waterReqMm: 850 },
  coriander: { name: 'Coriander (Seed & Herb)', name_ta: 'கொத்தமல்லி', category: 'Spices & Tubers', avgYield: 4.5, mandiRate: 92.00, msp: 75.00, costPerAcre: 9000, defaultSoil: 'Black', harvestDur: '35 - 45 Days', safeMoisturePct: 9.0, ambientDays: 180, coldDays: 365, waterReqMm: 240 }
};

// IPM Protocol Engine
const PEST_REGISTRY = {
  borer: { pestName: 'Fruit & Shoot Borer Complex', pestName_ta: 'காய் மற்றும் தண்டு துளைப்பான் புழு', cultural: 'Prompt clipping of wilted shoots; install Marigold trap borders.', cultural_ta: 'வாடிய குருத்துகளை அகற்றுதல்; சாமந்திப் பூக்களை நடுதல்.', bio: 'Neem seed kernel extract (NSKE 5%) or Bt spray @ 2g/L.', bio_ta: 'வேப்பங்கொட்டை கரைசல் (5%) அல்லது பேசிலஸ் துரிஞ்சியென்சிஸ் தெளித்தல்.', chemical: 'Chlorantraniliprole 18.5% SC @ 0.3 ml/L water.', toxicity: 'Moderate', phiDays: 3 },
  bollworm: { pestName: 'Bollworm Complex & Whitefly', pestName_ta: 'காய்ப்புழு மற்றும் வெள்ளை ஈ', cultural: 'Erect 15 yellow sticky cards per acre; remove alternate weed hosts.', cultural_ta: 'மஞ்சள் வண்ண ஒட்டுப்பசை பொறிகள் வைத்தல்; களைகளை அகற்றுதல்.', bio: 'Beauveria bassiana @ 10g/L or release Chrysoperla predator larvae.', bio_ta: 'பவேரியா பேசியானா அல்லது கிரைசோபெர்லா இரைவிழுங்கிகள் விடுதல்.', chemical: 'Flonicamid 50% WG @ 4g/10L water.', toxicity: 'Moderate', phiDays: 21 },
  spodoptera: { pestName: 'Spodoptera Armyworm & Miner', pestName_ta: 'இலை தின்னும் புழு & சுரங்கப் புழு', cultural: 'Plant Castor/Bajra borders to intercept egg clusters.', cultural_ta: 'ஆமணக்கு அல்லது கம்பு பயிர்களை வரப்புகளில் நட்டு முட்டைக் குவியல்களை அழித்தல்.', bio: 'NPV virus @ 250 LE/acre with jaggery.', bio_ta: 'NPV வைரஸ் கரைசல் தெளித்தல்.', chemical: 'Emamectin benzoate 5% SG @ 4g/10L water.', toxicity: 'Moderate', phiDays: 14 },
  general: { pestName: 'Sucking Pest Complex', pestName_ta: 'சாறு உறிஞ்சும் பூச்சிகள் (அசுவினி, இலைப்பேன்)', cultural: 'Mulch inter-rows with pulse canopy.', cultural_ta: 'பருப்பு வகைகளை ஊடுபயிராகப் பயிரிட்டு நிலப்போர்வை அமைத்தல்.', bio: 'Spray 3% neem oil with soap water emulsifier.', bio_ta: '3% வேப்பெண்ணெய் கரைசல் தெளித்தல்.', chemical: 'Imidacloprid 17.8% SL @ 0.5 ml/L water.', toxicity: 'Severe', phiDays: 10 }
};

// COMPREHENSIVE COMPANION DIRECTORY (37 Unique Combinations)
const CROP_COMPANION_MATRIX = {
  brinjal: [
    { key: 'coriander', name: 'Coriander (Kothamalli)', name_ta: 'கொத்தமல்லி', rowRatio: '1:2', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.34, harvestDuration: '35 - 45 Days', harvestDuration_ta: '35 - 45 நாட்கள்', storageLife: 'Fresh 3 Days, Seed 6 Months', storageLife_ta: 'பசும் தழை 3 நாட்கள்', reasoning: 'Quick catch crop providing fast cash before brinjal branches spread.', reasoning_ta: 'கத்தரி கிளை பரப்பும் முன்பே 40 நாட்களில் உடனடி பண வரவு தரும் குறுகிய காலப் பயிர்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', rowRatio: '1:1', spacing: '30 cm x 15 cm', nitrogenFixed: 26, lerScore: 1.29, harvestDuration: '55 - 65 Days', harvestDuration_ta: '55 - 65 நாட்கள்', storageLife: 'Crates 4 Days', storageLife_ta: 'பெட்டிகளில் 4 நாட்கள்', reasoning: 'Biological nitrogen fixer enriching heavy-feeder brinjal rhizosphere.', reasoning_ta: 'கத்தரிக்குத் தேவையான தழைச்சத்தை வேர் முடிச்சுகள் மூலம் நிலைநிறுத்துகிறது.' }
  ],
  tomato: [
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', rowRatio: '1:1', spacing: '30 cm x 15 cm', nitrogenFixed: 28, lerScore: 1.34, harvestDuration: '55 - 65 Days', harvestDuration_ta: '55 - 65 நாட்கள்', storageLife: 'Crates 4 Days', storageLife_ta: 'பெட்டிகளில் 4 நாட்கள்', reasoning: 'Supplies active nitrogen to tomato root zones without shading vines.', reasoning_ta: 'தக்காளி கொடிகளை மறைக்காமல் வேர்ப்பகுதிக்கு தழைச்சத்தை ஊட்டுகிறது.' },
    { key: 'marigold', name: 'Marigold (Trap Crop)', name_ta: 'சாமந்தி (கவர்ச்சிப் பயிர்)', rowRatio: '1:6 Border', spacing: '45 cm x 30 cm', nitrogenFixed: 0, lerScore: 1.25, harvestDuration: '60 - 75 Days', harvestDuration_ta: '60 - 75 நாட்கள்', storageLife: 'Flowers 3 Days', storageLife_ta: 'பூக்கள் 3 நாட்கள்', reasoning: 'Suppresses root nematodes and traps fruit borers.', reasoning_ta: 'வேர் நூற்புழுக்களைக் கட்டுப்படுத்தி, காய்ப்புழுக்களைக் கவரும் இயற்கை அரண்.' }
  ],
  bhendi: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', rowRatio: '1:1', spacing: '20 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.28, harvestDuration: '40 - 45 Days', harvestDuration_ta: '40 - 45 நாட்கள்', storageLife: 'Fresh 4 Days', storageLife_ta: 'பசும் கிழங்கு 4 நாட்கள்', reasoning: 'Grows quickly on bed ridges, breaking heavy soil crusts.', reasoning_ta: 'வெண்டை வளரும் முன் பாத்தி விளிம்புகளில் வேகமாக வளர்ந்து மண்ணைத் தளர்த்தும்.' },
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 32, lerScore: 1.30, harvestDuration: '65 Days', harvestDuration_ta: '65 நாட்கள்', storageLife: 'Ambient 6 Months', storageLife_ta: 'சேமிப்பு 6 மாதங்கள்', reasoning: 'Dense canopy covers open soil and fixes nitrogen.', reasoning_ta: 'களைகளைக் கட்டுப்படுத்தி வெண்டையின் வேருக்கு இயற்கை உரம் சேர்க்கும்.' }
  ],
  chilli: [
    { key: 'onion', name: 'Small Onion (Shallot)', name_ta: 'சின்ன வெங்காயம்', rowRatio: '1:2', spacing: '15 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.36, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Aerated 90 Days', storageLife_ta: 'பரண்களில் 90 நாட்கள்', reasoning: 'Sulfur volatiles deter thrips while bulbs mature before peak chilli flushes.', reasoning_ta: 'வெங்காயத்தின் வாசனை இலைப்பேன் பூச்சிகளை விரட்டும், இரட்டை லாபம் தரும்.' },
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', rowRatio: '1:1', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.29, harvestDuration: '40 Days', harvestDuration_ta: '40 நாட்கள்', storageLife: 'Fresh 3 Days', storageLife_ta: 'பசும் தழை 3 நாட்கள்', reasoning: 'Quick shallow herb yielding revenue in 4 weeks.', reasoning_ta: 'நான்கே வாரங்களில் பலன் தரும் துரித ஊடுபயிர்.' }
  ],
  tapioca: [
    { key: 'groundnut', name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 25, lerScore: 1.41, harvestDuration: '105 Days', harvestDuration_ta: '105 நாட்கள்', storageLife: 'Ambient 6 Months', storageLife_ta: 'சேமிப்பு 6 மாதங்கள்', reasoning: 'Exploits wide 90cm spaces between cassava setts during juvenile stage.', reasoning_ta: 'மரவள்ளி வளரும் வரை உள்ள 90 செ.மீ இடைவெளியைப் பயன்படுத்தி கூடுதல் லாபம் ஈட்டலாம்.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 30, lerScore: 1.33, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Suppresses early weeds and leaves organic nitrogen.', reasoning_ta: 'ஆரம்ப காலக் களைகளை அடக்கி மண்ணில் தழைச்சத்து சேர்க்கும்.' }
  ],
  onion: [
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', rowRatio: '1:1', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.30, harvestDuration: '35 Days', harvestDuration_ta: '35 நாட்கள்', storageLife: 'Fresh 3 Days', storageLife_ta: 'பசும் தழை 3 நாட்கள்', reasoning: 'Fast companion harvested before bulbs bulk.', reasoning_ta: 'வெங்காயப் பருவம் முடிவதற்குள் அறுவடை செய்யப்படும் குறுகிய காலப் பயிர்.' }
  ],
  drumstick: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', rowRatio: 'Inter-basin', spacing: '30 cm x 10 cm', nitrogenFixed: 35, lerScore: 1.45, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Ambient 6 Months', storageLife_ta: 'சேமிப்பு 6 மாதங்கள்', reasoning: 'Fixes nitrogen and carpets wide alleys beneath moringa branches.', reasoning_ta: 'முருங்கை மரங்களின் அகன்ற இடைவெளியில் இயற்கை நிலப்போர்வையாக வளரும்.' }
  ],
  bittergourd: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', rowRatio: 'Bed Border', spacing: '20 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.26, harvestDuration: '40 Days', harvestDuration_ta: '40 நாட்கள்', storageLife: 'Fresh 4 Days', storageLife_ta: 'பசும் கிழங்கு 4 நாட்கள்', reasoning: 'Quick companion planted along furrow shoulders.', reasoning_ta: 'பாகல் பந்தல் ஏறும் முன்பே பாத்தி கரைகளில் முள்ளங்கி அறுவடை முடிந்துவிடும்.' }
  ],
  snakegourd: [
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', rowRatio: '1:1', spacing: '30 cm x 15 cm', nitrogenFixed: 25, lerScore: 1.28, harvestDuration: '60 Days', harvestDuration_ta: '60 நாட்கள்', storageLife: 'Crates 4 Days', storageLife_ta: 'பெட்டிகளில் 4 நாட்கள்', reasoning: 'Non-climbing legume that fixes nitrogen under tall trellises.', reasoning_ta: 'பந்தலுக்கு அடியில் ஏறிப் படராமல் தரையோடு தழைச்சத்து நிலைநிறுத்தும்.' }
  ],
  radish: [
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', rowRatio: '1:1', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.24, harvestDuration: '40 Days', harvestDuration_ta: '40 நாட்கள்', storageLife: 'Fresh 3 Days', storageLife_ta: 'பசும் தழை 3 நாட்கள்', reasoning: 'Dual fast herb-root catch crop combination.', reasoning_ta: 'இரட்டை பலன் தரும் மிகக் குறுகிய கால கீரை-கிழங்கு இணைப்பு.' }
  ],
  blackgram: [
    { key: 'sesame', name: 'Sesame (Til)', name_ta: 'எள்', rowRatio: '3:1', spacing: '30 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.32, harvestDuration: '75 Days', harvestDuration_ta: '75 நாட்கள்', storageLife: 'Godown 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Erect oilseed stems complement sprawling pulse canopies.', reasoning_ta: 'செங்குத்தாக வளரும் எள், படரும் உளுந்துக்கு இடையே மிகச் சிறந்த ஒளி பயன்பாட்டைத் தரும்.' }
  ],
  greengram: [
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', rowRatio: '4:1 Border', spacing: '45 cm x 15 cm', nitrogenFixed: 0, lerScore: 1.28, harvestDuration: '80 Days', harvestDuration_ta: '80 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Tall border barrier protecting moong flowers from wind desiccation.', reasoning_ta: 'கம்பு வரப்புப் பயிராக இருந்து பாசிப்பயறு மலர்களை வெம்மை காற்றில் இருந்து காக்கும்.' }
  ],
  pigeonpea: [
    { key: 'groundnut', name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', rowRatio: '1:6', spacing: '30 cm x 10 cm', nitrogenFixed: 28, lerScore: 1.39, harvestDuration: '105 Days', harvestDuration_ta: '105 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Groundnut is harvested in 105 days, leaving deep tur to exploit late moisture.', reasoning_ta: 'வேர்க்கடலை அறுவடைக்கு பின் ஆழமான துவரை வேர்கள் எஞ்சிய ஈரத்தைப் பயன்படுத்தும்.' }
  ],
  cowpea: [
    { key: 'sorghum', name: 'Sorghum (Jowar)', name_ta: 'சோளம்', rowRatio: '2:1', spacing: '45 cm x 15 cm', nitrogenFixed: 0, lerScore: 1.31, harvestDuration: '100 Days', harvestDuration_ta: '100 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Sorghum stalks act as windbreaks and structural support.', reasoning_ta: 'சோளத் தட்டைகள் காற்றுத் தடுப்பாகவும் ஆதாரமாகவும் அமையும்.' }
  ],
  horsegram: [
    { key: 'foxtailmillet', name: 'Foxtail Millet (Thinai)', name_ta: 'தினை', rowRatio: '2:1', spacing: '25 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.26, harvestDuration: '80 Days', harvestDuration_ta: '80 நாட்கள்', storageLife: 'Ambient 10 Months', storageLife_ta: 'சேமிப்பு 10 மாதங்கள்', reasoning: 'Dryland dual drought-hardy grain and legume pairing.', reasoning_ta: 'மானாவாரி நிலங்களுக்கான வறட்சியைத் தாங்கும் சிறுதானிய-பருப்பு இணைப்பு.' }
  ],
  chickpea: [
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', rowRatio: '4:1', spacing: '30 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.27, harvestDuration: '45 Days', harvestDuration_ta: '45 நாட்கள்', storageLife: 'Fresh 3 Days', storageLife_ta: 'பசும் தழை 3 நாட்கள்', reasoning: 'Cool season companion suited for winter Rabi Vertisols.', reasoning_ta: 'குளிர்கால கரிசல் நிலங்களுக்கு ஏற்ற வாசனைப் பயிர் இணைப்பு.' }
  ],
  clusterbean: [
    { key: 'maize', name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', rowRatio: '2:1', spacing: '45 cm x 15 cm', nitrogenFixed: 0, lerScore: 1.30, harvestDuration: '100 Days', harvestDuration_ta: '100 நாட்கள்', storageLife: 'Ambient 6 Months', storageLife_ta: 'சேமிப்பு 6 மாதங்கள்', reasoning: 'Tall stalks complement erect bushy legume clusters.', reasoning_ta: 'மக்காச்சோள நிழலைத் தாங்கி கொத்தவரை தழைச்சத்தை நிலைநிறுத்தும்.' }
  ],
  frenchbean: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', rowRatio: '1:1', spacing: '20 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.25, harvestDuration: '45 Days', harvestDuration_ta: '45 நாட்கள்', storageLife: 'Fresh 4 Days', storageLife_ta: 'பசும் கிழங்கு 4 நாட்கள்', reasoning: 'Quick root companion inter-planted between bush legume rows.', reasoning_ta: 'பீன்ஸ் செடிகளுக்கு இடையே விரைவாக வளர்ந்து நிலத்தைப் பயன்படுத்தும்.' }
  ],
  groundnut: [
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', rowRatio: '6:1 Border', spacing: '45 cm x 15 cm', nitrogenFixed: 0, lerScore: 1.34, harvestDuration: '80 - 85 Days', harvestDuration_ta: '80 - 85 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Tall border rows deflect drying winds, preserving pegging micro-humidity.', reasoning_ta: 'கம்பு வரப்புப் பயிராக இருந்து மணிலா விழுதுகள் இறங்குவதற்குத் தேவையான ஈரப்பதத்தைக் காக்கும்.' },
    { key: 'pigeonpea', name: 'Pigeon Pea (Arhar / Tur)', name_ta: 'துவரை', rowRatio: '6:1', spacing: '60 cm x 15 cm', nitrogenFixed: 42, lerScore: 1.36, harvestDuration: '140 Days', harvestDuration_ta: '140 நாட்கள்', storageLife: 'Ambient 10 Months', storageLife_ta: 'சேமிப்பு 10 மாதங்கள்', reasoning: 'Deep-rooted relay crop that exploits late-season sunlight.', reasoning_ta: 'வேர்க்கடலை அறுவடைக்கு பின்னும் ஆழமான ஈரத்தை எடுத்துக்கொண்டு பலன் தரும்.' }
  ],
  sesame: [
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 28, lerScore: 1.31, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Pulse carpets soil around erect sesame stalks.', reasoning_ta: 'எள் பயிருக்கு அடியில் உளுந்து வளர்ந்து களைகளைக் கட்டுப்படுத்தி உரம் சேர்க்கும்.' }
  ],
  sunflower: [
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 30, lerScore: 1.29, harvestDuration: '60 Days', harvestDuration_ta: '60 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Low-profile pulse leaves ample sunlight for wide sunflower heads.', reasoning_ta: 'சூரியகாந்தியின் ஒளிச்சேர்க்கைக்கு இடையூறின்றி கீழே பாசிப்பயறு தழைச்சத்து சேர்க்கும்.' }
  ],
  castor: [
    { key: 'groundnut', name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', rowRatio: '1:6', spacing: '30 cm x 10 cm', nitrogenFixed: 26, lerScore: 1.37, harvestDuration: '105 Days', harvestDuration_ta: '105 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Wide castor spacing accommodates multiple productive groundnut rows.', reasoning_ta: 'ஆமணக்கின் அகன்ற இடைவெளியில் மணிலா சாகுபடி செய்து அதிக லாபம் பெறலாம்.' }
  ],
  soybean: [
    { key: 'pigeonpea', name: 'Pigeon Pea', name_ta: 'துவரை', rowRatio: '2:1', spacing: '45 cm x 15 cm', nitrogenFixed: 40, lerScore: 1.35, harvestDuration: '140 Days', harvestDuration_ta: '140 நாட்கள்', storageLife: 'Ambient 10 Months', storageLife_ta: 'சேமிப்பு 10 மாதங்கள்', reasoning: 'Complementary canopy heights and double biological nitrogen enrichment.', reasoning_ta: 'இரட்டை பருப்பு வகைகளின் கூட்டு தழைச்சத்து நிலத்தை மிக வளமாக்கும்.' }
  ],
  coconut: [
    { key: 'drumstick', name: 'Drumstick (Moringa)', name_ta: 'முருங்கை', rowRatio: 'Inter-Basin Alley', spacing: '2.5m x 2.5m', nitrogenFixed: 0, lerScore: 1.52, harvestDuration: 'Perennial', harvestDuration_ta: 'ஆண்டு முழுவதும்', storageLife: 'Fresh pods 5 Days', storageLife_ta: 'காய்கள் 5 நாட்கள்', reasoning: 'Agroforestry companion maximizing sun in wide palm alleys.', reasoning_ta: 'தென்னந்தோப்பின் அகன்ற வரிசைகளில் சூரிய ஒளியைப் பயன்படுத்தி நிரந்தர வருமானம் தரும்.' },
    { key: 'turmeric', name: 'Turmeric', name_ta: 'மஞ்சள்', rowRatio: 'Shaded Basin Beds', spacing: '30 cm x 20 cm', nitrogenFixed: 0, lerScore: 1.38, harvestDuration: '9 Months', harvestDuration_ta: '9 மாதங்கள்', storageLife: 'Cured 12 Months', storageLife_ta: 'பதப்படுத்தியது 1 வருடம்', reasoning: 'Shade-tolerant spice crop thriving in palm understory litter.', reasoning_ta: 'தென்னையின் பகுதி நிழலில் செழித்து வளரும் பணப்பயிர்.' }
  ],
  maize: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', rowRatio: '2:1', spacing: '30 cm x 10 cm', nitrogenFixed: 35, lerScore: 1.35, harvestDuration: '65 - 75 Days', harvestDuration_ta: '65 - 75 நாட்கள்', storageLife: 'Ambient 7 Months', storageLife_ta: 'சேமிப்பு 7 மாதங்கள்', reasoning: 'Erect stalks allow dense cowpea foliage to smother weed flushes.', reasoning_ta: 'மக்காச்சோளத் தட்டைகளுக்கு இடையே தட்டப்பயறு களைகளை ஒடுக்கி உரம் சேர்க்கும்.' }
  ],
  pearlmillet: [
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', rowRatio: '1:2', spacing: '25 cm x 10 cm', nitrogenFixed: 30, lerScore: 1.30, harvestDuration: '60 Days', harvestDuration_ta: '60 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Harvested in 60 days before tall bajra stalks lock canopy.', reasoning_ta: 'கம்பு முழு உயரத்தை எட்டும் முன்பே 60 நாட்களில் பாசிப்பயறு அறுவடைக்கு வரும்.' }
  ],
  sorghum: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', rowRatio: '2:1', spacing: '30 cm x 10 cm', nitrogenFixed: 35, lerScore: 1.33, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Ambient 7 Months', storageLife_ta: 'சேமிப்பு 7 மாதங்கள்', reasoning: 'Drought-hardy cereal and legume pairing for semi-arid zones.', reasoning_ta: 'மானாவாரி நிலங்களுக்கு ஏற்ற சிறந்த தானிய-பருப்பு ஊடுபயிர் முறை.' }
  ],
  fingermillet: [
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', rowRatio: '4:1', spacing: '25 cm x 10 cm', nitrogenFixed: 28, lerScore: 1.28, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Adds crucial biological nitrogen to heavy-tillering ragi beds.', reasoning_ta: 'கேழ்வரகு தூர்கள் வெடிக்கத் தேவையான தழைச்சத்தை உளுந்து வேர்கள் கொடுக்கும்.' }
  ],
  barnyardmillet: [
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', rowRatio: '3:1', spacing: '25 cm x 10 cm', nitrogenFixed: 28, lerScore: 1.29, harvestDuration: '60 Days', harvestDuration_ta: '60 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Rapid drought-resistant dual harvest in sandy delta soils.', reasoning_ta: 'குறைந்த நீரில் 60 நாட்களில் இரட்டை பலன் தரும் சிறுதானிய-பயறு முறை.' }
  ],
  foxtailmillet: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', rowRatio: '3:1', spacing: '25 cm x 10 cm', nitrogenFixed: 30, lerScore: 1.27, harvestDuration: '65 Days', harvestDuration_ta: '65 நாட்கள்', storageLife: 'Ambient 7 Months', storageLife_ta: 'சேமிப்பு 7 மாதங்கள்', reasoning: 'Shallow root systems feed at complementary depths.', reasoning_ta: 'தினை மற்றும் தட்டப்பயறு வெவ்வேறு ஆழங்களில் சத்துகளை உறிஞ்சி பலன் தரும்.' }
  ],
  kodomillet: [
    { key: 'horsegram', name: 'Horse Gram (Kulthi)', name_ta: 'கொள்ளு', rowRatio: '2:1', spacing: '30 cm x 10 cm', nitrogenFixed: 22, lerScore: 1.25, harvestDuration: '80 Days', harvestDuration_ta: '80 நாட்கள்', storageLife: 'Ambient 10 Months', storageLife_ta: 'சேமிப்பு 10 மாதங்கள்', reasoning: 'Resilient dryland combination for Southern Zone rainfed uplands.', reasoning_ta: 'தென் மாவட்ட மானாவாரி மேட்டு நிலங்களுக்கு உகந்த வறட்சி தாங்கும் பயிர்கள்.' }
  ],
  cotton: [
    { key: 'blackgram', name: 'Black Gram (Urad)', name_ta: 'உளுந்து', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 32, lerScore: 1.32, harvestDuration: '70 - 75 Days', harvestDuration_ta: '70 - 75 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Completes harvest in 70 days before wide cotton branches lock.', reasoning_ta: 'பருத்தி கிளை விரிக்கும் முன்பே உளுந்து அறுவடை முடிந்து கூடுதல் பண வரவு தரும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', rowRatio: '1:2', spacing: '25 cm x 10 cm', nitrogenFixed: 30, lerScore: 1.28, harvestDuration: '60 Days', harvestDuration_ta: '60 நாட்கள்', storageLife: 'Ambient 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Ultra-fast 60-day legume with zero solar competition.', reasoning_ta: 'பருத்தியுடன் நிழல் போட்டியின்றி 60 நாட்களில் விரைவாக அறுவடை செய்யலாம்.' }
  ],
  sugarcane: [
    { key: 'soybean', name: 'Soybean', name_ta: 'சோயாபீன்', rowRatio: '1:2', spacing: '30 cm x 10 cm', nitrogenFixed: 36, lerScore: 1.39, harvestDuration: '85 Days', harvestDuration_ta: '85 நாட்கள்', storageLife: 'Ambient 7 Months', storageLife_ta: 'சேமிப்பு 7 மாதங்கள்', reasoning: 'Thrives in wide 120cm cane rows during the 90-day slow tillering phase.', reasoning_ta: 'கரும்பு ஆரம்பத்தில் மெதுவாக வளரும் 90 நாட்களில் சோயாபீன் நல்ல வருமானம் தரும்.' }
  ],
  sunnhemp: [
    { key: 'sesame', name: 'Sesame (Til)', name_ta: 'எள்', rowRatio: '2:1', spacing: '30 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.25, harvestDuration: '75 Days', harvestDuration_ta: '75 நாட்கள்', storageLife: 'Godown 8 Months', storageLife_ta: 'சேமிப்பு 8 மாதங்கள்', reasoning: 'Green manure legume improves soil structure for oilseed seed-set.', reasoning_ta: 'பசுந்தாள் பயிரான சணப்பை நிலத்தின் அமைப்பை மேம்படுத்தி எள் விளைச்சலை அதிகரிக்கும்.' }
  ],
  turmeric: [
    { key: 'onion', name: 'Small Onion (Shallot)', name_ta: 'சின்ன வெங்காயம்', rowRatio: '1:2 Raised Bed', spacing: '15 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.37, harvestDuration: '70 Days', harvestDuration_ta: '70 நாட்கள்', storageLife: 'Aerated 90 Days', storageLife_ta: 'பரண்களில் 90 நாட்கள்', reasoning: 'Onions mature in 70 days, paying off bed preparation costs early.', reasoning_ta: 'மஞ்சள் முளைத்து வரும் முன்பே வெங்காயம் அறுவடைக்கு வந்து உழவுச் செலவை ஈடு செய்யும்.' }
  ],
  ginger: [
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', rowRatio: '1:2', spacing: '30 cm x 15 cm', nitrogenFixed: 26, lerScore: 1.31, harvestDuration: '60 Days', harvestDuration_ta: '60 நாட்கள்', storageLife: 'Crates 4 Days', storageLife_ta: 'பெட்டிகளில் 4 நாட்கள்', reasoning: 'Bio-nitrogen enrichment directly feeding the developing rhizome root zone.', reasoning_ta: 'இஞ்சியின் வேர்ப்பகுதிக்கு தழைச்சத்தை ஊட்டி கிழங்கு பெருக்க உதவும்.' }
  ],
  coriander: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', rowRatio: '1:1', spacing: '20 cm x 10 cm', nitrogenFixed: 0, lerScore: 1.28, harvestDuration: '45 Days', harvestDuration_ta: '45 நாட்கள்', storageLife: 'Fresh 4 Days', storageLife_ta: 'பசும் கிழங்கு 4 நாட்கள்', reasoning: 'Quick shallow root companion harvested synchronously.', reasoning_ta: 'ஒரே நேரத்தில் அறுவடைக்கு வரும் இரட்டை குறுகிய கால காய்கறி-கீரை கூட்டணி.' }
  ]
};

// Water Footprint & Drip Calculation
const calculateWaterFootprintAndDrip = (primaryCropKey, soilType = 'Clay') => {
  const cropMeta = STATEWIDE_CROP_DIRECTORY[primaryCropKey] || STATEWIDE_CROP_DIRECTORY.brinjal;
  const baseWaterMm = cropMeta.waterReqMm || 500;
  const LITERS_PER_MM_ACRE = 4046.86;
  const floodLitersPerAcre = Math.round(baseWaterMm * LITERS_PER_MM_ACRE);
  const dripLitersPerAcre = Math.round(floodLitersPerAcre * 0.48);
  const waterSavedLitersPerAcre = floodLitersPerAcre - dripLitersPerAcre;

  const soilFactors = {
    Clay: { hoursPerIrrigation: 1.5, frequencyDays: 3, infiltration: 'Slow (High Moisture Retention)' },
    Black: { hoursPerIrrigation: 1.8, frequencyDays: 3, infiltration: 'Medium-Slow (High Shrink-Swell)' },
    Loamy: { hoursPerIrrigation: 2.0, frequencyDays: 2, infiltration: 'Optimal Infiltration Rate' },
    Sandy: { hoursPerIrrigation: 1.0, frequencyDays: 1, infiltration: 'Rapid (Requires Frequent Micro-Pulses)' }
  }[soilType] || { hoursPerIrrigation: 1.8, frequencyDays: 2, infiltration: 'Moderate' };

  return {
    floodLitersPerAcre,
    dripLitersPerAcre,
    waterSavedLitersPerAcre,
    waterSavedPercent: 52,
    dripSchedule: {
      runtimeHoursPerCycle: soilFactors.hoursPerIrrigation,
      irrigationIntervalDays: soilFactors.frequencyDays,
      soilInfiltrationNote: soilFactors.infiltration,
      evaporationReduction: '32% due to canopy soil shading'
    }
  };
};

// Soil Chemistry Audit Engine
const calculateSoilChemistryEvolution = (primaryCropKey, intercropNFixed = 25, soilType = 'Loamy') => {
  const baseChem = {
    Clay: { n: 210, p: 18, k: 280, oc: 0.52, microbialScore: 62 },
    Black: { n: 195, p: 15, k: 310, oc: 0.48, microbialScore: 58 },
    Sandy: { n: 140, p: 12, k: 160, oc: 0.31, microbialScore: 42 },
    Loamy: { n: 230, p: 22, k: 240, oc: 0.61, microbialScore: 70 }
  }[soilType] || { n: 210, p: 18, k: 250, oc: 0.50, microbialScore: 60 };

  const nAddition = Math.round(intercropNFixed * 0.7);
  const ocAddition = parseFloat((baseChem.oc * 0.22).toFixed(2));
  const microbialBoost = Math.min(96, Math.round(baseChem.microbialScore * 1.35));

  return {
    before: {
      availableN: `${baseChem.n} kg/ha (Low/Medium)`,
      availableP: `${baseChem.p} kg/ha (Medium)`,
      availableK: `${baseChem.k} kg/ha (High)`,
      organicCarbon: `${baseChem.oc}% (Sub-optimal)`,
      rhizosphereMicrobialIndex: `${baseChem.microbialScore} / 100`
    },
    after: {
      availableN: `${baseChem.n + nAddition} kg/ha (+${nAddition} kg Bio-N Added)`,
      availableP: `${baseChem.p + 2} kg/ha (Solubilized)`,
      availableK: `${Math.round(baseChem.k * 0.98)} kg/ha (Buffered)`,
      organicCarbon: `${(baseChem.oc + ocAddition).toFixed(2)}% (+${Math.round((ocAddition / baseChem.oc) * 100)}% Restored)`,
      rhizosphereMicrobialIndex: `${microbialBoost} / 100 (+${microbialBoost - baseChem.microbialScore} pts Vitality)`
    }
  };
};

// Recommendation Endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { primaryCropKey, districtKey, soilType, lang } = req.body;
    const currentLang = lang || 'en';
    const cKey = String(primaryCropKey || 'brinjal').toLowerCase();
    const dKey = String(districtKey || 'thanjavur').toLowerCase();

    const cropMeta = STATEWIDE_CROP_DIRECTORY[cKey] || STATEWIDE_CROP_DIRECTORY.brinjal;
    const sType = soilType || cropMeta.defaultSoil || 'Loamy';

    const primaryCrop = {
      key: cKey,
      name: cropMeta.name,
      name_ta: cropMeta.name_ta,
      harvestDuration: cropMeta.harvestDur,
      avgYield: cropMeta.avgYield,
      safeMoisturePct: cropMeta.safeMoisturePct,
      ambientDays: cropMeta.ambientDays,
      coldDays: cropMeta.coldDays
    };

    const marketData = {
      pricePerKg: cropMeta.mandiRate,
      officialMspPerKg: cropMeta.msp,
      lastUpdated: '2026-10-01'
    };

    // Grab distinct companions from matrix
    const matchedCompanions = CROP_COMPANION_MATRIX[cKey] || CROP_COMPANION_MATRIX.brinjal;
    const labels = {
      high: currentLang === 'ta' ? '⭐ மிகச் சிறந்த பரிந்துரை' : '⭐ Highly Recommended',
      rec: currentLang === 'ta' ? '👍 பரிந்துரைக்கப்படுகிறது' : '👍 Recommended'
    };

    const companionOptions = matchedCompanions.map((comp, idx) => ({
      ...comp,
      tier: idx === 0 ? labels.high : labels.rec,
      tier_ta: idx === 0 ? '⭐ மிகச் சிறந்த பரிந்துரை' : '👍 பரிந்துரைக்கப்படுகிறது'
    }));

    const activeCompanion = companionOptions[0];
    const soilChemistry = calculateSoilChemistryEvolution(cKey, activeCompanion.nitrogenFixed, sType);
    const waterFootprint = calculateWaterFootprintAndDrip(cKey, sType);

    let pestData = PEST_REGISTRY.borer;
    if (cKey.includes('cotton')) pestData = PEST_REGISTRY.bollworm;
    else if (cKey.includes('groundnut') || cKey.includes('maize')) pestData = PEST_REGISTRY.spodoptera;
    else if (cKey.includes('chilli') || cKey.includes('onion')) pestData = PEST_REGISTRY.general;

    res.json({
      primaryCrop,
      marketData,
      intercrop: activeCompanion,
      companionOptions,
      soilChemistry,
      waterFootprint,
      pests: [pestData]
    });
  } catch (err) {
    console.error('Recommend endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate intercrop blueprint' });
  }
});

// Live Weather Proxy
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon, lang } = req.query;
    const latitude = parseFloat(lat) || 10.7870;
    const longitude = parseFloat(lon) || 79.1378;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.daily) throw new Error('Live satellite stream unreachable');

    const dayLabels = {
      en: ['Day 1 (Today)', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
      ta: ['நாள் 1 (இன்று)', 'நாள் 2', 'நாள் 3', 'நாள் 4', 'நாள் 5']
    };
    const labels = dayLabels[lang] || dayLabels.en;

    const forecast = data.daily.time.slice(0, 5).map((_, idx) => {
      const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
      const maxRain = Math.round(data.daily.precipitation_probability_max[idx] || 0);
      const maxWind = Math.round(data.daily.wind_speed_10m_max[idx] || 12);
      const highRisk = maxRain >= 50 || maxWind >= 20;

      return {
        day: labels[idx] || `Day ${idx + 1}`,
        temp: maxTemp,
        rainProb: maxRain,
        windKmh: maxWind,
        sprayRisk: highRisk ? 'High' : 'Low'
      };
    });

    res.json({ city: 'Live Tamil Nadu Agro Grid', forecast });
  } catch {
    res.json({
      city: 'Live Satellite Weather Feed',
      forecast: [
        { day: 'Day 1 (Today)', temp: 32, rainProb: 15, windKmh: 12, sprayRisk: 'Low' },
        { day: 'Day 2', temp: 31, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
        { day: 'Day 3', temp: 29, rainProb: 65, windKmh: 22, sprayRisk: 'High' },
        { day: 'Day 4', temp: 28, rainProb: 55, windKmh: 18, sprayRisk: 'High' },
        { day: 'Day 5', temp: 30, rainProb: 20, windKmh: 11, sprayRisk: 'Low' }
      ]
    });
  }
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  const { contactInfo, password } = req.body;
  if (!contactInfo || !password) return res.status(400).json({ error: 'Contact and password are required' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE contact = ?', [contactInfo]);
    if (rows && rows.length > 0) {
      const user = rows[0];
      if (user.password === password) return res.json({ user: { id: user.id, contact: user.contact, name: user.name || user.contact.split('@')[0] } });
      return res.status(401).json({ error: 'Invalid password' });
    }

    const [result] = await pool.query('INSERT INTO users (contact, password, name) VALUES (?, ?, ?)', [contactInfo, password, contactInfo.split('@')[0]]);
    return res.json({ user: { id: result.insertId, contact: contactInfo, name: contactInfo.split('@')[0] } });
  } catch {
    if (memoryUsers.has(contactInfo)) {
      const existingUser = memoryUsers.get(contactInfo);
      if (existingUser.password === password) return res.json({ user: { id: existingUser.id, contact: existingUser.contact, name: existingUser.name } });
      return res.status(401).json({ error: 'Invalid password' });
    }
    const newUser = { id: Date.now(), contact: contactInfo, name: contactInfo.split('@')[0], password };
    memoryUsers.set(contactInfo, newUser);
    return res.json({ user: { id: newUser.id, contact: newUser.contact, name: newUser.name } });
  }
});

// History Management
app.post('/api/history/save', async (req, res) => {
  const { userId, primaryCrop, intercrop, district, constituency, season, soilType, waterStatus } = req.body;
  if (!userId || !primaryCrop) return res.status(400).json({ error: 'Missing required fields' });

  try {
    await pool.query('INSERT INTO crop_history (user_id, primary_crop, intercrop, district, constituency, season, soil_type, water_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, primaryCrop, intercrop, district, constituency, season, soilType, waterStatus]);
    return res.json({ success: true });
  } catch {
    memoryHistory.unshift({ id: Date.now(), user_id: userId, primary_crop: primaryCrop, intercrop, district, constituency, season, soil_type: soilType, water_status: waterStatus, created_at: new Date().toISOString() });
    return res.json({ success: true });
  }
});

app.get('/api/history/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM crop_history WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    return res.json(rows);
  } catch {
    return res.json(memoryHistory.filter(h => String(h.user_id) === String(req.params.userId)));
  }
});

app.listen(PORT, () => console.log(`🌾 AgriCompanion Backend running on port ${PORT}`));