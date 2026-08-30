/**
 * Google Maps Platform Core Service
 * Powers Geocoding, Places Autocomplete, Turn-by-turn Directions, and Map Tile layers
 */

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBxK55bcOFGfpkIX_0Hi6AyWzwjCSGPFQM';

export interface GooglePlaceResult {
  id: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  type: 'station' | 'landmark' | 'metro' | 'airport' | 'university' | 'hospital' | 'custom';
}

export interface GoogleRouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  summary: string;
  steps: Array<{ instruction: string; distance: string; duration: string }>;
  source: 'google_maps' | 'fallback';
}

/**
 * Standard Polyline Decoder for Google Maps Overview Polylines
 */
export function decodeGooglePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * 1. Google Places Autocomplete: Fast suggestions as user types anywhere in India
 */
export async function googlePlaceAutocomplete(query: string): Promise<GooglePlaceResult[]> {
  const cleanQ = (query || '').trim();
  if (cleanQ.length < 2) return [];

  try {
    const proxyUrl = `/api/maps/places/autocomplete?input=${encodeURIComponent(cleanQ)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'OK' && Array.isArray(data.predictions)) {
        return data.predictions.map((p: any) => {
          const mainText = p.structured_formatting?.main_text || p.description?.split(',')[0] || cleanQ;
          const secondary = p.structured_formatting?.secondary_text || '';
          const secParts = secondary.split(',').map((s: string) => s.trim()).filter(Boolean);
          const city = secParts[0] || 'India';
          const state = secParts[1] || 'India';

          const descLower = (p.description || '').toLowerCase();
          let type: GooglePlaceResult['type'] = 'custom';
          if (descLower.includes('metro') || descLower.includes('station')) type = 'metro';
          else if (descLower.includes('airport')) type = 'airport';
          else if (descLower.includes('hospital') || descLower.includes('aiims')) type = 'hospital';
          else if (descLower.includes('university') || descLower.includes('college') || descLower.includes('kiit')) type = 'university';
          else if (descLower.includes('terminal') || descLower.includes('junction') || descLower.includes('railway')) type = 'station';

          return {
            id: `gplace-${p.place_id}`,
            name: mainText,
            formattedAddress: p.description,
            lat: 0,
            lng: 0,
            city,
            state,
            type,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Google Place Autocomplete proxy fallback:', err);
  }

  return [];
}

/**
 * 2. Google Geocoding API: Resolve exact [lat, lng] for any address in India
 */
export async function googleGeocodeAddress(address: string): Promise<GooglePlaceResult | null> {
  const cleanAddr = (address || '').trim();
  if (cleanAddr.length < 2) return null;

  try {
    const proxyUrl = `/api/maps/geocode?address=${encodeURIComponent(cleanAddr)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        const item = data.results[0];
        const lat = item.geometry?.location?.lat;
        const lng = item.geometry?.location?.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
          let city = 'Bhubaneswar';
          let state = 'Odisha';
          if (Array.isArray(item.address_components)) {
            for (const comp of item.address_components) {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                city = comp.long_name;
              }
              if (comp.types.includes('administrative_area_level_1')) {
                state = comp.long_name;
              }
            }
          }

          const mainText = cleanAddr.split(',')[0].trim();
          return {
            id: `ggeo-${item.place_id || Date.now()}`,
            name: mainText,
            formattedAddress: item.formatted_address || cleanAddr,
            lat,
            lng,
            city,
            state,
            type: 'landmark',
          };
        }
      }
    }
  } catch (err) {
    console.warn('Google Geocode proxy error:', err);
  }

  return null;
}

/**
 * 3. Google Directions API: Calculate real driving/transit road navigation & polylines
 */
export async function googleGetDirections(
  origin: [number, number] | string,
  destination: [number, number] | string,
  mode: 'transit' | 'driving' | 'walking' = 'driving'
): Promise<GoogleRouteResult | null> {
  const origStr = typeof origin === 'string' ? origin : `${origin[0]},${origin[1]}`;
  const destStr = typeof destination === 'string' ? destination : `${destination[0]},${destination[1]}`;

  try {
    const proxyUrl = `/api/maps/directions?origin=${encodeURIComponent(origStr)}&destination=${encodeURIComponent(destStr)}&mode=${mode}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'OK' && Array.isArray(data.routes) && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs?.[0];
        const polylineStr = route.overview_polyline?.points;
        const coordinates = polylineStr ? decodeGooglePolyline(polylineStr) : [];
        const distanceKm = leg?.distance?.value ? Math.round((leg.distance.value / 1000) * 10) / 10 : 8.5;
        const durationMinutes = leg?.duration?.value ? Math.round(leg.duration.value / 60) : 20;

        const steps = Array.isArray(leg?.steps)
          ? leg.steps.map((st: any) => ({
              instruction: st.html_instructions ? st.html_instructions.replace(/<[^>]*>?/gm, '') : st.instructions || '',
              distance: st.distance?.text || '',
              duration: st.duration?.text || '',
            }))
          : [];

        return {
          coordinates,
          distanceKm,
          durationMinutes,
          summary: route.summary || leg?.start_address || 'Google Maps Optimized Route',
          steps,
          source: 'google_maps',
        };
      }
    }
  } catch (err) {
    console.warn('Google Directions proxy error:', err);
  }

  return null;
}
