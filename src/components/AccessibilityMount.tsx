import { useEffect, useRef } from 'react';
import { initDNSAccessibilityRuntime, type DNSAccessibilityLanguage } from '@dolomitinordicski/dns-shared-data/ui/accessibility';

export function AccessibilityMount({ language }: { language: DNSAccessibilityLanguage }) {
  const ref = useRef<HTMLDivElement>(null);
  const runtime = useRef<ReturnType<typeof initDNSAccessibilityRuntime> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    runtime.current = initDNSAccessibilityRuntime({
      mountTarget: ref.current,
      language,
      storageKey: 'dns-accessibility-v1',
    });
    return () => runtime.current?.disconnect();
  }, []);

  useEffect(() => runtime.current?.setLanguage(language), [language]);

  return <div ref={ref} className="flex items-center" />;
}
