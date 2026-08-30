import { googleGetDirections } from './googleMapsService';

/**
 * Maps Routing & Navigation Service
 * Uses Google Maps Directions API with OLA Maps & OSRM Fallback
 */

const OLA_MAPS_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || '';

export interface RouteDirectionsResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  summary: string;
  source: 'google_maps' | 'ola_maps' | 'osrm_fallback' | 'interpolated';
}

/**
 * Standard Polyline Decoder (Google / OLA Maps format)
 * Decodes encoded string into [latitude, longitude] tuples
 */
export function decodePolyline(encoded: string): [number, number][] {
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
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Calculate Great-Circle distance between two points in km
 */
function calculateDirectDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Fetch real driving/transit route between origin and destination
 */
export async function getRouteDirections(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteDirectionsResult> {
  const [origLat, origLng] = origin;
  const [destLat, destLng] = destination;
  const directDist = calculateDirectDistanceKm(origLat, origLng, destLat, destLng);

  // 1. Try Google Maps Directions API (Primary & Most Accurate)
  try {
    const gRoute = await googleGetDirections(origin, destination, 'driving');
    if (gRoute && gRoute.coordinates.length > 1) {
      return {
        coordinates: gRoute.coordinates,
        distanceKm: gRoute.distanceKm,
        durationMinutes: gRoute.durationMinutes,
        summary: `${gRoute.distanceKm} km • ~${gRoute.durationMinutes} mins (${gRoute.summary})`,
        source: 'google_maps',
      };
    }
  } catch (gErr) {
    console.warn('Google Maps directions fallback to OLA/OSM:', gErr);
  }

  // 2. Try OLA Maps Directions API
  if (OLA_MAPS_API_KEY && !OLA_MAPS_API_KEY.includes('your-ola')) {
    try {
      const url = `https://api.olamaps.io/routing/v1/directions?origin=${origLat},${origLng}&destination=${destLat},${destLng}&api_key=${OLA_MAPS_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'SUCCESS' && data.routes && data.routes.length > 0) {
          const mainRoute = data.routes[0];
          const polylineStr = mainRoute.overview_polyline;
          if (polylineStr) {
            const decoded = decodePolyline(polylineStr);
            if (decoded.length > 1) {
              const roadDistance = Math.round((directDist * 1.25) * 10) / 10;
              const estMins = Math.max(5, Math.round((roadDistance / 32) * 60));
              return {
                coordinates: decoded,
                distanceKm: roadDistance,
                durationMinutes: estMins,
                summary: `${roadDistance} km • ~${estMins} mins`,
                source: 'ola_maps',
              };
            }
          }
        }
      }
    } catch (olaErr) {
      console.warn('OLA Maps directions API error, falling back to OSRM:', olaErr);
    }
  }

  // 2. Fallback: OpenStreetMap OSRM Public Routing (Fast & free road routing)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const osrmRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(3500) });
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.routes && osrmData.routes.length > 0) {
        const route = osrmData.routes[0];
        const geoCoords = route.geometry.coordinates as [number, number][];
        // Convert from [lng, lat] to [lat, lng] for Leaflet
        const leafletCoords: [number, number][] = geoCoords.map(([lng, lat]) => [lat, lng]);
        const distKm = Math.round((route.distance / 1000) * 10) / 10;
        const durMins = Math.round(route.duration / 60);
        return {
          coordinates: leafletCoords,
          distanceKm: distKm,
          durationMinutes: durMins,
          summary: `${distKm} km • ~${durMins} mins`,
          source: 'osrm_fallback',
        };
      }
    }
  } catch (osrmErr) {
    console.warn('OSRM fallback error:', osrmErr);
  }

  // 3. Realistic Curved Interpolation (if offline or both APIs fail)
  const steps = 24;
  const interpolated: [number, number][] = [];
  const roadDist = Math.round((directDist * 1.2) * 10) / 10;
  const estMins = Math.max(4, Math.round((roadDist / 30) * 60));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Slight natural curve
    const arc = Math.sin(t * Math.PI) * 0.008;
    const lat = origLat + (destLat - origLat) * t + arc;
    const lng = origLng + (destLng - origLng) * t - arc * 0.5;
    interpolated.push([lat, lng]);
  }

  return {
    coordinates: interpolated,
    distanceKm: roadDist,
    durationMinutes: estMins,
    summary: 'Direct Corridor Navigation',
    source: 'interpolated',
  };
}
