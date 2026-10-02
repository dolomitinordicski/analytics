import { REGIONS, SEASONS, TICKET_TYPES } from '../data/analyticsData';
import type { AnnualDataset } from './annualSelector';
import type { RegionalDataset } from './regionalSelector';
import type { OverviewDataset } from './overviewSelector';

const ratio=(current:number,base:number)=>base===0 ? 0 : (current/base-1)*100;

export function deriveOverviewKpis(overview:OverviewDataset, annual:AnnualDataset) {
  const last=annual.totalTickets.length-1;
  const prev=Math.max(0,last-1);
  return {
    ticketsDeltaPct:ratio(overview.totalTickets,annual.totalTickets[prev]),
    revenueDeltaPct:ratio(overview.totalRevenue,annual.totalRevenue[prev]),
    avgPriceDeltaPct:ratio(overview.avgPrice,annual.avgPrice[prev]),
  };
}

export function deriveAnnualKpis(data:AnnualDataset) {
  const first=0;
  const last=data.totalTickets.length-1;
  const recordRevenue=Math.max(...data.totalRevenue);
  const recordIndex=data.totalRevenue.indexOf(recordRevenue);
  const dnsSk=data.qty.skd[last];
  const dnsSkRecord=Math.max(...data.qty.skd);
  return {
    dnsSk,
    dnsSkIsRecord:dnsSk===dnsSkRecord,
    dnsSkGrowthPct:ratio(dnsSk,data.qty.skd[first]),
    dnsWkGrowthPct:ratio(data.qty.wkd[last],data.qty.wkd[first]),
    totalRevenueGrowthPct:ratio(data.totalRevenue[last],data.totalRevenue[first]),
    recordSeason:SEASONS[recordIndex],
    recordRevenue,
    recordTickets:data.totalTickets[recordIndex],
  };
}

function rowTotal(qty:number[][],i:number) {
  return qty.reduce((sum,series)=>sum+Number(series[i] ?? 0),0);
}

function productShare(qty:number[][],productIndex:number,regionIndex:number) {
  const total=rowTotal(qty,regionIndex);
  return total ? Number(qty[productIndex]?.[regionIndex] ?? 0)/total*100 : 0;
}

function networkProductShare(qty:number[][],productIndex:number,regionIndex:number) {
  const series=qty[productIndex] ?? [];
  const total=series.reduce((sum,v)=>sum+Number(v),0);
  return total ? Number(series[regionIndex] ?? 0)/total*100 : 0;
}

function nonDayEntropy(qty:number[][],regionIndex:number) {
  const values=qty.slice(1).map(series=>Number(series[regionIndex] ?? 0));
  const total=values.reduce((sum,v)=>sum+v,0);
  if (!total) return 0;
  return -values.reduce((sum,v)=>{
    if (!v) return sum;
    const p=v/total;
    return sum+p*Math.log(p);
  },0);
}

export function deriveRegionalKpis(data:RegionalDataset) {
  const dayShares=REGIONS.map((_,i)=>productShare(data.qty,0,i));
  const dayIndex=dayShares.indexOf(Math.max(...dayShares));

  const skArea=data.qty[3] ?? [];
  const skAreaIndex=skArea.indexOf(Math.max(...skArea));

  const dnsWk=data.qty[2] ?? [];
  const dnsWkIndex=dnsWk.indexOf(Math.max(...dnsWk));

  const diversity=REGIONS.map((_,i)=>nonDayEntropy(data.qty,i));
  const diversityIndex=diversity.indexOf(Math.max(...diversity));

  return {
    dayRegion:REGIONS[dayIndex],
    daySharePct:dayShares[dayIndex],
    skAreaRegion:REGIONS[skAreaIndex],
    skAreaQty:Number(skArea[skAreaIndex] ?? 0),
    skAreaNetworkSharePct:networkProductShare(data.qty,3,skAreaIndex),
    dnsWkRegion:REGIONS[dnsWkIndex],
    dnsWkQty:Number(dnsWk[dnsWkIndex] ?? 0),
    dnsWkNetworkSharePct:networkProductShare(data.qty,2,dnsWkIndex),
    diversifiedRegion:REGIONS[diversityIndex],
    diversifiedScore:diversity[diversityIndex],
  };
}

export const ticketTypeKeys = TICKET_TYPES;
