import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/dnsCore';

// The public entrypoint imports neither App.tsx nor internal analytical modules.
// Each published summary must pass a separate Admin-controlled publication gate.
type PublicSummary = {
  seasonId: string;
  publicationStatus: 'published';
  totalTickets: number;
  totalRevenue: number;
  publishedAt?: string;
};
type View = { status: 'loading'|'unavailable'|'ready'; summary?: PublicSummary };

function validatedSummary(raw: Record<string, unknown>, seasonId: string): PublicSummary | null {
  if (raw.publicationStatus !== 'published' || raw.seasonId !== seasonId) return null;
  // No fallback to raw historical/operational data or compatibility literals.
  if (raw.schemaVersion !== 1) return null;
  const totalTickets = raw.totalTickets;
  const totalRevenue = raw.totalRevenue;
  if (typeof totalTickets !== 'number' || !Number.isFinite(totalTickets) || totalTickets < 0) return null;
  if (typeof totalRevenue !== 'number' || !Number.isFinite(totalRevenue) || totalRevenue < 0) return null;
  return {seasonId,publicationStatus:'published',totalTickets,totalRevenue,
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : undefined};
}

export function PartnerDashboard() {
  const [view,setView] = useState<View>({status:'loading'});
  const [language,setLanguage] = useState<'de'|'it'>('de');
  useEffect(() => {
    let active = true;
    void getDoc(doc(db,'analyticsPartnerPublic','2025-26'))
      .then(snapshot => {
        if (!active) return;
        const summary = snapshot.exists() ? validatedSummary(snapshot.data(), '2025-26') : null;
        setView(summary ? {status:'ready',summary} : {status:'unavailable'});
      }).catch(() => { if (active) setView({status:'unavailable'}); });
    return () => { active=false; };
  }, []);

  const de=language==='de';
  return <div className="min-h-screen bg-dns-bg text-dns-deep">
    <header className="p-6" style={{background:'var(--dns-header-bg, #0d4d5e)',color:'white'}}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div><strong>DNS Analytics</strong><div>{de?'Öffentliche Partnerübersicht':'Panoramica pubblica per i partner'}</div></div>
        <div><button type="button" aria-pressed={de} onClick={()=>setLanguage('de')}>DE</button> · <button type="button" aria-pressed={!de} onClick={()=>setLanguage('it')}>IT</button></div>
      </div>
    </header>
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-3 text-2xl">{de?'Dolomiti NordicSki in Zahlen':'Dolomiti NordicSki in cifre'}</h1>
      <p className="mb-8">{de?'Nur ausdrücklich veröffentlichte Netzwerkdaten.':'Solo dati della rete espressamente autorizzati alla pubblicazione.'}</p>
      {view.status === 'loading' && <p role="status">{de?'Veröffentlichte Daten werden geladen…':'Caricamento dati pubblicati…'}</p>}
      {view.status === 'unavailable' && <p role="status">{de?'Noch keine freigegebenen Kennzahlen verfügbar.':'Nessun indicatore ancora approvato per la pubblicazione.'}</p>}
      {view.status === 'ready' && view.summary && <section aria-label="Network KPIs" className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5"><div>{de?'Verkaufte Tickets':'Biglietti venduti'}</div><strong className="text-3xl">{view.summary.totalTickets.toLocaleString(de?'de-DE':'it-IT')}</strong></div>
        <div className="rounded-xl border p-5"><div>{de?'Gesamtumsatz':'Fatturato complessivo'}</div><strong className="text-3xl">{view.summary.totalRevenue.toLocaleString(de?'de-DE':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0})}</strong></div>
      </section>}
      <p className="mt-6 text-sm">WS 2025–26 · Dolomiti NordicSki</p>
    </main>
  </div>;
}
