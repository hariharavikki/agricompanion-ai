import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5002';

const CURRENT_MSP_DIRECTORY = {
  paddy: { msp: 2441.00, mandi: 2520.00, date: '2026-06-15' },
  rice: { msp: 2441.00, mandi: 2520.00, date: '2026-06-15' },
  maize: { msp: 2410.00, mandi: 2490.00, date: '2026-06-15' },
  cotton: { msp: 8267.00, mandi: 8450.00, date: '2026-06-15' },
  groundnut: { msp: 7517.00, mandi: 7680.00, date: '2026-06-15' }
};

const DICTIONARY = {
  en: {
    title: '🌱 AgriCompanion AI',
    subtitle: 'Intelligent Multi-Tier Intercropping & Field Decision System',
    season: 'Season',
    soil: 'Soil Type',
    water: 'Water Availability',
    crop: 'Primary Crop',
    btnGet: 'Generate Intercrop Blueprint 🚀',
    guestAlert: 'Choose your primary crop and field variables to receive multi-tier companion crop blueprints.',
    harvestWindow: 'Estimated Harvest Duration',
    tabIntercrop: '🌿 Intercrop Blueprint',
    tabEconomics: '💰 Profit & Yield Calculator',
    tabFertilizer: '🧪 NPK & Bio N-Credits',
    tabWeather: '🌦️ 5-Day Forecast & Spray Advisory',
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
    mandiPrice: 'Mandi Price',
    officialMsp: 'Govt. MSP Floor Rate',
    lastUpdated: 'Updated',
    days: 'days',
    months: 'Months',
    perQtl: '/Qtl',
    weatherTitle: 'Field Weather',
    historyTitle: 'Saved Farming Strategies',
    noHistory: 'No saved crop plans found.',
    acres: 'Acres',
    crops: {
      maize: 'Maize / Corn',
      cotton: 'Cotton',
      groundnut: 'Groundnut',
      rice: 'Paddy / Rice'
    },
    seasons: {
      Kharif: 'Kharif (Monsoon)',
      Rabi: 'Rabi (Winter)',
      Zaid: 'Zaid (Summer)'
    },
    soils: {
      Loamy: 'Loamy Soil',
      Clay: 'Clay Soil',
      Sandy: 'Sandy Soil',
      Black: 'Black Soil'
    },
    waters: {
      Low: 'Low (Rainfed)',
      Medium: 'Medium (Partial Irrigation)',
      High: 'High (Full Irrigation)'
    }
  },
  ta: {
    title: '🌱 அக்ரிகாம்பானியன் AI',
    subtitle: 'பல்நிலை ஊடுபயிர் வழிகாட்டி மற்றும் கள ஆய்வு முறைமை',
    season: 'பருவம்',
    soil: 'மண் வகை',
    water: 'நீர் வசதி',
    crop: 'முதன்மைப் பயிர்',
    btnGet: 'ஊடுபயிர் திட்டத்தைப் பெறுக 🚀',
    guestAlert: 'முதன்மை பயிர் மற்றும் மண் வகையை தேர்வு செய்து பலநிலை ஊடுபயிர் ஆலோசனையைப் பெறவும்.',
    harvestWindow: 'அறுவடை காலம்',
    tabIntercrop: '🌿 ஊடுபயிர் வரைபடம்',
    tabEconomics: '💰 லாபம் & மகசூல் கணக்கீடு',
    tabFertilizer: '🧪 உரத் தேவை & தழைச்சத்து சேமிப்பு',
    tabWeather: '🌦️ 5 நாள் வானிலை & தெளிப்பு ஆலோசனை',
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
    voiceNotSupported: 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை (Chrome அல்லது Edge பயன்படுத்தவும்).',
    scanField: '📸 நிலம் / மண்ணை ஸ்கேன் செய்க',
    analyzingImage: '🔍 மண் தரம் மற்றும் பயிர் நிறமாலையை ஆய்வு செய்கிறது...',
    autoUpdated: 'தானாக புதுப்பிக்கப்பட்டது',
    mandiPrice: 'சந்தை விலை',
    officialMsp: 'அரசு குறைந்தபட்ச ஆதார விலை (MSP)',
    lastUpdated: 'தேதி',
    days: 'நாட்கள்',
    months: 'மாதங்கள்',
    perQtl: '/குவிண்டால்',
    weatherTitle: 'வயல்வெளி வானிலை',
    historyTitle: 'சேமிக்கப்பட்ட விவசாயத் திட்டங்கள்',
    noHistory: 'சேமிக்கப்பட்ட திட்டங்கள் இல்லை.',
    acres: 'ஏக்கர்',
    crops: {
      maize: 'மக்காச்சோளம் (Maize)',
      cotton: 'பருத்தி (Cotton)',
      groundnut: 'வேர்க்கடலை (Groundnut)',
      rice: 'நெல் (Paddy / Rice)'
    },
    seasons: {
      Kharif: 'காரிப் (மழைக்காலம்)',
      Rabi: 'ரபி (குளிர்காலம்)',
      Zaid: 'சையத் (கோடைக்காலம்)'
    },
    soils: {
      Loamy: 'வண்டல் மண்',
      Clay: 'களிமண்',
      Sandy: 'மணல் மண்',
      Black: 'கரிசல் மண்'
    },
    waters: {
      Low: 'குறைந்த நீர் (மானாவாரி)',
      Medium: 'மிதமான நீர் (பாசன வசதி)',
      High: 'நிறைந்த நீர் (முழு பாசனம்)'
    }
  },
  hi: {
    title: '🌱 एग्रीकंपैनियन AI',
    subtitle: 'स्मार्ट बहुस्तरीय अंतर-फसल (Intercropping) निर्णय प्रणाली',
    season: 'मौसम / सीजन',
    soil: 'मिट्टी का प्रकार',
    water: 'पानी की उपलब्धता',
    crop: 'मुख्य फसल चुनें',
    btnGet: 'अंतर-फसल योजना प्राप्त करें 🚀',
    guestAlert: 'मुख्य फसल और खेत की स्थिति चुनें, AI 3 स्तरीय साथी फसलें सुझाएगा।',
    harvestWindow: 'कटाई की अनुमानित अवधि',
    tabIntercrop: '🌿 अंतर-फसल खाका',
    tabEconomics: '💰 लाभ और पैदावार कैलकुलेटर',
    tabFertilizer: '🧪 खाद मात्रा व नाइट्रोजन बचत',
    tabWeather: '🌦️ 5-दिन मौसम व छिड़काव सलाह',
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
    voiceNotSupported: 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है (Chrome या Edge का उपयोग करें)।',
    scanField: '📸 खेत / मिट्टी स्कैन करें',
    analyzingImage: '🔍 मिट्टी के प्रकार और उपयुक्त साथी फसल का विश्लेषण जारी है...',
    autoUpdated: 'अपडेट किया गया',
    mandiPrice: 'मंडी भाव',
    officialMsp: 'सरकारी न्यूनतम समर्थन मूल्य (MSP)',
    lastUpdated: 'दिनांक',
    days: 'दिन',
    months: 'महीने',
    perQtl: '/क्विंटल',
    weatherTitle: 'खेत का मौसम',
    historyTitle: 'सहेजी गई योजनाएं',
    noHistory: 'कोई सहेजी गई योजना नहीं मिली।',
    acres: 'एकड़',
    crops: {
      maize: 'मक्का (Maize)',
      cotton: 'कपास (Cotton)',
      groundnut: 'मूंगफली (Groundnut)',
      rice: 'धान / चावल (Paddy / Rice)'
    },
    seasons: {
      Kharif: 'खरीफ (मानसून)',
      Rabi: 'रबी (सर्दियां)',
      Zaid: 'जायद (गर्मी)'
    },
    soils: {
      Loamy: 'दोमट मिट्टी',
      Clay: 'चिकनी मिट्टी',
      Sandy: 'बलुई मिट्टी',
      Black: 'काली मिट्टी'
    },
    waters: {
      Low: 'कम पानी (वर्षा आधारित)',
      Medium: 'मध्यम (आंशिक सिंचाई)',
      High: 'अधिक (पूर्ण सिंचाई)'
    }
  }
};

const AGRONOMIC_TRANSLATIONS = {
  crops: {
    cowpea: { en: 'Cowpea (Lobia)', ta: 'காராமணி (தட்டப்பயறு)', hi: 'लोबिया (चौलाई)' },
    greengram: { en: 'Green Gram (Moong)', ta: 'பாசிப்பயறு (பச்சைப்பயறு)', hi: 'मूंग (Green Gram)' },
    blackgram: { en: 'Black Gram (Urad)', ta: 'உளுந்து (கருப்பு உளுந்து)', hi: 'उड़द (Black Gram)' },
    frenchbean: { en: 'French Bean (Rajma)', ta: 'பீன்ஸ் / ராஜ்மா', hi: 'राजमा / फ्रेंच बीन' },
    pea: { en: 'Field Pea (Matar)', ta: 'பச்சை பட்டாணி', hi: 'हरी मटर (Field Pea)' },
    chickpea: { en: 'Chickpea (Chana)', ta: 'கொண்டைக்கடலை', hi: 'चना (Chickpea)' },
    soybean: { en: 'Soybean', ta: 'சோயாபீன்', hi: 'சோயாபீன்' },
    horsegram: { en: 'Horse Gram (Kulthi)', ta: 'கொள்ளு (Horse Gram)', hi: 'कुलथी (Horse Gram)' },
    clusterbean: { en: 'Cluster Bean (Guar)', ta: 'கொத்தவரங்காய் (Guar)', hi: 'ग्वारफली (Cluster Bean)' },
    azolla: { en: 'Azolla Pinnata', ta: 'அசோலா உயிர் உரம்', hi: 'अजोला जैव उर्वरक' },
    sesbania: { en: 'Sesbania (Dhaincha)', ta: 'தக்கைப்பூண்டு (சணப்பை)', hi: 'ढैंचा (हरी खाद)' },
    pearlmillet: { en: 'Pearl Millet (Bajra)', ta: 'கம்பு (Bajra)', hi: 'बाजरा (Pearl Millet)' },
    pigeonpea: { en: 'Pigeon Pea (Arhar / Tur)', ta: 'துவரை (Red Gram)', hi: 'अरहर / तूर दाल' },
    sesame: { en: 'Sesame (Til)', ta: 'எள்ளு (Sesame)', hi: 'तिल (Sesame)' },
    castor: { en: 'Castor', ta: 'ஆமணக்கு (விளக்கெண்ணெய் விதை)', hi: 'अरंडी (Castor)' }
  },
  tiers: {
    high: { en: '⭐ Highly Recommended', ta: '⭐ மிகச் சிறந்த பரிந்துரை', hi: '⭐ अत्यधिक अनुशंसित' },
    rec: { en: '👍 Recommended', ta: '👍 பரிந்துரைக்கப்படுகிறது', hi: '👍 अनुशंसित' },
    alt: { en: '🌾 Feasible Alternative', ta: '🌾 சாத்தியமான மாற்றுப் பயிர்', hi: '🌾 व्यावहारिक विकल्प' }
  },
  ui: {
    activePlan: { en: '✓ Active Plan', ta: '✓ தேர்ந்தெடுக்கப்பட்டது', hi: '✓ सक्रिय योजना' },
    clickToSelect: { en: 'Click to Select', ta: 'தேர்வு செய்ய அழுத்தவும்', hi: 'चुनने के लिए क्लिक करें' },
    simultaneousFor: { en: 'Simultaneous growing companion for', ta: 'இணைந்து வளரும் ஊடுபயிர்:', hi: 'के साथ एक साथ उगने वाली साथी फसल:' },
    companionCycle: { en: 'Companion Cycle', ta: 'பயிர்க்காலம்', hi: 'साथी फसल अवधि' }
  },
  schedules: {
    simultaneous: { en: 'Simultaneous on Day 0', ta: 'முதல் நாளில் உடனடி விதைப்பு', hi: 'दिन 0 पर एक साथ बुवाई' },
    day7: { en: 'Inoculated on Day 7 after transplanting', ta: 'நடவு நட்ட 7-ம் நாள் இடவும்', hi: 'रोपाई के 7वें दिन छोड़ें' },
    bundDay0: { en: 'Day 0 along field bunds', ta: 'வரப்புகளில் முதல் நாளில் நடுதல்', hi: 'मेड़ों पर दिन 0' },
    relay: { en: 'Sown on bunds or broadcast into relay moisture', ta: 'நெல் அறுவடைக்கு முன் ஈரப்பதத்தில் விதைத்தல்', hi: 'कटाई से पहले गीली मिट्टी में' }
  },
  rootSynergy: {
    deepTaproot: {
      en: 'Deep taproot + Shallow fibrous root system',
      ta: 'ஆழமான ஆணிவேர் மற்றும் மேல்மண் சல்லிவேர்களின் கூட்டு',
      hi: 'गहरी मूसला जड़ व उथली रेशेदार जड़ों का बेहतर तालमेल'
    },
    shallowCanopy: {
      en: 'Shallow root zone complements deep maize taproot',
      ta: 'ஆழமற்ற வேர் அமைப்பு மக்காச்சோள வேர்களுக்கு இடமளிக்கிறது',
      hi: 'उथली जड़ें मक्के की गहरी जड़ों को बाधित नहीं करतीं'
    },
    erectLegume: {
      en: 'Erect cool-season legume architecture',
      ta: 'குளிர்காலத்திற்கேற்ற நேரான கட்டமைப்பு',
      hi: 'सर्दियों के अनुकूल सीधा ढांचा'
    },
    soilBinding: {
      en: 'Fibrous soil-binding mulch layer',
      ta: 'மண்ணை இறுகப் பிடிக்கும் வேர் மூடாக்கு',
      hi: 'मिट्टी को बांधने वाली जड़ें'
    },
    vertisolMoisture: {
      en: 'Shallow pulse zone utilizing moisture between 90cm cotton rows',
      ta: 'பருத்தி வரிசைகளுக்கு இடையே உள்ள ஈரப்பதத்தை பயன்படுத்தும்',
      hi: 'कपास की चौड़ी कतारों के बीच की नमी का सदुपयोग'
    },
    osmotic: {
      en: 'Extreme osmotic adjustment for dry soils',
      ta: 'வறட்சியைத் தாங்கும் ஆழமான வேர்',
      hi: 'गहरी सूखा सहनशील जड़ें'
    },
    floatingSymbiosis: {
      en: 'Floating aquatic symbiosis in standing water',
      ta: 'தேங்கிய நீரில் மிதந்து வேர்களுக்கு குளிர்ச்சி தருகிறது',
      hi: 'खड़े पानी में जड़ों को ठंडक देती है'
    },
    windbreakBarrier: {
      en: 'Tall perimeter micro-climate barrier',
      ta: 'காற்றுத் தடுப்பு சுவர்',
      hi: 'हवा रोधक आवरण'
    },
    taprootPigeon: {
      en: 'Deep taproot (1.5m) + Shallow groundnut peg layer (20cm)',
      ta: 'துவரை ஆழமான வேர் (1.5 மீ) + வேர்க்கடலை மேல் வேர் (20 செ.மீ)',
      hi: 'अरहर गहरी जड़ (1.5 मी) + मूंगफली ऊपरी जड़ (20 सेमी)'
    }
  }
};

const getLocalizedCropName = (cropKey, englishName, currentLang) => {
  if (currentLang === 'en') return englishName || cropKey;
  const k = String(cropKey || '').toLowerCase();
  for (const [dictKey, val] of Object.entries(AGRONOMIC_TRANSLATIONS.crops)) {
    if (k.includes(dictKey) || String(englishName || '').toLowerCase().includes(dictKey)) {
      return val[currentLang] || val.en;
    }
  }
  return englishName || cropKey;
};

const getLocalizedTier = (tierStr, currentLang) => {
  const t = String(tierStr || '').toLowerCase();
  if (t.includes('highly') || t.includes('சிறந்த') || t.includes('अत्यधिक')) {
    return AGRONOMIC_TRANSLATIONS.tiers.high[currentLang] || AGRONOMIC_TRANSLATIONS.tiers.high.en;
  }
  if (t.includes('feasible') || t.includes('alternative') || t.includes('மாற்று') || t.includes('विकल्प')) {
    return AGRONOMIC_TRANSLATIONS.tiers.alt[currentLang] || AGRONOMIC_TRANSLATIONS.tiers.alt.en;
  }
  return AGRONOMIC_TRANSLATIONS.tiers.rec[currentLang] || AGRONOMIC_TRANSLATIONS.tiers.rec.en;
};

const getLocalizedDuration = (durationStr, currentLang) => {
  if (!durationStr || typeof durationStr !== 'string') return '';
  if (currentLang === 'ta') {
    return durationStr.replace(/days/gi, 'நாட்கள்').replace(/months/gi, 'மாதங்கள்');
  }
  if (currentLang === 'hi') {
    return durationStr.replace(/days/gi, 'दिन').replace(/months/gi, 'महीने');
  }
  return durationStr;
};

const getLocalizedSchedule = (schedStr, currentLang) => {
  if (!schedStr || currentLang === 'en') return schedStr || 'Simultaneous on Day 0';
  const s = String(schedStr).toLowerCase();
  if (s.includes('day 7') || s.includes('transplant')) return AGRONOMIC_TRANSLATIONS.schedules.day7[currentLang];
  if (s.includes('bund') && s.includes('0')) return AGRONOMIC_TRANSLATIONS.schedules.bundDay0[currentLang];
  if (s.includes('relay') || s.includes('broadcast')) return AGRONOMIC_TRANSLATIONS.schedules.relay[currentLang];
  return AGRONOMIC_TRANSLATIONS.schedules.simultaneous[currentLang];
};

const getLocalizedSynergy = (synergyStr, currentLang) => {
  if (!synergyStr || currentLang === 'en') return synergyStr || '';
  const s = String(synergyStr).toLowerCase();
  if (s.includes('deep taproot + shallow') || s.includes('fibrous')) return AGRONOMIC_TRANSLATIONS.rootSynergy.deepTaproot[currentLang];
  if (s.includes('shallow root') || s.includes('complements deep')) return AGRONOMIC_TRANSLATIONS.rootSynergy.shallowCanopy[currentLang];
  if (s.includes('erect') || s.includes('cool-season')) return AGRONOMIC_TRANSLATIONS.rootSynergy.erectLegume[currentLang];
  if (s.includes('binding') || s.includes('mulch')) return AGRONOMIC_TRANSLATIONS.rootSynergy.soilBinding[currentLang];
  if (s.includes('90cm') || s.includes('vertisol')) return AGRONOMIC_TRANSLATIONS.rootSynergy.vertisolMoisture[currentLang];
  if (s.includes('osmotic') || s.includes('dry soils')) return AGRONOMIC_TRANSLATIONS.rootSynergy.osmotic[currentLang];
  if (s.includes('floating') || s.includes('standing water')) return AGRONOMIC_TRANSLATIONS.rootSynergy.floatingSymbiosis[currentLang];
  if (s.includes('barrier') || s.includes('micro-climate')) return AGRONOMIC_TRANSLATIONS.rootSynergy.windbreakBarrier[currentLang];
  if (s.includes('1.5m') || s.includes('groundnut peg')) return AGRONOMIC_TRANSLATIONS.rootSynergy.taprootPigeon[currentLang];
  return synergyStr;
};

const normalizeCompanion = (item, lang = 'en') => {
  if (!item) return null;
  const defaultDur = lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days';
  return {
    ...item,
    rowRatio: item.rowRatio || item.ratio || '2:1',
    harvestDuration: item.harvestDuration || item.duration || defaultDur,
    spacing: item.spacing || item.plantSpacing || '30 cm x 10 cm',
    nitrogenFixed: item.nitrogenFixed ?? item.nitro ?? 0,
    lerScore: item.lerScore || item.ler || 1.25
  };
};

// MULTI-CROP CLIENT FALLBACK MATRIX (Distinct Companions for Every Crop)
const getClientTop3Companions = (crop, szn, soil, water, lang = 'en') => {
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

  const CROP_NAMES = {
    greengram: { en: 'Green Gram (Moong)', ta: 'பாசிப்பயறு (பச்சைப்பயறு)', hi: 'मूंग (Green Gram)' },
    cowpea: { en: 'Cowpea (Lobia)', ta: 'காராமணி (தட்டப்பயறு)', hi: 'लोबिया (चौलाई)' },
    blackgram: { en: 'Black Gram (Urad)', ta: 'உளுந்து (கருப்பு உளுந்து)', hi: 'उड़द (Black Gram)' },
    frenchbean: { en: 'French Bean (Rajma)', ta: 'பீன்ஸ் / ராஜ்மா', hi: 'राजमा / फ्रेंच बीन' },
    pea: { en: 'Field Pea (Matar)', ta: 'பச்சை பட்டாணி', hi: 'मटर (Field Pea)' },
    chickpea: { en: 'Chickpea (Chana)', ta: 'கொண்டைக்கடலை', hi: 'चना (Chickpea)' },
    soybean: { en: 'Soybean', ta: 'சோயாபீன்', hi: 'சோயாபீன் (Soybean)' },
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
  if (c.includes('maize') || c.includes('corn')) {
    if (s.includes('zaid') || w.includes('high')) {
      return [
        {
          tier: t.high,
          key: 'greengram',
          name: getName('greengram'),
          rowRatio: '1:2 / 2:2',
          spacing: '25 cm x 10 cm',
          nitrogenFixed: 38,
          lerScore: 1.38,
          harvestDuration: lang === 'ta' ? '55 - 65 நாட்கள்' : lang === 'hi' ? '55 - 65 दिन' : '55 - 65 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் உடனடி விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'ஆழமற்ற வேர் அமைப்பு' : lang === 'hi' ? 'उथली जड़ें' : 'Shallow legume canopy shading',
          reasoning: lang === 'ta' ? 'கோடை பாசனத்தில் (சையத்), 60 நாள் பாசிப்பயறு வெயில் உக்கிரமடைவதற்குள் விரைவாக பலன் தருகிறது.' : lang === 'hi' ? 'ग्रीष्मकालीन सिंचाई में मूंग तेज गर्मी से पहले तैयार होकर मिट्टी में नाइट्रोजन जोड़ती है।' : 'Fast 60-day Moong captures light between tall maize stalks before heat peaks, fixing high soil nitrogen.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.rec,
          key: 'cowpea',
          name: getName('cowpea'),
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 35,
          lerScore: 1.32,
          harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'படரும் இலைகள்' : lang === 'hi' ? 'सघन पत्तियां' : 'Dense foliage mulch',
          reasoning: lang === 'ta' ? 'கோடைகால களைகளைக் கட்டுப்படுத்தி தீவனம் மற்றும் தானிய மகசூலை வழங்குகிறது.' : lang === 'hi' ? 'गर्मियों में खरपतवार दबाती है और अतिरिक्त चारा प्रदान करती है।' : 'Provides heavy foliage to suppress summer weeds while offering dual food and fodder harvests.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.alt,
          key: 'blackgram',
          name: getName('blackgram'),
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 30,
          lerScore: 1.27,
          harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'சமச்சீர் வேர்' : lang === 'hi' ? 'संतुलित जड़ें' : 'Compact pulse zone',
          reasoning: lang === 'ta' ? 'சந்தையில் எளிதாக விற்பனையாகும் நிலையான மாற்று பயறு.' : lang === 'hi' ? 'मंडी में तुरंत बिकने वाली स्थिर दाल की फसल।' : 'Stable pulse option with high Mandi liquidity if Green Gram seed is unavailable.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
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
        nitrogenFixed: 35,
        lerScore: 1.32,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'ஆழமான மற்றும் சல்லி வேர்கள்' : lang === 'hi' ? 'गहरी व उथली जड़ें' : 'Deep taproot + Shallow fibrous root system',
        reasoning: lang === 'ta' ? 'மழைக்கால களைகளை அடக்கி மண்ணிற்கு தழைச்சத்தை சேர்க்கிறது.' : lang === 'hi' ? 'मानसून के खरपतवार दबाती है और प्रचुर नाइट्रोजन जोड़ती है।' : 'Best monsoon cover: rapid vegetative canopy suffocates weeds and fixes biological nitrogen.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
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
        rootZoneSynergy: lang === 'ta' ? 'நேரான தண்டு' : lang === 'hi' ? 'मजबूत तना' : 'Vertical erect profile reducing wind lodging',
        reasoning: lang === 'ta' ? 'எண்ணெய்வித்து மூலம் அதிக வருமானம் மற்றும் மண்ணிற்கு ஊட்டச்சத்து.' : lang === 'hi' ? 'तिलहन से अतिरिक्त मुनाफा और दोमट मिट्टी में मजबूत नाइट्रोजन लाभ।' : 'Substantial commercial oilseed value with robust atmospheric nitrogen contribution.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.alt,
        key: 'horsegram',
        name: getName('horsegram'),
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 28,
        lerScore: 1.26,
        harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'மண் பிடிப்பு வேர்கள்' : lang === 'hi' ? 'मिट्टी बांधक जड़ें' : 'Fibrous soil-binding mulch layer',
        reasoning: lang === 'ta' ? 'வறட்சி மற்றும் மணல் பாங்கான நிலங்களில் தாங்கி வளரும் சிறந்த பயிர்.' : lang === 'hi' ? 'सूखे और रेतीली जमीन में बिना पानी के भी टिकने वाली फसल।' : 'Extreme drought insurance; thrives even if monsoon breaks occur or in coarse soils.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  // 2. COTTON MATRIX
  if (c.includes('cotton')) {
    if (so.includes('black')) {
      return [
        {
          tier: t.high,
          key: 'blackgram',
          name: getName('blackgram'),
          rowRatio: '1:2',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 32,
          lerScore: 1.31,
          harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'பருத்தி வரிசைகளுக்கு இடையே உள்ள ஈரப்பதத்தை பயன்படுத்தும்' : lang === 'hi' ? 'कपास की चौड़ी कतारों के बीच की नमी का सदुपयोग' : 'Shallow pulse zone utilizing moisture between 90cm cotton rows',
          reasoning: lang === 'ta' ? 'கரிசல் மண்ணின் ஈரப்பதத்தில் உளுந்து நன்கு வளரும், காய்ப்புழுக்களை கட்டுப்படுத்த வரப்பு பயிராகிறது.' : lang === 'hi' ? 'काली मिट्टी की नमी में उड़द जल्दी पकती है और गेंदा सुंडी को आकर्षित कर रोकता है।' : 'Deep Vertisols hold moisture to finish short Black Gram, maximizing cash return before cotton branches lock.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.rec,
          key: 'greengram',
          name: getName('greengram'),
          rowRatio: '1:2',
          spacing: '25 cm x 10 cm',
          nitrogenFixed: 30,
          lerScore: 1.28,
          harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'பருத்தி கிளை விரிக்கும் முன் அறுவடை' : lang === 'hi' ? 'कपास के फैलने से पहले तुड़ाई' : 'Quick maturity before cotton branches wide',
          reasoning: lang === 'ta' ? 'பருத்தி பெரிதாக வளர்வதற்கு முன்பே அறுவடை முடிந்து விடுகிறது.' : lang === 'hi' ? 'कपास के बड़े होने से पहले कटाई पूरी हो जाती है, जिससे धूप की कोई प्रतिस्पर्धा नहीं होती।' : 'Harvested in 60 days before cotton reaches peak vegetative branching, ensuring zero solar competition.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.alt,
          key: 'soybean',
          name: getName('soybean'),
          rowRatio: '1:2 Strip Cropping',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 34,
          lerScore: 1.26,
          harvestDuration: lang === 'ta' ? '80 - 90 நாட்கள்' : lang === 'hi' ? '80 - 90 दिन' : '80 - 90 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'மண் அரிப்பை தடுக்கும் அடர்ந்த இலைகள்' : lang === 'hi' ? 'कतारों को ढकने वाला तना' : 'Mid-tier canopy cover protecting wide ridges',
          reasoning: lang === 'ta' ? 'பருத்தி எடுப்பதற்கு முன்பே நல்ல கூடுதல் வருமானம் தரும் பயிர்.' : lang === 'hi' ? 'कपास की चुगाई शुरू होने से पहले ही अच्छी आमदनी देती है।' : 'Generates high cash income before cotton picking starts; requires timely harvest.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
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
        nitrogenFixed: 25,
        lerScore: 1.24,
        harvestDuration: lang === 'ta' ? '85 - 95 நாட்கள்' : lang === 'hi' ? '85 - 95 दिन' : '85 - 95 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'வறட்சியைத் தாங்கும் ஆழமான வேர்' : lang === 'hi' ? 'गहरी सूखा सहनशील जड़ें' : 'Extreme osmotic adjustment for dry soils',
        reasoning: lang === 'ta' ? 'வறண்ட நிலத்திலும் வெயிலிலும் கூட பருத்தியுடன் இணைந்து நன்கு வளரும்.' : lang === 'hi' ? 'गंभीर सूखे और गर्मी में भी कपास को नुकसान पहुंचाए बिना टिकती है।' : 'Drought and heat resilience; deep taproot extracts nutrients without invading wide cotton roots.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.rec,
        key: 'blackgram',
        name: getName('blackgram'),
        rowRatio: '1:2',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 30,
        lerScore: 1.28,
        harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'மண்ணை மூடி ஈரத்தை காக்கும்' : lang === 'hi' ? 'जमीन को ढकने वाली फसल' : 'Low sprawling canopy reducing soil crusting',
        reasoning: lang === 'ta' ? 'பருத்தி சிறியதாக இருக்கும் காலத்தில் களைகளைக் கட்டுப்படுத்துகிறது.' : lang === 'hi' ? 'शुरुआती दौर में खरपतवार को रोककर दलहन का अच्छा उत्पादन देती है।' : 'Commercial pulse intercrop that suppresses weeds during cotton’s slow early juvenile stage.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.alt,
        key: 'cowpea',
        name: getName('cowpea'),
        rowRatio: '1:1 Border',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 32,
        lerScore: 1.22,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் விதைப்பு' : lang === 'hi' ? 'दिन 0 पर बुवाई' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'மண்ணிற்கு பாதுகாப்பு மூடாக்கு' : lang === 'hi' ? 'मृदा संरक्षण आवरण' : 'Aggressive topsoil shading',
        reasoning: lang === 'ta' ? 'மண்ணை பாதுகாக்கும்; கொடிகள் பருத்தி மீது படராமல் கண்காணிக்க வேண்டும்.' : lang === 'hi' ? 'मिट्टी कटाव रोकती है, बस कपास पर बेल न चढ़ने दें।' : 'Effective living mulch against evaporation; prune if vines start climbing main stems.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  // 3. PADDY / RICE MATRIX
  if (c.includes('rice') || c.includes('paddy')) {
    if (w.includes('high')) {
      return [
        {
          tier: t.high,
          key: 'azolla',
          name: getName('azolla'),
          rowRatio: lang === 'ta' ? 'நீரில் மிதக்கும் முறை' : lang === 'hi' ? 'पानी पर तैरती परत' : 'Inoculated Floating Blanket',
          spacing: lang === 'ta' ? 'வயல் முழுவதும் தொடர் படர்ச்சி' : lang === 'hi' ? 'सतत बायोमास आवरण' : 'Continuous Biomass Layer',
          nitrogenFixed: 45,
          lerScore: 1.27,
          harvestDuration: lang === 'ta' ? 'பயிர்க்காலம் முழுவதும்' : lang === 'hi' ? 'पूरी फसल अवधि' : 'Living Water Blanket',
          sowingOffset: lang === 'ta' ? 'நடவு நட்ட 7-ம் நாள் இடவும்' : lang === 'hi' ? 'रोपाई के 7वें दिन छोड़ें' : 'Inoculated on Day 7 after transplanting',
          rootZoneSynergy: lang === 'ta' ? 'நீரில் மிதந்து வேர்களுக்கு குளிர்ச்சி தருகிறது' : lang === 'hi' ? 'खड़े पानी में जड़ों को ठंडक देती है' : 'Floating aquatic symbiosis in standing water',
          reasoning: lang === 'ta' ? 'தேங்கிய நீரில் 5 நாட்களில் இரட்டிப்பாகி, 45 கிலோ வரை தழைச்சத்து தருகிறது; பாசிகளை ஒழிக்கும்.' : lang === 'hi' ? 'खड़े पानी में तेजी से फैलकर 45 किलो नाइट्रोजन जोड़ती है और जलीय खरपतवार मिटाती है।' : 'Multiplies every 5 days on standing floodwater, fixing up to 45 kg N/ha and suffocating aquatic weed growth.',
          postHarvest: { safeMoisturePct: 12.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.rec,
          key: 'greengram',
          name: getName('greengram'),
          rowRatio: lang === 'ta' ? 'வரப்பு ஓரங்களில் நடுதல்' : lang === 'hi' ? 'मेड़ों पर बुवाई' : 'Bund & Perimeter Rows',
          spacing: '20 cm x 10 cm',
          nitrogenFixed: 25,
          lerScore: 1.22,
          harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
          sowingOffset: lang === 'ta' ? 'வரப்புகளில் முதல் நாளில்' : lang === 'hi' ? 'मेड़ों पर दिन 0' : 'Day 0 along field bunds',
          rootZoneSynergy: lang === 'ta' ? 'வரப்பு மண்ணை பலப்படுத்துகிறது' : lang === 'hi' ? 'मेड़ की मिट्टी को मजबूत रखती है' : 'Perimeter pulse taking advantage of non-flooded edges',
          reasoning: lang === 'ta' ? 'பயன்பாடற்ற வரப்புகளில் பயிர் செய்து கூடுதல் பயறு மகசூல் பெறலாம்.' : lang === 'hi' ? 'खाली मेड़ों का सदुपयोग करके बिना अतिरिक्त लागत दाल उत्पादन।' : 'Converts uncultivated bund margins into productive pulse ground without interfering with flooded basins.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.alt,
          key: 'blackgram',
          name: getName('blackgram'),
          rowRatio: lang === 'ta' ? 'வரப்பு அல்லது அறுவடைக்கு முன் விதைப்பு' : lang === 'hi' ? 'मेड़ या रिले बुवाई' : 'Bund or Relay Sowing',
          spacing: '20 cm x 10 cm',
          nitrogenFixed: 22,
          lerScore: 1.18,
          harvestDuration: lang === 'ta' ? '65 - 70 நாட்கள்' : lang === 'hi' ? '65 - 70 दिन' : '65 - 70 Days',
          sowingOffset: lang === 'ta' ? 'நெல் அறுவடைக்கு முன் விதைத்தல்' : lang === 'hi' ? 'कटाई से पहले गीली मिट्टी में' : 'Sown on bunds or broadcast into relay moisture',
          rootZoneSynergy: lang === 'ta' ? 'எஞ்சிய ஈரப்பதத்தை பயன்படுத்தும்' : lang === 'hi' ? 'अवशिष्ट नमी का उपयोग' : 'Utilizes residual soil moisture profile',
          reasoning: lang === 'ta' ? 'பாரம்பரிய நெல் தரிசு உளுந்து சாகுபடி முறை.' : lang === 'hi' ? 'चावल कटाई के बाद खेत की बची हुई नमी में पकने वाली दलहन।' : 'Traditional rice-fallow relay companion that establishes in residual mud moisture right before harvest.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
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
        nitrogenFixed: 25,
        lerScore: 1.22,
        harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில் வரப்பில்' : lang === 'hi' ? 'मेड़ों पर दिन 0' : 'Day 0 along field bunds',
        rootZoneSynergy: lang === 'ta' ? 'வரப்பு வேர் அமைப்பு' : lang === 'hi' ? 'मेड़ सुरक्षा जड़ें' : 'Perimeter root zone without flooding competition',
        reasoning: lang === 'ta' ? 'வரப்புகளை மண் அரிப்பிலிருந்து காத்து கூடுதல் வருவாய் தரும்.' : lang === 'hi' ? 'मेड़ को सुरक्षित रखती है और दलहन की अतिरिक्त उपज देती है।' : 'Monetizes perimeter field bunds and stabilizes bund soil under partial irrigation.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.rec,
        key: 'blackgram',
        name: getName('blackgram'),
        rowRatio: lang === 'ta' ? 'வரப்பு வரிசைகள்' : lang === 'hi' ? 'मेड़ कतारें' : 'Bund Rows',
        spacing: '25 cm x 10 cm',
        nitrogenFixed: 22,
        lerScore: 1.20,
        harvestDuration: lang === 'ta' ? '70 - 75 நாட்கள்' : lang === 'hi' ? '70 - 75 दिन' : '70 - 75 Days',
        sowingOffset: lang === 'ta' ? 'வரப்புகளில்' : lang === 'hi' ? 'मेड़ों पर' : 'Day 0 along field bunds',
        rootZoneSynergy: lang === 'ta' ? 'வரப்பு ஓரங்களை நிலைநிறுத்தும்' : lang === 'hi' ? 'मेड़ को मजबूती' : 'Low canopy stabilizing farm path edges',
        reasoning: lang === 'ta' ? 'குறைந்த பராமரிப்பில் வரப்புகளில் வளரக்கூடியது.' : lang === 'hi' ? 'बिना अतिरिक्त पानी के मेड़ों पर पनपने वाली मजबूत फसल।' : 'Resilient bund legume that thrives on canal seepage and minimal maintenance.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.alt,
        key: 'sesbania',
        name: getName('sesbania'),
        rowRatio: lang === 'ta' ? 'வரப்பு வேலி' : lang === 'hi' ? 'मेड़ सुरक्षा पट्टी' : 'Peripheral Windbreak',
        spacing: '30 cm x 15 cm',
        nitrogenFixed: 40,
        lerScore: 1.16,
        harvestDuration: lang === 'ta' ? 'தழை உரம் / எல்லை பயிர்' : lang === 'hi' ? 'हरी खाद पट्टी' : 'Green Manure / Border',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'அதிக தழைச்சத்து முடிச்சுகள்' : lang === 'hi' ? 'प्रचुर नाइट्रोजन ग्रंथियां' : 'Deep nitrogen nodules on bund perimeters',
        reasoning: lang === 'ta' ? 'காற்றைத் தடுத்து, பின்னர் வயலுக்கு தழை உரமாகவும் பயன்படும்.' : lang === 'hi' ? 'हवा से बचाती है और बाद में धान के खेत में हरी खाद का काम करती है।' : 'Bio-fence that buffers hot winds and provides biomass that can be trampled in as green manure.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  // 4. GROUNDNUT MATRIX
  if (c.includes('groundnut') || c.includes('peanut')) {
    if (w.includes('low') || so.includes('sandy')) {
      return [
        {
          tier: t.high,
          key: 'pearlmillet',
          name: getName('pearlmillet'),
          rowRatio: lang === 'ta' ? '6:1 அல்லது 8:1 வரப்பு வரிசை' : lang === 'hi' ? '6:1 या 8:1 सीमा कतारें' : '6:1 or 8:1 Border Rows',
          spacing: '45 cm x 15 cm',
          nitrogenFixed: 0,
          lerScore: 1.28,
          harvestDuration: lang === 'ta' ? '80 - 85 நாட்கள்' : lang === 'hi' ? '80 - 85 दिन' : '80 - 85 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில் எல்லை வரிசை' : lang === 'hi' ? 'दिन 0 पर सीमा बुवाई' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'காற்றுத் தடுப்பு சுவர்' : lang === 'hi' ? 'हवा रोधक आवरण' : 'Tall perimeter micro-climate barrier',
          reasoning: lang === 'ta' ? 'உயரமான கம்பு வெப்பக் காற்றைத் தடுத்து, வேர்க்கடலை விழுதுகள் இறங்க ஈரப்பதத்தைக் காக்கிறது.' : lang === 'hi' ? 'ऊंचा बाजरा गर्म हवा रोकता है, जिससे मूंगफली की सुइयां आसानी से जमीन में धंसती हैं।' : 'Tall Bajra border rows deflect dry winds in sandy zones, conserving humidity for groundnut pegging.',
          postHarvest: { safeMoisturePct: 11.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.rec,
          key: 'pigeonpea',
          name: getName('pigeonpea'),
          rowRatio: '6:1 / 8:1',
          spacing: '60 cm x 15 cm',
          nitrogenFixed: 40,
          lerScore: 1.34,
          harvestDuration: lang === 'ta' ? '130 - 150 நாட்கள்' : lang === 'hi' ? '130 - 150 दिन' : '130 - 150 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'ஆழமான ஆணிவேர்' : lang === 'hi' ? 'गहरी मूसला जड़' : 'Deep taproot foraging lower subsoil water',
          reasoning: lang === 'ta' ? 'துவரை ஆழமான மண்ணிலிருந்து நீர் எடுப்பதால் வேர்க்கடலையுடன் போட்டி போடுவதில்லை.' : lang === 'hi' ? 'अरहर जमीन की गहराई से पानी लेती है, इसलिए मूंगफली से कोई प्रतिस्पर्धा नहीं होती।' : 'Pigeon Pea taproots tap deep moisture reserves without competing with shallow groundnut pods.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: t.alt,
          key: 'sesame',
          name: getName('sesame'),
          rowRatio: '4:1',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 0,
          lerScore: 1.21,
          harvestDuration: lang === 'ta' ? '75 - 85 நாட்கள்' : lang === 'hi' ? '75 - 85 दिन' : '75 - 85 Days',
          sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
          rootZoneSynergy: lang === 'ta' ? 'குறைந்த நீர் தேவை' : lang === 'hi' ? 'कम पानी में गहरी जड़ें' : 'Low water requirement oilseed canopy',
          reasoning: lang === 'ta' ? 'மணல் பாங்கான நிலங்களில் குறைந்த நீரிலும் விளையக்கூடிய இரட்டை எண்ணெய்வித்து பயிர்.' : lang === 'hi' ? 'रेतीली जमीन में कम पानी पर भी पकने वाली दोहरी तिलहन जोड़ी।' : 'Drought-tolerant dual oilseed pairing that thrives in light sandy soils under restricted water.',
          postHarvest: { safeMoisturePct: 8.0, ambientMonths: 6, coldMonths: 18 }
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
        nitrogenFixed: 42,
        lerScore: 1.36,
        harvestDuration: lang === 'ta' ? '130 - 150 நாட்கள்' : lang === 'hi' ? '130 - 150 दिन' : '130 - 150 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'துவரை ஆழமான வேர் (1.5 மீ) + வேர்க்கடலை மேல் வேர் (20 செ.மீ)' : lang === 'hi' ? 'अरहर गहरी जड़ (1.5 मी) + मूंगफली ऊपरी जड़ (20 सेमी)' : 'Deep taproot (1.5m) + Shallow groundnut peg layer (20cm)',
        reasoning: lang === 'ta' ? 'வேர்க்கடலை 105 நாட்களில் முடிந்ததும், துவரை முழு நிலத்தையும் பயன்படுத்தி அதிக மகசூல் தரும்.' : lang === 'hi' ? 'मूंगफली 105 दिन में कट जाती है, फिर अरहर को पूरी धूप व जमीन मिलती है।' : 'Classic ICAR pairing: groundnut finishes in 105 days, leaving Pigeon Pea to exploit late-season soil moisture and sunlight.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.rec,
        key: 'castor',
        name: getName('castor'),
        rowRatio: '8:1',
        spacing: '90 cm x 30 cm',
        nitrogenFixed: 0,
        lerScore: 1.30,
        harvestDuration: lang === 'ta' ? '140 - 160 நாட்கள்' : lang === 'hi' ? '140 - 160 दिन' : '140 - 160 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'ஆழமான வேர் மற்றும் அகன்ற இலைகள்' : lang === 'hi' ? 'गहरी जड़ व चौड़ी छतरी' : 'Deep taproot with vertical canopy branching',
        reasoning: lang === 'ta' ? 'அதிக வணிக வருவாய் தருவதுடன் புழுக்களுக்கு கவர்ச்சிப் பயிராகவும் செயல்படும்.' : lang === 'hi' ? 'उत्कृष्ट व्यावसायिक आमदनी और कीटों को आकर्षित करने वाली ट्रैप फसल।' : 'Castor provides heavy secondary commercial returns and acts as an effective trap crop for Spodoptera caterpillars.',
        postHarvest: { safeMoisturePct: 8.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: t.alt,
        key: 'blackgram',
        name: getName('blackgram'),
        rowRatio: '4:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 28,
        lerScore: 1.23,
        harvestDuration: lang === 'ta' ? '65 - 75 நாட்கள்' : lang === 'hi' ? '65 - 75 दिन' : '65 - 75 Days',
        sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
        rootZoneSynergy: lang === 'ta' ? 'விரைவான வேர் வளர்ச்சி' : lang === 'hi' ? 'शीघ्र पकने वाली जड़ें' : 'Fast pulse harvest before groundnut canopy locks',
        reasoning: lang === 'ta' ? 'வேர்க்கடலை முதிர்வதற்கு முன்பே விரைவான பயறு அறுவடையைத் தருகிறது.' : lang === 'hi' ? 'मूंगफली पकने से पहले ही जल्दी दाल की कटाई पूरी हो जाती है।' : 'Short-duration pulse that gives an early grain harvest before groundnut pods mature.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  // Generic fallback
  return [
    {
      tier: t.high,
      key: 'greengram',
      name: getName('greengram'),
      rowRatio: '2:1',
      spacing: '25 cm x 10 cm',
      nitrogenFixed: 30,
      lerScore: 1.28,
      harvestDuration: lang === 'ta' ? '60 - 65 நாட்கள்' : lang === 'hi' ? '60 - 65 दिन' : '60 - 65 Days',
      sowingOffset: lang === 'ta' ? 'முதல் நாளில்' : lang === 'hi' ? 'दिन 0' : 'Simultaneous on Day 0',
      rootZoneSynergy: lang === 'ta' ? 'கூட்டு வேர் கட்டமைப்பு' : lang === 'hi' ? 'संतुलित जड़ प्रणाली' : 'Deep taproot + Shallow fibrous root system',
      reasoning: lang === 'ta' ? 'இயற்கை தழைச்சத்து மற்றும் களை கட்டுப்பாடு.' : lang === 'hi' ? 'प्राकृतिक नाइट्रोजन और खरपतवार नियंत्रण।' : 'Dependable biological nitrogen fixation and weed suppression.',
      postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
    }
  ];
};

export default function App() {
  const [lang, setLang] = useState('en');
  const d = DICTIONARY[lang] || DICTIONARY.en;

  const [season, setSeason] = useState('Kharif');
  const [soilType, setSoilType] = useState('Loamy');
  const [waterStatus, setWaterStatus] = useState('Medium');
  const [primaryCropKey, setPrimaryCropKey] = useState('maize');

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
  const [voices, setVoices] = useState([]);

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

  // Dynamic Weather State
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');

  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Live Location & Weather Fetcher (Defaults to Tiruchirappalli)
  useEffect(() => {
    let isMounted = true;

    const fetchLiveForecast = async (lat, lon) => {
      const clientApiKey = import.meta.env.VITE_WEATHER_API_KEY;

      try {
        let forecastList = [];
        let cityName = '';

        if (clientApiKey) {
          const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${clientApiKey}`;
          const res = await fetch(url);
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`OpenWeather status ${res.status}: ${errData.message || res.statusText}`);
          }

          const data = await res.json();
          cityName = data.city?.name || 'Local Farm Area';

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

          forecastList = Object.keys(dailyMap).slice(0, 5).map((dKey, idx) => {
            const dayData = dailyMap[dKey];
            const maxTemp = Math.round(Math.max(...dayData.temps));
            const maxRain = Math.round(Math.max(...dayData.rainProb));
            const maxWind = Math.round(Math.max(...dayData.windSpeeds));
            const highRisk = maxRain >= 50 || maxWind >= 20;

            return {
              day: labels[idx] || `Day ${idx + 1}`,
              temp: maxTemp,
              rainProb: maxRain,
              windKmh: maxWind,
              sprayRisk: highRisk ? 'High' : 'Low'
            };
          });
        } else {
          // Fallback to Backend Proxy
          const proxyRes = await fetch(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}&lang=${lang}`);
          if (!proxyRes.ok) throw new Error(`Proxy error status: ${proxyRes.status}`);
          const proxyData = await proxyRes.json();
          cityName = proxyData.city || 'Local Farm Area';
          forecastList = proxyData.forecast || [];
        }

        if (isMounted && forecastList.length > 0) {
          setWeatherForecast(forecastList);
          setLocationName(cityName);
          setWeatherLoading(false);
        }
      } catch (err) {
        console.error('Dynamic Weather Fetch Warning:', err.message);
        if (isMounted) {
          setLocationName('Trichy Weather Station (Baseline)');
          setWeatherForecast([
            { day: 'Day 1 (Today)', temp: 31, rainProb: 10, windKmh: 12, sprayRisk: 'Low' },
            { day: 'Day 2', temp: 30, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
            { day: 'Day 3', temp: 27, rainProb: 75, windKmh: 24, sprayRisk: 'High' },
            { day: 'Day 4', temp: 26, rainProb: 65, windKmh: 20, sprayRisk: 'High' },
            { day: 'Day 5', temp: 29, rainProb: 15, windKmh: 11, sprayRisk: 'Low' }
          ]);
          setWeatherLoading(false);
        }
      }
    };

    // Default coordinates: Tiruchirappalli (Trichy), Tamil Nadu
    const defaultLat = 10.7905;
    const defaultLon = 78.7047;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchLiveForecast(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn('Geolocation denied or timed out:', err.message);
          fetchLiveForecast(defaultLat, defaultLon);
        },
        { timeout: 7000 }
      );
    } else {
      fetchLiveForecast(defaultLat, defaultLon);
    }

    return () => {
      isMounted = false;
    };
  }, [lang]);

  const calculateEconomics = () => {
    if (!advice || !advice.primaryCrop) return null;
    const yieldPerAcre = Number(advice.primaryCrop.avgYield || (primaryCropKey === 'cotton' ? 8.5 : primaryCropKey === 'groundnut' ? 12.0 : 18.0));
    const mandiRate = Number(advice.marketData?.pricePerQuintal || 2490);
    const costPerAcre = primaryCropKey === 'cotton' ? 21000 : 15500;

    const primaryYield = yieldPerAcre * acres;
    const primaryRevenue = primaryYield * mandiRate;

    const bonusPct = advice.intercrop ? (Number(advice.intercrop.lerScore || 1.25) - 1.0) * 0.75 : 0;
    const intercropRevenue = primaryRevenue * bonusPct;
    const totalGrossRevenue = Math.round(primaryRevenue + intercropRevenue);
    const totalCost = costPerAcre * acres;
    const netProfit = totalGrossRevenue - totalCost;

    return {
      primaryYield: primaryYield.toFixed(1),
      bonusRevenue: Math.round(intercropRevenue),
      totalGrossRevenue,
      totalCost,
      netProfit,
      benefitCostRatio: (totalGrossRevenue / totalCost).toFixed(2)
    };
  };

  const calculateFertilizer = () => {
    if (!advice || !advice.primaryCrop) return null;

    const rdfTable = {
      maize: { n: 48, p: 24, k: 20 },
      cotton: { n: 40, p: 20, k: 20 },
      groundnut: { n: 10, p: 20, k: 30 },
      rice: { n: 50, p: 20, k: 25 },
      paddy: { n: 50, p: 20, k: 25 }
    };

    const rdfKey = String(advice.primaryCrop.key || primaryCropKey).toLowerCase();
    const rdf = rdfTable[rdfKey] || { n: 40, p: 20, k: 20 };
    const nCreditPerAcre = advice.intercrop ? Math.round((Number(advice.intercrop.nitrogenFixed) || 0) / 2.47) : 0;
    const adjustedNPerAcre = Math.max(0, rdf.n - nCreditPerAcre);

    const ureaBags = Math.ceil((adjustedNPerAcre * acres) / 20.7);
    const ureaSavedBags = Math.round((nCreditPerAcre * acres) / 20.7);
    const dapBags = Math.ceil((rdf.p * acres) / 23);
    const mopBags = Math.ceil((rdf.k * acres) / 30);

    return {
      ureaBags,
      dapBags,
      mopBags,
      nCreditPerAcre,
      ureaSavedBags,
      savingsRupees: ureaSavedBags * 267
    };
  };

  // Robust In-Memory FileReader + Calibrated Soil Chromatic Classifier
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
        } catch (err) {
          console.error('Canvas pixel extraction error:', err);
          setIsAnalyzingImage(false);
          return;
        }

        let rSum = 0, gSum = 0, bSum = 0;
        let blackCount = 0, clayCount = 0, sandyCount = 0, greenCount = 0;
        const totalPixels = imgData.length / 4;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          rSum += r;
          gSum += g;
          bSum += b;

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // Black Soil: Dark tones under sunlight (luminance < 125, low chromatic spread)
          if (lum < 125 && Math.abs(r - g) < 28 && Math.abs(g - b) < 28) {
            blackCount++;
          }
          // Clay / Reddish Alluvial: Red-dominant warm earth tone
          else if (r > b * 1.2 && r >= g && lum >= 70 && lum <= 165) {
            clayCount++;
          }
          // Sandy Soil: High brightness, yellow/tan sediment
          else if (lum > 140 && r > 125 && r > b * 1.25) {
            sandyCount++;
          }
          // Vegetation/Green
          else if (g > r * 1.05 && g > b * 1.08) {
            greenCount++;
          }
        }

        const avgR = Math.round(rSum / totalPixels);
        const avgG = Math.round(gSum / totalPixels);
        const avgB = Math.round(bSum / totalPixels);
        const avgLum = Math.round(0.299 * avgR + 0.587 * avgG + 0.114 * avgB);

        const darkPct = (blackCount / totalPixels) * 100;
        const clayPct = (clayCount / totalPixels) * 100;
        const sandPct = (sandyCount / totalPixels) * 100;

        console.log(`[Soil Scanner] Avg RGB: (${avgR}, ${avgG}, ${avgB}) | Lum: ${avgLum}`);
        console.log(`[Soil Scanner] Match Ratios -> Black: ${darkPct.toFixed(1)}% | Clay: ${clayPct.toFixed(1)}% | Sand: ${sandPct.toFixed(1)}%`);

        setTimeout(() => {
          let detectedSoil = 'Loamy';
          let detectedCrop = primaryCropKey;
          let rationale = '';
          let confidence = 89;

          // 1. Black Soil Priority
          if (darkPct > 20 || (avgLum < 120 && Math.abs(avgR - avgG) < 25 && Math.abs(avgG - avgB) < 25)) {
            detectedSoil = 'Black';
            detectedCrop = 'cotton';
            rationale = 'Dark Vertisol (Black Cotton Soil) detected. High moisture retention ideal for Cotton + Black Gram / Moong.';
            confidence = 94;
          }
          // 2. Clay Soil
          else if (clayPct > 20 || (avgR > avgB * 1.25 && avgG > avgB * 1.05 && avgLum <= 150)) {
            detectedSoil = 'Clay';
            detectedCrop = 'rice';
            rationale = 'Heavy clay/alluvial soil with fine grain and moisture capacity detected. Optimal for Paddy and wetland rotations.';
            confidence = 92;
          }
          // 3. Sandy Soil
          else if (sandPct > 20 || (avgLum > 145 && avgR > avgB * 1.3)) {
            detectedSoil = 'Sandy';
            detectedCrop = 'groundnut';
            rationale = 'Light sandy texture detected with porous drainage. Optimal for Groundnut pegging and pulse companions.';
            confidence = 91;
          }
          // 4. Loamy Soil default
          else {
            detectedSoil = 'Loamy';
            detectedCrop = 'maize';
            rationale = 'Balanced organic loam soil detected with neutral drainage. Well suited for Maize cereal-legume intercropping.';
            confidence = 88;
          }

          setImageAnalysisResult({
            isValid: true,
            soilType: detectedSoil,
            suggestedCrop: detectedCrop,
            confidence: `${confidence}%`,
            rationale
          });

          setSoilType(detectedSoil);
          setPrimaryCropKey(detectedCrop);
          setIsAnalyzingImage(false);

          loadAdvice(lang, {
            primaryCropKey: detectedCrop,
            season,
            soilType: detectedSoil,
            waterStatus
          });
        }, 600);
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const parseVoiceInput = (text) => {
    const t = text.toLowerCase();

    let newCrop = primaryCropKey;
    if (t.includes('cotton') || t.includes('பருத்தி') || t.includes('कपास')) newCrop = 'cotton';
    else if (t.includes('rice') || t.includes('paddy') || t.includes('நெல்') || t.includes('धान') || t.includes('चावल')) newCrop = 'rice';
    else if (t.includes('groundnut') || t.includes('peanut') || t.includes('வேர்க்கடலை') || t.includes('मूंगफली')) newCrop = 'groundnut';
    else if (t.includes('maize') || t.includes('corn') || t.includes('மக்காச்சோளம்') || t.includes('मक्का')) newCrop = 'maize';
    setPrimaryCropKey(newCrop);

    let newSoil = soilType;
    if (t.includes('black') || t.includes('கரிசல்') || t.includes('काली')) newSoil = 'Black';
    else if (t.includes('clay') || t.includes('களிமண்') || t.includes('चिकनी')) newSoil = 'Clay';
    else if (t.includes('sandy') || t.includes('மணல்') || t.includes('बलुई')) newSoil = 'Sandy';
    else if (t.includes('loam') || t.includes('வண்டல்') || t.includes('दोमट')) newSoil = 'Loamy';
    setSoilType(newSoil);

    let newSeason = season;
    if (t.includes('rabi') || t.includes('winter') || t.includes('ரபி') || t.includes('रबी')) newSeason = 'Rabi';
    else if (t.includes('zaid') || t.includes('summer') || t.includes('சையத்') || t.includes('जायद')) newSeason = 'Zaid';
    else if (t.includes('kharif') || t.includes('monsoon') || t.includes('காரிப்') || t.includes('खरीफ')) newSeason = 'Kharif';
    setSeason(newSeason);

    let newWater = waterStatus;
    if (t.includes('high') || t.includes('full') || t.includes('அதிக') || t.includes('अधिक')) newWater = 'High';
    else if (t.includes('low') || t.includes('rainfed') || t.includes('குறைந்த') || t.includes('कम')) newWater = 'Low';
    else if (t.includes('medium') || t.includes('partial') || t.includes('மிதமான') || t.includes('मध्यम')) newWater = 'Medium';
    setWaterStatus(newWater);

    loadAdvice(lang, {
      primaryCropKey: newCrop,
      season: newSeason,
      soilType: newSoil,
      waterStatus: newWater
    });
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

    recognition.onstart = () => {
      setIsListening(true);
      setSpokenTranscript('');
    };

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
    const normKey = cropLookup === 'rice' ? 'paddy' : cropLookup;
    const sVar = overrideParams?.season || season;
    const soVar = overrideParams?.soilType || soilType;
    const wVar = overrideParams?.waterStatus || waterStatus;

    try {
      const payload = overrideParams || {
        primaryCropKey: normKey,
        season: sVar,
        soilType: soVar,
        waterStatus: wVar
      };

      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, lang: activeLang })
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data || !data.primaryCrop) throw new Error('Invalid response structure');

      const fallback3 = getClientTop3Companions(normKey, sVar, soVar, wVar, activeLang).map(item => normalizeCompanion(item, activeLang));
      const rawOptions = (data.companionOptions && data.companionOptions.length > 0)
        ? data.companionOptions
        : fallback3;

      data.companionOptions = rawOptions.map(item => normalizeCompanion(item, activeLang));
      data.intercrop = normalizeCompanion(data.intercrop, activeLang) || data.companionOptions[0];

      setAdvice(data);
      setActiveTab('intercrop');
    } catch (err) {
      console.warn('Backend fetch fallback engaged:', err);
      const companionList = getClientTop3Companions(normKey, sVar, soVar, wVar, activeLang).map(item => normalizeCompanion(item, activeLang));
      const cropRates = CURRENT_MSP_DIRECTORY[normKey] || CURRENT_MSP_DIRECTORY.maize;

      const primaryNames = {
        maize: { en: 'Maize / Corn', ta: 'மக்காச்சோளம்', hi: 'मक्का' },
        cotton: { en: 'Cotton', ta: 'பருத்தி', hi: 'कपास' },
        groundnut: { en: 'Groundnut', ta: 'வேர்க்கடலை', hi: 'मूंगफली' },
        paddy: { en: 'Paddy / Rice', ta: 'நெல்', hi: 'धान / चावल' },
        rice: { en: 'Paddy / Rice', ta: 'நெல்', hi: 'धान / चावल' }
      };
      const pName = (primaryNames[normKey] && primaryNames[normKey][activeLang]) || primaryNames[normKey]?.en || normKey;

      setAdvice({
        primaryCrop: {
          key: normKey,
          name: pName,
          harvestDuration: activeLang === 'ta' ? '3 - 4 மாதங்கள்' : activeLang === 'hi' ? '3 - 4 महीने' : '3 - 4 Months',
          avgYield: normKey === 'cotton' ? 8.5 : normKey === 'groundnut' ? 12.0 : 18.0,
          safeMoisturePct: 12.0,
          ambientShelfLifeMonths: 6,
          coldShelfLifeMonths: 18
        },
        marketData: {
          pricePerQuintal: cropRates.mandi,
          officialMsp: cropRates.msp,
          lastUpdated: cropRates.date
        },
        intercrop: companionList[0],
        companionOptions: companionList,
        pests: [
          {
            pestName: activeLang === 'ta' ? 'படைப்புழு / காய் துளைப்பான்' : activeLang === 'hi' ? 'फॉल आर्मीवर्म / फल छेदक' : 'Fall Armyworm / Pod Borer',
            cultural: activeLang === 'ta' ? 'ஆழ உழவு மற்றும் தூய விதைப்படுக்கை' : activeLang === 'hi' ? 'गहरी जुताई व शुद्ध क्यारी' : 'Deep summer ploughing and clean seedbed tillage.',
            bio: activeLang === 'ta' ? 'வேப்ப எண்ணெய் கரைசல் (5 மிலி/லி)' : activeLang === 'hi' ? 'नीम तेल स्प्रे (5ml/L)' : 'Neem seed kernel extract (NSKE 5%) or Trichogramma cards.',
            chemical: 'Emamectin benzoate 5% SG @ 4g/10L water.',
            toxicity: 'Moderate',
            phiDays: 14
          }
        ]
      });
      setActiveTab('intercrop');
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    loadAdvice(newLang);
  };

  const handleSpeak = () => {
    if (!advice || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    let textToRead = '';
    const duration = advice?.primaryCrop?.harvestDuration || '';

    if (lang === 'ta') {
      textToRead = `முதன்மைப் பயிர்: ${advice.primaryCrop.name}. அறுவடை காலம்: ${duration}. அரசு ஆதார விலை MSP: குவிண்டாலுக்கு ₹${advice.marketData?.officialMsp}. `;
      if (advice.intercrop) {
        textToRead += `பரிந்துரைக்கப்படும் உகந்த ஊடு பயிர்: ${getLocalizedCropName(advice.intercrop.key, advice.intercrop.name, 'ta')}. முன்னுரிமை தகுதி: ${getLocalizedTier(advice.intercrop.tier, 'ta')}. பயிர் வரிசை அமைப்பு: ${advice.intercrop.rowRatio}. நில பயன்பாட்டு திறன்: ${advice.intercrop.lerScore}. பலன்: ${advice.intercrop.reasoning}.`;
      }
    } else if (lang === 'hi') {
      textToRead = `मुख्य फसल: ${advice.primaryCrop.name}. कटाई अवधि: ${duration}. सरकारी MSP: ₹${advice.marketData?.officialMsp} प्रति क्विंटल. `;
      if (advice.intercrop) {
        textToRead += `अनुशंसित साथी फसल: ${getLocalizedCropName(advice.intercrop.key, advice.intercrop.name, 'hi')}. प्राथमिकता स्तर: ${getLocalizedTier(advice.intercrop.tier, 'hi')}. पंक्ति अनुपात: ${advice.intercrop.rowRatio}. भूमि दक्षता LER: ${advice.intercrop.lerScore}. लाभ: ${advice.intercrop.reasoning}.`;
      }
    } else {
      textToRead = `Primary crop: ${advice.primaryCrop.name}. Harvest duration: ${advice.primaryCrop.harvestDuration}. Government MSP floor rate: ₹${advice.marketData?.officialMsp} per quintal. `;
      if (advice.intercrop) {
        textToRead += `Recommended companion crop: ${advice.intercrop.name}. Recommendation tier: ${advice.intercrop.tier}. Row pattern: ${advice.intercrop.rowRatio}. Land Equivalent Ratio: ${advice.intercrop.lerScore}. Rationale: ${advice.intercrop.reasoning}.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    const targetLocale = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.lang = targetLocale;

    const matchedVoice = voices.find(v => v.lang.toLowerCase() === targetLocale.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().startsWith(lang));
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactInfo: contact, password, lang })
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
      alert('Authentication error on backend.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_user');
    setUser(null);
    setShowHistory(false);
  };

  const handleSavePlan = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/history/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          primaryCrop: primaryCropKey,
          intercrop: advice?.intercrop?.key || advice?.intercrop?.name || 'none',
          season,
          soilType,
          waterStatus,
          lang
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      alert(lang === 'ta' ? 'ஊடுபயிர் திட்டம் உங்கள் சுயவிவரத்தில் சேமிக்கப்பட்டது!' : lang === 'hi' ? 'अंतर-फसल योजना आपकी प्रोफाइल में सहेज ली गई!' : 'Intercropping blueprint saved to your farmer profile!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save blueprint: ' + err.message);
    }
  };

  const openHistoryDrawer = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/history/${user.id}`);
      const data = await res.json();
      setHistoryList(Array.isArray(data) ? data : []);
      setShowHistory(true);
    } catch (err) {
      console.error('History fetch failed:', err);
      alert('Could not fetch history.');
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      await fetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE' });
      setHistoryList(historyList.filter(item => item.id !== id));
    } catch {
      alert('Failed to delete history record.');
    }
  };

  const selectCompanionFromHierarchy = (selectedCompanion) => {
    setAdvice(prev => ({
      ...prev,
      intercrop: normalizeCompanion(selectedCompanion, lang)
    }));
  };

  const renderTierBadge = (tier) => {
    const tStr = String(tier || '');
    if (tStr.includes('Highly') || tStr.includes('சிறந்த') || tStr.includes('अत्यधिक')) {
      return <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">{tier || '⭐ Highly Recommended'}</span>;
    }
    if (tStr.includes('Alternative') || tStr.includes('மாற்று') || tStr.includes('विकल्प')) {
      return <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">{tier || '🌾 Feasible Alternative'}</span>;
    }
    return <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">{tier || '👍 Recommended'}</span>;
  };

  const renderHazardBadge = (level) => {
    switch (level) {
      case 'Severe':
      case 'High':
        return <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">🛑 {level} Hazard</span>;
      case 'Moderate':
        return <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">⚠️ {level} Hazard</span>;
      default:
        return <span className="bg-green-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">✅ Bio-Safe</span>;
    }
  };

  const fin = calculateEconomics();
  const fert = calculateFertilizer();

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans max-w-5xl mx-auto">
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
              <span className="text-xs font-bold text-green-800 bg-green-50 px-2.5 py-1 rounded">👤 {user.name || user.contact}</span>
              <button onClick={handleLogout} className="text-xs text-red-600 hover:text-red-800 font-semibold underline ml-1">
                {d.logout}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-xs font-bold text-blue-700 underline">{d.signIn}</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border p-3.5 rounded-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
              {d.scanField}
            </h3>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              Upload / Snap Photo
            </button>
          </div>
          {isAnalyzingImage && (
            <p className="text-[11px] text-emerald-800 animate-pulse font-medium">{d.analyzingImage}</p>
          )}
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
                <div className="flex items-center gap-3 bg-amber-50 p-2.5 rounded-lg border border-amber-300 text-amber-950">
                  <img src={fieldImage} alt="Upload Preview" className="w-12 h-12 rounded object-cover border border-amber-200 opacity-80 flex-shrink-0" />
                  <div className="text-[11px] space-y-0.5">
                    <div className="flex items-center gap-1.5 font-black text-amber-900">
                      <span>⚠️ {imageAnalysisResult.errorTitle}</span>
                    </div>
                    <p className="text-amber-800 leading-tight">
                      {imageAnalysisResult.rationale}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border p-3.5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
              Voice Assistant (STT)
            </h3>
            <button
              onClick={toggleListening}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-sm'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {isListening ? d.listening : d.startVoice}
            </button>
          </div>
          {spokenTranscript ? (
            <p className="text-[11px] text-gray-700 italic bg-gray-50 p-2 rounded border truncate mt-2">
              🗣️ "{spokenTranscript}"
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 mt-2">
              {lang === 'ta' ? 'உதா: "பருத்தி கரிசல் மண் காரிப் பருவம்"' : lang === 'hi' ? 'उदा: "कपास काली मिट्टी खरीफ सीजन"' : 'Try: "Cotton black soil kharif season"'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">{d.crop}</label>
            <select value={primaryCropKey} onChange={(e) => setPrimaryCropKey(e.target.value)} className="w-full border p-2 rounded text-sm bg-white font-semibold">
              <option value="maize">{d.crops.maize}</option>
              <option value="cotton">{d.crops.cotton}</option>
              <option value="groundnut">{d.crops.groundnut}</option>
              <option value="rice">{d.crops.rice}</option>
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
              <option value="Loamy">{d.soils.Loamy}</option>
              <option value="Clay">{d.soils.Clay}</option>
              <option value="Sandy">{d.soils.Sandy}</option>
              <option value="Black">{d.soils.Black}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">{d.water}</label>
            <select value={waterStatus} onChange={(e) => setWaterStatus(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
              <option value="Low">{d.waters.Low}</option>
              <option value="Medium">{d.waters.Medium}</option>
              <option value="High">{d.waters.High}</option>
            </select>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-emerald-950">Farm Land Area</label>
              <span className="text-xs font-black bg-emerald-700 text-white px-2 py-0.5 rounded">
                {acres} {d.acres}
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="15" 
              step="0.5" 
              value={acres} 
              onChange={(e) => setAcres(parseFloat(e.target.value))} 
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mt-1">
              <span>0.5 Acre</span>
              <span>15 Acres</span>
            </div>
          </div>

          <button onClick={() => loadAdvice(lang)} className="w-full bg-green-800 text-white font-extrabold text-sm py-2.5 rounded-lg hover:bg-green-900 transition shadow">
            {d.btnGet}
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          {!advice ? (
            <div className="bg-white p-10 rounded-xl border border-dashed text-center text-xs text-gray-500">
              {d.guestAlert}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Primary Crop Selected</span>
                  <h2 className="text-xl font-black text-gray-900">{advice.primaryCrop.name}</h2>
                  <span className="text-xs text-green-700 font-semibold">
                    ⏱️ {d.harvestWindow}: {advice.primaryCrop.harvestDuration}
                  </span>
                </div>
                <div className="text-right">
                  <div className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded font-black inline-block">
                    {d.officialMsp}: ₹{advice.marketData?.officialMsp}{d.perQtl}
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {d.lastUpdated}: {advice.marketData?.lastUpdated}
                  </p>
                </div>
              </div>

              <div className="flex overflow-x-auto border-b border-gray-200 bg-white rounded-t-xl px-2 pt-2 gap-1 shadow-sm scrollbar-none">
                <button
                  onClick={() => setActiveTab('intercrop')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'intercrop' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabIntercrop}
                </button>

                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'checklist' ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabChecklist}
                </button>

                <button
                  onClick={() => setActiveTab('economics')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'economics' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabEconomics}
                </button>

                <button
                  onClick={() => setActiveTab('fertilizer')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'fertilizer' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabFertilizer}
                </button>

                <button
                  onClick={() => setActiveTab('weather')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'weather' ? 'border-blue-600 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabWeather}
                </button>

                <button
                  onClick={() => setActiveTab('storage')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'storage' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabStorage}
                </button>

                <button
                  onClick={() => setActiveTab('pests')}
                  className={`pb-2.5 px-3 text-xs font-black whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
                    activeTab === 'pests' ? 'border-red-600 text-red-800' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {d.tabPests} ({advice.pests?.length || 0})
                </button>
              </div>

              {activeTab === 'intercrop' && (
                <div className="space-y-4">
                  {advice.companionOptions && advice.companionOptions.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-2">
                      <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">{d.hierarchyTitle}</h3>
                        <p className="text-[11px] text-gray-500">{d.hierarchySubtitle}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                        {advice.companionOptions.map((opt, idx) => {
                          const isSelected = advice.intercrop?.key === opt.key;
                          return (
                            <div
                              key={idx}
                              onClick={() => selectCompanionFromHierarchy(opt)}
                              className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-600/20'
                                  : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100/80'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  {renderTierBadge(getLocalizedTier(opt.tier, lang))}
                                  <span className="text-[10px] font-black text-gray-600">LER {opt.lerScore}</span>
                                </div>
                                <h4 className="text-sm font-black text-gray-900">
                                  {getLocalizedCropName(opt.key, opt.name, lang)}
                                </h4>
                                <p className="text-[11px] text-gray-500 line-clamp-2">{opt.reasoning}</p>
                              </div>

                              <div className="mt-2.5 pt-1.5 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold">
                                <span className="text-emerald-800">+{opt.nitrogenFixed} kg N/ha</span>
                                <span className={isSelected ? 'text-emerald-700' : 'text-gray-400'}>
                                  {isSelected 
                                    ? (AGRONOMIC_TRANSLATIONS.ui.activePlan[lang] || '✓ Active Plan') 
                                    : (AGRONOMIC_TRANSLATIONS.ui.clickToSelect[lang] || 'Click to Select')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {advice.intercrop && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-emerald-300 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-800 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wide">
                              {d.intercropOpt}
                            </span>
                            {renderTierBadge(getLocalizedTier(advice.intercrop.tier, lang))}
                          </div>
                          <h3 className="text-xl font-black text-green-950 mt-1.5">
                            {getLocalizedCropName(advice.intercrop.key, advice.intercrop.name, lang)}
                          </h3>
                          <p className="text-xs text-green-700 font-semibold">
                            {AGRONOMIC_TRANSLATIONS.ui.simultaneousFor[lang] || 'Simultaneous growing companion for'} {advice.primaryCrop.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="bg-emerald-200 text-emerald-950 font-black text-sm px-3 py-1 rounded-full shadow-sm">
                            LER: {advice.intercrop.lerScore}
                          </span>
                          <p className="text-[10px] text-green-800 font-extrabold mt-1">
                            +{Math.round((Number(advice.intercrop.lerScore || 1.25) - 1) * 100)}% {d.efficiencyGain}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{d.rowRatio}</p>
                          <p className="text-xs font-extrabold text-green-950">{advice.intercrop.rowRatio}</p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{d.plantSpacing}</p>
                          <p className="text-xs font-extrabold text-green-950 truncate">{advice.intercrop.spacing}</p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{d.nFix}</p>
                          <p className="text-xs font-extrabold text-emerald-800">
                            {Number(advice.intercrop.nitrogenFixed) > 0 ? `+${advice.intercrop.nitrogenFixed} kg N/ha` : 'Trap Barrier'}
                          </p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{AGRONOMIC_TRANSLATIONS.ui.companionCycle[lang] || 'Companion Cycle'}</p>
                          <p className="text-xs font-extrabold text-gray-800">{getLocalizedDuration(advice.intercrop.harvestDuration, lang)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/90 p-3 rounded-lg border border-emerald-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{d.sowingSchedule}</p>
                          <p className="font-bold text-green-950 mt-0.5">
                            {getLocalizedSchedule(advice.intercrop.sowingOffset, lang)}
                          </p>
                        </div>
                        <div className="bg-white/90 p-3 rounded-lg border border-emerald-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{d.rootSynergy}</p>
                          <p className="font-bold text-green-950 mt-0.5">
                            {getLocalizedSynergy(advice.intercrop.rootZoneSynergy, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/95 p-3 rounded-lg border border-emerald-100 text-xs text-green-900 leading-relaxed shadow-2xs">
                        <strong>💡 Why this pairing works:</strong> {advice.intercrop.reasoning}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={handleSpeak} 
                          className={`flex-1 text-xs py-2 rounded-lg font-bold border transition ${
                            isSpeaking ? 'bg-red-500 text-white border-red-600' : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          {isSpeaking ? d.stopSpeak : d.speakAdvice}
                        </button>
                        <button 
                          onClick={handleSavePlan} 
                          className="flex-1 bg-gray-900 text-white text-xs py-2 rounded-lg font-bold hover:bg-black transition shadow-sm"
                        >
                          {d.savePlan}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex flex-wrap justify-between items-center border-b pb-3 gap-2">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">{d.checklistTitle}</h3>
                      <p className="text-[11px] text-gray-500">{d.checklistSubtitle}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCheckedTasks({});
                        localStorage.removeItem('agri_tasks');
                      }}
                      className="text-[11px] text-red-600 hover:text-red-800 font-bold underline"
                    >
                      Reset Checklist
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/40">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedTasks['water_mgmt']}
                          onChange={() => toggleTask('water_mgmt')}
                          className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-blue-950">💧 Soil Moisture & Irrigation Timing</span>
                          <p className="text-gray-600 mt-0.5">
                            Inspect root zones of both {advice.primaryCrop.name} and {getLocalizedCropName(advice.intercrop?.key, advice.intercrop?.name, lang)}. 
                            {waterStatus === 'Low'
                              ? ' Soil is rainfed/low moisture: mulch inter-row spacing to minimize surface evaporation.'
                              : ' Maintain consistent moisture without pooling to protect legume root nodules from suffocation.'}
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/40">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedTasks['weather_spray']}
                          onChange={() => toggleTask('weather_spray')}
                          className="w-4 h-4 mt-0.5 accent-sky-600 rounded"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-sky-950">🌦️ Weather Check Prior to Field Spraying</span>
                          <p className="text-gray-600 mt-0.5">
                            Check 5-day wind and precipitation risks before chemical or biological application. Never spray if rain is forecast within 24 hours.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="p-3 rounded-lg border border-red-200 bg-red-50/40">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedTasks['pest_scouting']}
                          onChange={() => toggleTask('pest_scouting')}
                          className="w-4 h-4 mt-0.5 accent-red-600 rounded"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-red-950">🐛 Pest Scouting & Trap Barrier Check</span>
                          <p className="text-gray-600 mt-0.5">
                            Examine leaf undersides for egg clusters. Inspect companion rows ({getLocalizedCropName(advice.intercrop?.key, advice.intercrop?.name, lang)}) to verify if trap boundaries are diverting pests.
                          </p>
                        </div>
                      </label>
                    </div>

                    {advice.pests && advice.pests.length > 0 && (
                      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checkedTasks['phi_check']}
                            onChange={() => toggleTask('phi_check')}
                            className="w-4 h-4 mt-0.5 accent-amber-600 rounded"
                          />
                          <div className="text-xs">
                            <span className="font-extrabold text-amber-950">⏳ Harvest Safety Countdown (PHI Compliance)</span>
                            <p className="text-gray-600 mt-0.5">
                              Ensure at least {advice.pests[0]?.phiDays || 14} days have elapsed since the last spray before picking companion pods or harvesting {advice.primaryCrop.name}.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'economics' && fin && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">
                      Farm Financials for {acres} Acres ({getLocalizedCropName(advice.intercrop?.key, advice.intercrop?.name, lang)})
                    </h3>
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded">
                      B:C Ratio: {fin.benefitCostRatio}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Expected Main Yield</p>
                      <p className="text-base font-black text-gray-900 mt-0.5">{fin.primaryYield} Qtl</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] text-blue-700 font-bold uppercase">Intercrop Bonus Value</p>
                      <p className="text-base font-black text-blue-950 mt-0.5">+₹{fin.bonusRevenue.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <p className="text-[10px] text-amber-700 font-bold uppercase">Est. Cultivation Cost</p>
                      <p className="text-base font-black text-amber-950 mt-0.5">₹{fin.totalCost.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <p className="text-[10px] text-emerald-800 font-bold uppercase">Projected Net Profit</p>
                      <p className="text-base font-black text-emerald-700 mt-0.5">₹{fin.netProfit.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                    💵 <strong>Revenue Breakdown:</strong> Gross Mandi sales reach <strong>₹{fin.totalGrossRevenue.toLocaleString('en-IN')}</strong>, powered by simultaneous companion intercropping delivering an extra <strong>₹{fin.bonusRevenue.toLocaleString('en-IN')}</strong> above mono-cropping.
                  </div>
                </div>
              )}

              {activeTab === 'fertilizer' && fert && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">Commercial Fertilizer Dosage ({acres} Acres)</h3>
                    <span className="text-xs bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded">
                      Bio N-Credit Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-[10px] text-blue-700 font-bold uppercase">Urea (46% N)</p>
                      <p className="text-lg font-black text-blue-950 mt-0.5">{fert.ureaBags} Bags</p>
                      <p className="text-[10px] text-gray-500">45 kg Bag</p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-[10px] text-amber-700 font-bold uppercase">DAP (18-46-0)</p>
                      <p className="text-lg font-black text-amber-950 mt-0.5">{fert.dapBags} Bags</p>
                      <p className="text-[10px] text-gray-500">50 kg Bag</p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-[10px] text-purple-700 font-bold uppercase">MOP Potash (60% K)</p>
                      <p className="text-lg font-black text-purple-950 mt-0.5">{fert.mopBags} Bags</p>
                      <p className="text-[10px] text-gray-500">50 kg Bag</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 space-y-1 text-xs text-emerald-950">
                    <div className="flex justify-between items-center font-black">
                      <span>🌱 Biological Legume Credit:</span>
                      <span className="text-emerald-700">+{fert.nCreditPerAcre} kg Pure N / Acre</span>
                    </div>
                    <p className="text-gray-700">
                      Because {getLocalizedCropName(advice.intercrop?.key, advice.intercrop?.name, lang)} nodulates atmospheric nitrogen, you save <strong>{fert.ureaSavedBags} commercial Urea bag(s)</strong>, saving approximately <strong>₹{fert.savingsRupees}</strong> on input costs.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: WEATHER */}
              {activeTab === 'weather' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">5-Day Field Weather & Spraying Outlook</h3>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      📍 {locationName}
                    </span>
                  </div>

                  {weatherLoading ? (
                    <div className="py-8 text-center text-xs text-emerald-700 animate-pulse font-bold">
                      🛰️ Contacting weather satellite & retrieving live field forecast...
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      {weatherForecast.map((w, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border transition ${
                            w.sprayRisk === 'High' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          <p className="font-black text-gray-900 text-[11px]">{w.day}</p>
                          <p className="text-xs font-bold text-gray-700 mt-1">{w.temp}°C</p>
                          <p className="text-[10px] text-blue-700 font-semibold">💧 {w.rainProb}% Rain</p>
                          <p className="text-[9px] text-gray-500">{w.windKmh} km/h</p>
                          <span
                            className={`inline-block text-[8px] font-black uppercase px-1 py-0.5 rounded mt-1.5 ${
                              w.sprayRisk === 'High' ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {w.sprayRisk === 'High' ? 'No Spray' : 'Safe Spray'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">Post-Harvest Storage & Shelf-Life Longevity</h3>
                    <span className="text-xs bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded">
                      Storage Guidance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-gray-50 rounded-lg border space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-gray-900">{advice.primaryCrop.name}</span>
                        <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">Primary</span>
                      </div>
                      <p><strong>Safe Moisture Threshold:</strong> ≤ {advice.primaryCrop.safeMoisturePct}% (Sun dry thoroughly)</p>
                      <p><strong>Ambient Godown Life:</strong> {advice.primaryCrop.ambientShelfLifeMonths} Months</p>
                      <p><strong>Hermetic / Cold Storage:</strong> Up to {advice.primaryCrop.coldShelfLifeMonths} Months</p>
                    </div>

                    {advice.intercrop && (
                      <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-emerald-950">
                            {getLocalizedCropName(advice.intercrop.key, advice.intercrop.name, lang)}
                          </span>
                          <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">Companion</span>
                        </div>
                        <p><strong>Safe Moisture Threshold:</strong> ≤ {advice.intercrop.postHarvest?.safeMoisturePct || 10}%</p>
                        <p><strong>Ambient Storage:</strong> {advice.intercrop.postHarvest?.ambientMonths || 6} Months</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pests' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-3">
                  <h3 className="text-xs font-black text-red-800 uppercase border-b pb-2">{d.pestTitle}</h3>
                  {advice.pests && advice.pests.length > 0 ? (
                    advice.pests.map((p, idx) => (
                      <div key={idx} className="text-xs space-y-2 bg-red-50/70 p-3.5 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-red-950">{p.pestName}</span>
                          {renderHazardBadge(p.toxicity)}
                        </div>
                        <p><strong>{d.cultural}:</strong> {p.cultural}</p>
                        <p><strong>{d.bio}:</strong> {p.bio}</p>
                        <p className="text-red-800"><strong>⚠️ {d.chemical}:</strong> {p.chemical}</p>
                        <div className="bg-white p-2 rounded border border-red-100 flex items-center justify-between text-gray-700">
                          <span className="font-bold">⏳ {d.phi}:</span>
                          <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded text-[11px] font-black">
                            Wait {p.phiDays} {d.days} before harvesting
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 py-4 text-center">No active pest warnings for this crop stage.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-gray-800">{d.historyTitle}</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-black font-bold">✕</button>
            </div>
            {historyList.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">{d.noHistory}</p>
            ) : (
              <div className="space-y-2">
                {historyList.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-green-900 capitalize">
                        {item.primary_crop} + {getLocalizedCropName(item.intercrop, item.intercrop, lang)}
                      </p>
                      <p className="text-gray-500 text-[10px]">{item.season} • {item.soil_type} • {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteHistoryItem(item.id)} className="text-red-600 hover:underline font-bold text-[11px]">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement._reactRootContainer) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}