import type { AnnualSeriesPoint, LiveAnalyticsSnapshot } from '../services/liveAnalytics';

const integer=(n:number)=>n.toLocaleString('it-IT');
const euro=(n:number)=>n.toLocaleString('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const valid=(n:number)=>Number.isFinite(n)&&n>=0;
const near=(a:number,b:number)=>Math.abs(a-b)<=Math.max(.02,Math.abs(b)*1e-8);
const CATEGORY_KEYS=['day','wka','wkd','ska','skd'] as const;

export function verifiedAnnualPoints(snapshot:LiveAnalyticsSnapshot):AnnualSeriesPoint[]|null {
  const annual=snapshot.annual;
  if(!annual||annual.points.length<2||annual.source!=='historical-season-records') return null;
  const seen=new Set<string>();
  const points=[...annual.points];
  for(const point of points) {
    if(!/^20\d\d-\d\d$/.test(point.seasonId)||seen.has(point.seasonId)) return null;
    seen.add(point.seasonId);
    if(![point.totalTickets,point.totalRevenue,point.avgPrice].every(valid)) return null;
    const quantity=CATEGORY_KEYS.map(k=>point.qty[k]);
    const revenue=CATEGORY_KEYS.map(k=>point.revenue[k]);
    if(![...quantity,...revenue].every(valid)) return null;
    if(!near(point.avgPrice,point.totalTickets?point.totalRevenue/point.totalTickets:0)) return null;
    // Historical categories may not cover every revenue channel; use totals
    // as authoritative and never silently fill gaps with static fixtures.
    if(quantity.reduce((s,n)=>s+n,0)>point.totalTickets+.01) return null;
    if(revenue.reduce((s,n)=>s+n,0)>point.totalRevenue+.02) return null;
  }
  points.sort((a,b)=>a.seasonId.localeCompare(b.seasonId));
  return points;
}

function delta(current:number,previous:number) {
  return previous>0 ? (current-previous)/previous*100 : null;
}
function deltaLabel(value:number|null) {
  if(value===null) return 'n.d.';
  return (value>0?'+':'')+value.toLocaleString('it-IT',{maximumFractionDigits:1})+'%';
}

export function SecureAnnualComparison({snapshot}:{snapshot:LiveAnalyticsSnapshot}) {
  const points=verifiedAnnualPoints(snapshot);
  const maximum=Math.max(0,...(points??[]).map(point=>point.totalRevenue));
  const previous=points&&points.length>1?points.at(-2):undefined;
  const current=points?.at(-1);
  return <section className="rounded-xl border p-5" aria-label="Confronto annuale">
    <h2 className="mb-3 text-xl font-semibold">Confronto annuale</h2>
    <p className="mb-4 text-sm">Fonte: dati storici autorizzati in Firebase. Nessuna serie ricostruita da valori statici del frontend.</p>
    {!points && <p role="status">Serie storica Firebase non completa o non verificata: confronto non disponibile.</p>}
    {points&&<div className="grid gap-4">
      {points.map(point=><div key={point.seasonId}>
        <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
          <strong>WS {point.seasonId}</strong>
          <span>{euro(point.totalRevenue)} · {integer(point.totalTickets)} biglietti</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200" role="img" aria-label={euro(point.totalRevenue)}>
          <div className="h-full rounded-full" style={{
            width:(maximum?point.totalRevenue/maximum*100:0)+'%',
            background:'var(--dns-primary,#237b85)',
          }}/>
        </div>
      </div>)}
      {previous&&current&&<p className="text-sm">
        Ultimo confronto (WS {current.seasonId} vs {previous.seasonId}):
        fatturato {deltaLabel(delta(current.totalRevenue,previous.totalRevenue))};
        biglietti {deltaLabel(delta(current.totalTickets,previous.totalTickets))}.
      </p>}
    </div>}
  </section>;
}
