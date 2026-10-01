import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './dnsCore';
import type { AnalyticsAccessContext } from './auth';

export type TicketSalesLive = {
  id: string;
  seasonId: string;
  organizationId: string;
  reportingAreaId: string;
  productCode: string;
  salesChannel: string;
  salesPeriod?: string;
  quantity: number;
  calculatedAmount: number;
  amountOverride?: number | null;
};

export type KpMilestoneDefinitionLive = {
  id: string;
  seasonId: string;
  date: string;
  label?: string;
  order: number;
};

export type KpMilestoneLive = {
  milestoneId: string;
  openedKm: number;
  naturalSnowKm: number;
  artificialSnowKm: number;
};

export type KpEntryLive = {
  id: string;
  seasonId: string;
  entityId: string;
  label?: string;
  reportingAreaId: string;
  referenceKm: { potentialOperationalKm?: number; uniqueNetworkKm?: number };
  milestones: KpMilestoneLive[];
  includeInKp: boolean;
  exclusionReason?: string;
};

export type KpValidationLive = {
  id: string;
  seasonId: string;
  reportingAreaId: string;
  milestoneId: string;
  potentialOperationalKm: number;
  openedKm: number;
  naturalSnowKm: number;
  artificialSnowKm: number;
};

export type LiveSalesAggregate = {
  totalTickets: number;
  totalRevenue: number;
  averageTicketPrice: number;
  byReportingArea: Record<string,{quantity:number;revenue:number}>;
  byProduct: Record<string,{quantity:number;revenue:number}>;
  byReportingAreaProduct: Record<string,Record<string,{quantity:number;revenue:number}>>;
  byChannel: Record<string,{quantity:number;revenue:number}>;
  unmappedProducts: string[];
  channelsPresent: string[];
};

export type LiveKpPoint = {
  potentialOperationalKm:number;
  openedKm:number;
  artificialSnowKm:number;
  naturalSnowKm:number;
  source:'validation'|'entries';
};

export type LiveKpAggregate = {
  entries: number;
  includedEntries: number;
  validations: number;
  milestoneIds: string[];
  byAreaMilestone: Record<string,Record<string,LiveKpPoint>>;
  areas: Record<string,LiveKpPoint>;
};

export type AnnualSeriesPoint = {
  seasonId:string;
  totalTickets:number;
  totalRevenue:number;
  avgPrice:number;
  qty:{day:number;wka:number;wkd:number;ska:number;skd:number};
  revenue:{day:number;wka:number;wkd:number;ska:number;skd:number};
};

export type LiveAnnualSeries = {
  source:'historical-season-records';
  points:AnnualSeriesPoint[];
};

export type LiveAnalyticsSnapshot = {
  seasonId: string;
  loadedAt: string;
  annual?: LiveAnnualSeries;
  sales?: {
    source:'operational'|'historical-season-records';
    rows:TicketSalesLive[];
    aggregate:LiveSalesAggregate;
  };
  kp?: {
    source:'operational'|'historical-season-records';
    milestones:KpMilestoneDefinitionLive[];
    rows:KpEntryLive[];
    validations:KpValidationLive[];
    aggregate:LiveKpAggregate;
  };
};

type HistoricalSeasonRecord = {
  id:string;
  seasonId:string;
  domain:'sales'|'kp'|string;
  organizationId:string;
  reportingAreaId:string;
  label?:string;
  facts:readonly Record<string,unknown>[];
};

function effectiveAmount(row: TicketSalesLive) {
  return typeof row.amountOverride === 'number' ? row.amountOverride : Number(row.calculatedAmount || 0);
}

function aggregateSales(rows: TicketSalesLive[]): LiveSalesAggregate {
  const byReportingArea: LiveSalesAggregate['byReportingArea'] = {};
  const byProduct: LiveSalesAggregate['byProduct'] = {};
  const byReportingAreaProduct: LiveSalesAggregate['byReportingAreaProduct'] = {};
  const byChannel: LiveSalesAggregate['byChannel'] = {};
  let totalTickets=0, totalRevenue=0;
  const knownProducts = new Set(['day','wk-area','wk-dns','sk-area','sk-dns']);
  const unmapped = new Set<string>();

  for (const row of rows) {
    const quantity = Number(row.quantity || 0);
    const revenue = effectiveAmount(row);
    totalTickets += quantity;
    totalRevenue += revenue;
    byReportingArea[row.reportingAreaId] ??= {quantity:0,revenue:0};
    byReportingArea[row.reportingAreaId].quantity += quantity;
    byReportingArea[row.reportingAreaId].revenue += revenue;
    byProduct[row.productCode] ??= {quantity:0,revenue:0};
    byProduct[row.productCode].quantity += quantity;
    byProduct[row.productCode].revenue += revenue;
    byReportingAreaProduct[row.reportingAreaId] ??= {};
    byReportingAreaProduct[row.reportingAreaId][row.productCode] ??= {quantity:0,revenue:0};
    byReportingAreaProduct[row.reportingAreaId][row.productCode].quantity += quantity;
    byReportingAreaProduct[row.reportingAreaId][row.productCode].revenue += revenue;
    byChannel[row.salesChannel] ??= {quantity:0,revenue:0};
    byChannel[row.salesChannel].quantity += quantity;
    byChannel[row.salesChannel].revenue += revenue;
    if (!knownProducts.has(row.productCode)) unmapped.add(row.productCode);
  }

  return {
    totalTickets,
    totalRevenue,
    averageTicketPrice: totalTickets ? totalRevenue/totalTickets : 0,
    byReportingArea,
    byProduct,
    byReportingAreaProduct,
    byChannel,
    unmappedProducts:[...unmapped].sort(),
    channelsPresent:Object.keys(byChannel).sort(),
  };
}

function aggregateKp(
  rows:KpEntryLive[],
  validations:KpValidationLive[],
  milestones:KpMilestoneDefinitionLive[],
):LiveKpAggregate {
  const ordered=[...milestones].sort((a,b)=>a.order-b.order);
  const milestoneIds=ordered.map(m=>m.id);
  const byAreaMilestone:LiveKpAggregate['byAreaMilestone']={};

  const areas=new Set<string>([
    ...rows.filter(r=>r.includeInKp).map(r=>r.reportingAreaId),
    ...validations.map(v=>v.reportingAreaId),
  ]);

  const sumEntries=(areaId:string,milestoneId:string):LiveKpPoint|null=>{
    const candidates=rows.filter(r=>r.includeInKp && r.reportingAreaId===areaId);
    let potential=0, opened=0, artificial=0, natural=0, found=false;
    for (const row of candidates) {
      const value=(row.milestones ?? []).find(m=>m.milestoneId===milestoneId);
      if (!value) continue;
      found=true;
      potential+=Number(row.referenceKm?.potentialOperationalKm || 0);
      opened+=Number(value.openedKm || 0);
      artificial+=Number(value.artificialSnowKm || 0);
      natural+=Number(value.naturalSnowKm || 0);
    }
    return found ? {
      potentialOperationalKm:potential,
      openedKm:opened,
      artificialSnowKm:artificial,
      naturalSnowKm:natural,
      source:'entries',
    } : null;
  };

  for (const areaId of areas) {
    byAreaMilestone[areaId]={};
    for (const milestoneId of milestoneIds) {
      const validation=validations.find(v=>v.reportingAreaId===areaId && v.milestoneId===milestoneId);
      if (validation) {
        byAreaMilestone[areaId][milestoneId]={
          potentialOperationalKm:Number(validation.potentialOperationalKm || 0),
          openedKm:Number(validation.openedKm || 0),
          artificialSnowKm:Number(validation.artificialSnowKm || 0),
          naturalSnowKm:Number(validation.naturalSnowKm || 0),
          source:'validation',
        };
        continue;
      }
      const fallback=sumEntries(areaId,milestoneId);
      if (fallback) byAreaMilestone[areaId][milestoneId]=fallback;
    }
  }

  const latestMilestoneId=milestoneIds.at(-1);
  const latest:LiveKpAggregate['areas']={};
  if (latestMilestoneId) {
    for (const areaId of Object.keys(byAreaMilestone)) {
      const point=byAreaMilestone[areaId][latestMilestoneId];
      if (point) latest[areaId]=point;
    }
  }

  return {
    entries:rows.length,
    includedEntries:rows.filter(r=>r.includeInKp).length,
    validations:validations.length,
    milestoneIds,
    byAreaMilestone,
    areas:latest,
  };
}

async function readHistoricalRecords(
  seasonId:string,
  domain:'sales'|'kp',
):Promise<HistoricalSeasonRecord[]> {
  const snap=await getDocs(query(
    collection(db,'historicalSeasonRecords'),
    where('seasonId','==',seasonId),
    where('domain','==',domain),
  ));
  return snap.docs.map(d=>({id:d.id,...d.data()} as HistoricalSeasonRecord));
}

function historicalSalesRows(records:HistoricalSeasonRecord[]):TicketSalesLive[] {
  return records.flatMap(record=>(record.facts ?? []).map((fact,index)=>({
    id:`${record.id}__${index}`,
    seasonId:record.seasonId,
    organizationId:record.organizationId,
    reportingAreaId:record.reportingAreaId,
    productCode:String(fact.productCode ?? ''),
    salesChannel:String(fact.salesChannel ?? ''),
    salesPeriod:fact.salesPeriod == null ? undefined : String(fact.salesPeriod),
    quantity:Number(fact.quantity ?? 0),
    calculatedAmount:Number(fact.amount ?? 0),
  })));
}

function historicalKpSnapshot(records:HistoricalSeasonRecord[],seasonId:string) {
  const dates=[...new Set(records.flatMap(record=>
    (record.facts ?? []).map(fact=>String(fact.date ?? '')).filter(Boolean)
  ))].sort();
  const milestones:KpMilestoneDefinitionLive[]=dates.map((date,index)=>({
    id:`${seasonId}__history__m${index+1}`,
    seasonId,
    date,
    label:date,
    order:index+1,
  }));
  const milestoneIdByDate=new Map(milestones.map(m=>[m.date,m.id]));

  const rows:KpEntryLive[]=records.map(record=>{
    const facts=record.facts ?? [];
    const referenceKm=Number(facts[0]?.referenceKm ?? 0);
    return {
      id:record.id,
      seasonId:record.seasonId,
      entityId:record.organizationId,
      label:record.label,
      reportingAreaId:record.reportingAreaId,
      referenceKm:{
        uniqueNetworkKm:referenceKm,
        potentialOperationalKm:referenceKm,
      },
      milestones:facts.map(fact=>{
        const date=String(fact.date ?? '');
        const natural=Number(fact.naturalKm ?? 0);
        const artificial=Number(fact.artificialKm ?? 0);
        return {
          milestoneId:milestoneIdByDate.get(date) ?? date,
          openedKm:natural+artificial,
          naturalSnowKm:natural,
          artificialSnowKm:artificial,
        };
      }),
      includeInKp:record.organizationId!=='biathlon-antholz',
      exclusionReason:record.organizationId==='biathlon-antholz' ? 'Milano Cortina 2026 / historical exclusion' : undefined,
    };
  });

  return {milestones,rows};
}

function annualCategoryCode(label:string):keyof AnnualSeriesPoint['qty']|null {
  const normalized=label.trim().toLowerCase();
  if (normalized==='day') return 'day';
  if (normalized==='area wk') return 'wka';
  if (normalized==='dns wk') return 'wkd';
  if (normalized==='area sk') return 'ska';
  if (normalized.startsWith('dns sk')) return 'skd';
  return null;
}

function annualFrom2024Record(record:HistoricalSeasonRecord):Map<string,AnnualSeriesPoint> {
  const totals=new Map<string,{quantity:number;amount:number}>();
  const qty=new Map<string,AnnualSeriesPoint['qty']>();
  const revenue=new Map<string,AnnualSeriesPoint['revenue']>();

  for (const fact of record.facts ?? []) {
    if (fact.kind==='annualTotal') {
      totals.set(String(fact.seasonId),{
        quantity:Number(fact.quantity ?? 0),
        amount:Number(fact.amount ?? 0),
      });
      continue;
    }
    if (fact.kind!=='annualCategory') continue;
    const code=annualCategoryCode(String(fact.sourceProductLabel ?? ''));
    if (!code || !Array.isArray(fact.values)) continue;
    for (const value of fact.values as Record<string,unknown>[]) {
      const seasonId=String(value.seasonId ?? '');
      const q=qty.get(seasonId) ?? {day:0,wka:0,wkd:0,ska:0,skd:0};
      const r=revenue.get(seasonId) ?? {day:0,wka:0,wkd:0,ska:0,skd:0};
      q[code]=Number(value.quantity ?? 0);
      r[code]=Number(value.amount ?? 0);
      qty.set(seasonId,q);
      revenue.set(seasonId,r);
    }
  }

  const result=new Map<string,AnnualSeriesPoint>();
  for (const [seasonId,total] of totals) {
    const q=qty.get(seasonId);
    const r=revenue.get(seasonId);
    if (!q || !r) continue;
    result.set(seasonId,{
      seasonId,
      totalTickets:total.quantity,
      totalRevenue:total.amount,
      avgPrice:total.quantity ? total.amount/total.quantity : 0,
      qty:q,
      revenue:r,
    });
  }
  return result;
}

function annual2025FromSales(aggregate:LiveSalesAggregate):AnnualSeriesPoint {
  const group=(code:string,field:'quantity'|'revenue')=>Number(aggregate.byProduct[code]?.[field] ?? 0);
  const skdQty=group('sk-dns','quantity')+group('sk-instructor','quantity');
  const skdRevenue=group('sk-dns','revenue')+group('sk-instructor','revenue');
  return {
    seasonId:'2025-26',
    totalTickets:aggregate.totalTickets,
    totalRevenue:aggregate.totalRevenue,
    avgPrice:aggregate.averageTicketPrice,
    qty:{
      day:group('day','quantity'),
      wka:group('wk-area','quantity'),
      wkd:group('wk-dns','quantity'),
      ska:group('sk-area','quantity'),
      skd:skdQty,
    },
    revenue:{
      day:group('day','revenue'),
      wka:group('wk-area','revenue'),
      wkd:group('wk-dns','revenue'),
      ska:group('sk-area','revenue'),
      skd:skdRevenue,
    },
  };
}

async function loadHistoricalAnnualSeries(currentSales:LiveSalesAggregate):Promise<LiveAnnualSeries|null> {
  const records=await readHistoricalRecords('2024-25','sales');
  const annualRecord=records.find(record=>record.id==='2024-25__sales__network-annual-comparison');
  if (!annualRecord) return null;
  const points=annualFrom2024Record(annualRecord);
  points.set('2025-26',annual2025FromSales(currentSales));
  const order=['2022-23','2023-24','2024-25','2025-26'];
  const ordered=order.map(id=>points.get(id)).filter((point):point is AnnualSeriesPoint=>Boolean(point));
  return ordered.length===4 ? {source:'historical-season-records',points:ordered} : null;
}

async function readSeason<T>(collectionName:string, seasonId:string):Promise<T[]> {
  const snap=await getDocs(query(collection(db,collectionName),where('seasonId','==',seasonId)));
  return snap.docs.map(d=>({id:d.id,...d.data()} as T));
}

export async function loadLiveAnalyticsSnapshot(
  seasonId:string,
  access:AnalyticsAccessContext,
):Promise<LiveAnalyticsSnapshot> {
  const snapshot:LiveAnalyticsSnapshot={seasonId,loadedAt:new Date().toISOString()};

  if (access.canReadTicketSales) {
    if (seasonId==='2025-26') {
      const records=await readHistoricalRecords(seasonId,'sales');
      const rows=historicalSalesRows(records);
      const aggregate=aggregateSales(rows);
      snapshot.sales={
        source:'historical-season-records',
        rows,
        aggregate,
      };
      snapshot.annual=await loadHistoricalAnnualSeries(aggregate);
    } else {
      const rows=await readSeason<TicketSalesLive>('ticketSales',seasonId);
      snapshot.sales={source:'operational',rows,aggregate:aggregateSales(rows)};
    }
  }

  if (access.canReadKp) {
    if (seasonId==='2025-26') {
      const records=await readHistoricalRecords(seasonId,'kp');
      const historical=historicalKpSnapshot(records,seasonId);
      snapshot.kp={
        source:'historical-season-records',
        milestones:historical.milestones,
        rows:historical.rows,
        validations:[],
        aggregate:aggregateKp(historical.rows,[],historical.milestones),
      };
    } else {
      const [milestones,rows,validations]=await Promise.all([
        readSeason<KpMilestoneDefinitionLive>('kpMilestones',seasonId),
        readSeason<KpEntryLive>('kpEntries',seasonId),
        readSeason<KpValidationLive>('kpFairValidations',seasonId),
      ]);
      snapshot.kp={
        source:'operational',
        milestones,
        rows,
        validations,
        aggregate:aggregateKp(rows,validations,milestones),
      };
    }
  }

  return snapshot;
}
