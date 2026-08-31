import { MO_BUS_DETAILED_ROUTES, STOP_COORDINATES_MAP } from './src/data/busRoutesData';

const norm = (s: string) =>
  s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();

const coordKeys = Object.keys(STOP_COORDINATES_MAP);
console.log('routes:', MO_BUS_DETAILED_ROUTES.length);
console.log('coord map keys:', coordKeys.length);

const all = new Set<string>();
for (const r of MO_BUS_DETAILED_ROUTES) {
  for (const s of r.stopsList) all.add(norm(s));
  all.add(norm(r.start));
  all.add(norm(r.destination));
}
console.log('distinct normalized stops:', all.size);

const exact = [...all].filter((s) => STOP_COORDINATES_MAP[s]);
console.log('exact coord hits:', exact.length);
const missing = [...all].filter((s) => !STOP_COORDINATES_MAP[s]);
console.log('missing:', missing.length);
console.log('--- sample missing (40) ---');
console.log(missing.slice(0, 40).join('\n'));
console.log('--- sample coord keys (30) ---');
console.log(coordKeys.slice(0, 30).join('\n'));
console.log('--- stops per route (first 12) ---');
for (const r of MO_BUS_DETAILED_ROUTES.slice(0, 12)) {
  console.log(`  route ${r.route}: ${r.stopsList.length} stops`);
}
