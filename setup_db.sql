USE defaultdb;

CREATE TABLE IF NOT EXISTS crops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_key VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_ta VARCHAR(100),
  name_hi VARCHAR(100),
  water_requirement VARCHAR(20),
  duration_days INT,
  soil_preference VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intercrop_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  primary_crop_key VARCHAR(50) NOT NULL,
  intercrop_name VARCHAR(100) NOT NULL,
  ratio VARCHAR(20),
  synergy_notes TEXT,
  yield_boost_pct INT DEFAULT 15,
  FOREIGN KEY (primary_crop_key) REFERENCES crops(crop_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS market_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_key VARCHAR(50) NOT NULL,
  mandi_name VARCHAR(100),
  state VARCHAR(50),
  modal_price DECIMAL(10,2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (crop_key) REFERENCES crops(crop_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pest_controls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_key VARCHAR(50) NOT NULL,
  pest_name VARCHAR(100) NOT NULL,
  organic_solution TEXT,
  chemical_solution TEXT,
  FOREIGN KEY (crop_key) REFERENCES crops(crop_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  preferred_lang VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  query_payload JSON,
  recommendation_result JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Initial Crops
INSERT INTO crops (crop_key, name_en, name_ta, name_hi, water_requirement, duration_days, soil_preference) VALUES
('maize', 'Maize (Corn)', 'மக்காச்சோளம்', 'मक्का', 'Medium', 105, 'Loamy'),
('cotton', 'Cotton', 'பருத்தி', 'कपास', 'Medium', 160, 'Black'),
('sugarcane', 'Sugarcane', 'கரும்பு', 'गन्ना', 'High', 360, 'Clayey'),
('groundnut', 'Groundnut', 'வேர்க்கடலை', 'मूंगफली', 'Low', 120, 'Sandy')
ON DUPLICATE KEY UPDATE name_en=VALUES(name_en);

-- Seed Intercrop Rules
INSERT INTO intercrop_rules (primary_crop_key, intercrop_name, ratio, synergy_notes, yield_boost_pct) VALUES
('maize', 'Cowpea / Blackgram', '2:1', 'Fixes biological atmospheric nitrogen, covers canopy to prevent weeds.', 22),
('cotton', 'Green Gram', '1:1', 'Provides early harvest returns and breaks pest lifecycle.', 18),
('sugarcane', 'Soybean', '1:2', 'Suppresses weeds during the initial slow vegetative tillering phase.', 15),
('groundnut', 'Pearl Millet (Bajra)', '4:1', 'Acts as windbreak and deters aphid infestation.', 12);

-- Seed Pest Controls
INSERT INTO pest_controls (crop_key, pest_name, organic_solution, chemical_solution) VALUES
('maize', 'Fall Armyworm', 'Spray 5% Neem Seed Kernel Extract (NSKE) or release Trichogramma wasps.', 'Emamectin benzoate 5% SG @ 0.4g/litre of water.'),
('cotton', 'Pink Bollworm', 'Install yellow/pheromone sticky traps (5 traps/acre); release Trichogramma.', 'Profex Super (Profenofos + Cypermethrin) @ 2ml/litre.'),
('sugarcane', 'Early Shoot Borer', 'Apply light trash mulching up to 10cm thickness; Trichogramma chilonis egg cards.', 'Chlorantraniliprole 18.5% SC @ 0.4ml/litre at planting.'),
('groundnut', 'Tikka Leaf Spot', 'Foliar spray with sour buttermilk or cow urine-neem concoction.', 'Mancozeb 75% WP @ 2g/litre of water.');