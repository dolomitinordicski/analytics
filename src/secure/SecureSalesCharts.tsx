import type { LiveSalesAggregate } from '../services/liveAnalytics';

type SeriesRow={key:string;label:string;quantity:number;revenue:number};
const PRODUCTS:ReadonlyArray<{key:string;label:string}>=[
  {key:'day',label:'Giornaliero'},
  {key:'wk-area',label:'Settimanale area'},
  {key:'wk-dns',label:'Settimanale DNS'},
  {key:'sk-area',label:'Stagionale area'},
  {key:'sk-dns',label:'Stagionale DNS'},
];
const AREA_NAMES:Record<string,string>={
  'osttirol':'Osttirol',
  'drei-zinnen':'3 Zinnen',
  'cortina-d-ampezzo':'Cortina',
  'val-comelico':'Comelico',
  'gsiesertal-welsberg-taisten':'Val Casies',
  'antholzertal':'Valle Anterselva',
  'ahrntal':'Valle Aurina',
  'seiser-alm-dolomites-val-gardena':'Alpe di Siusi / Val Gardena',
};
const integer=(n:number)=>n.toLocaleString('it-IT');
const euro=(n:number)=>n.toLocaleString('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const valid=(n:number)=>Number.isFinite(n)&&n>=0;

export function validateSalesAggregate(s:LiveSalesAggregate):boolean {
  if(!valid(s.totalTickets)||!valid(s.totalRevenue)||!valid(s.averageTicketPrice)) return false;
  for(const row of [...Object.values(s.byProduct),...Object.values(s.byReportingArea),...Object.values(s.byChannel)]) {
    if(!valid(row.quantity)||!valid(row.revenue)) return false;
  }
  return true;
}

function RevenueBars({title,rows}:{title:string;rows:SeriesRow[]}) {
  const max=Math.max(0,...rows.map(row=>row.revenue));
  return <section className="rounded-xl border p-5" aria-label={title}>
    <h2 className="mb-4 text-xl font-semibold">{title}</h2>
    {rows.length===0 && <p>Non ci sono dati disponibili.</p>}
    <div className="grid gap-4">
      {rows.map(row=><div key={row.key}>
        <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
          <strong>{row.label}</strong><span>{euro(row.revenue)} · {integer(row.quantity)} biglietti</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200" role="img"
          aria-label={row.label+': '+euro(row.revenue)}>
          <div className="h-full rounded-full" style={{width:(max?Math.max(0,row.revenue/max*100):0)+'%',background:'var(--dns-primary, #237b85)'}}/>
        </div>
      </div>)}
    </div>
  </section>;
}

// Only render aggregates calculated from Firestore-authorized records.
// Do not import analyticsData.ts, compatibility snapshots or hard-coded totals.
export function SecureSalesCharts({aggregate}:{aggregate:LiveSalesAggregate}) {
  if(!validateSalesAggregate(aggregate)) return <p role="alert">Aggregati Firebase non validi. Grafici non disponibili.</p>;
  const products=PRODUCTS.map(p=>({
    ...p,quantity:aggregate.byProduct[p.key]?.quantity??0,revenue:aggregate.byProduct[p.key]?.revenue??0,
  }));
  const regions=Object.entries(aggregate.byReportingArea).map(([key,value])=>({
    key,label:AREA_NAMES[key]??key,quantity:value.quantity,revenue:value.revenue,
  })).sort((a,b)=>b.revenue-a.revenue);
  return <div className="grid gap-6 lg:grid-cols-2">
    <RevenueBars title="Fatturato per tipologia di biglietto" rows={products}/>
    <RevenueBars title="Fatturato per area" rows={regions}/>
    {aggregate.unmappedProducts.length>0 && <p className="lg:col-span-2 text-sm" role="status">
      Attenzione: {aggregate.unmappedProducts.length} tipologie non mappate nei dati Firebase.
    </p>}
  </div>;
}
