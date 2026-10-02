import { createContext, useContext, type ReactNode } from 'react';
import type { LiveAnalyticsSnapshot } from '../services/liveAnalytics';
import { loadPublicBaselineParity, type PublicBaselineData } from '../services/publicBaseline';
import { useEffect, useState } from 'react';
import {
  compareLiveToCompatibility,
  compareRegionalToCompatibility,
  compareKpToCompatibility,
  compareKpPartnersToCompatibility,
  compareAnnualToCompatibility,
  compareAdvancedObservedInputs,
  compareFairOvernightsToCompatibility,
  compareIntensityInputsToCompatibility,
  advancedObservedParitySummary,
  overnightParitySummary,
  intensityParitySummary,
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
  intensityLiveReady: boolean;
  publicBaseline: PublicBaselineData | null;
  publicBaselineReady: boolean;
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
  intensityLiveReady: false,
  publicBaseline: null,
  publicBaselineReady: false,
});

export function AnalyticsLiveProvider({
  snapshot,
  children,
}: {
  snapshot: LiveAnalyticsSnapshot | null;
  children: ReactNode;
}) {
  const [publicBaseline,setPublicBaseline]=useState<PublicBaselineData|null>(null);
  const [publicBaselineReady,setPublicBaselineReady]=useState(false);
  useEffect(()=>{
    let active=true;
    void loadPublicBaselineParity().then(result=>{
      if (!active) return;
      setPublicBaseline(result.matches && result.baseline ? result.baseline : null);
      setPublicBaselineReady(result.matches && !!result.baseline);
    });
    return()=>{active=false};
  },[]);

  const summary = paritySummary(compareLiveToCompatibility(snapshot));
  const regionalSummary = regionalParitySummary(compareRegionalToCompatibility(snapshot));
  const kpSummary = kpParitySummary(compareKpToCompatibility(snapshot));
  const kpPartnerSummary = kpPartnerParitySummary(compareKpPartnersToCompatibility(snapshot));
  const annualSummary = annualParitySummary(compareAnnualToCompatibility(snapshot));
  const advancedSummary = advancedObservedParitySummary(compareAdvancedObservedInputs(snapshot));
  const overnightSummary = overnightParitySummary(compareFairOvernightsToCompatibility(snapshot));
  const intensitySummary = intensityParitySummary(compareIntensityInputsToCompatibility(snapshot));
  return <AnalyticsLiveContext.Provider value={{
    snapshot,
    overviewLiveReady: summary.ready,
    regionalLiveReady: regionalSummary.ready,
    reliabilityLiveReady: kpSummary.ready,
    kpPartnerLiveReady: kpPartnerSummary.ready,
    annualLiveReady: annualSummary.ready,
    advancedLiveReady: advancedSummary.ready,
    overnightLiveReady: overnightSummary.ready,
    intensityLiveReady: intensitySummary.ready,
    publicBaseline,
    publicBaselineReady,
  }}>
    {children}
  </AnalyticsLiveContext.Provider>;
}

export function useAnalyticsLive() {
  return useContext(AnalyticsLiveContext);
}
