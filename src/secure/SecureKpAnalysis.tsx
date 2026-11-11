import type { LiveAnalyticsSnapshot, LiveKpPoint } from '../services/liveAnalytics';

const km=(value:number)=>value.toLocaleString('it-IT',{maximumFractionDigits:1})+' km';
const pct=(value:number)=>value.toLocaleString('it-IT',{maximumFractionDigits:1})+'%';
const valid=(value:number)=>Number.isFinite(value)&&value>=0;

export type KpAreaView={
  areaId:string;
  potentialKm:number;
  openedKm:number;
  artificialKm:number;
  naturalKm:number;
  coveragePercent:number|null;
  source:LiveKpPoint['source'];
};

export function kpAreaViews(snapshot:LiveAnalyticsSnapshot):KpAreaView[]|null {
  const kp=snapshot.kp;
  if(!kp||!kp.milestones.length||!kp.aggregate.milestoneIds.length) return null;
  if(kp.milestones.length!==kp.aggregate.milestoneIds.length) return null;
  const latest=kp.aggregate.milestoneIds.at(-1);
  if(!latest) return null;
  const result:KpAreaView[]=[];
  for(const [areaId,milestones] of Object.entries(kp.aggregate.byAreaMilestone)) {
    const point=milestones[latest];
    // No interpolation or historic hard-coded fallback for absent milestones.
    if(!point) continue;
    const {potentialOperationalKm,openedKm,artificialSnowKm,naturalSnowKm,source}=point;
    if(![potentialOperationalKm,openedKm,artificialSnowKm,naturalSnowKm].every(valid)) return null;
    if(!['entries','validation'].includes(source)) return null;
    result.push({
      areaId,potentialKm:potentialOperationalKm,openedKm,
      artificialKm:artificialSnowKm,naturalKm:naturalSnowKm,
      coveragePercent:potentialOperationalKm>0 ? openedKm/potentialOperationalKm*100 : null,
      source,
    });
  }
  return result.length ? result.sort((a,b)=>b.openedKm-a.openedKm) : null;
}

const areaNames:Record<string,string>={
  'osttirol':'Osttirol',
  'drei-zinnen':'3 Zinnen',
  'cortina-d-ampezzo':'Cortina',
  'val-comelico':'Comelico',
  'gsiesertal-welsberg-taisten':'Val Casies',
  'antholzertal':'Valle Anterselva',
  'ahrntal':'Valle Aurina',
  'seiser-alm-dolomites-val-gardena':'Alpe di Siusi / Val Gardena',
};

export function SecureKpAnalysis({snapshot}:{snapshot:LiveAnalyticsSnapshot}) {
  const rows=kpAreaViews(snapshot);
  const last=snapshot.kp?.milestones.slice().sort((a,b)=>a.order-b.order).at(-1);
  return <section className="rounded-xl border p-5" aria-label="KP e affidabilità">
    <h2 className="mb-3 text-xl font-semibold">KP e affidabilità delle piste</h2>
    <p className="mb-4 text-sm">Situazione per area all'ultimo rilevamento Firebase{last?.date?' ('+last.date+')':''}. Le percentuali rappresentano km aperti / km potenziali, non un punteggio KP certificato.</p>
    {!rows && <p role="status">Dati KP completi non disponibili: nessuna stima sostitutiva.</p>}
    {rows && <div className="grid gap-3">
      {rows.map(row=><div key={row.areaId} className="rounded-lg border p-3">
        <div className="mb-1 flex flex-wrap justify-between gap-2">
          <strong>{areaNames[row.areaId]??row.areaId}</strong>
          <span>{km(row.openedKm)} aperti / {km(row.potentialKm)} potenziali</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200" role="img"
          aria-label={'Copertura '+(row.coveragePercent===null?'non disponibile':pct(row.coveragePercent))}>
          <div className="h-full rounded-full" style={{
            width:(row.coveragePercent===null?0:Math.max(0,Math.min(100,row.coveragePercent)))+'%',
            background:'var(--dns-primary,#237b85)',
          }}/>
        </div>
        <div className="mt-1 text-sm">Neve artificiale: {km(row.artificialKm)} · Naturale: {km(row.naturalKm)} · Copertura: {row.coveragePercent===null?'n.d.':pct(row.coveragePercent)} · Fonte: {row.source}</div>
      </div>)}
    </div>}
  </section>;
}
