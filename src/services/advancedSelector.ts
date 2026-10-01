import { advancedDefaults } from '../data/analyticsData';
import type { LiveAnalyticsSnapshot } from './liveAnalytics';

const SOUTH_TYROL_AREAS = [
  'drei-zinnen',
  'gsiesertal-welsberg-taisten',
  'antholzertal',
  'ahrntal',
  'seiser-alm-dolomites-val-gardena',
] as const;

export type AdvancedObservedInputs = {
  source:'live'|'compatibility';
  weeklyTicketsNetwork:number;
  weeklyTicketsSouthTyrol:number;
  dayTickets:number;
};

export function selectAdvancedObservedInputs(
  snapshot:LiveAnalyticsSnapshot|null,
  liveReady:boolean,
):AdvancedObservedInputs {
  const sales=snapshot?.sales?.aggregate;
  if (!liveReady || !sales) {
    return {
      source:'compatibility',
      weeklyTicketsNetwork:advancedDefaults.weeklyTicketsNetwork,
      weeklyTicketsSouthTyrol:advancedDefaults.weeklyTicketsSouthTyrol,
      dayTickets:advancedDefaults.dayTickets,
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

  return {
    source:'live',
    weeklyTicketsNetwork,
    weeklyTicketsSouthTyrol,
    dayTickets:Number(sales.byProduct.day?.quantity ?? 0),
  };
}
