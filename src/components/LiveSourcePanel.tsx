import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  loadAnalyticsAccess,
  signInAnalytics,
  signOutAnalytics,
  subscribeAnalyticsAuth,
  type AnalyticsAccessContext,
} from '../services/auth';
import { loadLiveAnalyticsSnapshot, type LiveAnalyticsSnapshot } from '../services/liveAnalytics';
import { compareLiveToCompatibility, paritySummary } from '../services/parity';

type Language = 'de' | 'it';

export function LiveSourcePanel({language,seasonId}:{language:Language;seasonId:string}) {
  const [user,setUser]=useState<User|null>(null);
  const [access,setAccess]=useState<AnalyticsAccessContext|null>(null);
  const [snapshot,setSnapshot]=useState<LiveAnalyticsSnapshot|null>(null);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>subscribeAnalyticsAuth(next=>setUser(next)),[]);

  useEffect(()=>{
    let live=true;
    async function refresh(){
      if (!user) {
        if (live) {
          setAccess(null);
          setSnapshot(null);
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
        }
      } catch (cause:any) {
        if (live) setError(cause?.code ?? cause?.message ?? 'LIVE_SOURCE_FAILED');
      } finally {
        if (live) setBusy(false);
      }
    }
    void refresh();
    return()=>{live=false};
  },[user,seasonId]);

  const checks=useMemo(()=>compareLiveToCompatibility(snapshot),[snapshot]);
  const summary=useMemo(()=>paritySummary(checks),[checks]);

  async function login(){
    setBusy(true);
    setError('');
    try {
      await signInAnalytics(email,password);
      setPassword('');
    } catch (cause:any) {
      setError(cause?.code ?? cause?.message ?? 'LOGIN_FAILED');
      setBusy(false);
    }
  }

  if (!user) return <section className="analytics-live-panel is-auth" aria-label="DNS_Core live source">
    <div className="analytics-live-copy">
      <strong>{language==='de'?'DNS_Core Live-Daten':'Dati live DNS_Core'}</strong>
      <span>{language==='de'
        ? ' Für operative Analytics-Daten ist eine DNS-Anmeldung erforderlich. Bis dahin bleibt der validierte Compatibility-Datensatz aktiv.'
        : ' Per i dati operativi di Analytics è necessario un accesso DNS. Fino ad allora resta attivo il dataset compatibility validato.'}</span>
    </div>
    <div className="analytics-live-login">
      <input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-Mail"/>
      <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" onKeyDown={e=>{if(e.key==='Enter') void login();}}/>
      <button type="button" disabled={busy||!email||!password} onClick={()=>void login()}>
        {busy ? '…' : (language==='de'?'Anmelden':'Accedi')}
      </button>
    </div>
    {error && <div className="analytics-live-error" role="alert">{error}</div>}
  </section>;

  return <section className="analytics-live-panel" aria-label="DNS_Core live source">
    <div className="analytics-live-copy">
      <strong>DNS_Core · {seasonId}</strong>
      <span>{busy
        ? (language==='de'?' Live-Daten werden geladen…':'Caricamento dati live…')
        : snapshot
          ? (language==='de'
              ? ` Live geladen · Sales ${snapshot.sales?.rows.length ?? 0} · KP ${snapshot.kp?.rows.length ?? 0}`
              : ` Live caricati · Sales ${snapshot.sales?.rows.length ?? 0} · KP ${snapshot.kp?.rows.length ?? 0}`)
          : (language==='de'?' Keine Live-Daten verfügbar.':'Nessun dato live disponibile.')}</span>
    </div>

    <div className="analytics-live-meta">
      <span className={summary.ready?'is-ready':summary.different?'is-warning':''}>
        {language==='de'
          ? `Parity: ${summary.matches}/${summary.available} match`
          : `Parità: ${summary.matches}/${summary.available} corrispondenti`}
      </span>
      <span>
        Sales {access?.canReadTicketSales?'✓':'—'} · KP {access?.canReadKp?'✓':'—'}
      </span>
      <button type="button" onClick={()=>void signOutAnalytics()}>
        {language==='de'?'Abmelden':'Esci'}
      </button>
    </div>

    {summary.different>0 && <details className="analytics-live-diagnostics">
      <summary>{language==='de'?'Abweichungen anzeigen':'Mostra differenze'}</summary>
      <div className="analytics-live-diagnostic-grid">
        {checks.filter(c=>c.status==='different').map(c=><div key={c.id}>
          <span>{c.label}</span>
          <strong>{c.live?.toLocaleString('de-DE')}</strong>
          <small>legacy {c.legacy.toLocaleString('de-DE')} · Δ {c.delta?.toLocaleString('de-DE')}</small>
        </div>)}
      </div>
    </details>}
    {error && <div className="analytics-live-error" role="alert">{error}</div>}
  </section>;
}
