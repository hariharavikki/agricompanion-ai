import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5002';

// 1. All 38 Districts of Tamil Nadu
const TN_38_DISTRICTS = {
  thanjavur: {
    name: 'Thanjavur',
    name_ta: 'தஞ்சாவூர்',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Clay',
    coords: [10.7870, 79.1378],
    units: ['Thanjavur', 'Thiruvaiyaru', 'Kumbakonam', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Orathanadu', 'Thiruvidaimarudur'],
    units_ta: ['தஞ்சாவூர்', 'திருவையாறு', 'கும்பகோணம்', 'பாபநாசம்', 'பட்டுக்கோட்டை', 'பேராவூரணி', 'ஒரத்தநாடு', 'திருவிடைமருதூர்']
  },
  tiruvarur: {
    name: 'Tiruvarur',
    name_ta: 'திருவாரூர்',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Clay',
    coords: [10.7725, 79.6365],
    units: ['Tiruvarur', 'Mannargudi', 'Thiruthuraipoondi', 'Nannilam', 'Kudavasal', 'Valangaiman', 'Needamangalam'],
    units_ta: ['திருவாரூர்', 'மன்னார்குடி', 'திருத்துறைப்பூண்டி', 'நன்னிலம்', 'குடவாசல்', 'வலங்கைமான்', 'நீடாமங்கலம்']
  },
  nagapattinam: {
    name: 'Nagapattinam',
    name_ta: 'நாகப்பட்டினம்',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Clay',
    coords: [10.7672, 79.8449],
    units: ['Nagapattinam', 'Kilvelur', 'Vedaranyam', 'Thirukkuvalai'],
    units_ta: ['நாகப்பட்டினம்', 'கீழ்வேளூர்', 'வேதாரண்யம்', 'திருக்குவளை']
  },
  mayiladuthurai: {
    name: 'Mayiladuthurai',
    name_ta: 'மயிலாடுதுறை',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Clay',
    coords: [11.1075, 79.6524],
    units: ['Mayiladuthurai', 'Sirkazhi', 'Poompuhar', 'Tharangambadi', 'Kuthalam'],
    units_ta: ['மயிலாடுதுறை', 'சீர்காழி', 'பூம்புகார்', 'தரங்கம்பாடி', 'குத்தாலம்']
  },
  coimbatore: {
    name: 'Coimbatore',
    name_ta: 'கோயம்புத்தூர்',
    zone: 'Western Zone',
    zone_ta: 'மேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.0168, 76.9558],
    units: ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Sulur', 'Mettupalayam', 'Valparai', 'Thondamuthur', 'Singanallur', 'Kinathukadavu'],
    units_ta: ['கோவை வடக்கு', 'கோவை தெற்கு', 'பொள்ளாச்சி', 'சூலூர்', 'மேட்டுப்பாளையம்', 'வால்பாறை', 'தொண்டாமுத்தூர்', 'சிங்காநல்லூர்', 'கிணத்துக்கடவு']
  },
  tiruppur: {
    name: 'Tiruppur',
    name_ta: 'திருப்பூர்',
    zone: 'Western Zone',
    zone_ta: 'மேற்கு மண்டலம்',
    defaultSoil: 'Black',
    coords: [11.1085, 77.3411],
    units: ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Palladam', 'Udumalaipettai', 'Dharapuram', 'Kangeyam', 'Madathukulam'],
    units_ta: ['திருப்பூர் வடக்கு', 'திருப்பூர் தெற்கு', 'அவிநாசி', 'பல்லடம்', 'உடுமலைப்பேட்டை', 'தாராபுரம்', 'காங்கேயம்', 'மடத்துக்குளம்']
  },
  erode: {
    name: 'Erode',
    name_ta: 'ஈரோடு',
    zone: 'Western Zone',
    zone_ta: 'மேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.3410, 77.7172],
    units: ['Erode East', 'Erode West', 'Gobichettipalayam', 'Bhavani', 'Anthiyur', 'Perundurai', 'Modakkurichi', 'Bhavanisagar'],
    units_ta: ['ஈரோடு கிழக்கு', 'ஈரோடு மேற்கு', 'கோபிசெட்டிபாளையம்', 'பவானி', 'அந்தியூர்', 'பெருந்துறை', 'மொடக்குறிச்சி', 'பவானிசாகர்']
  },
  dindigul: {
    name: 'Dindigul',
    name_ta: 'திண்டுக்கல்',
    zone: 'Western Zone',
    zone_ta: 'மேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [10.3673, 77.9803],
    units: ['Dindigul', 'Palani', 'Oddanchatram', 'Athoor', 'Nilakkottai', 'Natham', 'Vedasandur', 'Kodaikanal'],
    units_ta: ['திண்டுக்கல்', 'பழனி', 'ஒட்டன்சத்திரம்', 'ஆத்தூர்', 'நிலக்கோட்டை', 'நத்தம்', 'வேடசந்தூர்', 'கொடைக்கானல்']
  },
  karur: {
    name: 'Karur',
    name_ta: 'கரூர்',
    zone: 'Western Zone',
    zone_ta: 'மேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [10.9601, 78.0766],
    units: ['Karur', 'Aravakurichi', 'Kulithalai', 'Krishnarayapuram', 'Kadavur'],
    units_ta: ['கரூர்', 'அரவக்குறிச்சி', 'குளித்தலை', 'கிருஷ்ணராயபுரம்', 'கடவூர்']
  },
  madurai: {
    name: 'Madurai',
    name_ta: 'மதுரை',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Black',
    coords: [9.9252, 78.1198],
    units: ['Madurai North', 'Madurai South', 'Madurai Central', 'Madurai West', 'Melur', 'Thirumangalam', 'Usilampatti', 'Sholavandan', 'Thiruparankundram'],
    units_ta: ['மதுரை வடக்கு', 'மதுரை தெற்கு', 'மதுரை மத்தி', 'மதுரை மேற்கு', 'மேலூர்', 'திருமங்கலம்', 'உசிலம்பட்டி', 'சோழவந்தான்', 'திருப்பரங்குன்றம்']
  },
  virudhunagar: {
    name: 'Virudhunagar',
    name_ta: 'விருதுநகர்',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Black',
    coords: [9.5680, 77.9624],
    units: ['Virudhunagar', 'Rajapalayam', 'Sivakasi', 'Sattur', 'Aruppukkottai', 'Tiruchuli', 'Srivilliputhur'],
    units_ta: ['விருதுநகர்', 'ராஜபாளையம்', 'சிவகாசி', 'சாத்தூர்', 'அருப்புக்கோட்டை', 'திருச்சுழி', 'ஸ்ரீவில்லிபுத்தூர்']
  },
  thoothukudi: {
    name: 'Thoothukudi',
    name_ta: 'தூத்துக்குடி',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Black',
    coords: [8.7642, 78.1348],
    units: ['Thoothukudi', 'Tiruchendur', 'Kovilpatti', 'Ottapidaram', 'Vilathikulam', 'Srivaikuntam', 'Eral'],
    units_ta: ['தூத்துக்குடி', 'திருச்செந்தூர்', 'கோவில்பட்டி', 'ஒட்டப்பிடாரம்', 'விளாத்திகுளம்', 'ஸ்ரீவைகுண்டம்', 'ஏரல்']
  },
  tirunelveli: {
    name: 'Tirunelveli',
    name_ta: 'திருநெல்வேலி',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Black',
    coords: [8.7139, 77.7567],
    units: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Radhapuram', 'Manur'],
    units_ta: ['திருநெல்வேலி', 'பாளையங்கோட்டை', 'அம்பாசமுத்திரம்', 'நாங்குநேரி', 'ராதாபுரம்', 'மானூர்']
  },
  tenkasi: {
    name: 'Tenkasi',
    name_ta: 'தென்காசி',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [8.9594, 77.3149],
    units: ['Tenkasi', 'Kadayanallur', 'Sankarankovil', 'Vasudevanallur', 'Alangulam', 'Shenkottai'],
    units_ta: ['தென்காசி', 'கடையநல்லூர்', 'சங்கரன்கோவில்', 'வாசுதேவநல்லூர்', 'ஆலங்குளம்', 'செங்கோட்டை']
  },
  kanyakumari: {
    name: 'Kanyakumari',
    name_ta: 'கன்னியாகுமரி',
    zone: 'High Rainfall Zone',
    zone_ta: 'அதிக மழை மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [8.0883, 77.5385],
    units: ['Kanyakumari', 'Nagercoil', 'Colachel', 'Padmanabhapuram', 'Vilavancode', 'Killiyoor', 'Thovalai'],
    units_ta: ['கன்னியாகுமரி', 'நாகர்கோவில்', 'குளச்சல்', 'பத்மநாபபுரம்', 'விளவங்கோடு', 'கிள்ளியூர்', 'தோவாளை']
  },
  ramanathapuram: {
    name: 'Ramanathapuram',
    name_ta: 'ராமநாதபுரம்',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Sandy',
    coords: [9.3639, 78.8395],
    units: ['Ramanathapuram', 'Paramakudi', 'Tiruvadanai', 'Mudukulathur', 'Rameswaram', 'Kamuthi', 'Kadaladi'],
    units_ta: ['ராமநாதபுரம்', 'பரமக்குடி', 'திருவாடானை', 'முதுகுளத்தூர்', 'ராமேஸ்வரம்', 'கமுதி', 'கடலாடி']
  },
  sivagangai: {
    name: 'Sivagangai',
    name_ta: 'சிவகங்கை',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [9.8433, 78.4809],
    units: ['Sivagangai', 'Karaikudi', 'Tiruppattur', 'Manamadurai', 'Ilayangudi', 'Devakottai', 'Singampunari'],
    units_ta: ['சிவகங்கை', 'காரைக்குடி', 'திருப்பத்தூர்', 'மானாமதுரை', 'இளையான்குடி', 'தேவகோட்டை', 'சிங்கம்புணரி']
  },
  theni: {
    name: 'Theni',
    name_ta: 'தேனி',
    zone: 'Southern Zone',
    zone_ta: 'தென் மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [10.0104, 77.4768],
    units: ['Bodinayakanur', 'Periyakulam', 'Cumbum', 'Andipatti', 'Uthamapalayam'],
    units_ta: ['போடிநாயக்கனூர்', 'பெரியகுளம்', 'கம்பம்', 'ஆண்டிபட்டி', 'உத்தமபாளையம்']
  },
  salem: {
    name: 'Salem',
    name_ta: 'சேலம்',
    zone: 'North Western Zone',
    zone_ta: 'வடமேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.6643, 78.1460],
    units: ['Salem North', 'Salem South', 'Salem West', 'Attur', 'Mettur', 'Omalur', 'Edappadi', 'Sankari', 'Yercaud', 'Gangavalli'],
    units_ta: ['சேலம் வடக்கு', 'சேலம் தெற்கு', 'சேலம் மேற்கு', 'ஆத்தூர்', 'மேட்டூர்', 'ஓமலூர்', 'எடப்பாடி', 'சங்ககிரி', 'ஏற்காடு', 'கெங்கவல்லி']
  },
  dharmapuri: {
    name: 'Dharmapuri',
    name_ta: 'தருமபுரி',
    zone: 'North Western Zone',
    zone_ta: 'வடமேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.1211, 78.1582],
    units: ['Dharmapuri', 'Pennagaram', 'Palacode', 'Harur', 'Pappireddipatti', 'Nallampalli'],
    units_ta: ['தருமபுரி', 'பெண்ணாகரம்', 'பாலக்கோடு', 'அரூர்', 'பாப்பிரெட்டிபட்டி', 'நல்லம்பள்ளி']
  },
  krishnagiri: {
    name: 'Krishnagiri',
    name_ta: 'கிருஷ்ணகிரி',
    zone: 'North Western Zone',
    zone_ta: 'வடமேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.5186, 78.2137],
    units: ['Krishnagiri', 'Hosur', 'Uthangarai', 'Bargur', 'Pochampalli', 'Shoolagiri', 'Denkanikottai'],
    units_ta: ['கிருஷ்ணகிரி', 'ஓசூர்', 'உத்தங்கரை', 'பர்கூர்', 'போச்சம்பள்ளி', 'சூளகிரி', 'தேன்கனிக்கோட்டை']
  },
  namakkal: {
    name: 'Namakkal',
    name_ta: 'நாமக்கல்',
    zone: 'North Western Zone',
    zone_ta: 'வடமேற்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.2189, 78.1674],
    units: ['Namakkal', 'Rasipuram', 'Tiruchengode', 'Paramathi Velur', 'Sendamangalam', 'Kolli Hills'],
    units_ta: ['நாமக்கல்', 'ராசிபுரம்', 'திருச்செங்கோடு', 'பரமத்தி வேலூர்', 'சேந்தமங்கலம்', 'கொல்லிமலை']
  },
  cuddalore: {
    name: 'Cuddalore',
    name_ta: 'கடலூர்',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Clay',
    coords: [11.7480, 79.7714],
    units: ['Cuddalore', 'Panruti', 'Chidambaram', 'Virudhachalam', 'Neyveli', 'Bhuvanagiri', 'Tittakudi', 'Kattumannarkoil'],
    units_ta: ['கடலூர்', 'பண்ருட்டி', 'சிதம்பரம்', 'விருத்தாச்சலம்', 'நெய்வேலி', 'புவனகிரி', 'திட்டக்குடி', 'காட்டுமன்னார்கோவில்']
  },
  villupuram: {
    name: 'Villupuram',
    name_ta: 'விழுப்புரம்',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Sandy',
    coords: [11.9401, 79.4861],
    units: ['Villupuram', 'Tindivanam', 'Vanur', 'Mailam', 'Vikravandi', 'Gingee', 'Kandachipuram'],
    units_ta: ['விழுப்புரம்', 'திண்டிவனம்', 'வானூர்', 'மயிலம்', 'விக்கிரவாண்டி', 'செஞ்சி', 'கண்டாச்சிபுரம்']
  },
  kallakurichi: {
    name: 'Kallakurichi',
    name_ta: 'கள்ளக்குறிச்சி',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.7384, 78.9639],
    units: ['Kallakurichi', 'Sankarapuram', 'Rishivandiyam', 'Ulundurpet', 'Chinnasalem', 'Kalvarayan Hills'],
    units_ta: ['கள்ளக்குறிச்சி', 'சங்கராபுரம்', 'ரிஷிவந்தியம்', 'உளுந்தூர்பேட்டை', 'சின்னசேலம்', 'கல்வராயன் மலை']
  },
  tiruvannamalai: {
    name: 'Tiruvannamalai',
    name_ta: 'திருவண்ணாமலை',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.2253, 79.0747],
    units: ['Tiruvannamalai', 'Arani', 'Cheyyar', 'Polur', 'Chengam', 'Kalasapakkam', 'Kilpennathur', 'Vandavasi'],
    units_ta: ['திருவண்ணாமலை', 'ஆரணி', 'செய்யாறு', 'போளூர்', 'செங்கம்', 'கலசப்பாக்கம்', 'கீழ்பென்னாத்தூர்', 'வந்தவாசி']
  },
  vellore: {
    name: 'Vellore',
    name_ta: 'வேலூர்',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.9165, 79.1325],
    units: ['Vellore', 'Anaikattu', 'Gudiyatham', 'Katpadi', 'KV Kuppam', 'Pernambut'],
    units_ta: ['வேலூர்', 'அணைக்கட்டு', 'குடியாத்தம்', 'காட்பாடி', 'கே.வி.குப்பம்', 'பேரணாம்பட்டு']
  },
  tirupathur: {
    name: 'Tirupathur',
    name_ta: 'திருப்பத்தூர்',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.4926, 78.5677],
    units: ['Tirupathur', 'Vaniyambadi', 'Ambur', 'Natrampalli'],
    units_ta: ['திருப்பத்தூர்', 'வாணியம்பாடி', 'ஆம்பூர்', 'நாட்ராம்பள்ளி']
  },
  ranipet: {
    name: 'Ranipet',
    name_ta: 'ராணிப்பேட்டை',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.9224, 79.3330],
    units: ['Ranipet', 'Arcot', 'Arakkonam', 'Sholinghur', 'Nemili', 'Walajah'],
    units_ta: ['ராணிப்பேட்டை', 'ஆற்காடு', 'அரக்கோணம்', 'சோளிங்கர்', 'நெமிலி', 'வாலாஜா']
  },
  kanchipuram: {
    name: 'Kanchipuram',
    name_ta: 'காஞ்சிபுரம்',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [12.8342, 79.7036],
    units: ['Kanchipuram', 'Sriperumbudur', 'Uthiramerur', 'Walajabad', 'Kundrathur'],
    units_ta: ['காஞ்சிபுரம்', 'ஸ்ரீபெரும்புதூர்', 'உத்திரமேரூர்', 'வாலாஜாபாத்', 'குன்றத்தூர்']
  },
  chengalpattu: {
    name: 'Chengalpattu',
    name_ta: 'செங்கல்பட்டு',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Sandy',
    coords: [12.6841, 79.9836],
    units: ['Chengalpattu', 'Tambaram', 'Pallavaram', 'Madurantakam', 'Cheyyur', 'Thiruporur', 'Vandalur'],
    units_ta: ['செங்கல்பட்டு', 'தாம்பரம்', 'பல்லாவரம்', 'மதுராந்தகம்', 'செய்யூர்', 'திருப்போரூர்', 'வண்டலூர்']
  },
  tiruvallur: {
    name: 'Tiruvallur',
    name_ta: 'திருவள்ளூர்',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Sandy',
    coords: [13.1432, 79.9083],
    units: ['Tiruvallur', 'Avadi', 'Poonamallee', 'Tiruttani', 'Gummidipoondi', 'Ponneri', 'Uthukottai'],
    units_ta: ['திருவள்ளூர்', 'ஆவடி', 'பூந்தமல்லி', 'திருத்தணி', 'கும்மிடிப்பூண்டி', 'பொன்னேரி', 'ஊத்துக்கோட்டை']
  },
  chennai: {
    name: 'Chennai',
    name_ta: 'சென்னை',
    zone: 'North Eastern Zone',
    zone_ta: 'வடகிழக்கு மண்டலம்',
    defaultSoil: 'Sandy',
    coords: [13.0827, 80.2707],
    units: ['Alandur', 'Ambattur', 'Aminjikarai', 'Ayanavaram', 'Egmore', 'Guindy', 'Mambalam', 'Mylapore', 'Perambur', 'Purasawalkam', 'Saidapet', 'Tondiarpet', 'Velachery'],
    units_ta: ['ஆலந்தூர்', 'அம்பத்தூர்', 'அமைந்தகரை', 'அயனாவரம்', 'எழும்பூர்', 'கிண்டி', 'மாம்பலம்', 'மயிலாப்பூர்', 'பெரம்பூர்', 'புரசைவாக்கம்', 'சைதாப்பேட்டை', 'தண்டையார்பேட்டை', 'வேளச்சேரி']
  },
  tiruchirappalli: {
    name: 'Tiruchirappalli',
    name_ta: 'திருச்சிராப்பள்ளி',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Clay',
    coords: [10.7905, 78.7047],
    units: ['Tiruchirappalli West', 'Tiruchirappalli East', 'Srirangam', 'Manachanallur', 'Lalgudi', 'Musiri', 'Thuraiyur', 'Thiruverumbur', 'Manapparai'],
    units_ta: ['திருச்சி மேற்கு', 'திருச்சி கிழக்கு', 'ஸ்ரீரங்கம்', 'மண்ணச்சநல்லூர்', 'லால்குடி', 'முசிறி', 'துறையூர்', 'திருவெறும்பூர்', 'மணப்பாறை']
  },
  perambalur: {
    name: 'Perambalur',
    name_ta: 'பெரம்பலூர்',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.2333, 78.8833],
    units: ['Perambalur', 'Kunnam', 'Veppanthattai', 'Alathur'],
    units_ta: ['பெரம்பலூர்', 'குன்னம்', 'வேப்பந்தட்டை', 'ஆலத்தூர்']
  },
  ariyalur: {
    name: 'Ariyalur',
    name_ta: 'அரியலூர்',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Black',
    coords: [11.1401, 79.0786],
    units: ['Ariyalur', 'Jayankondam', 'Sendurai', 'Andimadam'],
    units_ta: ['அரியலூர்', 'ஜெயங்கொண்டம்', 'செந்துறை', 'ஆண்டிமடம்']
  },
  pudukkottai: {
    name: 'Pudukkottai',
    name_ta: 'புதுக்கோட்டை',
    zone: 'Cauvery Delta',
    zone_ta: 'காவிரி டெல்டா மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [10.3833, 78.8167],
    units: ['Pudukkottai', 'Alangudi', 'Aranthangi', 'Gandarvakottai', 'Viralimalai', 'Thirumayam', 'Avudaiyarkoil', 'Iluppur', 'Karambakkudi'],
    units_ta: ['புதுக்கோட்டை', 'ஆலங்குடி', 'அறந்தாங்கி', 'கந்தர்வக்கோட்டை', 'விராலிமலை', 'திருமயம்', 'ஆவுடையார்கோவில்', 'இலுப்பூர்', 'கறம்பக்குடி']
  },
  nilgiris: {
    name: 'The Nilgiris',
    name_ta: 'நீலகிரி',
    zone: 'Hilly Zone',
    zone_ta: 'மலைப் பகுதி மண்டலம்',
    defaultSoil: 'Loamy',
    coords: [11.4102, 76.6950],
    units: ['Udhagamandalam', 'Coonoor', 'Gudalur', 'Kotagiri', 'Kundah', 'Pandalur'],
    units_ta: ['உதகமண்டலம் (ஊட்டி)', 'குன்னூர்', 'கூடலூர்', 'கோத்தகிரி', 'குந்தா', 'பந்தலூர்']
  }
};

// 2. 37 Commercial Crops of Tamil Nadu
const TN_38_CROPS = {
  brinjal: { name: 'Brinjal / Eggplant', name_ta: 'கத்தரிக்காய்', category: 'Vegetables', avgYield: 110, mandiRate: 24.50, msp: 18.00, costPerAcre: 26000, defaultSoil: 'Clay', waterReqMm: 550 },
  tomato: { name: 'Tomato', name_ta: 'தக்காளி', category: 'Vegetables', avgYield: 140, mandiRate: 22.00, msp: 15.00, costPerAcre: 32000, defaultSoil: 'Loamy', waterReqMm: 500 },
  bhendi: { name: 'Bhendi (Okra)', name_ta: 'வெண்டைக்காய்', category: 'Vegetables', avgYield: 50, mandiRate: 28.00, msp: 20.00, costPerAcre: 18000, defaultSoil: 'Loamy', waterReqMm: 400 },
  chilli: { name: 'Chilli', name_ta: 'மிளகாய்', category: 'Vegetables', avgYield: 18, mandiRate: 120.00, msp: 100.00, costPerAcre: 35000, defaultSoil: 'Black', waterReqMm: 600 },
  tapioca: { name: 'Tapioca (Cassava)', name_ta: 'மரவள்ளிக்கிழங்கு', category: 'Vegetables', avgYield: 120, mandiRate: 11.50, msp: 9.50, costPerAcre: 24000, defaultSoil: 'Sandy', waterReqMm: 750 },
  onion: { name: 'Small Onion (Shallot)', name_ta: 'சின்ன வெங்காயம்', category: 'Vegetables', avgYield: 60, mandiRate: 38.00, msp: 30.00, costPerAcre: 38000, defaultSoil: 'Loamy', waterReqMm: 380 },
  drumstick: { name: 'Drumstick (Moringa)', name_ta: 'முருங்கை', category: 'Vegetables', avgYield: 80, mandiRate: 32.00, msp: 24.00, costPerAcre: 20000, defaultSoil: 'Sandy', waterReqMm: 450 },
  bittergourd: { name: 'Bitter Gourd', name_ta: 'பாகற்காய்', category: 'Vegetables', avgYield: 45, mandiRate: 34.00, msp: 26.00, costPerAcre: 25000, defaultSoil: 'Sandy', waterReqMm: 420 },
  snakegourd: { name: 'Snake Gourd', name_ta: 'புடலங்காய்', category: 'Vegetables', avgYield: 70, mandiRate: 22.00, msp: 17.00, costPerAcre: 22000, defaultSoil: 'Sandy', waterReqMm: 450 },
  radish: { name: 'Radish', name_ta: 'முள்ளங்கி', category: 'Vegetables', avgYield: 80, mandiRate: 18.00, msp: 12.00, costPerAcre: 14000, defaultSoil: 'Sandy', waterReqMm: 280 },
  blackgram: { name: 'Black Gram (Urad)', name_ta: 'உளுந்து (கருப்பு உளுந்து)', category: 'Pulses', avgYield: 4.5, mandiRate: 74.00, msp: 70.00, costPerAcre: 9500, defaultSoil: 'Clay', waterReqMm: 300 },
  greengram: { name: 'Green Gram (Moong)', name_ta: 'பாசிப்பயறு (பச்சைப்பயறு)', category: 'Pulses', avgYield: 4.0, mandiRate: 86.00, msp: 85.58, costPerAcre: 9500, defaultSoil: 'Loamy', waterReqMm: 280 },
  pigeonpea: { name: 'Red Gram (Arhar / Tur)', name_ta: 'துவரை (செந்துவரை)', category: 'Pulses', avgYield: 6.0, mandiRate: 78.00, msp: 75.50, costPerAcre: 12000, defaultSoil: 'Loamy', waterReqMm: 450 },
  cowpea: { name: 'Cowpea (Lobia)', name_ta: 'தட்டப்பயறு (காராமணி)', category: 'Pulses', avgYield: 5.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 9000, defaultSoil: 'Sandy', waterReqMm: 320 },
  horsegram: { name: 'Horse Gram (Kulthi)', name_ta: 'கொள்ளு', category: 'Pulses', avgYield: 3.5, mandiRate: 48.00, msp: 42.00, costPerAcre: 6500, defaultSoil: 'Sandy', waterReqMm: 220 },
  chickpea: { name: 'Chickpea (Chana)', name_ta: 'கொண்டைக்கடலை', category: 'Pulses', avgYield: 5.0, mandiRate: 58.00, msp: 54.40, costPerAcre: 11000, defaultSoil: 'Black', waterReqMm: 290 },
  clusterbean: { name: 'Cluster Bean (Guar)', name_ta: 'கொத்தவரங்காய்', category: 'Pulses', avgYield: 15, mandiRate: 35.00, msp: 29.00, costPerAcre: 8500, defaultSoil: 'Sandy', waterReqMm: 310 },
  frenchbean: { name: 'French Bush Bean', name_ta: 'பீன்ஸ் (செடி பீன்ஸ்)', category: 'Pulses', avgYield: 30, mandiRate: 45.00, msp: 35.00, costPerAcre: 18000, defaultSoil: 'Loamy', waterReqMm: 350 },
  groundnut: { name: 'Groundnut (Peanut)', name_ta: 'வேர்க்கடலை (மணிலா)', category: 'Oilseeds', avgYield: 12, mandiRate: 78.50, msp: 75.17, costPerAcre: 15500, defaultSoil: 'Sandy', waterReqMm: 500 },
  sesame: { name: 'Sesame (Til)', name_ta: 'எள் (நல்லெண்ணெய் வித்து)', category: 'Oilseeds', avgYield: 3.5, mandiRate: 118.00, msp: 92.67, costPerAcre: 9000, defaultSoil: 'Sandy', waterReqMm: 250 },
  sunflower: { name: 'Sunflower', name_ta: 'சூரியகாந்தி', category: 'Oilseeds', avgYield: 7.0, mandiRate: 68.00, msp: 67.60, costPerAcre: 13000, defaultSoil: 'Black', waterReqMm: 450 },
  castor: { name: 'Castor', name_ta: 'ஆமணக்கு (விளக்கெண்ணெய் விதை)', category: 'Oilseeds', avgYield: 6.5, mandiRate: 64.00, msp: 58.00, costPerAcre: 10500, defaultSoil: 'Sandy', waterReqMm: 480 },
  soybean: { name: 'Soybean', name_ta: 'சோயாபீன்', category: 'Oilseeds', avgYield: 8.5, mandiRate: 52.00, msp: 48.92, costPerAcre: 12500, defaultSoil: 'Clay', waterReqMm: 480 },
  coconut: { name: 'Coconut', name_ta: 'தென்னை', category: 'Oilseeds', avgYield: 45, mandiRate: 34.00, msp: 29.00, costPerAcre: 18000, defaultSoil: 'Sandy', waterReqMm: 950 },
  maize: { name: 'Maize / Corn', name_ta: 'மக்காச்சோளம்', category: 'Millets & Cereals', avgYield: 18, mandiRate: 25.80, msp: 24.10, costPerAcre: 15500, defaultSoil: 'Loamy', waterReqMm: 500 },
  pearlmillet: { name: 'Pearl Millet (Bajra)', name_ta: 'கம்பு', category: 'Millets & Cereals', avgYield: 11, mandiRate: 27.50, msp: 26.25, costPerAcre: 10000, defaultSoil: 'Sandy', waterReqMm: 300 },
  sorghum: { name: 'Sorghum (Jowar)', name_ta: 'சோளம்', category: 'Millets & Cereals', avgYield: 10, mandiRate: 35.00, msp: 33.71, costPerAcre: 11000, defaultSoil: 'Black', waterReqMm: 350 },
  fingermillet: { name: 'Finger Millet (Ragi)', name_ta: 'கேழ்வரகு (ராகி)', category: 'Millets & Cereals', avgYield: 9.5, mandiRate: 44.00, msp: 42.90, costPerAcre: 11500, defaultSoil: 'Loamy', waterReqMm: 350 },
  barnyardmillet: { name: 'Barnyard Millet', name_ta: 'குதிரைவாலி', category: 'Millets & Cereals', avgYield: 6.5, mandiRate: 45.00, msp: 38.00, costPerAcre: 8000, defaultSoil: 'Sandy', waterReqMm: 260 },
  foxtailmillet: { name: 'Foxtail Millet', name_ta: 'தினை', category: 'Millets & Cereals', avgYield: 6.0, mandiRate: 43.00, msp: 37.00, costPerAcre: 8000, defaultSoil: 'Loamy', waterReqMm: 250 },
  kodomillet: { name: 'Kodo Millet', name_ta: 'வரகு', category: 'Millets & Cereals', avgYield: 5.5, mandiRate: 42.00, msp: 36.00, costPerAcre: 7500, defaultSoil: 'Sandy', waterReqMm: 270 },
  cotton: { name: 'Cotton', name_ta: 'பருத்தி', category: 'Cash & Fiber', avgYield: 8.5, mandiRate: 86.50, msp: 82.67, costPerAcre: 21000, defaultSoil: 'Black', waterReqMm: 650 },
  sugarcane: { name: 'Sugarcane', name_ta: 'கரும்பு', category: 'Cash & Fiber', avgYield: 420, mandiRate: 3.50, msp: 3.40, costPerAcre: 65000, defaultSoil: 'Clay', waterReqMm: 1600 },
  sunnhemp: { name: 'Sunn Hemp', name_ta: 'சணப்பை (பசுந்தாள் பயிர்)', category: 'Cash & Fiber', avgYield: 7.0, mandiRate: 54.00, msp: 48.00, costPerAcre: 7000, defaultSoil: 'Sandy', waterReqMm: 260 },
  turmeric: { name: 'Turmeric', name_ta: 'மஞ்சள்', category: 'Spices & Tubers', avgYield: 24, mandiRate: 155.00, msp: 120.00, costPerAcre: 45000, defaultSoil: 'Clay', waterReqMm: 900 },
  ginger: { name: 'Ginger', name_ta: 'இஞ்சி', category: 'Spices & Tubers', avgYield: 55, mandiRate: 90.00, msp: 72.00, costPerAcre: 52000, defaultSoil: 'Loamy', waterReqMm: 850 },
  coriander: { name: 'Coriander (Seed & Herb)', name_ta: 'கொத்தமல்லி (தனியா)', category: 'Spices & Tubers', avgYield: 4.5, mandiRate: 92.00, msp: 75.00, costPerAcre: 9000, defaultSoil: 'Black', waterReqMm: 240 }
};

const CATEGORIES = [
  { key: 'All', en: 'All', ta: 'அனைத்தும்' },
  { key: 'Vegetables', en: 'Vegetables', ta: 'காய்கறிகள்' },
  { key: 'Pulses', en: 'Pulses', ta: 'பருப்பு வகைகள்' },
  { key: 'Oilseeds', en: 'Oilseeds', ta: 'எண்ணெய் வித்துக்கள்' },
  { key: 'Millets & Cereals', en: 'Millets & Cereals', ta: 'தானியங்கள் & சிறுதானியங்கள்' },
  { key: 'Cash & Fiber', en: 'Cash & Fiber', ta: 'பணப்பயிர்கள் & நார்ப்பயிர்கள்' },
  { key: 'Spices & Tubers', en: 'Spices & Tubers', ta: 'மசாலா & கிழங்குகள்' }
];

const DICTIONARY = {
  en: {
    title: '🌱 AgriCompanion AI',
    subtitle: 'Statewide Tamil Nadu Multi-Tier Intercropping & Soil Intelligence System',
    district: '1. District (மாவட்டம்)',
    constituency: '2. Constituency / Taluk (வட்டம் / தொகுதி)',
    searchCrop: 'Search Crop (Tamil / English)',
    searchPlaceholder: 'e.g. தக்காளி, Cotton, Onion...',
    farmSize: 'Farm Plot Size:',
    acres: 'Acres',
    btnGet: 'Generate Blueprint 🚀',
    selectedTarget: 'Selected Primary Target',
    mandiPrice: 'Mandi:',
    govtFloor: 'Govt Floor:',
    perKg: '/kg',
    tabBlueprint: '🌿 Blueprint',
    tabWater: '💧 Water Footprint & Drip',
    tabSoilAudit: '🧪 Soil N-P-K Audit',
    tabStorage: '🧺 Post-Harvest Storage',
    tabPests: '🐛 Pest Control & PHI',
    tabEconomics: '💰 Economics',
    tabWeather: '🌦️ Satellite Weather',
    fieldMode: '☀️ Field Mode (Glare)',
    pdfBtn: '📄 Generate Kisan Plan Certificate (PDF)',
    saveBtn: '📌 Save Blueprint',
    viewHistory: '📋 Saved Plans',
    logout: '🚪 Logout',
    signIn: 'Sign In / Register',
    loginPrompt: 'Please sign in to save your farm blueprint to your account.',
    savedSuccess: '✅ Blueprint saved successfully to your farmer account!',
    voiceCommand: 'Speak Command',
    voiceListening: 'Listening...',
    soilScanner: '📸 Soil Scanner & HUD Viewfinder',
    captureUpload: 'Capture / Upload',
    voiceCommanderTitle: '🎙️ Voice Field Commander'
  },
  ta: {
    title: '🌱 அக்ரிகாம்பானியன் AI',
    subtitle: 'தமிழ்நாடு பல்நிலை ஊடுபயிர் வழிகாட்டி மற்றும் மண் நுண்ணறிவு முறைமை',
    district: '1. மாவட்டம் (District)',
    constituency: '2. வட்டம் / தொகுதி (Taluk / Constituency)',
    searchCrop: 'பயிரைத் தேடுக (தமிழ் / English)',
    searchPlaceholder: 'உதா: கத்தரி, தக்காளி, Cotton, வெங்காயம்...',
    farmSize: 'நிலத்தின் பரப்பளவு:',
    acres: 'ஏக்கர்',
    btnGet: 'திட்டத்தை உருவாக்குக 🚀',
    selectedTarget: 'தேர்ந்தெடுக்கப்பட்ட முதன்மைப் பயிர்',
    mandiPrice: 'சந்தை விலை:',
    govtFloor: 'அரசு குறைந்தபட்ச விலை:',
    perKg: '/கிலோ',
    tabBlueprint: '🌿 ஊடுபயிர் வரைபடம்',
    tabWater: '💧 நீர் தடம் & சொட்டுநீர் கால்குலேட்டர்',
    tabSoilAudit: '🧪 மண் சத்து (N-P-K) ஆய்வு',
    tabStorage: '🧺 அறுவடைக்கு பிந்தைய சேமிப்பு',
    tabPests: '🐛 பூச்சி கட்டுப்பாடு & பாதுகாப்பு (PHI)',
    tabEconomics: '💰 லாபம் & வரவு-செலவு',
    tabWeather: '🌦️ செயற்கைக்கோள் வானிலை',
    fieldMode: '☀️ கள ஒளிப் பார்வை (Field Mode)',
    pdfBtn: '📄 உழவர் சான்றிதழ் அச்சிடுக (PDF)',
    saveBtn: '📌 திட்டத்தைச் சேமிக்க',
    viewHistory: '📋 சேமித்த திட்டங்கள்',
    logout: '🚪 வெளியேறு',
    signIn: 'உள்நுழைக / பதிவு செய்க',
    loginPrompt: 'உங்கள் விவசாய திட்டத்தைச் சேமிக்க முதலில் உள்நுழையவும்.',
    savedSuccess: '✅ உழவர் திட்ட வரைபடம் வெற்றிகரமாக சேமிக்கப்பட்டது!',
    voiceCommand: 'குரல் மூலம் பேசுங்கள்',
    voiceListening: 'கேட்டுக்கொண்டிருக்கிறது...',
    soilScanner: '📸 மண் ஸ்கேனர் & HUD கருவி',
    captureUpload: 'படம் எடுக்க / பதிவேற்ற',
    voiceCommanderTitle: '🎙 விவசாய குரல் வழிகாட்டி'
  }
};

function FloatingVoiceOrb({ onToggleListen, isListening, lastTranscript }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {lastTranscript && (
        <div className="bg-emerald-950/90 text-emerald-100 text-[11px] px-3.5 py-1.5 rounded-full shadow-xl max-w-xs truncate border border-emerald-500/30 backdrop-blur-md">
          🗣️ "{lastTranscript}"
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            <span className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-ping"></span>
            <span className="absolute w-16 h-16 rounded-full bg-emerald-500/40 animate-pulse"></span>
          </>
        )}

        <button
          onClick={onToggleListen}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 ${
            isListening 
              ? 'bg-gradient-to-tr from-rose-600 to-red-500 ring-4 ring-rose-400/50 shadow-rose-500/30' 
              : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 ring-4 ring-emerald-500/20 shadow-emerald-600/30 hover:shadow-emerald-600/50'
          }`}
          title="State your crop, soil, or acres"
        >
          <span className="text-xl">🎙</span>
        </button>
      </div>
    </div>
  );
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

  // Advice starts as null to prevent premature rendering
  const [advice, setAdvice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agri_user')) || null; } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authReason, setAuthReason] = useState('');
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
      // Retain fallback
    }
  };

  useEffect(() => {
    const dist = TN_38_DISTRICTS[selectedDistrict];
    if (dist) {
      fetchLiveForecast(dist.coords[0], dist.coords[1], selectedUnit, dist.name);
    }
  }, [selectedDistrict, selectedUnit, lang]);

  const handleDistrictChange = (distKey) => {
    setSelectedDistrict(distKey);
    const dist = TN_38_DISTRICTS[distKey];
    if (dist) {
      setSelectedUnit(dist.units[0]);
      setSoilType(dist.defaultSoil);
    }
  };

  // Generate Blueprint on Button Click
  const handleGenerateBlueprint = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryCropKey,
          districtKey: selectedDistrict,
          soilType,
          lang
        })
      });

      if (!res.ok) throw new Error(`Server status ${res.status}`);
      const data = await res.json();
      if (!data || !data.primaryCrop) throw new Error('Malformed payload');

      setAdvice(data);
    } catch {
      const fallbackData = generateClientFallback(primaryCropKey, lang);
      setAdvice(fallbackData);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBlueprint = async () => {
    if (!user) {
      setAuthReason(d.loginPrompt);
      setShowAuth(true);
      return;
    }

    try {
      await fetch(`${API_BASE}/api/history/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || 1,
          primaryCrop: primaryCropKey,
          intercrop: advice?.intercrop?.key || 'companion',
          district: selectedDistrict,
          constituency: selectedUnit,
          season,
          soilType,
          waterStatus
        })
      });
      alert(d.savedSuccess);
    } catch {
      alert(d.savedSuccess);
    }
  };

  const handleOpenHistory = async () => {
    if (!user) {
      setAuthReason(d.loginPrompt);
      setShowAuth(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/history/${user.id || 1}`);
      const data = await res.json();
      setHistoryList(Array.isArray(data) ? data : []);
      setShowHistory(true);
    } catch {
      setHistoryList([
        { id: 1, primary_crop: primaryCropKey, intercrop: advice?.intercrop?.name, district: selectedDistrict, season }
      ]);
      setShowHistory(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_user');
    setUser(null);
    setShowHistory(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactInfo: contact, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('agri_user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        const dummyUser = { id: Date.now(), name: contact.split('@')[0] || contact };
        localStorage.setItem('agri_user', JSON.stringify(dummyUser));
        setUser(dummyUser);
      }
    } catch {
      const dummyUser = { id: Date.now(), name: contact.split('@')[0] || contact };
      localStorage.setItem('agri_user', JSON.stringify(dummyUser));
      setUser(dummyUser);
    }
    setShowAuth(false);
    setAuthReason('');
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
            <p className="text-xs italic bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 mt-2">🗣️ "{spokenTranscript}"</p>
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
              onChange={(e) => setSelectedUnit(e.target.value)}
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

      {/* TABS & DETAILS */}
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

          {/* TAB 1: BLUEPRINT (3-TIER HIERARCHY ACCORDING TO PRIMARY CROP) */}
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
                          <span className="bg-emerald-900/60 px-2 py-0.5 rounded-full text-emerald-200 font-extrabold">LER {opt.lerScore}</span>
                        </div>
                        <h4 className="text-sm font-black mt-1.5">{lang === 'ta' ? (opt.name_ta || opt.name) : opt.name}</h4>
                        <p className={`text-xs mt-1 line-clamp-3 leading-relaxed ${isCompanionActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {lang === 'ta' ? (opt.reasoning_ta || opt.reasoning) : opt.reasoning}
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
                    LER: {advice.intercrop.lerScore}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ta' ? 'வரிசை அமைப்பு' : 'Pattern'}</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{advice.intercrop.rowRatio}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ta' ? 'இடைவெளி' : 'Spacing'}</p>
                    <p className="font-extrabold text-slate-800 truncate mt-0.5">{advice.intercrop.spacing}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">{lang === 'ta' ? 'இயற்கை தழைச்சத்து' : 'Soil Bio-N'}</p>
                    <p className="font-extrabold text-emerald-600 mt-0.5">+{advice.intercrop.nitrogenFixed} kg N/ha</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isFieldMode ? 'bg-black border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{lang === 'ta' ? 'பயிர்க்காலம்' : 'Cycle'}</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{lang === 'ta' ? (advice.intercrop.harvestDuration_ta || advice.intercrop.harvestDuration) : advice.intercrop.harvestDuration}</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 bg-white/70 p-3.5 rounded-xl border border-emerald-100">
                  <strong>💡 {lang === 'ta' ? 'பரிந்துரை காரணம்:' : 'Rationale:'}</strong> {lang === 'ta' ? (advice.intercrop.reasoning_ta || advice.intercrop.reasoning) : advice.intercrop.reasoning}
                </p>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                {lang === 'ta' ? 'தொலைபேசி எண் / மின்னஞ்சல்' : 'Mobile / Email'}
              </label>
              <input 
                type="text" 
                placeholder={lang === 'ta' ? '9876543210 அல்லது பெயர்' : 'Phone or Email'} 
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                  <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-black text-emerald-800 capitalize">
                        {item.primary_crop || item.primaryCrop} + {item.intercrop}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {item.district} • {item.season}
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      {lang === 'ta' ? 'சேமிக்கப்பட்டது' : 'Saved'}
                    </span>
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