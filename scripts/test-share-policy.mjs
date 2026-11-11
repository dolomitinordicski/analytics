import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source=fs.readFileSync('src/sharing/analyticsSharePolicy.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {evaluateAnalyticsShare}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const now='2026-11-11T12:00:00Z';
const grant={
  schemaVersion:1,id:'test-grant',state:'active',
  audience:{kind:'partner-hub',establishmentId:'test-establishment-A'},
  sections:['overview'],metricIds:['tickets.total'],
  seasonIds:['2025-26'],issuedAt:'2026-11-10T00:00:00Z',expiresAt:'2026-11-12T00:00:00Z',
};
const viewer={kind:'partner-hub',establishmentId:'test-establishment-A'};
assert.equal(evaluateAnalyticsShare(grant,viewer,now).allowed,true);
const denied=[
  [null,grant],
  [viewer,{...grant,state:'draft'}],
  [viewer,{...grant,state:'revoked'}],
  [viewer,{...grant,revokedAt:'2026-11-11T00:00:00Z'}],
  [viewer,{...grant,expiresAt:now}],
  [viewer,{...grant,issuedAt:'2026-11-12T00:00:00Z'}],
  [viewer,{...grant,metricIds:['partner.privateRevenue']}],
  [viewer,{...grant,sections:['unlisted']}],
  [viewer,{...grant,seasonIds:[]}],
  [viewer,{...grant,sections:[]}],
  [viewer,{...grant,metricIds:[]}],
  [viewer,{...grant,metricIds:['tickets.total','tickets.total']}],
  [{kind:'partner-hub',establishmentId:'test-establishment-B'},grant],
  [{kind:'named-person',verifiedEmail:'guest@example.test'},grant],
  [viewer,{...grant,audience:{kind:'named-person',verifiedEmail:'guest@example.test'}}],
];
for(const [identity,policy] of denied) assert.equal(evaluateAnalyticsShare(policy,identity,now).allowed,false);
assert.equal(evaluateAnalyticsShare({...grant,expiresAt:'2026-11-12'},viewer,now).allowed,false);
console.log('Share policy: 1 authorized case, '+denied.length+' denied cases, invalid timestamp denied.');
