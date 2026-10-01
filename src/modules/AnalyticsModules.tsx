import { useMemo, useState, type ReactNode } from 'react';
import { ChartCanvas } from '../components/ChartCanvas';
import { Card, Insight, Metric, SectionHeading } from '../components/Ui';
import { RegionLabel } from '../components/RegionLabel';
import {
  COLORS,
  REGIONS,
  SEASONS,
  TICKET_TYPES,
  advancedDefaults,
  annual,
  intensityAreas,
  kpPartners,
  kpRegions,
  overnightAreas,
  overviewInsights,
  regional,
  seasonOverview,
} from '../data/analyticsData';

const euro = (v:number) => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);
const integer = (v:number) => new Intl.NumberFormat('de-DE').format(Math.round(v));
const pct = (v:number,d=1) => `${v.toFixed(d).replace('.',',')}%`;
const axis = { ticks:{ color:COLORS.mid, font:{ size:10, family:'Be Vietnam Pro' } }, grid:{ color:'rgba(65,116,131,.1)' } };
const baseOptions = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} };
const palette = [COLORS.day,COLORS.wkArea,COLORS.wkDns,COLORS.skArea,COLORS.skDns];

function stackedPercent(values:number[][]){
  return values[0].map((_,i)=>{
    const total=values.reduce((s,a)=>s+a[i],0);
    return values.map(a=>total ? a[i]/total*100 : 0);
  });
}

export function OverviewModule(){
  const regionColors=REGIONS.map((_,i)=>i===2?COLORS.deep:COLORS.light);
  return <Module>
    <div className="analytics-metrics">
      <Metric label="Gesamttickets" sublabel="Biglietti totali" value={integer(seasonOverview.totalTickets)} note="↓ 10,9% vs. WS 2024-25"/>
      <Metric label="Gesamteinnahmen" sublabel="Entrate totali" value="€ 1,89 Mio" note="↓ 7,8% vs. WS 2024-25"/>
      <Metric label="Ø Ticketpreis" sublabel="Prezzo medio" value="€ 24,40" note="↑ +2,8% vs. WS 2024-25"/>
      <Metric label="Top Leistung" sublabel="Top performance" value={seasonOverview.topRegion} note={`${euro(seasonOverview.topRegionRevenue)} · ${integer(seasonOverview.topRegionTickets)} Tkts`} top/>
    </div>

    <SectionHeading de="Verkäufe nach Region" it="Vendite per regione"/>
    <div className="analytics-grid-2">
      <Card title="Anzahl Tickets / Quantità" subtitle="nach Region · per regione">
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...seasonOverview.regionQty],backgroundColor:regionColors,borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>
      <Card title="Einnahmen / Entrate (€)" subtitle="nach Region · per regione">
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...seasonOverview.regionRevenue],backgroundColor:regionColors,borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true,ticks:{...axis.ticks,callback:(v:any)=>'€'+(Number(v)/1000).toFixed(0)+'k'}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Jahresvergleich · Diagramme" it="Confronto annuale · grafici comparativi"/>
    <div className="analytics-grid-3">
      <Card title="Jahresvergleich Tickets" subtitle="Confronto annuale biglietti">
        <ChartCanvas height={195} config={{type:'bar',data:{labels:[...TICKET_TYPES],datasets:[
          {label:'2025-26',data:[65017,4032,3458,2600,2355],backgroundColor:COLORS.year1},
          {label:'2024-25',data:[74038,4448,4003,3597,1927],backgroundColor:COLORS.year2},
          {label:'2023-24',data:[71264,4716,3693,1974,2139],backgroundColor:COLORS.year3},
          {label:'2022-23',data:[66242,4371,1759,2422,1801],backgroundColor:COLORS.year4},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,color:COLORS.mid,font:{size:9}}}},scales:{x:axis,y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>
      <Card title="Tickettyp — Menge" subtitle="Tipo biglietto — quantità">
        <ChartCanvas height={195} config={{type:'doughnut',data:{labels:[...TICKET_TYPES],datasets:[{data:[...seasonOverview.ticketQty],backgroundColor:palette,borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'62%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
      <Card title="Vertriebskanal" subtitle="Canale di vendita">
        <ChartCanvas height={195} config={{type:'doughnut',data:{labels:[...seasonOverview.channels.labels],datasets:[{data:[...seasonOverview.channels.values],backgroundColor:[COLORS.deep,COLORS.mid,COLORS.light],borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'62%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Einnahmen nach Tickettyp" it="Entrate per tipo"/>
    <div className="analytics-grid-2">
      <Card title="Einnahmen nach Tickettyp" subtitle="Entrate per tipo biglietto">
        <ChartCanvas height={195} config={{type:'bar',data:{labels:[...TICKET_TYPES],datasets:[{data:[...seasonOverview.ticketRevenue],backgroundColor:palette,borderWidth:0,borderRadius:4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,beginAtZero:true,ticks:{...axis.ticks,callback:(v:any)=>'€'+(Number(v)/1000).toFixed(0)+'k'}}}}} as any}/>
      </Card>
      <Card title="Einnahmen (%) vs. Menge (%)" subtitle="Entrate (%) vs. quantità (%)">
        <ChartCanvas height={195} config={{type:'doughnut',data:{labels:[...TICKET_TYPES],datasets:[
          {label:'Entrate',data:[...seasonOverview.ticketRevenue],backgroundColor:palette,borderWidth:2,borderColor:COLORS.background},
          {label:'Menge',data:[...seasonOverview.ticketQty],backgroundColor:palette.map(c=>c+'99'),borderWidth:2,borderColor:COLORS.background},
        ]},options:{...baseOptions,cutout:'40%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Strategische Erkenntnisse" it="Insights strategici"/>
    <div className="analytics-insights">
      {overviewInsights.map(x=><Insight key={x[0]} n={x[0]} de={x[1]} it={x[2]} bodyDe={x[3]} bodyIt={x[4]} tag={x[5]}/>)}
    </div>
  </Module>;
}

export function AnnualModule(){
  const idx=(arr:readonly number[])=>arr.map(v=>v/arr[0]*100);
  const dnsTotal=annual.qty.wkd.map((v,i)=>v+annual.qty.skd[i]);
  const areaTotal=annual.qty.wka.map((v,i)=>v+annual.qty.ska[i]);
  return <Module>
    <div className="analytics-metrics">
      <Metric label="DNS SK — Rekord" sublabel="DNS SK — record" value="2.355" note="↑ +31% vs. 2022-23" top/>
      <Metric label="DNS WK Wachstum" sublabel="DNS WK crescita" value="+97%" note="vs. 2022-23 (1.759→3.458)"/>
      <Metric label="Umsatz 4 Jahre" sublabel="Entrate 4 anni" value="+20,2%" note="2022-23 → 2025-26"/>
      <Metric label="Rekord-Saison" sublabel="Stagione record" value="2024-25" note="€ 2,05 Mio · 88.013 Tkts"/>
    </div>

    <SectionHeading de="Trendentwicklung — Index 100 · DNS vs. Area" it="Sviluppo trend — Indice 100 · DNS vs. Area"/>
    <div className="analytics-grid-2">
      <Card title="Trendentwicklung pro Tickettyp — Index 100" subtitle="Sviluppo per tipo biglietto — indice base 100" accent>
        <ChartCanvas config={{type:'line',data:{labels:[...SEASONS],datasets:[
          {label:'DAY',data:idx(annual.qty.day),borderColor:COLORS.day,backgroundColor:'transparent',tension:.4},
          {label:'WK Area',data:idx(annual.qty.wka),borderColor:COLORS.wkArea,backgroundColor:'transparent',tension:.4},
          {label:'WK DNS',data:idx(annual.qty.wkd),borderColor:COLORS.wkDns,backgroundColor:'transparent',tension:.4},
          {label:'SK Area',data:idx(annual.qty.ska),borderColor:COLORS.skArea,backgroundColor:'transparent',tension:.4,borderDash:[4,3]},
          {label:'SK DNS',data:idx(annual.qty.skd),borderColor:COLORS.skDns,backgroundColor:'transparent',tension:.4},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:axis,y:axis}}} as any}/>
      </Card>
      <Card title="DNS-Produkte vs. Area-Produkte — Index 100" subtitle="Prodotti DNS vs. Area — indice base 100" accent>
        <ChartCanvas config={{type:'line',data:{labels:[...SEASONS],datasets:[
          {label:'DNS',data:dnsTotal.map(v=>v/dnsTotal[0]*100),borderColor:COLORS.deep,backgroundColor:'rgba(13,77,94,.08)',fill:true,tension:.4},
          {label:'Area',data:areaTotal.map(v=>v/areaTotal[0]*100),borderColor:COLORS.wkArea,backgroundColor:'rgba(139,58,47,.06)',fill:true,tension:.4},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:axis,y:axis}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="DNS-Produkte im Fokus · Gesamttickets" it="Focus prodotti DNS · Totale biglietti"/>
    <div className="analytics-grid-3">
      {[
        ['DNS SK — Serienentwicklung',annual.qty.skd],
        ['DNS WK — Serienentwicklung',annual.qty.wkd],
        ['Gesamttickets — 4 Saisons',annual.totalTickets],
      ].map(([title,data],i)=><Card key={String(title)} title={String(title)}>
        <ChartCanvas height={175} config={{type:i===2?'line':'bar',data:{labels:[...SEASONS],datasets:[{data:[...(data as readonly number[])],backgroundColor:i===2?'rgba(13,77,94,.08)':[COLORS.year4,COLORS.year3,COLORS.year2,COLORS.year1],borderColor:COLORS.deep,fill:i===2,tension:.4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>)}
    </div>

    <SectionHeading de="Einnahmentrend · Zusammensetzung nach Jahr" it="Trend entrate · composizione per anno"/>
    <div className="analytics-grid-2">
      <Card title="Gesamteinnahmen — 4-Jahrestrend">
        <ChartCanvas height={190} config={{type:'line',data:{labels:[...SEASONS],datasets:[{data:[...annual.totalRevenue],borderColor:COLORS.deep,backgroundColor:'rgba(13,77,94,.08)',fill:true,tension:.4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,ticks:{...axis.ticks,callback:(v:any)=>'€'+(Number(v)/1e6).toFixed(2)+'M'}}}}} as any}/>
      </Card>
      <Card title="Einnahmen-Zusammensetzung pro Jahr">
        <ChartCanvas height={190} config={{type:'bar',data:{labels:[...SEASONS],datasets:[
          {label:'DAY',data:[...annual.revenueByType.day],backgroundColor:COLORS.day},
          {label:'WK Area',data:[...annual.revenueByType.wka],backgroundColor:COLORS.wkArea},
          {label:'WK DNS',data:[...annual.revenueByType.wkd],backgroundColor:COLORS.wkDns},
          {label:'SK Area',data:[...annual.revenueByType.ska],backgroundColor:COLORS.skArea},
          {label:'SK DNS',data:[...annual.revenueByType.skd],backgroundColor:COLORS.skDns},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Delta 2022-23 → 2025-26 & Ø Preise" it="Delta 2022-23 → 2025-26 & prezzi medi"/>
    <div className="analytics-grid-2">
      <Card title="Δ Menge & Einnahmen">
        <table className="analytics-table"><thead><tr><th>Tickettyp</th><th>Δ Menge</th><th>Δ Einnahmen</th></tr></thead><tbody>
          {TICKET_TYPES.map((t,i)=>{
            const q=[annual.qty.day,annual.qty.wka,annual.qty.wkd,annual.qty.ska,annual.qty.skd][i];
            const r=[annual.revenueByType.day,annual.revenueByType.wka,annual.revenueByType.wkd,annual.revenueByType.ska,annual.revenueByType.skd][i];
            return <tr key={t}><td>{t}</td><td>{integer(q[3]-q[0])}</td><td>{euro(r[3]-r[0])}</td></tr>;
          })}
        </tbody></table>
      </Card>
      <Card title="Ø Ticketpreis WS 2025-26">
        <ChartCanvas height={180} config={{type:'line',data:{labels:[...SEASONS],datasets:[{data:[...annual.avgPrice],borderColor:COLORS.deep,backgroundColor:'rgba(13,77,94,.08)',fill:true,tension:.4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,ticks:{...axis.ticks,callback:(v:any)=>'€'+Number(v).toFixed(0)}}}}} as any}/>
      </Card>
    </div>
  </Module>;
}

export function RegionalModule(){
  const qty=[regional.dayQ,regional.wkaQ,regional.wkdQ,regional.skaQ,regional.skdQ] as unknown as number[][];
  const rev=[regional.dayR,regional.wkaR,regional.wkdR,regional.skaR,regional.skdR] as unknown as number[][];
  const pctQ=stackedPercent(qty);
  const pctR=stackedPercent(rev);
  const datasetsFrom=(p:number[][])=>TICKET_TYPES.map((label,j)=>({label,data:p.map(x=>x[j]),backgroundColor:palette[j],borderWidth:0}));
  return <Module>
    <div className="analytics-metrics">
      <Metric label="DAY-geprägte Region" sublabel="Regione a forte vocazione DAY" value="Ahrntal+Sand" note="92,1% delle vendite in DAY" top/>
      <Metric label="SK Area Schwerpunkt" sublabel="Focus SK Area" value="Osttirol" note="1.474 SK Area"/>
      <Metric label="DNS WK Kerngebiet" sublabel="Area chiave DNS WK" value="3 Zinnen" note="2.162 DNS WK"/>
      <Metric label="Ausgewogenes Profil" sublabel="Profilo equilibrato" value="Gsiesertal" note="Mix prodotti DNS/Area"/>
    </div>

    <SectionHeading de="Ticketmix pro Region — 100%" it="Composizione biglietti per regione — 100%"/>
    <div className="analytics-grid-2">
      <Card title="Menge (%) nach Tickettyp" subtitle="Quantità (%) per tipo biglietto" accent>
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:datasetsFrom(pctQ)},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true,max:100,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}}}}} as any}/>
      </Card>
      <Card title="Einnahmen (%) nach Tickettyp" subtitle="Entrate (%) per tipo biglietto" accent>
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:datasetsFrom(pctR)},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true,max:100,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Detailansicht pro Tickettyp" it="Dettaglio per tipo di biglietto"/>
    <div className="analytics-grid-3">
      {TICKET_TYPES.map((t,i)=><Card key={t} title={t}>
        <ChartCanvas height={170} config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...qty[i]],backgroundColor:qty[i].map(v=>v===Math.max(...qty[i])?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>)}
      <Card title="Gesamteinnahmen nach Region" subtitle="Entrate totali per regione">
        <ChartCanvas height={170} config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...regional.totalR],backgroundColor:regional.totalR.map(v=>v===Math.max(...regional.totalR)?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Heatmap — Menge pro Region & Tickettyp" it="Heatmap — quantità per regione e tipo"/>
    <Card title="Regionale Verteilung" subtitle="Distribuzione regionale">
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Region</th>{TICKET_TYPES.map(t=><th key={t}>{t}</th>)}<th>Entrate</th></tr></thead><tbody>
        {REGIONS.map((r,i)=><tr key={r}><td><RegionLabel name={r} compact/></td>{qty.map((a,j)=><td key={j}>{integer(a[i])}</td>)}<td>{euro(regional.totalR[i])}</td></tr>)}
      </tbody></table></div>
    </Card>

    <SectionHeading de="Regionale Erkenntnisse" it="Insights regionali"/>
    <div className="analytics-insights">
      <Insight n="I" de="Seiser Alm/Val Gardena — starkes WK Area Profil" it="Seiser Alm/Val Gardena — forte profilo WK Area" bodyDe="Mit 1.309 WK Area-Tickets weist das Gebiet den höchsten Wert im Network auf." bodyIt="Con 1.309 WK Area è il territorio con il valore più alto del network." tag="↗ DNS-Potenzial · Potenziale DNS"/>
      <Insight n="II" de="3 Zinnen — Umsatz- und Volumenmotor" it="3 Zinnen — motore di fatturato e volumi" bodyDe="28.023 Tickets und € 702.623 Umsatz machen die Region zum stärksten Einzelgebiet." bodyIt="28.023 ticket e € 702.623 di entrate: è l'area singola più forte." tag="Top contribution"/>
      <Insight n="III" de="Gsiesertal — ausgewogenes DNS-Profil" it="Gsiesertal — profilo DNS equilibrato" bodyDe="Der ausgewogenste Produktmix im Network." bodyIt="Il mix prodotti più equilibrato del network." tag="Pilotgebiet · Territorio pilota"/>
    </div>
  </Module>;
}

export function ReliabilityModule(){
  const sorted=[...kpRegions].sort((a,b)=>b.kp-a.kp);
  const totalPot=kpRegions.reduce((s,d)=>s+d.pot,0);
  const totalOpen=kpRegions.reduce((s,d)=>s+d.tot3,0);
  const totalKs=kpRegions.reduce((s,d)=>s+d.ks3,0);
  return <Module>
    <div className="analytics-metrics">
      <Metric label="Netzöffnung am 20.01.2026" sublabel="Rete aperta" value={pct(totalOpen/totalPot*100)} note={`${totalOpen.toFixed(1)} / ${totalPot.toFixed(0)} km`}/>
      <Metric label="KS-Anteil an geöffneten Loipen" sublabel="Quota neve artificiale" value={pct(totalKs/totalOpen*100)} note={`${totalKs.toFixed(1)} km KS`}/>
      <Metric label="Netzöffnung am 23.12.2025" sublabel="Apertura rete" value="30,0%" note="Milestone 1"/>
      <Metric label="Höchste Reliability" sublabel="Regione più affidabile" value="Gsiesertal" note="100% alle 3 milestone" top/>
    </div>

    <SectionHeading de="KP — Kunstschnee-Index pro Region" it="KP per regione — indice neve artificiale"/>
    <div className="analytics-grid-2">
      <Card title="KP pro Region — KS km / Potenzial km (max 100%)">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(d=>d.r),datasets:[{data:sorted.map(d=>d.kp),backgroundColor:sorted.map(d=>d.kp>=70?COLORS.deep:d.kp>=30?COLORS.mid:COLORS.light),borderWidth:0,borderRadius:4}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,max:110,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}},y:axis}}} as any}/>
      </Card>
      <Card title="KS · NS · nicht geöffnet — al 20.01.2026">
        <ChartCanvas config={{type:'bar',data:{labels:kpRegions.map(d=>d.r),datasets:[
          {label:'KS',data:kpRegions.map(d=>d.ks3),backgroundColor:COLORS.deep},
          {label:'Aperti senza KS',data:kpRegions.map(d=>Math.max(0,d.tot3-d.ks3)),backgroundColor:COLORS.light},
          {label:'Potenziale non aperto',data:kpRegions.map(d=>Math.max(0,d.pot-d.tot3)),backgroundColor:'rgba(65,116,131,.15)'},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="% Pistenöffnung — 3 Meilensteine pro Region" it="% piste aperte per regione — nelle 3 milestone"/>
    <div className="analytics-grid-2">
      <Card title="% Pistenöffnung pro Region & Meilenstein">
        <ChartCanvas config={{type:'bar',data:{labels:kpRegions.map(d=>d.r),datasets:[
          {label:'23.12.2025',data:kpRegions.map(d=>d.pct1),backgroundColor:COLORS.year4},
          {label:'06.01.2026',data:kpRegions.map(d=>d.pct2),backgroundColor:COLORS.wkDns},
          {label:'20.01.2026',data:kpRegions.map(d=>d.pct3),backgroundColor:COLORS.deep},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:axis,y:{...axis,max:110,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}}}}} as any}/>
      </Card>
      <Card title="Tabelle — KP pro Region WS 2025-26">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Regione</th><th>Pot.</th><th>23.12</th><th>06.01</th><th>20.01</th><th>KP</th></tr></thead><tbody>
          {kpRegions.map(d=><tr key={d.r}><td><RegionLabel name={d.r} compact/></td><td>{d.pot}</td><td>{pct(d.pct1,0)}</td><td>{pct(d.pct2,0)}</td><td>{pct(d.pct3,0)}</td><td><strong>{pct(d.kp)}</strong></td></tr>)}
        </tbody></table></div>
      </Card>
    </div>

    <SectionHeading de="Detailansicht — 16 Partner einzeln" it="Dettaglio — 16 partner"/>
    <Card title="KP pro Partner — km KS / km potenziali individuali">
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Partner</th><th>Pot.</th><th>KS 23.12</th><th>KS 06.01</th><th>KS 20.01</th><th>Aperto</th><th>KP</th></tr></thead><tbody>
        {kpPartners.map(d=>{const kp=d.excluded?null:Math.min(100,d.ks3/d.pot*100);const open=d.excluded?null:Math.min(100,d.tot3/d.pot*100);return <tr key={d.p} className={d.excluded?'is-muted':''}><td>{d.p}{d.excluded?' · escluso':''}</td><td>{d.pot}</td><td>{d.ks1}</td><td>{d.ks2}</td><td>{d.ks3}</td><td>{open==null?'—':pct(open,0)}</td><td>{kp==null?'—':pct(kp)}</td></tr>})}
      </tbody></table></div>
    </Card>
  </Module>;
}

export function AdvancedModule(){
  const [nights,setNights]=useState(advancedDefaults.nightsPerWeeklyGuest);
  const [share,setShare]=useState(advancedDefaults.overnightShare*100);
  const [spend,setSpend]=useState(advancedDefaults.spendPerNight);
  const [mult,setMult]=useState(advancedDefaults.multiplier);
  const [dayShare,setDayShare]=useState(advancedDefaults.dayOvernightShare);
  const derived=useMemo(()=>{
    const q=share/100;
    const nightsNet=advancedDefaults.weeklyTicketsNetwork*q*nights;
    const nightsAA=advancedDefaults.weeklyTicketsSouthTyrol*q*nights;
    const directNet=nightsNet*spend;
    const directAA=nightsAA*spend;
    const totalNet=directNet*mult;
    const dayNights=advancedDefaults.dayTickets*(dayShare/100);
    const dayDirect=dayNights*spend;
    return {nightsNet,nightsAA,directNet,directAA,totalNet,dayNights,dayDirect,grand:directNet+dayDirect};
  },[nights,share,spend,mult,dayShare]);
  return <Module>
    <div className="analytics-metrics">
      <Metric label="Wochenkarten gesamt" sublabel="Settimanali totali" value={integer(advancedDefaults.weeklyTicketsNetwork)} note="Network"/>
      <Metric label="Geschätzte Übernachtungen" sublabel="Pernottamenti stimati" value={integer(derived.nightsNet)} note={`${share}% · ${nights} Nächte`}/>
      <Metric label="Direkte Wertschöpfung" sublabel="Valore diretto" value={`€ ${(derived.directNet/1e6).toFixed(2)} Mio`} note={`€ ${spend}/Nacht`}/>
      <Metric label="Gesamtwirkung" sublabel="Impatto totale" value={`€ ${(derived.totalNet/1e6).toFixed(2)} Mio`} note={`× ${mult.toFixed(2)} Multiplikator`} top/>
    </div>

    <SectionHeading de="Wochenkarten — Direkte Wertschöpfung" it="Settimanali — valore economico diretto"/>
    <Card title="Interaktiver Simulator · Simulatore interattivo" accent>
      <div className="analytics-sliders">
        <Slider label="Nächte / notti" value={nights} min={3} max={10} step={.5} onChange={setNights}/>
        <Slider label="Übernachtungsquote / quota" value={share} min={40} max={100} step={5} onChange={setShare} suffix="%"/>
        <Slider label="Ausgabe / spesa" value={spend} min={70} max={180} step={1} onChange={setSpend} prefix="€ "/>
        <Slider label="Multiplikator" value={mult} min={1} max={2.5} step={.05} onChange={setMult}/>
        <Slider label="DAY Übernachtungsquote" value={dayShare} min={0} max={100} step={5} onChange={setDayShare} suffix="%"/>
      </div>
    </Card>

    <SectionHeading de="Südtirol vs. Gesamtnetzwerk" it="Alto Adige vs. intero network"/>
    <div className="analytics-grid-2">
      <Card title="Wertschöpfung — Vergleich">
        <ChartCanvas config={{type:'bar',data:{labels:['Südtirol · Alto Adige','Network · intero'],datasets:[
          {label:'Direkt',data:[derived.directAA,derived.directNet],backgroundColor:COLORS.deep},
          {label:'Multiplikator',data:[derived.directAA*(mult-1),derived.directNet*(mult-1)],backgroundColor:COLORS.light},
        ]},options:{...baseOptions,indexAxis:'y',plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true}}}} as any}/>
      </Card>
      <Card title="Ticketeinnahmen → Territorialer Impact">
        <div className="analytics-big-impact">€ {(derived.totalNet/1e6).toFixed(2)} Mio</div>
        <div className="analytics-note-small">Network impact · multiplier {mult.toFixed(2)}</div>
        <div className="analytics-big-impact secondary">€ {(derived.grand/1e6).toFixed(2)} Mio</div>
        <div className="analytics-note-small">WK + DAY scenario</div>
      </Card>
    </div>

    <SectionHeading de="Aufschlüsselung der Ausgaben (Struktur ASTAT)" it="Ripartizione spesa (struttura ASTAT)"/>
    <div className="analytics-grid-2">
      <Card title="Direkte Wertschöpfung nach Ausgabeposten">
        <ChartCanvas config={{type:'doughnut',data:{labels:advancedDefaults.astat.map(v=>v.it),datasets:[{data:advancedDefaults.astat.map(v=>derived.directNet*v.q),backgroundColor:advancedDefaults.astat.map(v=>v.c),borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'58%',plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
      <Card title="Werte nach Ausgabeposten · Network">
        <table className="analytics-table"><thead><tr><th>Posten</th><th>%</th><th>EUR</th></tr></thead><tbody>{advancedDefaults.astat.map(v=><tr key={v.it}><td>{v.de} · {v.it}</td><td>{pct(v.q*100,1)}</td><td>{euro(derived.directNet*v.q)}</td></tr>)}</tbody></table>
      </Card>
    </div>

    <SectionHeading de="Szenario Tageskarten (explorativ)" it="Scenario giornalieri (esplorativo)"/>
    <div className="analytics-metrics">
      <Metric label="Tageskarten gesamt" sublabel="Giornalieri totali" value={integer(advancedDefaults.dayTickets)}/>
      <Metric label="Davon Übernachtungsgäste" sublabel="Quota ospiti" value={integer(derived.dayNights)} note={`${dayShare}%`}/>
      <Metric label="Zusätzl. Wertschöpfung" sublabel="Valore aggiuntivo" value={`€ ${(derived.dayDirect/1e6).toFixed(2)} Mio`}/>
      <Metric label="Total WK + Tageskarten · Szenario" sublabel="Totale scenario" value={`€ ${(derived.grand/1e6).toFixed(2)} Mio`} top/>
    </div>
  </Module>;
}

export function OvernightModule(){
  const sorted=[...overnightAreas].sort((a,b)=>b.pn[1]-a.pn[1]);
  const total2526=overnightAreas.reduce((s,a)=>s+a.pn[1],0);
  const total2425=overnightAreas.reduce((s,a)=>s+a.pn[0],0);
  const top=sorted[0];
  const monthly=[0,1,2,3].map(i=>overnightAreas.reduce((s,a)=>s+a.m[i],0));
  return <Module>
    <div className="analytics-metrics">
      <Metric label="Übernachtungen gesamt" sublabel="Pernottamenti totali" value={integer(total2526)} note={`${integer(total2526-total2425)} vs. 2024-25`}/>
      <Metric label="Top-Gebiet" sublabel="Area principale" value="Val Gardena" note={integer(top.pn[1])} top/>
      <Metric label="Gebiete" sublabel="Aree" value={overnightAreas.length}/>
      <Metric label="Ø pro Gebiet" sublabel="Media per area" value={integer(total2526/overnightAreas.length)}/>
    </div>

    <SectionHeading de="Übernachtungen pro Gebiet — WS 2025-26" it="Pernottamenti per area — SI 2025-26"/>
    <div className="analytics-grid-2">
      <Card title="Übernachtungen pro Gebiet (sortiert)">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(a=>a.area),datasets:[{data:sorted.map(a=>a.pn[1]),backgroundColor:sorted.map((_,i)=>i===0?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>(Number(v)/1000).toFixed(0)+'k'}},y:axis}}} as any}/>
      </Card>
      <Card title="Anteil pro Gebiet">
        <ChartCanvas config={{type:'doughnut',data:{labels:sorted.map(a=>a.area),datasets:[{data:sorted.map(a=>a.pn[1]),backgroundColor:['#0D4D5E','#1a5f70','#2a6f80','#417483','#5a8f9e','#7aa6b3','#8ab8c4','#AAD0D1','#D4CEC6'],borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'55%',plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Datentabelle · Zeitreihe" it="Tabella dati · serie storica"/>
    <Card title="WS 2025-26 vs. WS 2024-25">
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Gebiet</th><th>2025-26</th><th>Anteil</th><th>2024-25</th><th>Δ</th></tr></thead><tbody>
        {sorted.map(a=><tr key={a.area}><td><RegionLabel name={a.area} compact/></td><td><strong>{integer(a.pn[1])}</strong></td><td>{pct(a.pn[1]/total2526*100)}</td><td>{integer(a.pn[0])}</td><td className={a.pn[1]-a.pn[0]>=0?'is-positive':'is-negative'}>{integer(a.pn[1]-a.pn[0])}</td></tr>)}
      </tbody></table></div>
    </Card>

    <SectionHeading de="Kontext Südtirol — Wintersaison 2025/26 (Provinzebene)" it="Contesto Alto Adige — stagione invernale 2025/26"/>
    <div className="analytics-metrics">
      {['Dezember 2025','Januar 2026','Februar 2026','März 2026'].map((m,i)=><Metric key={m} label={m} value={integer(monthly[i])}/>)}
    </div>
  </Module>;
}

export function IntensityModule(){
  const areas=intensityAreas.map(a=>({
    ...a,
    pnWK:a.wk*.75*6,
    pnDAY:a.day*.45,
    intWK:(a.wk*.75*6)/a.pn*100,
    intDAY:((a.wk*.75*6)+(a.day*.45))/a.pn*100,
  }));
  const sorted=[...areas].sort((a,b)=>b.intWK-a.intWK);
  const totalFondo=areas.reduce((s,a)=>s+a.pnWK,0);
  const totalPn=areas.reduce((s,a)=>s+a.pn,0);
  const netInt=totalFondo/totalPn*100;
  return <Module>
    <div className="analytics-metrics">
      <Metric label="Intensivste Region (WK)" sublabel="Regione più intensa" value={sorted[0].area.split('/')[0].trim()} note={pct(sorted[0].intWK,2)} top/>
      <Metric label="Ø Intensität WK-basiert" sublabel="Intensità media" value={pct(areas.reduce((s,a)=>s+a.intWK,0)/areas.length,2)}/>
      <Metric label="Gebiete mit > 1% Intensität" sublabel="Aree oltre 1%" value={areas.filter(a=>a.intWK>=1).length}/>
      <Metric label="Gesamtintensität Network" sublabel="Intensità network" value={pct(netInt,2)}/>
    </div>

    <SectionHeading de="Intensität pro Gebiet — WK-basiert (robust)" it="Intensità per area — basata su WK (robusta)"/>
    <div className="analytics-grid-2">
      <Card title="% Langlauf-Übernachtungen / Gesamt (WK-Proxy)">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(a=>a.area),datasets:[{data:sorted.map(a=>a.intWK),backgroundColor:sorted.map(a=>a.intWK>=2?COLORS.deep:a.intWK>=1?COLORS.mid:COLORS.light),borderWidth:0,borderRadius:4}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>Number(v).toFixed(1)+'%'}},y:axis}}} as any}/>
      </Card>
      <Card title="WK-Tickets vs. Pernottamenti totali — Verhältnis">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Gebiet</th><th>SWDNS</th><th>PN stimati</th><th>PN totali</th><th>Intensität</th></tr></thead><tbody>
          {sorted.map(a=><tr key={a.area}><td><RegionLabel name={a.area} compact/></td><td>{integer(a.wk)}</td><td>{integer(a.pnWK)}</td><td>{integer(a.pn)}</td><td><strong>{pct(a.intWK,2)}</strong></td></tr>)}
        </tbody></table></div>
      </Card>
    </div>

    <SectionHeading de="Szenario inkl. Tageskarten (explorativ)" it="Scenario incl. giornalieri (esplorativo)"/>
    <div className="analytics-grid-2">
      <Card title="% Intensität inkl. Tageskarten-Schätzung">
        <ChartCanvas config={{type:'bar',data:{labels:[...areas].sort((a,b)=>b.intDAY-a.intDAY).map(a=>a.area),datasets:[{data:[...areas].sort((a,b)=>b.intDAY-a.intDAY).map(a=>a.intDAY),backgroundColor:COLORS.wkArea,borderWidth:0,borderRadius:4}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>Number(v).toFixed(1)+'%'}},y:axis}}} as any}/>
      </Card>
      <Card title="Vergleich WK-Szenario vs. WK+DAY-Szenario">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(a=>a.area),datasets:[
          {label:'WK (robust)',data:sorted.map(a=>a.intWK),backgroundColor:COLORS.deep},
          {label:'WK+DAY (explorativ)',data:sorted.map(a=>a.intDAY),backgroundColor:'rgba(139,58,47,.5)'},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40}},y:{...axis,beginAtZero:true,ticks:{...axis.ticks,callback:(v:any)=>Number(v).toFixed(1)+'%'}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Strategische Erkenntnisse" it="Insights strategici"/>
    <div className="analytics-insights">
      <Insight n="I" de={`${sorted[0].area.split('/')[0].trim()} — höchste Intensität im Network`} it={`${sorted[0].area.split('/')[0].trim()} — massima intensità nel network`} bodyDe={`${pct(sorted[0].intWK,2)} der Übernachtungen sind geschätzte Langlauf-Gäste.`} bodyIt={`${pct(sorted[0].intWK,2)} dei pernottamenti stimati sono fondisti.`} tag="Strukturelle Verankerung · Radicamento strutturale"/>
      <Insight n="II" de="Comelico — überraschend hohe Intensität" it="Comelico — intensità sorprendentemente alta" bodyDe="Kleines Gebiet, aber der Langlauf ist relativ dominant." bodyIt="Area piccola, ma il fondo vi è relativamente dominante." tag="↑ Strukturelle Relevanz"/>
      <Insight n="III" de="Niedrige % ≠ wirtschaftlich irrelevant" it="% bassa ≠ irrilevante economicamente" bodyDe="Auch kleine Prozentwerte können hunderte direkt zurechenbare Übernachtungen bedeuten." bodyIt="Anche percentuali ridotte possono corrispondere a centinaia di pernottamenti attribuibili." tag="Kontext · Contesto"/>
    </div>
  </Module>;
}

function Slider({label,value,min,max,step,onChange,prefix='',suffix=''}:{label:string;value:number;min:number;max:number;step:number;onChange:(v:number)=>void;prefix?:string;suffix?:string}){
  return <label className="analytics-slider"><span>{label}</span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/><strong>{prefix}{value}{suffix}</strong></label>;
}

function Module({children}:{children:ReactNode}){
  return <div className="analytics-module">{children}</div>;
}
