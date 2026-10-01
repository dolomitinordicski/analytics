import { kpPartners } from '../data/analyticsData';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';

export type KpPartnerRow = {
  p:string;
  pot:number;
  ks1:number;
  ks2:number;
  ks3:number;
  tot3:number;
  excluded?:boolean;
};

export type KpPartnerDataset = {
  source:'live'|'compatibility';
  rows:KpPartnerRow[];
};

function byDate(snapshot:LiveAnalyticsSnapshot,rowId:string,date:string) {
  const kp=snapshot.kp;
  const row=kp?.rows.find(item=>item.id===rowId);
  if (!kp || !row) return undefined;
  const milestone=kp.milestones.find(m=>m.date===date);
  return milestone ? row.milestones.find(value=>value.milestoneId===milestone.id) : undefined;
}

export function selectKpPartnerDataset(
  snapshot:LiveAnalyticsSnapshot|null,
  liveReady:boolean,
):KpPartnerDataset {
  if (!snapshot?.kp || !liveReady) {
    return {source:'compatibility',rows:kpPartners.map(row=>({...row}))};
  }

  const rows=kpPartners.map(legacy=>{
    const row=snapshot.kp?.rows.find(item=>item.label===legacy.p);
    if (!row) return {...legacy};
    const m1=byDate(snapshot,row.id,'2025-12-23');
    const m2=byDate(snapshot,row.id,'2026-01-06');
    const m3=byDate(snapshot,row.id,'2026-01-20');
    return {
      p:legacy.p,
      pot:Number(row.referenceKm.potentialOperationalKm ?? legacy.pot),
      ks1:Number(m1?.artificialSnowKm ?? legacy.ks1),
      ks2:Number(m2?.artificialSnowKm ?? legacy.ks2),
      ks3:Number(m3?.artificialSnowKm ?? legacy.ks3),
      tot3:Number(m3?.openedKm ?? legacy.tot3),
      excluded:legacy.excluded,
    };
  });

  return {source:'live',rows};
}
