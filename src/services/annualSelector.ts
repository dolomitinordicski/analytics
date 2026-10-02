import { annual } from '../data/analyticsData';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';
import type { PublicBaselineData } from './publicBaseline';

export type AnnualDataset = {
  source:'live'|'public'|'compatibility';
  qty:{
    day:number[];
    wka:number[];
    wkd:number[];
    ska:number[];
    skd:number[];
  };
  totalTickets:number[];
  totalRevenue:number[];
  avgPrice:number[];
  revenueByType:{
    day:number[];
    wka:number[];
    wkd:number[];
    ska:number[];
    skd:number[];
  };
};

export function selectAnnualDataset(
  snapshot:LiveAnalyticsSnapshot|null,
  liveReady:boolean,
  publicBaseline?:PublicBaselineData|null,
):AnnualDataset {
  const points=snapshot?.annual?.points;
  if ((!liveReady || !points || points.length!==4) && publicBaseline) {
    const b=publicBaseline.annual;
    return {source:'public',qty:{day:[...b.qty.day],wka:[...b.qty.wka],wkd:[...b.qty.wkd],ska:[...b.qty.ska],skd:[...b.qty.skd]},totalTickets:[...b.totalTickets],totalRevenue:[...b.totalRevenue],avgPrice:[...b.avgPrice],revenueByType:{day:[...b.revenueByType.day],wka:[...b.revenueByType.wka],wkd:[...b.revenueByType.wkd],ska:[...b.revenueByType.ska],skd:[...b.revenueByType.skd]}};
  }
  if (!liveReady || !points || points.length!==4) {
    return {
      source:'compatibility',
      qty:{
        day:[...annual.qty.day],
        wka:[...annual.qty.wka],
        wkd:[...annual.qty.wkd],
        ska:[...annual.qty.ska],
        skd:[...annual.qty.skd],
      },
      totalTickets:[...annual.totalTickets],
      totalRevenue:[...annual.totalRevenue],
      avgPrice:[...annual.avgPrice],
      revenueByType:{
        day:[...annual.revenueByType.day],
        wka:[...annual.revenueByType.wka],
        wkd:[...annual.revenueByType.wkd],
        ska:[...annual.revenueByType.ska],
        skd:[...annual.revenueByType.skd],
      },
    };
  }

  const by=(key:'day'|'wka'|'wkd'|'ska'|'skd',kind:'qty'|'revenue')=>
    points.map(point=>kind==='qty' ? point.qty[key] : point.revenue[key]);

  return {
    source:'live',
    qty:{
      day:by('day','qty'),
      wka:by('wka','qty'),
      wkd:by('wkd','qty'),
      ska:by('ska','qty'),
      skd:by('skd','qty'),
    },
    totalTickets:points.map(point=>point.totalTickets),
    totalRevenue:points.map(point=>point.totalRevenue),
    avgPrice:points.map(point=>point.avgPrice),
    revenueByType:{
      day:by('day','revenue'),
      wka:by('wka','revenue'),
      wkd:by('wkd','revenue'),
      ska:by('ska','revenue'),
      skd:by('skd','revenue'),
    },
  };
}
