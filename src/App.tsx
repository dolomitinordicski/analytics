import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DNS_DATA_CONTRACTS, DNS_DATA_CONTRACTS_VERSION } from '@dolomitinordicski/dns-shared-data/data-contracts';
import { AccessibilityMount } from './components/AccessibilityMount';
import { AnalyticsPrintSheet } from './components/AnalyticsPrintSheet';
import { NavigationRuntimeMount } from './components/NavigationRuntimeMount';
import { LiveSourcePanel } from './components/LiveSourcePanel';
import { AnalyticsLiveProvider } from './components/AnalyticsLiveContext';
import type { LiveAnalyticsSnapshot } from './services/liveAnalytics';
import {
  AdvancedModule,
  AnnualModule,
  IntensityModule,
  OvernightModule,
  OverviewModule,
  RegionalModule,
  ReliabilityModule,
} from './modules/AnalyticsModules';
import {
  applyDNSFoundation,
  DNS_ANALYTICS_FOUNDATION_VERSION,
  DNS_SHARED_WEB_LOGO_URL,
  printDNSDocument,
} from './services/foundation';
import { loadDNSCoreMaster, type DNSCoreStatus } from './services/dnsCore';
import { getAnalyticsBoundaryMode } from './services/analyticsBoundary';

const TABS = [
  { id:'overview', label:'WS 2025-26', component:OverviewModule },
  { id:'annual', label:'Jahresvergleich · Confronto annuale', component:AnnualModule },
  { id:'regions', label:'Performance Regionen · Regioni', component:RegionalModule },
  { id:'reliability', label:'Network Reliability', component:ReliabilityModule },
  { id:'advanced', label:'Advanced Analytics', component:AdvancedModule },
  { id:'overnights', label:'Übernachtungen · Pernottamenti', component:OvernightModule },
  { id:'intensity', label:'Langlauf-Intensität · Peso del fondo', component:IntensityModule },
] as const;

type TabId = typeof TABS[number]['id'];
type Language = 'de' | 'it';

const LANGUAGE_KEY = 'dns-analytics-language';

function detectLanguage(): Language {
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'de' || stored === 'it') return stored;
  return window.navigator.language.toLowerCase().startsWith('it') ? 'it' : 'de';
}

export default function App() {
  const [active,setActive] = useState<TabId>(() => {
    const hash = window.location.hash.replace(/^#/, '') as TabId;
    return TABS.some(tab => tab.id === hash) ? hash : 'overview';
  });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [language,setLanguage] = useState<Language>(detectLanguage);
  const [core,setCore] = useState<DNSCoreStatus>({state:'loading',text:'DNS_Core · connecting…'});
  const [printActive,setPrintActive] = useState(false);
  const [liveSnapshot,setLiveSnapshot] = useState<LiveAnalyticsSnapshot|null>(null);

  const refreshCore = useCallback(async () => {
    setCore({state:'loading',text:'DNS_Core · connecting…'});
    setCore(await loadDNSCoreMaster());
  }, []);

  useEffect(() => applyDNSFoundation(),[]);
  useEffect(() => { void refreshCore(); },[refreshCore]);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.analyticsLanguage = language;
    window.localStorage.setItem(LANGUAGE_KEY, language);
  },[language]);
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') as TabId;
      if (TABS.some(tab => tab.id === hash)) setActive(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  },[]);
  useEffect(() => {
    const button = tabRefs.current[active];
    button?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  },[active]);
  useEffect(() => {
    const handleAfterPrint = () => setPrintActive(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  },[]);

  const tab = useMemo(() => TABS.find(t=>t.id===active) ?? TABS[0],[active]);
  const ActiveComponent = tab.component;
  const analyticsContract = DNS_DATA_CONTRACTS.find(c=>c.id==='analytics');
  const boundaryMode = getAnalyticsBoundaryMode(core);

  return <AnalyticsLiveProvider snapshot={liveSnapshot}><div className="min-h-screen bg-dns-bg text-dns-deep">
    <header id="dns-analytics-header" className="sticky top-0 z-30 bg-dns-deep text-white">
      <div className="analytics-header-inner">
        <div className="analytics-brand">
          <img src={DNS_SHARED_WEB_LOGO_URL} alt="Dolomiti NordicSki" className="analytics-logo"/>
          <div>
            <div className="analytics-title"><strong>DNS</strong> <span>ANALYTICS</span></div>
            <div className="analytics-subtitle">Statistics & Reporting</div>
          </div>
        </div>
        <div className="analytics-header-actions">
          <div className={`analytics-core-status is-${core.state}`} aria-live="polite">{core.text}</div>
          <AccessibilityMount language={language}/>
          <div className="analytics-lang" role="group" aria-label={language === 'de' ? 'Sprache' : 'Lingua'}>
            {(['de','it'] as const).map(l=><button
              key={l}
              type="button"
              data-dns-press
              className={language===l?'is-active':''}
              aria-pressed={language===l}
              onClick={()=>setLanguage(l)}
            >{l.toUpperCase()}</button>)}
          </div>
        </div>
      </div>
    </header>

    <nav id="dns-analytics-nav" className="dns-tab-nav" aria-label="DNS Analytics">
      <div id="dns-scroll-progress" className="dns-scroll-progress-track" role="progressbar" aria-label="Page scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
        <span id="dns-scroll-progress-bar" className="dns-scroll-progress-bar"/>
      </div>
      <div className="dns-tab-nav-inner analytics-nav-inner" role="tablist" aria-label="DNS Analytics modules">
        {TABS.map((t,index)=><button
          key={t.id}
          ref={(node)=>{ tabRefs.current[t.id]=node; }}
          id={`analytics-tab-${t.id}`}
          type="button"
          role="tab"
          aria-selected={active===t.id}
          aria-controls="analytics-active-panel"
          tabIndex={active===t.id ? 0 : -1}
          className={`dns-tab ${active===t.id?'dns-tab-active':''}`}
          onClick={()=>{
            setActive(t.id);
            history.replaceState(null,'',`#${t.id}`);
            window.scrollTo({top:0,behavior:'smooth'});
          }}
          onKeyDown={(event)=>{
            if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
            event.preventDefault();
            let nextIndex=index;
            if (event.key==='ArrowRight') nextIndex=(index+1)%TABS.length;
            if (event.key==='ArrowLeft') nextIndex=(index-1+TABS.length)%TABS.length;
            if (event.key==='Home') nextIndex=0;
            if (event.key==='End') nextIndex=TABS.length-1;
            const next=TABS[nextIndex];
            setActive(next.id);
            history.replaceState(null,'',`#${next.id}`);
            tabRefs.current[next.id]?.focus();
            window.scrollTo({top:0,behavior:'smooth'});
          }}
        >{t.label}</button>)}
        <button
          type="button"
          className="analytics-print-button"
          onClick={() => {
            setPrintActive(true);
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => printDNSDocument());
            });
          }}
        >
          {language === 'de' ? 'Drucken · PDF' : 'Stampa · PDF'}
        </button>
      </div>
    </nav>
    <NavigationRuntimeMount/>

    <main className="analytics-page">
      <div className="analytics-context">
        <div><strong>WS 2025-26</strong><span> · {tab.label}</span></div>
        <div className="analytics-context-meta">
          {language === 'de'
            ? `A.2.3 · Datenlayer: ${boundaryMode} · lokale Analysedaten erhalten`
            : `A.2.3 · data layer: ${boundaryMode} · dati analitici locali preservati`}
        </div>
      </div>

      <LiveSourcePanel language={language} seasonId="2025-26" onSnapshot={setLiveSnapshot}/>

      {core.state !== 'ready' && <div className={`analytics-runtime-state is-${core.state}`} role={core.state === 'error' ? 'alert' : 'status'} aria-live="polite">
        <div>
          <strong>{core.state === 'loading'
            ? (language === 'de' ? 'DNS_Core wird geladen' : 'Caricamento DNS_Core')
            : (language === 'de' ? 'DNS_Core derzeit nicht erreichbar' : 'DNS_Core al momento non raggiungibile')}</strong>
          <span>{core.state === 'loading'
            ? (language === 'de' ? ' Stammdaten werden synchronisiert.' : ' Sincronizzazione delle anagrafiche in corso.')
            : (language === 'de' ? ' Analytics arbeitet mit den erhaltenen lokalen Datensätzen weiter.' : ' Analytics continua con i dataset locali preservati.')}</span>
        </div>
        {core.state === 'error' && <button type="button" onClick={()=>void refreshCore()}>
          {language === 'de' ? 'Erneut verbinden' : 'Riprova connessione'}
        </button>}
      </div>}

      <section
        id="analytics-active-panel"
        role="tabpanel"
        aria-labelledby={`analytics-tab-${active}`}
        tabIndex={0}
      >
        <ActiveComponent/>
      </section>
    </main>

    <footer className="analytics-footer">
      <span>Dolomiti NordicSki</span>
      <span>DNS Analytics · Foundation v{DNS_ANALYTICS_FOUNDATION_VERSION} · Data Contracts v{DNS_DATA_CONTRACTS_VERSION} · {analyticsContract?.status ?? 'analytics'} · © {new Date().getFullYear()}</span>
    </footer>

    <AnalyticsPrintSheet active={printActive} title={tab.label}><ActiveComponent/></AnalyticsPrintSheet>
  </div></AnalyticsLiveProvider>;
}
