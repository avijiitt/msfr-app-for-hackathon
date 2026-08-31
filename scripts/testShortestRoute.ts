/**
 * Test harness for src/services/shortestRouteService.ts
 *
 *   npx tsx scripts/testShortestRoute.ts
 *
 * Prints the transit graph it built from MO_BUS_DETAILED_ROUTES, then runs a set
 * of assertions and journey samples. Exits non-zero if any assertion fails, so
 * it also works as a CI smoke test.
 *
 * Nothing here touches the React app, the network, or the Express server.
 */

import {
  getTransitGraph,
  resetTransitGraph,
  resolveStopQuery,
  nearestStop,
  findShortestRoute,
  findShortestRouteBetweenCoords,
  findRouteAlternatives,
  haversineKm,
  type ShortestRouteResult,
} from '../src/services/shortestRouteService';

// ──────────────────────────── tiny assert harness ────────────────────────────

let passed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = ''): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(name + (detail ? ` — ${detail}` : ''));
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

function printJourney(r: ShortestRouteResult): void {
  if (!r.found) {
    console.log(`    not found: ${r.reason}`);
    return;
  }
  console.log(
    `    ${r.originStop!.label} → ${r.destinationStop!.label}  ` +
      `${r.totalDistanceKm} km (${r.rideDistanceKm} riding, ${r.walkDistanceKm} walking), ` +
      `${r.transfers} transfer(s), ${r.totalStops} stops, confidence ${r.confidence}`
  );
  for (const leg of r.legs) {
    const head =
      leg.kind === 'ride'
        ? `bus ${leg.routeNumber!.padEnd(4)}`
        : leg.distanceKm === 0
          ? 'same stop'
          : 'walk     ';
    console.log(
      `      ${head} ${leg.fromStop} → ${leg.toStop}` +
        `  (${leg.stopCount} stop${leg.stopCount === 1 ? '' : 's'}, ${leg.distanceKm} km)`
    );
  }
}

// ─────────────────────────────── 1. the graph ───────────────────────────────

section('1. Graph built from MO_BUS_DETAILED_ROUTES');

resetTransitGraph();
const t0 = Date.now();
const graph = getTransitGraph();
const buildMs = Date.now() - t0;

console.log(`  built in ${buildMs} ms`);
console.log(`  stops                 ${graph.stats.stopCount}`);
console.log(`  routes                ${graph.stats.routeCount}`);
console.log(`  ride edges            ${graph.stats.rideEdgeCount}`);
console.log(`  walking transfers     ${graph.stats.walkEdgeCount}`);
console.log(`  surveyed coordinates  ${graph.stats.surveyedStopCount}`);
console.log(`  inferred coordinates  ${graph.stats.estimatedStopCount}`);
console.log('');

check('graph has stops', graph.stats.stopCount > 500, `got ${graph.stats.stopCount}`);
check('graph has every route', graph.stats.routeCount >= 80, `got ${graph.stats.routeCount}`);
check('ride edges are bidirectional', graph.stats.rideEdgeCount % 2 === 0);
check('some walking transfers exist', graph.stats.walkEdgeCount > 0);
check(
  'every stop has a coordinate',
  [...graph.stops.values()].every((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
);
check(
  'every coordinate is inside Odisha',
  [...graph.stops.values()].every(
    (s) => s.lat > 18 && s.lat < 23 && s.lng > 83 && s.lng < 88
  ),
  'a stop fell outside the state bounding box'
);
check('graph is memoised', getTransitGraph() === graph);

// ───────────────────────────── 2. name matching ─────────────────────────────

section('2. Free-text stop matching');

const matches: Array<[string, string]> = [
  ['kiit sq', 'kiit'],
  ['KIIT Square', 'kiit'],
  ['Jaydev Vihar', 'vihar'],
  ['jayadev bihar', 'vihar'],
  ['master canteen', 'canteen'],
  ['Cuttack Badambadi', 'badambadi'],
  ['patia square', 'patia'],
  ['Baramunda', 'baramunda'],
  ['Nandankanan', 'nandankanan'],
];
for (const [query, expectFragment] of matches) {
  const stop = resolveStopQuery(query, graph);
  check(
    `"${query}" resolves`,
    !!stop && stop.label.toLowerCase().includes(expectFragment),
    stop ? `got "${stop.label}"` : 'no match'
  );
}
check('nonsense input resolves to nothing', resolveStopQuery('zzqx nowhere at all', graph) === null);
check('empty input resolves to nothing', resolveStopQuery('', graph) === null);

const snap = nearestStop([20.3549, 85.8199], graph); // KIIT area
check(
  'a GPS fix snaps onto a nearby stop',
  !!snap && snap.distanceKm < 3,
  snap ? `${snap.stop.label} at ${snap.distanceKm.toFixed(2)} km` : 'no stop found'
);

// ────────────────────────── 3. geometry sanity check ──────────────────────────

section('3. Distance function');

const bbsr: [number, number] = [20.2961, 85.8245];
const ctc: [number, number] = [20.4625, 85.8828];
const km = haversineKm(bbsr, ctc);
check('Bhubaneswar to Cuttack is ~20 km', km > 15 && km < 25, `${km.toFixed(1)} km`);
check('a point is zero km from itself', haversineKm(bbsr, bbsr) === 0);

// ──────────────────────────── 4. real journeys ────────────────────────────

section('4. Journeys');

const journeys: Array<[string, string]> = [
  ['Master canteen', 'patia square'],
  ['KIIT Square', 'Baramunda'],
  ['Jaydev Vihar', 'Cuttack Badambadi'],
  ['Nandankanan', 'Baramunda'],
  ['Rasulgarh', 'Sishu Bhawan'],
];

for (const [from, to] of journeys) {
  console.log(`\n  ${from} → ${to}`);
  const r = findShortestRoute(from, to);
  printJourney(r);
  check(`  route found: ${from} → ${to}`, r.found, r.reason);
  if (!r.found) continue;

  check('  distance is positive', r.totalDistanceKm > 0);
  check(
    '  totals add up',
    Math.abs(r.rideDistanceKm + r.walkDistanceKm - r.totalDistanceKm) < 0.02,
    `${r.rideDistanceKm} + ${r.walkDistanceKm} vs ${r.totalDistanceKm}`
  );
  check(
    '  legs are contiguous',
    r.legs.every((leg, i) => i === 0 || r.legs[i - 1].toStop === leg.fromStop)
  );
  check('  first leg starts at the origin', r.legs[0].fromStop === r.originStop!.label);
  check(
    '  last leg ends at the destination',
    r.legs[r.legs.length - 1].toStop === r.destinationStop!.label,
    `ends at "${r.legs[r.legs.length - 1].toStop}"`
  );
  check(
    '  transfer count matches the bus legs',
    r.transfers === Math.max(0, r.legs.filter((l) => l.kind === 'ride').length - 1)
  );
  check('  every leg has a drawable polyline', r.legs.every((l) => l.coordinates.length >= 2));
  check('  confidence is a fraction', r.confidence >= 0 && r.confidence <= 1);
}

// ───────────────────── 5. transfer limits and optimality ─────────────────────

section('5. Transfer budget');

const relaxed = findShortestRoute('Master canteen', 'patia square', { maxTransfers: 2 });
const direct = findShortestRoute('Master canteen', 'patia square', { maxTransfers: 0 });

console.log('\n  up to 2 transfers:');
printJourney(relaxed);
console.log('\n  direct buses only:');
printJourney(direct);

check('maxTransfers: 0 yields a single bus', !direct.found || direct.transfers === 0);
check(
  'allowing transfers never costs more distance',
  !relaxed.found || !direct.found || relaxed.totalDistanceKm <= direct.totalDistanceKm + 0.01,
  `${relaxed.totalDistanceKm} km with transfers vs ${direct.totalDistanceKm} km direct`
);

const tightWalk = findShortestRoute('KIIT Square', 'Baramunda', { maxWalkKm: 0.01 });
check(
  'a tiny walking radius still finds something or fails cleanly',
  tightWalk.found ? tightWalk.walkDistanceKm <= 0.05 : typeof tightWalk.reason === 'string',
  tightWalk.found ? `${tightWalk.walkDistanceKm} km walking` : tightWalk.reason
);

// ──────────────────────────── 6. alternatives ────────────────────────────

section('6. Alternatives');

const alternatives = findRouteAlternatives('Master canteen', 'patia square', 3);
for (const alt of alternatives) {
  console.log(
    `    ${alt.routesUsed.join(' → ').padEnd(20)} ${String(alt.totalDistanceKm).padStart(6)} km  ` +
      `${alt.transfers} transfer(s)`
  );
}
check('alternatives are returned', alternatives.length > 0);
check(
  'alternatives are sorted shortest first',
  alternatives.every((a, i) => i === 0 || alternatives[i - 1].totalDistanceKm <= a.totalDistanceKm)
);
check(
  'alternatives are distinct',
  new Set(alternatives.map((a) => a.routesUsed.join('>') + '|' + a.transfers)).size ===
    alternatives.length
);
check(
  'the best alternative equals the shortest route',
  alternatives.length === 0 ||
    Math.abs(alternatives[0].totalDistanceKm - relaxed.totalDistanceKm) < 0.01,
  `${alternatives[0]?.totalDistanceKm} vs ${relaxed.totalDistanceKm}`
);

// ─────────────────────── 7. routing from raw coordinates ───────────────────────

section('7. Routing from GPS coordinates');

const byCoords = findShortestRouteBetweenCoords([20.3549, 85.8199], [20.2604, 85.8007]);
console.log(
  `    access walk ${byCoords.accessWalkKm} km, egress walk ${byCoords.egressWalkKm} km`
);
printJourney(byCoords);
check('a coordinate pair produces a journey', byCoords.found, byCoords.reason);
check('access and egress walks are reported', byCoords.accessWalkKm >= 0 && byCoords.egressWalkKm >= 0);

// ───────────────────────── 8. degenerate input ─────────────────────────

section('8. Degenerate input');

const same = findShortestRoute('KIIT Square', 'kiit sq');
check('origin equal to destination is rejected, not crashed', !same.found, same.reason);

const missing = findShortestRoute('qqqq', 'patia square');
check('an unmatched origin is reported', !missing.found && /Could not match/.test(missing.reason!));
check('a failed search still returns zeroed totals', missing.totalDistanceKm === 0 && missing.legs.length === 0);

// ──────────────────────────── 9. performance ────────────────────────────

section('9. Performance');

const t1 = Date.now();
const iterations = 20;
for (let i = 0; i < iterations; i++) findShortestRoute('Master canteen', 'patia square');
const perSearch = (Date.now() - t1) / iterations;
console.log(`    ${perSearch.toFixed(1)} ms per search on the warm graph`);
check('a warm search is under 250 ms', perSearch < 250, `${perSearch.toFixed(1)} ms`);

// ──────────────────────────────── summary ────────────────────────────────

console.log(`\n${'='.repeat(60)}`);
if (failures.length === 0) {
  console.log(`ALL ${passed} CHECKS PASSED`);
} else {
  console.log(`${passed} passed, ${failures.length} FAILED:`);
  for (const f of failures) console.log(`  - ${f}`);
}
console.log('='.repeat(60));

process.exit(failures.length === 0 ? 0 : 1);
