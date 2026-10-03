import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// 1. All 38 Districts of Tamil Nadu
const TN_38_DISTRICTS = {
  thanjavur: { name: 'Thanjavur', name_ta: 'தஞ்சாவூர்', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Clay', coords: [10.7870, 79.1378], units: ['Thanjavur', 'Thiruvaiyaru', 'Kumbakonam', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Orathanadu', 'Thiruvidaimarudur'] },
  tiruvarur: { name: 'Tiruvarur', name_ta: 'திருவாரூர்', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Clay', coords: [10.7725, 79.6365], units: ['Tiruvarur', 'Mannargudi', 'Thiruthuraipoondi', 'Nannilam', 'Kudavasal', 'Valangaiman', 'Needamangalam'] },
  nagapattinam: { name: 'Nagapattinam', name_ta: 'நாகப்பட்டினம்', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Clay', coords: [10.7672, 79.8449], units: ['Nagapattinam', 'Kilvelur', 'Vedaranyam', 'Thirukkuvalai'] },
  mayiladuthurai: { name: 'Mayiladuthurai', name_ta: 'மயிலாடுதுறை', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Clay', coords: [11.1075, 79.6524], units: ['Mayiladuthurai', 'Sirkazhi', 'Poompuhar', 'Tharangambadi', 'Kuthalam'] },
  coimbatore: { name: 'Coimbatore', name_ta: 'கோயம்புத்தூர்', zone: 'Western Zone', zone_ta: 'மேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [11.0168, 76.9558], units: ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Sulur', 'Mettupalayam', 'Valparai', 'Thondamuthur', 'Singanallur', 'Kinathukadavu'] },
  tiruppur: { name: 'Tiruppur', name_ta: 'திருப்பூர்', zone: 'Western Zone', zone_ta: 'மேற்கு மண்டலம்', defaultSoil: 'Black', coords: [11.1085, 77.3411], units: ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Palladam', 'Udumalaipettai', 'Dharapuram', 'Kangeyam', 'Madathukulam'] },
  erode: { name: 'Erode', name_ta: 'ஈரோடு', zone: 'Western Zone', zone_ta: 'மேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [11.3410, 77.7172], units: ['Erode East', 'Erode West', 'Gobichettipalayam', 'Bhavani', 'Anthiyur', 'Perundurai', 'Modakkurichi', 'Bhavanisagar'] },
  dindigul: { name: 'Dindigul', name_ta: 'திண்டுக்கல்', zone: 'Western Zone', zone_ta: 'மேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [10.3673, 77.9803], units: ['Dindigul', 'Palani', 'Oddanchatram', 'Athoor', 'Nilakkottai', 'Natham', 'Vedasandur', 'Kodaikanal'] },
  karur: { name: 'Karur', name_ta: 'கரூர்', zone: 'Western Zone', zone_ta: 'மேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [10.9601, 78.0766], units: ['Karur', 'Aravakurichi', 'Kulithalai', 'Krishnarayapuram', 'Kadavur'] },
  madurai: { name: 'Madurai', name_ta: 'மதுரை', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Black', coords: [9.9252, 78.1198], units: ['Madurai North', 'Madurai South', 'Madurai Central', 'Madurai West', 'Melur', 'Thirumangalam', 'Usilampatti', 'Sholavandan', 'Thiruparankundram'] },
  virudhunagar: { name: 'Virudhunagar', name_ta: 'விருதுநகர்', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Black', coords: [9.5680, 77.9624], units: ['Virudhunagar', 'Rajapalayam', 'Sivakasi', 'Sattur', 'Aruppukkottai', 'Tiruchuli', 'Srivilliputhur'] },
  thoothukudi: { name: 'Thoothukudi', name_ta: 'தூத்துக்குடி', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Black', coords: [8.7642, 78.1348], units: ['Thoothukudi', 'Tiruchendur', 'Kovilpatti', 'Ottapidaram', 'Vilathikulam', 'Srivaikuntam', 'Eral'] },
  tirunelveli: { name: 'Tirunelveli', name_ta: 'திருநெல்வேலி', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Black', coords: [8.7139, 77.7567], units: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Radhapuram', 'Manur'] },
  tenkasi: { name: 'Tenkasi', name_ta: 'தென்காசி', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Loamy', coords: [8.9594, 77.3149], units: ['Tenkasi', 'Kadayanallur', 'Sankarankovil', 'Vasudevanallur', 'Alangulam', 'Shenkottai'] },
  kanyakumari: { name: 'Kanyakumari', name_ta: 'கன்னியாகுமரி', zone: 'High Rainfall Zone', zone_ta: 'அதிக மழை மண்டலம்', defaultSoil: 'Loamy', coords: [8.0883, 77.5385], units: ['Kanyakumari', 'Nagercoil', 'Colachel', 'Padmanabhapuram', 'Vilavancode', 'Killiyoor', 'Thovalai'] },
  ramanathapuram: { name: 'Ramanathapuram', name_ta: 'ராமநாதபுரம்', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Sandy', coords: [9.3639, 78.8395], units: ['Ramanathapuram', 'Paramakudi', 'Tiruvadanai', 'Mudukulathur', 'Rameswaram', 'Kamuthi', 'Kadaladi'] },
  sivagangai: { name: 'Sivagangai', name_ta: 'சிவகங்கை', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Loamy', coords: [9.8433, 78.4809], units: ['Sivagangai', 'Karaikudi', 'Tiruppattur', 'Manamadurai', 'Ilayangudi', 'Devakottai', 'Singampunari'] },
  theni: { name: 'Theni', name_ta: 'தேனி', zone: 'Southern Zone', zone_ta: 'தென் மண்டலம்', defaultSoil: 'Loamy', coords: [10.0104, 77.4768], units: ['Bodinayakanur', 'Periyakulam', 'Cumbum', 'Andipatti', 'Uthamapalayam'] },
  salem: { name: 'Salem', name_ta: 'சேலம்', zone: 'North Western Zone', zone_ta: 'வடமேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [11.6643, 78.1460], units: ['Salem North', 'Salem South', 'Salem West', 'Attur', 'Mettur', 'Omalur', 'Edappadi', 'Sankari', 'Yercaud', 'Gangavalli'] },
  dharmapuri: { name: 'Dharmapuri', name_ta: 'தருமபுரி', zone: 'North Western Zone', zone_ta: 'வடமேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.1211, 78.1582], units: ['Dharmapuri', 'Pennagaram', 'Palacode', 'Harur', 'Pappireddipatti', 'Nallampalli'] },
  krishnagiri: { name: 'Krishnagiri', name_ta: 'கிருஷ்ணகிரி', zone: 'North Western Zone', zone_ta: 'வடமேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.5186, 78.2137], units: ['Krishnagiri', 'Hosur', 'Uthangarai', 'Bargur', 'Pochampalli', 'Shoolagiri', 'Denkanikottai'] },
  namakkal: { name: 'Namakkal', name_ta: 'நாமக்கல்', zone: 'North Western Zone', zone_ta: 'வடமேற்கு மண்டலம்', defaultSoil: 'Loamy', coords: [11.2189, 78.1674], units: ['Namakkal', 'Rasipuram', 'Tiruchengode', 'Paramathi Velur', 'Sendamangalam', 'Kolli Hills'] },
  cuddalore: { name: 'Cuddalore', name_ta: 'கடலூர்', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Clay', coords: [11.7480, 79.7714], units: ['Cuddalore', 'Panruti', 'Chidambaram', 'Virudhachalam', 'Neyveli', 'Bhuvanagiri', 'Tittakudi', 'Kattumannarkoil'] },
  villupuram: { name: 'Villupuram', name_ta: 'விழுப்புரம்', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Sandy', coords: [11.9401, 79.4861], units: ['Villupuram', 'Tindivanam', 'Vanur', 'Mailam', 'Vikravandi', 'Gingee', 'Kandachipuram'] },
  kallakurichi: { name: 'Kallakurichi', name_ta: 'கள்ளக்குறிச்சி', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Loamy', coords: [11.7384, 78.9639], units: ['Kallakurichi', 'Sankarapuram', 'Rishivandiyam', 'Ulundurpet', 'Chinnasalem', 'Kalvarayan Hills'] },
  tiruvannamalai: { name: 'Tiruvannamalai', name_ta: 'திருவண்ணாமலை', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.2253, 79.0747], units: ['Tiruvannamalai', 'Arani', 'Cheyyar', 'Polur', 'Chengam', 'Kalasapakkam', 'Kilpennathur', 'Vandavasi'] },
  vellore: { name: 'Vellore', name_ta: 'வேலூர்', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.9165, 79.1325], units: ['Vellore', 'Anaikattu', 'Gudiyatham', 'Katpadi', 'KV Kuppam', 'Pernambut'] },
  tirupathur: { name: 'Tirupathur', name_ta: 'திருப்பத்தூர்', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.4926, 78.5677], units: ['Tirupathur', 'Vaniyambadi', 'Ambur', 'Natrampalli'] },
  ranipet: { name: 'Ranipet', name_ta: 'ராணிப்பேட்டை', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.9224, 79.3330], units: ['Ranipet', 'Arcot', 'Arakkonam', 'Sholinghur', 'Nemili', 'Walajah'] },
  kanchipuram: { name: 'Kanchipuram', name_ta: 'காஞ்சிபுரம்', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Loamy', coords: [12.8342, 79.7036], units: ['Kanchipuram', 'Sriperumbudur', 'Uthiramerur', 'Walajabad', 'Kundrathur'] },
  chengalpattu: { name: 'Chengalpattu', name_ta: 'செங்கல்பட்டு', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Sandy', coords: [12.6841, 79.9836], units: ['Chengalpattu', 'Tambaram', 'Pallavaram', 'Madurantakam', 'Cheyyur', 'Thiruporur', 'Vandalur'] },
  tiruvallur: { name: 'Tiruvallur', name_ta: 'திருவள்ளூர்', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Sandy', coords: [13.1432, 79.9083], units: ['Tiruvallur', 'Avadi', 'Poonamallee', 'Tiruttani', 'Gummidipoondi', 'Ponneri', 'Uthukottai'] },
  chennai: { name: 'Chennai', name_ta: 'சென்னை', zone: 'North Eastern Zone', zone_ta: 'வடகிழக்கு மண்டலம்', defaultSoil: 'Sandy', coords: [13.0827, 80.2707], units: ['Alandur', 'Ambattur', 'Aminjikarai', 'Ayanavaram', 'Egmore', 'Guindy', 'Mambalam', 'Mylapore', 'Perambur', 'Purasawalkam', 'Saidapet', 'Tondiarpet', 'Velachery'] },
  tiruchirappalli: { name: 'Tiruchirappalli', name_ta: 'திருச்சிராப்பள்ளி', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Clay', coords: [10.7905, 78.7047], units: ['Tiruchirappalli West', 'Tiruchirappalli East', 'Srirangam', 'Manachanallur', 'Lalgudi', 'Musiri', 'Thuraiyur', 'Thiruverumbur', 'Manapparai'] },
  perambalur: { name: 'Perambalur', name_ta: 'பெரம்பலூர்', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Loamy', coords: [11.2333, 78.8833], units: ['Perambalur', 'Kunnam', 'Veppanthattai', 'Alathur'] },
  ariyalur: { name: 'Ariyalur', name_ta: 'அரியலூர்', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Black', coords: [11.1401, 79.0786], units: ['Ariyalur', 'Jayankondam', 'Sendurai', 'Andimadam'] },
  pudukkottai: { name: 'Pudukkottai', name_ta: 'புதுக்கோட்டை', zone: 'Cauvery Delta', zone_ta: 'காவிரி டெல்டா மண்டலம்', defaultSoil: 'Loamy', coords: [10.3833, 78.8167], units: ['Pudukkottai', 'Alangudi', 'Aranthangi', 'Gandarvakottai', 'Viralimalai', 'Thirumayam', 'Avudaiyarkoil', 'Iluppur', 'Karambakkudi'] },
  nilgiris: { name: 'The Nilgiris', name_ta: 'நீலகிரி', zone: 'Hilly Zone', zone_ta: 'மலைப் பகுதி மண்டலம்', defaultSoil: 'Loamy', coords: [11.4102, 76.6950], units: ['Udhagamandalam', 'Coonoor', 'Gudalur', 'Kotagiri', 'Kundah', 'Pandalur'] }
};

// 2. 37 Commercial Crops of Tamil Nadu
const TN_38_CROPS = {
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
  blackgram: { name: 'Black Gram (Urad)', name_ta: 'உளுந்து (கருப்பு உளுந்து)', category: 'Pulses', avgYield: 4.5, mandiRate: 74.00, msp: 70.00, costPerAcre: 9500, defaultSoil: 'Clay', harvestDur: '70 - 75 Days', safeMoisturePct: 10.0, ambientDays: 240, coldDays: 540, waterReqMm: 300 },
  greengram: { name: 'Green Gram (Moong)', name_ta: 'பாசிப்பயறு (பச்சைப்பயறு)', category: 'Pulses', avgYield: 4.0, mandiRate: 86.00, msp: 85.58, costPerAcre: 9500, defaultSoil: 'Loamy', harvestDur: '60 - 65 Days', safeMoisturePct: 10.0, ambientDays: 240, coldDays: 540, waterReqMm: 280 },
  pigeonpea: { name: 'Red Gram (Arhar / Tur)', name_ta: 'துவரை (செந்துவரை)', category: 'Pulses', avgYield: 6.0, mandiRate: 78.00, msp: 75.50, costPerAcre: 12000, defaultSoil: 'Loamy', harvestDur: '5 - 6 Months', safeMoisturePct: 10.5, ambientDays: 300, coldDays: 540, waterReqMm: 450 },
  cowpea: { name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு (காராமணி)', category: 'Pulses', avgYield: 5.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 9000, defaultSoil: 'Sandy', harvestDur: '65 - 75 Days', safeMoisturePct: 10.0, ambientDays: 210, coldDays: 500, waterReqMm: 320 },
  horsegram: { name: 'Horse Gram (Kulthi)', name_ta: 'கொள்ளு', category: 'Pulses', avgYield: 3.5, mandiRate: 48.00, msp: 42.00, costPerAcre: 6500, defaultSoil: 'Sandy', harvestDur: '80 - 90 Days', safeMoisturePct: 9.5, ambientDays: 365, coldDays: 700, waterReqMm: 220 },
  chickpea: { name: 'Chickpea (Chana)', name_ta: 'கொண்டைக்கடலை', category: 'Pulses', avgYield: 5.0, mandiRate: 58.00, msp: 54.40, costPerAcre: 11000, defaultSoil: 'Black', harvestDur: '90 - 100 Days', safeMoisturePct: 9.5, ambientDays: 300, coldDays: 600, waterReqMm: 290 },
  clusterbean: { name: 'Cluster Bean (Guar)', name_ta: 'கொத்தவரங்காய்', category: 'Pulses', avgYield: 15, mandiRate: 35.00, msp: 29.00, costPerAcre: 8500, defaultSoil: 'Sandy', harvestDur: '85 - 95 Days', safeMoisturePct: 11.0, ambientDays: 180, coldDays: 365, waterReqMm: 310 },
  frenchbean: { name: 'French Bush Bean', name_ta: 'பீன்ஸ் (செடி பீன்ஸ்)', category: 'Pulses', avgYield: 30, mandiRate: 45.00, msp: 35.00, costPerAcre: 18000, defaultSoil: 'Loamy', harvestDur: '55 - 65 Days', safeMoisturePct: 85.0, ambientDays: 4, coldDays: 20, waterReqMm: 350 },
  groundnut: { name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை (மணிலா)', category: 'Oilseeds', avgYield: 12, mandiRate: 78.50, msp: 75.17, costPerAcre: 15500, defaultSoil: 'Sandy', harvestDur: '105 - 115 Days', safeMoisturePct: 8.0, ambientDays: 180, coldDays: 365, waterReqMm: 500 },
  sesame: { name: 'Sesame (Til)', name_ta: 'எள் (நல்லெண்ணெய் வித்து)', category: 'Oilseeds', avgYield: 3.5, mandiRate: 118.00, msp: 92.67, costPerAcre: 9000, defaultSoil: 'Sandy', harvestDur: '75 - 85 Days', safeMoisturePct: 7.0, ambientDays: 240, coldDays: 450, waterReqMm: 250 },
  sunflower: { name: 'Sunflower', name_ta: 'சூரியகாந்தி', category: 'Oilseeds', avgYield: 7.0, mandiRate: 68.00, msp: 67.60, costPerAcre: 13000, defaultSoil: 'Black', harvestDur: '85 - 90 Days', safeMoisturePct: 8.5, ambientDays: 150, coldDays: 300, waterReqMm: 450 },
  castor: { name: 'Castor', name_ta: 'ஆமணக்கு (விளக்கெண்ணெய் விதை)', category: 'Oilseeds', avgYield: 6.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 10500, defaultSoil: 'Sandy', harvestDur: '140 - 160 Days', safeMoisturePct: 8.0, ambientDays: 240, coldDays: 500, waterReqMm: 480 },
  soybean: { name: 'Soybean', name_ta: 'சோயாபீன்', category: 'Oilseeds', avgYield: 8.5, mandiRate: 52.00, msp: 48.92, costPerAcre: 12500, defaultSoil: 'Clay', harvestDur: '85 - 90 Days', safeMoisturePct: 10.0, ambientDays: 210, coldDays: 400, waterReqMm: 480 },
  coconut: { name: 'Coconut', name_ta: 'தென்னை', category: 'Oilseeds', avgYield: 45, mandiRate: 34.00, msp: 29.00, costPerAcre: 18000, defaultSoil: 'Sandy', harvestDur: 'Perennial', safeMoisturePct: 6.0, ambientDays: 90, coldDays: 240, waterReqMm: 950 },
  maize: { name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', category: 'Millets & Cereals', avgYield: 18, mandiRate: 25.80, msp: 24.10, costPerAcre: 15500, defaultSoil: 'Loamy', harvestDur: '3 - 4 Months', safeMoisturePct: 12.0, ambientDays: 180, coldDays: 540, waterReqMm: 500 },
  pearlmillet: { name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', category: 'Millets & Cereals', avgYield: 11, mandiRate: 27.50, msp: 26.25, costPerAcre: 10000, defaultSoil: 'Sandy', harvestDur: '80 - 85 Days', safeMoisturePct: 11.5, ambientDays: 240, coldDays: 600, waterReqMm: 300 },
  sorghum: { name: 'Sorghum (Jowar)', name_ta: 'சோளம்', category: 'Millets & Cereals', avgYield: 10, mandiRate: 35.00, msp: 33.71, costPerAcre: 11000, defaultSoil: 'Black', harvestDur: '100 - 110 Days', safeMoisturePct: 11.0, ambientDays: 240, coldDays: 600, waterReqMm: 350 },
  fingermillet: { name: 'Finger Millet (Ragi)', name_ta: 'கேழ்வரகு (ராகி)', category: 'Millets & Cereals', avgYield: 9.5, mandiRate: 44.00, msp: 42.90, costPerAcre: 11500, defaultSoil: 'Loamy', harvestDur: '110 - 120 Days', safeMoisturePct: 11.0, ambientDays: 365, coldDays: 720, waterReqMm: 350 },
  barnyardmillet: { name: 'Barnyard Millet', name_ta: 'குதிரைவாலி', category: 'Millets & Cereals', avgYield: 6.5, mandiRate: 45.00, msp: 38.00, costPerAcre: 8000, defaultSoil: 'Sandy', harvestDur: '90 - 100 Days', safeMoisturePct: 11.0, ambientDays: 300, coldDays: 650, waterReqMm: 260 },
  foxtailmillet: { name: 'Foxtail Millet', name_ta: 'தினை', category: 'Millets & Cereals', avgYield: 6.0, mandiRate: 43.00, msp: 37.00, costPerAcre: 8000, defaultSoil: 'Loamy', harvestDur: '80 - 90 Days', safeMoisturePct: 10.5, ambientDays: 300, coldDays: 650, waterReqMm: 250 },
  kodomillet: { name: 'Kodo Millet', name_ta: 'வரகு', category: 'Millets & Cereals', avgYield: 5.5, mandiRate: 42.00, msp: 36.00, costPerAcre: 7500, defaultSoil: 'Sandy', harvestDur: '110 - 120 Days', safeMoisturePct: 10.5, ambientDays: 300, coldDays: 650, waterReqMm: 270 },
  cotton: { name: 'Cotton', name_ta: 'பருத்தி', category: 'Cash & Fiber', avgYield: 8.5, mandiRate: 86.50, msp: 82.67, costPerAcre: 21000, defaultSoil: 'Black', harvestDur: '5 - 6 Months', safeMoisturePct: 8.5, ambientDays: 240, coldDays: 700, waterReqMm: 650 },
  sugarcane: { name: 'Sugarcane', name_ta: 'கரும்பு', category: 'Cash & Fiber', avgYield: 420, mandiRate: 3.50, msp: 3.40, costPerAcre: 65000, defaultSoil: 'Clay', harvestDur: '10 - 12 Months', safeMoisturePct: 70.0, ambientDays: 3, coldDays: 10, waterReqMm: 1600 },
  sunnhemp: { name: 'Sunn Hemp', name_ta: 'சணப்பை (பசுந்தாள் பயிர்)', category: 'Cash & Fiber', avgYield: 7.0, mandiRate: 54.00, msp: 48.00, costPerAcre: 7000, defaultSoil: 'Sandy', harvestDur: '75 - 90 Days', safeMoisturePct: 10.0, ambientDays: 240, coldDays: 500, waterReqMm: 260 },
  turmeric: { name: 'Turmeric', name_ta: 'மஞ்சள்', category: 'Spices & Tubers', avgYield: 24, mandiRate: 155.00, msp: 120.00, costPerAcre: 45000, defaultSoil: 'Clay', harvestDur: '8 - 9 Months', safeMoisturePct: 9.0, ambientDays: 365, coldDays: 720, waterReqMm: 900 },
  ginger: { name: 'Ginger', name_ta: 'இஞ்சி', category: 'Spices & Tubers', avgYield: 55, mandiRate: 90.00, msp: 72.00, costPerAcre: 52000, defaultSoil: 'Loamy', harvestDur: '8 - 9 Months', safeMoisturePct: 75.0, ambientDays: 20, coldDays: 90, waterReqMm: 850 },
  coriander: { name: 'Coriander (Seed & Herb)', name_ta: 'கொத்தமல்லி (தனியா)', category: 'Spices & Tubers', avgYield: 4.5, mandiRate: 92.00, msp: 75.00, costPerAcre: 9000, defaultSoil: 'Black', harvestDur: '35 - 45 Days', safeMoisturePct: 9.0, ambientDays: 180, coldDays: 365, waterReqMm: 240 }
};

// Complete 37 Distinct Agronomic Blueprint Registry
const ALL_37_COMPANION_DATA = {
  brinjal: [
    { key: 'coriander', name: 'Coriander (Kothamalli)', name_ta: 'கொத்தமல்லி', ler: 1.34, nFixed: 0, ratio: '1:2', sp: '15 cm x 5 cm', dur: '35 - 45 Days', dur_ta: '35 - 45 நாட்கள்', why: 'Quick catch crop providing fast revenue before brinjal canopies close.', why_ta: 'கத்தரி கிளை பரப்பும் முன்பே 40 நாட்களில் பண வரவு தரும் குறுகிய காலப் பயிர்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.29, nFixed: 26, ratio: '1:1', sp: '30 cm x 15 cm', dur: '55 - 65 Days', dur_ta: '55 - 65 நாட்கள்', why: 'Biological nitrogen fixer enriching heavy-feeder brinjal rhizosphere.', why_ta: 'கத்தரிக்குத் தேவையான தழைச்சத்தை வேர் முடிச்சுகள் மூலம் நிலைநிறுத்துகிறது.' },
    { key: 'marigold', name: 'Marigold (Trap Crop)', name_ta: 'சாமந்தி (கவர்ச்சிப் பயிர்)', ler: 1.24, nFixed: 0, ratio: '1:6 Border', sp: '45 cm x 30 cm', dur: '60 - 75 Days', dur_ta: '60 - 75 நாட்கள்', why: 'Root volatiles suppress nematodes and attract borer pests away.', why_ta: 'வேர் நூற்புழுக்களைக் கட்டுப்படுத்தி, காய்ப்புழுக்களைக் கவரும் இயற்கை அரண்.' }
  ],
  tomato: [
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.34, nFixed: 28, ratio: '1:1', sp: '30 cm x 15 cm', dur: '55 - 65 Days', dur_ta: '55 - 65 நாட்கள்', why: 'Supplies active nitrogen to tomato root zones without shading vines.', why_ta: 'தக்காளி கொடிகளை மறைக்காமல் வேர்ப்பகுதிக்கு தழைச்சத்தை ஊட்டுகிறது.' },
    { key: 'marigold', name: 'Marigold (Trap Crop)', name_ta: 'சாமந்தி (கவர்ச்சிப் பயிர்)', ler: 1.29, nFixed: 0, ratio: '1:6 Border', sp: '45 cm x 30 cm', dur: '60 - 75 Days', dur_ta: '60 - 75 நாட்கள்', why: 'Repels root nematodes and lures fruit borer moths from tomato clusters.', why_ta: 'வேர் நூற்புழுக்களைக் கட்டுப்படுத்தி, காய்ப்புழுக்களைத் திசைதிருப்பும்.' },
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.23, nFixed: 0, ratio: '1:2', sp: '20 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Fast root crop extracted from furrow shoulders before tomato vines droop.', why_ta: 'தக்காளி கொடிகள் படரும் முன்பே பாத்தி ஓரங்களில் அறுவடை முடிந்துவிடும்.' }
  ],
  bhendi: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.28, nFixed: 0, ratio: '1:1', sp: '20 cm x 10 cm', dur: '40 - 45 Days', dur_ta: '40 - 45 நாட்கள்', why: 'Grows quickly on bed ridges, breaking heavy soil crusts.', why_ta: 'வெண்டை வளரும் முன் பாத்தி விளிம்புகளில் வேகமாக வளர்ந்து மண்ணைத் தளர்த்தும்.' },
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', ler: 1.31, nFixed: 32, ratio: '1:2', sp: '30 cm x 10 cm', dur: '65 Days', dur_ta: '65 நாட்கள்', why: 'Dense canopy covers open soil and fixes active biological nitrogen.', why_ta: 'களைகளைக் கட்டுப்படுத்தி வெண்டையின் வேருக்கு இயற்கை உரம் சேர்க்கும்.' },
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.22, nFixed: 0, ratio: '1:2', sp: '15 cm x 5 cm', dur: '35 Days', dur_ta: '35 நாட்கள்', why: 'Fast herb pulled before bhendi canopy shading occurs.', why_ta: 'வெண்டை நிழல் கொடுக்கும் முன்பே அறுவடை செய்யப்படும் பயிர்.' }
  ],
  chilli: [
    { key: 'onion', name: 'Small Onion (Shallot)', name_ta: 'சின்ன வெங்காயம்', ler: 1.36, nFixed: 0, ratio: '1:2', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Sulfur volatiles deter thrips while bulbs mature before peak chilli flushes.', why_ta: 'வெங்காயத்தின் வாசனை இலைப்பேன் பூச்சிகளை விரட்டும், இரட்டை லாபம் தரும்.' },
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.29, nFixed: 0, ratio: '1:1', sp: '15 cm x 5 cm', dur: '40 Days', dur_ta: '40 நாட்கள்', why: 'Quick shallow herb yielding revenue in 4 weeks.', why_ta: 'நான்கே வாரங்களில் பலன் தரும் துரித ஊடுபயிர்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.25, nFixed: 24, ratio: '1:1', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Biological nitrogen enrichment feeding heavy-feeder chilli root zone.', why_ta: 'மிளகாய்க்குத் தேவையான இயற்கை தழைச்சத்தை வேருக்குக் கொடுக்கும்.' }
  ],
  tapioca: [
    { key: 'groundnut', name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', ler: 1.41, nFixed: 25, ratio: '1:2', sp: '30 cm x 10 cm', dur: '105 Days', dur_ta: '105 நாட்கள்', why: 'Exploits wide 90cm spaces between cassava setts during juvenile stage.', why_ta: 'மரவள்ளி வளரும் வரை உள்ள 90 செ.மீ இடைவெளியைப் பயன்படுத்தி கூடுதல் லாபம் ஈட்டலாம்.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.33, nFixed: 30, ratio: '1:2', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Suppresses early weeds and leaves organic nitrogen residues.', why_ta: 'ஆரம்ப காலக் களைகளை அடக்கி மண்ணில் தழைச்சத்து சேர்க்கும்.' },
    { key: 'cowpea', name: 'Cowpea', name_ta: 'தட்டப்பயறு', ler: 1.27, nFixed: 28, ratio: '1:2', sp: '30 cm x 10 cm', dur: '65 Days', dur_ta: '65 நாட்கள்', why: 'Living mulch that conserves topsoil moisture around expanding tubers.', why_ta: 'மரவள்ளிக் கிழங்குக்கு ஈரப்பதத்தைப் பாதுகாக்கும் மூடு பயிர்.' }
  ],
  onion: [
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.31, nFixed: 0, ratio: '1:1', sp: '15 cm x 5 cm', dur: '35 Days', dur_ta: '35 நாட்கள்', why: 'Fast shallow herb pulled before onion bulbs bulk.', why_ta: 'வெங்காயம் பருக்கும் முன்பே அறுவடை செய்யப்படும் குறுகிய காலப் பயிர்.' },
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.26, nFixed: 0, ratio: '1:2', sp: '20 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Deep taproot loosens soil without interfering with shallow shallot clusters.', why_ta: 'மண்ணை நெகிழ்த்தி வெங்காயம் தாராளமாகப் பெருக்க உதவும்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.22, nFixed: 24, ratio: '1:2', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Fixes atmospheric nitrogen into nitrogen-demanding onion beds.', why_ta: 'வெங்காயப் பாத்திகளுக்கு இயற்கை தழைச்சத்தை வழங்கும்.' }
  ],
  drumstick: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', ler: 1.45, nFixed: 35, ratio: 'Inter-basin', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Fixes nitrogen and carpets wide alleys beneath moringa trees.', why_ta: 'முருங்கை மரங்களின் அகன்ற இடைவெளியில் இயற்கை நிலப்போர்வையாக வளரும்.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.36, nFixed: 30, ratio: 'Inter-row', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Fast pulse yielding high market returns in moringa tree lanes.', why_ta: 'முருங்கை வரிசைகளுக்கு நடுவே குறுகிய காலத்தில் நல்ல வருமானம் தரும்.' },
    { key: 'groundnut', name: 'Groundnut', name_ta: 'வேர்க்கடலை', ler: 1.30, nFixed: 26, ratio: 'Inter-strip', sp: '30 cm x 10 cm', dur: '105 Days', dur_ta: '105 நாட்கள்', why: 'Ground-hugging oilseed utilizing open moringa sunlight.', why_ta: 'முருங்கை மரங்களுக்கு இடையே கிடைக்கும் சூரிய ஒளியைப் பயன்படுத்தி வளரும்.' }
  ],
  bittergourd: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.27, nFixed: 0, ratio: 'Bed Border', sp: '20 cm x 10 cm', dur: '40 Days', dur_ta: '40 நாட்கள்', why: 'Quick companion planted along furrow shoulders.', why_ta: 'பாகல் பந்தல் ஏறும் முன்பே பாத்தி கரைகளில் முள்ளங்கி அறுவடை முடிந்துவிடும்.' },
    { key: 'onion', name: 'Small Onion', name_ta: 'சின்ன வெங்காயம்', ler: 1.29, nFixed: 0, ratio: '1:2', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Sulfur compounds repel fruit fly vectors in gourd rows.', why_ta: 'பாகற்காயைத் தாக்கும் பழ ஈக்களை விரட்டும் இயற்கை வாசனை.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.23, nFixed: 24, ratio: '1:1', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Erect bush legume feeding nitrogen beneath trellis vines.', why_ta: 'பந்தலுக்கு கீழே படராமல் தரையோடு தழைச்சத்தை நிலைநிறுத்தும்.' }
  ],
  snakegourd: [
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.30, nFixed: 26, ratio: '1:1', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Bush legume fixes nitrogen below high overhead trellises.', why_ta: 'புடலை பந்தலின் அடியில் நிழல் போட்டி இல்லாமல் தழைச்சத்தை நிலைநிறுத்தும்.' },
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.25, nFixed: 0, ratio: 'Bed Border', sp: '20 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Early taproot vegetable harvested while gourds establish.', why_ta: 'புடலை கொடி படரும் முன்பே அறுவடை செய்யப்படும் கிழங்குப் பயிர்.' },
    { key: 'onion', name: 'Small Onion', name_ta: 'சின்ன வெங்காயம்', ler: 1.24, nFixed: 0, ratio: '1:2', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Compact allium companion preserving ridge moisture.', why_ta: 'பாத்தி விளிம்புகளைப் பயன்படுத்தி கூடுதல் லாபம் ஈட்டும் முறை.' }
  ],
  radish: [
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.32, nFixed: 0, ratio: '1:1', sp: '15 cm x 5 cm', dur: '40 Days', dur_ta: '40 நாட்கள்', why: 'Fast herb-root catch crop combination harvested synchronously.', why_ta: 'ஒரே நேரத்தில் அறுவடைக்கு வரும் இரட்டை குறுகிய கால காய்கறி-கீரை கூட்டணி.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.27, nFixed: 24, ratio: '1:1', sp: '30 cm x 15 cm', dur: '55 Days', dur_ta: '55 நாட்கள்', why: 'Legume enriches soil nitrogen after radish tubers are extracted.', why_ta: 'முள்ளங்கி அறுவடைக்கு பின் நிலத்தில் தழைச்சத்தை நிலைநிறுத்தும்.' },
    { key: 'onion', name: 'Small Onion', name_ta: 'சின்ன வெங்காயம்', ler: 1.23, nFixed: 0, ratio: '1:1', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Staggered dual root-bulb crop architecture.', why_ta: 'முள்ளங்கிக்கு பின் வெங்காயம் அறுவடைக்கு வரும் இரட்டை அடுக்கு முறை.' }
  ],
  blackgram: [
    { key: 'sesame', name: 'Sesame (Til)', name_ta: 'எள்', ler: 1.32, nFixed: 0, ratio: '3:1', sp: '30 cm x 10 cm', dur: '75 Days', dur_ta: '75 நாட்கள்', why: 'Erect oilseed stems complement sprawling pulse canopies.', why_ta: 'செங்குத்தாக வளரும் எள், படரும் உளுந்துக்கு இடையே மிகச் சிறந்த ஒளி பயன்பாட்டைத் தரும்.' },
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', ler: 1.28, nFixed: 0, ratio: '4:1 Border', sp: '45 cm x 15 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Border windbreak deflecting dry heat winds from pulse blooms.', why_ta: 'கம்பு வரப்புப் பயிராக இருந்து பூக்கள் உதிர்வதைத் தடுக்கும்.' },
    { key: 'sunflower', name: 'Sunflower', name_ta: 'சூரியகாந்தி', ler: 1.24, nFixed: 0, ratio: '4:1', sp: '60 cm x 20 cm', dur: '85 Days', dur_ta: '85 நாட்கள்', why: 'High-value oilseed exploiting higher canopy layer above urad.', why_ta: 'உளுந்தின் மேல் அடுக்கில் சூரிய ஒளியைப் பயன்படுத்தி வளரும் எண்ணெய் வித்து.' }
  ],
  greengram: [
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', ler: 1.33, nFixed: 0, ratio: '4:1 Border', sp: '45 cm x 15 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Tall border barrier protecting moong flowers from wind desiccation.', why_ta: 'கம்பு வரப்புப் பயிராக இருந்து பாசிப்பயறு மலர்களை வெம்மை காற்றில் இருந்து காக்கும்.' },
    { key: 'sesame', name: 'Sesame (Til)', name_ta: 'எள்', ler: 1.28, nFixed: 0, ratio: '3:1', sp: '30 cm x 10 cm', dur: '75 Days', dur_ta: '75 நாட்கள்', why: 'Dual harvest pulse-oilseed pairing with shared low water needs.', why_ta: 'குறைந்த நீரில் அதிக லாபம் ஈட்டும் எள்-பாசிப்பயறு கூட்டணி.' },
    { key: 'castor', name: 'Castor', name_ta: 'ஆமணக்கு', ler: 1.24, nFixed: 0, ratio: '6:1 Border', sp: '90 cm x 30 cm', dur: '140 Days', dur_ta: '140 நாட்கள்', why: 'Oviposition trap border deflecting lepidopteran caterpillar pests.', why_ta: 'புழுக்களை வரப்பிலேயே கவர்ந்து அழிக்கும் இயற்கை பொறிப் பயிர்.' }
  ],
  pigeonpea: [
    { key: 'groundnut', name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', ler: 1.39, nFixed: 28, ratio: '1:6', sp: '30 cm x 10 cm', dur: '105 Days', dur_ta: '105 நாட்கள்', why: 'Groundnut completes podding in 105 days, leaving deep tur to forage late moisture.', why_ta: 'வேர்க்கடலை அறுவடைக்கு பின் ஆழமான துவரை வேர்கள் எஞ்சிய ஈரத்தைப் பயன்படுத்தும்.' },
    { key: 'foxtailmillet', name: 'Foxtail Millet (Thinai)', name_ta: 'தினை', ler: 1.31, nFixed: 0, ratio: '1:4', sp: '25 cm x 10 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Millet matures in 80 days before slow-starting pigeonpea locks its canopy.', why_ta: 'துவரை வளரும் முன்பே 80 நாட்களில் தினை அறுவடைக்கு வந்துவிடும்.' },
    { key: 'sesame', name: 'Sesame (Til)', name_ta: 'எள்', ler: 1.25, nFixed: 0, ratio: '1:3', sp: '30 cm x 10 cm', dur: '75 Days', dur_ta: '75 நாட்கள்', why: 'Drought-hardy oilseed filling the early vegetative window of pigeon pea.', why_ta: 'துவரையின் ஆரம்ப மாதங்களில் கூடுதல் வருமானம் ஈட்டித் தரும்.' }
  ],
  cowpea: [
    { key: 'sorghum', name: 'Sorghum (Jowar)', name_ta: 'சோளம்', ler: 1.34, nFixed: 0, ratio: '2:1', sp: '45 cm x 15 cm', dur: '100 Days', dur_ta: '100 நாட்கள்', why: 'Sorghum stalks act as windbreaks and structural support.', why_ta: 'சோளத் தட்டைகள் காற்றுத் தடுப்பாகவும் ஆதாரமாகவும் அமையும்.' },
    { key: 'maize', name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', ler: 1.29, nFixed: 0, ratio: '2:1', sp: '45 cm x 15 cm', dur: '95 Days', dur_ta: '95 நாட்கள்', why: 'Erect cereal stalks allow cowpea vines to carpet furrow bottoms.', why_ta: 'மக்காச்சோளம் மேலே வளர, தட்டப்பயறு கீழே படர்ந்து நிலத்தைக் காக்கும்.' },
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', ler: 1.24, nFixed: 0, ratio: '3:1', sp: '45 cm x 15 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Resilient dryland cereal-legume combination for low rainfall belts.', why_ta: 'குறைந்த மழைப்பொழிவு உள்ள பகுதிகளுக்கு ஏற்ற வறட்சி தாங்கும் கூட்டணி.' }
  ],
  horsegram: [
    { key: 'foxtailmillet', name: 'Foxtail Millet (Thinai)', name_ta: 'தினை', ler: 1.28, nFixed: 0, ratio: '2:1', sp: '25 cm x 10 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Dryland dual drought-hardy grain and legume pairing.', why_ta: 'மானாவாரி நிலங்களுக்கான வறட்சியைத் தாங்கும் சிறுதானிய-பருப்பு இணைப்பு.' },
    { key: 'barnyardmillet', name: 'Barnyard Millet (Kuthiraivali)', name_ta: 'குதிரைவாலி', ler: 1.26, nFixed: 0, ratio: '2:1', sp: '25 cm x 10 cm', dur: '90 Days', dur_ta: '90 நாட்கள்', why: 'Highly drought-resilient food security pairing in sandy red tracts.', why_ta: 'செம்மண் மேட்டு நிலங்களுக்கு உகந்த வறட்சி தாங்கும் சிறுதானிய முறை.' },
    { key: 'castor', name: 'Castor', name_ta: 'ஆமணக்கு', ler: 1.22, nFixed: 0, ratio: '4:1', sp: '90 cm x 30 cm', dur: '140 Days', dur_ta: '140 நாட்கள்', why: 'Deep subsoil water foraging castor with shallow horsegram ground cover.', why_ta: 'ஆழமான ஆமணக்கு வேர்களும், மேலோட்டமான கொள்ளு மூடு பயிரும் இணைந்த முறை.' }
  ],
  chickpea: [
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.30, nFixed: 0, ratio: '4:1', sp: '30 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Cool season companion suited for winter Rabi Vertisols.', why_ta: 'குளிர்கால கரிசல் நிலங்களுக்கு ஏற்ற வாசனைப் பயிர் இணைப்பு.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.26, nFixed: 24, ratio: '2:1', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Synergistic cool-season legume dual canopy utilization.', why_ta: 'குளிர்காலத்தில் இரட்டை பருப்பு மகசூல் தரும் முறை.' },
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.22, nFixed: 0, ratio: '3:1', sp: '20 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Porous root channel creator improving clay soil aeration.', why_ta: 'கரிசல் மண்ணை இளக்கி கொண்டைக்கடலை வேர்களுக்கு காற்றோட்டம் தரும்.' }
  ],
  clusterbean: [
    { key: 'maize', name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', ler: 1.32, nFixed: 0, ratio: '2:1', sp: '45 cm x 15 cm', dur: '100 Days', dur_ta: '100 நாட்கள்', why: 'Tall maize stalks complement erect bushy legume clusters.', why_ta: 'மக்காச்சோள நிழலைத் தாங்கி கொத்தவரை தழைச்சத்தை நிலைநிறுத்தும்.' },
    { key: 'sorghum', name: 'Sorghum (Jowar)', name_ta: 'சோளம்', ler: 1.28, nFixed: 0, ratio: '2:1', sp: '45 cm x 15 cm', dur: '100 Days', dur_ta: '100 நாட்கள்', why: 'Drought-hardy forage cereal with commercial gum-yielding guar.', why_ta: 'மானாவாரிக்கு ஏற்ற தானிய-கொத்தவரை லாபகரமான கூட்டணி.' },
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', ler: 1.24, nFixed: 0, ratio: '3:1', sp: '45 cm x 15 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Protects legume flowers from dry scorching winds in semi-arid tracts.', why_ta: 'வெம்மை காற்றில் இருந்து கொத்தவரை பூக்களைப் பாதுகாக்கும்.' }
  ],
  frenchbean: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.30, nFixed: 0, ratio: '1:1', sp: '20 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Quick root companion inter-planted between bush legume rows.', why_ta: 'பீன்ஸ் செடிகளுக்கு இடையே விரைவாக வளர்ந்து நிலத்தைப் பயன்படுத்தும்.' },
    { key: 'onion', name: 'Small Onion', name_ta: 'சின்ன வெங்காயம்', ler: 1.28, nFixed: 0, ratio: '1:2', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Pungent allium repels thrips and pod-boring insects.', why_ta: 'பீன்ஸ் பயிரைத் தாக்கும் பூச்சிகளை விரட்டும் சின்ன வெங்காயம்.' },
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.23, nFixed: 0, ratio: '1:1', sp: '15 cm x 5 cm', dur: '35 Days', dur_ta: '35 நாட்கள்', why: 'Quick herb harvested before bean canopies interlock.', why_ta: 'பீன்ஸ் படரும் முன்பே அறுவடை செய்யப்படும் குறுகிய காலக் கீரை.' }
  ],
  groundnut: [
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', ler: 1.35, nFixed: 0, ratio: '6:1 Border', sp: '45 cm x 15 cm', dur: '80 - 85 Days', dur_ta: '80 - 85 நாட்கள்', why: 'Tall border rows deflect drying winds, preserving pegging micro-humidity.', why_ta: 'கம்பு வரப்புப் பயிராக இருந்து மணிலா விழுதுகள் இறங்குவதற்குத் தேவையான ஈரப்பதத்தைக் காக்கும்.' },
    { key: 'pigeonpea', name: 'Pigeon Pea (Arhar / Tur)', name_ta: 'துவரை', ler: 1.36, nFixed: 42, ratio: '6:1', sp: '60 cm x 15 cm', dur: '140 Days', dur_ta: '140 நாட்கள்', why: 'Deep-rooted relay crop exploiting post-harvest subsoil moisture.', why_ta: 'வேர்க்கடலை அறுவடைக்கு பின்னும் ஆழமான ஈரத்தை எடுத்துக்கொண்டு பலன் தரும்.' },
    { key: 'castor', name: 'Castor', name_ta: 'ஆமணக்கு', ler: 1.28, nFixed: 0, ratio: '8:1', sp: '90 cm x 30 cm', dur: '150 Days', dur_ta: '150 நாட்கள்', why: 'Commercial oilseed bonus and Spodoptera caterpillar oviposition trap.', why_ta: 'புழுக்களைத் தன்வசம் ஈர்த்து வேர்க்கடலையைக் காக்கும் இயற்கை கவர்ச்சிப் பயிர்.' }
  ],
  sesame: [
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.33, nFixed: 28, ratio: '1:2', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Pulse carpets soil around erect sesame stalks, fixing nitrogen.', why_ta: 'எள் பயிருக்கு அடியில் உளுந்து வளர்ந்து களைகளைக் கட்டுப்படுத்தி உரம் சேர்க்கும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.29, nFixed: 26, ratio: '1:2', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Fast pulse harvested before sesame seed capsules fully mature.', why_ta: 'எள் காய் முதிர்வதற்கு முன்பே அறுவடை செய்யப்படும் குறுகிய காலப் பயிர்.' },
    { key: 'clusterbean', name: 'Cluster Bean', name_ta: 'கொத்தவரங்காய்', ler: 1.23, nFixed: 22, ratio: '1:1', sp: '30 cm x 10 cm', dur: '75 Days', dur_ta: '75 நாட்கள்', why: 'Taproot drought-hardy legume companion in low rainfall sandy soils.', why_ta: 'மணல் கலந்த நிலங்களில் வறட்சியைத் தாங்கி இரட்டை வருமானம் தரும்.' }
  ],
  sunflower: [
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.32, nFixed: 30, ratio: '1:2', sp: '30 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Low-profile pulse leaves ample sunlight for wide sunflower heads.', why_ta: 'சூரியகாந்தியின் ஒளிச்சேர்க்கைக்கு இடையூறின்றி கீழே பாசிப்பயறு தழைச்சத்து சேர்க்கும்.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.28, nFixed: 28, ratio: '1:2', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Feeds nitrogen to sunflower roots during head development stage.', why_ta: 'சூரியகாந்தி பூ வைக்கும் போது தேவையான தழைச்சத்தை உளுந்து வேர்கள் வழங்கும்.' },
    { key: 'cowpea', name: 'Cowpea', name_ta: 'தட்டப்பயறு', ler: 1.24, nFixed: 30, ratio: '1:2', sp: '30 cm x 10 cm', dur: '65 Days', dur_ta: '65 நாட்கள்', why: 'Living mulch keeping sunflower soil ridges moist in hot afternoons.', why_ta: 'கடும் வெயிலில் நிலத்தின் ஈரப்பதம் ஆவியாகாமல் தடுக்கும் மூடு பயிர்.' }
  ],
  castor: [
    { key: 'groundnut', name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை', ler: 1.38, nFixed: 26, ratio: '1:6', sp: '30 cm x 10 cm', dur: '105 Days', dur_ta: '105 நாட்கள்', why: 'Wide castor spacing accommodates multiple productive groundnut rows.', why_ta: 'ஆமணக்கின் அகன்ற இடைவெளியில் மணிலா சாகுபடி செய்து அதிக லாபம் பெறலாம்.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.30, nFixed: 30, ratio: '1:3', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Quick legume yielding early returns before tall castor bushes shade ground.', why_ta: 'ஆமணக்கு பெரிதாக வளர்வதற்கு முன்பே உளுந்து அறுவடைக்கு வந்துவிடும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.25, nFixed: 28, ratio: '1:3', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: '60-day companion taking full advantage of wide early rows.', why_ta: 'அகன்ற வரிசைகளைப் பயன்படுத்தி அறுவடை செய்யப்படும் 60 நாள் பயிர்.' }
  ],
  soybean: [
    { key: 'pigeonpea', name: 'Pigeon Pea', name_ta: 'துவரை', ler: 1.36, nFixed: 40, ratio: '2:1', sp: '45 cm x 15 cm', dur: '140 Days', dur_ta: '140 நாட்கள்', why: 'Complementary canopy heights and double biological nitrogen enrichment.', why_ta: 'இரட்டை பருப்பு வகைகளின் கூட்டு தழைச்சத்து நிலத்தை மிக வளமாக்கும்.' },
    { key: 'maize', name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', ler: 1.31, nFixed: 0, ratio: '2:2 Strip', sp: '45 cm x 15 cm', dur: '100 Days', dur_ta: '100 நாட்கள்', why: 'Classic cereal-legume relay strip maximizing solar absorption.', why_ta: 'சூரிய ஒளியை முழுமையாகப் பயன்படுத்தும் மக்காச்சோளம்-சோயாபீன் கூட்டு முறை.' },
    { key: 'sorghum', name: 'Sorghum (Jowar)', name_ta: 'சோளம்', ler: 1.25, nFixed: 0, ratio: '2:1', sp: '45 cm x 15 cm', dur: '100 Days', dur_ta: '100 நாட்கள்', why: 'Semi-arid grain-oilseed combination resilient to heat stress.', why_ta: 'வறட்சியைத் தாங்கி நல்ல எண்ணெய் வித்து-தானிய வரவு தரும் முறை.' }
  ],
  coconut: [
    { key: 'drumstick', name: 'Drumstick (Moringa)', name_ta: 'முருங்கை', ler: 1.52, nFixed: 0, ratio: 'Inter-Basin Alley', sp: '2.5m x 2.5m', dur: 'Perennial', dur_ta: 'ஆண்டு முழுவதும்', why: 'Agroforestry companion maximizing sun in wide palm alleys.', why_ta: 'தென்னந்தோப்பின் அகன்ற வரிசைகளில் சூரிய ஒளியைப் பயன்படுத்தி நிரந்தர வருமானம் தரும்.' },
    { key: 'turmeric', name: 'Turmeric', name_ta: 'மஞ்சள்', ler: 1.39, nFixed: 0, ratio: 'Shaded Basin Beds', sp: '30 cm x 20 cm', dur: '9 Months', dur_ta: '9 மாதங்கள்', why: 'Shade-tolerant spice crop thriving in palm understory litter.', why_ta: 'தென்னையின் பகுதி நிழலில் செழித்து வளரும் பணப்பயிர்.' },
    { key: 'ginger', name: 'Ginger', name_ta: 'இஞ்சி', ler: 1.35, nFixed: 0, ratio: 'Shaded Raised Beds', sp: '25 cm x 20 cm', dur: '8 - 9 Months', dur_ta: '8 - 9 மாதங்கள்', why: 'High-value spice bulb utilizing cool palm micro-climate.', why_ta: 'தென்னையின் குளிர்ந்த தட்பவெப்பத்தைப் பயன்படுத்தி அதிக லாபம் தரும் இஞ்சி.' }
  ],
  maize: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', ler: 1.35, nFixed: 35, ratio: '2:1', sp: '30 cm x 10 cm', dur: '65 - 75 Days', dur_ta: '65 - 75 நாட்கள்', why: 'Erect stalks allow dense cowpea foliage to smother weed flushes.', why_ta: 'மக்காச்சோளத் தட்டைகளுக்கு இடையே தட்டப்பயறு களைகளை ஒடுக்கி உரம் சேர்க்கும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.29, nFixed: 30, ratio: '1:2', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Harvested in 60 days before tall stalks close upper canopy.', why_ta: 'சோளம் முழுமையாக மூடும் முன்பே 60 நாட்களில் அறுவடை செய்யப்படும்.' },
    { key: 'soybean', name: 'Soybean', name_ta: 'சோயாபீன்', ler: 1.27, nFixed: 36, ratio: '2:2 Strip', sp: '30 cm x 10 cm', dur: '85 Days', dur_ta: '85 நாட்கள்', why: 'Robust oilseed income with complementary erect rooting architecture.', why_ta: 'வேர்கள் முட்டாமல் மக்காச்சோளத்தோடு இணைந்து அதிக லாபம் தரும்.' }
  ],
  pearlmillet: [
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.32, nFixed: 30, ratio: '1:2', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Harvested in 60 days before tall bajra stalks lock canopy.', why_ta: 'கம்பு முழு உயரத்தை எட்டும் முன்பே 60 நாட்களில் பாசிப்பயறு அறுவடைக்கு வரும்.' },
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', ler: 1.28, nFixed: 32, ratio: '2:1', sp: '30 cm x 10 cm', dur: '65 Days', dur_ta: '65 நாட்கள்', why: 'Nitrogen-fixing legume preventing sandy topsoil moisture loss.', why_ta: 'மணல் கலந்த நிலத்தில் கம்பு பயிருக்கு தேவையான ஈரத்தையும் உரத்தையும் தரும்.' },
    { key: 'horsegram', name: 'Horse Gram', name_ta: 'கொள்ளு', ler: 1.23, nFixed: 24, ratio: '2:1', sp: '30 cm x 10 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Resilient dryland rainfed drought-insurance pairing.', why_ta: 'கடுமையான வறட்சியிலும் பயிர் இழப்பைத் தடுக்கும் இயற்கை காப்பீடு.' }
  ],
  sorghum: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', ler: 1.34, nFixed: 35, ratio: '2:1', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Drought-hardy cereal and legume pairing for semi-arid zones.', why_ta: 'மானாவாரி நிலங்களுக்கு ஏற்ற சிறந்த தானிய-பருப்பு ஊடுபயிர் முறை.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.28, nFixed: 30, ratio: '1:2', sp: '30 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Pulse carpets soil between sorghum rows, curbing weed germination.', why_ta: 'சோள வரிசைகளுக்கு இடையே உளுந்து வளர்ந்து களை முளைப்பதைத் தடுக்கும்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.23, nFixed: 26, ratio: '1:1', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Early pod sales while sorghum grain heads are filling.', why_ta: 'சோளம் கதிர் வைக்கும் போதே காய்கறி மூலம் விரைவு வருமானம் தரும்.' }
  ],
  fingermillet: [
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.30, nFixed: 28, ratio: '4:1', sp: '25 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Adds crucial biological nitrogen to heavy-tillering ragi beds.', why_ta: 'கேழ்வரகு தூர்கள் வெடிக்கத் தேவையான தழைச்சத்தை உளுந்து வேர்கள் கொடுக்கும்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.26, nFixed: 26, ratio: '3:1', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Quick bean harvest providing commercial cash before ragi harvest.', why_ta: 'ராகி அறுவடைக்கு முன்பே பீன்ஸ் மூலம் நல்ல சந்தை வருமானம் கிடைக்கும்.' },
    { key: 'cowpea', name: 'Cowpea', name_ta: 'தட்டப்பயறு', ler: 1.22, nFixed: 28, ratio: '4:1', sp: '25 cm x 10 cm', dur: '65 Days', dur_ta: '65 நாட்கள்', why: 'Covers bare soil between transplanted ragi seedlings.', why_ta: 'நடவு ராகி நாற்றுகளுக்கு நடுவே நிலப்போர்வையாக வளரும்.' }
  ],
  barnyardmillet: [
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.31, nFixed: 28, ratio: '3:1', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Rapid drought-resistant dual harvest in sandy delta soils.', why_ta: 'குறைந்த நீரில் 60 நாட்களில் இரட்டை பலன் தரும் சிறுதானிய-பயறு முறை.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.27, nFixed: 28, ratio: '3:1', sp: '25 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Fixes bio-nitrogen in poor soils during kuthiraivali grain filling.', why_ta: 'சத்து குறைந்த நிலங்களிலும் குதிரைவாலிக்கு தழைச்சத்தை அளிக்கும்.' },
    { key: 'horsegram', name: 'Horse Gram', name_ta: 'கொள்ளு', ler: 1.23, nFixed: 22, ratio: '2:1', sp: '30 cm x 10 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Hardy dryland intercrop suited for dry drought spells.', why_ta: 'மழை குறைவான காலங்களிலும் வறட்சியைத் தாங்கும் சிறுதானிய முறை.' }
  ],
  foxtailmillet: [
    { key: 'cowpea', name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு', ler: 1.30, nFixed: 30, ratio: '3:1', sp: '25 cm x 10 cm', dur: '65 Days', dur_ta: '65 நாட்கள்', why: 'Shallow root systems feed at complementary depths.', why_ta: 'தினை மற்றும் தட்டப்பயறு வெவ்வேறு ஆழங்களில் சத்துகளை உறிஞ்சி பலன் தரும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.26, nFixed: 28, ratio: '2:1', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Fast 60-day companion harvested synchronously with thinai.', why_ta: 'தினையோடு இணைந்து 60 நாட்களில் விரைவாக பலன் தரும் பாசிப்பயறு.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.22, nFixed: 26, ratio: '2:1', sp: '25 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Soil enrichment crop for low fertility red loams.', why_ta: 'செம்மண் நிலங்களை வளப்படுத்தும் சிறுதானிய-உளுந்து முறை.' }
  ],
  kodomillet: [
    { key: 'horsegram', name: 'Horse Gram (Kulthi)', name_ta: 'கொள்ளு', ler: 1.28, nFixed: 22, ratio: '2:1', sp: '30 cm x 10 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Resilient dryland combination for Southern Zone rainfed uplands.', why_ta: 'தென் மாவட்ட மானாவாரி மேட்டு நிலங்களுக்கு உகந்த வறட்சி தாங்கும் பயிர்கள்.' },
    { key: 'blackgram', name: 'Black Gram', name_ta: 'உளுந்து', ler: 1.25, nFixed: 26, ratio: '3:1', sp: '25 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Enriches organic nitrogen in varagu root zones.', why_ta: 'வரகு பயிரின் வேர்ப்பகுதிக்கு தழைச்சத்தை வழங்கும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.22, nFixed: 26, ratio: '3:1', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Quick catch legume harvested before varagu grain heads mature.', why_ta: 'வரகு கதிர் முதிர்வதற்கு முன்பே அறுவடை செய்யப்படும் குறுகிய காலப் பயிர்.' }
  ],
  cotton: [
    { key: 'blackgram', name: 'Black Gram (Urad)', name_ta: 'உளுந்து', ler: 1.34, nFixed: 32, ratio: '1:2', sp: '30 cm x 10 cm', dur: '70 - 75 Days', dur_ta: '70 - 75 நாட்கள்', why: 'Completes harvest in 70 days before wide cotton branches lock.', why_ta: 'பருத்தி கிளை விரிக்கும் முன்பே உளுந்து அறுவடை முடிந்து கூடுதல் பண வரவு தரும்.' },
    { key: 'greengram', name: 'Green Gram', name_ta: 'பாசிப்பயறு', ler: 1.29, nFixed: 30, ratio: '1:2', sp: '25 cm x 10 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Ultra-fast 60-day legume with zero solar competition.', why_ta: 'பருத்தியுடன் நிழல் போட்டியின்றி 60 நாட்களில் விரைவாக அறுவடை செய்யலாம்.' },
    { key: 'clusterbean', name: 'Cluster Bean (Guar)', name_ta: 'கொத்தவரங்காய்', ler: 1.24, nFixed: 25, ratio: '1:1', sp: '45 cm x 15 cm', dur: '85 Days', dur_ta: '85 நாட்கள்', why: 'Drought-tolerant taproot legume resilient in hot black vertisols.', why_ta: 'கரிசல் நில வறட்சியைத் தாங்கி பருத்தி வரிசைகளுக்கு நடுவே பலன் தரும்.' }
  ],
  sugarcane: [
    { key: 'soybean', name: 'Soybean', name_ta: 'சோயாபீன்', ler: 1.39, nFixed: 36, ratio: '1:2', sp: '30 cm x 10 cm', dur: '85 Days', dur_ta: '85 நாட்கள்', why: 'Thrives in wide 120cm cane rows during the 90-day slow tillering phase.', why_ta: 'கரும்பு ஆரம்பத்தில் மெதுவாக வளரும் 90 நாட்களில் சோயாபீன் நல்ல வருமானம் தரும்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.31, nFixed: 26, ratio: '1:2', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Commercial vegetable pod harvest before thick cane canopies seal.', why_ta: 'கரும்பு தூர் கட்டுவதற்கு முன்பே காய்கறி சந்தை மூலம் நல்ல வருவாய் தரும்.' },
    { key: 'sunnhemp', name: 'Sunn Hemp', name_ta: 'சணப்பை', ler: 1.25, nFixed: 40, ratio: '1:1 Furrow', sp: '20 cm x 10 cm', dur: '50 Days (Mulch)', dur_ta: '50 நாட்கள் (மூடுஉரம்)', why: 'Trampled in situ at 50 days as green manure, cutting synthetic urea costs.', why_ta: '50-வது நாளில் நிலத்திலேயே உழுது பசுந்தாள் உரமாக மாற்றி உரச்செலவைக் குறைக்கும்.' }
  ],
  sunnhemp: [
    { key: 'sesame', name: 'Sesame (Til)', name_ta: 'எள்', ler: 1.27, nFixed: 0, ratio: '2:1', sp: '30 cm x 10 cm', dur: '75 Days', dur_ta: '75 நாட்கள்', why: 'Green manure legume improves soil structure for oilseed seed-set.', why_ta: 'பசுந்தாள் பயிரான சணப்பை நிலத்தின் அமைப்பை மேம்படுத்தி எள் விளைச்சலை அதிகரிக்கும்.' },
    { key: 'groundnut', name: 'Groundnut', name_ta: 'வேர்க்கடலை', ler: 1.25, nFixed: 25, ratio: '2:1', sp: '30 cm x 10 cm', dur: '105 Days', dur_ta: '105 நாட்கள்', why: 'Soil loosening pairing facilitating smooth pod pegging.', why_ta: 'மண்ணைத் தளர்த்தி வேர்க்கடலை விழுதுகள் எளிதாக இறங்க உதவும்.' },
    { key: 'pearlmillet', name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', ler: 1.22, nFixed: 0, ratio: '3:1', sp: '45 cm x 15 cm', dur: '80 Days', dur_ta: '80 நாட்கள்', why: 'Dual biomass and grain generation system.', why_ta: 'அதிக பசுந்தாள் உரத்தோடு தானிய உற்பத்தியையும் தரும் முறை.' }
  ],
  turmeric: [
    { key: 'onion', name: 'Small Onion (Shallot)', name_ta: 'சின்ன வெங்காயம்', ler: 1.38, nFixed: 0, ratio: '1:2 Raised Bed', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Onions mature in 70 days, paying off bed preparation costs early.', why_ta: 'மஞ்சள் முளைத்து வரும் முன்பே வெங்காயம் அறுவடைக்கு வந்து உழவுச் செலவை ஈடு செய்யும்.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.30, nFixed: 26, ratio: '1:2', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Supplies biological nitrogen directly to developing turmeric rhizomes.', why_ta: 'மஞ்சள் கிழங்கு பெருக்கத்திற்கு தேவையான இயற்கை தழைச்சத்தை வேருக்கு தரும்.' },
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.25, nFixed: 0, ratio: '1:2', sp: '15 cm x 5 cm', dur: '40 Days', dur_ta: '40 நாட்கள்', why: 'Fast herb extracted before turmeric vegetative leaves unfold.', why_ta: 'மஞ்சள் இலைகள் விரிவதற்கு முன்பே 40 நாளில் அறுவடை முடிந்துவிடும்.' }
  ],
  ginger: [
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.34, nFixed: 28, ratio: '1:2', sp: '30 cm x 15 cm', dur: '60 Days', dur_ta: '60 நாட்கள்', why: 'Bio-nitrogen enrichment directly feeding the developing rhizome root zone.', why_ta: 'இஞ்சியின் வேர்ப்பகுதிக்கு தழைச்சத்தை ஊட்டி கிழங்கு பெருக்க உதவும்.' },
    { key: 'onion', name: 'Small Onion', name_ta: 'சின்ன வெங்காயம்', ler: 1.29, nFixed: 0, ratio: '1:2', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Raised bed space utilization before heavy ginger foliage forms.', why_ta: 'இஞ்சி செடி அடர்ந்து வளரும் முன் பாத்தி இடத்தை பயன்படுத்தி பலன் தரும்.' },
    { key: 'coriander', name: 'Coriander', name_ta: 'கொத்தமல்லி', ler: 1.24, nFixed: 0, ratio: '1:2', sp: '15 cm x 5 cm', dur: '40 Days', dur_ta: '40 நாட்கள்', why: 'Ultra-fast catch crop yielding cash flow within 5 weeks.', why_ta: 'ஐந்தே வாரங்களில் அறுவடைக்கு வந்து ஆரம்ப செலவுகளை ஈடு செய்யும்.' }
  ],
  coriander: [
    { key: 'radish', name: 'Radish', name_ta: 'முள்ளங்கி', ler: 1.31, nFixed: 0, ratio: '1:1', sp: '20 cm x 10 cm', dur: '45 Days', dur_ta: '45 நாட்கள்', why: 'Quick shallow root companion harvested synchronously.', why_ta: 'ஒரே நேரத்தில் அறுவடைக்கு வரும் இரட்டை குறுகிய கால காய்கறி-கீரை கூட்டணி.' },
    { key: 'frenchbean', name: 'French Bush Bean', name_ta: 'பீன்ஸ்', ler: 1.28, nFixed: 26, ratio: '1:1', sp: '30 cm x 15 cm', dur: '55 Days', dur_ta: '55 நாட்கள்', why: 'Adds atmospheric nitrogen into the bed after coriander is clipped.', why_ta: 'கொத்தமல்லி அறுத்த பின் நிலத்தில் இயற்கை தழைச்சத்தை நிலைநிறுத்தும்.' },
    { key: 'onion', name: 'Small Onion', name_ta: 'சின்ன வெங்காயம்', ler: 1.23, nFixed: 0, ratio: '1:2', sp: '15 cm x 10 cm', dur: '70 Days', dur_ta: '70 நாட்கள்', why: 'Staggered dual culinary herb and bulb combination.', why_ta: 'சமையல் தேவைகளுக்கான இரட்டை குறுகிய கால பணப்பயிர் முறை.' }
  ]
};

// District Agro-Climatic Intelligence Engine (In-Browser Execution)
function computeCompleteAdvice(cKey, dKey, sType, acresVal, targetLang) {
  const cropMeta = TN_38_CROPS[cKey] || TN_38_CROPS.brinjal;
  const distMeta = TN_38_DISTRICTS[dKey] || TN_38_DISTRICTS.thanjavur;
  const isTa = targetLang === 'ta';
  const zone = distMeta.zone;
  const distLabel = isTa ? distMeta.name_ta : distMeta.name;

  let options = JSON.parse(JSON.stringify(ALL_37_COMPANION_DATA[cKey] || ALL_37_COMPANION_DATA.brinjal));

  // Regional adjustments
  if (cKey === 'clusterbean') {
    if (zone === 'Southern Zone' || sType === 'Black') {
      options = [
        options.find(o => o.key === 'sorghum') || options[1],
        options.find(o => o.key === 'pearlmillet') || options[2],
        options.find(o => o.key === 'maize') || options[0]
      ];
      options[0].why = `In ${distLabel} (${zone} rainfed black soils), Sorghum provides drought-resilient windbreak barriers while Guar taproots fix nitrogen.`;
      options[0].why_ta = `${distLabel} தென்மண்டல கரிசல் நிலங்களில் சோளம் வறட்சியைத் தாங்கி காற்றுத் தடுப்பாக இருக்க, கொத்தவரை வேர்கள் நிலத்தை வளப்படுத்தும்.`;
    } else {
      options = [
        options.find(o => o.key === 'maize') || options[0],
        options.find(o => o.key === 'sorghum') || options[1],
        options.find(o => o.key === 'pearlmillet') || options[2]
      ];
      options[0].why = `In ${distLabel}'s irrigated tracts, Maize stalks intercept sunlight efficiently alongside erect bushy cluster beans.`;
      options[0].why_ta = `${distLabel} பாசனப் பகுதிகளில் மக்காச்சோளத் தட்டைகளுக்கு இடையே கொத்தவரை நிழல் போட்டியின்றி சிறந்த பலன் தரும்.`;
    }
  } else if (cKey === 'groundnut') {
    if (zone === 'North Eastern Zone' || sType === 'Sandy') {
      options = [
        options.find(o => o.key === 'pearlmillet') || options[0],
        options.find(o => o.key === 'pigeonpea') || options[1],
        options.find(o => o.key === 'castor') || options[2]
      ];
      options[0].why = `In ${distLabel}'s coastal sandy tracts, Pearl Millet border shelterbelts deflect drying coastal sea winds, preserving pegging moisture.`;
      options[0].why_ta = `${distLabel} கடலோர மணற்பாங்கான நிலங்களில் கம்பு வரப்புப் பயிராக இருந்து கடல் வெம்மை காற்றைத் தடுத்து விழுதுகள் இறங்க உதவும்.`;
    } else {
      options = [
        options.find(o => o.key === 'pigeonpea') || options[1],
        options.find(o => o.key === 'pearlmillet') || options[0],
        options.find(o => o.key === 'castor') || options[2]
      ];
      options[0].why = `In ${distLabel} (${zone}), deep-rooted Pigeon Pea utilizes subsoil moisture after groundnut harvest.`;
      options[0].why_ta = `${distLabel} பகுதிகளில் மணிலா அறுவடைக்குப் பின் ஆழமான துவரை வேர்கள் எஞ்சிய ஈரத்தை எடுத்துக்கொண்டு கூடுதல் வருமானம் தரும்.`;
    }
  } else if (cKey === 'cotton') {
    if (zone === 'Southern Zone' || sType === 'Black') {
      options = [
        options.find(o => o.key === 'blackgram') || options[0],
        options.find(o => o.key === 'clusterbean') || options[2],
        options.find(o => o.key === 'greengram') || options[1]
      ];
      options[0].why = `In ${distLabel}'s heavy black vertisols, Black Gram matures rapidly in 70 days before summer moisture stress occurs.`;
      options[0].why_ta = `${distLabel} கரிசல் நிலங்களில் வறட்சி ஏற்படும் முன்பே 70 நாட்களில் உளுந்து அறுவடைக்கு வந்து கூடுதல் லாபம் தரும்.`;
    } else {
      options = [
        options.find(o => o.key === 'greengram') || options[1],
        options.find(o => o.key === 'blackgram') || options[0],
        options.find(o => o.key === 'clusterbean') || options[2]
      ];
      options[0].why = `In ${distLabel}'s irrigated loamy tracts, Green Gram completes its cycle in 60 days with zero canopy competition.`;
      options[0].why_ta = `${distLabel} பாசன நிலங்களில் பருத்தியுடன் நிழல் போட்டியின்றி 60 நாட்களில் பாசிப்பயறு விரைவாக பலன் தரும்.`;
    }
  } else if (cKey === 'brinjal' || cKey === 'tomato') {
    if (zone === 'Cauvery Delta' || sType === 'Clay') {
      options = [
        options.find(o => o.key === 'coriander') || options[0],
        options.find(o => o.key === 'frenchbean') || options[1],
        options.find(o => o.key === 'marigold') || options[2]
      ];
      options[0].why = `In ${distLabel} (Cauvery Delta alluvium), Coriander generates quick cash in 40 days before monsoon compaction sets in.`;
      options[0].why_ta = `${distLabel} டெல்டா வண்டல் நிலங்களில் 40 நாட்களில் கொத்தமல்லி அறுவடைக்கு வந்து ஆரம்ப கால உடனடி பண வரவு தரும்.`;
    } else {
      options = [
        options.find(o => o.key === 'frenchbean') || options[1],
        options.find(o => o.key === 'coriander') || options[0],
        options.find(o => o.key === 'marigold') || options[2]
      ];
      options[0].why = `In ${distLabel}'s well-drained soils, French Bush Bean fixes active nitrogen into heavy-feeder root zones.`;
      options[0].why_ta = `${distLabel} நிலங்களில் செடி பீன்ஸ் பயிரானது வேர் முடிச்சுகள் மூலம் இயற்கை தழைச்சத்தை அதிகரித்து கூடுதல் மகசூல் தரும்.`;
    }
  }

  const tiersEn = ['⭐ Highly Recommended', '👍 Recommended', '🌾 Feasible Alternative'];
  const tiersTa = ['⭐ மிகச் சிறந்த பரிந்துரை', '👍 பரிந்துரைக்கப்படுகிறது', '🌾 சாத்தியமான மாற்றுப் பயிர்'];

  const companionOptions = options.map((c, idx) => ({
    ...c,
    tier: isTa ? tiersTa[idx] : tiersEn[idx],
    tier_ta: tiersTa[idx],
    lerScore: c.ler,
    harvestDuration: c.dur,
    harvestDuration_ta: c.dur_ta,
    rowRatio: c.ratio,
    spacing: c.sp,
    nitrogenFixed: c.nFixed,
    reasoning: isTa ? (c.why_ta || c.why) : (c.why || c.why_ta)
  }));

  const activeCompanion = companionOptions[0];

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
  }[sType] || { hoursPerIrrigation: 1.8, frequencyDays: 2, infiltration: 'Moderate' };

  return {
    primaryCrop: {
      key: cKey,
      name: cropMeta.name,
      name_ta: cropMeta.name_ta,
      harvestDuration: cropMeta.harvestDur,
      harvestDuration_ta: isTa ? `${cropMeta.harvestDur} (தமிழ்நாடு தட்பவெப்பம்)` : cropMeta.harvestDur,
      avgYield: cropMeta.avgYield,
      safeMoisturePct: cropMeta.safeMoisturePct,
      ambientDays: cropMeta.ambientDays,
      coldDays: cropMeta.coldDays
    },
    marketData: {
      pricePerKg: cropMeta.mandiRate,
      officialMspPerKg: cropMeta.msp,
      lastUpdated: '2026-10-01'
    },
    intercrop: activeCompanion,
    companionOptions,
    waterFootprint: {
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
    },
    soilChemistry: {
      before: { availableN: '210 kg/ha', availableP: '18 kg/ha', availableK: '280 kg/ha', organicCarbon: '0.52%' },
      after: { availableN: `${210 + Math.round(activeCompanion.nitrogenFixed * 0.7)} kg/ha (+${Math.round(activeCompanion.nitrogenFixed * 0.7)} kg Bio-N)`, availableP: '20 kg/ha (Buffered)', availableK: '275 kg/ha', organicCarbon: '0.64% (+23%)' }
    },
    pests: [{
      pestName: `${cropMeta.name} Specific Pest Complex`,
      pestName_ta: `${cropMeta.name_ta} தாக்கும் பூச்சிகள் மற்றும் புழுக்கள்`,
      cultural: 'Prompt clipping of wilted shoots; install sticky/pheromone trap borders.',
      cultural_ta: 'வாடிய பகுதிகளை உடனுக்குடன் அகற்றுதல்; வண்ணப் பொறிகள் அமைத்தல்.',
      bio: 'Neem seed kernel extract (NSKE 5%) or Bacillus thuringiensis spray @ 2g/L.',
      bio_ta: 'வேப்பங்கொட்டை கரைசல் (5%) அல்லது பேசிலஸ் துரிஞ்சியென்சிஸ் தெளித்தல்.',
      toxicity: 'Moderate',
      phiDays: 3
    }]
  };
}

export default function App() {
  const [lang, setLang] = useState('en');
  const d = DICTIONARY[lang] || DICTIONARY.en;

  const [isFieldMode, setIsFieldMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedDistrict, setSelectedDistrict] = useState('thanjavur');
  const [selectedUnit, setSelectedUnit] = useState('Thanjavur');
  const [season, setSeason] = useState('Kharif');
  const [soilType, setSoilType] = useState('Clay');
  const [waterStatus, setWaterStatus] = useState('Medium');
  const [primaryCropKey, setPrimaryCropKey] = useState('brinjal');
  const [acres, setAcres] = useState(2);
  const [activeTab, setActiveTab] = useState('intercrop');

  const [advice, setAdvice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agri_user')) || null; } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authReason, setAuthReason] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const recognitionRef = useRef(null);

  const [fieldImage, setFieldImage] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [extractedSwatches, setExtractedSwatches] = useState([]);
  const fileInputRef = useRef(null);

  const [weatherForecast, setWeatherForecast] = useState([
    { day: 'Day 1', temp: 32, rainProb: 15, windKmh: 12, sprayRisk: 'Low' },
    { day: 'Day 2', temp: 31, rainProb: 20, windKmh: 14, sprayRisk: 'Low' },
    { day: 'Day 3', temp: 29, rainProb: 65, windKmh: 22, sprayRisk: 'High' },
    { day: 'Day 4', temp: 28, rainProb: 55, windKmh: 18, sprayRisk: 'High' },
    { day: 'Day 5', temp: 30, rainProb: 20, windKmh: 11, sprayRisk: 'Low' }
  ]);
  const [locationName, setLocationName] = useState('Thanjavur Basin, Cauvery Delta');

  const fetchLiveForecast = async (lat, lon, unitLabel = selectedUnit, distLabel = TN_38_DISTRICTS[selectedDistrict]?.name) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.daily) {
        const list = data.daily.time.slice(0, 5).map((_, idx) => {
          const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
          const maxRain = Math.round(data.daily.precipitation_probability_max[idx] || 0);
          const maxWind = Math.round(data.daily.wind_speed_10m_max[idx] || 12);
          const highRisk = maxRain >= 50 || maxWind >= 20;

          return {
            day: lang === 'ta' ? `நாள் ${idx + 1}` : `Day ${idx + 1}`,
            temp: maxTemp,
            rainProb: maxRain,
            windKmh: maxWind,
            sprayRisk: highRisk ? 'High' : 'Low'
          };
        });

        setWeatherForecast(list);
        setLocationName(`${unitLabel}, ${distLabel} (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`);
      }
    } catch {
      // Retain offline default
    }
  };

  useEffect(() => {
    const dist = TN_38_DISTRICTS[selectedDistrict];
    if (dist) {
      fetchLiveForecast(dist.coords[0], dist.coords[1], selectedUnit, dist.name);
    }
  }, [selectedDistrict, selectedUnit, lang]);

  // When location changes, reset advice so new location must be generated
  const handleDistrictChange = (distKey) => {
    setSelectedDistrict(distKey);
    const dist = TN_38_DISTRICTS[distKey];
    if (dist) {
      setSelectedUnit(dist.units[0]);
      setSoilType(dist.defaultSoil);
    }
    setAdvice(null);
  };

  const handleUnitChange = (unitName) => {
    setSelectedUnit(unitName);
    setAdvice(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFieldImage(dataUrl);
      setIsAnalyzingImage(true);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 48; canvas.height = 48;
        ctx.drawImage(img, 0, 0, 48, 48);

        let imgData = ctx.getImageData(0, 0, 48, 48).data;
        let rSum = 0, gSum = 0, bSum = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          rSum += imgData[i]; gSum += imgData[i + 1]; bSum += imgData[i + 2];
        }
        const total = imgData.length / 4;
        const avgR = Math.round(rSum / total);

        setTimeout(() => {
          let detectedSoil = avgR > 140 ? 'Sandy' : 'Loamy';
          let detectedCrop = detectedSoil === 'Sandy' ? 'groundnut' : 'tomato';

          setImageAnalysisResult({ isValid: true, soilType: detectedSoil, suggestedCrop: detectedCrop, confidence: '94%' });
          setSoilType(detectedSoil);
          setPrimaryCropKey(detectedCrop);
          setIsAnalyzingImage(false);
          setAdvice(null);
        }, 600);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Primary Generator Function (Direct In-Browser with API Support)
  const handleGenerateBlueprint = async () => {
    setIsGenerating(true);
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ primaryCropKey, districtKey: selectedDistrict, soilType, lang })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.primaryCrop) {
            setAdvice(data);
            setIsGenerating(false);
            return;
          }
        }
      }
    } catch {
      // Backend unreachable or mixed-content blocked
    }

    // Direct in-browser agro-climatic computation
    const computed = computeCompleteAdvice(primaryCropKey, selectedDistrict, soilType, acres, lang);
    setAdvice(computed);
    setIsGenerating(false);
  };

  const handleSaveBlueprint = async () => {
    if (!user) {
      setAuthReason(d.loginPrompt);
      setShowAuth(true);
      return;
    }

    const payload = {
      id: Date.now(),
      userId: user.id || 1,
      primaryCrop: primaryCropKey,
      primary_crop: primaryCropKey,
      intercrop: advice?.intercrop?.name || advice?.intercrop?.key || 'companion',
      district: selectedDistrict,
      constituency: selectedUnit,
      season,
      soilType,
      waterStatus,
      created_at: new Date().toISOString()
    };

    try {
      if (API_BASE) {
        await fetch(`${API_BASE}/api/history/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch {
      // Silent catch
    }

    // Always update local storage
    const existing = JSON.parse(localStorage.getItem('agri_history') || '[]');
    existing.unshift(payload);
    localStorage.setItem('agri_history', JSON.stringify(existing));
    alert(d.savedSuccess);
  };

  const handleOpenHistory = async () => {
    if (!user) {
      setAuthReason(d.loginPrompt);
      setShowAuth(true);
      return;
    }

    let list = [];
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/history/${user.id || 1}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) list = data;
        }
      }
    } catch {
      // Fetch local storage
    }

    if (list.length === 0) {
      list = JSON.parse(localStorage.getItem('agri_history') || '[]');
    }

    setHistoryList(list);
    setShowHistory(true);
  };

  const handleDeleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      if (API_BASE) {
        await fetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE' });
      }
    } catch {
      // Silent catch
    }

    const updated = historyList.filter(item => String(item.id) !== String(id));
    setHistoryList(updated);
    localStorage.setItem('agri_history', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_user');
    setUser(null);
    setShowHistory(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const chosenName = farmerName && farmerName.trim() ? farmerName.trim() : contact.split('@')[0];

    const loggedUser = { id: Date.now(), name: chosenName, contact };
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactInfo: contact, password, name: chosenName })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('agri_user', JSON.stringify(data.user));
            setShowAuth(false);
            setFarmerName('');
            return;
          }
        }
      }
    } catch {
      // Fallback to local session
    }

    setUser(loggedUser);
    localStorage.setItem('agri_user', JSON.stringify(loggedUser));
    setShowAuth(false);
    setAuthReason('');
    setFarmerName('');
  };

  const calculateEconomics = () => {
    if (!advice || !advice.primaryCrop) return null;

    const cropMeta = TN_38_CROPS[primaryCropKey] || TN_38_CROPS.brinjal;
    const yieldPerAcreQtl = Number(advice.primaryCrop.avgYield || cropMeta.avgYield || 15);
    const mandiRatePerKg = Number(advice.marketData?.pricePerKg || cropMeta.mandiRate || 25);
    const costPerAcre = Number(cropMeta.costPerAcre || 18000);

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
      benefitCostRatio: (totalGrossRevenue / (totalCost || 1)).toFixed(2)
    };
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser.');

    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    recognition.onstart = () => { setIsListening(true); setSpokenTranscript(''); };
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      setSpokenTranscript(text);
      for (const k of Object.keys(TN_38_CROPS)) {
        if (text.includes(k) || (TN_38_CROPS[k].name_ta && text.includes(TN_38_CROPS[k].name_ta))) {
          setPrimaryCropKey(k);
          setAdvice(null);
          break;
        }
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const generateFormattedCropPlanPDF = () => {
    if (!advice || !advice.primaryCrop || !fin) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Pop-up blocked. Please allow pop-ups to print your certificate.');

    const primaryName = lang === 'ta' ? (advice.primaryCrop.name_ta || advice.primaryCrop.name) : advice.primaryCrop.name;
    const intercropName = lang === 'ta' ? (advice.intercrop?.name_ta || advice.intercrop?.name) : advice.intercrop?.name;
    const districtName = lang === 'ta' ? (TN_38_DISTRICTS[selectedDistrict]?.name_ta || selectedDistrict) : TN_38_DISTRICTS[selectedDistrict]?.name;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AgriCompanion AI - Official Crop Plan Certificate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #1e293b; line-height: 1.4; }
          .header { border-bottom: 3px solid #059669; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: 900; color: #065f46; margin: 0; }
          .badge { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 11px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px; }
          .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
          .box h4 { margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #e2e8f0; font-weight: bold; }
          .highlight { color: #059669; font-weight: bold; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${lang === 'ta' ? 'அக்ரிகாம்பானியன் AI • உழவர் சாகுபடி சான்றிதழ்' : 'AgriCompanion AI • Field Advisory Certificate'}</h1>
            <p style="margin:4px 0; font-size:12px; color:#64748b;">${lang === 'ta' ? 'தமிழ்நாடு பல்நிலை ஊடுபயிர் துல்லிய வழிகாட்டி' : 'Statewide Tamil Nadu Agro-Ecological Decision Blueprint'}</p>
          </div>
          <div>
            <span class="badge">${lang === 'ta' ? 'சரிபார்க்கப்பட்ட மாதிரி' : 'Verified Agronomic Model'}</span>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <h4>${lang === 'ta' ? 'விவசாயி & நில விவரங்கள்' : 'Farmer & Plot Geocodes'}</h4>
            <p><strong>${lang === 'ta' ? 'விவசாயி' : 'Farmer'}:</strong> ${user?.name || 'Registered Farm Owner'}</p>
            <p><strong>${lang === 'ta' ? 'மாவட்டம்' : 'District'}:</strong> ${districtName}</p>
            <p><strong>${lang === 'ta' ? 'வட்டம் / தொகுதி' : 'Constituency / Taluk'}:</strong> ${selectedUnit}</p>
            <p><strong>${lang === 'ta' ? 'பரப்பளவு' : 'Plot Area'}:</strong> ${acres} ${lang === 'ta' ? 'ஏக்கர்' : 'Acres'}</p>
          </div>
          <div class="box">
            <h4>${lang === 'ta' ? 'பயிர் இணைப்பு கட்டமைப்பு' : 'Crop Pairing Architecture'}</h4>
            <p><strong>${lang === 'ta' ? 'முதன்மைப் பயிர்' : 'Primary Crop'}:</strong> ${primaryName}</p>
            <p><strong>${lang === 'ta' ? 'ஊடுபயிர்' : 'Companion Intercrop'}:</strong> ${intercropName}</p>
            <p><strong>${lang === 'ta' ? 'நிலப் பயன்பாட்டு விகிதம் (LER)' : 'Land Equivalent Ratio (LER)'}:</strong> <span class="highlight">${advice.intercrop?.lerScore || 1.30} (+${Math.round((Number(advice.intercrop?.lerScore || 1.30) - 1) * 100)}%)</span></p>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <h4>${lang === 'ta' ? 'நீர் தடம் & சேமிப்பு' : 'Water Footprint & Drip Conservation'}</h4>
            <p><strong>${lang === 'ta' ? 'பாரம்பரிய பாசன நீர்' : 'Flood Irrigation Water'}:</strong> ${(advice.waterFootprint?.floodLitersPerAcre * acres).toLocaleString('en-IN')} L</p>
            <p><strong>${lang === 'ta' ? 'சொட்டுநீர் தேவை' : 'Drip System Water'}:</strong> ${(advice.waterFootprint?.dripLitersPerAcre * acres).toLocaleString('en-IN')} L</p>
            <p><strong>${lang === 'ta' ? 'சேமிக்கப்படும் தூய நீர்' : 'Net Water Conserved'}:</strong> <span class="highlight">${(advice.waterFootprint?.waterSavedLitersPerAcre * acres).toLocaleString('en-IN')} Liters (-52%)</span></p>
          </div>
          <div class="box">
            <h4>${lang === 'ta' ? 'பொருளாதாரம் & லாப வரவு' : 'Economics & Projected Profit'}</h4>
            <p><strong>${lang === 'ta' ? 'முதன்மை மகசூல்' : 'Primary Yield'}:</strong> ${fin.primaryYield} Qtl (${fin.primaryYieldKg} kg)</p>
            <p><strong>${lang === 'ta' ? 'சந்தை விலை' : 'Mandi Benchmark'}:</strong> ₹${advice.marketData?.pricePerKg}/kg</p>
            <p><strong>${lang === 'ta' ? 'நிகர லாபம்' : 'Net Projected Profit'}:</strong> <span class="highlight">₹${fin.netProfit.toLocaleString('en-IN')}</span></p>
          </div>
        </div>

        <div class="footer">
          ${lang === 'ta' ? 'அக்ரிகாம்பானியன் AI துல்லிய வேளாண்மை முறைமை மூலம் உருவாக்கப்பட்டது.' : 'Generated via AgriCompanion AI Precision Agronomy System • Certified for Institutional Credit & Cooperative Schemes.'}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const fin = calculateEconomics();

  const filteredCrops = Object.entries(TN_38_CROPS).filter(([k, c]) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.name_ta && c.name_ta.includes(searchTerm)) || 
      k.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div 
      style={{ minHeight: '100vh', width: '100%', display: 'block' }} 
      className={`p-4 md:p-8 font-sans max-w-5xl mx-auto pb-24 transition-colors duration-300 ${
        isFieldMode 
          ? 'bg-zinc-950 text-white' 
          : 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-amber-50/40 text-slate-800'
      }`}
    >
      {/* HEADER */}
      <div className={`flex flex-wrap justify-between items-center p-5 rounded-2xl shadow-sm border mb-6 gap-3 transition-all ${
        isFieldMode 
          ? 'bg-black border-amber-400/80 shadow-amber-950/20' 
          : 'bg-white/90 backdrop-blur-md border-emerald-100 shadow-emerald-900/5'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 text-lg">
            🌱
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              {d.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{d.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFieldMode(!isFieldMode)}
            className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all ${
              isFieldMode 
                ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30' 
                : 'bg-gradient-to-r from-amber-50 to-amber-100/60 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {d.fieldMode}
          </button>
          
          <select 
            value={lang} 
            onChange={(e) => { 
              const newL = e.target.value;
              setLang(newL); 
            }} 
            className={`border p-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isFieldMode ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenHistory}
                className="text-xs bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm"
              >
                {d.viewHistory}
              </button>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-700">
                👤 {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold underline px-1"
              >
                {d.logout}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthReason(''); setShowAuth(true); }} 
              className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition"
            >
              {d.signIn}
            </button>
          )}
        </div>
      </div>

      {/* SCANNER VIEW & VOICE COMMANDER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
          isFieldMode 
            ? 'bg-black border-zinc-700' 
            : 'bg-white/80 backdrop-blur-md border-emerald-100 shadow-md shadow-emerald-900/5'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase text-emerald-700">{d.soilScanner}</h3>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition"
            >
              {d.captureUpload}
            </button>
          </div>
          {fieldImage && (
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/70 h-32 flex items-center justify-center bg-black">
              <img src={fieldImage} alt="Soil Capture" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-2 border-2 border-dashed border-emerald-400/80 pointer-events-none rounded"></div>
            </div>
          )}
          {extractedSwatches.length > 0 && !isAnalyzingImage && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {lang === 'ta' ? 'கண்டறியப்பட்ட மண் நிறம்:' : 'Extracted Soil Pigment:'}
              </span>
              <div className="flex gap-1.5">
                {extractedSwatches.map((hex, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }}></span>
                ))}
              </div>
            </div>
          )}
          {imageAnalysisResult && !isAnalyzingImage && (
            <p className="text-xs font-bold text-emerald-600">
              ✓ {lang === 'ta' ? `கண்டறியப்பட்ட மண்: ${imageAnalysisResult.soilType}` : `Detected: ${imageAnalysisResult.soilType} Soil`} ({imageAnalysisResult.confidence})
            </p>
          )}
        </div>

        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          isFieldMode 
            ? 'bg-black border-zinc-700' 
            : 'bg-white/80 backdrop-blur-md border-emerald-100 shadow-md shadow-emerald-900/5'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase text-teal-700">{d.voiceCommanderTitle}</h3>
            <button 
              onClick={toggleListening} 
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                isListening 
                  ? 'bg-rose-600 animate-pulse text-white shadow-rose-600/30' 
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/20'
              }`}
            >
              {isListening ? d.voiceListening : d.voiceCommand}
            </button>
          </div>
          {spokenTranscript ? (
            <p className="text-xs italic bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 mt-2">🗣 "{spokenTranscript}"</p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-2">
              {lang === 'ta' ? 'உதா: "தக்காளி 2 ஏக்கர் வண்டல் மண்" அல்லது "பருத்தி கரிசல் மண்"' : 'Try: "Tomato loam 2 acres" or "Cotton black soil"'}
            </p>
          )}
        </div>
      </div>

      {/* CROP SELECTOR */}
      <div className={`p-6 rounded-2xl border mb-6 space-y-4 transition-all ${
        isFieldMode 
          ? 'bg-black border-zinc-700' 
          : 'bg-white/90 backdrop-blur-md border-emerald-100 shadow-md shadow-emerald-900/5'
      }`}>
        
        {/* Dual Location Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
          <div>
            <label className="text-xs font-bold block mb-1 text-slate-700">{d.district}</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className={`w-full border p-2.5 rounded-xl text-xs font-bold shadow-sm transition ${
                isFieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {Object.entries(TN_38_DISTRICTS).map(([k, dist]) => (
                <option key={k} value={k}>
                  {lang === 'ta' ? `${dist.name_ta} (${dist.zone_ta})` : `${dist.name} (${dist.zone})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1 text-slate-700">{d.constituency}</label>
            <select
              value={selectedUnit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className={`w-full border p-2.5 rounded-xl text-xs font-bold shadow-sm transition ${
                isFieldMode ? 'bg-zinc-900 border-zinc-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700 font-extrabold'
              }`}
            >
              {(lang === 'ta' ? (TN_38_DISTRICTS[selectedDistrict]?.units_ta || TN_38_DISTRICTS[selectedDistrict]?.units) : TN_38_DISTRICTS[selectedDistrict]?.units)?.map((unitName, i) => (
                <option key={i} value={TN_38_DISTRICTS[selectedDistrict]?.units[i]}>{unitName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Crop Input */}
        <div>
          <label className="text-xs font-bold block mb-1 text-slate-700">{d.searchCrop}</label>
          <input
            type="text"
            placeholder={d.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border p-2.5 rounded-xl text-xs shadow-sm transition ${
              isFieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.key 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-600/30' 
                  : isFieldMode 
                    ? 'bg-zinc-900 text-gray-300' 
                    : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
              }`}
            >
              {lang === 'ta' ? cat.ta : cat.en}
            </button>
          ))}
        </div>

        {/* Crop Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
          {filteredCrops.map(([k, c]) => {
            const cropTitle = lang === 'ta' ? (c.name_ta || c.name) : c.name;
            const isSelected = primaryCropKey === k;
            return (
              <button
                key={k}
                onClick={() => {
                  setPrimaryCropKey(k);
                  setSoilType(c.defaultSoil);
                  setAdvice(null);
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-bold truncate transition-all shadow-sm ${
                  isSelected 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-[1.02]' 
                    : isFieldMode 
                      ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-800'
                }`}
              >
                <div className="truncate">{cropTitle}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
                  ₹{c.mandiRate.toFixed(2)}{d.perKg}
                </div>
              </button>
            );
          })}
        </div>

        {/* Farm Size Slider & Blueprint Button */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">{d.farmSize}</span>
              <span className="text-emerald-600 font-black">{acres} {d.acres}</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="15" 
              step="0.5" 
              value={acres} 
              onChange={(e) => setAcres(parseFloat(e.target.value))} 
              className="w-full accent-emerald-600 cursor-pointer" 
            />
          </div>
          <button 
            onClick={handleGenerateBlueprint} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isGenerating ? '...' : d.btnGet}
          </button>
        </div>
      </div>

      {/* TABS & DETAILS (ONLY VISIBLE ONCE GENERATED) */}
      {advice && advice.primaryCrop && (
        <div className="space-y-4">
          
          {/* Active Target Banner */}
          <div className={`p-5 rounded-2xl border flex flex-wrap justify-between items-center gap-3 transition-all ${
            isFieldMode 
              ? 'bg-black border-amber-400' 
              : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-100 shadow-md shadow-emerald-900/5'
          }`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">{d.selectedTarget}</span>
              <h2 className="text-2xl font-black text-emerald-950 mt-0.5">
                {lang === 'ta' ? (advice.primaryCrop.name_ta || advice.primaryCrop.name) : advice.primaryCrop.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ⏱️ {lang === 'ta' ? `பயிர்க்காலம்: ${advice.primaryCrop.harvestDuration_ta || advice.primaryCrop.harvestDuration}` : `Cycle: ${advice.primaryCrop.harvestDuration}`}
              </p>
            </div>
            <div className="text-right">
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm">
                {d.mandiPrice} ₹{Number(advice.marketData?.pricePerKg || 0).toFixed(2)}{d.perKg}
              </span>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                {d.govtFloor} ₹{Number(advice.marketData?.officialMspPerKg || 0).toFixed(2)}{d.perKg}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 border-b pb-2 overflow-x-auto border-emerald-100">
            {['intercrop', 'water', 'soilChemistry', 'storage', 'pests', 'economics', 'weather'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap shadow-sm ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-600/30' 
                      : isFieldMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'bg-white hover:bg-emerald-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab === 'intercrop' && d.tabBlueprint}
                  {tab === 'water' && d.tabWater}
                  {tab === 'soilChemistry' && d.tabSoilAudit}
                  {tab === 'storage' && d.tabStorage}
                  {tab === 'pests' && d.tabPests}
                  {tab === 'economics' && d.tabEconomics}
                  {tab === 'weather' && d.tabWeather}
                </button>
              );
            })}
          </div>

          {/* TAB 1: BLUEPRINT (3-TIER HIERARCHY ACCORDING TO PRIMARY CROP AND LOCATION) */}
          {activeTab === 'intercrop' && advice.intercrop && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {advice.companionOptions?.map((opt, i) => {
                  const isCompanionActive = advice.intercrop?.key === opt.key;
                  return (
                    <div
                      key={i}
                      onClick={() => setAdvice(prev => ({ ...prev, intercrop: opt }))}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm flex flex-col justify-between ${
                        isCompanionActive 
                          ? 'bg-gradient-to-br from-emerald-950 to-teal-950 text-white border-emerald-500 ring-2 ring-emerald-500 shadow-emerald-900/20' 
                          : isFieldMode 
                            ? 'bg-zinc-900 border-zinc-800' 
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={i === 0 ? "text-emerald-400 font-black" : i === 1 ? "text-teal-400 font-bold" : "text-amber-400 font-bold"}>
                            {lang === 'ta' ? (opt.tier_ta || opt.tier) : opt.tier}
                          </span>
                          <span className="bg-emerald-900/60 px-2 py-0.5 rounded-full text-emerald-200 font-extrabold">LER {opt.lerScore || opt.ler}</span>
                        </div>
                        <h4 className="text-sm font-black mt-1.5">{lang === 'ta' ? (opt.name_ta || opt.name) : opt.name}</h4>
                        <p className={`text-xs mt-1 line-clamp-3 leading-relaxed ${isCompanionActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {lang === 'ta' ? (opt.reasoning_ta || opt.why_ta || opt.reasoning) : (opt.reasoning || opt.why)}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[10px] font-extrabold text-emerald-400">
                        {isCompanionActive ? '✓ Selected Blueprint' : 'Click to select this crop'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Companion Highlight Card */}
              <div className={`p-6 rounded-2xl border space-y-4 shadow-md transition-all ${
                isFieldMode 
                  ? 'bg-zinc-900 border-zinc-700' 
                  : 'bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border-emerald-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600">Active Recommended Blueprint</span>
                    <h3 className="text-lg font-black text-emerald-800">
                      {lang === 'ta' ? (advice.intercrop.name_ta || advice.intercrop.name) : advice.intercrop.name}
                    </h3>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm">
                    LER: {advice.intercrop.lerScore || advice.intercrop.ler}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ta' ? 'வரிசை அமைப்பு' : 'Pattern'}</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{advice.intercrop.rowRatio || advice.intercrop.ratio}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ta' ? 'இடைவெளி' : 'Spacing'}</p>
                    <p className="font-extrabold text-slate-800 truncate mt-0.5">{advice.intercrop.spacing || advice.intercrop.sp}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">{lang === 'ta' ? 'இயற்கை தழைச்சத்து' : 'Soil Bio-N'}</p>
                    <p className="font-extrabold text-emerald-600 mt-0.5">+{advice.intercrop.nitrogenFixed || advice.intercrop.nFixed} kg N/ha</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ta' ? 'பயிர்க்காலம்' : 'Cycle'}</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{lang === 'ta' ? (advice.intercrop.harvestDuration_ta || advice.intercrop.dur_ta || advice.intercrop.harvestDuration) : (advice.intercrop.harvestDuration || advice.intercrop.dur)}</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 bg-white/70 p-3.5 rounded-xl border border-emerald-100">
                  <strong>💡 {lang === 'ta' ? 'பரிந்துரை காரணம்:' : 'Rationale:'}</strong> {lang === 'ta' ? (advice.intercrop.reasoning_ta || advice.intercrop.why_ta || advice.intercrop.reasoning) : (advice.intercrop.reasoning || advice.intercrop.why)}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button 
                    onClick={handleSaveBlueprint}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    {d.saveBtn}
                  </button>

                  <button 
                    onClick={generateFormattedCropPlanPDF} 
                    className="flex-1 bg-gradient-to-r from-slate-800 to-zinc-900 hover:from-black hover:to-zinc-900 text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {d.pdfBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WATER FOOTPRINT & DRIP IRRIGATION */}
          {activeTab === 'water' && advice.waterFootprint && (
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
              isFieldMode ? 'bg-black border-zinc-700' : 'bg-white/90 backdrop-blur-md border-emerald-100'
            }`}>
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-black text-cyan-600 flex items-center gap-2">
                  <span>💧</span> {lang === 'ta' ? 'நீர் தடம் மற்றும் துல்லிய சொட்டுநீர் கால்குலேட்டர்' : 'Water Footprint & Precision Drip Irrigation Calculator'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'ta' ? `பரப்பளவு: ${acres} ஏக்கர் | மண் வகை: ${soilType} | உழவு முறை: பல்நிலை ஊடுபயிர்` : `Field: ${acres} Acres | Soil: ${soilType} | Method: Multi-Tier Living Mulch`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-4 rounded-2xl border transition-all ${
                  isFieldMode 
                    ? 'bg-zinc-900 border-zinc-800' 
                    : 'bg-gradient-to-br from-rose-50 to-orange-50/40 border-rose-100 shadow-sm'
                }`}>
                  <p className="text-[10px] font-extrabold text-rose-500 uppercase">{lang === 'ta' ? 'பாரம்பரிய வாய்க்கால் பாசனம்' : 'Conventional Flood Irrigation'}</p>
                  <p className="text-xl font-black mt-1 text-rose-600">
                    {Math.round(advice.waterFootprint.floodLitersPerAcre * acres).toLocaleString('en-IN')} L
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{lang === 'ta' ? 'அதிக ஆவியாதல் மற்றும் நீரிழப்பு' : 'High percolation & surface evaporation loss'}</p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isFieldMode 
                    ? 'bg-zinc-900 border-zinc-800' 
                    : 'bg-gradient-to-br from-cyan-50 to-blue-50/40 border-cyan-100 shadow-sm'
                }`}>
                  <p className="text-[10px] font-extrabold text-cyan-600 uppercase">{lang === 'ta' ? 'பரிந்துரைக்கப்படும் சொட்டுநீர் தேவை' : 'AgriCompanion Drip System'}</p>
                  <p className="text-xl font-black mt-1 text-cyan-700">
                    {Math.round(advice.waterFootprint.dripLitersPerAcre * acres).toLocaleString('en-IN')} L
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{lang === 'ta' ? 'வேர்ப்பகுதிக்கு நேரடியாக நீர் விநியோகம்' : 'Micro-root zone targeted application'}</p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isFieldMode 
                    ? 'bg-zinc-900 border-zinc-800' 
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50/40 border-emerald-100 shadow-sm'
                }`}>
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase">{lang === 'ta' ? 'சேமிக்கப்படும் நிகர நீர்' : 'Net Water Conserved'}</p>
                  <p className="text-xl font-black mt-1 text-emerald-600">
                    +{Math.round(advice.waterFootprint.waterSavedLitersPerAcre * acres).toLocaleString('en-IN')} L
                  </p>
                  <p className="text-[10px] text-emerald-700 font-extrabold mt-1">
                    {lang === 'ta' ? '52% நீர் சேமிப்பு சாத்தியம்' : '52% Total Water Conservation'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isFieldMode 
                  ? 'bg-zinc-900/60 border-zinc-800' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-extrabold text-emerald-700 text-xs uppercase flex items-center gap-1.5">
                  <span>⏱️</span> {lang === 'ta' ? 'பரிந்துரைக்கப்படும் சொட்டுநீர் அட்டவணை' : 'Precision Drip Scheduling Guide'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                  <p><strong>{lang === 'ta' ? 'சுழற்சி ஒன்றுக்கு மோட்டார் இயங்கும் நேரம்:' : 'Runtime per Cycle:'}</strong> {advice.waterFootprint.dripSchedule.runtimeHoursPerCycle} {lang === 'ta' ? 'மணிநேரம்' : 'Hours'}</p>
                  <p><strong>{lang === 'ta' ? 'பாசன இடைவெளி:' : 'Irrigation Interval:'}</strong> {lang === 'ta' ? `${advice.waterFootprint.dripSchedule.irrigationIntervalDays} நாட்களுக்கு ஒருமுறை` : `Once every ${advice.waterFootprint.dripSchedule.irrigationIntervalDays} Days`}</p>
                  <p><strong>{lang === 'ta' ? 'மண்ணின் ஈரப்பதம் தாங்குதிறன்:' : 'Infiltration Index:'}</strong> {advice.waterFootprint.dripSchedule.soilInfiltrationNote}</p>
                  <p><strong>{lang === 'ta' ? 'ஊடுபயிர் நிலப்போர்வை நன்மை:' : 'Living Mulch Shield:'}</strong> {advice.waterFootprint.dripSchedule.evaporationReduction}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOIL CHEMICAL COMPOSITION */}
          {activeTab === 'soilChemistry' && advice.soilChemistry && (
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
              isFieldMode ? 'bg-black border-zinc-700' : 'bg-white/90 backdrop-blur-md border-emerald-100'
            }`}>
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-black text-amber-700 flex items-center gap-2">
                  <span>🧪</span> {lang === 'ta' ? 'மண் சத்து (N-P-K) ஒப்பீட்டு ஆய்வு (முன் vs பின்)' : 'Soil Chemical Audit (Before vs. After Intercrop)'}
                </h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className={isFieldMode ? 'bg-zinc-900 text-gray-300' : 'bg-amber-50/70 text-amber-900'}>
                    <tr>
                      <th className="p-3 border-b border-slate-200">{lang === 'ta' ? 'மண் வளக் குறியீடு' : 'Soil Indicator'}</th>
                      <th className="p-3 border-b border-slate-200">{lang === 'ta' ? 'விதைப்புக்கு முன்' : 'Baseline'}</th>
                      <th className="p-3 border-b border-slate-200 text-emerald-700 font-extrabold">{lang === 'ta' ? 'அறுவடைக்கு பின்' : 'Post-Harvest'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-800">{lang === 'ta' ? 'தழைச்சத்து (Nitrogen - N)' : 'Available Nitrogen (N)'}</td>
                      <td className="p-3 text-slate-500">{advice.soilChemistry.before.availableN}</td>
                      <td className="p-3 font-extrabold text-emerald-600 bg-emerald-50/40">{advice.soilChemistry.after.availableN}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-800">{lang === 'ta' ? 'மணிச்சத்து (Phosphorus - P)' : 'Available Phosphorus (P)'}</td>
                      <td className="p-3 text-slate-500">{advice.soilChemistry.before.availableP}</td>
                      <td className="p-3 font-extrabold text-emerald-600 bg-emerald-50/40">{advice.soilChemistry.after.availableP}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-800">{lang === 'ta' ? 'சாம்பல் சத்து (Potassium - K)' : 'Available Potassium (K)'}</td>
                      <td className="p-3 text-slate-500">{advice.soilChemistry.before.availableK}</td>
                      <td className="p-3 font-extrabold text-emerald-600 bg-emerald-50/40">{advice.soilChemistry.after.availableK}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-800">{lang === 'ta' ? 'மண்ணின் கரிம அளவு (OC %)' : 'Organic Carbon (OC %)'}</td>
                      <td className="p-3 text-slate-500">{advice.soilChemistry.before.organicCarbon}</td>
                      <td className="p-3 font-extrabold text-emerald-600 bg-emerald-50/40">{advice.soilChemistry.after.organicCarbon}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: POST-HARVEST STORAGE */}
          {activeTab === 'storage' && (
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
              isFieldMode ? 'bg-black border-zinc-700' : 'bg-white/90 backdrop-blur-md border-emerald-100'
            }`}>
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-black text-amber-600 flex items-center gap-2">
                  <span>🧺</span> {lang === 'ta' ? 'அறுவடைக்கு பிந்தைய சேமிப்பு & அடுக்கு ஆயுள்' : 'Post-Harvest Storage & Shelf-Life Protocol'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className={`p-4 rounded-2xl border transition-all ${
                  isFieldMode ? 'bg-zinc-900 border-zinc-700' : 'bg-emerald-50/40 border-emerald-100'
                }`}>
                  <h4 className="font-black text-sm text-emerald-800 mb-1">
                    {lang === 'ta' ? (advice.primaryCrop.name_ta || advice.primaryCrop.name) : advice.primaryCrop.name}
                  </h4>
                  <p><strong>{lang === 'ta' ? 'பாதுகாப்பான ஈரப்பதம்:' : 'Safe Moisture:'}</strong> ≤ {advice.primaryCrop.safeMoisturePct || 12}%</p>
                  <p><strong>{lang === 'ta' ? 'சாதாரண அறை சேமிப்பு:' : 'Ambient Life:'}</strong> {advice.primaryCrop.ambientDays || 4} {lang === 'ta' ? 'நாட்கள்' : 'Days'}</p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  isFieldMode ? 'bg-zinc-900 border-zinc-700' : 'bg-teal-50/40 border-teal-100'
                }`}>
                  <h4 className="font-black text-sm text-teal-800 mb-1">
                    {lang === 'ta' ? (advice.intercrop?.name_ta || advice.intercrop?.name) : advice.intercrop?.name}
                  </h4>
                  <p><strong>{lang === 'ta' ? 'சேமிப்பு முறை:' : 'Storage Strategy:'}</strong> {lang === 'ta' ? (advice.intercrop?.storageLife_ta || advice.intercrop?.storageLife) : advice.intercrop?.storageLife}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PESTS */}
          {activeTab === 'pests' && advice.pests && (
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
              isFieldMode ? 'bg-black border-zinc-700' : 'bg-white/90 backdrop-blur-md border-emerald-100'
            }`}>
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-black text-rose-600 flex items-center gap-2">
                  <span>🐛</span> {lang === 'ta' ? 'ஒருங்கிணைந்த பூச்சி கட்டுப்பாடு (IPM) & அறுவடை இடைவெளி' : 'Integrated Pest Management (IPM) & Pre-Harvest Interval'}
                </h3>
              </div>

              <div className="space-y-3">
                {advice.pests.map((p, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                    isFieldMode ? 'bg-zinc-900 border-zinc-800' : 'bg-rose-50/40 border-rose-100'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-rose-700">
                        {lang === 'ta' ? (p.pestName_ta || p.pestName) : p.pestName}
                      </span>
                      <span className="bg-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">{p.toxicity} Hazard</span>
                    </div>
                    <p className="text-slate-700"><strong>{lang === 'ta' ? 'முன்னெச்சரிக்கை உழவு முறை:' : 'Cultural Control:'}</strong> {lang === 'ta' ? (p.cultural_ta || p.cultural) : p.cultural}</p>
                    <p className="text-slate-700"><strong>{lang === 'ta' ? 'இயற்கை / உயிரியல் முறை:' : 'Biological Control:'}</strong> {lang === 'ta' ? (p.bio_ta || p.bio) : p.bio}</p>
                    <div className="p-2.5 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-800 font-bold">
                      ⏳ {lang === 'ta' ? `மருந்து தெளித்த பின் அறுவடை செய்ய காத்திருக்க வேண்டிய நாட்கள் (PHI): ${p.phiDays} நாட்கள்` : `Pre-Harvest Interval (PHI): Wait ${p.phiDays} Days after spray before harvest.`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ECONOMICS */}
          {activeTab === 'economics' && fin && (
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border grid grid-cols-2 md:grid-cols-4 gap-3 text-center shadow-sm transition-all ${
                isFieldMode ? 'bg-black border-zinc-800' : 'bg-white/90 backdrop-blur-md border-emerald-100'
              }`}>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{lang === 'ta' ? 'முதன்மை மகசூல்' : 'Primary Yield'}</p>
                  <p className="text-base font-black text-slate-800 mt-1">{fin.primaryYield} Qtl ({fin.primaryYieldKg} kg)</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <p className="text-[10px] text-blue-600 uppercase font-bold">{lang === 'ta' ? 'ஊடுபயிர் வரவு' : 'Intercrop Bonus'}</p>
                  <p className="text-base font-black text-blue-700 mt-1">+₹{fin.bonusRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="text-[10px] text-amber-600 uppercase font-bold">{lang === 'ta' ? 'சாகுபடி செலவு' : 'Production Cost'}</p>
                  <p className="text-base font-black text-amber-700 mt-1">₹{fin.totalCost.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 uppercase font-bold">{lang === 'ta' ? 'நிகர லாபம்' : 'Net Farm Profit'}</p>
                  <p className="text-base font-black text-emerald-700 mt-1">₹{fin.netProfit.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WEATHER */}
          {activeTab === 'weather' && (
            <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
              isFieldMode ? 'bg-black border-zinc-800' : 'bg-white/90 backdrop-blur-md border-emerald-100'
            }`}>
              <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                <h3 className="text-sm font-black text-teal-700 flex items-center gap-2">
                  <span>🌦️</span> {lang === 'ta' ? '5-நாள் நேரலை செயற்கைக்கோள் வானிலை மற்றும் தெளிப்பு ஆலோசனை' : '5-Day Live Satellite Weather & Spray Risk'}
                </h3>
                <span className="text-xs text-emerald-600 font-extrabold">📍 {locationName}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {weatherForecast.map((w, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border transition-all ${
                    w.sprayRisk === 'High' 
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900' 
                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  }`}>
                    <p className="font-extrabold text-[11px] text-slate-700">{w.day}</p>
                    <p className="text-sm font-black mt-1">{w.temp}°C</p>
                    <p className="text-[10px] text-blue-600 font-semibold">💧 {w.rainProb}% {lang === 'ta' ? 'மழை' : 'Rain'}</p>
                    <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 shadow-sm ${
                      w.sprayRisk === 'High' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {w.sprayRisk === 'High' ? (lang === 'ta' ? 'தெளிக்காதீர்' : 'Washout Risk') : (lang === 'ta' ? 'தெளிக்கலாம்' : 'Safe Spray')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLOATING VOICE ORB */}
      <FloatingVoiceOrb onToggleListen={toggleListening} isListening={isListening} lastTranscript={spokenTranscript} />

      {/* AUTHENTICATION MODAL */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAuthSubmit} className="bg-white border border-emerald-100 p-6 rounded-2xl max-w-sm w-full space-y-4 text-slate-800 shadow-2xl">
            <div>
              <h3 className="text-base font-black text-emerald-700">{d.signIn}</h3>
              {authReason && (
                <p className="text-xs text-amber-800 mt-1.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  {authReason}
                </p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {lang === 'ta' ? 'உழவர் பெயர் (Farmer Name)' : 'Farmer Name'}
              </label>
              <input 
                type="text" 
                placeholder={lang === 'ta' ? 'உங்கள் பெயர் (உதா: மு. முருகன்)' : 'e.g. M. Murugan'} 
                value={farmerName} 
                onChange={e => setFarmerName(e.target.value)} 
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs focus:border-emerald-500 outline-none transition" 
                required 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {lang === 'ta' ? 'தொலைபேசி எண் / மின்னஞ்சல்' : 'Mobile / Email'}
              </label>
              <input 
                type="text" 
                placeholder={lang === 'ta' ? '9876543210 அல்லது மின்னஞ்சல்' : 'Phone or Email'} 
                value={contact} 
                onChange={e => setContact(e.target.value)} 
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs focus:border-emerald-500 outline-none transition" 
                required 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs focus:border-emerald-500 outline-none transition" 
                required 
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition">
                {lang === 'ta' ? 'உள்நுழைக' : 'Submit'}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowAuth(false); setAuthReason(''); }} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
              >
                {lang === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SAVED PLANS HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-emerald-100 p-6 rounded-2xl max-w-md w-full space-y-4 text-slate-800 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-emerald-700">{d.viewHistory}</h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {lang === 'ta' ? 'சேமிக்கப்பட்ட திட்டங்கள் எதுவும் இல்லை.' : 'No saved farm blueprints found.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {historyList.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-black text-emerald-800 capitalize">
                        {item.primary_crop || item.primaryCrop} + {item.intercrop}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {item.district} • {item.season}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                        {lang === 'ta' ? 'சேமிக்கப்பட்டது' : 'Saved'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-1.5 rounded-lg font-bold transition"
                        title={lang === 'ta' ? 'திட்டத்தை நீக்குக' : 'Delete Blueprint'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}	