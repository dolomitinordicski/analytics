import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const fail=(message)=>{ console.error('✗',message); process.exitCode=1; };
const ok=(message)=>console.log('✓',message);

const sources=read('src/data/referenceSources.ts');
const modules=read('src/modules/AnalyticsModules.tsx');
const ui=read('src/components/Ui.tsx');

for (const token of [
  "reliability:'official'",
  "reliability:'assumption'",
  "reliability:'provisional'",
  'DNS — VERKAUFSTATISTIK',
  'KP Artificial vs. natural snow 2025-26',
  'Seilbahnen Österreich',
  'Tourism Satellite Account',
  'Land Tirol / Statistik Austria / Tirol Werbung',
  'Cortina d’Ampezzo — PN 2024-25',
  'DNS-Gebiete ≠ amtliche Statistikeinheiten',
  'overnightWorkingPn2526',
]) {
  if (!sources.includes(token)) fail('reference-source dossier missing: '+token);
}

for (const token of [
  'ReferencePanel',
  'data-status={state(item.reliability)}',
  'Offiziell / überprüfbar',
  'Ufficiale / verificabile',
  'Vorläufig / zu prüfen',
  'Provvisorio / da verificare',
]) {
  if (!ui.includes(token)) fail('reference quality UI missing: '+token);
}

for (const token of [
  'items={salesReferenceSources}',
  'items={reliabilityReferenceSources}',
  'items={advancedReferenceSources}',
  'items={overnightReferenceSources}',
  'items={crossCuttingReferenceLimits}',
  'Arbeitsdossier 2025-26 — nicht operative Referenz',
  'non sostituiscono i valori FAIR canonici',
]) {
  if (!modules.includes(token)) fail('reference-source integration missing: '+token);
}

if (!modules.includes("row.reliability==='provisional'?'error':'warning'")) {
  fail('working PN reliability must map provisional rows to an explicit Foundation error/status state');
}
if (!modules.includes('nicht operative Referenz') || !modules.includes('riferimento non operativo')) {
  fail('working dossier must remain explicitly non-operational');
}

if (!process.exitCode) {
  ok('Claude source dossier is structured and rendered');
  ok('official / assumption / provisional reliability remains explicit');
  ok('working PN values cannot silently replace canonical FAIR data');
} else {
  process.exit(process.exitCode);
}
