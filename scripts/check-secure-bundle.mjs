import fs from 'node:fs';
import path from 'node:path';

// Secure preview must not ship any source from the compatibility-only dashboard.
// This is a build assertion, not an authorization bypass: Firebase rules remain
// responsible for data permissions.
const root=path.resolve('dist-secure');
if (!fs.existsSync(path.join(root,'secure','index.html'))) throw Error('SECURE_PREVIEW_HTML_MISSING');
if (fs.existsSync(path.join(root,'index.html')) || fs.existsSync(path.join(root,'partner','index.html'))) {
  throw Error('UNEXPECTED_DASHBOARD_HTML_IN_SECURE_PREVIEW');
}
const files=[];
const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()) walk(file); else files.push(file);
}};
walk(root);
const forbidden=[
  'topRegionRevenue', 'regionRevenue', 'kpPartners', 'overnightAreas',
  'advancedDefaults', 'analyticsPublicSnapshots', 'analyticsAuditSnapshots',
  'compatibility-fallback', 'local datasets',
  // Legacy baseline partner revenue marker; not an assertion about current totals.
  '702623',
];
for(const file of files.filter(f=>/\.(js|map|json|html)$/.test(f))) {
  const source=fs.readFileSync(file,'utf8');
  for(const marker of forbidden) {
    if(source.includes(marker)) {
      throw Error('SECURE_PREVIEW_LEGACY_ASSET: '+marker+' in '+path.relative(root,file));
    }
  }
}
const scripts=files.filter(f=>f.endsWith('.js'));
if(!scripts.length) throw Error('SECURE_PREVIEW_SCRIPTS_MISSING');
console.log('Firebase-only secure preview asset scan passed ('+scripts.length+' JS chunks).');
