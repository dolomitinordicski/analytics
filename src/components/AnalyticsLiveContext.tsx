import { createContext, useContext, type ReactNode } from 'react';
import type { LiveAnalyticsSnapshot } from '../services/liveAnalytics';
import {
  compareLiveToCompatibility,
  compareRegionalToCompatibility,
  paritySummary,
  regionalParitySummary,
} from '../services/parity';

type AnalyticsLiveContextValue = {
  snapshot: LiveAnalyticsSnapshot | null;
  overviewLiveReady: boolean;
  regionalLiveReady: boolean;
};

const AnalyticsLiveContext = createContext<AnalyticsLiveContextValue>({
  snapshot: null,
  overviewLiveReady: false,
  regionalLiveReady: false,
});

export function AnalyticsLiveProvider({
  snapshot,
  children,
}: {
  snapshot: LiveAnalyticsSnapshot | null;
  children: ReactNode;
}) {
  const summary = paritySummary(compareLiveToCompatibility(snapshot));
  const regionalSummary = regionalParitySummary(compareRegionalToCompatibility(snapshot));
  return <AnalyticsLiveContext.Provider value={{
    snapshot,
    overviewLiveReady: summary.ready,
    regionalLiveReady: regionalSummary.ready,
  }}>
    {children}
  </AnalyticsLiveContext.Provider>;
}

export function useAnalyticsLive() {
  return useContext(AnalyticsLiveContext);
}
