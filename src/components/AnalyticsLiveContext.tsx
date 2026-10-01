import { createContext, useContext, type ReactNode } from 'react';
import type { LiveAnalyticsSnapshot } from '../services/liveAnalytics';
import { compareLiveToCompatibility, paritySummary } from '../services/parity';

type AnalyticsLiveContextValue = {
  snapshot: LiveAnalyticsSnapshot | null;
  overviewLiveReady: boolean;
};

const AnalyticsLiveContext = createContext<AnalyticsLiveContextValue>({
  snapshot: null,
  overviewLiveReady: false,
});

export function AnalyticsLiveProvider({
  snapshot,
  children,
}: {
  snapshot: LiveAnalyticsSnapshot | null;
  children: ReactNode;
}) {
  const summary = paritySummary(compareLiveToCompatibility(snapshot));
  return <AnalyticsLiveContext.Provider value={{ snapshot, overviewLiveReady: summary.ready }}>
    {children}
  </AnalyticsLiveContext.Provider>;
}

export function useAnalyticsLive() {
  return useContext(AnalyticsLiveContext);
}
