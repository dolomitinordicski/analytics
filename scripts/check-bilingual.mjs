import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const fail=(message)=>{ console.error('✗',message); process.exitCode=1; };
const ok=(message)=>console.log('✓',message);

const app=read('src/App.tsx');
const modules=read('src/modules/AnalyticsModules.tsx');
const ui=read('src/components/Ui.tsx');
const live=read('src/components/LiveSourcePanel.tsx');
const print=read('src/components/AnalyticsPrintSheet.tsx');
const foundation=read('src/services/foundation.ts');
const main=read('src/main.tsx');
const index=read('index.html');

if (!index.includes('<html lang="de">')) fail('German must be the initial document language');
for (const [label,content,token] of [
  ['App',app,'getDNSAnalyticsLanguage'],
  ['App',app,'setDNSAnalyticsLanguage'],
  ['App',app,'subscribeDNSAnalyticsLanguage'],
  ['Foundation',foundation,'initDNSFoundation'],
  ['bootstrap',main,'initDNSAnalyticsFoundation'],
]) {
  if (!content.includes(token)) fail(`Foundation language contract missing: ${label} · ${token}`);
}
if (/dns-analytics-language|LANGUAGE_KEY/.test(app)) fail('legacy Analytics-local language storage remains');
for (const token of ['labelDe:','labelIt:','language === \'de\' ? t.labelDe : t.labelIt']) {
  if (!app.includes(token)) fail('tab navigation is not fully language-aware: '+token);
}
if (/label:'[^']*(?: · | \/ )[^']*'/.test(app)) fail('mixed-language tab label found');

for (const token of ['titleDe?: string','titleIt?: string','subtitleDe?: string','subtitleIt?: string','BilingualText']) {
  if (!ui.includes(token)) fail('bilingual UI primitive missing: '+token);
}
if (!ui.includes('<BilingualText de="Quelle:" it="Fonte:"/>')) fail('methodology source label is not language-aware');

const staticCardTitles=[...modules.matchAll(/<Card\s+title="([^"]+)"/g)].map(m=>m[1]);
if (staticCardTitles.length) fail('static Card titles bypass DE/IT contract: '+staticCardTitles.join(' | '));

for (const token of [
  'titleDe="Anzahl Tickets"',
  'titleIt="Quantità biglietti"',
  'titleDe="KP pro Region',
  'titleIt="KP per regione',
  'titleDe="Interaktiver Simulator"',
  'titleIt="Simulatore interattivo"',
  'titleDe="Übernachtungen pro Gebiet',
  'titleIt="Pernottamenti per area',
]) if (!modules.includes(token)) fail('representative bilingual module copy missing: '+token);

const sourceBadgeCount=(modules.match(/<SourceBadge/g)||[]).length;
const sourceBadgeDeCount=(modules.match(/\sde=\{/g)||[]).length+(modules.match(/\sde="/g)||[]).length;
const sourceBadgeItCount=(modules.match(/\sit=\{/g)||[]).length+(modules.match(/\sit="/g)||[]).length;
if (sourceBadgeCount<8) fail('expected source badges not found');
if (sourceBadgeDeCount<sourceBadgeCount || sourceBadgeItCount<sourceBadgeCount) fail('one or more source badges are not DE/IT paired');

if (!live.includes("language==='de'?'Passwort':'Password'")) fail('login password placeholder is not localized');
if ((live.match(/publicBaseline\.mismatches\.slice/g)||[]).length!==1) fail('public baseline diagnostics should render exactly once in unauthenticated panel');

if (!print.includes("language:'de'|'it'")) fail('print sheet does not receive active language');
if (!print.includes("language==='de'?'WS 2025-26':'SI 2025-26'")) fail('print season label is not localized');

if (!process.exitCode) {
  ok('DE-first / IT-second bilingual contract is enforced through Foundation');
  ok('mixed static Card titles are eliminated');
  ok('source, methodology and print UI are language-aware');
} else {
  process.exit(process.exitCode);
}
