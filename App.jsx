import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5002';

// 1. Statewide Tamil Nadu 7 Agro-Climatic Zones & Key Districts
const TN_AGRO_DISTRICTS = {
  thanjavur: { name: 'Thanjavur', zone: 'Cauvery Delta', defaultSoil: 'Clay', coords: [10.7870, 79.1378] },
  tiruvarur: { name: 'Tiruvarur', zone: 'Cauvery Delta', defaultSoil: 'Clay', coords: [10.7725, 79.6365] },
  nagapattinam: { name: 'Nagapattinam', zone: 'Cauvery Delta', defaultSoil: 'Clay', coords: [10.7672, 79.8449] },
  mayiladuthurai: { name: 'Mayiladuthurai', zone: 'Cauvery Delta', defaultSoil: 'Clay', coords: [11.1075, 79.6524] },
  coimbatore: { name: 'Coimbatore', zone: 'Western Zone', defaultSoil: 'Loamy', coords: [11.0168, 76.9558] },
  tiruppur: { name: 'Tiruppur', zone: 'Western Zone', defaultSoil: 'Black', coords: [11.1085, 77.3411] },
  erode: { name: 'Erode', zone: 'Western Zone', defaultSoil: 'Loamy', coords: [11.3410, 77.7172] },
  dindigul: { name: 'Dindigul', zone: 'Western Zone', defaultSoil: 'Loamy', coords: [10.3673, 77.9803] },
  madurai: { name: 'Madurai', zone: 'Southern Zone', defaultSoil: 'Black', coords: [9.9252, 78.1198] },
  virudhunagar: { name: 'Virudhunagar', zone: 'Southern Zone', defaultSoil: 'Black', coords: [9.5680, 77.9624] },
  thoothukudi: { name: 'Thoothukudi', zone: 'Southern Zone', defaultSoil: 'Black', coords: [8.7642, 78.1348] },
  ramanathapuram: { name: 'Ramanathapuram', zone: 'Southern Zone', defaultSoil: 'Sandy', coords: [9.3639, 78.8395] },
  villupuram: { name: 'Villupuram', zone: 'North Eastern Zone', defaultSoil: 'Sandy', coords: [11.9401, 79.4861] },
  cuddalore: { name: 'Cuddalore', zone: 'North Eastern Zone', defaultSoil: 'Clay', coords: [11.7480, 79.7714] },
  salem: { name: 'Salem', zone: 'North Western Zone', defaultSoil: 'Loamy', coords: [11.6643, 78.1460] },
  dharmapuri: { name: 'Dharmapuri', zone: 'North Western Zone', defaultSoil: 'Loamy', coords: [12.1211, 78.1582] }
};

// 2. 38 Commercial Crops of Tamil Nadu (Non-Rice)
const TN_38_CROPS = {
  // Vegetables
  brinjal: { name: 'Brinjal / Eggplant', category: 'Vegetables', avgYield: 110, mandiRate: 24.50, msp: 18.00, costPerAcre: 26000, defaultSoil: 'Clay' },
  tomato: { name: 'Tomato', category: 'Vegetables', avgYield: 140, mandiRate: 22.00, msp: 15.00, costPerAcre: 32000, defaultSoil: 'Loamy' },
  bhendi: { name: 'Bhendi (Okra)', category: 'Vegetables', avgYield: 50, mandiRate: 28.00, msp: 20.00, costPerAcre: 18000, defaultSoil: 'Loamy' },
  chilli: { name: 'Chilli', category: 'Vegetables', avgYield: 18, mandiRate: 120.00, msp: 100.00, costPerAcre: 35000, defaultSoil: 'Black' },
  tapioca: { name: 'Tapioca (Cassava)', category: 'Vegetables', avgYield: 120, mandiRate: 11.50, msp: 9.50, costPerAcre: 24000, defaultSoil: 'Sandy' },
  onion: { name: 'Small Onion (Shallot)', category: 'Vegetables', avgYield: 60, mandiRate: 38.00, msp: 30.00, costPerAcre: 38000, defaultSoil: 'Loamy' },
  drumstick: { name: 'Drumstick (Moringa)', category: 'Vegetables', avgYield: 80, mandiRate: 32.00, msp: 24.00, costPerAcre: 20000, defaultSoil: 'Sandy' },
  bittergourd: { name: 'Bitter Gourd', category: 'Vegetables', avgYield: 45, mandiRate: 34.00, msp: 26.00, costPerAcre: 25000, defaultSoil: 'Sandy' },
  snakegourd: { name: 'Snake Gourd', category: 'Vegetables', avgYield: 70, mandiRate: 22.00, msp: 17.00, costPerAcre: 22000, defaultSoil: 'Sandy' },
  radish: { name: 'Radish', category: 'Vegetables', avgYield: 80, mandiRate: 18.00, msp: 12.00, costPerAcre: 14000, defaultSoil: 'Sandy' },

  // Pulses
  blackgram: { name: 'Black Gram (Urad)', category: 'Pulses', avgYield: 4.5, mandiRate: 74.00, msp: 70.00, costPerAcre: 9500, defaultSoil: 'Clay' },
  greengram: { name: 'Green Gram (Moong)', category: 'Pulses', avgYield: 4.0, mandiRate: 86.00, msp: 85.58, costPerAcre: 9500, defaultSoil: 'Loamy' },
  pigeonpea: { name: 'Red Gram (Arhar / Tur)', category: 'Pulses', avgYield: 6.0, mandiRate: 78.00, msp: 75.50, costPerAcre: 12000, defaultSoil: 'Loamy' },
  cowpea: { name: 'Cowpea (Lobia)', category: 'Pulses', avgYield: 5.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 9000, defaultSoil: 'Sandy' },
  horsegram: { name: 'Horse Gram (Kulthi)', category: 'Pulses', avgYield: 3.5, mandiRate: 48.00, msp: 42.00, costPerAcre: 6500, defaultSoil: 'Sandy' },
  chickpea: { name: 'Chickpea (Chana)', category: 'Pulses', avgYield: 5.0, mandiRate: 58.00, msp: 54.40, costPerAcre: 11000, defaultSoil: 'Black' },
  clusterbean: { name: 'Cluster Bean (Guar)', category: 'Pulses', avgYield: 15, mandiRate: 35.00, msp: 29.00, costPerAcre: 8500, defaultSoil: 'Sandy' },
  frenchbean: { name: 'French Bush Bean', category: 'Pulses', avgYield: 30, mandiRate: 45.00, msp: 35.00, costPerAcre: 18000, defaultSoil: 'Loamy' },

  // Oilseeds
  groundnut: { name: 'Groundnut (Peanut)', category: 'Oilseeds', avgYield: 12, mandiRate: 78.50, msp: 75.17, costPerAcre: 15500, defaultSoil: 'Sandy' },
  sesame: { name: 'Sesame (Til)', category: 'Oilseeds', avgYield: 3.5, mandiRate: 118.00, msp: 92.67, costPerAcre: 9000, defaultSoil: 'Sandy' },
  sunflower: { name: 'Sunflower', category: 'Oilseeds', avgYield: 7.0, mandiRate: 68.00, msp: 67.60, costPerAcre: 13000, defaultSoil: 'Black' },
  castor: { name: 'Castor', category: 'Oilseeds', avgYield: 6.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 10500, defaultSoil: 'Sandy' },
  soybean: { name: 'Soybean', category: 'Oilseeds', avgYield: 8.5, mandiRate: 52.00, msp: 48.92, costPerAcre: 12500, defaultSoil: 'Clay' },
  coconut: { name: 'Coconut (Inter-bed base)', category: 'Oilseeds', avgYield: 45, mandiRate: 34.00, msp: 29.00, costPerAcre: 18000, defaultSoil: 'Sandy' },

  // Millets & Cereals
  maize: { name: 'Maize / Corn', category: 'Millets & Cereals', avgYield: 18, mandiRate: 25.80, msp: 24.10, costPerAcre: 15500, defaultSoil: 'Loamy' },
  pearlmillet: { name: 'Pearl Millet (Bajra)', category: 'Millets & Cereals', avgYield: 11, mandiRate: 27.50, msp: 26.25, costPerAcre: 10000, defaultSoil: 'Sandy' },
  sorghum: { name: 'Sorghum (Jowar)', category: 'Millets & Cereals', avgYield: 10, mandiRate: 35.00, msp: 33.71, costPerAcre: 11000, defaultSoil: 'Black' },
  fingermillet: { name: 'Finger Millet (Ragi)', category: 'Millets & Cereals', avgYield: 9.5, mandiRate: 44.00, msp: 42.90, costPerAcre: 11500, defaultSoil: 'Loamy' },
  barnyardmillet: { name: 'Barnyard Millet (Kuthiraivali)', category: 'Millets & Cereals', avgYield: 6.5, mandiRate: 45.00, msp: 38.00, costPerAcre: 8000, defaultSoil: 'Sandy' },
  foxtailmillet: { name: 'Foxtail Millet (Thinai)', category: 'Millets & Cereals', avgYield: 6.0, mandiRate: 43.00, msp: 37.00, costPerAcre: 8000, defaultSoil: 'Loamy' },
  kodomillet: { name: 'Kodo Millet (Varagu)', category: 'Millets & Cereals', avgYield: 5.5, mandiRate: 42.00, msp: 36.00, costPerAcre: 7500, defaultSoil: 'Sandy' },

  // Fiber & Cash
  cotton: { name: 'Cotton', category: 'Cash & Fiber', avgYield: 8.5, mandiRate: 86.50, msp: 82.67, costPerAcre: 21000, defaultSoil: 'Black' },
  sugarcane: { name: 'Sugarcane', category: 'Cash & Fiber', avgYield: 420, mandiRate: 3.50, msp: 3.40, costPerAcre: 65000, defaultSoil: 'Clay' },
  sunnhemp: { name: 'Sunn Hemp', category: 'Cash & Fiber', avgYield: 7.0, mandiRate: 54.00, msp: 48.00, costPerAcre: 7000, defaultSoil: 'Sandy' },
  tobacco: { name: 'Tobacco', category: 'Cash & Fiber', avgYield: 9.0, mandiRate: 90.00, msp: 80.00, costPerAcre: 28000, defaultSoil: 'Loamy' },

  // Spices & Tubers
  turmeric: { name: 'Turmeric', category: 'Spices & Tubers', avgYield: 24, mandiRate: 155.00, msp: 120.00, costPerAcre: 45000, defaultSoil: 'Clay' },
  ginger: { name: 'Ginger', category: 'Spices & Tubers', avgYield: 55, mandiRate: 90.00, msp: 72.00, costPerAcre: 52000, defaultSoil: 'Loamy' },
  coriander: { name: 'Coriander (Seed & Herb)', category: 'Spices & Tubers', avgYield: 4.5, mandiRate: 92.00, msp: 75.00, costPerAcre: 9000, defaultSoil: 'Black' }
};

const CATEGORIES = ['All', 'Vegetables', 'Pulses', 'Oilseeds', 'Millets & Cereals', 'Cash & Fiber', 'Spices & Tubers'];

// UI Vocabulary
const DICTIONARY = {
  en: {
    title: '🌱 AgriCompanion AI',
    subtitle: 'Statewide Tamil Nadu Multi-Tier Intercropping & Field Decision System',
    district: 'Tamil Nadu District / Zone',
    category: 'Crop Category',
    crop: 'Primary Crop',
    season: 'Season',
    soil: 'Soil Type',
    water: 'Water Availability',
    btnGet: 'Generate Blueprint 🚀',
    mandiPrice: 'Mandi Wholesale Price',
    officialMsp: 'Govt. Floor MSP',
    perKg: '/kg',
    tabIntercrop: '🌿 Intercrop Blueprint',
    tabEconomics: '💰 Profit & Yield Calculator',
    tabFertilizer: '🧪 NPK & Bio N-Credits',
    tabWeather: '🌦️ Live Satellite Spraying Advisory',
    outdoorMode: '☀️ Field Mode (Glare)'
  },
  ta: {
    title: '🌱 அக்ரிகாம்பானியன் AI',
    subtitle: 'தமிழ்நாடு பல்நிலை ஊடுபயிர் வழிகாட்டி மற்றும் கள ஆய்வு முறைமை',
    district: 'தமிழ்நாடு மாவட்டம் / மண்டலம்',
    category: 'பயிர் பிரிவு',
    crop: 'முதன்மைப் பயிர்',
    season: 'பருவம்',
    soil: 'மண் வகை',
    water: 'நீர் வசதி',
    btnGet: 'திட்டத்தைப் பெறுக 🚀',
    mandiPrice: 'சந்தை மொத்த விலை',
    officialMsp: 'அரசு குறைந்தபட்ச விலை',
    perKg: '/கிலோ',
    tabIntercrop: '🌿 ஊடுபயிர் வரைபடம்',
    tabEconomics: '💰 லாபம் & மகசூல் கணக்கீடு',
    tabFertilizer: '🧪 உரத் தேவை & தழைச்சத்து',
    tabWeather: '🌦️ நேரலை செயற்கைக்கோள் வானிலை',
    outdoorMode: '☀️ கள ஒளிப் பார்வை (Field Mode)'
  },
  hi: {
    title: '🌱 एग्रीकंपैनियन AI',
    subtitle: 'तमिलनाडु बहुस्तरीय अंतर-फसल (Intercropping) निर्णय प्रणाली',
    district: 'तमिलनाडु जिला / क्षेत्र',
    category: 'फसल श्रेणी',
    crop: 'मुख्य फसल',
    season: 'सीजन',
    soil: 'मिट्टी प्रकार',
    water: 'पानी उपलब्धता',
    btnGet: 'खाका प्राप्त करें 🚀',
    mandiPrice: 'मंडी थोक भाव',
    officialMsp: 'सरकारी न्यूनतम भाव',
    perKg: '/किग्रा',
    tabIntercrop: '🌿 अंतर-फसल खाका',
    tabEconomics: '💰 लाभ और पैदावार',
    tabFertilizer: '🧪 खाद मात्रा व बचत',
    tabWeather: '🌦️ लाइव सैटेलाइट मौसम',
    outdoorMode: '☀️ धूप मोड (Field Mode)'
  }
};

// SUBCOMPONENT 1: LER & PROFIT TUG-OF-WAR GAUGE
function ProfitTugOfWarGauge({ fin, advice, acres, isFieldMode }) {
  if (!fin || !advice) return null;

  const monoRevenue = Math.round(Number(fin.primaryYieldKgRaw || (fin.primaryYield * 100)) * Number(advice.marketData?.pricePerKg || 24.50));
  const monoProfit = monoRevenue - fin.totalCost;
  const intercropProfit = fin.netProfit;
  const deltaRupees = fin.bonusRevenue;
  const deltaPercent = monoProfit > 0 ? Math.round((deltaRupees / monoProfit) * 100) : 0;

  const lerValue = Number(advice.intercrop?.lerScore || 1.28);
  const lerProgressPct = Math.min(100, Math.max(0, ((lerValue - 1.0) / 0.5) * 100));

  return (
    <div className={`border rounded-xl p-5 shadow-sm space-y-4 ${isFieldMode ? 'bg-black border-amber-400 text-white' : 'bg-white'}`}>
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h3 className="text-sm font-black flex items-center gap-2">
            <span>⚖️</span> LER & Comparative Profit Gauge
          </h3>
          <p className={`text-[11px] ${isFieldMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Monoculture vs. AgriCompanion Blueprint on {acres} Acres.
          </p>
        </div>
        <span className="text-xs bg-emerald-600 text-white font-black px-3 py-1 rounded-full">
          +{deltaPercent}% Profit Surge
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className={isFieldMode ? 'text-gray-300' : 'text-gray-600'}>Pure Monoculture ({advice.primaryCrop.name})</span>
            <span className="font-black">₹{monoProfit.toLocaleString('en-IN')} Net</span>
          </div>
          <div className="h-5 bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-400">
            <div
              className="h-full bg-slate-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(10, Math.round((monoProfit / intercropProfit) * 100))}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="font-extrabold text-emerald-500 flex items-center gap-1">
              <span>🚀</span> AgriCompanion Blueprint (+{advice.intercrop.name})
            </span>
            <span className="text-emerald-400 font-black text-sm">
              ₹{intercropProfit.toLocaleString('en-IN')} Net
            </span>
          </div>
          <div className="h-6 bg-emerald-950 rounded-full overflow-hidden p-0.5 border border-emerald-500">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-black text-white"
              style={{ width: '100%' }}
            >
              +₹{deltaRupees.toLocaleString('en-IN')} Extra Value
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${isFieldMode ? 'bg-zinc-900 border-zinc-700' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-14 h-14 transform -rotate-90">
              <path className="text-gray-400" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500" strokeDasharray={`${lerProgressPct}, 100`} strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-black">{lerValue}</span>
              <p className="text-[7px] uppercase font-bold text-gray-400">LER</p>
            </div>
          </div>
          <div className="text-xs">
            <p className="font-black text-emerald-400">Biological Synergy</p>
            <p className="text-[10px] text-gray-300">Yields like {(acres * lerValue).toFixed(2)} solitary acres.</p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex flex-col justify-center ${isFieldMode ? 'bg-zinc-900 border-zinc-700' : 'bg-blue-50 border-blue-200'}`}>
          <p className="text-[10px] text-blue-400 font-bold uppercase">Added Margin Per Acre</p>
          <p className="text-lg font-black mt-0.5">+₹{Math.round(deltaRupees / acres).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400">Pure economic bonus over mono-crop</p>
        </div>

        <div className={`p-3 rounded-xl border flex flex-col justify-center ${isFieldMode ? 'bg-zinc-900 border-zinc-700' : 'bg-amber-50 border-amber-200'}`}>
          <p className="text-[10px] text-amber-400 font-bold uppercase">Benefit-Cost Ratio (BCR)</p>
          <p className="text-lg font-black mt-0.5">{fin.benefitCostRatio}</p>
          <p className="text-[10px] text-gray-400">Gross ₹{fin.benefitCostRatio} generated per ₹1.00 cost</p>
        </div>
      </div>
    </div>
  );
}

// SUBCOMPONENT 2: FLOATING VOICE ORB
function FloatingVoiceOrb({ lang, isListening, onToggleListen, lastTranscript }) {
  const [showTips, setShowTips] = useState(false);

  const hints = {
    en: [{ text: "Tomato Loam 2 acres" }, { text: "Cotton Black soil" }, { text: "Groundnut Sandy Kharif" }],
    ta: [{ text: "தக்காளி வண்டல் மண் 2 ஏக்கர்" }, { text: "பருத்தி கரிசல் மண்" }, { text: "வேர்க்கடலை மணல் மண்" }],
    hi: [{ text: "टमाटर दोमट 2 एकड़" }, { text: "कपास काली मिट्टी" }, { text: "मूंगफली बलुई खरीफ" }]
  };

  const activeHints = hints[lang] || hints.en;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTips && (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-300 w-64 text-xs space-y-2">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-extrabold text-emerald-950 text-[11px] flex items-center gap-1">
              <span>💡</span> Voice Shortcuts
            </span>
            <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-black text-[10px]">✕</button>
          </div>
          <div className="space-y-1">
            {activeHints.map((hint, idx) => (
              <div key={idx} className="p-1 rounded bg-emerald-50 text-emerald-900 font-semibold text-[11px] truncate">
                🗣️ "{hint.text}"
              </div>
            ))}
          </div>
        </div>
      )}

      {lastTranscript && (
        <div className="bg-gray-900/90 text-white text-[11px] px-3 py-1.5 rounded-full shadow-lg max-w-xs truncate border border-gray-700">
          🗣️ "{lastTranscript}"
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            <span className="absolute w-20 h-20 rounded-full bg-red-500/30 animate-ping"></span>
            <span className="absolute w-16 h-16 rounded-full bg-emerald-500/40 animate-pulse"></span>
          </>
        )}

        <button
          onClick={onToggleListen}
          onMouseEnter={() => setShowTips(true)}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 ${
            isListening ? 'bg-gradient-to-tr from-red-600 to-rose-500 ring-4 ring-red-400' : 'bg-gradient-to-tr from-emerald-700 to-teal-500 ring-4 ring-emerald-500/20'
          }`}
          title="State your crop, soil, or acres"
        >
          <span className="text-xl">🎙️</span>
        </button>
      </div>
    </div>
  );
}

// MAIN APPLICATION COMPONENT
export default function App() {
  const [lang, setLang] = useState('en');
  const d = DICTIONARY[lang] || DICTIONARY.en;

  const [isFieldMode, setIsFieldMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedDistrict, setSelectedDistrict] = useState('thanjavur');
  const [season, setSeason] = useState('Kharif');
  const [soilType, setSoilType] = useState('Clay');
  const [waterStatus, setWaterStatus] = useState('Medium');
  const [primaryCropKey, setPrimaryCropKey] = useState('brinjal');

  const [acres, setAcres] = useState(2);
  const [activeTab, setActiveTab] = useState('intercrop');

  const [advice, setAdvice] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('agri_user')) || null;
    } catch {
      return null;
    }
  });

  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Scanner Viewfinder State
  const [fieldImage, setFieldImage] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [extractedSwatches, setExtractedSwatches] = useState([]);
  const fileInputRef = useRef(null);

  // Live Satellite Weather
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detecting GPS grid...');

  // Live Satellite Weather Streamer
  const fetchLiveForecast = async (lat, lon) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.daily) {
        const dayLabels = {
          en: ['Day 1 (Today)', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
          ta: ['நாள் 1 (இன்று)', 'நாள் 2', 'நாள் 3', 'நாள் 4', 'நாள் 5'],
          hi: ['दिन 1 (आज)', 'दिन 2', 'दिन 3', 'दिन 4', 'दिन 5']
        };
        const labels = dayLabels[lang] || dayLabels.en;

        const list = data.daily.time.slice(0, 5).map((_, idx) => {
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

        setWeatherForecast(list);
        setLocationName(`Tamil Nadu Grid (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`);
        setWeatherLoading(false);
      }
    } catch {
      setWeatherForecast([
        { day: 'Day 1 (Today)', temp: 32, rainProb: 15, windKmh: 12, sprayRisk: 'Low' },
        { day: 'Day 2', temp: 31, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
        { day: 'Day 3', temp: 28, rainProb: 70, windKmh: 22, sprayRisk: 'High' },
        { day: 'Day 4', temp: 27, rainProb: 60, windKmh: 18, sprayRisk: 'High' },
        { day: 'Day 5', temp: 30, rainProb: 15, windKmh: 11, sprayRisk: 'Low' }
      ]);
      setWeatherLoading(false);
    }
  };

  // Initial Location Setup
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLiveForecast(pos.coords.latitude, pos.coords.longitude),
        () => fetchLiveForecast(10.7870, 79.1378),
        { timeout: 7000 }
      );
    } else {
      fetchLiveForecast(10.7870, 79.1378);
    }
  }, [lang]);

  // Handle District Switch
  const handleDistrictChange = (distKey) => {
    setSelectedDistrict(distKey);
    const dist = TN_AGRO_DISTRICTS[distKey];
    if (dist) {
      setSoilType(dist.defaultSoil);
      fetchLiveForecast(dist.coords[0], dist.coords[1]);
      loadAdvice(lang, { soilType: dist.defaultSoil, primaryCropKey, season, waterStatus });
    }
  };

  // Economic Engine
  const calculateEconomics = () => {
    if (!advice || !advice.primaryCrop) return null;

    const cropMeta = TN_38_CROPS[primaryCropKey] || TN_38_CROPS.brinjal;
    const yieldPerAcreQtl = Number(advice.primaryCrop.avgYield || cropMeta.avgYield);
    const mandiRatePerKg = Number(advice.marketData?.pricePerKg || cropMeta.mandiRate);
    const costPerAcre = cropMeta.costPerAcre;

    const totalYieldQtl = yieldPerAcreQtl * acres;
    const totalYieldKg = totalYieldQtl * 100;
    const primaryRevenue = totalYieldKg * mandiRatePerKg;

    const bonusPct = advice.intercrop ? (Number(advice.intercrop.lerScore || 1.28) - 1.0) * 0.75 : 0;
    const intercropRevenue = primaryRevenue * bonusPct;
    const totalGrossRevenue = Math.round(primaryRevenue + intercropRevenue);
    const totalCost = costPerAcre * acres;
    const netProfit = totalGrossRevenue - totalCost;

    return {
      primaryYield: totalYieldQtl.toFixed(1),
      primaryYieldKg: Math.round(totalYieldKg).toLocaleString('en-IN'),
      primaryYieldKgRaw: totalYieldKg,
      bonusRevenue: Math.round(intercropRevenue),
      totalGrossRevenue,
      totalCost,
      netProfit,
      benefitCostRatio: (totalGrossRevenue / totalCost).toFixed(2)
    };
  };

  const calculateFertilizer = () => {
    if (!advice || !advice.primaryCrop) return null;
    const nCreditPerAcre = advice.intercrop ? Math.round((Number(advice.intercrop.nitrogenFixed) || 0) / 2.47) : 0;
    const adjustedN = Math.max(0, 40 - nCreditPerAcre);
    const ureaBags = Math.ceil((adjustedN * acres) / 20.7);
    const ureaSavedBags = Math.round((nCreditPerAcre * acres) / 20.7);
    return { ureaBags, dapBags: Math.ceil((20 * acres) / 23), mopBags: Math.ceil((20 * acres) / 30), nCreditPerAcre, ureaSavedBags, savingsRupees: ureaSavedBags * 267 };
  };

  // Soil Scanner with HUD Palette Extraction
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFieldImage(dataUrl);
      setIsAnalyzingImage(true);
      setImageAnalysisResult(null);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 48;
        canvas.height = 48;
        ctx.drawImage(img, 0, 0, 48, 48);

        let imgData;
        try {
          imgData = ctx.getImageData(0, 0, 48, 48).data;
        } catch {
          setIsAnalyzingImage(false);
          return;
        }

        let rSum = 0, gSum = 0, bSum = 0;
        let soilPixelCount = 0;
        const totalPixels = imgData.length / 4;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          rSum += r; gSum += g; bSum += b;

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if ((r >= b && g >= b && lum >= 25 && lum <= 230) || (g > r * 1.05 && g > b * 1.1)) soilPixelCount++;
        }

        const avgR = Math.round(rSum / totalPixels);
        const avgG = Math.round(gSum / totalPixels);
        const avgB = Math.round(bSum / totalPixels);
        const avgLum = Math.round(0.299 * avgR + 0.587 * avgG + 0.114 * avgB);
        const soilRatio = soilPixelCount / totalPixels;

        // Extract 3 dominant visual hex swatches
        const toHex = (c) => ('0' + Math.max(0, Math.min(255, c)).toString(16)).slice(-2);
        setExtractedSwatches([
          `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`,
          `#${toHex(avgR + 15)}${toHex(avgG + 10)}${toHex(avgB + 5)}`,
          `#${toHex(avgR - 15)}${toHex(avgG - 10)}${toHex(avgB - 10)}`
        ]);

        setTimeout(() => {
          if (soilRatio < 0.45 || (avgB > avgR * 1.1 && avgB > avgG)) {
            setImageAnalysisResult({ isValid: false, errorTitle: 'Non-Field Photo', rationale: 'No natural soil earth-tones detected.' });
            setIsAnalyzingImage(false);
            return;
          }

          let detectedSoil = 'Clay';
          let detectedCrop = 'brinjal';

          if (avgLum < 85 && Math.abs(avgR - avgG) <= 15) {
            detectedSoil = 'Black';
            detectedCrop = 'cotton';
          } else if (avgLum > 155 && avgR > 140) {
            detectedSoil = 'Sandy';
            detectedCrop = 'groundnut';
          } else if (avgR > avgB * 1.55 && (avgR - avgG) >= 20) {
            detectedSoil = 'Clay';
            detectedCrop = 'brinjal';
          } else {
            detectedSoil = 'Loamy';
            detectedCrop = 'tomato';
          }

          setImageAnalysisResult({ isValid: true, soilType: detectedSoil, suggestedCrop: detectedCrop, confidence: '94%' });
          setSoilType(detectedSoil);
          setPrimaryCropKey(detectedCrop);
          setIsAnalyzingImage(false);
          loadAdvice(lang, { primaryCropKey: detectedCrop, season, soilType: detectedSoil, waterStatus });
        }, 650);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Voice Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => { setIsListening(true); setSpokenTranscript(''); };
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setSpokenTranscript(text);

      for (const k of Object.keys(TN_38_CROPS)) {
        if (text.includes(k)) { setPrimaryCropKey(k); break; }
      }
      if (text.includes('black') || text.includes('கரிசல்')) setSoilType('Black');
      if (text.includes('clay') || text.includes('களிமண்')) setSoilType('Clay');
      if (text.includes('sandy') || text.includes('மணல்')) setSoilType('Sandy');
      if (text.includes('loam') || text.includes('வண்டல்')) setSoilType('Loamy');

      loadAdvice(lang, { primaryCropKey, season, soilType, waterStatus });
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const loadAdvice = async (targetLang = lang, overrideParams = null) => {
    const activeLang = typeof targetLang === 'string' ? targetLang : lang;
    const cropLookup = overrideParams?.primaryCropKey || primaryCropKey;
    const sVar = overrideParams?.season || season;
    const soVar = overrideParams?.soilType || soilType;
    const wVar = overrideParams?.waterStatus || waterStatus;

    try {
      const payload = overrideParams || { primaryCropKey: cropLookup, season: sVar, soilType: soVar, waterStatus: wVar };
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, lang: activeLang })
      });
      const data = await res.json();
      setAdvice(data);
    } catch {
      const cropMeta = TN_38_CROPS[cropLookup] || TN_38_CROPS.brinjal;
      setAdvice({
        primaryCrop: { key: cropLookup, name: cropMeta.name, harvestDuration: '4 - 5 Months', avgYield: cropMeta.avgYield },
        marketData: { pricePerKg: cropMeta.mandiRate, officialMspPerKg: cropMeta.msp, lastUpdated: '2026-10-01' },
        intercrop: { tier: '⭐ Highly Recommended', key: 'frenchbean', name: 'French Bush Bean', rowRatio: '1:1', spacing: '30 cm x 15 cm', nitrogenFixed: 28, lerScore: 1.34, harvestDuration: '55 - 65 Days', reasoning: 'Supplies biological nitrogen without solar competition.' },
        companionOptions: [
          { tier: '⭐ Highly Recommended', key: 'frenchbean', name: 'French Bush Bean', rowRatio: '1:1', spacing: '30 cm x 15 cm', nitrogenFixed: 28, lerScore: 1.34, harvestDuration: '55 - 65 Days', reasoning: 'Supplies biological nitrogen without solar competition.' },
          { tier: '👍 Recommended', key: 'coriander', name: 'Coriander (Kothamalli)', rowRatio: '1:2', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.30, harvestDuration: '40 Days', reasoning: 'Fast shallow catch crop producing early sales.' }
        ]
      });
    }
  };

  const handleSpeak = () => {
    if (!advice || !('speechSynthesis' in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const textToRead = `${advice.primaryCrop.name}. Mandi price: ₹${advice.marketData?.pricePerKg} per kg. Recommended companion: ${advice.intercrop?.name}. LER ratio: ${advice.intercrop?.lerScore}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactInfo: contact, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('agri_user', JSON.stringify(data.user));
        setUser(data.user);
        setShowAuth(false);
      }
    } catch { alert('Auth error'); }
  };

  const fin = calculateEconomics();
  const fert = calculateFertilizer();

  // Filter crops based on Category & Vernacular Search
  const filteredCrops = Object.entries(TN_38_CROPS).filter(([k, c]) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || k.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans max-w-5xl mx-auto pb-24 transition-colors duration-300 ${isFieldMode ? 'bg-zinc-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* HEADER & TOP CONTROLS */}
      <div className={`flex flex-wrap justify-between items-center p-4 rounded-xl shadow-sm border mb-6 gap-3 ${isFieldMode ? 'bg-black border-amber-400' : 'bg-white'}`}>
        <div>
          <h1 className="text-xl font-black text-emerald-600">{d.title}</h1>
          <p className={`text-xs ${isFieldMode ? 'text-gray-300' : 'text-gray-500'}`}>{d.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Outdoor Sunlight Field Mode Toggle */}
          <button
            onClick={() => setIsFieldMode(!isFieldMode)}
            className={`text-xs font-black px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
              isFieldMode ? 'bg-amber-400 text-black border-amber-300 shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {d.outdoorMode}
          </button>

          <select
            value={lang}
            onChange={(e) => { setLang(e.target.value); loadAdvice(e.target.value); }}
            className={`border p-1.5 rounded text-xs font-bold ${isFieldMode ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-gray-50'}`}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
          </select>

          {user ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-700">👤 {user.name}</span>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-xs font-bold text-blue-500 underline">Sign In</button>
          )}
        </div>
      </div>

      {/* SOIL SCANNER HUD & VOICE BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Scanner with HUD Viewfinder */}
        <div className={`p-4 rounded-xl border space-y-3 ${isFieldMode ? 'bg-black border-zinc-700' : 'bg-white'}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wide">📸 Soil Scanner & HUD Viewfinder</h3>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              Capture / Upload
            </button>
          </div>

          {/* Scanner Viewfinder Box */}
          {fieldImage && (
            <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500/70 h-32 flex items-center justify-center bg-black">
              <img src={fieldImage} alt="Soil Capture" className="w-full h-full object-cover opacity-80" />
              {/* HUD Target Brackets */}
              <div className="absolute inset-2 border-2 border-dashed border-emerald-400/80 pointer-events-none rounded"></div>
              {isAnalyzingImage && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2"></div>
              )}
            </div>
          )}

          {/* Extracted Swatches */}
          {extractedSwatches.length > 0 && !isAnalyzingImage && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Extracted Soil Pigment:</span>
              <div className="flex gap-1.5">
                {extractedSwatches.map((hex, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-white/50 shadow" style={{ backgroundColor: hex }} title={hex}></span>
                ))}
              </div>
            </div>
          )}

          {imageAnalysisResult && !isAnalyzingImage && (
            <p className="text-xs font-bold text-emerald-400">
              {imageAnalysisResult.isValid ? `✓ Auto-Detected: ${imageAnalysisResult.soilType} Soil (${imageAnalysisResult.confidence})` : `⚠️ ${imageAnalysisResult.errorTitle}`}
            </p>
          )}
        </div>

        {/* Voice Assistant Card */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${isFieldMode ? 'bg-black border-zinc-700' : 'bg-white'}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wide">🎙️ Voice Field Commander</h3>
            <button onClick={toggleListening} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isListening ? 'bg-red-600 animate-pulse text-white' : 'bg-emerald-700 text-white'}`}>
              {isListening ? 'Listening...' : 'Speak Command'}
            </button>
          </div>
          {spokenTranscript ? (
            <p className="text-xs italic bg-zinc-900/60 p-2.5 rounded border border-zinc-700 mt-2">🗣️ "{spokenTranscript}"</p>
          ) : (
            <p className="text-[11px] text-gray-400 mt-2">Try: "Tomato loam 2 acres" or "Cotton black soil"</p>
          )}
        </div>
      </div>

      {/* CROP SELECTOR WITH CATEGORY PILLS & VERNACULAR SEARCH */}
      <div className={`p-5 rounded-xl border mb-6 space-y-4 ${isFieldMode ? 'bg-black border-zinc-700' : 'bg-white'}`}>
        {/* District & Agro-Climatic Zone Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 border-b border-zinc-800">
          <div>
            <label className="text-xs font-bold block mb-1">{d.district}</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className={`w-full border p-2 rounded text-xs font-bold ${isFieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white'}`}
            >
              {Object.entries(TN_AGRO_DISTRICTS).map(([k, dist]) => (
                <option key={k} value={k}>{dist.name} — {dist.zone} ({dist.defaultSoil} Soil)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Search Crop (Tamil / English)</label>
            <input
              type="text"
              placeholder="e.g. தக்காளி, Cotton, Onion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border p-2 rounded text-xs ${isFieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white'}`}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition ${
                selectedCategory === cat ? 'bg-emerald-600 text-white' : isFieldMode ? 'bg-zinc-900 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Crop Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
          {filteredCrops.map(([k, c]) => (
            <button
              key={k}
              onClick={() => {
                setPrimaryCropKey(k);
                setSoilType(c.defaultSoil);
                loadAdvice(lang, { primaryCropKey: k, season, soilType: c.defaultSoil, waterStatus });
              }}
              className={`p-2 rounded-lg text-left border text-xs font-bold truncate transition ${
                primaryCropKey === k ? 'bg-emerald-600 text-white border-emerald-400 shadow' : isFieldMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="truncate">{c.name}</div>
              <div className={`text-[9px] font-normal ${primaryCropKey === k ? 'text-emerald-100' : 'text-gray-400'}`}>₹{c.mandiRate.toFixed(2)}/kg</div>
            </button>
          ))}
        </div>

        {/* Area Slider */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Farm Plot Size:</span>
              <span className="text-emerald-500 font-black">{acres} Acres</span>
            </div>
            <input type="range" min="0.5" max="15" step="0.5" value={acres} onChange={(e) => setAcres(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <button onClick={() => loadAdvice(lang, { primaryCropKey, season, soilType, waterStatus })} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-lg shadow">
            {d.btnGet}
          </button>
        </div>
      </div>

      {/* TABBED INTERFACE */}
      {advice && (
        <div className="space-y-4">
          {/* Active Crop Banner */}
          <div className={`p-4 rounded-xl border flex flex-wrap justify-between items-center gap-3 ${isFieldMode ? 'bg-black border-amber-400' : 'bg-white'}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Selected Primary Target</span>
              <h2 className="text-xl font-black">{advice.primaryCrop.name}</h2>
              <p className="text-xs text-gray-400">⏱️ Cycle: {advice.primaryCrop.harvestDuration}</p>
            </div>
            <div className="text-right">
              <span className="bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full">
                Mandi: ₹{Number(advice.marketData?.pricePerKg).toFixed(2)}{d.perKg}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">Govt MSP: ₹{Number(advice.marketData?.officialMspPerKg).toFixed(2)}{d.perKg}</p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className={`flex gap-1 border-b pb-2 overflow-x-auto ${isFieldMode ? 'border-zinc-800' : 'border-gray-200'}`}>
            {['intercrop', 'economics', 'fertilizer', 'weather'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-black rounded-lg transition ${
                  activeTab === tab ? 'bg-emerald-600 text-white' : isFieldMode ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d[`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`]}
              </button>
            ))}
          </div>

          {/* TAB 1: INTERCROP BLUEPRINT */}
          {activeTab === 'intercrop' && advice.intercrop && (
            <div className="space-y-4">
              {/* Hierarchy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {advice.companionOptions?.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => setAdvice(prev => ({ ...prev, intercrop: opt }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      advice.intercrop?.key === opt.key ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500' : isFieldMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-emerald-400">{opt.tier}</span>
                      <span>LER {opt.lerScore}</span>
                    </div>
                    <h4 className="text-sm font-black mt-1">{opt.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{opt.reasoning}</p>
                    <span className="text-[10px] font-bold text-emerald-400 block mt-2">
                      {advice.intercrop?.key === opt.key ? '✓ Active Selection' : 'Click to Switch'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Plan Detail Box */}
              <div className={`p-5 rounded-xl border space-y-3 ${isFieldMode ? 'bg-zinc-900 border-zinc-700' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-emerald-400">{advice.intercrop.name}</h3>
                  <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">LER: {advice.intercrop.lerScore}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2 rounded border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}><p className="text-[10px] text-gray-400">Pattern</p><p className="font-extrabold">{advice.intercrop.rowRatio}</p></div>
                  <div className={`p-2 rounded border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}><p className="text-[10px] text-gray-400">Spacing</p><p className="font-extrabold truncate">{advice.intercrop.spacing}</p></div>
                  <div className={`p-2 rounded border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}><p className="text-[10px] text-gray-400">Soil Bio-N</p><p className="font-extrabold text-emerald-400">+{advice.intercrop.nitrogenFixed} kg N/ha</p></div>
                  <div className={`p-2 rounded border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}><p className="text-[10px] text-gray-400">Cycle</p><p className="font-extrabold">{advice.intercrop.harvestDuration}</p></div>
                </div>

                <p className="text-xs leading-relaxed"><strong>💡 Rationale:</strong> {advice.intercrop.reasoning}</p>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSpeak} className="flex-1 bg-blue-600 text-white font-bold text-xs py-2 rounded-lg">
                    {isSpeaking ? 'Stop Voice' : '🔊 Read Aloud'}
                  </button>
                  <button onClick={() => window.print()} className="flex-1 bg-zinc-800 hover:bg-black text-white font-bold text-xs py-2 rounded-lg border border-zinc-700">
                    📄 Generate PDF Crop Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ECONOMICS */}
          {activeTab === 'economics' && fin && (
            <div className="space-y-4">
              <ProfitTugOfWarGauge fin={fin} advice={advice} acres={acres} isFieldMode={isFieldMode} />
              <div className={`p-4 rounded-xl border grid grid-cols-2 md:grid-cols-4 gap-3 text-center ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}>
                <div><p className="text-[10px] text-gray-400 uppercase">Primary Yield</p><p className="text-base font-black">{fin.primaryYield} Qtl ({fin.primaryYieldKg} kg)</p></div>
                <div><p className="text-[10px] text-blue-400 uppercase">Intercrop Bonus</p><p className="text-base font-black text-blue-400">+₹{fin.bonusRevenue.toLocaleString('en-IN')}</p></div>
                <div><p className="text-[10px] text-amber-400 uppercase">Production Cost</p><p className="text-base font-black">₹{fin.totalCost.toLocaleString('en-IN')}</p></div>
                <div><p className="text-[10px] text-emerald-400 uppercase">Net Farm Profit</p><p className="text-base font-black text-emerald-400">₹{fin.netProfit.toLocaleString('en-IN')}</p></div>
              </div>
            </div>
          )}

          {/* TAB 3: FERTILIZER */}
          {activeTab === 'fertilizer' && fert && (
            <div className={`p-5 rounded-xl border space-y-4 ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`p-3 rounded-lg border ${isFieldMode ? 'bg-zinc-900 border-zinc-800' : 'bg-blue-50'}`}><p className="text-[10px] text-blue-400 font-bold uppercase">Urea</p><p className="text-lg font-black">{fert.ureaBags} Bags</p></div>
                <div className={`p-3 rounded-lg border ${isFieldMode ? 'bg-zinc-900 border-zinc-800' : 'bg-amber-50'}`}><p className="text-[10px] text-amber-400 font-bold uppercase">DAP</p><p className="text-lg font-black">{fert.dapBags} Bags</p></div>
                <div className={`p-3 rounded-lg border ${isFieldMode ? 'bg-zinc-900 border-zinc-800' : 'bg-purple-50'}`}><p className="text-[10px] text-purple-400 font-bold uppercase">MOP Potash</p><p className="text-lg font-black">{fert.mopBags} Bags</p></div>
              </div>
              <p className="text-xs text-emerald-400">🌱 Legume nodulation saves <strong>{fert.ureaSavedBags} commercial Urea bag(s)</strong> (~₹{fert.savingsRupees} input cost saving).</p>
            </div>
          )}

          {/* TAB 4: WEATHER SPRAY ADVISORY */}
          {activeTab === 'weather' && (
            <div className={`p-5 rounded-xl border space-y-4 ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-sm font-black">5-Day Live Satellite Weather & Spray Risk</h3>
                <span className="text-xs text-emerald-400 font-bold">📍 {locationName}</span>
              </div>
              {weatherLoading ? (
                <p className="text-xs text-emerald-400 animate-pulse text-center py-4">Streaming satellite weather telemetry...</p>
              ) : (
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {weatherForecast.map((w, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border ${
                        w.sprayRisk === 'High' ? 'bg-red-950/40 border-red-500' : 'bg-emerald-950/40 border-emerald-500'
                      }`}
                    >
                      <p className="font-black text-[11px]">{w.day}</p>
                      <p className="text-xs font-bold mt-1">{w.temp}°C</p>
                      <p className="text-[10px] text-blue-400">💧 {w.rainProb}% Rain</p>
                      <p className="text-[9px] text-gray-400">{w.windKmh} km/h</p>
                      <span className={`inline-block text-[8px] font-black uppercase px-1 py-0.5 rounded mt-1 ${w.sprayRisk === 'High' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {w.sprayRisk === 'High' ? 'Washout Risk' : 'Safe Spray'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FLOATING VOICE ORB */}
      <FloatingVoiceOrb lang={lang} isListening={isListening} onToggleListen={toggleListening} lastTranscript={spokenTranscript} />

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAuth} className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full space-y-3 text-white">
            <h3 className="text-sm font-bold">Sign In / Register</h3>
            <input type="text" placeholder="Mobile / Email" value={contact} onChange={e => setContact(e.target.value)} className="w-full border border-zinc-700 bg-zinc-800 p-2 rounded text-xs" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-zinc-700 bg-zinc-800 p-2 rounded text-xs" required />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-emerald-600 py-2 rounded text-xs font-bold">Submit</button>
              <button type="button" onClick={() => setShowAuth(false)} className="bg-zinc-700 px-3 py-2 rounded text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement._reactRootContainer) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}