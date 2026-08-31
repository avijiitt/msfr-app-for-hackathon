/**
 * Shortest-route search across the entire Mo Bus network.
 *
 * Builds a weighted graph from MO_BUS_DETAILED_ROUTES where nodes are stops and
 * edges are (a) rides between consecutive stops on a route and (b) short walking
 * transfers between nearby stops. A Dijkstra search over (stop, boarded-route)
 * states then returns the geometrically shortest journey, including transfers.
 *
 * Distance caveat: only ~34% of the 1700+ stop names in the route data appear in
 * STOP_COORDINATES_MAP. Coordinates for the rest are linearly interpolated along
 * their route between the nearest known anchors, and are flagged `isEstimated`.
 * Every result reports `estimatedStopCount` and a `confidence` score so callers
 * can tell a surveyed distance from an inferred one.
 */

import { MO_BUS_DETAILED_ROUTES, STOP_COORDINATES_MAP } from '../data/busRoutesData';

// ─────────────────────────────── Public types ───────────────────────────────

export interface GraphStop {
  /** Canonical id — spelling variants of the same stop collapse to one id. */
  id: string;
  /** Cleanest human-readable spelling seen in the source data. */
  label: string;
  lat: number;
  lng: number;
  /** True when coordinates were interpolated rather than looked up. */
  isEstimated: boolean;
  /** Route numbers that call at this stop. */
  routes: string[];
}

export interface ShortestRouteLeg {
  kind: 'ride' | 'walk';
  /** Mo Bus route number, e.g. "10" or "22A". Absent on walking legs. */
  routeNumber?: string;
  routeName?: string;
  fromStop: string;
  toStop: string;
  /** Stops passed through, excluding the boarding stop, including the alighting stop. */
  intermediateStops: string[];
  stopCount: number;
  distanceKm: number;
  /** Polyline for drawing the leg on the Leaflet map. */
  coordinates: Array<[number, number]>;
}

export interface ShortestRouteResult {
  found: boolean;
  /** Populated only when found === false. */
  reason?: string;
  /** Resolved boarding stop, which may differ from the raw query string. */
  originStop?: GraphStop;
  destinationStop?: GraphStop;
  totalDistanceKm: number;
  rideDistanceKm: number;
  walkDistanceKm: number;
  /** Number of bus-to-bus changes (walking transfers included). */
  transfers: number;
  totalStops: number;
  legs: ShortestRouteLeg[];
  routesUsed: string[];
  /** How many stops on the path had interpolated coordinates. */
  estimatedStopCount: number;
  /** 0-1. Share of the path built from surveyed rather than inferred coordinates. */
  confidence: number;
}

export interface ShortestRouteOptions {
  /** Maximum bus changes allowed. 0 forces a direct route. Default 2. */
  maxTransfers?: number;
  /** Longest permitted walking link between two stops, in km. Default 0.35. */
  maxWalkKm?: number;
  /**
   * Multiplier applied to walking distance when ranking candidates. Walking is
   * slower than riding, so 1 km on foot should not look as good as 1 km on a bus.
   * Set to 1 for a pure geometric shortest path. Default 2.5.
   */
  walkWeight?: number;
  /**
   * Virtual kilometres added per transfer, so a marginally shorter journey does
   * not win by forcing an extra bus change. Set to 0 for pure distance. Default 0.5.
   */
  transferPenaltyKm?: number;
}

// ────────────────────── Stop-name normalisation & matching ──────────────────────

/**
 * The route data is hand-typed and inconsistent: "sq"/"square"/"sqare",
 * "kaling"/"kalinga", "jayedev"/"jaydev". Token rewrites fold those together so
 * that one physical stop becomes one graph node instead of three.
 */
const TOKEN_FIX: Record<string, string> = {
  sq: 'square', sqare: 'square', squre: 'square', squar: 'square', sqr: 'square',
  chhak: 'square', chak: 'square', chowk: 'square',
  kaling: 'kalinga', kalinag: 'kalinga', kalinaga: 'kalinga',
  jayedev: 'jaydev', jaydeb: 'jaydev', jayadev: 'jaydev',
  xavior: 'xavier', xaviour: 'xavier', appolo: 'apollo', sastri: 'shastri',
  salishree: 'shailashree', salashree: 'shailashree', sailashree: 'shailashree',
  bhabwan: 'bhawan', bhaban: 'bhawan', kimms: 'kims', kannana: 'kanan', kannan: 'kanan',
  bettlaion: 'battalion', battalian: 'battalion', judiciual: 'judicial',
  trishulia: 'trisulia', hosp: 'hospital', hos: 'hospital', clg: 'college',
  ps: 'police', vihaar: 'vihar', nagr: 'nagar', madir: 'mandir', temmple: 'temple',
  niladrivihar: 'niladri vihar', cspur: 'cs pur', mo: '', bhubaneshwar: 'bhubaneswar',
};

/** Words that carry no discriminating information for stop identity. */
const STOP_WORDS = new Set(['the', 'of', 'at', 'near', 'and', 'bus', 'stop', 'stoppage', 'bhubaneswar']);

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(raw: string): string[] {
  return normalize(raw)
    .split(' ')
    .flatMap((t) => (t in TOKEN_FIX ? TOKEN_FIX[t].split(' ') : [t]))
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

/** Order-independent identity, so "square kalinga hospital" === "kalinga hospital square". */
function canonicalId(raw: string): string {
  const t = tokenize(raw);
  return t.length > 0 ? [...t].sort().join(' ') : normalize(raw);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

const similarity = (a: string, b: string): number =>
  1 - levenshtein(a, b) / Math.max(a.length, b.length, 1);

/** Jaccard overlap that treats near-identical tokens as matching, for typo tolerance. */
function tokenSetScore(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 || B.size === 0) return 0;
  let intersection = 0;
  for (const x of A) {
    if (B.has(x)) {
      intersection += 1;
      continue;
    }
    for (const y of B) {
      if (x.length > 3 && y.length > 3 && similarity(x, y) >= 0.8) {
        intersection += 0.9;
        break;
      }
    }
  }
  return intersection / (A.size + B.size - intersection);
}

// ─────────────────────────────── Geometry ───────────────────────────────

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

export function haversineKm(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// ─────────────────────────── Coordinate resolution ───────────────────────────

interface CoordIndexEntry {
  normalized: string;
  tokens: string[];
  coord: [number, number];
}

let coordIndex: CoordIndexEntry[] | null = null;
let coordByNormalized: Map<string, [number, number]> | null = null;
let coordByCanonical: Map<string, [number, number]> | null = null;

function buildCoordIndex(): void {
  if (coordIndex) return;
  coordIndex = [];
  coordByNormalized = new Map();
  coordByCanonical = new Map();
  for (const [name, coord] of Object.entries(STOP_COORDINATES_MAP)) {
    const n = normalize(name);
    if (!coordByNormalized.has(n)) coordByNormalized.set(n, coord);
    const c = canonicalId(name);
    if (!coordByCanonical.has(c)) coordByCanonical.set(c, coord);
    coordIndex.push({ normalized: n, tokens: tokenize(name), coord });
  }
}

/** Minimum token-overlap score for a fuzzy name match to be trusted. */
const FUZZY_THRESHOLD = 0.62;

/** Minimum per-token similarity for two names to count as spellings of each other. */
const TOKEN_SPELLING_THRESHOLD = 0.8;

/**
 * Scores two names as misspellings of one another: same token count, and every
 * token pairs off with a near-identical partner.
 *
 * Whole-string edit distance is not usable here. "iit square" vs "kiit square"
 * differs by one character out of eleven — 0.91 similarity — yet IIT and KIIT are
 * kilometres apart, and matching them assigned IIT Square the wrong coordinates.
 * Comparing token by token catches it: "iit" vs "kiit" scores only 0.75.
 * Returns 0 when the names are not spelling variants.
 */
function spellingScore(a: string[], b: string[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  const left = [...a].sort();
  const right = [...b].sort();
  let total = 0;
  for (let i = 0; i < left.length; i++) {
    const s = similarity(left[i], right[i]);
    if (s < TOKEN_SPELLING_THRESHOLD) return 0;
    total += s;
  }
  return total / left.length;
}

/** Looks up surveyed coordinates for a stop name. Returns null if genuinely unknown. */
function lookupCoord(name: string): [number, number] | null {
  buildCoordIndex();
  const exact = coordByNormalized!.get(normalize(name));
  if (exact) return exact;
  const canon = coordByCanonical!.get(canonicalId(name));
  if (canon) return canon;

  const t = tokenize(name);
  let bestScore = 0;
  let bestCoord: [number, number] | null = null;
  for (const entry of coordIndex!) {
    const tokenScore = tokenSetScore(t, entry.tokens);
    const score = Math.max(
      tokenScore >= FUZZY_THRESHOLD ? tokenScore : 0,
      spellingScore(t, entry.tokens)
    );
    if (score > bestScore) {
      bestScore = score;
      bestCoord = entry.coord;
    }
  }
  return bestScore > 0 ? bestCoord : null;
}

/**
 * Fills coordinate gaps along a single route by linear interpolation between the
 * nearest known stops, then extrapolates the leading and trailing tails from the
 * first and last known segment. Requires at least two anchors.
 *
 * Tail extrapolation is deliberately clamped. Some routes have their only anchors
 * far apart, which makes the implied per-stop step enormous — route 52 once
 * marched its unanchored tail 980 km north of Odisha. Guessing a stop 1 km past
 * the last known one is defensible; guessing one in Nepal is not.
 */
const MAX_EXTRAPOLATION_STEP_DEG = 0.012; // ≈ 1.3 km per stop
const MAX_EXTRAPOLATION_DEG = 0.09; // ≈ 10 km from the anchor, total

function clampStep(step: [number, number]): [number, number] {
  const magnitude = Math.hypot(step[0], step[1]);
  if (magnitude <= MAX_EXTRAPOLATION_STEP_DEG || magnitude === 0) return step;
  const scale = MAX_EXTRAPOLATION_STEP_DEG / magnitude;
  return [step[0] * scale, step[1] * scale];
}

function extrapolate(
  anchor: [number, number],
  step: [number, number],
  distance: number
): [number, number] {
  const capped = Math.min(
    distance,
    Math.hypot(step[0], step[1]) > 0
      ? MAX_EXTRAPOLATION_DEG / Math.hypot(step[0], step[1])
      : 0
  );
  return [anchor[0] + step[0] * capped, anchor[1] + step[1] * capped];
}

function interpolateRoute(coords: Array<[number, number] | null>): Array<[number, number] | null> {
  const anchors: number[] = [];
  coords.forEach((c, i) => {
    if (c) anchors.push(i);
  });
  if (anchors.length < 2) return coords;

  const out = [...coords];

  for (let a = 0; a < anchors.length - 1; a++) {
    const i = anchors[a];
    const j = anchors[a + 1];
    const from = coords[i]!;
    const to = coords[j]!;
    for (let k = i + 1; k < j; k++) {
      const f = (k - i) / (j - i);
      out[k] = [from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f];
    }
  }

  const first = anchors[0];
  const second = anchors[1];
  const headStep = clampStep([
    (coords[first]![0] - coords[second]![0]) / (second - first),
    (coords[first]![1] - coords[second]![1]) / (second - first),
  ]);
  for (let k = first - 1; k >= 0; k--) {
    out[k] = extrapolate(coords[first]!, headStep, first - k);
  }

  const last = anchors[anchors.length - 1];
  const penultimate = anchors[anchors.length - 2];
  const tailStep = clampStep([
    (coords[last]![0] - coords[penultimate]![0]) / (last - penultimate),
    (coords[last]![1] - coords[penultimate]![1]) / (last - penultimate),
  ]);
  for (let k = last + 1; k < coords.length; k++) {
    out[k] = extrapolate(coords[last]!, tailStep, k - last);
  }

  return out;
}

// ─────────────────────────────── Graph model ───────────────────────────────

interface GraphEdge {
  to: string;
  /** Route number, or WALK_ROUTE for a walking transfer. */
  route: string;
  km: number;
}

const WALK_ROUTE = '__WALK__';

export interface TransitGraph {
  stops: Map<string, GraphStop>;
  adjacency: Map<string, GraphEdge[]>;
  /** Ordered canonical stop ids for each route number. */
  routeSequences: Map<string, string[]>;
  routeLabels: Map<string, string>;
  stats: {
    stopCount: number;
    routeCount: number;
    rideEdgeCount: number;
    walkEdgeCount: number;
    surveyedStopCount: number;
    estimatedStopCount: number;
  };
}

/** Default walking-transfer radius in km. */
const DEFAULT_MAX_WALK_KM = 0.35;

/**
 * Builds (and memoises) the network graph. Called lazily on first search.
 * The cache is keyed on the walking radius, since that changes which transfer
 * edges exist.
 */
const graphCache = new Map<number, TransitGraph>();

export function getTransitGraph(maxWalkKm: number = DEFAULT_MAX_WALK_KM): TransitGraph {
  const cached = graphCache.get(maxWalkKm);
  if (cached) return cached;

  const routeSequences = new Map<string, string[]>();
  const routeLabels = new Map<string, string>();
  const surveyed = new Map<string, [number, number]>();
  const estimates = new Map<string, Array<[number, number]>>();
  const labels = new Map<string, string>();
  const routesAt = new Map<string, Set<string>>();

  for (const route of MO_BUS_DETAILED_ROUTES) {
    const raw = [route.start, ...route.stopsList, route.destination];

    // Collapse consecutive duplicates: `start` is often repeated as the first stop.
    const sequence: string[] = [];
    for (const name of raw) {
      if (!name || !name.trim()) continue;
      const id = canonicalId(name);
      if (!id) continue;
      if (sequence.length > 0 && sequence[sequence.length - 1] === id) continue;
      sequence.push(id);
      if (!labels.has(id)) labels.set(id, name.trim());
      if (!routesAt.has(id)) routesAt.set(id, new Set());
      routesAt.get(id)!.add(route.route);
    }
    if (sequence.length < 2) continue;

    const dedupedRaw: string[] = [];
    for (const name of raw) {
      if (!name || !name.trim()) continue;
      const id = canonicalId(name);
      if (!id) continue;
      if (dedupedRaw.length > 0 && canonicalId(dedupedRaw[dedupedRaw.length - 1]) === id) continue;
      dedupedRaw.push(name);
    }

    const looked = dedupedRaw.map((name) => lookupCoord(name));
    looked.forEach((coord, i) => {
      if (coord) surveyed.set(sequence[i], coord);
    });

    const filled = interpolateRoute(looked);
    filled.forEach((coord, i) => {
      if (!coord || looked[i]) return;
      const id = sequence[i];
      if (!estimates.has(id)) estimates.set(id, []);
      estimates.get(id)!.push(coord);
    });

    routeSequences.set(route.route, sequence);
    routeLabels.set(route.route, `Mo Bus ${route.route} (${route.start} → ${route.destination})`);
  }

  // Finalise one coordinate per stop: surveyed wins, otherwise average the estimates.
  const stops = new Map<string, GraphStop>();
  for (const [id, label] of labels) {
    const exact = surveyed.get(id);
    let lat: number;
    let lng: number;
    let isEstimated: boolean;
    if (exact) {
      [lat, lng] = exact;
      isEstimated = false;
    } else {
      const guesses = estimates.get(id);
      if (!guesses || guesses.length === 0) continue; // no geometry at all — unusable
      lat = guesses.reduce((s, g) => s + g[0], 0) / guesses.length;
      lng = guesses.reduce((s, g) => s + g[1], 0) / guesses.length;
      isEstimated = true;
    }
    stops.set(id, {
      id,
      label,
      lat,
      lng,
      isEstimated,
      routes: [...(routesAt.get(id) ?? [])].sort(),
    });
  }

  // Ride edges between consecutive stops, bidirectional (Mo Bus runs both ways).
  const adjacency = new Map<string, GraphEdge[]>();
  const addEdge = (from: string, to: string, route: string, km: number): void => {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from)!.push({ to, route, km });
  };

  let rideEdgeCount = 0;
  for (const [routeNumber, sequence] of routeSequences) {
    for (let i = 0; i < sequence.length - 1; i++) {
      const a = stops.get(sequence[i]);
      const b = stops.get(sequence[i + 1]);
      if (!a || !b || a.id === b.id) continue;
      const km = haversineKm([a.lat, a.lng], [b.lat, b.lng]);
      addEdge(a.id, b.id, routeNumber, km);
      addEdge(b.id, a.id, routeNumber, km);
      rideEdgeCount += 2;
    }
  }

  // Walking transfers, found with a coarse spatial grid to avoid an O(n^2) scan.
  // cell ≈ maxWalkKm in degrees (1 degree ≈ 111 km), so a 3x3 cell sweep is
  // guaranteed to cover every stop within the radius.
  const cell = maxWalkKm / 100;
  const grid = new Map<string, string[]>();
  const cellKey = (lat: number, lng: number): string =>
    `${Math.floor(lat / cell)}:${Math.floor(lng / cell)}`;
  for (const stop of stops.values()) {
    const key = cellKey(stop.lat, stop.lng);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(stop.id);
  }

  /**
   * Two stops are the same physical place under different spellings, e.g.
   * "s vihar jagannath temple" and "jagannath temple". Used to keep genuine
   * transfer points that interpolation happens to place at the same coordinate.
   */
  const sameNamedPlace = (a: GraphStop, b: GraphStop): boolean =>
    tokenSetScore(tokenize(a.label), tokenize(b.label)) >= 0.5;

  let walkEdgeCount = 0;
  for (const stop of stops.values()) {
    const gx = Math.floor(stop.lat / cell);
    const gy = Math.floor(stop.lng / cell);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const otherId of grid.get(`${gx + dx}:${gy + dy}`) ?? []) {
          if (otherId === stop.id) continue;
          const other = stops.get(otherId)!;
          const km = haversineKm([stop.lat, stop.lng], [other.lat, other.lng]);
          if (km > maxWalkKm) continue;
          // Interpolated coordinates are not precise enough to assert that two
          // unrelated stops are within walking distance — two stops on different
          // routes can land on the same inferred point and create a teleport.
          // Trust proximity only between surveyed stops, or between spellings of
          // the same place.
          if ((stop.isEstimated || other.isEstimated) && !sameNamedPlace(stop, other)) continue;
          addEdge(stop.id, otherId, WALK_ROUTE, km);
          walkEdgeCount++;
        }
      }
    }
  }

  let surveyedStopCount = 0;
  for (const s of stops.values()) if (!s.isEstimated) surveyedStopCount++;

  const graph: TransitGraph = {
    stops,
    adjacency,
    routeSequences,
    routeLabels,
    stats: {
      stopCount: stops.size,
      routeCount: routeSequences.size,
      rideEdgeCount,
      walkEdgeCount,
      surveyedStopCount,
      estimatedStopCount: stops.size - surveyedStopCount,
    },
  };
  graphCache.set(maxWalkKm, graph);
  return graph;
}

/** Clears every memoised graph. Only needed if the underlying route data changes. */
export function resetTransitGraph(): void {
  graphCache.clear();
}

// ──────────────────────── Stop lookup from user input ────────────────────────

/**
 * Tokens too common to identify a stop on their own. A query may match a stop by
 * containment ("Cuttack Badambadi" → "badambadi sq") only if the shared tokens
 * include something more specific than these.
 */
const GENERIC_TOKENS = new Set([
  'square', 'nagar', 'vihar', 'road', 'college', 'hospital', 'school', 'temple',
  'station', 'stand', 'gate', 'market', 'police', 'office', 'colony', 'pur',
  'sahi', 'patna', 'new', 'old', 'main', 'high', 'centre', 'center', 'park',
]);

/** Resolves free text such as "kiit sq" or "Cuttack Badambadi" to a graph stop. */
export function resolveStopQuery(query: string, graph = getTransitGraph()): GraphStop | null {
  const raw = (query ?? '').trim();
  if (!raw) return null;

  const direct = graph.stops.get(canonicalId(raw));
  if (direct) return direct;

  const n = normalize(raw);
  const queryTokens = tokenize(raw);
  const querySet = new Set(queryTokens);
  let best: GraphStop | null = null;
  let bestScore = 0;
  let bestTokenCount = Infinity;
  let bestRouteCount = -1;

  for (const stop of graph.stops.values()) {
    const stopTokens = tokenize(stop.label);
    let score = Math.max(
      tokenSetScore(queryTokens, stopTokens),
      spellingScore(queryTokens, stopTokens),
      normalize(stop.label) === n ? 1 : 0
    );

    // Containment: one side is a qualified version of the other, e.g. the query
    // "Cuttack Badambadi" against the stop "badambadi sq". Discounted, and only
    // trusted when a non-generic token is shared.
    const shared = stopTokens.filter((t) => querySet.has(t));
    if (shared.length > 0 && shared.some((t) => !GENERIC_TOKENS.has(t))) {
      const containment = shared.length / Math.min(querySet.size, new Set(stopTokens).size);
      score = Math.max(score, containment * 0.85);
    }

    // Ties are common on partial queries. Prefer the tighter label ("Badambadi"
    // over "badambadi busstand"), then the busier interchange — a bare "Puri"
    // should land on the bus stand served by 14 routes, not a minor ghat stop.
    const better =
      score > bestScore ||
      (score === bestScore &&
        (stopTokens.length < bestTokenCount ||
          (stopTokens.length === bestTokenCount && stop.routes.length > bestRouteCount)));
    if (better) {
      bestScore = score;
      bestTokenCount = stopTokens.length;
      bestRouteCount = stop.routes.length;
      best = stop;
    }
  }
  return bestScore >= FUZZY_THRESHOLD ? best : null;
}

/** Nearest stop to a coordinate — use this to snap a live GPS fix onto the network. */
export function nearestStop(
  coord: [number, number],
  graph = getTransitGraph()
): { stop: GraphStop; distanceKm: number } | null {
  let best: GraphStop | null = null;
  let bestKm = Infinity;
  for (const stop of graph.stops.values()) {
    const km = haversineKm(coord, [stop.lat, stop.lng]);
    if (km < bestKm) {
      bestKm = km;
      best = stop;
    }
  }
  return best ? { stop: best, distanceKm: bestKm } : null;
}

// ──────────────────────────── Dijkstra machinery ────────────────────────────

/** Binary min-heap keyed on cost. Plain array sorting is too slow at this node count. */
class MinHeap<T> {
  private items: Array<{ key: number; value: T }> = [];

  get size(): number {
    return this.items.length;
  }

  push(key: number, value: T): void {
    this.items.push({ key, value });
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].key <= this.items[i].key) break;
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }

  pop(): { key: number; value: T } | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let smallest = i;
        if (l < this.items.length && this.items[l].key < this.items[smallest].key) smallest = l;
        if (r < this.items.length && this.items[r].key < this.items[smallest].key) smallest = r;
        if (smallest === i) break;
        [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
        i = smallest;
      }
    }
    return top;
  }
}

type StepKind = 'access' | 'ride' | 'board' | 'walk' | 'egress';

interface Step {
  kind: StepKind;
  from: string;
  to: string;
  route: string;
  km: number;
}

interface SearchState {
  parent: string | null;
  step: Step | null;
  cost: number;
  rideKm: number;
  walkKm: number;
}

const stateKey = (stopId: string, route: string, transfers: number): string =>
  `${stopId}|${route}|${transfers}`;

/**
 * Finds the shortest journey between two stops across every Mo Bus route.
 *
 * Search model: states are (stop, boarded route, transfers used). Riding one stop
 * costs its real distance; changing bus costs `transferPenaltyKm`; walking costs
 * distance x `walkWeight`. An access walk at the start and an egress walk at the
 * end are free of transfer penalty, matching how transit routers treat them.
 */
export function findShortestRoute(
  originQuery: string,
  destinationQuery: string,
  options: ShortestRouteOptions = {}
): ShortestRouteResult {
  const {
    maxTransfers = 2,
    maxWalkKm = DEFAULT_MAX_WALK_KM,
    walkWeight = 2.5,
    transferPenaltyKm = 0.5,
  } = options;

  const empty = (reason: string): ShortestRouteResult => ({
    found: false,
    reason,
    totalDistanceKm: 0,
    rideDistanceKm: 0,
    walkDistanceKm: 0,
    transfers: 0,
    totalStops: 0,
    legs: [],
    routesUsed: [],
    estimatedStopCount: 0,
    confidence: 0,
  });

  const graph = getTransitGraph(maxWalkKm);
  const origin = resolveStopQuery(originQuery, graph);
  if (!origin) return empty(`Could not match "${originQuery}" to any Mo Bus stop.`);
  const destination = resolveStopQuery(destinationQuery, graph);
  if (!destination) return empty(`Could not match "${destinationQuery}" to any Mo Bus stop.`);
  if (origin.id === destination.id) return empty('Origin and destination are the same stop.');

  const visited = new Map<string, SearchState>();
  const heap = new MinHeap<{ stop: string; route: string; transfers: number }>();

  const relax = (
    stop: string,
    route: string,
    transfers: number,
    state: SearchState
  ): void => {
    const key = stateKey(stop, route, transfers);
    const existing = visited.get(key);
    if (existing && existing.cost <= state.cost) return;
    visited.set(key, state);
    heap.push(state.cost, { stop, route, transfers });
  };

  // Access: board at the origin, or at any stop a short walk away.
  const boardingPoints: Array<{ stop: GraphStop; walkKm: number }> = [
    { stop: origin, walkKm: 0 },
  ];
  for (const edge of graph.adjacency.get(origin.id) ?? []) {
    if (edge.route !== WALK_ROUTE) continue;
    const near = graph.stops.get(edge.to);
    if (near) boardingPoints.push({ stop: near, walkKm: edge.km });
  }
  for (const { stop, walkKm } of boardingPoints) {
    for (const route of stop.routes) {
      relax(stop.id, route, 0, {
        parent: null,
        // Record the access walk whenever boarding happens away from the origin,
        // even at 0 km — two stops can share a coordinate, and dropping the step
        // would make the journey appear to start at the wrong place.
        step:
          stop.id !== origin.id
            ? { kind: 'access', from: origin.id, to: stop.id, route: WALK_ROUTE, km: walkKm }
            : null,
        cost: walkKm * walkWeight,
        rideKm: 0,
        walkKm,
      });
    }
  }

  // Egress: stops from which the destination is reachable on foot.
  const egress = new Map<string, number>([[destination.id, 0]]);
  for (const edge of graph.adjacency.get(destination.id) ?? []) {
    if (edge.route === WALK_ROUTE) egress.set(edge.to, edge.km);
  }

  let bestFinishCost = Infinity;
  let bestFinishKey: string | null = null;
  let bestEgressKm = 0;

  while (heap.size > 0) {
    const popped = heap.pop()!;
    if (popped.key > bestFinishCost) break; // nothing cheaper can remain
    const { stop, route, transfers } = popped.value;
    const key = stateKey(stop, route, transfers);
    const state = visited.get(key);
    if (!state || state.cost < popped.key) continue; // stale heap entry

    const egressKm = egress.get(stop);
    if (egressKm !== undefined) {
      const finish = state.cost + egressKm * walkWeight;
      if (finish < bestFinishCost) {
        bestFinishCost = finish;
        bestFinishKey = key;
        bestEgressKm = egressKm;
      }
    }

    for (const edge of graph.adjacency.get(stop) ?? []) {
      if (edge.route === route) {
        // Stay on the same bus.
        relax(edge.to, route, transfers, {
          parent: key,
          step: { kind: 'ride', from: stop, to: edge.to, route, km: edge.km },
          cost: state.cost + edge.km,
          rideKm: state.rideKm + edge.km,
          walkKm: state.walkKm,
        });
      } else if (edge.route === WALK_ROUTE && transfers < maxTransfers) {
        // Walk to a nearby stop and board a different route there.
        const near = graph.stops.get(edge.to);
        if (!near) continue;
        for (const nextRoute of near.routes) {
          if (nextRoute === route) continue;
          relax(edge.to, nextRoute, transfers + 1, {
            parent: key,
            step: { kind: 'walk', from: stop, to: edge.to, route: WALK_ROUTE, km: edge.km },
            cost: state.cost + edge.km * walkWeight + transferPenaltyKm,
            rideKm: state.rideKm,
            walkKm: state.walkKm + edge.km,
          });
        }
      }
    }

    // In-place transfer: change to another route serving this same stop.
    if (transfers < maxTransfers) {
      const here = graph.stops.get(stop);
      if (here) {
        for (const nextRoute of here.routes) {
          if (nextRoute === route) continue;
          relax(stop, nextRoute, transfers + 1, {
            parent: key,
            step: { kind: 'board', from: stop, to: stop, route: nextRoute, km: 0 },
            cost: state.cost + transferPenaltyKm,
            rideKm: state.rideKm,
            walkKm: state.walkKm,
          });
        }
      }
    }
  }

  if (!bestFinishKey) {
    return empty(
      `No path found between "${origin.label}" and "${destination.label}" within ${maxTransfers} transfer(s).`
    );
  }

  // Walk the parent chain back to the origin, then flip it forward.
  const steps: Step[] = [];
  let cursor: string | null = bestFinishKey;
  while (cursor) {
    const state = visited.get(cursor);
    if (!state) break;
    if (state.step) steps.unshift(state.step);
    cursor = state.parent;
  }

  // The search may finish at a stop that merely neighbours the destination. Always
  // close the gap so the journey ends where the rider asked, even when the two
  // stops share a coordinate and the walk measures 0 km.
  const arrivedAt = steps.length > 0 ? steps[steps.length - 1].to : origin.id;
  if (arrivedAt !== destination.id) {
    steps.push({
      kind: 'egress',
      from: arrivedAt,
      to: destination.id,
      route: WALK_ROUTE,
      km: bestEgressKm,
    });
  }

  return assembleResult(graph, origin, destination, steps);
}

/** Groups atomic steps into rider-facing legs and totals the distances. */
function assembleResult(
  graph: TransitGraph,
  origin: GraphStop,
  destination: GraphStop,
  steps: Step[]
): ShortestRouteResult {
  const legs: ShortestRouteLeg[] = [];
  const label = (id: string): string => graph.stops.get(id)?.label ?? id;
  const coordOf = (id: string): [number, number] => {
    const s = graph.stops.get(id);
    return s ? [s.lat, s.lng] : [0, 0];
  };

  for (const step of steps) {
    if (step.kind === 'board') continue;

    const previous = legs[legs.length - 1];
    const isRide = step.kind === 'ride';

    if (
      previous &&
      ((isRide && previous.kind === 'ride' && previous.routeNumber === step.route) ||
        (!isRide && previous.kind === 'walk'))
    ) {
      previous.toStop = label(step.to);
      previous.intermediateStops.push(label(step.to));
      previous.stopCount = previous.intermediateStops.length;
      previous.distanceKm += step.km;
      previous.coordinates.push(coordOf(step.to));
      continue;
    }

    legs.push({
      kind: isRide ? 'ride' : 'walk',
      routeNumber: isRide ? step.route : undefined,
      routeName: isRide ? graph.routeLabels.get(step.route) : undefined,
      fromStop: label(step.from),
      toStop: label(step.to),
      intermediateStops: [label(step.to)],
      stopCount: 1,
      distanceKm: step.km,
      coordinates: [coordOf(step.from), coordOf(step.to)],
    });
  }

  const rideDistanceKm = legs
    .filter((l) => l.kind === 'ride')
    .reduce((sum, l) => sum + l.distanceKm, 0);
  const walkDistanceKm = legs
    .filter((l) => l.kind === 'walk')
    .reduce((sum, l) => sum + l.distanceKm, 0);
  const rideLegs = legs.filter((l) => l.kind === 'ride');

  // Confidence reflects how much of the path used surveyed rather than inferred coords.
  const pathStopIds = new Set<string>([origin.id, destination.id]);
  for (const step of steps) {
    pathStopIds.add(step.from);
    pathStopIds.add(step.to);
  }
  let estimatedStopCount = 0;
  for (const id of pathStopIds) {
    if (graph.stops.get(id)?.isEstimated) estimatedStopCount++;
  }

  const round = (n: number): number => Math.round(n * 100) / 100;
  for (const leg of legs) leg.distanceKm = round(leg.distanceKm);

  return {
    found: legs.length > 0,
    originStop: origin,
    destinationStop: destination,
    totalDistanceKm: round(rideDistanceKm + walkDistanceKm),
    rideDistanceKm: round(rideDistanceKm),
    walkDistanceKm: round(walkDistanceKm),
    transfers: Math.max(0, rideLegs.length - 1),
    totalStops: rideLegs.reduce((sum, l) => sum + l.stopCount, 0),
    legs,
    routesUsed: [...new Set(rideLegs.map((l) => l.routeNumber!))],
    estimatedStopCount,
    confidence: round(1 - estimatedStopCount / Math.max(1, pathStopIds.size)),
  };
}

/**
 * Same search, but starting from raw coordinates — snap a live GPS fix or a map pin
 * onto the nearest stop first. Returns the walk-to-stop distances alongside the route.
 */
export function findShortestRouteBetweenCoords(
  from: [number, number],
  to: [number, number],
  options: ShortestRouteOptions = {}
): ShortestRouteResult & { accessWalkKm: number; egressWalkKm: number } {
  const graph = getTransitGraph(options.maxWalkKm ?? DEFAULT_MAX_WALK_KM);
  const a = nearestStop(from, graph);
  const b = nearestStop(to, graph);
  if (!a || !b) {
    return {
      found: false,
      reason: 'The transit graph is empty.',
      totalDistanceKm: 0,
      rideDistanceKm: 0,
      walkDistanceKm: 0,
      transfers: 0,
      totalStops: 0,
      legs: [],
      routesUsed: [],
      estimatedStopCount: 0,
      confidence: 0,
      accessWalkKm: 0,
      egressWalkKm: 0,
    };
  }
  const result = findShortestRoute(a.stop.label, b.stop.label, options);
  return {
    ...result,
    accessWalkKm: Math.round(a.distanceKm * 100) / 100,
    egressWalkKm: Math.round(b.distanceKm * 100) / 100,
  };
}

/**
 * Returns up to `count` distinct journeys, shortest first. Alternatives are found by
 * re-running the search with progressively tighter transfer limits and then with the
 * previous winner's primary route excluded, which is enough variety for a UI carousel
 * without the cost of a full k-shortest-paths implementation.
 */
export function findRouteAlternatives(
  originQuery: string,
  destinationQuery: string,
  count = 3,
  options: ShortestRouteOptions = {}
): ShortestRouteResult[] {
  const results: ShortestRouteResult[] = [];
  const seen = new Set<string>();

  const consider = (result: ShortestRouteResult): void => {
    if (!result.found) return;
    const signature = result.routesUsed.join('>') + '|' + result.transfers;
    if (seen.has(signature)) return;
    seen.add(signature);
    results.push(result);
  };

  // Direct-only first, then one transfer, then the unconstrained optimum.
  const maxTransfers = options.maxTransfers ?? 2;
  for (let limit = 0; limit <= maxTransfers; limit++) {
    consider(findShortestRoute(originQuery, destinationQuery, { ...options, maxTransfers: limit }));
  }

  // Nudge toward different corridors by discouraging walking, then by allowing more.
  consider(
    findShortestRoute(originQuery, destinationQuery, { ...options, maxWalkKm: 0.05 })
  );
  consider(
    findShortestRoute(originQuery, destinationQuery, { ...options, transferPenaltyKm: 3 })
  );

  return results.sort((x, y) => x.totalDistanceKm - y.totalDistanceKm).slice(0, count);
}
