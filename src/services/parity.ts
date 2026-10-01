import { REGIONS, TICKET_TYPES, seasonOverview } from '../data/analyticsData';
import { resolveAnalyticsReportingAreaId } from '../data/scopes';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';

const PRODUCT_CODES = ['day','wk-area','wk-dns','sk-area','sk-dns'] as const;

export type ParityCheck = {
  id:string;
  label:string;
  legacy:number;
  live:number | null;
  delta:number | null;
  status:'match'|'different'|'unavailable';
};

function check(id:string,label:string,legacy:number,live:number|null,tolerance=0.01):ParityCheck {
  if (live === null) return {id,label,legacy,live,delta:null,status:'unavailable'};
  const delta=live-legacy;
  return {id,label,legacy,live,delta,status:Math.abs(delta)<=tolerance?'match':'different'};
}

export function compareLiveToCompatibility(snapshot:LiveAnalyticsSnapshot|null):ParityCheck[] {
  const sales=snapshot?.sales?.aggregate;
  const checks:ParityCheck[]=[
    check('tickets-total','Tickets total',seasonOverview.totalTickets,sales?.totalTickets ?? null,0),
    check('revenue-total','Revenue total',seasonOverview.totalRevenue,sales?.totalRevenue ?? null,0.02),
  ];

  PRODUCT_CODES.forEach((code,index)=>{
    checks.push(
      check(`product-qty-${code}`,`Product ${TICKET_TYPES[index]} qty`,seasonOverview.ticketQty[index],sales?.byProduct[code]?.quantity ?? null,0),
      check(`product-revenue-${code}`,`Product ${TICKET_TYPES[index]} revenue`,seasonOverview.ticketRevenue[index],sales?.byProduct[code]?.revenue ?? null,0.02),
    );
  });

  REGIONS.forEach((label,index)=>{
    const areaId=resolveAnalyticsReportingAreaId(label);
    checks.push(
      check(`area-qty-${areaId ?? index}`,`Area ${label} qty`,seasonOverview.regionQty[index],areaId ? (sales?.byReportingArea[areaId]?.quantity ?? null) : null,0),
      check(`area-revenue-${areaId ?? index}`,`Area ${label} revenue`,seasonOverview.regionRevenue[index],areaId ? (sales?.byReportingArea[areaId]?.revenue ?? null) : null,0.02),
    );
  });

  return checks;
}

export function paritySummary(checks:ParityCheck[]) {
  const available=checks.filter(c=>c.status!=='unavailable');
  const matches=available.filter(c=>c.status==='match').length;
  const different=available.filter(c=>c.status==='different').length;
  const expected=2 + PRODUCT_CODES.length*2 + REGIONS.length*2;
  return {
    available:available.length,
    expected,
    matches,
    different,
    complete:available.length===expected,
    ready:available.length===expected && different===0,
  };
}
