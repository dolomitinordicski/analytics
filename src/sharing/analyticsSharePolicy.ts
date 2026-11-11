/**
 * DNS Analytics sharing contracts — fail-closed policy.
 *
 * The policy operates only on a SERVER-VERIFIED viewer identity and a
 * SERVER-APPROVED grant. It does not authenticate the caller and MUST NOT
 * authorize any Firestore read by itself.
 *
 * A Partner Hub iframe URL or parent-window message is never proof of login.
 * The server must validate the Hub session, partner establishment, audience,
 * revocation and expiry before returning a reduced data projection.
 */
export const ANALYTICS_SHARE_V1 = 1 as const;

export const ANALYTICS_SECTIONS = [
  'overview','annual','regions','reliability',
  'advanced','overnights','intensity',
] as const;
export type AnalyticsSection = typeof ANALYTICS_SECTIONS[number];

export type AnalyticsShareAudience =
  | { kind:'dns-workspace'; userUid:string }
  | { kind:'named-person'; verifiedEmail:string }
  | { kind:'partner-hub'; establishmentId:string };

export type AnalyticsShareGrant = {
  schemaVersion:typeof ANALYTICS_SHARE_V1;
  id:string;
  state:'active'|'revoked'|'draft';
  audience:AnalyticsShareAudience;
  seasonIds:readonly string[];
  sections:readonly AnalyticsSection[];
  // IDs refer to allowlisted, server-projected fields — never arbitrary
  // Firestore paths, module names or JS property selectors from URL input.
  metricIds:readonly string[];
  issuedAt:string;
  expiresAt:string;
  revokedAt?:string;
};

export type VerifiedAnalyticsViewer =
  | {kind:'dns-workspace'; userUid:string}
  | {kind:'named-person'; verifiedEmail:string}
  | {kind:'partner-hub'; establishmentId:string};

const VALID_SECTIONS:ReadonlySet<string>=new Set(ANALYTICS_SECTIONS);
const VALID_METRICS:ReadonlySet<string>=new Set([
  'tickets.total','revenue.total','ticket.average',
  'tickets.by-product','revenue.by-product',
  'tickets.by-area','revenue.by-area',
  'tickets.by-channel','revenue.by-channel',
  'kp.open-km','kp.potential-km','annual.tickets','annual.revenue',
]);

function validDate(value:string):number|null {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value))return null;
  const epoch=Date.parse(value);
  return Number.isFinite(epoch)?epoch:null;
}

export function evaluateAnalyticsShare(
  grant:AnalyticsShareGrant,
  viewer:VerifiedAnalyticsViewer|null,
  now:string,
):{allowed:true;sections:readonly AnalyticsSection[];metricIds:readonly string[];seasonIds:readonly string[]}|{allowed:false} {
  if(!viewer||grant.schemaVersion!==1||grant.state!=='active'||grant.revokedAt) return {allowed:false};
  const since=validDate(grant.issuedAt),until=validDate(grant.expiresAt),time=validDate(now);
  if(since===null||until===null||time===null||time<since||time>=until||since>=until)return {allowed:false};
  if(grant.audience.kind!==viewer.kind)return {allowed:false};
  if(viewer.kind==='dns-workspace' && grant.audience.kind==='dns-workspace'
    && (!viewer.userUid||viewer.userUid!==grant.audience.userUid))return {allowed:false};
  if(viewer.kind==='named-person' && grant.audience.kind==='named-person'
    && (!viewer.verifiedEmail||viewer.verifiedEmail.toLowerCase()!==grant.audience.verifiedEmail.toLowerCase()))return {allowed:false};
  if(viewer.kind==='partner-hub' && grant.audience.kind==='partner-hub'
    && (!viewer.establishmentId||viewer.establishmentId!==grant.audience.establishmentId))return {allowed:false};

  if(!grant.id||!grant.sections.length||!grant.metricIds.length||!grant.seasonIds.length)return {allowed:false};
  if(grant.sections.some(s=>!VALID_SECTIONS.has(s)))return {allowed:false};
  if(grant.metricIds.some(m=>!VALID_METRICS.has(m)))return {allowed:false};
  if(grant.seasonIds.some(s=>!/^20\d{2}-\d{2}$/.test(s)))return {allowed:false};
  if(new Set(grant.sections).size!==grant.sections.length
    ||new Set(grant.metricIds).size!==grant.metricIds.length)return {allowed:false};
  return {allowed:true,sections:grant.sections,metricIds:grant.metricIds,seasonIds:grant.seasonIds};
}
