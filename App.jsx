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

const getClientTop3Companions = (crop, szn, soil, water) => {
  const s = String(szn || '').toLowerCase();
  const so = String(soil || '').toLowerCase();
  const w = String(water || '').toLowerCase();
  const c = String(crop || '').toLowerCase();

  if (c.includes('maize') || c.includes('corn')) {
    if (s.includes('zaid') || w.includes('high')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'greengram',
          name: 'Green Gram (Moong - Summer Special)',
          rowRatio: '1:2 or 2:2',
          spacing: '25 cm x 10 cm',
          nitrogenFixed: 38,
          lerScore: 1.38,
          harvestDuration: '55 - 65 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Shallow legume canopy shading under summer irrigation',
          reasoning: 'Under summer irrigation (Zaid), fast 60-day Moong captures light between tall maize stalks before peak heat, fixing high soil nitrogen.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Recommended',
          key: 'cowpea',
          name: 'Cowpea (Lobia)',
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 35,
          lerScore: 1.32,
          harvestDuration: '65 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Dense foliage mulch',
          reasoning: 'Provides heavy foliage to suppress summer weeds while offering dual food and fodder harvests.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Feasible Alternative',
          key: 'blackgram',
          name: 'Black Gram (Urad)',
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 30,
          lerScore: 1.27,
          harvestDuration: '70 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Compact pulse zone',
          reasoning: 'Stable pulse option with high Mandi liquidity if Green Gram seed is unavailable.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
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
          nitrogenFixed: 30,
          lerScore: 1.34,
          harvestDuration: '70 - 80 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Erect cool-season legume architecture',
          reasoning: 'Thrives in crisp winter temperatures, earning high premium market value alongside winter maize.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Recommended',
          key: 'pea',
          name: 'Field Pea (Matar)',
          rowRatio: '2:2',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 32,
          lerScore: 1.30,
          harvestDuration: '65 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Climbing tendrils along stalk base',
          reasoning: 'Rapid cold-tolerant green pod harvesting provides quick early cash flow for the farmer.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Feasible Alternative',
          key: 'chickpea',
          name: 'Chickpea (Gram)',
          rowRatio: '2:1',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 28,
          lerScore: 1.25,
          harvestDuration: '85 - 100 Days',
          sowingOffset: 'Day 0 with seed treatment',
          rootZoneSynergy: 'Deep subsoil root foraging',
          reasoning: 'Durable winter legume with very low pest overlap with maize.',
          postHarvest: { safeMoisturePct: 9.5, ambientMonths: 8, coldMonths: 24 }
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
        nitrogenFixed: 35,
        lerScore: 1.32,
        harvestDuration: '65 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot + Shallow fibrous root system',
        reasoning: 'Standard Kharif monsoon pairing: rapid early vine growth smothers aggressive weeds and nodulates atmospheric nitrogen during maize peak vegetative expansion.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: 'Recommended',
        key: 'soybean',
        name: 'Soybean',
        rowRatio: '2:2 or 2:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 36,
        lerScore: 1.29,
        harvestDuration: '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Vertical erect profile reducing wind lodging',
        reasoning: 'Substantial commercial oilseed value with robust atmospheric nitrogen contribution in loamy and clay soils.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: 'Feasible Alternative',
        key: 'horsegram',
        name: 'Horse Gram (Kulthi)',
        rowRatio: '2:1',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 28,
        lerScore: 1.26,
        harvestDuration: '80 - 90 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Fibrous soil-binding mulch layer',
        reasoning: 'In rainfed or sandy drought-prone profiles, Horse Gram develops deep sub-surface root tapestries that conserve soil moisture and prevent surface crusting.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  if (c.includes('cotton')) {
    if (so.includes('black')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'blackgram',
          name: 'Black Gram (Urad) / Marigold',
          rowRatio: '1:2',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 32,
          lerScore: 1.31,
          harvestDuration: '70 - 75 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Shallow pulse zone utilizing moisture between 90cm cotton rows',
          reasoning: 'Deep Vertisols (Black soil) hold moisture to finish short Black Gram, while Marigold borders lure away American bollworms.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Recommended',
          key: 'greengram',
          name: 'Green Gram (Moong)',
          rowRatio: '1:2',
          spacing: '25 cm x 10 cm',
          nitrogenFixed: 30,
          lerScore: 1.28,
          harvestDuration: '60 - 65 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Quick maturity before cotton branches wide',
          reasoning: 'Harvested before cotton reaches peak vegetative branching, ensuring zero competition for sunlight.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Feasible Alternative',
          key: 'soybean',
          name: 'Soybean',
          rowRatio: '1:2 Strip Cropping',
          spacing: '30 cm x 10 cm',
          nitrogenFixed: 34,
          lerScore: 1.26,
          harvestDuration: '80 - 90 Days',
          sowingOffset: 'Simultaneous on Day 0',
          rootZoneSynergy: 'Mid-tier canopy cover protecting wide ridges',
          reasoning: 'Generates early cash income before cotton picking starts; requires timely picking of soybean pods.',
          postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
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
        nitrogenFixed: 25,
        lerScore: 1.24,
        harvestDuration: '85 - 95 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Extreme osmotic adjustment for dry soils',
        reasoning: 'Outstanding drought and heat resilience; deep taproot extracts nutrients without invading wide cotton root balls.',
        postHarvest: { safeMoisturePct: 9.0, ambientMonths: 8, coldMonths: 24 }
      },
      {
        tier: 'Recommended',
        key: 'blackgram',
        name: 'Black Gram (Urad)',
        rowRatio: '1:2',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 30,
        lerScore: 1.28,
        harvestDuration: '70 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Low sprawling canopy reducing soil crusting',
        reasoning: 'Proven commercial pulse intercrop that provides weed control during cotton’s slow juvenile phase.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: 'Feasible Alternative',
        key: 'cowpea',
        name: 'Cowpea (Trap / Cover)',
        rowRatio: '1:1 Border',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 32,
        lerScore: 1.22,
        harvestDuration: '65 - 75 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Aggressive topsoil shading',
        reasoning: 'Effective cover against erosion, but requires pruning if vegetative vines begin climbing young cotton stalks.',
        postHarvest: { safeMoisturePct: 10.0, ambientMonths: 6, coldMonths: 18 }
      }
    ];
  }

  if (c.includes('rice') || c.includes('paddy')) {
    if (w.includes('high')) {
      return [
        {
          tier: 'Highly Recommended',
          key: 'azolla',
          name: 'Azolla Pinnata (Biofertilizer Mat)',
          rowRatio: 'Inoculated Floating Blanket',
          spacing: 'Continuous Biomass Layer',
          nitrogenFixed: 45,
          lerScore: 1.27,
          harvestDuration: 'Living Water Blanket',
          sowingOffset: 'Inoculated on Day 7 after transplanting',
          rootZoneSynergy: 'Floating aquatic symbiosis in standing water',
          reasoning: 'Multiplies every 5 days on floodwaters, fixing up to 45 kg N/ha, photo-cooling the basin, and smothering weeds.',
          postHarvest: { safeMoisturePct: 12.0, ambientMonths: 3, coldMonths: 6 }
        },
        {
          tier: 'Recommended',
          key: 'greengram',
          name: 'Green Gram (Paddy Bund Intercrop)',
          rowRatio: 'Bund & Perimeter Rows',
          spacing: '20 cm x 10 cm on bunds',
          nitrogenFixed: 25,
          lerScore: 1.22,
          harvestDuration: '60 - 65 Days',
          sowingOffset: 'Day 0 along field bunds',
          rootZoneSynergy: 'Perimeter pulse taking advantage of non-flooded edges',
          reasoning: 'Converts uncultivated bund margins into productive pulse ground without interfering with flooded basin paddy.',
          postHarvest: { safeMoisturePct: 11.0, ambientMonths: 6, coldMonths: 18 }
        },
        {
          tier: 'Feasible Alternative',
          key: 'blackgram',
          name: 'Black Gram (Relay / Bund)',
          rowRatio: 'Bund or Relay Sowing',
          spacing: '20 cm x 10 cm on bunds',
          nitrogenFixed: 22,
          lerScore: 1.18,
          harvestDuration: '65 - 70 Days',
          sowingOffset: 'Sown on bunds or broadcast into relay moisture',
          rootZoneSynergy: 'Utilizes residual soil moisture profile',
          reasoning: 'Traditional rice-fallow relay companion that sprouts in residual mud moisture before paddy harvest.',
          postHarvest: { safeMoisturePct: 11.0, ambientMonths: 6, coldMonths: 18 }
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
        nitrogenFixed: 25,
        lerScore: 1.22,
        harvestDuration: '60 - 65 Days',
        sowingOffset: 'Day 0 along field bunds',
        rootZoneSynergy: 'Perimeter root zone without flooding competition',
        reasoning: 'Monetizes raised bunds and binds bund soil against erosion under partial irrigation regimes.',
        postHarvest: { safeMoisturePct: 11.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: 'Recommended',
        key: 'blackgram',
        name: 'Black Gram (Urad)',
        rowRatio: 'Bund Rows',
        spacing: '25 cm x 10 cm on bunds',
        nitrogenFixed: 22,
        lerScore: 1.20,
        harvestDuration: '70 - 75 Days',
        sowingOffset: 'Day 0 along field bunds',
        rootZoneSynergy: 'Low canopy stabilizing farm path edges',
        reasoning: 'Resilient bund legume that thrives on splash moisture and minimal management.',
        postHarvest: { safeMoisturePct: 11.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: 'Feasible Alternative',
        key: 'sesbania',
        name: 'Sesbania (Dhaincha Bund Barrier)',
        rowRatio: 'Peripheral Windbreak',
        spacing: '30 cm x 15 cm on borders',
        nitrogenFixed: 40,
        lerScore: 1.16,
        harvestDuration: 'Green Manure / Border',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep nitrogen nodules on bund perimeters',
        reasoning: 'Excellent green manure boundary that buffers strong winds and can be lopped into paddy basins as bio-fertilizer.',
        postHarvest: { safeMoisturePct: 12.0, ambientMonths: 4, coldMonths: 12 }
      }
    ];
  }

  // Default Groundnut
  if (w.includes('low') || so.includes('sandy')) {
    return [
      {
        tier: 'Highly Recommended',
        key: 'pearlmillet',
        name: 'Pearl Millet (Bajra) Windbreak',
        rowRatio: '6:1 or 8:1 Border Rows',
        spacing: '45 cm x 15 cm',
        nitrogenFixed: 0,
        lerScore: 1.28,
        harvestDuration: '80 - 85 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Tall perimeter micro-climate barrier',
        reasoning: 'Tall Bajra border rows deflect hot desiccating winds in sandy zones, conserving topsoil humidity for groundnut pegging.',
        postHarvest: { safeMoisturePct: 12.0, ambientMonths: 6, coldMonths: 18 }
      },
      {
        tier: 'Recommended',
        key: 'pigeonpea',
        name: 'Pigeon Pea (Arhar / Tur)',
        rowRatio: '6:1 or 8:1',
        spacing: '60 cm x 15 cm',
        nitrogenFixed: 40,
        lerScore: 1.34,
        harvestDuration: '130 - 150 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Deep taproot foraging lower subsoil water',
        reasoning: 'Pigeon Pea taproots tap deep moisture reserves without competing with shallow groundnut pods.',
        postHarvest: { safeMoisturePct: 9.5, ambientMonths: 8, coldMonths: 24 }
      },
      {
        tier: 'Feasible Alternative',
        key: 'sesame',
        name: 'Sesame (Til)',
        rowRatio: '4:1 or Border Rows',
        spacing: '30 cm x 10 cm',
        nitrogenFixed: 0,
        lerScore: 1.21,
        harvestDuration: '75 - 85 Days',
        sowingOffset: 'Simultaneous on Day 0',
        rootZoneSynergy: 'Low water requirement oilseed canopy',
        reasoning: 'Drought-tolerant dual oilseed pairing that thrives in sandy loam under low water availability.',
        postHarvest: { safeMoisturePct: 9.0, ambientMonths: 6, coldMonths: 12 }
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
      nitrogenFixed: 42,
      lerScore: 1.36,
      harvestDuration: '130 - 150 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Deep taproot (1.5m) + Shallow groundnut peg layer (20cm)',
      reasoning: 'Classic ICAR pairing: groundnut harvests in 105 days, leaving Pigeon Pea to exploit the full field and late season sunlight.',
      postHarvest: { safeMoisturePct: 9.5, ambientMonths: 8, coldMonths: 24 }
    },
    {
      tier: 'Recommended',
      key: 'castor',
      name: 'Castor (Wide Strip Companion)',
      rowRatio: '8:1',
      spacing: '90 cm x 30 cm',
      nitrogenFixed: 0,
      lerScore: 1.30,
      harvestDuration: '140 - 160 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Deep taproot with vertical canopy branching',
      reasoning: 'Castor generates heavy secondary commercial returns and acts as an effective trap crop for Spodoptera caterpillars.',
      postHarvest: { safeMoisturePct: 9.0, ambientMonths: 12, coldMonths: 24 }
    },
    {
      tier: 'Feasible Alternative',
      key: 'blackgram',
      name: 'Black Gram (Urad)',
      rowRatio: '4:1',
      spacing: '30 cm x 10 cm',
      nitrogenFixed: 28,
      lerScore: 1.23,
      harvestDuration: '65 - 75 Days',
      sowingOffset: 'Simultaneous on Day 0',
      rootZoneSynergy: 'Fast pulse harvest before groundnut canopy locks',
      reasoning: 'Short-duration pulse that gives an early grain harvest before groundnut pods mature.',
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

  const [weatherForecast] = useState([
    { day: 'Day 1 (Today)', temp: 31, rainProb: 10, windKmh: 12, condition: 'Sunny & Clear', sprayRisk: 'Low' },
    { day: 'Day 2', temp: 30, rainProb: 20, windKmh: 14, condition: 'Partly Cloudy', sprayRisk: 'Low' },
    { day: 'Day 3', temp: 27, rainProb: 75, windKmh: 24, condition: 'Thunderstorms Likely', sprayRisk: 'High' },
    { day: 'Day 4', temp: 26, rainProb: 65, windKmh: 20, condition: 'Moderate Showers', sprayRisk: 'High' },
    { day: 'Day 5', temp: 29, rainProb: 15, windKmh: 11, condition: 'Clearing Sky', sprayRisk: 'Low' }
  ]);

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

  const formatDuration = (val) => {
    if (!val || typeof val !== 'string') return '';
    return val.replace(/Months/gi, d.months);
  };

  const calculateEconomics = () => {
    if (!advice || !advice.primaryCrop) return null;
    const yieldPerAcre = Number(advice.primaryCrop.avgYield || (primaryCropKey === 'cotton' ? 8.5 : primaryCropKey === 'groundnut' ? 12.0 : 18.0));
    const mandiRate = Number(advice.marketData?.pricePerQuintal || 2450);
    const costPerAcre = primaryCropKey === 'cotton' ? 21000 : 15500;

    const primaryYield = yieldPerAcre * acres;
    const primaryRevenue = primaryYield * mandiRate;

    const bonusPct = advice.intercrop ? (Number(advice.intercrop.lerScore || advice.intercrop.ler || 1.25) - 1.0) * 0.75 : 0;
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
    const nCreditPerAcre = advice.intercrop ? Math.round((Number(advice.intercrop.nitrogenFixed ?? advice.intercrop.nitro ?? 0)) / 2.47) : 0;
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFieldImage(previewUrl);
    setIsAnalyzingImage(true);
    setImageAnalysisResult(null);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(img, 0, 0, 64, 64);
      const imgData = ctx.getImageData(0, 0, 64, 64).data;

      let rTotal = 0, gTotal = 0, bTotal = 0;
      let greenPixels = 0;
      let earthPixels = 0;
      const totalPixels = imgData.length / 4;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        rTotal += r;
        gTotal += g;
        bTotal += b;

        if (g > r * 1.05 && g > b * 1.1) greenPixels++;

        const isEarthTone = (r > b * 1.15) && (g > b * 0.95) && (r >= g * 0.85);
        const isDarkVertisol = (r < 75 && g < 75 && b < 70) && (Math.abs(r - g) < 20) && (b <= Math.min(r, g));

        if (isEarthTone || isDarkVertisol) earthPixels++;
      }

      const avgR = rTotal / totalPixels;
      const avgG = gTotal / totalPixels;
      const avgB = bTotal / totalPixels;

      const greenRatio = greenPixels / totalPixels;
      const earthRatio = earthPixels / totalPixels;
      const agriScore = greenRatio + earthRatio;

      setTimeout(() => {
        if (agriScore < 0.28 || (avgB > avgR && avgB > avgG && greenRatio < 0.15)) {
          setImageAnalysisResult({
            isValid: false,
            errorTitle: 'Non-Field / Unrecognized Image Detected',
            rationale: 'The uploaded photo does not show recognizable farmland, crop foliage, or agricultural soil. Please upload a clear photo taken in your field.',
            confidence: 'N/A'
          });
          setIsAnalyzingImage(false);
          return;
        }

        let detectedSoil = 'Loamy';
        let detectedCrop = primaryCropKey;
        let rationale = 'Balanced organic loam soil with healthy ground characteristics detected. Optimal for grain-legume intercropping.';
        let confidence = 91;

        if (avgR < 70 && avgG < 70 && avgB < 65 && earthRatio > 0.45) {
          detectedSoil = 'Black';
          detectedCrop = 'cotton';
          rationale = 'Dark Vertisol (Black Cotton Soil) detected. High moisture retention suited for Cotton + Black Gram intercropping.';
          confidence = 94;
        } else if (avgR > 135 && avgG > 115 && avgB < 110 && (avgR > avgB * 1.3)) {
          detectedSoil = 'Sandy';
          detectedCrop = 'groundnut';
          rationale = 'Light sandy sediment detected. Facilitates peg penetration for Groundnut with deep Pigeonpea companion roots.';
          confidence = 89;
        } else if (avgG > avgR && greenRatio > 0.40) {
          detectedSoil = 'Clay';
          detectedCrop = 'rice';
          rationale = 'High vegetative canopy with high water retention detected. Compatible with Paddy + Azolla dual-culture.';
          confidence = 92;
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
      }, 1000);
    };
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

      const fallback3 = getClientTop3Companions(normKey, sVar, soVar, wVar);
      data.companionOptions = (data.companionOptions && data.companionOptions.length > 0)
        ? data.companionOptions
        : fallback3;

      if (!data.intercrop || !data.intercrop.rowRatio) {
        const topOne = data.companionOptions[0];
        data.intercrop = {
          ...topOne,
          rowRatio: topOne.rowRatio || topOne.ratio || '2:1',
          harvestDuration: topOne.harvestDuration || topOne.duration || '65 - 75 Days'
        };
      }

      setAdvice(data);
      setActiveTab('intercrop');
    } catch (err) {
      console.warn('Backend fetch fallback engaged:', err);
      const companionList = getClientTop3Companions(normKey, sVar, soVar, wVar);
      const cropRates = CURRENT_MSP_DIRECTORY[normKey] || CURRENT_MSP_DIRECTORY.maize;

      setAdvice({
        primaryCrop: {
          key: normKey,
          name: d.crops[cropLookup] || cropLookup,
          harvestDuration: '3 - 4 Months',
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
            pestName: 'Fall Armyworm / Pod Borer',
            cultural: 'Deep summer ploughing and clean seedbed tillage.',
            bio: 'Neem seed kernel extract (NSKE 5%) or Trichogramma cards.',
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
    if (advice) {
      loadAdvice(newLang);
    }
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
    const duration = formatDuration(advice?.primaryCrop?.harvestDuration);

    if (lang === 'ta') {
      textToRead = `முதன்மைப் பயிர்: ${advice.primaryCrop.name}. அறுவடை காலம்: ${duration}. அரசு ஆதார விலை MSP: குவிண்டாலுக்கு ₹${advice.marketData?.officialMsp}. `;
      if (advice.intercrop) {
        textToRead += `பரிந்துரைக்கப்படும் உகந்த ஊடு பயிர்: ${advice.intercrop.name}. முன்னுரிமை தகுதி: ${advice.intercrop.tier}. பயிர் வரிசை அமைப்பு: ${advice.intercrop.rowRatio || advice.intercrop.ratio}. நில பயன்பாட்டு திறன்: ${advice.intercrop.lerScore || advice.intercrop.ler}. பலன்: ${advice.intercrop.reasoning}.`;
      }
    } else if (lang === 'hi') {
      textToRead = `मुख्य फसल: ${advice.primaryCrop.name}. कटाई अवधि: ${duration}. सरकारी MSP: ₹${advice.marketData?.officialMsp} प्रति क्विंटल. `;
      if (advice.intercrop) {
        textToRead += `अनुशंसित साथी फसल: ${advice.intercrop.name}. प्राथमिकता स्तर: ${advice.intercrop.tier}. पंक्ति अनुपात: ${advice.intercrop.rowRatio || advice.intercrop.ratio}. भूमि दक्षता LER: ${advice.intercrop.lerScore || advice.intercrop.ler}. लाभ: ${advice.intercrop.reasoning}.`;
      }
    } else {
      textToRead = `Primary crop: ${advice.primaryCrop.name}. Harvest duration: ${advice.primaryCrop.harvestDuration}. Government MSP floor rate: ₹${advice.marketData?.officialMsp} per quintal. `;
      if (advice.intercrop) {
        textToRead += `Recommended companion crop: ${advice.intercrop.name}. Recommendation tier: ${advice.intercrop.tier}. Row pattern: ${advice.intercrop.rowRatio || advice.intercrop.ratio}. Land Equivalent Ratio: ${advice.intercrop.lerScore || advice.intercrop.ler}. Rationale: ${advice.intercrop.reasoning}.`;
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
      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }
      alert('Companion intercropping blueprint saved to your farmer profile!');
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
      if (Array.isArray(data)) {
        setHistoryList(data);
      } else {
        setHistoryList([]);
      }
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
      intercrop: {
        ...selectedCompanion,
        rowRatio: selectedCompanion.rowRatio || selectedCompanion.ratio || '2:1',
        harvestDuration: selectedCompanion.harvestDuration || selectedCompanion.duration || '65 - 75 Days'
      }
    }));
  };

  const renderTierBadge = (tier) => {
    if (tier === 'Highly Recommended') {
      return <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">⭐ Highly Recommended</span>;
    }
    if (tier === 'Recommended') {
      return <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">👍 Recommended</span>;
    }
    return <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">🌾 Feasible Alternative</span>;
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
      {/* Top Header */}
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

      {/* Action Row: Camera Diagnostics & Voice Query */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Field Image Scanner */}
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

        {/* Voice Recognition Control */}
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

      {/* Main Grid: Parameters + Tabbed Output */}
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
                    ⏱️ {d.harvestWindow}: {formatDuration(advice.primaryCrop.harvestDuration)}
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
                                  {renderTierBadge(opt.tier)}
                                  <span className="text-[10px] font-black text-gray-600">LER {opt.lerScore || opt.ler}</span>
                                </div>
                                <h4 className="text-sm font-black text-gray-900">{opt.name}</h4>
                                <p className="text-[11px] text-gray-500 line-clamp-2">{opt.reasoning}</p>
                              </div>

                              <div className="mt-2.5 pt-1.5 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold">
                                <span className="text-emerald-800">+{opt.nitrogenFixed || opt.nitro || 0} kg N/ha</span>
                                <span className={isSelected ? 'text-emerald-700' : 'text-gray-400'}>
                                  {isSelected ? '✓ Active Plan' : 'Click to Select'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {advice.intercrop ? (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-emerald-300 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-800 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wide">
                              {d.intercropOpt}
                            </span>
                            {renderTierBadge(advice.intercrop.tier || 'Highly Recommended')}
                          </div>
                          <h3 className="text-xl font-black text-green-950 mt-1.5">
                            {advice.intercrop.name}
                          </h3>
                          <p className="text-xs text-green-700 font-semibold">
                            Simultaneous growing companion for {advice.primaryCrop.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="bg-emerald-200 text-emerald-950 font-black text-sm px-3 py-1 rounded-full shadow-sm">
                            LER: {advice.intercrop.lerScore || advice.intercrop.ler}
                          </span>
                          <p className="text-[10px] text-green-800 font-extrabold mt-1">
                            +{Math.round((Number(advice.intercrop.lerScore || advice.intercrop.ler || 1.25) - 1) * 100)}% {d.efficiencyGain}
                          </p>
                        </div>
                      </div>

                      {/* Agronomic Specs Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{d.rowRatio}</p>
                          <p className="text-xs font-extrabold text-green-950">
                            {advice.intercrop.rowRatio || advice.intercrop.ratio || '2:1'}
                          </p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{d.plantSpacing}</p>
                          <p className="text-xs font-extrabold text-green-950 truncate">
                            {advice.intercrop.spacing || advice.intercrop.plantSpacing || '30 cm x 10 cm'}
                          </p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">{d.nFix}</p>
                          <p className="text-xs font-extrabold text-emerald-800">
                            {Number(advice.intercrop.nitrogenFixed ?? advice.intercrop.nitro ?? 0) > 0
                              ? `+${advice.intercrop.nitrogenFixed || advice.intercrop.nitro} kg N/ha`
                              : 'Trap Barrier'}
                          </p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <p className="text-[10px] text-gray-500 font-semibold">Companion Cycle</p>
                          <p className="text-xs font-extrabold text-gray-800">
                            {formatDuration(advice.intercrop.harvestDuration || advice.intercrop.duration) || '65 - 75 Days'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/90 p-3 rounded-lg border border-emerald-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{d.sowingSchedule}</p>
                          <p className="font-bold text-green-950 mt-0.5">{advice.intercrop.sowingOffset}</p>
                        </div>
                        <div className="bg-white/90 p-3 rounded-lg border border-emerald-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{d.rootSynergy}</p>
                          <p className="font-bold text-green-950 mt-0.5">{advice.intercrop.rootZoneSynergy}</p>
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
                  ) : (
                    <div className="bg-white p-8 rounded-b-xl border text-center text-xs text-gray-500">
                      No companion rule matched this specific soil and moisture condition.
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
                            Inspect root zones of both {advice.primaryCrop.name} and {advice.intercrop?.name || 'companion crop'}. 
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
                            Check 5-day wind and precipitation risks before chemical or biological application. Never spray if rain is forecast within 24 hours (prevents pesticide runoff into irrigation furrows).
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
                            Examine leaf undersides and apical shoots for early egg clusters. Inspect companion rows ({advice.intercrop?.name}) to verify if trap or predator-attracting barriers are actively diverting pest pressure.
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
                              Ensure at least {advice.pests[0]?.phiDays || 14} days have passed since the last pesticide application before picking companion pods or harvesting {advice.primaryCrop.name}.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedTasks['moisture_check']}
                          onChange={() => toggleTask('moisture_check')}
                          className="w-4 h-4 mt-0.5 accent-emerald-600 rounded"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-emerald-950">🧺 Moisture & Post-Harvest Storage Prep</span>
                          <p className="text-gray-600 mt-0.5">
                            Confirm grain or seed lots are dried down to ≤ {advice.primaryCrop.safeMoisturePct}% moisture prior to bagging. Elevate gunny sacks on wooden pallets in a ventilated godown to avoid floor condensation.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/40">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedTasks['mandi_valuation']}
                          onChange={() => toggleTask('mandi_valuation')}
                          className="w-4 h-4 mt-0.5 accent-purple-600 rounded"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-purple-950">📊 Mandi Rate Verification</span>
                          <p className="text-gray-600 mt-0.5">
                            Verify local APMC auction rates against the benchmark MSP rate of ₹{advice.marketData?.officialMsp}/Qtl before selling through private traders.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'economics' && fin && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">Farm Financials for {acres} Acres (Using {advice.intercrop?.name})</h3>
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
                    💵 <strong>Revenue Breakdown:</strong> Gross Mandi sales reach <strong>₹{fin.totalGrossRevenue.toLocaleString('en-IN')}</strong>, powered by simultaneous companion intercropping delivering an extra <strong>₹{fin.bonusRevenue.toLocaleString('en-IN')}</strong> above solo mono-cropping.
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
                      Because {advice.intercrop?.name} nodulates atmospheric nitrogen, you save <strong>{fert.ureaSavedBags} commercial Urea bag(s)</strong>, saving approximately <strong>₹{fert.savingsRupees}</strong> on input costs while safeguarding soil biology.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="bg-white p-5 rounded-b-xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-800">5-Day Field Weather & Spraying Outlook</h3>
                    <span className="text-xs text-gray-500 font-bold">Field Weather Station</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {weatherForecast.map((w, idx) => (
                      <div key={idx} className={`p-2 rounded-lg border ${w.sprayRisk === 'High' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <p className="font-black text-gray-900 text-[11px]">{w.day}</p>
                        <p className="text-xs font-bold text-gray-700 mt-1">{w.temp}°C</p>
                        <p className="text-[10px] text-blue-700 font-semibold">💧 {w.rainProb}% Rain</p>
                        <p className="text-[9px] text-gray-500">{w.windKmh} km/h</p>
                        <span className={`inline-block text-[8px] font-black uppercase px-1 py-0.5 rounded mt-1.5 ${
                          w.sprayRisk === 'High' ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {w.sprayRisk === 'High' ? 'No Spray' : 'Safe Spray'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1 text-blue-950">
                    <p className="font-bold">🎯 Agronomic Advisory for Current Week:</p>
                    <p className="text-gray-700">
                      • <strong>Sowing Window:</strong> Days 1 and 2 offer optimal moisture and wind stability for simultaneous seed drilling.<br />
                      • <strong>Pesticide Alert:</strong> Refrain from spraying on Days 3 & 4 due to rain wash-off risk (&gt;60% precipitation).
                    </p>
                  </div>
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
                      <p><strong>Ambient Godown Life:</strong> {advice.primaryCrop.ambientShelfLifeMonths} Months (Gunny bags with pallets)</p>
                      <p><strong>Hermetic / Cold Storage:</strong> Up to {advice.primaryCrop.coldShelfLifeMonths} Months</p>
                    </div>

                    {advice.intercrop && (
                      <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-emerald-950">{advice.intercrop.name}</span>
                          <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">Companion</span>
                        </div>
                        <p><strong>Safe Moisture Threshold:</strong> ≤ {advice.intercrop.postHarvest?.safeMoisturePct || 10}%</p>
                        <p><strong>Ambient Storage:</strong> {advice.intercrop.postHarvest?.ambientMonths || 6} Months</p>
                        <p><strong>Grain Weevil Protection:</strong> Treat storage bags with Neem leaf ash or hermetic liners</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
                    ⚠️ <strong>Storage Loss Prevention:</strong> Never bag harvest above safe moisture levels to prevent aflatoxin mold development and internal heat fermentation.
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
                      <p className="font-bold text-green-900 capitalize">{item.primary_crop} + {item.intercrop}</p>
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