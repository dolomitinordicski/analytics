import { createContext, useContext, type ReactNode } from 'react';
import type { LiveAnalyticsSnapshot } from '../services/liveAnalytics';
import {
  compareLiveToCompatibility,
  compareRegionalToCompatibility,
  compareKpToCompatibility,
  compareKpPartnersToCompatibility,
  compareAnnualToCompatibility,
  compareAdvancedObservedInputs,
  compareFairOvernightsToCompatibility,
  advancedObservedParitySummary,
  overnightParitySummary,
  annualParitySummary,
  kpPartnerParitySummary,
  kpParitySummary,
  paritySummary,
  regionalParitySummary,
} from '../services/parity';

type AnalyticsLiveContextValue = {
  snapshot: LiveAnalyticsSnapshot | null;
  overviewLiveReady: boolean;
  regionalLiveReady: boolean;
  reliabilityLiveReady: boolean;
  kpPartnerLiveReady: boolean;
  annualLiveReady: boolean;
  advancedLiveReady: boolean;
  overnightLiveReady: boolean;
};

const AnalyticsLiveContext = createContext<AnalyticsLiveContextValue>({
  snapshot: null,
  overviewLiveReady: false,
  regionalLiveReady: false,
  reliabilityLiveReady: false,
  kpPartnerLiveReady: false,
  annualLiveReady: false,
  advancedLiveReady: false,
  overnightLiveReady: false,
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
  const kpSummary = kpParitySummary(compareKpToCompatibility(snapshot));
  const kpPartnerSummary = kpPartnerParitySummary(compareKpPartnersToCompatibility(snapshot));
  const annualSummary = annualParitySummary(compareAnnualToCompatibility(snapshot));
  const advancedSummary = advancedObservedParitySummary(compareAdvancedObservedInputs(snapshot));
  const overnightSummary = overnightParitySummary(compareFairOvernightsToCompatibility(snapshot));
  return <AnalyticsLiveContext.Provider value={{
    snapshot,
    overviewLiveReady: summary.ready,
    regionalLiveReady: regionalSummary.ready,
    reliabilityLiveReady: kpSummary.ready,
    kpPartnerLiveReady: kpPartnerSummary.ready,
    annualLiveReady: annualSummary.ready,
    advancedLiveReady: advancedSummary.ready,
    overnightLiveReady: overnightSummary.ready,
  }}>
    {children}
  </AnalyticsLiveContext.Provider>;
}

export function useAnalyticsLive() {
  return useContext(AnalyticsLiveContext);
}
