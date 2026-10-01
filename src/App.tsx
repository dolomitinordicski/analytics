import { useEffect, useMemo, useState } from 'react';
import { DNS_DATA_CONTRACTS, DNS_DATA_CONTRACTS_VERSION } from '@dolomitinordicski/dns-shared-data/data-contracts';
import { AccessibilityMount } from './components/AccessibilityMount';
import { AnalyticsPrintSheet } from './components/AnalyticsPrintSheet';
import { NavigationRuntimeMount } from './components/NavigationRuntimeMount';
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

export default function App() {
  const [active,setActive] = useState<TabId>('overview');
  const [language,setLanguage] = useState<Language>('de');
  const [core,setCore] = useState<DNSCoreStatus>({state:'loading',text:'DNS_Core · connecting…'});
  const [printActive,setPrintActive] = useState(false);

  useEffect(() => applyDNSFoundation(),[]);
  useEffect(() => { void loadDNSCoreMaster().then(setCore); },[]);
  useEffect(() => {
    const handleAfterPrint = () => setPrintActive(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  },[]);

  const tab = useMemo(() => TABS.find(t=>t.id===active) ?? TABS[0],[active]);
  const ActiveComponent = tab.component;
  const analyticsContract = DNS_DATA_CONTRACTS.find(c=>c.id==='analytics');

  return <div className="min-h-screen bg-dns-bg text-dns-deep">
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
          <div className={`analytics-core-status is-${core.state}`}>{core.text}</div>
          <AccessibilityMount language={language}/>
          <div className="analytics-lang">
            {(['de','it'] as const).map(l=><button key={l} type="button" data-dns-press className={language===l?'is-active':''} onClick={()=>setLanguage(l)}>{l.toUpperCase()}</button>)}
          </div>
        </div>
      </div>
    </header>

    <nav id="dns-analytics-nav" className="dns-tab-nav" aria-label="DNS Analytics">
      <div id="dns-scroll-progress" className="dns-scroll-progress-track" role="progressbar" aria-label="Page scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
        <span id="dns-scroll-progress-bar" className="dns-scroll-progress-bar"/>
      </div>
      <div className="dns-tab-nav-inner analytics-nav-inner">
        {TABS.map(t=><button key={t.id} type="button" className={`dns-tab ${active===t.id?'dns-tab-active':''}`} onClick={()=>{setActive(t.id);window.scrollTo({top:0,behavior:'smooth'})}}>{t.label}</button>)}
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
          Drucken · Stampa PDF
        </button>
      </div>
    </nav>
    <NavigationRuntimeMount/>

    <main className="analytics-page">
      <div className="analytics-context">
        <div><strong>WS 2025-26</strong><span> · {tab.label}</span></div>
        <div className="analytics-context-meta">
          Data source A.2.1: preserved local datasets · DNS_Core master data connected
        </div>
      </div>
      <ActiveComponent/>
    </main>

    <footer className="analytics-footer">
      <span>Dolomiti NordicSki</span>
      <span>DNS Analytics · Foundation v{DNS_ANALYTICS_FOUNDATION_VERSION} · Data Contracts v{DNS_DATA_CONTRACTS_VERSION} · {analyticsContract?.status ?? 'analytics'} · © {new Date().getFullYear()}</span>
    </footer>

    <AnalyticsPrintSheet active={printActive} title={tab.label}><ActiveComponent/></AnalyticsPrintSheet>
  </div>;
}
