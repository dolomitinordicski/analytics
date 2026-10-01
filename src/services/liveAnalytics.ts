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

export type LiveKpAggregate = {
  entries: number;
  includedEntries: number;
  validations: number;
  areas: Record<string,{
    potentialOperationalKm:number;
    openedKm:number;
    artificialSnowKm:number;
    naturalSnowKm:number;
  }>;
};

export type LiveAnalyticsSnapshot = {
  seasonId: string;
  loadedAt: string;
  sales?: { rows:TicketSalesLive[]; aggregate:LiveSalesAggregate };
  kp?: { rows:KpEntryLive[]; validations:KpValidationLive[]; aggregate:LiveKpAggregate };
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

function aggregateKp(rows:KpEntryLive[], validations:KpValidationLive[]):LiveKpAggregate {
  const areas:LiveKpAggregate['areas'] = {};
  const add=(area:string,potential:number,opened:number,artificial:number,natural:number)=>{
    areas[area] ??= {potentialOperationalKm:0,openedKm:0,artificialSnowKm:0,naturalSnowKm:0};
    areas[area].potentialOperationalKm += potential;
    areas[area].openedKm += opened;
    areas[area].artificialSnowKm += artificial;
    areas[area].naturalSnowKm += natural;
  };

  if (validations.length) {
    const latestMilestone = validations.reduce((max,v)=>v.milestoneId > max ? v.milestoneId : max,'');
    validations.filter(v=>v.milestoneId===latestMilestone).forEach(v=>
      add(v.reportingAreaId,v.potentialOperationalKm,v.openedKm,v.artificialSnowKm,v.naturalSnowKm)
    );
  } else {
    rows.filter(r=>r.includeInKp).forEach(r=>{
      const last=[...(r.milestones ?? [])].at(-1);
      if (!last) return;
      add(r.reportingAreaId,Number(r.referenceKm?.potentialOperationalKm || 0),last.openedKm,last.artificialSnowKm,last.naturalSnowKm);
    });
  }

  return {
    entries:rows.length,
    includedEntries:rows.filter(r=>r.includeInKp).length,
    validations:validations.length,
    areas,
  };
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
    const rows=await readSeason<TicketSalesLive>('ticketSales',seasonId);
    snapshot.sales={rows,aggregate:aggregateSales(rows)};
  }

  if (access.canReadKp) {
    const [rows,validations]=await Promise.all([
      readSeason<KpEntryLive>('kpEntries',seasonId),
      readSeason<KpValidationLive>('kpFairValidations',seasonId),
    ]);
    snapshot.kp={rows,validations,aggregate:aggregateKp(rows,validations)};
  }

  return snapshot;
}
