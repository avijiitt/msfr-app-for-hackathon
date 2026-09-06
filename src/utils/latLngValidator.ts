/**
 * Bulletproof Latitude and Longitude validation and sanitization utilities
 * Prevents Leaflet "Invalid LatLng object: (NaN, NaN)" crashes across all platforms
 */

export function extractLatLng(coord: any): [number, number] | null {
  if (coord === null || coord === undefined) return null;

  let lat: any;
  let lng: any;

  if (Array.isArray(coord)) {
    if (coord.length < 2) return null;
    lat = coord[0];
    lng = coord[1];
  } else if (typeof coord === 'object') {
    lat = coord.lat ?? coord.latitude;
    lng = coord.lng ?? coord.longitude ?? coord.lon;
  } else {
    return null;
  }

  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return [lat, lng];
  }
  return null;
}

export function isValidLatLng(coord: any): boolean {
  return extractLatLng(coord) !== null;
}

export function sanitizeLatLng(
  coord: any,
  fallback: [number, number] = [20.2961, 85.8245]
): [number, number] {
  const extracted = extractLatLng(coord);
  return extracted !== null ? extracted : fallback;
}

export function filterValidLatLngs(coords: any[]): [number, number][] {
  if (!Array.isArray(coords)) return [];
  const result: [number, number][] = [];
  for (const c of coords) {
    const extracted = extractLatLng(c);
    if (extracted !== null) {
      result.push(extracted);
    }
  }
  return result;
}

