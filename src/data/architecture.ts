import { advancedDefaults, annual, REGIONS, regional, SEASONS, seasonOverview } from './analyticsData';
import { ANALYTICS_METRICS } from './metrics';
import { NETWORK_SCOPE_ID, resolveAnalyticsReportingAreaId } from './scopes';
import type { AnalyticsAggregate, AnalyticsAssumption, AnalyticsLayerSet, AnalyticsModel } from './layers';

const source = 'analyticsData.ts compatibility snapshot';

function networkAggregate(seasonId:string, metricId:string, value:number): AnalyticsAggregate {
  return { seasonId, metricId, scopeType:'network', scopeId:NETWORK_SCOPE_ID, value, derivedFrom:[source] };
}

function areaAggregate(seasonId:string, metricId:string, label:string, value:number): AnalyticsAggregate | null {
  const scopeId = resolveAnalyticsReportingAreaId(label);
  if (!scopeId) return null;
  return { seasonId, metricId, scopeType:'reportingArea', scopeId, value, derivedFrom:[source] };
}

const latestSeason = SEASONS[SEASONS.length - 1];

const aggregates: AnalyticsAggregate[] = [
  networkAggregate(latestSeason, ANALYTICS_METRICS.totalTickets.id, seasonOverview.totalTickets),
  networkAggregate(latestSeason, ANALYTICS_METRICS.totalRevenue.id, seasonOverview.totalRevenue),
  networkAggregate(latestSeason, ANALYTICS_METRICS.averageTicketPrice.id, seasonOverview.avgPrice),
  ...SEASONS.flatMap((seasonId,index)=>[
    networkAggregate(seasonId, ANALYTICS_METRICS.totalTickets.id, annual.totalTickets[index]),
    networkAggregate(seasonId, ANALYTICS_METRICS.totalRevenue.id, annual.totalRevenue[index]),
    networkAggregate(seasonId, ANALYTICS_METRICS.averageTicketPrice.id, annual.avgPrice[index]),
  ]),
  ...REGIONS.flatMap((region,index)=>[
    areaAggregate(latestSeason, ANALYTICS_METRICS.totalTickets.id, region, regional.totalQ[index]),
    areaAggregate(latestSeason, ANALYTICS_METRICS.totalRevenue.id, region, regional.totalR[index]),
  ].filter((item): item is AnalyticsAggregate => item !== null)),
];

const models: AnalyticsModel[] = [
  {
    id:'dns-advanced-economic-impact-v1',
    label:'Advanced Analytics economic impact',
    version:'1.0.0',
    outputMetricIds:['economic-impact.direct','economic-impact.total'],
  },
  {
    id:'dns-langlauf-intensity-v1',
    label:'Cross-country intensity model',
    version:'1.0.0',
    outputMetricIds:['langlauf.intensity.weekly','langlauf.intensity.weekly-plus-day'],
  },
  {
    id:'dns-kp-v1',
    label:'Kunstschneeproduktion / KP',
    version:'1.0.0',
    outputMetricIds:[ANALYTICS_METRICS.kpRatio.id],
  },
];

const assumptions: AnalyticsAssumption[] = [
  { modelId:'dns-advanced-economic-impact-v1', key:'nightsPerWeeklyGuest', value:advancedDefaults.nightsPerWeeklyGuest, source },
  { modelId:'dns-advanced-economic-impact-v1', key:'overnightShare', value:advancedDefaults.overnightShare, source },
  { modelId:'dns-advanced-economic-impact-v1', key:'spendPerNight', value:advancedDefaults.spendPerNight, source },
  { modelId:'dns-advanced-economic-impact-v1', key:'multiplier', value:advancedDefaults.multiplier, source },
  { modelId:'dns-advanced-economic-impact-v1', key:'dayOvernightShare', value:advancedDefaults.dayOvernightShare, source },
];

export const compatibilityAnalyticsLayers: AnalyticsLayerSet = {
  analyticsRaw: [],
  analyticsAggregates: aggregates,
  analyticsModels: models,
  analyticsAssumptions: assumptions,
};
