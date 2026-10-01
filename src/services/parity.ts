import { REGIONS, TICKET_TYPES, seasonOverview } from '../data/analyticsData';
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
    checks.push(check(
      `product-${code}`,
      `Product ${TICKET_TYPES[index]}`,
      seasonOverview.ticketQty[index],
      sales?.byProduct[code]?.quantity ?? null,
      0,
    ));
  });

  REGIONS.forEach((label,index)=>{
    // reporting-area canonical IDs are intentionally not guessed here.
    // Area parity is activated after master-data ID mapping in A.3.2.
    checks.push(check(`area-${index}`,`Area ${label}`,seasonOverview.regionQty[index],null,0));
  });

  return checks;
}

export function paritySummary(checks:ParityCheck[]) {
  const available=checks.filter(c=>c.status!=='unavailable');
  const matches=available.filter(c=>c.status==='match').length;
  const different=available.filter(c=>c.status==='different').length;
  return {available:available.length,matches,different,ready:available.length>0 && different===0};
}
