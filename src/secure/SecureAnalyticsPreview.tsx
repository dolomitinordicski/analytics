import { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import {
  loadAnalyticsAccess,
  signInAnalyticsGoogle,
  signOutAnalytics,
  subscribeAnalyticsAuth,
  type AnalyticsAccessContext,
} from '../services/auth';
import { loadLiveAnalyticsSnapshot, type LiveAnalyticsSnapshot } from '../services/liveAnalytics';

// Isolated INTERNAL PREVIEW: no import of App, parity, publicBaseline or
// analyticsData.ts. This is deliberately not a replacement for the full
// internal dashboard until charts, scopes and parity are migrated safely.
type View = { state:'checking'|'signed-out'|'denied'|'loading'|'ready'|'error'; user?:User|null; data?:LiveAnalyticsSnapshot; message?:string };
const integer=(value:number)=>value.toLocaleString('it-IT');
const euro=(value:number)=>value.toLocaleString('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0});

export function SecureAnalyticsPreview() {
  const [view,setView]=useState<View>({state:'checking'});
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    let generation=0;
    const unsubscribe=subscribeAnalyticsAuth(user=>{
      const token=++generation;
      if (!user) {setView({state:'signed-out',user:null}); return;}
      setView({state:'checking',user});
      void loadAnalyticsAccess(user.uid).then(async (access:AnalyticsAccessContext)=>{
        if (token!==generation) return;
        // Full-network dashboard cannot be opened by area/AT scoped accounts.
        // Firestore rules remain authoritative for every data read.
        if (!(access.isAdmin || (access.canReadTicketSales && access.canReadKp))) {
          setView({state:'denied',user});return;
        }
        setView({state:'loading',user});
        const data=await loadLiveAnalyticsSnapshot('2025-26',access);
        if (token===generation) setView({state:'ready',user,data});
      }).catch(()=>{
        if (token===generation) setView({state:'error',user,message:'Lettura Firebase non disponibile o autorizzazione negata.'});
      });
    });
    return ()=>{generation++;unsubscribe();};
  },[]);

  const totals=view.data?.sales?.aggregate;
  return <main className="min-h-screen p-6" style={{background:'var(--dns-bg,#f5f8f8)',color:'var(--dns-deep,#124b56)'}}>
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">DNS Analytics</h1>
          <p>Firebase-only · Anteprima interna sicura · WS 2025/26</p>
        </div>
        {view.user && <button type="button" onClick={()=>void signOutAnalytics()}>Esci</button>}
      </header>
      {view.state==='checking' && <p role="status">Verifica accesso DNS Identity…</p>}
      {view.state==='signed-out' && <section>
        <p>Accesso riservato. Effettua il login con il tuo account DNS autorizzato.</p>
        <button type="button" disabled={busy} onClick={()=>{
          setBusy(true);
          void signInAnalyticsGoogle().catch(()=>setView({state:'error',message:'Google Sign-In non riuscito.'})).finally(()=>setBusy(false));
        }}>Accedi con Google</button>
      </section>}
      {view.state==='denied' && <p role="alert">Non hai i permessi di rete per questa anteprima. I dati per area saranno gestiti con viste separate.</p>}
      {view.state==='loading' && <p role="status">Caricamento dati da Firebase…</p>}
      {view.state==='error' && <p role="alert">{view.message}</p>}
      {view.state==='ready' && <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5"><div>Biglietti totali</div><strong className="text-3xl">{totals ? integer(totals.totalTickets) : '—'}</strong></div>
        <div className="rounded-xl border p-5"><div>Fatturato totale</div><strong className="text-3xl">{totals ? euro(totals.totalRevenue) : '—'}</strong></div>
        <div className="rounded-xl border p-5"><div>Prezzo medio</div><strong className="text-3xl">{totals ? euro(totals.averageTicketPrice) : '—'}</strong></div>
        <p className="sm:col-span-3 text-sm">Fonte: {view.data?.sales?.source ?? 'non disponibile'}. Nessun fallback a dataset statici. Grafici e viste per area da migrare e collaudare prima della sostituzione.</p>
      </section>}
    </div>
  </main>;
}
