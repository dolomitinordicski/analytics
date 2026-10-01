export type AnalyticsScopeType = 'network' | 'reportingArea' | 'destination' | 'organization';

export interface AnalyticsRawMeasurement {
  seasonId: string;
  metricId: string;
  scopeType: AnalyticsScopeType;
  scopeId: string;
  value: number;
  source: string;
}

export interface AnalyticsAggregate {
  seasonId: string;
  metricId: string;
  scopeType: AnalyticsScopeType;
  scopeId: string;
  value: number;
  derivedFrom: string[];
}

export interface AnalyticsModel {
  id: string;
  label: string;
  version: string;
  outputMetricIds: string[];
}

export interface AnalyticsAssumption {
  modelId: string;
  key: string;
  value: number | string | boolean;
  source?: string;
}

export interface AnalyticsLayerSet {
  analyticsRaw: AnalyticsRawMeasurement[];
  analyticsAggregates: AnalyticsAggregate[];
  analyticsModels: AnalyticsModel[];
  analyticsAssumptions: AnalyticsAssumption[];
}

// A.2.1 intentionally keeps the preserved legacy datasets in analyticsData.ts.
// A.3 will progressively populate these layers from DNS_Core operational sources.
export const analyticsLayers: AnalyticsLayerSet = {
  analyticsRaw: [],
  analyticsAggregates: [],
  analyticsModels: [],
  analyticsAssumptions: [],
};
