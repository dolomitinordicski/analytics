import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error('✗', message);
  process.exitCode = 1;
};
const ok = (message) => console.log('✓', message);

const app = read('src/App.tsx');
const modules = read('src/modules/AnalyticsModules.tsx');
const data = read('src/data/analyticsData.ts');
const css = read('src/styles/index.css');
const pkg = JSON.parse(read('package.json'));

const requiredTabs = [
  'overview','annual','regions','reliability','advanced','overnights','intensity',
];
for (const id of requiredTabs) {
  if (!app.includes(`id:'${id}'`)) fail(`missing Analytics tab: ${id}`);
}
if (!process.exitCode) ok('all 7 Analytics modules are registered');

const requiredExports = [
  'OverviewModule','AnnualModule','RegionalModule','ReliabilityModule',
  'AdvancedModule','OvernightModule','IntensityModule',
];
for (const name of requiredExports) {
  if (!modules.includes(`export function ${name}`)) fail(`missing module export: ${name}`);
}
if (!process.exitCode) ok('all 7 module implementations are present');

const lockedValues = [
  ['totalTickets', '77462'],
  ['totalRevenue', '1890388'],
  ['avgPrice', '24.40'],
  ['topRegionRevenue', '702623'],
  ['topRegionTickets', '28023'],
  ['latest total tickets', 'totalTickets:[76595,83786,88013,77462]'],
  ['latest total revenue', 'totalRevenue:[1572292,1767774,2051327,1890388]'],
];
for (const [label, token] of lockedValues) {
  if (!data.includes(token)) fail(`preserved A.2.1 value changed: ${label}`);
}
if (!process.exitCode) ok('preserved core Analytics values match A.2.1');

const lockedColors = [
  ['deep','#0D4D5E'], ['mid','#417483'], ['light','#AAD0D1'],
  ['day','#D4CEC6'], ['wkArea','#8B3A2F'], ['skArea','#7A7875'],
];
for (const [label, color] of lockedColors) {
  if (!data.includes(`${label}: '${color}'`)) fail(`chart color changed: ${label}`);
}
if (!process.exitCode) ok('historical chart palette is preserved');

const prohibited = [
  ['window.open', /window\.open/],
  ['document.write', /document\.write/],
  ['Tailwind v3 directives', /@tailwind\s+(base|components|utilities)/],
  ['fixed sticky navigation offset', /top:\s*(62|68)px/],
];
const activeText = [app, modules, css].join('\n');
for (const [label, pattern] of prohibited) {
  if (pattern.test(activeText)) fail(`legacy pattern found: ${label}`);
}
if (!process.exitCode) ok('no prohibited legacy runtime patterns found');

for (const path of ['dns-core.js','fairmodel.html','logo.png','DNS_Guida_Aggiornamento_Dati.md.pdf']) {
  if (fs.existsSync(path)) fail(`legacy repository file still present: ${path}`);
}
if (!process.exitCode) ok('legacy repository files remain removed');

if (!pkg.dependencies?.['@dolomitinordicski/dns-shared-data']) {
  fail('shared DNS Foundation package dependency missing');
} else {
  ok('shared DNS Foundation package is pinned');
}

if (pkg.devDependencies?.tailwindcss?.startsWith('^4.') !== true || !pkg.devDependencies?.['@tailwindcss/vite']) {
  fail('Tailwind v4 / Vite integration is not configured');
} else {
  ok('Tailwind v4 / Vite integration is configured');
}

if (process.exitCode) {
  console.error('\nA.2.2 parity guardrails failed.');
  process.exit(process.exitCode);
}
console.log('\nA.2.2 parity guardrails passed.');
