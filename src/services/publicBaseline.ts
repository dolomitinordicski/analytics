import { doc, getDoc } from 'firebase/firestore';
import { db } from './dnsCore';
import {
  REGIONS,
  SEASONS,
  TICKET_TYPES,
  seasonOverview,
  annual,
  regional,
  kpRegions,
  kpPartners,
  advancedDefaults,
  overnightAreas,
  intensityAreas,
} from '../data/analyticsData';

export type PublicBaselineMismatch = {
  path: string;
  local: unknown;
  remote: unknown;
};

export type PublicBaselineParity = {
  state: 'ready' | 'missing' | 'error';
  matches: boolean;
  mismatchCount: number;
  mismatches: PublicBaselineMismatch[];
  revision?: number;
  sourceSha256?: string;
  error?: string;
};

function localBaseline() {
  return {
    labels: {
      regions: [...REGIONS],
      seasons: [...SEASONS],
      ticketTypes: [...TICKET_TYPES],
    },
    seasonOverview: {
      ...seasonOverview,
      regionQty:[...seasonOverview.regionQty],
      regionRevenue:[...seasonOverview.regionRevenue],
      ticketQty:[...seasonOverview.ticketQty],
      ticketRevenue:[...seasonOverview.ticketRevenue],
      channels:{
        labels:[...seasonOverview.channels.labels],
        values:[...seasonOverview.channels.values],
      },
    },
    annual: {
      qty:{
        day:[...annual.qty.day],
        wka:[...annual.qty.wka],
        ska:[...annual.qty.ska],
        wkd:[...annual.qty.wkd],
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
    },
    regional: JSON.parse(JSON.stringify(regional)),
    kpRegions: kpRegions.map(({r,pot,tot1,ks1,tot2,ks2,tot3,ks3,note})=>({
      r,pot,tot1,ks1,tot2,ks2,tot3,ks3,note,
    })),
    kpPartners: kpPartners.map(row=>({...row})),
    advancedDefaults:{
      weeklyTicketsNetwork:advancedDefaults.weeklyTicketsNetwork,
      weeklyTicketsSouthTyrol:advancedDefaults.weeklyTicketsSouthTyrol,
      dayTickets:advancedDefaults.dayTickets,
      model:{
        nightsPerWeeklyGuest:advancedDefaults.nightsPerWeeklyGuest,
        overnightShare:advancedDefaults.overnightShare,
        spendPerNight:advancedDefaults.spendPerNight,
        multiplier:advancedDefaults.multiplier,
        dayOvernightShare:advancedDefaults.dayOvernightShare,
      },
      astat:advancedDefaults.astat.map(row=>({...row})),
    },
    overnightAreas:overnightAreas.map(row=>({area:row.area,pn:[...row.pn],m:[...row.m]})),
    intensityAreas:intensityAreas.map(row=>({...row})),
  };
}

function compare(path:string,local:unknown,remote:unknown,mismatches:PublicBaselineMismatch[]) {
  if (Object.is(local,remote)) return;

  if (Array.isArray(local) || Array.isArray(remote)) {
    if (!Array.isArray(local) || !Array.isArray(remote)) {
      mismatches.push({path,local,remote});
      return;
    }
    if (local.length!==remote.length) {
      mismatches.push({path:path+'.length',local:local.length,remote:remote.length});
    }
    const length=Math.max(local.length,remote.length);
    for (let i=0;i<length;i++) compare(`${path}[${i}]`,local[i],remote[i],mismatches);
    return;
  }

  if (
    local && remote &&
    typeof local==='object' && typeof remote==='object'
  ) {
    const localRecord=local as Record<string,unknown>;
    const remoteRecord=remote as Record<string,unknown>;
    const keys=[...new Set([...Object.keys(localRecord),...Object.keys(remoteRecord)])].sort();
    for (const key of keys) {
      compare(path ? `${path}.${key}` : key,localRecord[key],remoteRecord[key],mismatches);
    }
    return;
  }

  mismatches.push({path,local,remote});
}

export async function loadPublicBaselineParity():Promise<PublicBaselineParity> {
  try {
    const snap=await getDoc(doc(db,'analyticsPublicSnapshots','2025-26'));
    if (!snap.exists()) {
      return {state:'missing',matches:false,mismatchCount:0,mismatches:[]};
    }
    const data=snap.data() as Record<string,unknown>;
    if (
      data.id!=='2025-26' ||
      data.seasonId!=='2025-26' ||
      data.publicationStatus!=='published' ||
      !data.baseline ||
      typeof data.baseline!=='object'
    ) {
      return {
        state:'error',
        matches:false,
        mismatchCount:0,
        mismatches:[],
        error:'INVALID_PUBLIC_BASELINE',
      };
    }

    const mismatches:PublicBaselineMismatch[]=[];
    compare('',localBaseline(),data.baseline,mismatches);
    const source=data.source as Record<string,unknown>|undefined;

    return {
      state:'ready',
      matches:mismatches.length===0,
      mismatchCount:mismatches.length,
      mismatches,
      revision:typeof data.revision==='number' ? data.revision : undefined,
      sourceSha256:typeof source?.auditSourceSha256==='string'
        ? String(source.auditSourceSha256)
        : undefined,
    };
  } catch (error) {
    return {
      state:'error',
      matches:false,
      mismatchCount:0,
      mismatches:[],
      error:error instanceof Error ? error.message : String(error),
    };
  }
}
