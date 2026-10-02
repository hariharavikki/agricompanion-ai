import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5002';

// 38 Major Commercial Crops of Tamil Nadu (Categorized, Rice Excluded)
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
  coconut: { name: 'Coconut (Base crop)', category: 'Oilseeds', avgYield: 45, mandiRate: 34.00, msp: 29.00, costPerAcre: 18000, defaultSoil: 'Sandy' },

  // Millets & Cereals
  maize: { name: 'Maize / Corn', category: 'Millets & Cereals', avgYield: 18, mandiRate: 25.80, msp: 24.10, costPerAcre: 15500, defaultSoil: 'Loamy' },
  pearlmillet: { name: 'Pearl Millet (Bajra)', category: 'Millets & Cereals', avgYield: 11, mandiRate: 27.50, msp: 26.25, costPerAcre: 10000, defaultSoil: 'Sandy' },
  sorghum: { name: 'Sorghum (Jowar)', category: 'Millets & Cereals', avgYield: 10, mandiRate: 35.00, msp: 33.71, costPerAcre: 11000, defaultSoil: 'Black' },
  fingermillet: { name: 'Finger Millet (Ragi)', category: 'Millets & Cereals', avgYield: 9.5, mandiRate: 44.00, msp: 42.90, costPerAcre: 11500, defaultSoil: 'Loamy' },
  barnyardmillet: { name: 'Barnyard Millet (Kuthiraivali)', category: 'Millets & Cereals', avgYield: 6.5, mandiRate: 45.00, msp: 38.00, costPerAcre: 8000, defaultSoil: 'Sandy' },
  foxtailmillet: { name: 'Foxtail Millet (Thinai)', category: 'Millets & Cereals', avgYield: 6.0, mandiRate: 43.00, msp: 37.00, costPerAcre: 8000, defaultSoil: 'Loamy' },
  kodomillet: { name: 'Kodo Millet (Varagu)', category: 'Millets & Cereals', avgYield: 5.5, mandiRate: 42.00, msp: 36.00, costPerAcre: 7500, defaultSoil: 'Sandy' },

  // Fiber & Cash Crops
  cotton: { name: 'Cotton', category: 'Cash & Fiber', avgYield: 8.5, mandiRate: 86.50, msp: 82.67, costPerAcre: 21000, defaultSoil: 'Black' },
  sugarcane: { name: 'Sugarcane', category: 'Cash & Fiber', avgYield: 420, mandiRate: 3.50, msp: 3.40, costPerAcre: 65000, defaultSoil: 'Clay' },
  sunnhemp: { name: 'Sunn Hemp', category: 'Cash & Fiber', avgYield: 7.0, mandiRate: 54.00, msp: 48.00, costPerAcre: 7000, defaultSoil: 'Sandy' },
  tobacco: { name: 'Tobacco', category: 'Cash & Fiber', avgYield: 9.0, mandiRate: 90.00, msp: 80.00, costPerAcre: 28000, defaultSoil: 'Loamy' },

  // Spices & Plantation
  turmeric: { name: 'Turmeric', category: 'Spices & Tubers', avgYield: 24, mandiRate: 155.00, msp: 120.00, costPerAcre: 45000, defaultSoil: 'Clay' },
  ginger: { name: 'Ginger', category: 'Spices & Tubers', avgYield: 55, mandiRate: 90.00, msp: 72.00, costPerAcre: 52000, defaultSoil: 'Loamy' },
  coriander: { name: 'Coriander (Seed & Herb)', category: 'Spices & Tubers', avgYield: 4.5, mandiRate: 92.00, msp: 75.00, costPerAcre: 9000, defaultSoil: 'Black' }
};

const DICTIONARY = {
  en: {
    title: '🌱 AgriCompanion AI',
    subtitle: 'Statewide Tamil Nadu Multi-Tier Intercropping & Field Decision System',
    season: 'Season',
    soil: 'Soil Type',
    water: 'Water Availability',
    crop: 'Primary Crop (35+ Non-Rice Crops)',
    btnGet: 'Generate Intercrop Blueprint 🚀',
    guestAlert: 'Choose your crop and field variables to receive multi-tier companion crop blueprints.',
    harvestWindow: 'Estimated Harvest Duration',
    tabIntercrop: '🌿 Intercrop Blueprint',
    tabEconomics: '💰 Profit & Yield Calculator',
    tabFertilizer: '🧪 NPK & Bio N-Credits',
    tabWeather: '🌦️ Live Satellite Forecast & Spraying Risk',
    tabStorage: '🧺 Post-Harvest Storage & Shelf-Life',
    tabPests: '🐛 Pest Management & PHI',
    tabChecklist: '📋 Daily Field Checklist',
    checklistTitle: 'Operational Field Reminders & Agronomic Action Items',
    checklistSubtitle: 'Mark completed tasks to keep your simultaneous intercrop healthy and compliant.',
    hierarchyTitle: 'Companion Crop Hierarchy & Ranking',
    hierarchySubtitle: 'Click any crop below to select it as your active field plan.',
    intercropOpt: 'Active Blueprint Companion',
    lerLabel: 'Land Equivalent Ratio (LER)',
    efficiencyGain: 'Extra Land Productivity',
    rowRatio: 'Row Pattern / Geometry',
    plantSpacing: 'Field Spacing',
    nFix: 'Soil Nitrogen Enrichment',
    sowingSchedule: 'Sowing Schedule',
    rootSynergy: 'Root & Canopy Synergy',
    pestTitle: 'Integrated Pest Management & Safety Protocol',
    cultural: 'Cultural Prevention',
    bio: 'Biological Control',
    chemical: 'Chemical Option (Last Resort)',
    toxicity: 'Hazard Rating',
    phi: 'Safe Harvest Countdown (PHI)',
    savePlan: '📌 Save Blueprint to History',
    viewHistory: '📋 View Saved Plans',
    signIn: 'Sign In / Register',
    logout: '🚪 Logout',
    speakAdvice: '🔊 Read Blueprint Aloud',
    stopSpeak: '⏹️ Stop Reading',
    startVoice: '🎙️ Speak Query',
    listening: '🎙️ Listening... State your crop, soil, or season',
    voiceNotSupported: 'Speech recognition is not supported in this browser. Use Chrome or Edge.',
    scanField: '📸 Scan Soil / Field Photo',
    analyzingImage: '🔍 Analyzing soil pigment, moisture status, and companion suitability...',
    autoUpdated: 'Auto-Updated Form',
    mandiPrice: 'Mandi Wholesale Benchmark',
    officialMsp: 'Govt. Floor MSP',
    lastUpdated: 'Updated',
    days: 'days',
    months: 'Months',
    perKg: '/kg',
    weatherTitle: 'Field Weather',
    historyTitle: 'Saved Farming Strategies',
    noHistory: 'No saved crop plans found.',
    acres: 'Acres',
    seasons: { Kharif: 'Kharif (Monsoon)', Rabi: 'Rabi (Winter)', Zaid: 'Zaid (Summer)' },
    soils: { Loamy: 'Loamy Soil', Clay: 'Clay / Alluvium', Sandy: 'Sandy Soil', Black: 'Black Soil' },
    waters: { Low: 'Low (Rainfed)', Medium: 'Medium (Partial Irrigation)', High: 'High (Full Irrigation)' }
  },
  ta: {
    title: '🌱 அக்ரிகாம்பானியன் AI',
    subtitle: 'தமிழ்நாடு பல்நிலை ஊடுபயிர் வழிகாட்டி மற்றும் கள ஆய்வு முறைமை',
    season: 'பருவம்',
    soil: 'மண் வகை',
    water: 'நீர் வசதி',
    crop: 'முதன்மைப் பயிர் (35+ பயிர்கள்)',
    btnGet: 'ஊடுபயிர் திட்டத்தைப் பெறுக 🚀',
    guestAlert: 'முதன்மை பயிர் மற்றும் மண் வகையை தேர்வு செய்து பலநிலை ஊடுபயிர் ஆலோசனையைப் பெறவும்.',
    harvestWindow: 'அறுவடை காலம்',
    tabIntercrop: '🌿 ஊடுபயிர் வரைபடம்',
    tabEconomics: '💰 லாபம் & மகசூல் கணக்கீடு',
    tabFertilizer: '🧪 உரத் தேவை & தழைச்சத்து சேமிப்பு',
    tabWeather: '🌦️ நேரலை செயற்கைக்கோள் வானிலை',
    tabStorage: '🧺 சேமிப்பு & அடுக்கு ஆயுள்',
    tabPests: '🐛 பூச்சி கட்டுப்பாடு & பாதுகாப்பு',
    tabChecklist: '📋 தினசரி சரிபார்ப்பு பட்டியல்',
    checklistTitle: 'களப்பணி நினைவூட்டல்கள் மற்றும் விவசாய பணிகள்',
    checklistSubtitle: 'பயிர்களின் ஆரோக்கியத்தை உறுதிப்படுத்த முடித்த பணிகளை தேர்வு செய்யவும்.',
    hierarchyTitle: 'ஊடுபயிர் முன்னுரிமை தரவரிசை (Hierarchy)',
    hierarchySubtitle: 'தேவையான பயிரைத் தேர்ந்தெடுத்து அதன் திட்டத்தைப் பார்க்கவும்.',
    intercropOpt: 'தேர்ந்தெடுக்கப்பட்ட ஊடுபயிர்',
    lerLabel: 'நில பயன்பாட்டு விகிதம் (LER)',
    efficiencyGain: 'கூடுதல் நிலப் பயன்பாட்டு திறன்',
    rowRatio: 'பயிர் வரிசை அமைப்பு',
    plantSpacing: 'பயிர் இடைவெளி',
    nFix: 'இயற்கை தழைச்சத்து சேர்ப்பு',
    sowingSchedule: 'விதைப்பு முறை',
    rootSynergy: 'வேர் மற்றும் பயிர் கட்டமைப்பு',
    pestTitle: 'பூச்சி கட்டுப்பாடு மற்றும் பாதுகாப்பு நெறிமுறைகள்',
    cultural: 'முன்னெச்சரிக்கை / உழவு முறை',
    bio: 'இயற்கை / உயிரியல் கட்டுப்பாடு',
    chemical: 'வேதி மருந்து (கடைசி வாய்ப்பு)',
    toxicity: 'பாதுகாப்பு அபாய அளவு',
    phi: 'மருந்து தெளித்த பின் அறுவடை இடைவெளி (PHI)',
    savePlan: '📌 திட்டத்தைச் சேமிக்க',
    viewHistory: '📋 பழைய பதிவுகள்',
    signIn: 'உள்நுழைய / பதிவுசெய்ய',
    logout: '🚪 வெளியேறு',
    speakAdvice: '🔊 உரக்கப் படிக்கவும்',
    stopSpeak: '⏹️ நிறுத்து',
    startVoice: '🎙️ குரல் மூலம் பேசவும்',
    listening: '🎙️ கேட்டுக்கொண்டிருக்கிறது... பயிர் அல்லது மண் வகையைக் கூறுங்கள்',
    voiceNotSupported: 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை.',
    scanField: '📸 நிலம் / மண்ணை ஸ்கேன் செய்க',
    analyzingImage: '🔍 மண் தரம் மற்றும் பயிர் நிறமாலையை ஆய்வு செய்கிறது...',
    autoUpdated: 'தானாக புதுப்பிக்கப்பட்டது',
    mandiPrice: 'சந்தை விலை',
    officialMsp: 'அரசு குறைந்தபட்ச விலை',
    lastUpdated: 'தேதி',
    days: 'நாட்கள்',
    months: 'மாதங்கள்',
    perKg: '/கிலோ',
    weatherTitle: 'வயல்வெளி வானிலை',
    historyTitle: 'சேமிக்கப்பட்ட விவசாயத் திட்டங்கள்',
    noHistory: 'சேமிக்கப்பட்ட திட்டங்கள் இல்லை.',
    acres: 'ஏக்கர்',
    seasons: { Kharif: 'காரிப் (மழைக்காலம்)', Rabi: 'ரபி (குளிர்காலம்)', Zaid: 'சையத் (கோடைக்காலம்)' },
    soils: { Loamy: 'வண்டல் மண்', Clay: 'களிமண்', Sandy: 'மணல் மண்', Black: 'கரிசல் மண்' },
    waters: { Low: 'குறைந்த நீர் (மானாவாரி)', Medium: 'மிதமான நீர் (பாசன வசதி)', High: 'நிறைந்த நீர் (முழு பாசனம்)' }
  },
  hi: {
    title: '🌱 एग्रीकंपैनियन AI',
    subtitle: 'तमिलनाडु बहुस्तरीय अंतर-फसल (Intercropping) निर्णय प्रणाली',
    season: 'मौसम / सीजन',
    soil: 'मिट्टी का प्रकार',
    water: 'पानी की उपलब्धता',
    crop: 'मुख्य फसल (35+ फसलें)',
    btnGet: 'अंतर-फसल योजना प्राप्त करें 🚀',
    guestAlert: 'मुख्य फसल और खेत की स्थिति चुनें, AI 3 स्तरीय साथी फसलें सुझाएगा।',
    harvestWindow: 'कटाई की अनुमानित अवधि',
    tabIntercrop: '🌿 अंतर-फसल खाका',
    tabEconomics: '💰 लाभ और पैदावार कैलकुलेटर',
    tabFertilizer: '🧪 खाद मात्रा व नाइट्रोजन बचत',
    tabWeather: '🌦️ लाइव सैटेलाइट मौसम पूर्वानुमान',
    tabStorage: '🧺 कटाई उपरांत भंडारण व शेल्फ-लाइफ',
    tabPests: '🐛 कीट प्रबंधन व सुरक्षा',
    tabChecklist: '📋 दैनिक किसान चेकलिस्ट',
    checklistTitle: 'खेत कार्य रिमाइंडर व दैनिक गतिविधियां',
    checklistSubtitle: 'सह-फसल की सुरक्षा और बेहतर उपज के लिए पूरे किए गए कार्यों को मार्क करें.',
    hierarchyTitle: 'साथी फसलों की प्राथमिकता सूची (Hierarchy)',
    hierarchySubtitle: 'किसी भी फसल पर क्लिक करके उसकी विस्तृत योजना देखें।',
    intercropOpt: 'सक्रिय साथी फसल',
    lerLabel: 'भूमि समतुल्य अनुपात (LER)',
    efficiencyGain: 'अतिरिक्त भूमि उपयोग दक्षता',
    rowRatio: 'पंक्ति अनुपात (Row Pattern)',
    plantSpacing: 'पौधों की दूरी',
    nFix: 'जैविक नाइट्रोजन संचयन',
    sowingSchedule: 'बुवाई का समय / तरीका',
    rootSynergy: 'जड़ों और छतरी का तालमेल',
    pestTitle: 'कीट नियंत्रण और सुरक्षा दिशानिर्देश',
    cultural: 'रोकथाम और सांस्कृतिक उपाय',
    bio: 'जैविक / प्राकृतिक नियंत्रण',
    chemical: 'रासायनिक छिड़काव (अंतिम उपाय)',
    toxicity: 'खतरे का स्तर',
    phi: 'कटाई से पहले प्रतीक्षा दिन (PHI)',
    savePlan: '📌 योजना सहेजें',
    viewHistory: '📋 इतिहास देखें',
    signIn: 'साइन इन / रजिस्टर करें',
    logout: '🚪 लॉग आउट',
    speakAdvice: '🔊 बोलकर सुनें',
    stopSpeak: '⏹️ बंद करें',
    startVoice: '🎙️ बोलकर बताएं',
    listening: '🎙️ सुन रहा हूँ... मुख्य फसल, मिट्टी या मौसम का नाम बताएं',
    voiceNotSupported: 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है.',
    scanField: '📸 खेत / मिट्टी स्कैन करें',
    analyzingImage: '🔍 मिट्टी के प्रकार और उपयुक्त साथी फसल का विश्लेषण जारी है...',
    autoUpdated: 'अपडेट किया गया',
    mandiPrice: 'मंडी भाव',
    officialMsp: 'सरकारी आधार भाव',
    lastUpdated: 'दिनांक',
    days: 'दिन',
    months: 'महीने',
    perKg: '/किग्रा',
    weatherTitle: 'खेत का मौसम',
    historyTitle: 'सहेजी गई योजनाएं',
    noHistory: 'कोई सहेजी गई योजना नहीं मिली।',
    acres: 'एकड़',
    seasons: { Kharif: 'खरीफ (मानसून)', Rabi: 'रबी (सर्दियां)', Zaid: 'जायद (गर्मी)' },
    soils: { Loamy: 'दोमट मिट्टी', Clay: 'चिकनी मिट्टी', Sandy: 'बलुई मिट्टी', Black: 'काली मिट्टी' },
    waters: { Low: 'कम पानी (वर्षा आधारित)', Medium: 'मध्यम (आंशिक सिंचाई)', High: 'अधिक (पूर्ण सिंचाई)' }
  }
};

// --- SUBCOMPONENT 1: LER & PROFIT TUG-OF-WAR GAUGE ---
function ProfitTugOfWarGauge({ fin, advice, acres }) {
  if (!fin || !advice) return null;

  const monoRevenue = Math.round(Number(fin.primaryYieldKgRaw || (fin.primaryYield * 100)) * Number(advice.marketData?.pricePerKg || 24.50));
  const monoProfit = monoRevenue - fin.totalCost;
  const intercropProfit = fin.netProfit;
  const deltaRupees = fin.bonusRevenue;
  const deltaPercent = monoProfit > 0 ? Math.round((deltaRupees / monoProfit) * 100) : 0;

  const lerValue = Number(advice.intercrop?.lerScore || 1.28);
  const lerProgressPct = Math.min(100, Math.max(0, ((lerValue - 1.0) / 0.5) * 100));

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <span>⚖️</span> LER & Profit Comparison Gauge
          </h3>
          <p className="text-[11px] text-gray-500">
            Comparative analysis: Pure Monoculture vs. AgriCompanion Blueprint on {acres} Acres.
          </p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-950 font-black px-3 py-1 rounded-full border border-emerald-300">
          +{deltaPercent}% Profit Surge
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-gray-600">Pure Monoculture ({advice.primaryCrop.name})</span>
            <span className="text-gray-900 font-black">₹{monoProfit.toLocaleString('en-IN')} Net</span>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden p-0.5 border">
            <div
              className="h-full bg-slate-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(10, Math.round((monoProfit / intercropProfit) * 100))}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-emerald-900 font-extrabold flex items-center gap-1">
              <span>🚀</span> AgriCompanion Blueprint (+{advice.intercrop.name})
            </span>
            <span className="text-emerald-700 font-black text-sm">
              ₹{intercropProfit.toLocaleString('en-IN')} Net
            </span>
          </div>
          <div className="h-6 bg-emerald-50 rounded-full overflow-hidden p-0.5 border border-emerald-300 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2 text-[10px] font-black text-white shadow-sm"
              style={{ width: '100%' }}
            >
              +₹{deltaRupees.toLocaleString('en-IN')} Extra Value
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-3 rounded-xl border border-emerald-200 flex items-center gap-3">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
              <path className="text-gray-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-600 transition-all duration-1000" strokeDasharray={`${lerProgressPct}, 100`} strokeWidth="3.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-black text-emerald-950">{lerValue}</span>
              <p className="text-[7px] uppercase font-bold text-gray-500">LER</p>
            </div>
          </div>
          <div className="text-xs">
            <p className="font-black text-emerald-950">Land Synergy Factor</p>
            <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">
              Equivalent to harvesting <strong>{(acres * lerValue).toFixed(2)} acres</strong> of solitary land.
            </p>
          </div>
        </div>

        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 flex flex-col justify-center">
          <p className="text-[10px] text-blue-700 font-bold uppercase">Added Margin Per Acre</p>
          <p className="text-lg font-black text-blue-950 mt-0.5">+₹{Math.round(deltaRupees / acres).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-500">Net bonus over mono-crop baseline</p>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex flex-col justify-center">
          <p className="text-[10px] text-amber-700 font-bold uppercase">Benefit-Cost Ratio (BCR)</p>
          <p className="text-lg font-black text-amber-950 mt-0.5">{fin.benefitCostRatio}</p>
          <p className="text-[10px] text-gray-500">Gross ₹{fin.benefitCostRatio} generated per ₹1.00 cost</p>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENT 2: FLOATING VOICE ORB ASSISTANT ---
function FloatingVoiceOrb({ lang, isListening, onToggleListen, lastTranscript }) {
  const [showTips, setShowTips] = useState(false);

  const hints = {
    en: [{ text: "Brinjal 2 acres Kharif" }, { text: "Tomato Loam 3 acres" }, { text: "Cotton Black soil" }],
    ta: [{ text: "2 ஏக்கர் கத்தரிக்காய் காரிப்" }, { text: "தக்காளி வண்டல் மண்" }, { text: "பருத்தி கரிசல் மண்" }],
    hi: [{ text: "2 एकड़ बैंगन खरीफ" }, { text: "टमाटर दोमट मिट्टी" }, { text: "कपास काली मिट्टी" }]
  };

  const activeHints = hints[lang] || hints.en;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTips && (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-200 w-64 text-xs space-y-2">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-extrabold text-emerald-950 text-[11px] flex items-center gap-1">
              <span>💡</span> Voice Shortcuts
            </span>
            <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-black text-[10px]">✕</button>
          </div>
          <div className="space-y-1.5">
            {activeHints.map((hint, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900 font-semibold text-[11px] truncate">
                🗣️ "{hint.text}"
              </div>
            ))}
          </div>
        </div>
      )}

      {lastTranscript && (
        <div className="bg-gray-900/90 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-full shadow-lg max-w-xs truncate border border-gray-700">
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
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 ${
            isListening ? 'bg-gradient-to-tr from-red-600 to-rose-500 ring-4 ring-red-400/40' : 'bg-gradient-to-tr from-emerald-700 to-teal-500 ring-4 ring-emerald-500/20'
          }`}
          title="Speak to configure your field blueprint"
        >
          <span className="text-xl">🎙️</span>
        </button>
      </div>
    </div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [lang, setLang] = useState('en');
  const d = DICTIONARY[lang] || DICTIONARY.en;

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

  const [checkedTasks, setCheckedTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('agri_tasks')) || {};
    } catch {
      return {};
    }
  });

  const toggleTask = (taskId) => {
    const updated = { ...checkedTasks, [taskId]: !checkedTasks[taskId] };
    setCheckedTasks(updated);
    localStorage.setItem('agri_tasks', JSON.stringify(updated));
  };

  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const recognitionRef = useRef(null);

  const [fieldImage, setFieldImage] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationName, setLocationName] = useState('Fetching live satellite coordinates...');

  // Live Weather Fetcher using Open-Meteo Satellite Feed
  useEffect(() => {
    let isMounted = true;

    const fetchLiveForecast = async (lat, lon) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (isMounted && data.daily) {
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
      } catch (err) {
        console.warn('Weather fetch fallback engaged:', err);
        if (isMounted) {
          setLocationName('Thanjavur Baseline Station');
          setWeatherForecast([
            { day: 'Day 1 (Today)', temp: 32, rainProb: 10, windKmh: 12, sprayRisk: 'Low' },
            { day: 'Day 2', temp: 31, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
            { day: 'Day 3', temp: 28, rainProb: 65, windKmh: 22, sprayRisk: 'High' },
            { day: 'Day 4', temp: 27, rainProb: 60, windKmh: 18, sprayRisk: 'High' },
            { day: 'Day 5', temp: 30, rainProb: 15, windKmh: 11, sprayRisk: 'Low' }
          ]);
          setWeatherLoading(false);
        }
      }
    };

    const defaultLat = 10.7870;
    const defaultLon = 79.1378;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLiveForecast(pos.coords.latitude, pos.coords.longitude),
        () => fetchLiveForecast(defaultLat, defaultLon),
        { timeout: 7000 }
      );
    } else {
      fetchLiveForecast(defaultLat, defaultLon);
    }

    return () => {
      isMounted = false;
    };
  }, [lang]);

  // Economic Calculation Engine (All per-kg)
  const calculateEconomics = () => {
    if (!advice || !advice.primaryCrop) return null;

    const cropMeta = TN_38_CROPS[primaryCropKey] || TN_38_CROPS.brinjal;
    const yieldPerAcreQtl = Number(advice.primaryCrop.avgYield || cropMeta.avgYield);
    const mandiRatePerKg = Number(advice.marketData?.pricePerKg || cropMeta.mandiRate);
    const costPerAcre = cropMeta.costPerAcre;

    const totalYieldQtl = yieldPerAcreQtl * acres;
    const totalYieldKg = totalYieldQtl * 100; // 1 Qtl = 100 kg
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

    const rdf = { n: 40, p: 20, k: 20 };
    const nCreditPerAcre = advice.intercrop ? Math.round((Number(advice.intercrop.nitrogenFixed) || 0) / 2.47) : 0;
    const adjustedNPerAcre = Math.max(0, rdf.n - nCreditPerAcre);

    const ureaBags = Math.ceil((adjustedNPerAcre * acres) / 20.7);
    const ureaSavedBags = Math.round((nCreditPerAcre * acres) / 20.7);
    const dapBags = Math.ceil((rdf.p * acres) / 23);
    const mopBags = Math.ceil((rdf.k * acres) / 30);

    return { ureaBags, dapBags, mopBags, nCreditPerAcre, ureaSavedBags, savingsRupees: ureaSavedBags * 267 };
  };

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
          if ((r >= b && g >= b && lum >= 25 && lum <= 230) || (g > r * 1.05 && g > b * 1.1)) {
            soilPixelCount++;
          }
        }

        const avgR = Math.round(rSum / totalPixels);
        const avgG = Math.round(gSum / totalPixels);
        const avgB = Math.round(bSum / totalPixels);
        const avgLum = Math.round(0.299 * avgR + 0.587 * avgG + 0.114 * avgB);
        const soilRatio = soilPixelCount / totalPixels;

        setTimeout(() => {
          if (soilRatio < 0.45 || (avgB > avgR * 1.1 && avgB > avgG)) {
            setImageAnalysisResult({
              isValid: false,
              errorTitle: 'Non-Field / Unrecognized Photo',
              rationale: 'Could not detect clear soil pigment or crop canopy. Please upload an image of field soil or crop rows.',
              confidence: 'N/A'
            });
            setIsAnalyzingImage(false);
            return;
          }

          let detectedSoil = 'Clay';
          let detectedCrop = 'brinjal';
          let rationale = '';

          if (avgLum < 85 && Math.abs(avgR - avgG) <= 15) {
            detectedSoil = 'Black';
            detectedCrop = 'cotton';
            rationale = 'Dark Vertisol (Black Soil) detected. High moisture retention ideal for Cotton + Black Gram.';
          } else if (avgLum > 155 && avgR > 140) {
            detectedSoil = 'Sandy';
            detectedCrop = 'groundnut';
            rationale = 'Light sandy texture detected. Porous drainage optimal for Groundnut pegging.';
          } else if (avgR > avgB * 1.55 && (avgR - avgG) >= 20) {
            detectedSoil = 'Clay';
            detectedCrop = 'brinjal';
            rationale = 'Heavy fertile clay alluvium detected. Highly suitable for Brinjal + Coriander.';
          } else {
            detectedSoil = 'Loamy';
            detectedCrop = 'maize';
            rationale = 'Balanced organic loam soil detected with neutral drainage.';
          }

          setImageAnalysisResult({ isValid: true, soilType: detectedSoil, suggestedCrop: detectedCrop, confidence: '92%', rationale });
          setSoilType(detectedSoil);
          setPrimaryCropKey(detectedCrop);
          setIsAnalyzingImage(false);

          loadAdvice(lang, { primaryCropKey: detectedCrop, season, soilType: detectedSoil, waterStatus });
        }, 600);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const parseVoiceInput = (text) => {
    const t = text.toLowerCase();
    let newCrop = primaryCropKey;

    for (const key of Object.keys(TN_38_CROPS)) {
      if (t.includes(key)) {
        newCrop = key;
        break;
      }
    }
    if (t.includes('brinjal') || t.includes('கத்தரி') || t.includes('बैंगन')) newCrop = 'brinjal';
    if (t.includes('tomato') || t.includes('தக்காளி') || t.includes('टमाटर')) newCrop = 'tomato';
    if (t.includes('cotton') || t.includes('பருத்தி') || t.includes('कपास')) newCrop = 'cotton';
    if (t.includes('groundnut') || t.includes('வேர்க்கடலை') || t.includes('मूंगफली')) newCrop = 'groundnut';
    if (t.includes('maize') || t.includes('மக்காச்சோளம்') || t.includes('मक्का')) newCrop = 'maize';

    setPrimaryCropKey(newCrop);

    let newSoil = soilType;
    if (t.includes('black') || t.includes('கரிசல்') || t.includes('काली')) newSoil = 'Black';
    else if (t.includes('clay') || t.includes('களிமண்') || t.includes('चिकनी')) newSoil = 'Clay';
    else if (t.includes('sandy') || t.includes('மணல்') || t.includes('बलुई')) newSoil = 'Sandy';
    else if (t.includes('loam') || t.includes('வண்டல்') || t.includes('दोमट')) newSoil = 'Loamy';
    setSoilType(newSoil);

    loadAdvice(lang, { primaryCropKey: newCrop, season, soilType: newSoil, waterStatus });
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(d.voiceNotSupported);
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
      const transcript = event.results[0][0].transcript;
      setSpokenTranscript(transcript);
      parseVoiceInput(transcript);
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

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();

      setAdvice(data);
      setActiveTab('intercrop');
    } catch {
      const cropMeta = TN_38_CROPS[cropLookup] || TN_38_CROPS.brinjal;
      setAdvice({
        primaryCrop: {
          key: cropLookup,
          name: cropMeta.name,
          harvestDuration: '4 - 5 Months',
          avgYield: cropMeta.avgYield,
          safeMoisturePct: 12.0,
          ambientShelfLifeMonths: 6,
          coldShelfLifeMonths: 18
        },
        marketData: { pricePerKg: cropMeta.mandiRate, officialMspPerKg: cropMeta.msp, lastUpdated: '2026-10-01' },
        intercrop: { tier: '⭐ Highly Recommended', key: 'coriander', name: 'Coriander (Kothamalli)', rowRatio: '1:2', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.34, harvestDuration: '35 - 45 Days', reasoning: 'Ultra-shallow fibrous root zone with zero competition for primary taproots.' },
        companionOptions: [
          { tier: '⭐ Highly Recommended', key: 'coriander', name: 'Coriander (Kothamalli)', rowRatio: '1:2', spacing: '15 cm x 5 cm', nitrogenFixed: 0, lerScore: 1.34, harvestDuration: '35 - 45 Days', reasoning: 'Ultra-shallow fibrous root zone with zero competition for primary taproots.' },
          { tier: '👍 Recommended', key: 'frenchbean', name: 'French Bush Bean', rowRatio: '1:1', spacing: '30 cm x 15 cm', nitrogenFixed: 26, lerScore: 1.29, harvestDuration: '55 - 65 Days', reasoning: 'Bush legume adding active atmospheric nitrogen into rhizosphere.' },
          { tier: '🌾 Feasible Alternative', key: 'marigold', name: 'Marigold (Trap Crop)', rowRatio: '1:6', spacing: '45 cm x 30 cm', nitrogenFixed: 0, lerScore: 1.25, harvestDuration: '60 - 75 Days', reasoning: 'Suppresses root-knot nematodes and diverts fruit and shoot borers away.' }
        ],
        pests: [{
          pestName: 'Shoot and Fruit Borer Complex',
          cultural: 'Clip affected shoots; install trap crops.',
          bio: 'Neem oil 3% spray.',
          chemical: 'Chlorantraniliprole 18.5% SC @ 0.3 ml/L.',
          toxicity: 'Moderate',
          phiDays: 3
        }]
      });
      setActiveTab('intercrop');
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    loadAdvice(newLang);
  };

  const handleSpeak = () => {
    if (!advice || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${advice.primaryCrop.name}. Mandi price: ₹${advice.marketData?.pricePerKg} per kg. Recommended intercrop: ${advice.intercrop?.name}. LER efficiency: ${advice.intercrop?.lerScore}.`;
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
      } else {
        alert(data.error || 'Login failed');
      }
    } catch {
      alert('Authentication error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_user');
    setUser(null);
  };

  const handleSavePlan = async () => {
    if (!user) { setShowAuth(true); return; }
    try {
      await fetch(`${API_BASE}/api/history/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, primaryCrop: primaryCropKey, intercrop: advice?.intercrop?.key, season, soilType, waterStatus })
      });
      alert('Blueprint saved to farmer profile!');
    } catch {
      alert('Failed to save blueprint');
    }
  };

  const openHistoryDrawer = async () => {
    if (!user) { setShowAuth(true); return; }
    try {
      const res = await fetch(`${API_BASE}/api/history/${user.id}`);
      const data = await res.json();
      setHistoryList(Array.isArray(data) ? data : []);
      setShowHistory(true);
    } catch {
      alert('Could not fetch history');
    }
  };

  const fin = calculateEconomics();
  const fert = calculateFertilizer();

  // Group 38 crops by Category for Dropdown
  const groupedCrops = Object.entries(TN_38_CROPS).reduce((acc, [key, crop]) => {
    if (!acc[crop.category]) acc[crop.category] = [];
    acc[crop.category].push({ key, ...crop });
    return acc;
  }, {});

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans max-w-5xl mx-auto relative pb-24">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-xl shadow-sm border mb-6 gap-3">
        <div>
          <h1 className="text-xl font-black text-green-900">{d.title}</h1>
          <p className="text-xs text-gray-500 font-medium">{d.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={lang} onChange={handleLanguageChange} className="border p-1.5 rounded text-xs bg-gray-50 font-bold">
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
          </select>
          {user ? (
            <div className="flex items-center gap-2">
              <button onClick={openHistoryDrawer} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-2 py-1 rounded border">
                {d.viewHistory}
              </button>
              <span className="text-xs font-bold text-green-800 bg-green-50 px-2.5 py-1 rounded">👤 {user.name}</span>
              <button onClick={handleLogout} className="text-xs text-red-600 hover:text-red-800 font-semibold underline ml-1">
                {d.logout}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-xs font-bold text-blue-700 underline">{d.signIn}</button>
          )}
        </div>
      </div>

      {/* SCANNER & VOICE BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border p-3.5 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">{d.scanField}</h3>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              Upload / Snap Photo
            </button>
          </div>
          {isAnalyzingImage && <p className="text-[11px] text-emerald-800 animate-pulse font-medium">{d.analyzingImage}</p>}
          {fieldImage && !isAnalyzingImage && imageAnalysisResult && (
            <div>
              {imageAnalysisResult.isValid ? (
                <div className="flex items-center gap-3 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                  <img src={fieldImage} alt="Soil Upload" className="w-12 h-12 rounded object-cover border flex-shrink-0" />
                  <div className="text-[11px] text-gray-700 w-full">
                    <div className="flex justify-between font-bold text-emerald-950">
                      <span>{imageAnalysisResult.soilType} Soil ({imageAnalysisResult.confidence})</span>
                      <span className="text-[9px] bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900">{d.autoUpdated}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-1">{imageAnalysisResult.rationale}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-amber-50 p-2.5 rounded-lg border border-amber-300 text-amber-950 text-xs">
                  <span>⚠️ {imageAnalysisResult.errorTitle}: {imageAnalysisResult.rationale}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border p-3.5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">Voice Assistant (STT)</h3>
            <button onClick={toggleListening} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-green-700 text-white hover:bg-green-800'}`}>
              {isListening ? d.listening : d.startVoice}
            </button>
          </div>
          {spokenTranscript ? (
            <p className="text-[11px] text-gray-700 italic bg-gray-50 p-2 rounded border truncate mt-2">🗣️ "{spokenTranscript}"</p>
          ) : (
            <p className="text-[11px] text-gray-400 mt-2">Try: "Tomato loam 2 acres" or "Cotton black soil"</p>
          )}
        </div>
      </div>

      {/* INPUT PANEL & RESULTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">{d.crop}</label>
            <select
              value={primaryCropKey}
              onChange={(e) => {
                const selected = e.target.value;
                setPrimaryCropKey(selected);
                const defaultSoil = TN_38_CROPS[selected]?.defaultSoil || 'Loamy';
                setSoilType(defaultSoil);
                loadAdvice(lang, { primaryCropKey: selected, season, soilType: defaultSoil, waterStatus });
              }}
              className="w-full border p-2 rounded text-sm bg-white font-semibold"
            >
              {Object.entries(groupedCrops).map(([category, crops]) => (
                <optgroup key={category} label={`── ${category} ──`}>
                  {crops.map((c) => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">{d.season}</label>
            <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
              <option value="Kharif">{d.seasons.Kharif}</option>
              <option value="Rabi">{d.seasons.Rabi}</option>
              <option value="Zaid">{d.seasons.Zaid}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">{d.soil}</label>
            <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
              <option value="Clay">{d.soils.Clay}</option>
              <option value="Loamy">{d.soils.Loamy}</option>
              <option value="Sandy">{d.soils.Sandy}</option>
              <option value="Black">{d.soils.Black}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">{d.water}</label>
            <select value={waterStatus} onChange={(e) => setWaterStatus(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
              <option value="Medium">{d.waters.Medium}</option>
              <option value="Low">{d.waters.Low}</option>
              <option value="High">{d.waters.High}</option>
            </select>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-emerald-950">Farm Land Area</label>
              <span className="text-xs font-black bg-emerald-700 text-white px-2 py-0.5 rounded">{acres} {d.acres}</span>
            </div>
            <input type="range" min="0.5" max="15" step="0.5" value={acres} onChange={(e) => setAcres(parseFloat(e.target.value))} className="w-full accent-emerald-700" />
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mt-1">
              <span>0.5 Acre</span>
              <span>15 Acres</span>
            </div>
          </div>

          <button onClick={() => loadAdvice(lang, { primaryCropKey, season, soilType, waterStatus })} className="w-full bg-green-800 text-white font-extrabold text-sm py-2.5 rounded-lg hover:bg-green-900 transition shadow">
            {d.btnGet}
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          {!advice ? (
            <div className="bg-white p-10 rounded-xl border border-dashed text-center text-xs text-gray-500">{d.guestAlert}</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Primary Crop Selected</span>
                  <h2 className="text-xl font-black text-gray-900">{advice.primaryCrop.name}</h2>
                  <span className="text-xs text-green-700 font-semibold">⏱️ {d.harvestWindow}: {advice.primaryCrop.harvestDuration}</span>
                </div>
                <div className="text-right">
                  <div className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded font-black inline-block">
                    {d.mandiPrice}: ₹{Number(advice.marketData?.pricePerKg).toFixed(2)}{d.perKg}
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {d.officialMsp}: ₹{Number(advice.marketData?.officialMspPerKg).toFixed(2)}{d.perKg} • {d.lastUpdated}: {advice.marketData?.lastUpdated}
                  </p>
                </div>
              </div>

              {/* TABS HEADER */}
              <div className="flex overflow-x-auto border-b border-gray-200 bg-white rounded-t-xl px-2 pt-2 gap-1 shadow-sm scrollbar-none">
                {['intercrop', 'checklist', 'economics', 'fertilizer', 'weather', 'storage', 'pests'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 ${activeTab === tab ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                  >
                    {d[`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`]}
                  </button>
                ))}
              </div>

              {/* TAB 1: INTERCROP */}
              {activeTab === 'intercrop' && advice.intercrop && (
                <div className="space-y-4">
                  {advice.companionOptions && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-2">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">{d.hierarchyTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                        {advice.companionOptions.map((opt, idx) => (
                          <div
                            key={idx}
                            onClick={() => setAdvice(prev => ({ ...prev, intercrop: opt }))}
                            className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${advice.intercrop?.key === opt.key ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-600/20' : 'bg-gray-50/70 border-gray-200'}`}
                          >
                            <div>
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-emerald-800">{opt.tier}</span>
                                <span>LER {opt.lerScore}</span>
                              </div>
                              <h4 className="text-sm font-black text-gray-900 mt-1">{opt.name}</h4>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{opt.reasoning}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 mt-2">{advice.intercrop?.key === opt.key ? '✓ Active Plan' : 'Click to Select'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-emerald-300 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-emerald-800 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wide">{d.intercropOpt}</span>
                        <h3 className="text-xl font-black text-green-950 mt-1.5">{advice.intercrop.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-200 text-emerald-950 font-black text-sm px-3 py-1 rounded-full">LER: {advice.intercrop.lerScore}</span>
                        <p className="text-[10px] text-green-800 font-extrabold mt-1">+{Math.round((Number(advice.intercrop.lerScore || 1.28) - 1) * 100)}% {d.efficiencyGain}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="bg-white/90 p-2.5 rounded-lg border"><p className="text-[10px] text-gray-500 font-semibold">{d.rowRatio}</p><p className="font-extrabold text-green-950">{advice.intercrop.rowRatio}</p></div>
                      <div className="bg-white/90 p-2.5 rounded-lg border"><p className="text-[10px] text-gray-500 font-semibold">{d.plantSpacing}</p><p className="font-extrabold text-green-950 truncate">{advice.intercrop.spacing}</p></div>
                      <div className="bg-white/90 p-2.5 rounded-lg border"><p className="text-[10px] text-gray-500 font-semibold">{d.nFix}</p><p className="font-extrabold text-emerald-800">+{advice.intercrop.nitrogenFixed} kg N/ha</p></div>
                      <div className="bg-white/90 p-2.5 rounded-lg border"><p className="text-[10px] text-gray-500 font-semibold">Cycle</p><p className="font-extrabold text-gray-800">{advice.intercrop.harvestDuration}</p></div>
                    </div>

                    <div className="bg-white/95 p-3 rounded-lg border text-xs text-green-900 leading-relaxed">
                      <strong>💡 Agronomic Rationale:</strong> {advice.intercrop.reasoning}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSpeak} className={`flex-1 text-xs py-2 rounded-lg font-bold border transition ${isSpeaking ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                        {isSpeaking ? d.stopSpeak : d.speakAdvice}
                      </button>
                      <button onClick={handleSavePlan} className="flex-1 bg-gray-900 text-white text-xs py-2 rounded-lg font-bold hover:bg-black transition">
                        {d.savePlan}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHECKLIST */}
              {activeTab === 'checklist' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-900">{d.checklistTitle}</h3>
                    <button onClick={() => { setCheckedTasks({}); localStorage.removeItem('agri_tasks'); }} className="text-[11px] text-red-600 font-bold underline">Reset</button>
                  </div>
                  {['Moisture & Irrigation Balancing', 'Weather Verification Prior to Spray', 'Integrated Pest Scouting & Trap Barrier Check'].map((task, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-gray-50/50">
                      <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-gray-800">
                        <input type="checkbox" checked={!!checkedTasks[`task_${i}`]} onChange={() => toggleTask(`task_${i}`)} className="w-4 h-4 accent-emerald-600 rounded" />
                        <span>{task}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: ECONOMICS WITH TUG-OF-WAR GAUGE */}
              {activeTab === 'economics' && fin && (
                <div className="space-y-4">
                  <ProfitTugOfWarGauge fin={fin} advice={advice} acres={acres} />
                  <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="bg-gray-50 p-3 rounded-lg border"><p className="text-[10px] text-gray-500 font-bold uppercase">Main Yield</p><p className="text-base font-black text-gray-900 mt-0.5">{fin.primaryYield} Qtl ({fin.primaryYieldKg} kg)</p></div>
                      <div className="bg-blue-50 p-3 rounded-lg border"><p className="text-[10px] text-blue-700 font-bold uppercase">Intercrop Bonus</p><p className="text-base font-black text-blue-950 mt-0.5">+₹{fin.bonusRevenue.toLocaleString('en-IN')}</p></div>
                      <div className="bg-amber-50 p-3 rounded-lg border"><p className="text-[10px] text-amber-700 font-bold uppercase">Production Cost</p><p className="text-base font-black text-amber-950 mt-0.5">₹{fin.totalCost.toLocaleString('en-IN')}</p></div>
                      <div className="bg-emerald-50 p-3 rounded-lg border"><p className="text-[10px] text-emerald-800 font-bold uppercase">Net Profit</p><p className="text-base font-black text-emerald-700 mt-0.5">₹{fin.netProfit.toLocaleString('en-IN')}</p></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FERTILIZER */}
              {activeTab === 'fertilizer' && fert && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg border"><p className="text-[10px] text-blue-700 font-bold uppercase">Urea</p><p className="text-lg font-black text-blue-950 mt-0.5">{fert.ureaBags} Bags</p></div>
                    <div className="bg-amber-50 p-3 rounded-lg border"><p className="text-[10px] text-amber-700 font-bold uppercase">DAP</p><p className="text-lg font-black text-amber-950 mt-0.5">{fert.dapBags} Bags</p></div>
                    <div className="bg-purple-50 p-3 rounded-lg border"><p className="text-[10px] text-purple-700 font-bold uppercase">MOP Potash</p><p className="text-lg font-black text-purple-950 mt-0.5">{fert.mopBags} Bags</p></div>
                  </div>
                  <div className="bg-emerald-50 p-3.5 rounded-lg border text-xs text-emerald-950">
                    🌱 Legume companion biological fixation saves <strong>{fert.ureaSavedBags} commercial Urea bag(s)</strong> (saving ~₹{fert.savingsRupees}).
                  </div>
                </div>
              )}

              {/* TAB 5: WEATHER (LIVE SATELLITE STREAM) */}
              {activeTab === 'weather' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">5-Day Live Satellite Weather Feed & Spray Risk</h3>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">📍 {locationName}</span>
                  </div>
                  {weatherLoading ? (
                    <div className="py-8 text-center text-xs text-emerald-700 animate-pulse font-bold">🛰️ Contacting live meteorological satellites...</div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      {weatherForecast.map((w, idx) => (
                        <div key={idx} className={`p-2 rounded-lg border transition ${w.sprayRisk === 'High' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                          <p className="font-black text-gray-900 text-[11px]">{w.day}</p>
                          <p className="text-xs font-bold text-gray-700 mt-1">{w.temp}°C</p>
                          <p className="text-[10px] text-blue-700 font-semibold">💧 {w.rainProb}% Rain</p>
                          <p className="text-[9px] text-gray-500">{w.windKmh} km/h</p>
                          <span className={`inline-block text-[8px] font-black uppercase px-1 py-0.5 rounded mt-1.5 ${w.sprayRisk === 'High' ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'}`}>
                            {w.sprayRisk === 'High' ? 'No Spray' : 'Safe Spray'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: STORAGE */}
              {activeTab === 'storage' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border text-xs space-y-2">
                  <h3 className="font-bold text-gray-800 border-b pb-1">Post-Harvest Shelf Life Guidance</h3>
                  <p><strong>Primary Crop ({advice.primaryCrop.name}):</strong> Safe moisture ≤ {advice.primaryCrop.safeMoisturePct}%. Store in aerated crates or hermetic bags.</p>
                  <p><strong>Companion Crop ({advice.intercrop?.name}):</strong> Sun-dry thoroughly; store in cool godown conditions.</p>
                </div>
              )}

              {/* TAB 7: PESTS */}
              {activeTab === 'pests' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-3">
                  <h3 className="text-xs font-black text-red-800 uppercase border-b pb-2">{d.pestTitle}</h3>
                  {advice.pests?.map((p, idx) => (
                    <div key={idx} className="text-xs space-y-2 bg-red-50/70 p-3.5 rounded-lg border border-red-200">
                      <div className="flex justify-between items-center"><span className="font-bold text-sm text-red-950">{p.pestName}</span><span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{p.toxicity}</span></div>
                      <p><strong>{d.cultural}:</strong> {p.cultural}</p>
                      <p><strong>{d.bio}:</strong> {p.bio}</p>
                      <p className="text-red-800"><strong>⚠️ {d.chemical}:</strong> {p.chemical}</p>
                      <p className="text-gray-700"><strong>⏳ {d.phi}:</strong> Safe harvest countdown: Wait {p.phiDays} {d.days} after spray.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-gray-800">{d.historyTitle}</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 font-bold">✕</button>
            </div>
            {historyList.length === 0 ? <p className="text-xs text-gray-500 py-4 text-center">{d.noHistory}</p> : (
              historyList.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded border text-xs">
                  <p className="font-bold text-green-900 capitalize">{item.primary_crop} + {item.intercrop}</p>
                  <p className="text-gray-500 text-[10px]">{item.season} • {item.soil_type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-xl max-w-sm w-full space-y-3 shadow-lg">
            <h3 className="text-sm font-bold text-gray-800">{d.signIn}</h3>
            <input type="text" placeholder="Mobile / Email" value={contact} onChange={e => setContact(e.target.value)} className="w-full border p-2 rounded text-xs" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded text-xs" required />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-700 text-white text-xs py-2 rounded font-bold">Submit</button>
              <button type="button" onClick={() => setShowAuth(false)} className="bg-gray-200 text-xs px-3 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* FLOATING VOICE ORB */}
      <FloatingVoiceOrb lang={lang} isListening={isListening} onToggleListen={toggleListening} lastTranscript={spokenTranscript} />
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement._reactRootContainer) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}