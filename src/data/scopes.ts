import { resolveReportingAreaId } from '@dolomitinordicski/dns-shared-data';

export const NETWORK_SCOPE_ID = 'dns-network';

export const LEGACY_REPORTING_AREA_ALIASES = {
  'Antholzertal':'antholzertal',
  'Gsiesertal':'gsiesertal-welsberg-taisten',
  '3 Zinnen':'drei-zinnen',
  '3 Zinnen Dolomites':'drei-zinnen',
  'Osttirol':'osttirol',
  'Ahrntal+Sand':'ahrntal',
  'Ahrntal / Sand in Taufers':'ahrntal',
  'Seiser Alm/Val Gardena':'seiser-alm-dolomites-val-gardena',
  'Seiser Alm / Val Gardena':'seiser-alm-dolomites-val-gardena',
  'Comelico':'val-comelico',
  'Cortina': 'cortina-d-ampezzo',
  "Cortina d'Ampezzo":'cortina-d-ampezzo',
} as const;

export function resolveAnalyticsReportingAreaId(name: string): string | null {
  return resolveReportingAreaId(name)
    ?? LEGACY_REPORTING_AREA_ALIASES[name as keyof typeof LEGACY_REPORTING_AREA_ALIASES]
    ?? null;
}
