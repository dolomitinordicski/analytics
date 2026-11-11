import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  loadAnalyticsAccess,
  signOutAnalytics,
  subscribeAnalyticsAuth,
  type AnalyticsAccessContext,
} from '../services/auth';
import { loadLiveAnalyticsSnapshot, type LiveAnalyticsSnapshot } from '../services/liveAnalytics';
import { loadAuditSnapshotParity, type AuditParity } from '../services/auditSnapshot';
import { loadPublicBaselineParity, type PublicBaselineParity } from '../services/publicBaseline';
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

type Language = 'de' | 'it';

export function LiveSourcePanel({
  language,
  seasonId,
  onSnapshot,
}:{language:Language;seasonId:string;onSnapshot?:(snapshot:LiveAnalyticsSnapshot|null)=>void}) {
  const [user,setUser]=useState<User|null>(null);
  const [access,setAccess]=useState<AnalyticsAccessContext|null>(null);
  const [snapshot,setSnapshot]=useState<LiveAnalyticsSnapshot|null>(null);
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState('');
  const [audit,setAudit]=useState<AuditParity|null>(null);
  const [publicBaseline,setPublicBaseline]=useState<PublicBaselineParity|null>(null);

  useEffect(()=>subscribeAnalyticsAuth(next=>setUser(next)),[]);

  useEffect(()=>{
    let active=true;
    void Promise.all([
      loadAuditSnapshotParity(),
      loadPublicBaselineParity(),
    ]).then(([auditResult,publicResult])=>{
      if (!active) return;
      setAudit(auditResult);
      setPublicBaseline(publicResult);
    });
    return()=>{active=false};
  },[]);

  useEffect(()=>{
    let live=true;
    async function refresh(){
      if (!user) {
        if (live) {
          setAccess(null);
          setSnapshot(null);
          onSnapshot?.(null);
          setBusy(false);
        }
        return;
      }
      setBusy(true);
      setError('');
      try {
        const nextAccess=await loadAnalyticsAccess(user.uid);
        const nextSnapshot=await loadLiveAnalyticsSnapshot(seasonId,nextAccess);
        if (live) {
          setAccess(nextAccess);
          setSnapshot(nextSnapshot);
          onSnapshot?.(nextSnapshot);
        }
      } catch (cause:any) {
        if (live) setError(cause?.code ?? cause?.message ?? 'LIVE_SOURCE_FAILED');
      } finally {
        if (live) setBusy(false);
      }
    }
    void refresh();
    return()=>{live=false};
  },[user,seasonId,onSnapshot]);

  const checks=useMemo(()=>compareLiveToCompatibility(snapshot),[snapshot]);
  const summary=useMemo(()=>paritySummary(checks),[checks]);
  const regionalChecks=useMemo(()=>compareRegionalToCompatibility(snapshot),[snapshot]);
  const regionalSummary=useMemo(()=>regionalParitySummary(regionalChecks),[regionalChecks]);
  const kpChecks=useMemo(()=>compareKpToCompatibility(snapshot),[snapshot]);
  const kpSummary=useMemo(()=>kpParitySummary(kpChecks),[kpChecks]);
  const kpPartnerChecks=useMemo(()=>compareKpPartnersToCompatibility(snapshot),[snapshot]);
  const kpPartnerSummary=useMemo(()=>kpPartnerParitySummary(kpPartnerChecks),[kpPartnerChecks]);
  const annualChecks=useMemo(()=>compareAnnualToCompatibility(snapshot),[snapshot]);
  const annualSummary=useMemo(()=>annualParitySummary(annualChecks),[annualChecks]);
  const advancedChecks=useMemo(()=>compareAdvancedObservedInputs(snapshot),[snapshot]);
  const advancedSummary=useMemo(()=>advancedObservedParitySummary(advancedChecks),[advancedChecks]);
  const overnightChecks=useMemo(()=>compareFairOvernightsToCompatibility(snapshot),[snapshot]);
  const overnightSummary=useMemo(()=>overnightParitySummary(overnightChecks),[overnightChecks]);
  const intensityChecks=useMemo(()=>compareIntensityInputsToCompatibility(snapshot),[snapshot]);
  const intensitySummary=useMemo(()=>intensityParitySummary(intensityChecks),[intensityChecks]);

  // Authentication belongs to AnalyticsAccessGate (or the future authorized
  // Hub share session). This diagnostic panel must never prompt for separate
  // credentials or expose a fallback interface to signed-out visitors.
  if (!user) return null;

  return <section className="analytics-live-panel" aria-label="DNS_Core live source">
    <div className="analytics-live-copy">
      <strong>{language==='de'?'DNS_Core Live-Daten':'Dati live DNS_Core'} · {seasonId}</strong>
      <span>{busy
        ? (language==='de'?' Live-Daten werden geladen…':'Caricamento dati live…')
        : snapshot
          ? (language==='de'
              ? ` Live geladen · Verkäufe ${snapshot.sales?.rows.length ?? 0} (${snapshot.sales?.source ?? '—'}) · KP ${snapshot.kp?.rows.length ?? 0} (${snapshot.kp?.source ?? '—'})`
              : ` Live caricati · Vendite ${snapshot.sales?.rows.length ?? 0} (${snapshot.sales?.source ?? '—'}) · KP ${snapshot.kp?.rows.length ?? 0} (${snapshot.kp?.source ?? '—'})`)
          : (language==='de'?' Keine Live-Daten verfügbar.':'Nessun dato live disponibile.')}</span>
    </div>

    <div className="analytics-live-meta">
      <span className={summary.ready?'is-ready':summary.different?'is-warning':''}>
        {language==='de'
          ? `Parität: ${summary.matches}/${summary.available} Übereinstimmungen`
          : `Parità: ${summary.matches}/${summary.available} corrispondenze`}
      </span>
      <span className={publicBaseline?.state==='ready' && publicBaseline.matches ? 'is-ready' : publicBaseline?.state==='ready' ? 'is-warning' : ''}>
        {publicBaseline?.state==='ready'
          ? (publicBaseline.matches
              ? (language==='de' ? `Öffentliche Baseline: 100% · Rev. ${publicBaseline.revision ?? '—'}` : `Pubblica 100% · Rev. ${publicBaseline.revision ?? '—'}`)
              : (language==='de' ? `Öffentliche Baseline: ${publicBaseline.mismatchCount} Δ` : `Pubblica ${publicBaseline.mismatchCount} Δ`))
          : publicBaseline?.state==='missing' ? (language==='de'?'Öffentlicher Snapshot —':'Snapshot pubblico —')
          : publicBaseline?.state==='error' ? (language==='de'?'Öffentliche Baseline: Fehler':'Baseline pubblica: errore')
          : (language==='de'?'Öffentliche Baseline …':'Baseline pubblica …')}
      </span>
      <span className={audit?.state==='ready' && audit.matches ? 'is-ready' : audit?.state==='ready' ? 'is-warning' : ''}>
        {audit?.state==='ready'
          ? (audit.matches ? 'Zero-Loss 100% · 0 Δ' : `Zero-Loss ${audit.mismatchCount} Δ`)
          : audit?.state==='missing' ? (language==='de'?'Zero-Loss Snapshot —':'Snapshot zero-loss —')
          : audit?.state==='error' ? (language==='de'?'Zero-Loss Fehler':'Errore zero-loss')
          : 'Zero-Loss …'}
      </span>
      <span>
        {language==='de'
          ? <>Übersicht {summary.ready?'✓':'—'} · Jahresvergleich {annualSummary.ready?'✓':'—'} · Regionen {regionalSummary.ready?'✓':'—'} · Erweitert {advancedSummary.ready?'✓':'—'} · Übernachtungen {overnightSummary.ready?'✓':'—'} · Intensität {intensitySummary.ready?'✓':'—'} · Zuverlässigkeit {kpSummary.ready?'✓':'—'} · KP Partner {kpPartnerSummary.ready?'✓':'—'} · Verkäufe {access?.canReadTicketSales?'✓':'—'} · KP {access?.canReadKp?'✓':'—'}</>
          : <>Panoramica {summary.ready?'✓':'—'} · Confronto annuale {annualSummary.ready?'✓':'—'} · Regioni {regionalSummary.ready?'✓':'—'} · Avanzate {advancedSummary.ready?'✓':'—'} · Pernottamenti {overnightSummary.ready?'✓':'—'} · Intensità {intensitySummary.ready?'✓':'—'} · Affidabilità {kpSummary.ready?'✓':'—'} · KP partner {kpPartnerSummary.ready?'✓':'—'} · Vendite {access?.canReadTicketSales?'✓':'—'} · KP {access?.canReadKp?'✓':'—'}</>}
      </span>
      <button className="dns-button" data-variant="secondary" type="button" onClick={()=>void signOutAnalytics()}>
        {language==='de'?'Abmelden':'Esci'}
      </button>
    </div>

    {(summary.different>0 || annualSummary.different>0 || regionalSummary.different>0 || advancedSummary.different>0 || overnightSummary.different>0 || intensitySummary.different>0 || kpSummary.different>0 || kpPartnerSummary.different>0) && <details className="analytics-live-diagnostics">
      <summary>{language==='de'?'Abweichungen anzeigen':'Mostra differenze'}</summary>
      <div className="analytics-live-diagnostic-grid">
        {[...checks,...annualChecks,...regionalChecks,...advancedChecks,...overnightChecks,...intensityChecks,...kpChecks,...kpPartnerChecks].filter(c=>c.status==='different').map(c=><div key={c.id}>
          <span>{c.label}</span>
          <strong>{c.live?.toLocaleString(language==='de'?'de-DE':'it-IT')}</strong>
          <small>{language==='de'?'Legacy':'Legacy'} {c.legacy.toLocaleString(language==='de'?'de-DE':'it-IT')} · Δ {c.delta?.toLocaleString(language==='de'?'de-DE':'it-IT')}</small>
        </div>)}
      </div>
    </details>}
    {audit?.state==='ready' && audit.mismatchCount>0 && <details className="analytics-live-diagnostics">
      <summary>{language==='de'?'Zero-Loss Audit-Abweichungen':'Differenze audit zero-loss'}</summary>
      <div className="analytics-live-diagnostic-grid">
        {audit.mismatches.slice(0,100).map(item=><div key={item.path}>
          <span>{item.path}</span>
          <strong>{String(item.remote)}</strong>
          <small>{language==='de'?'lokal':'locale'} {String(item.local)}</small>
        </div>)}
      </div>
    </details>}
    {error && <div className="dns-alert analytics-live-error" data-variant="error" role="alert"><div className="dns-alert-body">{error}</div></div>}
  </section>;
}
