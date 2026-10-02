import { REGIONS, regional } from '../data/analyticsData';
import { resolveAnalyticsReportingAreaId } from '../data/scopes';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';
import type { PublicBaselineData } from './publicBaseline';

const PRODUCT_CODES = ['day','wk-area','wk-dns','sk-area','sk-dns'] as const;

export type RegionalDataset = {
  source:'live'|'public'|'compatibility';
  qty:number[][];
  revenue:number[][];
  totalRevenue:number[];
};

export function selectRegionalDataset(
  snapshot:LiveAnalyticsSnapshot|null,
  liveReady:boolean,
  publicBaseline?:PublicBaselineData|null,
):RegionalDataset {
  const matrix=snapshot?.sales?.aggregate.byReportingAreaProduct;
  if ((!liveReady || !matrix) && publicBaseline) {
    const b=publicBaseline.regional;
    return {source:'public',qty:[[...b.dayQ],[...b.wkaQ],[...b.wkdQ],[...b.skaQ],[...b.skdQ]],revenue:[[...b.dayR],[...b.wkaR],[...b.wkdR],[...b.skaR],[...b.skdR]],totalRevenue:[...b.totalR]};
  }
  if (!liveReady || !matrix) {
    return {
      source:'compatibility',
      qty:[
        [...regional.dayQ],[...regional.wkaQ],[...regional.wkdQ],[...regional.skaQ],[...regional.skdQ],
      ],
      revenue:[
        [...regional.dayR],[...regional.wkaR],[...regional.wkdR],[...regional.skaR],[...regional.skdR],
      ],
      totalRevenue:[...regional.totalR],
    };
  }

  const qty=PRODUCT_CODES.map(code=>REGIONS.map(label=>{
    const areaId=resolveAnalyticsReportingAreaId(label);
    return areaId ? (matrix[areaId]?.[code]?.quantity ?? 0) : 0;
  }));
  const revenue=PRODUCT_CODES.map(code=>REGIONS.map(label=>{
    const areaId=resolveAnalyticsReportingAreaId(label);
    return areaId ? (matrix[areaId]?.[code]?.revenue ?? 0) : 0;
  }));
  const totalRevenue=REGIONS.map((_,areaIndex)=>revenue.reduce((sum,series)=>sum+series[areaIndex],0));

  return {source:'live',qty,revenue,totalRevenue};
}
