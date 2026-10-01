import { overnightAreas } from '../data/analyticsData';
import { resolveAnalyticsReportingAreaId } from '../data/scopes';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';

export type OvernightAreaRow = {
  areaId:string;
  area:string;
  pn2425:number;
  pn2526:number;
};

export type OvernightDataset = {
  source:'fair'|'compatibility';
  rows:OvernightAreaRow[];
  monthly:number[];
};

const CANONICAL_LABELS:Record<string,string>={
  'osttirol':'Osttirol',
  'drei-zinnen':'3 Zinnen Dolomites',
  'cortina-d-ampezzo':"Cortina d'Ampezzo",
  'val-comelico':'Comelico',
  'gsiesertal-welsberg-taisten':'Gsiesertal / Welsberg / Taisten',
  'antholzertal':'Antholzertal',
  'ahrntal':'Ahrntal / Sand in Taufers',
  'seiser-alm-dolomites-val-gardena':'Seiser Alm / Val Gardena',
};

function legacyAreaId(label:string):string|null {
  if (label==='Gröden / Val Gardena' || label==='Seiser Alm / Alpe di Siusi') {
    return 'seiser-alm-dolomites-val-gardena';
  }
  return resolveAnalyticsReportingAreaId(label);
}

function compatibilityRows():OvernightAreaRow[] {
  const grouped=new Map<string,OvernightAreaRow>();
  for (const row of overnightAreas) {
    const areaId=legacyAreaId(row.area);
    if (!areaId) continue;
    const current=grouped.get(areaId) ?? {
      areaId,
      area:CANONICAL_LABELS[areaId] ?? row.area,
      pn2425:0,
      pn2526:0,
    };
    current.pn2425+=Number(row.pn[0]);
    current.pn2526+=Number(row.pn[1]);
    grouped.set(areaId,current);
  }
  return [...grouped.values()];
}

export function selectOvernightDataset(
  snapshot:LiveAnalyticsSnapshot|null,
  fairReady:boolean,
):OvernightDataset {
  const fallback=compatibilityRows();
  const monthly=[0,1,2,3].map(i=>overnightAreas.reduce((sum,row)=>sum+Number(row.m[i]),0));
  if (!fairReady || !snapshot?.fair) {
    return {source:'compatibility',rows:fallback,monthly};
  }

  const byArea=new Map(fallback.map(row=>[row.areaId,row]));
  const rows=snapshot.fair.regions.map(region=>{
    const areaId=resolveAnalyticsReportingAreaId(region.name);
    const legacy=areaId ? byArea.get(areaId) : undefined;
    return {
      areaId:areaId ?? region.name,
      area:areaId ? (CANONICAL_LABELS[areaId] ?? region.name) : region.name,
      pn2425:legacy?.pn2425 ?? 0,
      pn2526:Number(region.PN),
    };
  });

  return {source:'fair',rows,monthly};
}
