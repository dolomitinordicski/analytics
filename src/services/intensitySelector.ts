import { intensityAreas } from '../data/analyticsData';
import { resolveAnalyticsReportingAreaId } from '../data/scopes';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';

export type IntensityInputRow = {
  areaId:string;
  area:string;
  wk:number;
  day:number;
  pn:number;
};

export type IntensityDataset = {
  source:'live'|'compatibility';
  rows:IntensityInputRow[];
};

const LABELS:Record<string,string>={
  'gsiesertal-welsberg-taisten':'Gsiesertal / Welsberg / Taisten',
  'antholzertal':'Antholzertal',
  'drei-zinnen':'3 Zinnen Dolomites',
  'osttirol':'Osttirol',
  'ahrntal':'Ahrntal / Sand in Taufers',
  'seiser-alm-dolomites-val-gardena':'Seiser Alm / Val Gardena',
  'val-comelico':'Comelico',
  'cortina-d-ampezzo':"Cortina d'Ampezzo",
};

function compatibilityRows():IntensityInputRow[] {
  return intensityAreas.map(row=>({
    areaId:resolveAnalyticsReportingAreaId(row.area) ?? row.area,
    area:row.area,
    wk:Number(row.wk),
    day:Number(row.day),
    pn:Number(row.pn),
  }));
}

export function selectIntensityDataset(
  snapshot:LiveAnalyticsSnapshot|null,
  ready:boolean,
):IntensityDataset {
  if (!ready || !snapshot?.sales?.aggregate || !snapshot.fair) {
    return {source:'compatibility',rows:compatibilityRows()};
  }

  const fairPn=new Map<string,number>();
  for (const region of snapshot.fair.regions) {
    const areaId=resolveAnalyticsReportingAreaId(region.name);
    if (areaId) fairPn.set(areaId,Number(region.PN));
  }

  const rows=Object.keys(LABELS).map(areaId=>{
    const products=snapshot.sales!.aggregate.byReportingAreaProduct[areaId] ?? {};
    return {
      areaId,
      area:LABELS[areaId],
      wk:Number(products['wk-area']?.quantity ?? 0)+Number(products['wk-dns']?.quantity ?? 0),
      day:Number(products.day?.quantity ?? 0),
      pn:Number(fairPn.get(areaId) ?? 0),
    };
  });

  return {source:'live',rows};
}
