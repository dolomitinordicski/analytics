import type { DNSCoreStatus } from './dnsCore';

export type AnalyticsBoundaryMode = 'dns-core-ready' | 'compatibility-fallback' | 'initializing';

export function getAnalyticsBoundaryMode(core: DNSCoreStatus): AnalyticsBoundaryMode {
  if (core.state === 'ready') return 'dns-core-ready';
  if (core.state === 'error') return 'compatibility-fallback';
  return 'initializing';
}

export const ANALYTICS_BOUNDARY_POLICY = {
  masterData: 'DNS_Core',
  analyticalFacts: 'compatibility snapshot until A.3 migration',
  fallback: 'preserved local datasets',
  mutation: 'read-only in Analytics',
} as const;
