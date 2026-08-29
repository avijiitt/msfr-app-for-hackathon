export interface IndiaLocationResult {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  type: 'station' | 'landmark' | 'metro' | 'airport' | 'university' | 'hospital' | 'custom';
  formattedAddress: string;
}

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || '63CtJZBj4maPgvCCiDSXxavc6jkxztXfRTEpwPYj';

const isOlaMapsConfigured = (): boolean =>
  Boolean(OLA_MAPS_API_KEY) && OLA_MAPS_API_KEY.length > 5 && !OLA_MAPS_API_KEY.includes('your-ola');

// ── Popular India locations for instant autocomplete (offline & instant lookup) ─────────
export const POPULAR_INDIAN_LOCATIONS: IndiaLocationResult[] = [
  // Bhubaneswar & Odisha (Institutes, Colleges, Hospitals, Apartments & Transit Hubs)
  { id: 'bbs-royal-lagoon', name: 'Royal Lagoon Apartments, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3695, lng: 85.8210, type: 'landmark', formattedAddress: 'Nandankanan Road, Raghunathpur, Bhubaneswar, Odisha' },
  { id: 'bbs-mani-tribhuvan', name: 'Mani Tribhuvan Apartments, Patia', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3640, lng: 85.8215, type: 'landmark', formattedAddress: 'Nandankanan Road, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-raghunathpur', name: 'Raghunathpur / Raghunathpur Village', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3720, lng: 85.8230, type: 'landmark', formattedAddress: 'Raghunathpur, Nandankanan Road, Bhubaneswar, Odisha' },
  { id: 'bbs-nandan-vihar', name: 'Nandan Vihar / Sishupal', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3620, lng: 85.8200, type: 'landmark', formattedAddress: 'Nandan Vihar, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-sikharchandi', name: 'Sikharchandi Temple & Vihar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3600, lng: 85.8150, type: 'landmark', formattedAddress: 'Sikharchandi Hills, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-trident', name: 'Trident College / Trident Academy of Creative Technology', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3582, lng: 85.8086, type: 'university', formattedAddress: 'Near Infocity Square, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-kiit', name: 'KIIT Square, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3541, lng: 85.8175, type: 'university', formattedAddress: 'KIIT Square, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-kims', name: 'KIMS Hospital & Medical College', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3560, lng: 85.8140, type: 'hospital', formattedAddress: 'KIMS Hospital Road, KIIT Campus, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-iter', name: 'ITER / SOA University (Siksha \'O\' Anusandhan)', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2505, lng: 85.7972, type: 'university', formattedAddress: 'Jagamara, Khandagiri, Bhubaneswar, Odisha' },
  { id: 'bbs-silicon', name: 'Silicon University / SiliconTech', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3533, lng: 85.8055, type: 'university', formattedAddress: 'Silicon Hills, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-cvrce', name: 'C.V. Raman Global University (CVRCE)', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2198, lng: 85.7363, type: 'university', formattedAddress: 'Bidyanagar, Mahura, Janla, Bhubaneswar, Odisha' },
  { id: 'bbs-outr', name: 'OUTR / CET Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2764, lng: 85.7725, type: 'university', formattedAddress: 'Techno Campus, Ghatikia, Kalinga Nagar, Bhubaneswar, Odisha' },
  { id: 'bbs-jayadev', name: 'Jayadev Vihar, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3039, lng: 85.8188, type: 'landmark', formattedAddress: 'Jayadev Vihar Square, NH16, Bhubaneswar, Odisha' },
  { id: 'bbs-master-canteen', name: 'Master Canteen, Bhubaneswar Railway Station', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2668, lng: 85.8436, type: 'station', formattedAddress: 'Master Canteen Station Plaza, Bhubaneswar, Odisha' },
  { id: 'bbs-baramunda', name: 'Baramunda ISBT Bus Terminal (Babasaheb Ambedkar Bus Terminal)', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2818, lng: 85.7938, type: 'station', formattedAddress: 'ISBT Baramunda, NH16, Bhubaneswar, Odisha' },
  { id: 'bbs-patia', name: 'Patia Square / Patia Station', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3567, lng: 85.8166, type: 'station', formattedAddress: 'Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-damana', name: 'Damana Square / Chandrasekharpur', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3341, lng: 85.8202, type: 'landmark', formattedAddress: 'Damana Chhak, CSPUR, Bhubaneswar, Odisha' },
  { id: 'bbs-sailashree', name: 'Sailashree Vihar / Phase 2 & 6', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3380, lng: 85.8150, type: 'landmark', formattedAddress: 'Sailashree Vihar, Chandrasekharpur, Bhubaneswar, Odisha' },
  { id: 'bbs-khandagiri', name: 'Khandagiri & Udayagiri Caves Square', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2605, lng: 85.7865, type: 'landmark', formattedAddress: 'Khandagiri Square, NH16, Bhubaneswar, Odisha' },
  { id: 'bbs-rasulgarh', name: 'Rasulgarh Square / Cuttack Road', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2982, lng: 85.8643, type: 'landmark', formattedAddress: 'Rasulgarh Flyover, NH16, Bhubaneswar, Odisha' },
  { id: 'bbs-vanivihar', name: 'Vani Vihar Square / Utkal University', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2974, lng: 85.8475, type: 'university', formattedAddress: 'Utkal University, Vani Vihar, Bhubaneswar, Odisha' },
  { id: 'bbs-kalpana', name: 'Kalpana Square / BJB College / State Museum', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2570, lng: 85.8420, type: 'landmark', formattedAddress: 'Kalpana Chhak, Puri-Cuttack Road, Bhubaneswar, Odisha' },
  { id: 'bbs-airport', name: 'Biju Patnaik International Airport (BBI)', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2524, lng: 85.8178, type: 'airport', formattedAddress: 'Airport Road, Bhubaneswar, Odisha' },
  { id: 'bbs-aiims', name: 'AIIMS Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2312, lng: 85.7761, type: 'hospital', formattedAddress: 'Sijua, Patrapada, Bhubaneswar, Odisha' },
  { id: 'bbs-infocity', name: 'Infocity IT Park & DLF Cybercity', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3602, lng: 85.8035, type: 'landmark', formattedAddress: 'Infocity Road, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-utkal-hosp', name: 'Utkal Hospital, Niladri Vihar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3448, lng: 85.8062, type: 'hospital', formattedAddress: 'Niladri Vihar, Chandrasekharpur, Bhubaneswar, Odisha' },
  { id: 'bbs-care-hosp', name: 'CARE Hospitals / Chandrasekharpur', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3245, lng: 85.8172, type: 'hospital', formattedAddress: 'Chandrasekharpur, Bhubaneswar, Odisha' },
  { id: 'bbs-kalinga-hosp', name: 'Kalinga Hospital Square', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3168, lng: 85.8185, type: 'hospital', formattedAddress: 'Kalinganagar, Chandrasekharpur, Bhubaneswar, Odisha' },
  { id: 'bbs-sum-hosp', name: 'SUM Hospital / IMS & SUM', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2798, lng: 85.7621, type: 'hospital', formattedAddress: 'Kalinga Nagar, Ghatikia, Bhubaneswar, Odisha' },
  { id: 'bbs-nandankanan', name: 'Nandankanan Zoological Park & Botanical Garden', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3958, lng: 85.8248, type: 'landmark', formattedAddress: 'Nandankanan, Bhubaneswar, Odisha' },
  { id: 'bbs-lingaraj', name: 'Lingaraj Temple & Old Town Plaza', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2382, lng: 85.8338, type: 'landmark', formattedAddress: 'Old Town, Bhubaneswar, Odisha' },
  { id: 'bbs-puri', name: 'Puri Railway Station & Jagannath Temple', city: 'Puri', state: 'Odisha', lat: 19.8038, lng: 85.8201, type: 'station', formattedAddress: 'Puri Railway Station, Puri, Odisha' },
  { id: 'bbs-cuttack', name: 'Badambadi Bus Stand, Cuttack', city: 'Cuttack', state: 'Odisha', lat: 20.4625, lng: 85.8828, type: 'station', formattedAddress: 'Badambadi, Cuttack, Odisha' },


  // Delhi NCR
  { id: 'del-cp', name: 'Connaught Place (Rajiv Chowk)', city: 'New Delhi', state: 'Delhi', lat: 28.6328, lng: 77.2197, type: 'metro', formattedAddress: 'Rajiv Chowk Metro, Connaught Place, New Delhi' },
  { id: 'del-igi', name: 'Indira Gandhi International Airport (T3)', city: 'New Delhi', state: 'Delhi', lat: 28.5562, lng: 77.1000, type: 'airport', formattedAddress: 'Terminal 3, IGI Airport, New Delhi' },
  { id: 'del-chandni', name: 'Chandni Chowk, Old Delhi', city: 'Delhi', state: 'Delhi', lat: 28.6578, lng: 77.2301, type: 'landmark', formattedAddress: 'Chandni Chowk Market, Old Delhi' },
  { id: 'del-aiims', name: 'AIIMS Delhi & Safdarjung Hospital', city: 'New Delhi', state: 'Delhi', lat: 28.5672, lng: 77.2100, type: 'hospital', formattedAddress: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi' },
  { id: 'del-noida', name: 'Sector 18 Metro & Atta Market', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5708, lng: 77.3271, type: 'metro', formattedAddress: 'Sector 18 Metro Station, Noida, UP' },
  { id: 'del-cyber', name: 'Cyber Hub DLF Phase 2', city: 'Gurugram', state: 'Haryana', lat: 28.4952, lng: 77.0890, type: 'landmark', formattedAddress: 'DLF Cyber City, Gurugram, Haryana' },

  // Mumbai & MMR
  { id: 'mum-cst', name: 'CSMT Station (VT), Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 18.9400, lng: 72.8353, type: 'station', formattedAddress: 'Chhatrapati Shivaji Maharaj Terminus, Fort, Mumbai' },
  { id: 'mum-bandra', name: 'Bandra Kurla Complex (BKC)', city: 'Mumbai', state: 'Maharashtra', lat: 19.0657, lng: 72.8687, type: 'landmark', formattedAddress: 'BKC, Bandra East, Mumbai, Maharashtra' },
  { id: 'mum-andheri', name: 'Andheri Metro & Railway Station', city: 'Mumbai', state: 'Maharashtra', lat: 19.1197, lng: 72.8464, type: 'metro', formattedAddress: 'Andheri West, Mumbai, Maharashtra' },
  { id: 'mum-airport', name: 'Chhatrapati Shivaji Maharaj Airport (T2)', city: 'Mumbai', state: 'Maharashtra', lat: 19.0896, lng: 72.8656, type: 'airport', formattedAddress: 'Terminal 2, Sahar, Andheri East, Mumbai' },

  // Bengaluru
  { id: 'blr-majestic', name: 'Kempegowda Majestic Bus & Metro Station', city: 'Bengaluru', state: 'Karnataka', lat: 12.9767, lng: 77.5713, type: 'metro', formattedAddress: 'Majestic, Bengaluru, Karnataka' },
  { id: 'blr-whitefield', name: 'ITPL Whitefield Tech Corridor', city: 'Bengaluru', state: 'Karnataka', lat: 12.9854, lng: 77.7289, type: 'landmark', formattedAddress: 'ITPB Road, Whitefield, Bengaluru' },
  { id: 'blr-ec', name: 'Electronic City Phase 1', city: 'Bengaluru', state: 'Karnataka', lat: 12.8399, lng: 77.6770, type: 'landmark', formattedAddress: 'Hosur Road, Electronic City, Bengaluru' },
  { id: 'blr-airport', name: 'Kempegowda International Airport (BLR)', city: 'Bengaluru', state: 'Karnataka', lat: 13.1986, lng: 77.7066, type: 'airport', formattedAddress: 'Devanahalli, Bengaluru, Karnataka' },

  // Hyderabad
  { id: 'hyd-hitec', name: 'HITEC City & Cyber Towers', city: 'Hyderabad', state: 'Telangana', lat: 17.4504, lng: 78.3808, type: 'metro', formattedAddress: 'Madhapur, Hyderabad, Telangana' },
  { id: 'hyd-charmi', name: 'Charminar & Mecca Masjid', city: 'Hyderabad', state: 'Telangana', lat: 17.3616, lng: 78.4747, type: 'landmark', formattedAddress: 'Charminar, Old City, Hyderabad' },
  { id: 'hyd-sec', name: 'Secunderabad Junction', city: 'Secunderabad', state: 'Telangana', lat: 17.4344, lng: 78.5017, type: 'station', formattedAddress: 'Secunderabad Railway Station, Hyderabad' },

  // Kolkata
  { id: 'kol-howrah', name: 'Howrah Railway Station', city: 'Kolkata', state: 'West Bengal', lat: 22.5850, lng: 88.3426, type: 'station', formattedAddress: 'Howrah Terminal, Kolkata, West Bengal' },
  { id: 'kol-saltlake', name: 'Salt Lake Sector V Tech Hub', city: 'Kolkata', state: 'West Bengal', lat: 22.5802, lng: 88.4312, type: 'landmark', formattedAddress: 'Sector V, Bidhannagar, Kolkata' },
  { id: 'kol-parkst', name: 'Park Street Metro & Food Street', city: 'Kolkata', state: 'West Bengal', lat: 22.5516, lng: 88.3516, type: 'metro', formattedAddress: 'Park Street, Kolkata, West Bengal' },

  // Chennai
  { id: 'che-central', name: 'MGR Chennai Central Station', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, type: 'station', formattedAddress: 'Kannappar Thidal, Chennai, Tamil Nadu' },
  { id: 'che-omr', name: 'OMR IT Corridor (Tidel Park)', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9892, lng: 80.2483, type: 'landmark', formattedAddress: 'Rajiv Gandhi Salai, Taramani, Chennai' },

  // Pune, Ahmedabad, Jaipur, Lucknow, Patna, Kochi, Chandigarh
  { id: 'pun-shivaji', name: 'Shivajinagar Station, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5314, lng: 73.8446, type: 'station', formattedAddress: 'Shivajinagar, Pune, Maharashtra' },
  { id: 'ahm-kalupur', name: 'Kalupur Railway Station, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, type: 'station', formattedAddress: 'Railway Colony, Ahmedabad, Gujarat' },
  { id: 'jai-sindhi', name: 'Sindhi Camp Metro & Bus Station', city: 'Jaipur', state: 'Rajasthan', lat: 26.9239, lng: 75.8016, type: 'station', formattedAddress: 'Station Road, Jaipur, Rajasthan' },
  { id: 'lko-charbagh', name: 'Charbagh Railway Station, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8400, lng: 80.9200, type: 'station', formattedAddress: 'Charbagh, Lucknow, UP' },
  { id: 'pat-station', name: 'Patna Junction Railway Station', city: 'Patna', state: 'Bihar', lat: 25.6104, lng: 85.1350, type: 'station', formattedAddress: 'Patna Junction, Patna, Bihar' },
  { id: 'koc-mgroad', name: 'MG Road Metro Station, Kochi', city: 'Kochi', state: 'Kerala', lat: 9.9723, lng: 76.2828, type: 'metro', formattedAddress: 'MG Road, Ernakulam, Kochi, Kerala' },
];

// ── Geocode Address with OLA Maps First + Nominatim + Local Fallback ─────────────
export async function geocodeAddressIndia(query: string): Promise<IndiaLocationResult[]> {
  const cleanQ = query?.trim() || '';
  if (cleanQ.length < 2) return [];

  // 1. Try OLA Maps Autocomplete API (fast, instant location in single call)
  if (isOlaMapsConfigured()) {
    try {
      const encoded = encodeURIComponent(cleanQ);
      const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encoded}&api_key=${OLA_MAPS_API_KEY}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      
      if (response.ok) {
        const data = await response.json();
        const predictions = data.predictions || [];
        
        if (Array.isArray(predictions) && predictions.length > 0) {
          const results: IndiaLocationResult[] = [];

          for (const pred of predictions) {
            // OLA Maps embeds geometry.location directly inside autocomplete predictions!
            const lat = pred.geometry?.location?.lat;
            const lng = pred.geometry?.location?.lng;

            if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
              const mainText = pred.structured_formatting?.main_text || pred.description?.split(',')[0] || cleanQ;
              const secondary = pred.structured_formatting?.secondary_text || '';
              const secParts = secondary.split(',').map((s: string) => s.trim()).filter(Boolean);
              const city = secParts[0] || 'India';
              const state = secParts[1] || 'India';

              // Determine icon/type
              const descLower = (pred.description || '').toLowerCase();
              let type: IndiaLocationResult['type'] = 'custom';
              if (descLower.includes('metro') || descLower.includes('station')) type = 'metro';
              else if (descLower.includes('airport')) type = 'airport';
              else if (descLower.includes('hospital') || descLower.includes('aiims')) type = 'hospital';
              else if (descLower.includes('university') || descLower.includes('college') || descLower.includes('kiit')) type = 'university';
              else if (descLower.includes('terminal') || descLower.includes('junction') || descLower.includes('railway')) type = 'station';

              results.push({
                id: pred.place_id ? `ola-${pred.place_id}` : `ola-${lat}-${lng}`,
                name: mainText,
                city,
                state,
                lat,
                lng,
                type,
                formattedAddress: pred.description || `${mainText}, ${city}, ${state}`,
              });
            }
          }

          if (results.length > 0) {
            return results.slice(0, 8);
          }
        }
      }
    } catch (olaErr) {
      console.warn('OLA Maps autocomplete fallback to OSM/Local:', olaErr);
    }
  }

  // 2. Fallback: OpenStreetMap Nominatim
  try {
    const encoded = encodeURIComponent(`${cleanQ}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&countrycodes=in`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'musafir-transit-app/1.0' },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: {
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          address?: { city?: string; town?: string; village?: string; suburb?: string; state?: string };
        }): IndiaLocationResult => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || 'India';
          const state = addr.state || 'India';
          const shortName = item.display_name.split(',').slice(0, 2).join(', ').trim();
          return {
            id: `nominatim-${item.place_id}`,
            name: shortName,
            city,
            state,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: 'custom',
            formattedAddress: item.display_name,
          };
        });
      }
    }
  } catch (osmErr) {
    console.warn('Nominatim search fallback:', osmErr);
  }

  // 3. Fallback: Instant Local Filter
  const qLower = cleanQ.toLowerCase();
  const localMatches = POPULAR_INDIAN_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(qLower) ||
    loc.city.toLowerCase().includes(qLower) ||
    loc.state.toLowerCase().includes(qLower) ||
    loc.formattedAddress.toLowerCase().includes(qLower)
  );

  return localMatches.slice(0, 6);
}

import { STOP_COORDINATES_MAP } from '../data/busRoutesData';

class IndiaGeocodingService {
  public searchLocations(query: string): IndiaLocationResult[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return POPULAR_INDIAN_LOCATIONS.slice(0, 10);
    
    // 1. Check POPULAR_INDIAN_LOCATIONS
    const directMatches = POPULAR_INDIAN_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.formattedAddress.toLowerCase().includes(q)
    );

    // 2. Also search all Mo Bus Stoppages from STOP_COORDINATES_MAP
    const stopMatches: IndiaLocationResult[] = [];
    for (const [stopKey, coords] of Object.entries(STOP_COORDINATES_MAP)) {
      if (stopKey.includes(q) || q.includes(stopKey)) {
        const titleCase = stopKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const isDuplicate = directMatches.some(m => Math.abs(m.lat - coords[0]) < 0.002 && Math.abs(m.lng - coords[1]) < 0.002);
        if (!isDuplicate) {
          stopMatches.push({
            id: `stop-${stopKey.replace(/\s+/g, '-')}`,
            name: `${titleCase}, Bhubaneswar`,
            city: 'Bhubaneswar',
            state: 'Odisha',
            lat: coords[0],
            lng: coords[1],
            type: 'station',
            formattedAddress: `${titleCase} Mo Bus Stop, Bhubaneswar, Odisha`,
          });
        }
      }
    }

    const merged = [...directMatches, ...stopMatches];
    return merged.slice(0, 12);
  }

  public getLocationById(id: string): IndiaLocationResult | undefined {
    return POPULAR_INDIAN_LOCATIONS.find(l => l.id === id);
  }

  public createCustomLocationFromCoords(lat: number, lng: number, label = 'Pinned Location'): IndiaLocationResult {
    return {
      id: `coord-${Date.now()}`,
      name: label,
      city: 'India',
      state: 'GPS Pin',
      lat,
      lng,
      type: 'custom',
      formattedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}, India`,
    };
  }
}

export const indiaGeocodingService = new IndiaGeocodingService();

