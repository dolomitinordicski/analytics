export const ANALYTICS_METRICS = {
  totalTickets: { id:'tickets.total.qty', unit:'count', label:'Total tickets' },
  totalRevenue: { id:'tickets.total.revenue', unit:'EUR', label:'Total ticket revenue' },
  averageTicketPrice: { id:'tickets.avg.price', unit:'EUR', label:'Average ticket price' },
  dayQty: { id:'tickets.day.qty', unit:'count', label:'Day tickets' },
  weekAreaQty: { id:'tickets.week.area.qty', unit:'count', label:'Weekly area tickets' },
  weekDnsQty: { id:'tickets.week.dns.qty', unit:'count', label:'Weekly DNS tickets' },
  seasonAreaQty: { id:'tickets.season.area.qty', unit:'count', label:'Season area tickets' },
  seasonDnsQty: { id:'tickets.season.dns.qty', unit:'count', label:'Season DNS tickets' },
  dayRevenue: { id:'tickets.day.revenue', unit:'EUR', label:'Day ticket revenue' },
  weekAreaRevenue: { id:'tickets.week.area.revenue', unit:'EUR', label:'Weekly area revenue' },
  weekDnsRevenue: { id:'tickets.week.dns.revenue', unit:'EUR', label:'Weekly DNS revenue' },
  seasonAreaRevenue: { id:'tickets.season.area.revenue', unit:'EUR', label:'Season area revenue' },
  seasonDnsRevenue: { id:'tickets.season.dns.revenue', unit:'EUR', label:'Season DNS revenue' },
  overnightTotal: { id:'overnights.total', unit:'count', label:'Total overnight stays' },
  trailPotentialKm: { id:'trails.potential.km', unit:'km', label:'Potential trail kilometres' },
  trailOpenKm: { id:'trails.open.km', unit:'km', label:'Open trail kilometres' },
  trailArtificialSnowKm: { id:'trails.artificial-snow.km', unit:'km', label:'Artificial-snow trail kilometres' },
  kpRatio: { id:'trails.kp.ratio', unit:'percent', label:'Kunstschneeproduktion ratio' },
} as const;

export type AnalyticsMetricKey = keyof typeof ANALYTICS_METRICS;
export type AnalyticsMetricId = typeof ANALYTICS_METRICS[AnalyticsMetricKey]['id'];

export function metricId(key: AnalyticsMetricKey): AnalyticsMetricId {
  return ANALYTICS_METRICS[key].id;
}
