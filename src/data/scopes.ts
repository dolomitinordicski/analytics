import { resolveReportingAreaId } from '@dolomitinordicski/dns-shared-data';

export const NETWORK_SCOPE_ID = 'dns-network';

export const LEGACY_REPORTING_AREA_ALIASES = {
  'Antholzertal':'antholzertal',
  'Gsiesertal':'gsiesertal',
  '3 Zinnen':'3-zinnen-dolomites',
  '3 Zinnen Dolomites':'3-zinnen-dolomites',
  'Osttirol':'osttirol',
  'Ahrntal+Sand':'ahrntal-sand-in-taufers',
  'Ahrntal / Sand in Taufers':'ahrntal-sand-in-taufers',
  'Seiser Alm/Val Gardena':'seiser-alm-val-gardena',
  'Seiser Alm / Val Gardena':'seiser-alm-val-gardena',
  'Comelico':'comelico',
  'Cortina': 'cortina-d-ampezzo',
  "Cortina d'Ampezzo":'cortina-d-ampezzo',
} as const;

export function resolveAnalyticsReportingAreaId(name: string): string | null {
  return resolveReportingAreaId(name)
    ?? LEGACY_REPORTING_AREA_ALIASES[name as keyof typeof LEGACY_REPORTING_AREA_ALIASES]
    ?? null;
}
