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

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || '';

const isOlaMapsConfigured = (): boolean =>
  OLA_MAPS_API_KEY.length > 5 && !OLA_MAPS_API_KEY.includes('your-ola');

// ── Popular India locations for instant autocomplete (no API call) ─────────
export const POPULAR_INDIAN_LOCATIONS: IndiaLocationResult[] = [
  { id: 'bbs-kiit', name: 'KIIT Square, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3541, lng: 85.8175, type: 'university', formattedAddress: 'KIIT Square, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-jayadev', name: 'Jayadev Vihar, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3039, lng: 85.8188, type: 'landmark', formattedAddress: 'Jayadev Vihar Square, NH16, Bhubaneswar, Odisha' },
  { id: 'bbs-master-canteen', name: 'Master Canteen, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2668, lng: 85.8436, type: 'station', formattedAddress: 'Master Canteen Station Plaza, Bhubaneswar, Odisha' },
  { id: 'bbs-airport', name: 'Biju Patnaik International Airport (BBI)', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2524, lng: 85.8178, type: 'airport', formattedAddress: 'Airport Road, Bhubaneswar, Odisha' },
  { id: 'bbs-aiims', name: 'AIIMS Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2312, lng: 85.7761, type: 'hospital', formattedAddress: 'Sijua, Patrapada, Bhubaneswar, Odisha' },
  { id: 'bbs-infocity', name: 'Infocity IT Park, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3602, lng: 85.8035, type: 'landmark', formattedAddress: 'Infocity Road, Patia, Bhubaneswar, Odisha' },
  { id: 'bbs-puri', name: 'Puri Railway Station', city: 'Puri', state: 'Odisha', lat: 19.8038, lng: 85.8201, type: 'station', formattedAddress: 'Puri Railway Station, Puri, Odisha' },
  { id: 'del-cp', name: 'Connaught Place, New Delhi', city: 'New Delhi', state: 'Delhi', lat: 28.6328, lng: 77.2197, type: 'metro', formattedAddress: 'Rajiv Chowk Metro, Connaught Place, New Delhi' },
  { id: 'del-igi', name: 'Indira Gandhi International Airport (T3)', city: 'New Delhi', state: 'Delhi', lat: 28.5562, lng: 77.1000, type: 'airport', formattedAddress: 'Terminal 3, IGI Airport, New Delhi' },
  { id: 'del-chandni', name: 'Chandni Chowk, Delhi', city: 'Old Delhi', state: 'Delhi', lat: 28.6578, lng: 77.2301, type: 'landmark', formattedAddress: 'Chandni Chowk Market, Old Delhi' },
  { id: 'del-noida', name: 'Sector 18 Market, Noida', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5708, lng: 77.3271, type: 'metro', formattedAddress: 'Sector 18 Metro Station, Noida, UP' },
  { id: 'mum-cst', name: 'CSMT (VT), Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 18.9400, lng: 72.8353, type: 'station', formattedAddress: 'Chhatrapati Shivaji Maharaj Terminus, Fort, Mumbai' },
  { id: 'mum-dadar', name: 'Dadar Station, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0178, lng: 72.8478, type: 'station', formattedAddress: 'Dadar West, Mumbai, Maharashtra' },
  { id: 'mum-andheri', name: 'Andheri, Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.1197, lng: 72.8464, type: 'metro', formattedAddress: 'Andheri West, Mumbai, Maharashtra' },
  { id: 'blr-majestic', name: 'Kempegowda Majestic, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9767, lng: 77.5713, type: 'metro', formattedAddress: 'Majestic, Bengaluru, Karnataka' },
  { id: 'blr-whitefield', name: 'Whitefield ITPL, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9854, lng: 77.7289, type: 'landmark', formattedAddress: 'ITPB Road, Whitefield, Bengaluru' },
  { id: 'blr-ec', name: 'Electronic City, Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.8399, lng: 77.6770, type: 'landmark', formattedAddress: 'Electronic City Phase 1, Bengaluru' },
  { id: 'hyd-hitec', name: 'HITEC City, Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.4504, lng: 78.3808, type: 'metro', formattedAddress: 'Madhapur, Hyderabad, Telangana' },
  { id: 'hyd-charmi', name: 'Charminar, Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.3616, lng: 78.4747, type: 'landmark', formattedAddress: 'Charminar, Old City, Hyderabad' },
  { id: 'kol-howrah', name: 'Howrah Railway Station', city: 'Kolkata', state: 'West Bengal', lat: 22.5850, lng: 88.3426, type: 'station', formattedAddress: 'Howrah Terminal, Kolkata, West Bengal' },
  { id: 'kol-saltlake', name: 'Salt Lake Sector V, Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5802, lng: 88.4312, type: 'landmark', formattedAddress: 'Sector V, Bidhannagar, Kolkata' },
  { id: 'che-central', name: 'Chennai Central Station', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, type: 'station', formattedAddress: 'Kannappar Thidal, Chennai, Tamil Nadu' },
  { id: 'pun-shivajinagar', name: 'Shivajinagar, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5314, lng: 73.8446, type: 'station', formattedAddress: 'Shivajinagar, Pune, Maharashtra' },
  { id: 'ahm-kalupur', name: 'Kalupur Railway Station, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, type: 'station', formattedAddress: 'Railway Colony, Ahmedabad, Gujarat' },
  { id: 'jai-sindhi', name: 'Sindhi Camp, Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.9239, lng: 75.8016, type: 'station', formattedAddress: 'Station Road, Jaipur, Rajasthan' },
  { id: 'lko-charbagh', name: 'Charbagh Railway Station, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8400, lng: 80.9200, type: 'station', formattedAddress: 'Charbagh, Lucknow, UP' },
  { id: 'ngp-station', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, type: 'station', formattedAddress: 'Nagpur Junction, Nagpur, Maharashtra' },
  { id: 'pat-station', name: 'Patna Junction', city: 'Patna', state: 'Bihar', lat: 25.6104, lng: 85.1350, type: 'station', formattedAddress: 'Patna Junction, Patna, Bihar' },
  { id: 'koc-ernakulam', name: 'Ernakulam Junction, Kochi', city: 'Kochi', state: 'Kerala', lat: 9.9849, lng: 76.2934, type: 'station', formattedAddress: 'Ernakulam, Kochi, Kerala' },
  { id: 'goa-panaji', name: 'Panaji Bus Stand, Goa', city: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278, type: 'station', formattedAddress: 'Kadamba Bus Stand, Panaji, Goa' },
];

// ── OLA Maps Autocomplete API ─────────────────────────────────────────────
export async function geocodeAddressIndia(query: string): Promise<IndiaLocationResult[]> {
  if (!query || query.trim().length < 2) return [];

  // Try OLA Maps first (better for India)
  if (isOlaMapsConfigured()) {
    try {
      const encoded = encodeURIComponent(query);
      const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encoded}&api_key=${OLA_MAPS_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const predictions = data.predictions || [];
        if (predictions.length > 0) {
          // Get lat/lng for top results via OLA geocode
          const results: IndiaLocationResult[] = [];
          for (const pred of predictions.slice(0, 6)) {
            try {
              const geoUrl = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(pred.description)}&api_key=${OLA_MAPS_API_KEY}`;
              const geoRes = await fetch(geoUrl);
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                const loc = geoData.geocodingResults?.[0]?.geometry?.location;
                if (loc) {
                  results.push({
                    id: 'ola-' + pred.place_id,
                    name: pred.structured_formatting?.main_text || pred.description.split(',')[0],
                    city: pred.structured_formatting?.secondary_text?.split(',')[0] || 'India',
                    state: pred.structured_formatting?.secondary_text?.split(',')[1]?.trim() || 'India',
                    lat: loc.lat,
                    lng: loc.lng,
                    type: 'custom',
                    formattedAddress: pred.description,
                  });
                }
              }
            } catch {}
          }
          if (results.length > 0) return results;
        }
      }
    } catch {}
  }

  // Fallback: OpenStreetMap Nominatim (free, covers all India)
  try {
    const encoded = encodeURIComponent(query + ', India');
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&countrycodes=in`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'musafir-transit-app/1.0' },
    });
    if (!response.ok) return [];
    const data = await response.json();

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
        id: 'nominatim-' + item.place_id,
        name: shortName,
        city,
        state,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: 'custom',
        formattedAddress: item.display_name,
      };
    });
  } catch {
    return [];
  }
}

class IndiaGeocodingService {
  public searchLocations(query: string): IndiaLocationResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_INDIAN_LOCATIONS.slice(0, 8);
    return POPULAR_INDIAN_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.formattedAddress.toLowerCase().includes(q)
    ).slice(0, 8);
  }

  public getLocationById(id: string): IndiaLocationResult | undefined {
    return POPULAR_INDIAN_LOCATIONS.find(l => l.id === id);
  }

  public createCustomLocationFromCoords(lat: number, lng: number, label = 'Pinned Location'): IndiaLocationResult {
    return {
      id: 'coord-' + Date.now(),
      name: label,
      city: 'India',
      state: 'GPS Coordinates',
      lat,
      lng,
      type: 'custom',
      formattedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}, India`,
    };
  }
}

export const indiaGeocodingService = new IndiaGeocodingService();
