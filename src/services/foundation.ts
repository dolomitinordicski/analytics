import { DNS_DESIGN_SYSTEM } from '@dolomitinordicski/dns-shared-data/design-system';
import { initDNSInteractionRuntime } from '@dolomitinordicski/dns-shared-data/ui/interaction';
import { initDNSRevealRuntime } from '@dolomitinordicski/dns-shared-data/ui/motion';
import { initDNSPrintRuntime } from '@dolomitinordicski/dns-shared-data/ui/print';
import { initDNSToolChromeRuntime } from '@dolomitinordicski/dns-shared-data/ui/tool-chrome';
import { initDNSUIPrimitives } from '@dolomitinordicski/dns-shared-data/ui/primitives';
import { initDNSContentPatterns } from '@dolomitinordicski/dns-shared-data/ui/content-patterns';

export const DNS_ANALYTICS_FOUNDATION_VERSION = DNS_DESIGN_SYSTEM.version;
export const DNS_SHARED_WEB_LOGO_URL =
  'https://dolomitinordicski.github.io/dns-shared-data/brand/logo-web.png';
export const DNS_SHARED_PRINT_LOGO_URL =
  'https://dolomitinordicski.github.io/dns-shared-data/brand/logo.png';

let printRuntime: ReturnType<typeof initDNSPrintRuntime> | null = null;

function applyAnalyticsFoundationSemantics(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.analytics-table-wrap').forEach((element) => {
    element.classList.add('dns-table-wrap');
  });

  root.querySelectorAll<HTMLElement>('table.analytics-table').forEach((element) => {
    element.classList.add('dns-table');
  });

  root.querySelectorAll<HTMLElement>('.analytics-live-error').forEach((element) => {
    element.classList.add('dns-alert');
    element.dataset.variant = 'error';
    element.setAttribute('role', 'alert');
  });

  root.querySelectorAll<HTMLElement>('.analytics-runtime-state.is-loading').forEach((element) => {
    element.classList.add('dns-state');
    element.dataset.state = 'loading';
  });

  root.querySelectorAll<HTMLElement>('.analytics-runtime-state.is-error').forEach((element) => {
    element.classList.add('dns-state');
    element.dataset.state = 'error';
  });

  root.querySelectorAll<HTMLElement>('.analytics-methodology').forEach((element) => {
    element.classList.add('dns-methodology');
  });

  root.querySelectorAll<HTMLElement>('.analytics-methodology-source').forEach((element) => {
    element.classList.add('dns-source');
  });

  root.querySelectorAll<HTMLElement>(
    '.analytics-assumption-note, .analytics-note-small, .analytics-insight-body, .analytics-bilingual-note, .analytics-legacy-list, .analytics-legacy-columns',
  ).forEach((element) => {
    element.classList.add('dns-readable-copy');
  });
}

function observeAnalyticsFoundationSemantics() {
  applyAnalyticsFoundationSemantics();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          applyAnalyticsFoundationSemantics(node);
          if (node.matches('.analytics-table-wrap')) node.classList.add('dns-table-wrap');
          if (node.matches('table.analytics-table')) node.classList.add('dns-table');
          if (node.matches('.analytics-live-error')) {
            node.classList.add('dns-alert');
            node.dataset.variant = 'error';
            node.setAttribute('role', 'alert');
          }
          if (node.matches('.analytics-runtime-state.is-loading')) {
            node.classList.add('dns-state');
            node.dataset.state = 'loading';
          }
          if (node.matches('.analytics-runtime-state.is-error')) {
            node.classList.add('dns-state');
            node.dataset.state = 'error';
          }
          if (node.matches('.analytics-methodology')) node.classList.add('dns-methodology');
          if (node.matches('.analytics-methodology-source')) node.classList.add('dns-source');
          if (node.matches('.analytics-assumption-note, .analytics-note-small, .analytics-insight-body, .analytics-bilingual-note, .analytics-legacy-list, .analytics-legacy-columns')) {
            node.classList.add('dns-readable-copy');
          }
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export function applyDNSFoundation() {
  const ds = DNS_DESIGN_SYSTEM;
  initDNSUIPrimitives();
  initDNSContentPatterns();
  const root = document.documentElement;
  root.style.setProperty('--color-dns-deep', ds.colors.deep);
  root.style.setProperty('--color-dns-mid', ds.colors.mid);
  root.style.setProperty('--color-dns-light', ds.colors.light);
  root.style.setProperty('--color-dns-bg', ds.colors.background);
  root.style.setProperty('--color-dns-surface', ds.colors.surface);
  root.style.setProperty('--color-dns-muted', ds.colors.mutedText);
  root.style.setProperty('--color-dns-border', ds.colors.border);
  root.style.setProperty('--dns-card-radius', `${ds.shape.cardRadiusPx}px`);
  root.style.setProperty('--dns-control-radius', `${ds.shape.controlRadiusPx}px`);

  const interaction = initDNSInteractionRuntime({ interaction: ds.interaction, motion: ds.motion });
  const reveal = initDNSRevealRuntime({ motion: ds.motion });
  const chrome = initDNSToolChromeRuntime({
    navigation: ds.navigation,
    responsive: ds.responsive,
    headerTokens: ds.header,
    motion: ds.motion,
  });
  printRuntime = initDNSPrintRuntime({ print: ds.print });
  const disconnectSemanticBridge = observeAnalyticsFoundationSemantics();

  document.body.dataset.dnsDesignVersion = ds.version;
  return () => {
    chrome.disconnect();
    interaction.disconnect();
    reveal.disconnect();
    printRuntime?.disconnect();
    disconnectSemanticBridge();
    printRuntime = null;
  };
}

export function printDNSDocument() {
  printRuntime?.printNow();
}
