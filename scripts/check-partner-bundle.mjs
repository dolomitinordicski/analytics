import fs from 'node:fs';
import path from 'node:path';

const partnerOnly = process.argv.includes('--partner-only');
const dist = path.resolve(partnerOnly ? 'dist-partner' : 'dist');
const partnerHtml = path.join(dist, 'partner', 'index.html');
if (!fs.existsSync(partnerHtml)) throw new Error('PARTNER_HTML_NOT_BUILT');
const html = fs.readFileSync(partnerHtml, 'utf8');
const jsRefs = [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map(m => m[1]);
if (!jsRefs.length) throw new Error('PARTNER_ENTRY_MISSING');
const visited = new Set();
function check(ref) {
  const normalized = ref.replace(/^\/analytics\/(?:partner\/)?/, '');
  const file = path.resolve(dist, normalized);
  if (!file.startsWith(dist + path.sep) || !fs.existsSync(file)) {
    throw new Error('PARTNER_SCRIPT_MISSING: ' + ref);
  }
  if (visited.has(file)) return;
  visited.add(file);
  const source = fs.readFileSync(file, 'utf8');
  // Do not ship historical compatibility facts in the partner bundle,
  // even as a side-effect of a common imports/chunk optimization.
  for (const marker of ['topRegionRevenue', 'regionRevenue', 'kpPartners', 'overnightAreas', 'advancedDefaults', 'historicalSeasonRecords', '702623']) {
    if (source.includes(marker)) throw new Error('PARTNER_DATA_LEAK: ' + marker + ' in ' + path.relative(dist,file));
  }
  // Vite outputs static ESM imports (including shared chunks).
  for (const match of source.matchAll(/(?:from\s*|import\s*\(|import\s*)["'](\.\.?\/[^"']+\.js)["']/g)) {
    check(path.posix.join('/analytics/', partnerOnly ? 'partner' : '', path.posix.dirname(normalized), match[1]));
  }
}
for (const ref of jsRefs) check(ref);
if (partnerOnly) {
  const allAssets = [];
  const walk = dir => { for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir,entry.name);
    if (entry.isDirectory()) walk(full);
    else allAssets.push(full);
  }};
  walk(dist);
  if (fs.existsSync(path.join(dist,'index.html'))) throw new Error('INTERNAL_HTML_IN_PUBLIC_BUILD');
  for (const file of allAssets.filter(name => /\\.(js|map|json|html)$/.test(name))) {
    const source = fs.readFileSync(file,'utf8');
    for (const marker of ['topRegionRevenue','regionRevenue','kpPartners','overnightAreas','historicalSeasonRecords','702623']) {
      if (source.includes(marker)) throw new Error('PUBLIC_ARTIFACT_CONTAINS_INTERNAL_DATA: ' + marker + ' in ' + path.relative(dist,file));
    }
  }
}
console.log('Partner bundle isolation verified across ' + visited.size + ' JS files.');
