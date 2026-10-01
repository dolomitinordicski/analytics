import { kpRegions } from '../data/analyticsData';
import { resolveAnalyticsReportingAreaId } from '../data/scopes';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';

const MILESTONE_DATES=['2025-12-23','2026-01-06','2026-01-20'] as const;

export type ReliabilityAreaRow = {
  r:string;
  pot:number;
  tot1:number;
  ks1:number;
  tot2:number;
  ks2:number;
  tot3:number;
  ks3:number;
  note:string;
  pct1:number;
  pct2:number;
  pct3:number;
  kp:number;
};

export type ReliabilityDataset = {
  source:'live'|'compatibility';
  rows:ReliabilityAreaRow[];
};

function finalize(row:Omit<ReliabilityAreaRow,'pct1'|'pct2'|'pct3'|'kp'>):ReliabilityAreaRow {
  return {
    ...row,
    pct1:Math.min(100,row.pot ? row.tot1/row.pot*100 : 0),
    pct2:Math.min(100,row.pot ? row.tot2/row.pot*100 : 0),
    pct3:Math.min(100,row.pot ? row.tot3/row.pot*100 : 0),
    kp:Math.min(100,row.pot ? row.ks3/row.pot*100 : 0),
  };
}

export function selectReliabilityDataset(
  snapshot:LiveAnalyticsSnapshot|null,
  liveReady:boolean,
):ReliabilityDataset {
  const kp=snapshot?.kp;
  if (!liveReady || !kp) {
    return {
      source:'compatibility',
      rows:kpRegions.map(row=>({...row})),
    };
  }

  const rows=kpRegions.map(legacy=>{
    const areaId=resolveAnalyticsReportingAreaId(legacy.r);
    const points=MILESTONE_DATES.map(date=>{
      const milestone=kp.milestones.find(m=>m.date===date);
      return areaId && milestone ? kp.aggregate.byAreaMilestone[areaId]?.[milestone.id] : undefined;
    });

    return finalize({
      r:legacy.r,
      pot:points[2]?.potentialOperationalKm ?? legacy.pot,
      tot1:points[0]?.openedKm ?? legacy.tot1,
      ks1:points[0]?.artificialSnowKm ?? legacy.ks1,
      tot2:points[1]?.openedKm ?? legacy.tot2,
      ks2:points[1]?.artificialSnowKm ?? legacy.ks2,
      tot3:points[2]?.openedKm ?? legacy.tot3,
      ks3:points[2]?.artificialSnowKm ?? legacy.ks3,
      note:legacy.note,
    });
  });

  return {source:'live',rows};
}
