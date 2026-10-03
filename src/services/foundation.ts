import {
  initDNSFoundation,
  type DNSFoundationRuntimeHandle,
} from '@dolomitinordicski/dns-shared-data/foundation';
import { DNS_FOUNDATION_RELEASE_VERSION } from '@dolomitinordicski/dns-shared-data/release';

export type DNSAnalyticsLanguage = 'de' | 'it';

const foundationAssets =
  `https://raw.githubusercontent.com/dolomitinordicski/dns-shared-data/foundation-v${DNS_FOUNDATION_RELEASE_VERSION}/brand`;

export const DNS_ANALYTICS_FOUNDATION_VERSION = DNS_FOUNDATION_RELEASE_VERSION;
export const DNS_SHARED_WEB_LOGO_URL = `${foundationAssets}/logo-web.png`;
export const DNS_SHARED_PRINT_LOGO_URL = `${foundationAssets}/logo.png`;

let foundation: DNSFoundationRuntimeHandle | null = null;

export function initDNSAnalyticsFoundation(language?: DNSAnalyticsLanguage) {
  if (!foundation) {
    foundation = initDNSFoundation({
      language,
      shellProfile: 'operational',
      capabilities: ['print'],
      printProfile: 'report',
      accessibility: {
        enabled: true,
        mountSelector: '[data-dns-accessibility-mount]',
        storageKey: 'dns-accessibility-v1',
      },
    });
  } else if (language && foundation.getLanguage() !== language) {
    foundation.setLanguage(language);
  }

  return foundation;
}

export function getDNSAnalyticsLanguage(): DNSAnalyticsLanguage {
  return initDNSAnalyticsFoundation().getLanguage();
}

export function setDNSAnalyticsLanguage(language: DNSAnalyticsLanguage) {
  initDNSAnalyticsFoundation().setLanguage(language);
}

export function subscribeDNSAnalyticsLanguage(
  listener: (language: DNSAnalyticsLanguage) => void,
) {
  return initDNSAnalyticsFoundation().subscribeLanguage(listener);
}

export const dnsAnalyticsCapabilities = {
  run<T = unknown>(capability: 'print', input?: unknown) {
    return initDNSAnalyticsFoundation().capabilityRuntime.run<T>(capability, input);
  },
};
