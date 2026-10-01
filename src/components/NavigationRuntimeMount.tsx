import { useLayoutEffect } from 'react';
import { DNS_DESIGN_SYSTEM } from '@dolomitinordicski/dns-shared-data/design-system';
import { initDNSNavigationRuntime } from '@dolomitinordicski/dns-shared-data/ui/navigation';

export function NavigationRuntimeMount() {
  useLayoutEffect(() => {
    const header = document.getElementById('dns-analytics-header');
    const nav = document.getElementById('dns-analytics-nav');
    if (!(header instanceof HTMLElement) || !(nav instanceof HTMLElement)) return;
    const runtime = initDNSNavigationRuntime({
      header,
      nav,
      progressTrack: document.getElementById('dns-scroll-progress'),
      progressBar: document.getElementById('dns-scroll-progress-bar'),
      navigation: DNS_DESIGN_SYSTEM.navigation,
      responsive: DNS_DESIGN_SYSTEM.responsive,
    });
    return () => runtime.disconnect();
  }, []);
  return null;
}
