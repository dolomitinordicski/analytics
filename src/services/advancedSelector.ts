import { advancedDefaults, seasonOverview } from '../data/analyticsData';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';
import type { PublicBaselineData } from './publicBaseline';

const SOUTH_TYROL_AREAS = [
  'drei-zinnen',
  'gsiesertal-welsberg-taisten',
  'antholzertal',
  'ahrntal',
  'seiser-alm-dolomites-val-gardena',
] as const;

export type AdvancedObservedInputs = {
  source:'live'|'public'|'compatibility';
  weeklyTicketsNetwork:number;
  weeklyTicketsSouthTyrol:number;
  dayTickets:number;
  weeklyRevenueNetwork:number;
  weeklyRevenueArea:number;
  weeklyRevenueDns:number;
};

export function selectAdvancedObservedInputs(
  snapshot:LiveAnalyticsSnapshot|null,
  liveReady:boolean,
  publicBaseline?:PublicBaselineData|null,
):AdvancedObservedInputs {
  const sales=snapshot?.sales?.aggregate;
  if (!liveReady || !sales) {
    const defaults=publicBaseline?.advancedDefaults;
    const revenue=publicBaseline?.seasonOverview.ticketRevenue ?? seasonOverview.ticketRevenue;
    const weeklyRevenueArea=Number(revenue[1] ?? 0);
    const weeklyRevenueDns=Number(revenue[2] ?? 0);
    return {
      source:publicBaseline?'public':'compatibility',
      weeklyTicketsNetwork:Number(defaults?.weeklyTicketsNetwork ?? advancedDefaults.weeklyTicketsNetwork),
      weeklyTicketsSouthTyrol:Number(defaults?.weeklyTicketsSouthTyrol ?? advancedDefaults.weeklyTicketsSouthTyrol),
      dayTickets:Number(defaults?.dayTickets ?? advancedDefaults.dayTickets),
      weeklyRevenueArea,
      weeklyRevenueDns,
      weeklyRevenueNetwork:weeklyRevenueArea+weeklyRevenueDns,
    };
  }

  const weeklyTicketsNetwork=
    Number(sales.byProduct['wk-area']?.quantity ?? 0)+
    Number(sales.byProduct['wk-dns']?.quantity ?? 0);

  const weeklyTicketsSouthTyrol=SOUTH_TYROL_AREAS.reduce((sum,areaId)=>{
    const area=sales.byReportingAreaProduct[areaId] ?? {};
    return sum+
      Number(area['wk-area']?.quantity ?? 0)+
      Number(area['wk-dns']?.quantity ?? 0);
  },0);

  const weeklyRevenueArea=Number(sales.byProduct['wk-area']?.revenue ?? 0);
  const weeklyRevenueDns=Number(sales.byProduct['wk-dns']?.revenue ?? 0);

  return {
    source:'live',
    weeklyTicketsNetwork,
    weeklyTicketsSouthTyrol,
    dayTickets:Number(sales.byProduct.day?.quantity ?? 0),
    weeklyRevenueArea,
    weeklyRevenueDns,
    weeklyRevenueNetwork:weeklyRevenueArea+weeklyRevenueDns,
  };
}
