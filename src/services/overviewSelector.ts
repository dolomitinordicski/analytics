import { REGIONS, seasonOverview } from '../data/analyticsData';
import { resolveAnalyticsReportingAreaId } from '../data/scopes';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';
import type { PublicBaselineData } from './publicBaseline';

const PRODUCT_CODES = ['day','wk-area','wk-dns','sk-area','sk-dns'] as const;

export type OverviewDataset = {
  source: 'live' | 'public' | 'compatibility';
  totalTickets: number;
  totalRevenue: number;
  avgPrice: number;
  topRegion: string;
  topRegionRevenue: number;
  topRegionTickets: number;
  regionQty: number[];
  regionRevenue: number[];
  ticketQty: number[];
  ticketRevenue: number[];
  channels: { labels:string[]; values:number[] };
};

export function selectOverviewDataset(
  snapshot: LiveAnalyticsSnapshot | null,
  liveReady: boolean,
  publicBaseline?: PublicBaselineData | null,
): OverviewDataset {
  const sales = snapshot?.sales?.aggregate;
  if ((!liveReady || !sales) && publicBaseline) {
    const b=publicBaseline.seasonOverview;
    return {source:'public',totalTickets:b.totalTickets,totalRevenue:b.totalRevenue,avgPrice:b.avgPrice,topRegion:b.topRegion,topRegionRevenue:b.topRegionRevenue,topRegionTickets:b.topRegionTickets,regionQty:[...b.regionQty],regionRevenue:[...b.regionRevenue],ticketQty:[...b.ticketQty],ticketRevenue:[...b.ticketRevenue],channels:{labels:[...b.channels.labels],values:[...b.channels.values]}};
  }
  if (!liveReady || !sales) {
    return {
      source:'compatibility',
      totalTickets:seasonOverview.totalTickets,
      totalRevenue:seasonOverview.totalRevenue,
      avgPrice:seasonOverview.avgPrice,
      topRegion:seasonOverview.topRegion,
      topRegionRevenue:seasonOverview.topRegionRevenue,
      topRegionTickets:seasonOverview.topRegionTickets,
      regionQty:[...seasonOverview.regionQty],
      regionRevenue:[...seasonOverview.regionRevenue],
      ticketQty:[...seasonOverview.ticketQty],
      ticketRevenue:[...seasonOverview.ticketRevenue],
      channels:{labels:[...seasonOverview.channels.labels],values:[...seasonOverview.channels.values]},
    };
  }

  const regionQty = REGIONS.map(label => {
    const id=resolveAnalyticsReportingAreaId(label);
    return id ? (sales.byReportingArea[id]?.quantity ?? 0) : 0;
  });
  const regionRevenue = REGIONS.map(label => {
    const id=resolveAnalyticsReportingAreaId(label);
    return id ? (sales.byReportingArea[id]?.revenue ?? 0) : 0;
  });
  const ticketQty = PRODUCT_CODES.map(code=>sales.byProduct[code]?.quantity ?? 0);
  const ticketRevenue = PRODUCT_CODES.map(code=>sales.byProduct[code]?.revenue ?? 0);
  const topIndex = regionRevenue.reduce((best,value,index,array)=>value>array[best]?index:best,0);

  return {
    source:'live',
    totalTickets:sales.totalTickets,
    totalRevenue:sales.totalRevenue,
    avgPrice:sales.averageTicketPrice,
    topRegion:REGIONS[topIndex],
    topRegionRevenue:regionRevenue[topIndex],
    topRegionTickets:regionQty[topIndex],
    regionQty,
    regionRevenue,
    ticketQty,
    ticketRevenue,
    channels:{
      labels:['Büro/Uffici','Online','Loipe/Pista'],
      values:[
        sales.byChannel.official?.quantity ?? 0,
        sales.byChannel.online?.quantity ?? 0,
        sales.byChannel.track?.quantity ?? 0,
      ],
    },
  };
}
