import { REGIONS, TICKET_TYPES, annual, kpPartners, kpRegions, regional, seasonOverview } from '../data/analyticsData';
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


const REGIONAL_QTY = [regional.dayQ,regional.wkaQ,regional.wkdQ,regional.skaQ,regional.skdQ] as readonly (readonly number[])[];
const REGIONAL_REVENUE = [regional.dayR,regional.wkaR,regional.wkdR,regional.skaR,regional.skdR] as readonly (readonly number[])[];

export function compareRegionalToCompatibility(snapshot:LiveAnalyticsSnapshot|null):ParityCheck[] {
  const matrix=snapshot?.sales?.aggregate.byReportingAreaProduct;
  const checks:ParityCheck[]=[];
  REGIONS.forEach((label,areaIndex)=>{
    const areaId=resolveAnalyticsReportingAreaId(label);
    PRODUCT_CODES.forEach((code,productIndex)=>{
      checks.push(
        check(
          `regional-qty-${areaId ?? areaIndex}-${code}`,
          `${label} · ${TICKET_TYPES[productIndex]} qty`,
          REGIONAL_QTY[productIndex][areaIndex],
          areaId ? (matrix?.[areaId]?.[code]?.quantity ?? null) : null,
          0,
        ),
        check(
          `regional-revenue-${areaId ?? areaIndex}-${code}`,
          `${label} · ${TICKET_TYPES[productIndex]} revenue`,
          REGIONAL_REVENUE[productIndex][areaIndex],
          areaId ? (matrix?.[areaId]?.[code]?.revenue ?? null) : null,
          0.02,
        ),
      );
    });
  });
  return checks;
}

export function regionalParitySummary(checks:ParityCheck[]) {
  const available=checks.filter(c=>c.status!=='unavailable');
  const matches=available.filter(c=>c.status==='match').length;
  const different=available.filter(c=>c.status==='different').length;
  const expected=REGIONS.length*PRODUCT_CODES.length*2;
  return {
    available:available.length,
    expected,
    matches,
    different,
    complete:available.length===expected,
    ready:available.length===expected && different===0,
  };
}


const KP_MILESTONE_DATES_2025_26 = ['2025-12-23','2026-01-06','2026-01-20'] as const;

export function compareKpToCompatibility(snapshot:LiveAnalyticsSnapshot|null):ParityCheck[] {
  const kp=snapshot?.kp;
  const checks:ParityCheck[]=[];

  kpRegions.forEach((legacy,areaIndex)=>{
    const areaId=resolveAnalyticsReportingAreaId(legacy.r);
    KP_MILESTONE_DATES_2025_26.forEach((date,milestoneIndex)=>{
      const milestone=kp?.milestones.find(m=>m.date===date);
      const point=areaId && milestone
        ? kp?.aggregate.byAreaMilestone[areaId]?.[milestone.id]
        : undefined;
      const legacyOpened=[legacy.tot1,legacy.tot2,legacy.tot3][milestoneIndex];
      const legacyArtificial=[legacy.ks1,legacy.ks2,legacy.ks3][milestoneIndex];

      checks.push(
        check(
          `kp-potential-${areaId ?? areaIndex}-${milestoneIndex+1}`,
          `${legacy.r} · ${date} potential km`,
          legacy.pot,
          point?.potentialOperationalKm ?? null,
          0.05,
        ),
        check(
          `kp-opened-${areaId ?? areaIndex}-${milestoneIndex+1}`,
          `${legacy.r} · ${date} opened km`,
          legacyOpened,
          point?.openedKm ?? null,
          0.05,
        ),
        check(
          `kp-artificial-${areaId ?? areaIndex}-${milestoneIndex+1}`,
          `${legacy.r} · ${date} artificial km`,
          legacyArtificial,
          point?.artificialSnowKm ?? null,
          0.05,
        ),
      );
    });
  });

  return checks;
}

export function kpParitySummary(checks:ParityCheck[]) {
  const available=checks.filter(c=>c.status!=='unavailable');
  const matches=available.filter(c=>c.status==='match').length;
  const different=available.filter(c=>c.status==='different').length;
  const expected=kpRegions.length*KP_MILESTONE_DATES_2025_26.length*3;
  return {
    available:available.length,
    expected,
    matches,
    different,
    complete:available.length===expected,
    ready:available.length===expected && different===0,
  };
}


export function compareKpPartnersToCompatibility(snapshot:LiveAnalyticsSnapshot|null):ParityCheck[] {
  const rows=snapshot?.kp?.rows ?? [];
  const checks:ParityCheck[]=[];

  kpPartners.forEach((legacy,index)=>{
    const row=rows.find(item=>item.label===legacy.p);
    const milestones=[...(row?.milestones ?? [])];
    const m1=milestones.find(value=>{
      const def=snapshot?.kp?.milestones.find(m=>m.id===value.milestoneId);
      return def?.date==='2025-12-23';
    });
    const m2=milestones.find(value=>{
      const def=snapshot?.kp?.milestones.find(m=>m.id===value.milestoneId);
      return def?.date==='2026-01-06';
    });
    const m3=milestones.find(value=>{
      const def=snapshot?.kp?.milestones.find(m=>m.id===value.milestoneId);
      return def?.date==='2026-01-20';
    });

    checks.push(
      check(`kp-partner-pot-${index}`,`${legacy.p} potential km`,legacy.pot,row?.referenceKm.potentialOperationalKm ?? null,0.05),
      check(`kp-partner-ks1-${index}`,`${legacy.p} KS 23.12`,legacy.ks1,m1?.artificialSnowKm ?? null,0.05),
      check(`kp-partner-ks2-${index}`,`${legacy.p} KS 06.01`,legacy.ks2,m2?.artificialSnowKm ?? null,0.05),
      check(`kp-partner-ks3-${index}`,`${legacy.p} KS 20.01`,legacy.ks3,m3?.artificialSnowKm ?? null,0.05),
      check(`kp-partner-open3-${index}`,`${legacy.p} opened 20.01`,legacy.tot3,m3?.openedKm ?? null,0.05),
    );
  });

  return checks;
}

export function kpPartnerParitySummary(checks:ParityCheck[]) {
  const available=checks.filter(c=>c.status!=='unavailable');
  const matches=available.filter(c=>c.status==='match').length;
  const different=available.filter(c=>c.status==='different').length;
  const expected=kpPartners.length*5;
  return {
    available:available.length,
    expected,
    matches,
    different,
    complete:available.length===expected,
    ready:available.length===expected && different===0,
  };
}


const ANNUAL_SEASONS = ['2022-23','2023-24','2024-25','2025-26'] as const;

export function compareAnnualToCompatibility(snapshot:LiveAnalyticsSnapshot|null):ParityCheck[] {
  const series=snapshot?.annual?.points ?? [];
  const checks:ParityCheck[]=[];
  const qtySeries={
    day:annual.qty.day,
    wka:annual.qty.wka,
    wkd:annual.qty.wkd,
    ska:annual.qty.ska,
    skd:annual.qty.skd,
  } as const;
  const revenueSeries={
    day:annual.revenueByType.day,
    wka:annual.revenueByType.wka,
    wkd:annual.revenueByType.wkd,
    ska:annual.revenueByType.ska,
    skd:annual.revenueByType.skd,
  } as const;

  ANNUAL_SEASONS.forEach((seasonId,index)=>{
    const point=series.find(item=>item.seasonId===seasonId);
    checks.push(
      check(`annual-total-qty-${seasonId}`,`${seasonId} total tickets`,annual.totalTickets[index],point?.totalTickets ?? null,0),
      check(`annual-total-revenue-${seasonId}`,`${seasonId} total revenue`,annual.totalRevenue[index],point?.totalRevenue ?? null,0.02),
    );
    (['day','wka','wkd','ska','skd'] as const).forEach(code=>{
      checks.push(
        check(`annual-${code}-qty-${seasonId}`,`${seasonId} ${code} qty`,qtySeries[code][index],point?.qty[code] ?? null,0),
        check(`annual-${code}-revenue-${seasonId}`,`${seasonId} ${code} revenue`,revenueSeries[code][index],point?.revenue[code] ?? null,0.02),
      );
    });
  });
  return checks;
}

export function annualParitySummary(checks:ParityCheck[]) {
  const available=checks.filter(c=>c.status!=='unavailable');
  const matches=available.filter(c=>c.status==='match').length;
  const different=available.filter(c=>c.status==='different').length;
  const expected=ANNUAL_SEASONS.length*(2+5*2);
  return {
    available:available.length,
    expected,
    matches,
    different,
    complete:available.length===expected,
    ready:available.length===expected && different===0,
  };
}
