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
const printSheet = read('src/components/AnalyticsPrintSheet.tsx');
const pkg = JSON.parse(read('package.json'));
const metrics = read('src/data/metrics.ts');
const scopes = read('src/data/scopes.ts');
const architecture = read('src/data/architecture.ts');
const boundary = read('src/services/analyticsBoundary.ts');
const auth = read('src/services/auth.ts');
const liveAnalytics = read('src/services/liveAnalytics.ts');
const parity = read('src/services/parity.ts');
const livePanel = read('src/components/LiveSourcePanel.tsx');
const liveContext = read('src/components/AnalyticsLiveContext.tsx');
const overviewSelector = read('src/services/overviewSelector.ts');
const regionalSelector = read('src/services/regionalSelector.ts');
const reliabilitySelector = read('src/services/reliabilitySelector.ts');
const kpPartnerSelector = read('src/services/kpPartnerSelector.ts');
const annualSelector = read('src/services/annualSelector.ts');
const advancedSelector = read('src/services/advancedSelector.ts');
const overnightSelector = read('src/services/overnightSelector.ts');
const intensitySelector = read('src/services/intensitySelector.ts');
const editorial = read('src/data/editorial.ts');
const ui = read('src/components/Ui.tsx');
const legacy = read('src/data/legacyDashboard.ts');
const derivedKpis = read('src/services/derivedKpis.ts');

const requiredTabs = [
  'overview','annual','regions','reliability','advanced','overnights','intensity',
];
for (const id of requiredTabs) {
  if (!app.includes(`id:'${id}'`)) fail(`missing Analytics tab: ${id}`);
}
if (!process.exitCode) ok('all 7 Analytics modules are registered');

for (const token of ['role="tablist"','role="tab"','aria-selected','role="tabpanel"','hashchange','ArrowRight','ArrowLeft']) {
  if (!app.includes(token)) fail(`tab navigation contract missing: ${token}`);
}
if (!process.exitCode) ok('tab navigation supports semantics, keyboard control and deep links');

for (const token of ['dns-analytics-language','localStorage','dataset.analyticsLanguage','aria-pressed','refreshCore','analytics-runtime-state']) {
  if (!app.includes(token)) fail(`language/runtime state contract missing: ${token}`);
}
if (!process.exitCode) ok('language persistence and DNS_Core loading/error behavior are wired');

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

for (const token of ['data-analytics-language','analytics-runtime-state','@media (max-width: 420px)']) {
  if (!css.includes(token)) fail(`responsive/language CSS guardrail missing: ${token}`);
}
if (!process.exitCode) ok('responsive and language CSS guardrails are present');

if (!app.includes('printActive') || !printSheet.includes('if (!active) return null')) {
  fail('print portal must mount only during an active print cycle');
} else {
  ok('print portal does not duplicate hidden Chart.js instances during normal use');
}

if (!printSheet.includes('DNS_SHARED_PRINT_LOGO_URL')) {
  fail('print sheet does not use the canonical DNS print logo');
} else {
  ok('print sheet uses the canonical DNS print logo');
}

for (const path of ['dns-core.js','fairmodel.html','logo.png','DNS_Guida_Aggiornamento_Dati.md.pdf']) {
  if (fs.existsSync(path)) fail(`legacy repository file still present: ${path}`);
}
if (!process.exitCode) ok('legacy repository files remain removed');

if (!pkg.dependencies?.['@dolomitinordicski/dns-shared-data']) {
  fail('shared DNS Foundation package dependency missing');
} else {
  ok('shared DNS Foundation package is pinned');
}

for (const [label, content, tokens] of [
  ['metric catalog', metrics, ['tickets.total.qty','trails.kp.ratio']],
  ['scope catalog', scopes, ['dns-network','resolveReportingAreaId']],
  ['layer architecture', architecture, ['analyticsAggregates','analyticsModels','analyticsAssumptions']],
  ['DNS_Core boundary', boundary, ['dns-core-ready','compatibility-fallback']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.2.3 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.2.3 metric/scope/layer/boundary architecture is present');

for (const [label, content, tokens] of [
  ['auth layer', auth, ['signInWithEmailAndPassword','ticketSales.read','kp.read']],
  ['live adapter', liveAnalytics, ['ticketSales','kpEntries','kpFairValidations','aggregateSales','aggregateKp']],
  ['parity diagnostics', parity, ['compareLiveToCompatibility','tickets-total','revenue-total']],
  ['live source UI', livePanel, ['LiveSourcePanel','Compatibility-Datensatz','paritySummary']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.1 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.1 authenticated operational layer and parity diagnostics are present');

for (const [label, content, tokens] of [
  ['live runtime context', liveContext, ['AnalyticsLiveProvider','overviewLiveReady']],
  ['Overview selector', overviewSelector, ['selectOverviewDataset','source:\'live\'','byReportingArea','byProduct']],
  ['Overview live switch', modules, ['useAnalyticsLive','selectOverviewDataset','analytics-source-badge']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.2 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.2 guarded Overview live switch is present');

for (const [label, content, tokens] of [
  ['regional matrix aggregate', liveAnalytics, ['byReportingAreaProduct']],
  ['regional parity gate', parity, ['compareRegionalToCompatibility','regionalParitySummary','regional-qty-','regional-revenue-']],
  ['Regional selector', regionalSelector, ['selectRegionalDataset','source:\'live\'','totalRevenue']],
  ['Regional live switch', modules, ['regionalLiveReady','selectRegionalDataset','regional parity verified']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.3 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.3 guarded Regional live switch is present');

for (const [label, content, tokens] of [
  ['KP milestone aggregate', liveAnalytics, ['kpMilestones','byAreaMilestone','source:\'validation\'','source:\'entries\'']],
  ['KP parity gate', parity, ['compareKpToCompatibility','kpParitySummary','kp-potential-','kp-opened-','kp-artificial-']],
  ['Reliability selector', reliabilitySelector, ['selectReliabilityDataset','source:\'live\'','MILESTONE_DATES']],
  ['Reliability live switch', modules, ['reliabilityLiveReady','selectReliabilityDataset','KP parity verified','Partner detail · Compatibility dataset']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.4 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.4 guarded Reliability/KP live switch is present');

for (const [label, content, tokens] of [
  ['historical adapter', liveAnalytics, ['historicalSeasonRecords','historicalSalesRows','historicalKpSnapshot','historical-season-records']],
  ['KP partner parity', parity, ['compareKpPartnersToCompatibility','kpPartnerParitySummary','kp-partner-pot-','kp-partner-open3-']],
  ['KP partner selector', kpPartnerSelector, ['selectKpPartnerDataset','item.label===legacy.p','source:\'live\'']],
  ['KP partner module switch', modules, ['kpPartnerLiveReady','selectKpPartnerDataset','DNS_Core historical · partner parity verified']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.5 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.5 immutable historical adapter and KP partner switch are present');

for (const [label, content, tokens] of [
  ['annual historical loader', liveAnalytics, ['LiveAnnualSeries','annualCategoryCode','annualFrom2024Record','annual2025FromSales','loadHistoricalAnnualSeries','sk-instructor']],
  ['annual parity gate', parity, ['compareAnnualToCompatibility','annualParitySummary','annual-total-qty-','annual-total-revenue-']],
  ['Annual selector', annualSelector, ['selectAnnualDataset','source:\'live\'','revenueByType']],
  ['Annual module switch', modules, ['annualLiveReady','selectAnnualDataset','annual parity verified']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.6 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.6 immutable four-season Annual switch is present');

for (const [label, content, tokens] of [
  ['Advanced observed selector', advancedSelector, ['selectAdvancedObservedInputs','weeklyTicketsNetwork','weeklyTicketsSouthTyrol','dayTickets']],
  ['Advanced observed parity', parity, ['compareAdvancedObservedInputs','advancedObservedParitySummary','advanced-weekly-network','advanced-day']],
  ['Advanced module switch', modules, ['advancedLiveReady','selectAdvancedObservedInputs','observed inputs verified','Assumptions: nights/guest']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.7 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.7 Advanced Analytics observed inputs are guarded and assumptions remain explicit');

for (const [label, content, tokens] of [
  ['FAIR snapshot loader', liveAnalytics, ['fairModel','ws-2026-27','readFairSnapshot','FairRegionInput']],
  ['Overnight selector', overnightSelector, ['selectOvernightDataset','seiser-alm-dolomites-val-gardena','source:\'fair\'']],
  ['Overnight parity', parity, ['compareFairOvernightsToCompatibility','overnightParitySummary','overnight-pn-']],
  ['Overnight module switch', modules, ['overnightLiveReady','selectOvernightDataset','PN parity verified','not provided by FAIR']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.8 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.8 Overnight PN is sourced from FAIR with guarded parity');

for (const [label, content, tokens] of [
  ['Intensity selector', intensitySelector, ['selectIntensityDataset','wk-area','wk-dns','products.day','fairPn']],
  ['Intensity parity', parity, ['compareIntensityInputsToCompatibility','intensityParitySummary','intensity-wk-','intensity-day-','intensity-pn-']],
  ['Intensity module switch', modules, ['intensityLiveReady','selectIntensityDataset','DNS_Core Sales + DNS FAIR PN','Model assumptions preserved']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.9 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.9 Langlauf intensity is sourced from DNS_Core sales plus FAIR PN');

for (const [label, content, tokens] of [
  ['Editorial protocol', editorial, ['classification:\'observed\'','classification:\'external-source\'','classification:\'assumption\'','classification:\'limitation\'','ASTAT','Seilbahnen Österreich','DNS FAIR Model']],
  ['Editorial UI', ui, ['EditorialSummary','MethodologyPanel','Quelle · Fonte']],
  ['Editorial module integration', modules, ['editorialSummaries.overview','editorialSummaries.annual','editorialSummaries.regional','reliabilityMethodology','advancedMethodology','overnightMethodology','intensityMethodology']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.10 ${label} missing: ${token}`);
}
if (!process.exitCode) ok('A.3.10 editorial analyses and methodology/source protocol are integrated');

for (const [label, content, tokens] of [
  ['derived KPI service', derivedKpis, ['deriveOverviewKpis','deriveAnnualKpis','deriveRegionalKpis','nonDayEntropy']],
  ['derived KPI rendering', modules, ['deriveOverviewKpis','deriveAnnualKpis','deriveRegionalKpis','observed.weeklyRevenueNetwork','observed.weeklyRevenueArea','observed.weeklyRevenueDns']],
  ['Advanced revenue selector', advancedSelector, ['weeklyRevenueNetwork','weeklyRevenueArea','weeklyRevenueDns']],
  ['Advanced revenue parity', parity, ['advanced-wk-area-revenue','advanced-wk-dns-revenue','const expected=5']],
]) {
  for (const token of tokens) if (!content.includes(token)) fail(`A.3.11B ${label} missing: ${token}`);
}
for (const forbidden of ['value="2.355"','value="+97%"','value="+20,2%"','value="Ahrntal+Sand"','legacyAdvancedCopy.weeklyRevenue)}</strong>']) {
  if (modules.includes(forbidden)) fail(`A.3.11B hardcoded visible KPI remains: ${forbidden}`);
}
if (!process.exitCode) ok('A.3.11B visible KPIs are derived from the active datasets');


const legacySourceTokens = [
  'Büro 77% · Online 15% · Loipe 7%',
  'Esterno: Entrate · Interno: quantità',
  'Osttirol — starke lokale SK Area Verankerung',
  '3 Zinnen — starker Beitrag zum DNS WK',
  'Comelico & Cortina — strategische Reichweite',
  'Ahrntal+Sand — stark bei DAY, Potenzial für DNS',
  'Hebelwirkung des Langlaufs',
  'Wochenkarte = Aufenthalt',
  'Langlauf = sanfter Tourismus',
  'Break-Even: ab 5,1 Skitagen',
  'weeklyRevenue: 425398',
  'total2425: 5650468',
  "topArea2425: 'Gröden'",
  'winterWindowNights: 12133762',
  'winterWindowArrivals: 2764842',
  'topMunicipalityMarchNights: 166322',
  'Biathlon Antholz vom KP ausgeschlossen',
  'Osttirol vorläufig',
];
for (const token of legacySourceTokens) {
  if (!legacy.includes(token)) fail(`legacy HTML content missing from preservation dataset: ${token}`);
}
if (!process.exitCode) ok('legacy dns_dashboardf.html editorial/context content is preserved');

const legacyRenderTokens = [
  'legacyOverviewNotes.channelMix',
  'legacyAnnualDelta.map',
  'legacyAnnualPrices2025.map',
  'legacyRegionalInsights.map',
  'legacyReliabilityCopy.classification.map',
  'legacyAdvancedCopy.insights.map',
  'legacyOvernightCopy.total2425',
  'legacyOvernightCopy.months.map',
  'legacyOvernightCopy.provinceSource',
];
for (const token of legacyRenderTokens) {
  if (!modules.includes(token)) fail(`legacy HTML content is preserved but not rendered: ${token}`);
}
if (!process.exitCode) ok('legacy HTML content is rendered in the current Analytics modules');

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
