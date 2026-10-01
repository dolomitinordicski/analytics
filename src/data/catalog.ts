export const ANALYTICS_CATALOG_VERSION = 'a2.3';

export const ANALYTICS_COMPATIBILITY_DATASET = {
  id: 'analytics-compatibility-2025-26',
  seasonId: '2025-26',
  sourceFile: 'src/data/analyticsData.ts',
  mode: 'compatibility',
  migrationTarget: 'DNS_Core',
  migrationPhase: 'A.3',
} as const;

export const ANALYTICS_METRICS = {
  ticketsTotal: 'tickets.total',
  revenueTotal: 'revenue.total',
  ticketAveragePrice: 'tickets.averagePrice',
  ticketsByProduct: 'tickets.byProduct',
  revenueByProduct: 'revenue.byProduct',
  ticketsBySalesChannel: 'tickets.bySalesChannel',
  ticketsByReportingArea: 'tickets.byReportingArea',
  revenueByReportingArea: 'revenue.byReportingArea',
  trailPotentialKm: 'trails.potentialKm',
  trailOpenKm: 'trails.openKm',
  trailArtificialSnowKm: 'trails.artificialSnowKm',
  kpArtificialSnowRatio: 'trails.kpArtificialSnowRatio',
  overnightStays: 'tourism.overnightStays',
  crossCountryIntensity: 'tourism.crossCountryIntensity',
} as const;

export type AnalyticsMetricId = typeof ANALYTICS_METRICS[keyof typeof ANALYTICS_METRICS];

export const ANALYTICS_SCOPES = {
  network: 'network',
  reportingArea: 'reportingArea',
  destination: 'destination',
  organization: 'organization',
} as const;

export type AnalyticsScopeType = typeof ANALYTICS_SCOPES[keyof typeof ANALYTICS_SCOPES];
