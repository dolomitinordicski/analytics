import { useMemo, useState, type ReactNode } from 'react';
import { ChartCanvas } from '../components/ChartCanvas';
import { Alert, BilingualText, Card, EditorialSummary, Insight, MethodologyPanel, Metric, ReferencePanel, SectionHeading, SourceBadge } from '../components/Ui';
import { RegionLabel } from '../components/RegionLabel';
import { useAnalyticsLive } from '../components/AnalyticsLiveContext';
import { selectOverviewDataset } from '../services/overviewSelector';
import { selectRegionalDataset } from '../services/regionalSelector';
import { selectReliabilityDataset } from '../services/reliabilitySelector';
import { selectKpPartnerDataset } from '../services/kpPartnerSelector';
import { selectAnnualDataset } from '../services/annualSelector';
import { selectAdvancedObservedInputs } from '../services/advancedSelector';
import { selectOvernightDataset } from '../services/overnightSelector';
import { selectIntensityDataset } from '../services/intensitySelector';
import { deriveAnnualKpis, deriveOverviewKpis, deriveRegionalKpis } from '../services/derivedKpis';
import {
  COLORS,
  REGIONS,
  SEASONS,
  TICKET_TYPES,
  advancedDefaults,
  overnightAreas,
  overviewInsights,
} from '../data/analyticsData';
import {
  advancedMethodology,
  editorialSummaries,
  intensityMethodology,
  overnightMethodology,
  reliabilityMethodology,
} from '../data/editorial';
import {
  advancedReferenceSources,
  crossCuttingReferenceLimits,
  overnightReferenceSources,
  reliabilityReferenceSources,
  salesReferenceSources,
} from '../data/referenceSources';
import {
  legacyAdvancedCopy,
  legacyOverviewNotes,
  legacyOvernightCopy,
  legacyRegionalInsights,
  legacyReliabilityCopy,
} from '../data/legacyDashboard';

const euro = (v:number) => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);
const integer = (v:number) => new Intl.NumberFormat('de-DE').format(Math.round(v));
const pct = (v:number,d=1) => `${v.toFixed(d).replace('.',',')}%`;
const axis = { ticks:{ color:COLORS.mid, font:{ size:10, family:'Be Vietnam Pro' } }, grid:{ color:'rgba(65,116,131,.1)' } };
const baseOptions = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} };
const palette = [COLORS.day,COLORS.wkArea,COLORS.wkDns,COLORS.skArea,COLORS.skDns];
type AnalyticsModuleProps = { language:'de'|'it' };

function stackedPercent(values:number[][]){
  return values[0].map((_,i)=>{
    const total=values.reduce((s,a)=>s+a[i],0);
    return values.map(a=>total ? a[i]/total*100 : 0);
  });
}

export function OverviewModule({language}:AnalyticsModuleProps){
  const {snapshot,overviewLiveReady,annualLiveReady,publicBaseline}=useAnalyticsLive();
  const data=useMemo(()=>selectOverviewDataset(snapshot,overviewLiveReady,publicBaseline),[snapshot,overviewLiveReady,publicBaseline]);
  const annualData=useMemo(()=>selectAnnualDataset(snapshot,annualLiveReady,publicBaseline),[snapshot,annualLiveReady,publicBaseline]);
  const kpis=useMemo(()=>deriveOverviewKpis(data,annualData),[data,annualData]);
  const regionColors=REGIONS.map((_,i)=>i===2?COLORS.deep:COLORS.light);
  return <Module>
    <SourceBadge state={data.source}
      de={data.source==='live' ? 'DNS_Core LIVE · Parität geprüft' : data.source==='public' ? 'DNS_Core öffentliche Baseline · Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · A.2.1'}
      it={data.source==='live' ? 'DNS_Core LIVE · parità verificata' : data.source==='public' ? 'Baseline pubblica DNS_Core · zero-loss verificato' : 'Dataset di compatibilità · A.2.1'}
    />

    <div className="analytics-metrics">
      <Metric label="Gesamttickets" sublabel="Biglietti totali" value={integer(data.totalTickets)} note={`${kpis.ticketsDeltaPct>=0?'↑ +':'↓ '}${Math.abs(kpis.ticketsDeltaPct).toFixed(1).replace('.',',')}% vs. WS 2024-25`}/>
      <Metric label="Gesamteinnahmen" sublabel="Entrate totali" value={`€ ${(data.totalRevenue/1e6).toFixed(2).replace('.',',')} Mio`} note={`${kpis.revenueDeltaPct>=0?'↑ +':'↓ '}${Math.abs(kpis.revenueDeltaPct).toFixed(1).replace('.',',')}% vs. WS 2024-25`}/>
      <Metric label="Ø Ticketpreis" sublabel="Prezzo medio" value={`€ ${data.avgPrice.toFixed(2).replace('.',',')}`} note={`${kpis.avgPriceDeltaPct>=0?'↑ +':'↓ '}${Math.abs(kpis.avgPriceDeltaPct).toFixed(1).replace('.',',')}% vs. WS 2024-25`}/>
      <Metric label="Top Leistung" sublabel="Miglior risultato" value={data.topRegion} noteDe={`${euro(data.topRegionRevenue)} · ${integer(data.topRegionTickets)} Tickets`} noteIt={`${euro(data.topRegionRevenue)} · ${integer(data.topRegionTickets)} ticket`} top/>
    </div>

    <SectionHeading de="Verkäufe nach Region" it="Vendite per regione"/>
    <div className="analytics-grid-2">
      <Card titleDe="Anzahl Tickets" titleIt="Quantità biglietti" subtitleDe="nach Region" subtitleIt="per regione">
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...data.regionQty],backgroundColor:regionColors,borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>
      <Card titleDe="Einnahmen (€)" titleIt="Entrate (€)" subtitleDe="nach Region" subtitleIt="per regione">
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...data.regionRevenue],backgroundColor:regionColors,borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true,ticks:{...axis.ticks,callback:(v:any)=>'€'+(Number(v)/1000).toFixed(0)+'k'}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Jahresvergleich · Diagramme" it="Confronto annuale · grafici comparativi"/>
    <div className="analytics-grid-3">
      <Card titleDe="Jahresvergleich Tickets" titleIt="Confronto annuale biglietti">
        <ChartCanvas height={195} config={{type:'bar',data:{labels:[...TICKET_TYPES],datasets:[
          {label:'2025-26',data:[...data.ticketQty],backgroundColor:COLORS.year1},
          {label:'2024-25',data:[annualData.qty.day[2],annualData.qty.wka[2],annualData.qty.wkd[2],annualData.qty.ska[2],annualData.qty.skd[2]],backgroundColor:COLORS.year2},
          {label:'2023-24',data:[annualData.qty.day[1],annualData.qty.wka[1],annualData.qty.wkd[1],annualData.qty.ska[1],annualData.qty.skd[1]],backgroundColor:COLORS.year3},
          {label:'2022-23',data:[annualData.qty.day[0],annualData.qty.wka[0],annualData.qty.wkd[0],annualData.qty.ska[0],annualData.qty.skd[0]],backgroundColor:COLORS.year4},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,color:COLORS.mid,font:{size:9}}}},scales:{x:axis,y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>
      <Card titleDe="Tickettyp — Menge" titleIt="Tipo biglietto — quantità">
        <ChartCanvas height={195} config={{type:'doughnut',data:{labels:[...TICKET_TYPES],datasets:[{data:[...data.ticketQty],backgroundColor:palette,borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'62%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
      <Card titleDe="Vertriebskanal" titleIt="Canale di vendita">
        <ChartCanvas height={195} config={{type:'doughnut',data:{labels:[...data.channels.labels],datasets:[{data:[...data.channels.values],backgroundColor:[COLORS.deep,COLORS.mid,COLORS.light],borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'62%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
        <div className="analytics-note-small analytics-legacy-inline"><BilingualText de={legacyOverviewNotes.channelMix} it="Ufficio 77% · Online 15% · Pista 7%"/></div>
      </Card>
    </div>

    <SectionHeading de="Einnahmen nach Tickettyp" it="Entrate per tipo"/>
    <div className="analytics-grid-2">
      <Card titleDe="Einnahmen nach Tickettyp" titleIt="Entrate per tipo di biglietto">
        <ChartCanvas height={195} config={{type:'bar',data:{labels:[...TICKET_TYPES],datasets:[{data:[...data.ticketRevenue],backgroundColor:palette,borderWidth:0,borderRadius:4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,beginAtZero:true,ticks:{...axis.ticks,callback:(v:any)=>'€'+(Number(v)/1000).toFixed(0)+'k'}}}}} as any}/>
      </Card>
      <Card titleDe="Einnahmen (%) vs. Menge (%)" titleIt="Entrate (%) vs. quantità (%)">
        <ChartCanvas height={195} config={{type:'doughnut',data:{labels:[...TICKET_TYPES],datasets:[
          {label:'Entrate',data:[...data.ticketRevenue],backgroundColor:palette,borderWidth:2,borderColor:COLORS.background},
          {label:'Menge',data:[...data.ticketQty],backgroundColor:palette.map(c=>c+'99'),borderWidth:2,borderColor:COLORS.background},
        ]},options:{...baseOptions,cutout:'40%',plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
        <div className="analytics-note-small analytics-legacy-inline"><BilingualText de="Außen: Einnahmen · Innen: Menge" it={legacyOverviewNotes.revenueVsQuantity}/></div>
      </Card>
    </div>

    <SectionHeading de="Strategische Erkenntnisse" it="Insights strategici"/>
    <div className="analytics-insights">
      {overviewInsights.map(x=><Insight key={x[0]} n={x[0]} de={x[1]} it={x[2]} bodyDe={x[3]} bodyIt={x[4]} tag={x[5]}/>)}
    </div>
    <EditorialSummary {...editorialSummaries.overview}/>
    <ReferencePanel titleDe="Datenquellen & Qualität" titleIt="Fonti dati & qualità" items={salesReferenceSources}/>
  </Module>;
}

export function AnnualModule({language}:AnalyticsModuleProps){
  const {snapshot,annualLiveReady,publicBaseline}=useAnalyticsLive();
  const data=useMemo(()=>selectAnnualDataset(snapshot,annualLiveReady,publicBaseline),[snapshot,annualLiveReady,publicBaseline]);
  const idx=(arr:readonly number[])=>arr.map(v=>v/arr[0]*100);
  const dnsTotal=data.qty.wkd.map((v,i)=>v+data.qty.skd[i]);
  const areaTotal=data.qty.wka.map((v,i)=>v+data.qty.ska[i]);
  const kpis=useMemo(()=>deriveAnnualKpis(data),[data]);
  const deltaRows=useMemo(()=>{
    const first=0;
    const last=data.totalTickets.length-1;
    const series=[
      ['DAY',data.qty.day,data.revenueByType.day],
      ['Area WK',data.qty.wka,data.revenueByType.wka],
      ['Area SK',data.qty.ska,data.revenueByType.ska],
      ['DNS WK',data.qty.wkd,data.revenueByType.wkd],
      ['DNS SK',data.qty.skd,data.revenueByType.skd],
    ] as const;
    const rows:Array<{type:string;qty:number;revenue:number;qtyPct:number;revenuePct:number}>=series.map(([type,qtySeries,revenueSeries])=>{
      const qty=qtySeries[last]-qtySeries[first];
      const revenue=revenueSeries[last]-revenueSeries[first];
      return {type,qty,revenue,qtyPct:qtySeries[first]?qty/qtySeries[first]*100:0,revenuePct:revenueSeries[first]?revenue/revenueSeries[first]*100:0};
    });
    rows.push({type:language==='de'?'GESAMT':'TOTALE',qty:data.totalTickets[last]-data.totalTickets[first],revenue:data.totalRevenue[last]-data.totalRevenue[first],qtyPct:data.totalTickets[first]?(data.totalTickets[last]-data.totalTickets[first])/data.totalTickets[first]*100:0,revenuePct:data.totalRevenue[first]?(data.totalRevenue[last]-data.totalRevenue[first])/data.totalRevenue[first]*100:0});
    return rows;
  },[data]);
  const lastIndex=data.totalTickets.length-1;
  const priceRows=[
    {type:'DAY',value:data.qty.day[lastIndex]?data.revenueByType.day[lastIndex]/data.qty.day[lastIndex]:0},
    {type:'Area WK',value:data.qty.wka[lastIndex]?data.revenueByType.wka[lastIndex]/data.qty.wka[lastIndex]:0},
    {type:'Area SK',value:data.qty.ska[lastIndex]?data.revenueByType.ska[lastIndex]/data.qty.ska[lastIndex]:0},
    {type:'DNS WK',value:data.qty.wkd[lastIndex]?data.revenueByType.wkd[lastIndex]/data.qty.wkd[lastIndex]:0},
    {type:'DNS SK',value:data.qty.skd[lastIndex]?data.revenueByType.skd[lastIndex]/data.qty.skd[lastIndex]:0},
  ];
  return <Module>
    <SourceBadge state={data.source==='live'?'historical':data.source}
      de={data.source==='live' ? 'DNS_Core historisch · Jahresparität geprüft' : data.source==='public' ? 'DNS_Core öffentliche Baseline · Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · A.2.1'}
      it={data.source==='live' ? 'DNS_Core storico · parità annuale verificata' : data.source==='public' ? 'Baseline pubblica DNS_Core · zero-loss verificato' : 'Dataset di compatibilità · A.2.1'}
    />
    <div className="analytics-metrics">
      <Metric label={kpis.dnsSkIsRecord?'DNS SK — Rekord':'DNS SK — aktueller Wert'} sublabel={kpis.dnsSkIsRecord?'DNS SK — record':'DNS SK — valore attuale'} value={integer(kpis.dnsSk)} note={`${kpis.dnsSkGrowthPct>=0?'↑ +':'↓ '}${Math.abs(kpis.dnsSkGrowthPct).toFixed(0)}% vs. 2022-23`} top/>
      <Metric label="DNS WK Wachstum" sublabel="DNS WK crescita" value={`${kpis.dnsWkGrowthPct>=0?'+':''}${kpis.dnsWkGrowthPct.toFixed(0)}%`} note={`vs. 2022-23 (${integer(data.qty.wkd[0])}→${integer(data.qty.wkd[data.qty.wkd.length-1])})`}/>
      <Metric label="Umsatz 4 Jahre" sublabel="Entrate 4 anni" value={`${kpis.totalRevenueGrowthPct>=0?'+':''}${kpis.totalRevenueGrowthPct.toFixed(1).replace('.',',')}%`} note="2022-23 → 2025-26"/>
      <Metric label="Rekord-Saison" sublabel="Stagione record" value={kpis.recordSeason} noteDe={`${euro(kpis.recordRevenue)} · ${integer(kpis.recordTickets)} Tickets`} noteIt={`${euro(kpis.recordRevenue)} · ${integer(kpis.recordTickets)} ticket`}/>
    </div>

    <SectionHeading de="Trendentwicklung — Index 100 · DNS vs. Area" it="Sviluppo trend — Indice 100 · DNS vs. Area"/>
    <div className="analytics-grid-2">
      <Card titleDe="Trendentwicklung pro Tickettyp — Index 100" titleIt="Sviluppo per tipo di biglietto — indice base 100" accent>
        <ChartCanvas config={{type:'line',data:{labels:[...SEASONS],datasets:[
          {label:'DAY',data:idx(data.qty.day),borderColor:COLORS.day,backgroundColor:'transparent',tension:.4},
          {label:'WK Area',data:idx(data.qty.wka),borderColor:COLORS.wkArea,backgroundColor:'transparent',tension:.4},
          {label:'WK DNS',data:idx(data.qty.wkd),borderColor:COLORS.wkDns,backgroundColor:'transparent',tension:.4},
          {label:'SK Area',data:idx(data.qty.ska),borderColor:COLORS.skArea,backgroundColor:'transparent',tension:.4,borderDash:[4,3]},
          {label:'SK DNS',data:idx(data.qty.skd),borderColor:COLORS.skDns,backgroundColor:'transparent',tension:.4},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:axis,y:axis}}} as any}/>
      </Card>
      <Card titleDe="DNS-Produkte vs. Area-Produkte — Index 100" titleIt="Prodotti DNS vs. prodotti Area — indice base 100" accent>
        <ChartCanvas config={{type:'line',data:{labels:[...SEASONS],datasets:[
          {label:'DNS',data:dnsTotal.map(v=>v/dnsTotal[0]*100),borderColor:COLORS.deep,backgroundColor:'rgba(13,77,94,.08)',fill:true,tension:.4},
          {label:'Area',data:areaTotal.map(v=>v/areaTotal[0]*100),borderColor:COLORS.wkArea,backgroundColor:'rgba(139,58,47,.06)',fill:true,tension:.4},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:axis,y:axis}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="DNS-Produkte im Fokus · Gesamttickets" it="Focus prodotti DNS · Totale biglietti"/>
    <div className="analytics-grid-3">
      {[
        {de:'DNS SK — Serienentwicklung',it:'DNS SK — evoluzione storica',data:data.qty.skd},
        {de:'DNS WK — Serienentwicklung',it:'DNS WK — evoluzione storica',data:data.qty.wkd},
        {de:'Gesamttickets — 4 Saisons',it:'Totale biglietti — 4 stagioni',data:data.totalTickets},
      ].map((item,i)=><Card key={item.de} titleDe={item.de} titleIt={item.it}>
        <ChartCanvas height={175} config={{type:i===2?'line':'bar',data:{labels:[...SEASONS],datasets:[{data:[...item.data],backgroundColor:i===2?'rgba(13,77,94,.08)':[COLORS.year4,COLORS.year3,COLORS.year2,COLORS.year1],borderColor:COLORS.deep,fill:i===2,tension:.4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>)}
    </div>

    <SectionHeading de="Einnahmentrend · Zusammensetzung nach Jahr" it="Trend entrate · composizione per anno"/>
    <div className="analytics-grid-2">
      <Card titleDe="Gesamteinnahmen — 4-Jahrestrend" titleIt="Entrate totali — trend 4 anni">
        <ChartCanvas height={190} config={{type:'line',data:{labels:[...SEASONS],datasets:[{data:[...data.totalRevenue],borderColor:COLORS.deep,backgroundColor:'rgba(13,77,94,.08)',fill:true,tension:.4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,ticks:{...axis.ticks,callback:(v:any)=>'€'+(Number(v)/1e6).toFixed(2)+'M'}}}}} as any}/>
      </Card>
      <Card titleDe="Einnahmen-Zusammensetzung pro Jahr" titleIt="Composizione entrate per anno">
        <ChartCanvas height={190} config={{type:'bar',data:{labels:[...SEASONS],datasets:[
          {label:'DAY',data:[...data.revenueByType.day],backgroundColor:COLORS.day},
          {label:'WK Area',data:[...data.revenueByType.wka],backgroundColor:COLORS.wkArea},
          {label:'WK DNS',data:[...data.revenueByType.wkd],backgroundColor:COLORS.wkDns},
          {label:'SK Area',data:[...data.revenueByType.ska],backgroundColor:COLORS.skArea},
          {label:'SK DNS',data:[...data.revenueByType.skd],backgroundColor:COLORS.skDns},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Delta 2022-23 → 2025-26 & Ø Preise" it="Variazione 2022-23 → 2025-26 & prezzi medi"/>
    <div className="analytics-grid-2">
      <Card titleDe="Δ Menge & Einnahmen" titleIt="Δ quantità & entrate">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Tickettyp" it="Tipo biglietto"/></th><th><BilingualText de="Δ Menge" it="Δ quantità"/></th><th><BilingualText de="Δ Einnahmen" it="Δ entrate"/></th><th><BilingualText de="% Menge" it="% quantità"/></th><th><BilingualText de="% Einnahmen" it="% entrate"/></th></tr></thead><tbody>
          {deltaRows.map(row=><tr key={row.type}><td>{row.type}</td><td>{row.qty>0?'+':''}{integer(row.qty)}</td><td>{row.revenue>0?'+':''}{euro(row.revenue)}</td><td>{row.qtyPct>0?'+':''}{pct(row.qtyPct,Math.abs(row.qtyPct)<10?2:1)}</td><td>{row.revenuePct>0?'+':''}{pct(row.revenuePct,Math.abs(row.revenuePct)<10?2:1)}</td></tr>)}
        </tbody></table></div>
      </Card>
      <Card titleDe="Ø Ticketpreis WS 2025-26" titleIt="Prezzo medio per tipo SI 2025-26">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Tickettyp" it="Tipo biglietto"/></th><th><BilingualText de="Ø Preis" it="Prezzo medio"/></th></tr></thead><tbody>
          {priceRows.map(row=><tr key={row.type}><td>{row.type}</td><td><strong>€ {row.value.toFixed(2).replace('.',',')}</strong></td></tr>)}
        </tbody></table></div>
      </Card>
    </div>
    <Card titleDe="Ø Preis-Trend" titleIt="Trend prezzo medio">
      <ChartCanvas height={180} config={{type:'line',data:{labels:[...SEASONS],datasets:[{data:[...data.avgPrice],borderColor:COLORS.deep,backgroundColor:'rgba(13,77,94,.08)',fill:true,tension:.4}]},options:{...baseOptions,scales:{x:axis,y:{...axis,ticks:{...axis.ticks,callback:(v:any)=>'€'+Number(v).toFixed(0)}}}}} as any}/>
    </Card>
    <EditorialSummary {...editorialSummaries.annual}/>
  </Module>;
}

export function RegionalModule({language}:AnalyticsModuleProps){
  const {snapshot,regionalLiveReady,publicBaseline}=useAnalyticsLive();
  const data=useMemo(()=>selectRegionalDataset(snapshot,regionalLiveReady,publicBaseline),[snapshot,regionalLiveReady,publicBaseline]);
  const qty=data.qty;
  const rev=data.revenue;
  const pctQ=stackedPercent(qty);
  const pctR=stackedPercent(rev);
  const kpis=useMemo(()=>deriveRegionalKpis(data),[data]);
  const datasetsFrom=(p:number[][])=>TICKET_TYPES.map((label,j)=>({label,data:p.map(x=>x[j]),backgroundColor:palette[j],borderWidth:0}));
  return <Module>
    <SourceBadge state={data.source}
      de={data.source==='live' ? 'DNS_Core LIVE · regionale Parität geprüft' : data.source==='public' ? 'DNS_Core öffentliche Baseline · Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · A.2.1'}
      it={data.source==='live' ? 'DNS_Core LIVE · parità regionale verificata' : data.source==='public' ? 'Baseline pubblica DNS_Core · zero-loss verificato' : 'Dataset di compatibilità · A.2.1'}
    />

    <div className="analytics-metrics">
      <Metric label="DAY-geprägte Region" sublabel="Regione a forte vocazione DAY" value={kpis.dayRegion} noteDe={`${pct(kpis.daySharePct)} DAY-Anteil`} noteIt={`${pct(kpis.daySharePct)} quota DAY`} top/>
      <Metric label="SK Area Schwerpunkt" sublabel="SK Area più radicata" value={kpis.skAreaRegion} noteDe={`${integer(kpis.skAreaQty)} Stk. · ${pct(kpis.skAreaNetworkSharePct)} des SK-Area-Gesamtwerts`} noteIt={`${integer(kpis.skAreaQty)} pz · ${pct(kpis.skAreaNetworkSharePct)} del totale SK Area`}/>
      <Metric label="DNS WK Kerngebiet" sublabel="Cuore del DNS WK" value={kpis.dnsWkRegion} noteDe={`${integer(kpis.dnsWkQty)} Stk. · ${pct(kpis.dnsWkNetworkSharePct)} des DNS-WK-Gesamtwerts`} noteIt={`${integer(kpis.dnsWkQty)} pz · ${pct(kpis.dnsWkNetworkSharePct)} del totale WK DNS`}/>
      <Metric label="Ausgewogenes Profil" sublabel="Profilo più diversificato" value={kpis.diversifiedRegion} noteDe="Mix der Nicht-DAY-Produkte" noteIt="Mix dei prodotti non-DAY"/>
    </div>

    <SectionHeading de="Ticketmix pro Region — 100%" it="Composizione biglietti per regione — 100%"/>
    <div className="analytics-grid-2">
      <Card titleDe="Menge (%) nach Tickettyp" titleIt="Quantità (%) per tipo di biglietto" accent>
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:datasetsFrom(pctQ)},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true,max:100,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}}}}} as any}/>
      </Card>
      <Card titleDe="Einnahmen (%) nach Tickettyp" titleIt="Entrate (%) per tipo di biglietto" accent>
        <ChartCanvas config={{type:'bar',data:{labels:[...REGIONS],datasets:datasetsFrom(pctR)},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true,max:100,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Detailansicht pro Tickettyp" it="Dettaglio per tipo di biglietto"/>
    <div className="analytics-grid-3">
      {TICKET_TYPES.map((t,i)=><Card key={t} title={t}>
        <ChartCanvas height={170} config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...qty[i]],backgroundColor:qty[i].map(v=>v===Math.max(...qty[i])?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>)}
      <Card titleDe="Gesamteinnahmen nach Region" titleIt="Entrate totali per regione">
        <ChartCanvas height={170} config={{type:'bar',data:{labels:[...REGIONS],datasets:[{data:[...data.totalRevenue],backgroundColor:data.totalRevenue.map(v=>v===Math.max(...data.totalRevenue)?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40,autoSkip:false}},y:{...axis,beginAtZero:true}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Heatmap — Menge pro Region & Tickettyp" it="Heatmap — quantità per regione e tipo"/>
    <Card titleDe="Regionale Verteilung" titleIt="Distribuzione regionale">
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Region" it="Regione"/></th>{TICKET_TYPES.map(t=><th key={t}>{t}</th>)}<th><BilingualText de="Einnahmen" it="Entrate"/></th></tr></thead><tbody>
        {REGIONS.map((r,i)=><tr key={r}><td><RegionLabel name={r} compact/></td>{qty.map((a,j)=><td key={j}>{integer(a[i])}</td>)}<td>{euro(data.totalRevenue[i])}</td></tr>)}
      </tbody></table></div>
    </Card>

    <SectionHeading de="Regionale Erkenntnisse" it="Insights regionali"/>
    <div className="analytics-insights">
      {legacyRegionalInsights.map(item=><Insight key={item.n} {...item}/>)}
    </div>
    <EditorialSummary {...editorialSummaries.regional}/>
  </Module>;
}

export function ReliabilityModule({language}:AnalyticsModuleProps){
  const {snapshot,reliabilityLiveReady,kpPartnerLiveReady,publicBaseline}=useAnalyticsLive();
  const data=useMemo(()=>selectReliabilityDataset(snapshot,reliabilityLiveReady,publicBaseline),[snapshot,reliabilityLiveReady,publicBaseline]);
  const partnerData=useMemo(()=>selectKpPartnerDataset(snapshot,kpPartnerLiveReady,publicBaseline),[snapshot,kpPartnerLiveReady,publicBaseline]);
  const rows=data.rows;
  const sorted=[...rows].sort((a,b)=>b.kp-a.kp);
  const totalPot=rows.reduce((s,d)=>s+d.pot,0);
  const totalOpen=rows.reduce((s,d)=>s+d.tot3,0);
  const totalOpen1=rows.reduce((s,d)=>s+d.tot1,0);
  const totalKs=rows.reduce((s,d)=>s+d.ks3,0);
  const mostReliable=[...rows].sort((a,b)=>b.pct3-a.pct3)[0];

  return <Module>
    <SourceBadge state={data.source}
      de={data.source==='live' ? 'DNS_Core LIVE · KP-Parität geprüft' : data.source==='public' ? 'DNS_Core öffentliche Baseline · Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · A.2.1'}
      it={data.source==='live' ? 'DNS_Core LIVE · parità KP verificata' : data.source==='public' ? 'Baseline pubblica DNS_Core · zero-loss verificato' : 'Dataset di compatibilità · A.2.1'}
    />
    <BilingualNote de="KS = Kunstschnee · NS = Naturschnee · nicht geöffnet · KP = KS-km am 20.01 / potenzielle Gesamt-km (max. 100%)" it={legacyReliabilityCopy.legendIt}/>

    <div className="analytics-metrics">
      <Metric label="Netzöffnung am 20.01.2026" sublabel="Rete aperta" value={pct(totalOpen/totalPot*100)} note={`${totalOpen.toFixed(1)} / ${totalPot.toFixed(0)} km`}/>
      <Metric label="KS-Anteil an geöffneten Loipen" sublabel="Quota neve artificiale" value={pct(totalOpen ? totalKs/totalOpen*100 : 0)} note={`${totalKs.toFixed(1)} km KS`}/>
      <Metric label="Netzöffnung am 23.12.2025" sublabel="Apertura rete" value={pct(totalPot ? totalOpen1/totalPot*100 : 0)} noteDe="Meilenstein 1" noteIt="Milestone 1"/>
      <Metric label="Höchste Zuverlässigkeit" sublabel="Regione più affidabile" value={mostReliable?.r ?? '—'} noteDe={mostReliable ? `${pct(mostReliable.pct3,0)} an allen 3 Meilensteinen` : '—'} noteIt={mostReliable ? `${pct(mostReliable.pct3,0)} alle 3 milestone` : '—'} top/>
    </div>

    <SectionHeading de="KP — Kunstschnee-Index pro Region" it="KP per regione — indice neve artificiale"/>
    <div className="analytics-grid-2">
      <Card titleDe="KP pro Region — KS-km / potenzielle km (max. 100%)" titleIt="KP per regione — km KS / km potenziali (max 100%)">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(d=>d.r),datasets:[{data:sorted.map(d=>d.kp),backgroundColor:sorted.map(d=>d.kp>=70?COLORS.deep:d.kp>=30?COLORS.mid:COLORS.light),borderWidth:0,borderRadius:4}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,max:110,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}},y:axis}}} as any}/>
      </Card>
      <Card titleDe="KS · NS · nicht geöffnet — 20.01.2026" titleIt="KS · NS · non aperto — 20.01.2026">
        <ChartCanvas config={{type:'bar',data:{labels:rows.map(d=>d.r),datasets:[
          {label:'KS',data:rows.map(d=>d.ks3),backgroundColor:COLORS.deep},
          {label:language==='de'?'Offen ohne KS':'Aperte senza KS',data:rows.map(d=>Math.max(0,d.tot3-d.ks3)),backgroundColor:COLORS.light},
          {label:language==='de'?'Potenzial nicht geöffnet':'Potenziale non aperto',data:rows.map(d=>Math.max(0,d.pot-d.tot3)),backgroundColor:'rgba(65,116,131,.15)'},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="% Pistenöffnung — 3 Meilensteine pro Region" it="% piste aperte per regione — nelle 3 milestone"/>
    <div className="analytics-grid-2">
      <Card titleDe="% Pistenöffnung pro Region & Meilenstein" titleIt="% piste aperte per regione e milestone">
        <ChartCanvas config={{type:'bar',data:{labels:rows.map(d=>d.r),datasets:[
          {label:'23.12.2025',data:rows.map(d=>d.pct1),backgroundColor:COLORS.year4},
          {label:'06.01.2026',data:rows.map(d=>d.pct2),backgroundColor:COLORS.wkDns},
          {label:'20.01.2026',data:rows.map(d=>d.pct3),backgroundColor:COLORS.deep},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:axis,y:{...axis,max:110,ticks:{...axis.ticks,callback:(v:any)=>v+'%'}}}}} as any}/>
      </Card>
      <Card titleDe="Tabelle — KP pro Region WS 2025-26" titleIt="Tabella — KP per regione SI 2025-26">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Region" it="Regione"/></th><th>Pot.</th><th>23.12</th><th>06.01</th><th>20.01</th><th>KP</th></tr></thead><tbody>
          {rows.map(d=><tr key={d.r}><td><RegionLabel name={d.r} compact/></td><td>{d.pot}</td><td>{pct(d.pct1,0)}</td><td>{pct(d.pct2,0)}</td><td>{pct(d.pct3,0)}</td><td><strong>{pct(d.kp)}</strong></td></tr>)}
        </tbody></table></div>
      </Card>
    </div>

    <SectionHeading de="DNS Gesamtbild · Klassifikation nach KP-Index" it="Quadro complessivo DNS · Classificazione per indice KP"/>
    <div className="analytics-grid-2">
      <Card titleDe="DNS — KS · offen ohne KS · nicht geöffnet (20.01)" titleIt="DNS — KS · aperte senza KS · non aperte (20.01)">
        <div className="analytics-kpi-stack">
          <div><span>KS</span><strong>{totalKs.toFixed(1)} km</strong></div>
          <div><span><BilingualText de="Offen ohne KS" it="Aperte senza KS"/></span><strong>{Math.max(0,totalOpen-totalKs).toFixed(1)} km</strong></div>
          <div><span><BilingualText de="Nicht geöffnet" it="Non aperte"/></span><strong>{Math.max(0,totalPot-totalOpen).toFixed(1)} km</strong></div>
        </div>
      </Card>
      <Card titleDe="Klassifikation nach KP-Index" titleIt="Classificazione per indice KP">
        <div className="analytics-legacy-list">
          {[
            {de:'KP ≥ 70% — Hohe KS-Abhängigkeit',it:'KP ≥ 70% — Alta dipendenza KS'},
            {de:'KP 30–70% — Mix KS / NS',it:'KP 30–70% — Mix KS / NS'},
            {de:'KP < 30% — Naturschnee',it:'KP < 30% — Neve naturale'},
          ].map(item=><div key={item.de}><BilingualText de={item.de} it={item.it}/></div>)}
        </div>
      </Card>
    </div>
    <BilingualNote de={legacyReliabilityCopy.biathlonDe+' '+legacyReliabilityCopy.osttirolDe} it={legacyReliabilityCopy.biathlonIt+' '+legacyReliabilityCopy.osttirolIt}/>

    <SectionHeading de="Detailansicht — 16 Partner einzeln" it="Dettaglio — 16 partner"/>
    <SourceBadge state={partnerData.source==='live'?'historical':partnerData.source}
      de={partnerData.source==='live' ? 'DNS_Core historisch · Partnerparität geprüft' : partnerData.source==='public' ? 'DNS_Core öffentliche Baseline · Partner Zero-Loss geprüft' : 'Partnerdetail · Kompatibilitätsdatensatz · A.2.1'}
      it={partnerData.source==='live' ? 'DNS_Core storico · parità partner verificata' : partnerData.source==='public' ? 'Baseline pubblica DNS_Core · zero-loss partner verificato' : 'Dettaglio partner · dataset di compatibilità · A.2.1'}
    />
    <Card titleDe="KP pro Partner — KS-km / individuelle potenzielle km" titleIt="KP per partner — km KS / km potenziali individuali">
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Partner</th><th>Pot.</th><th>KS 23.12</th><th>KS 06.01</th><th>KS 20.01</th><th><BilingualText de="Geöffnet" it="Aperto"/></th><th>KP</th></tr></thead><tbody>
        {partnerData.rows.map(d=>{const kp=d.excluded?null:Math.min(100,d.ks3/d.pot*100);const open=d.excluded?null:Math.min(100,d.tot3/d.pot*100);return <tr key={d.p} className={d.excluded?'is-muted':''}><td>{d.p}{d.excluded ? <><span className="analytics-lang-de"> · ausgeschlossen</span><span className="analytics-lang-it"> · escluso</span></> : null}</td><td>{d.pot}</td><td>{d.ks1}</td><td>{d.ks2}</td><td>{d.ks3}</td><td>{open==null?'—':pct(open,0)}</td><td>{kp==null?'—':pct(kp)}</td></tr>})}
      </tbody></table></div>
    </Card>
    <MethodologyPanel titleDe="Methodische Anmerkungen & Quellen" titleIt="Note metodologiche & fonti" items={reliabilityMethodology}/>
    <ReferencePanel titleDe="KP-Datenquellen & Zuverlässigkeit" titleIt="Fonti KP & affidabilità" items={reliabilityReferenceSources}/>
    <EditorialSummary {...editorialSummaries.reliability}/>
  </Module>;
}

export function AdvancedModule({language}:AnalyticsModuleProps){
  const {snapshot,advancedLiveReady,publicBaseline}=useAnalyticsLive();
  const observed=useMemo(()=>selectAdvancedObservedInputs(snapshot,advancedLiveReady,publicBaseline),[snapshot,advancedLiveReady,publicBaseline]);
  const [nights,setNights]=useState<number>(advancedDefaults.nightsPerWeeklyGuest);
  const [share,setShare]=useState<number>(advancedDefaults.overnightShare*100);
  const [spend,setSpend]=useState<number>(advancedDefaults.spendPerNight);
  const [mult,setMult]=useState<number>(advancedDefaults.multiplier);
  const [dayShare,setDayShare]=useState<number>(advancedDefaults.dayOvernightShare);
  const derived=useMemo(()=>{
    const q=share/100;
    const nightsNet=observed.weeklyTicketsNetwork*q*nights;
    const nightsAA=observed.weeklyTicketsSouthTyrol*q*nights;
    const directNet=nightsNet*spend;
    const directAA=nightsAA*spend;
    const totalNet=directNet*mult;
    const dayNights=observed.dayTickets*(dayShare/100);
    const dayDirect=dayNights*spend;
    return {nightsNet,nightsAA,directNet,directAA,totalNet,dayNights,dayDirect,grand:directNet+dayDirect};
  },[nights,share,spend,mult,dayShare]);
  return <Module>
    <SourceBadge state={observed.source==='live'?'historical':observed.source}
      de={observed.source==='live' ? 'DNS_Core historisch · beobachtete Inputs geprüft' : observed.source==='public' ? 'DNS_Core öffentliche Baseline · beobachtete Inputs Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · beobachtete Inputs A.2.1'}
      it={observed.source==='live' ? 'DNS_Core storico · input osservati verificati' : observed.source==='public' ? 'Baseline pubblica DNS_Core · input osservati zero-loss verificati' : 'Dataset di compatibilità · input osservati A.2.1'}
    />
    <BilingualNote de={legacyAdvancedCopy.introDe} it={legacyAdvancedCopy.introIt}/>
    <div className="analytics-assumption-note">
      <span className="analytics-lang-de">Beobachtet: Ticketmengen · Annahmen: Nächte/Gast, Übernachtungsanteil, Ausgaben/Nacht, Multiplikator, DAY-Übernachtungsanteil.</span>
      <span className="analytics-lang-it">Osservato: volumi ticket · Assunzioni: notti/ospite, quota pernottanti, spesa/notte, moltiplicatore, quota pernottanti DAY.</span>
    </div>
    <div className="analytics-metrics">
      <Metric label="Wochenkarten gesamt" sublabel="Settimanali totali" value={integer(observed.weeklyTicketsNetwork)} note="Network"/>
      <Metric label="Geschätzte Übernachtungen" sublabel="Pernottamenti stimati" value={integer(derived.nightsNet)} noteDe={`${share}% · ${nights} Nächte`} noteIt={`${share}% · ${nights} notti`}/>
      <Metric label="Direkte Wertschöpfung" sublabel="Valore diretto" value={`€ ${(derived.directNet/1e6).toFixed(2)} Mio`} noteDe={`€ ${spend}/Nacht`} noteIt={`€ ${spend}/notte`}/>
      <Metric label="Gesamtwirkung" sublabel="Impatto totale" value={`€ ${(derived.totalNet/1e6).toFixed(2)} Mio`} noteDe={`× ${mult.toFixed(2)} Multiplikator`} noteIt={`× ${mult.toFixed(2)} moltiplicatore`} top/>
    </div>

    <SectionHeading de="Wochenkarten — Direkte Wertschöpfung" it="Settimanali — valore economico diretto"/>
    <Card titleDe="Interaktiver Simulator" titleIt="Simulatore interattivo" accent>
      <div className="analytics-sliders">
        <Slider label={language==='de'?'Nächte':'Notti'} value={nights} min={3} max={10} step={.5} onChange={setNights}/>
        <Slider label={language==='de'?'Übernachtungsquote':'Quota pernottanti'} value={share} min={40} max={100} step={5} onChange={setShare} suffix="%"/>
        <Slider label={language==='de'?'Ausgabe':'Spesa'} value={spend} min={70} max={180} step={1} onChange={setSpend} prefix="€ "/>
        <Slider label={language==='de'?'Multiplikator':'Moltiplicatore'} value={mult} min={1} max={2.5} step={.05} onChange={setMult}/>
        <Slider label={language==='de'?'DAY-Übernachtungsquote':'Quota pernottanti DAY'} value={dayShare} min={0} max={100} step={5} onChange={setDayShare} suffix="%"/>
      </div>
    </Card>

    <SectionHeading de="Südtirol vs. Gesamtnetzwerk" it="Alto Adige vs. intero network"/>
    <div className="analytics-grid-2">
      <Card titleDe="Wertschöpfung — Vergleich" titleIt="Valore economico — confronto">
        <BilingualNote de={legacyAdvancedCopy.southTyrolScopeDe} it={legacyAdvancedCopy.southTyrolScopeIt}/>
        <ChartCanvas config={{type:'bar',data:{labels:[language==='de'?'Südtirol':'Alto Adige',language==='de'?'Gesamtnetzwerk':'Intero network'],datasets:[
          {label:language==='de'?'Direkt':'Diretto',data:[derived.directAA,derived.directNet],backgroundColor:COLORS.deep},
          {label:language==='de'?'Multiplikator-Effekt':'Effetto moltiplicatore',data:[derived.directAA*(mult-1),derived.directNet*(mult-1)],backgroundColor:COLORS.light},
        ]},options:{...baseOptions,indexAxis:'y',plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,stacked:true},y:{...axis,stacked:true}}}} as any}/>
      </Card>
      <Card titleDe="Ticketeinnahmen → territorialer Impact" titleIt="Incasso biglietti → impatto territoriale">
        <div className="analytics-impact-flow">
          <div><span><BilingualText de="Einnahmen Wochenkarten" it="Incasso settimanali"/></span><strong>{euro(observed.weeklyRevenueNetwork)}</strong><small>{`WK DNS ${euro(observed.weeklyRevenueDns)} + WK Area ${euro(observed.weeklyRevenueArea)}`}</small></div>
          <div className="analytics-impact-arrow">↓</div>
          <div><span><BilingualText de="Territorialer Impact" it="Impatto territoriale"/></span><strong>€ {(derived.totalNet/1e6).toFixed(2)} Mio</strong><small><BilingualText de={`× Multiplikator ${mult.toFixed(2)}`} it={`× moltiplicatore ${mult.toFixed(2)}`}/></small></div>
          <div><span><BilingualText de="Verhältnis" it="Rapporto"/></span><strong>1 : {observed.weeklyRevenueNetwork ? Math.round(derived.totalNet/observed.weeklyRevenueNetwork) : '—'}</strong></div>
        </div>
      </Card>
    </div>

    <SectionHeading de="Aufschlüsselung der Ausgaben (Struktur ASTAT)" it="Ripartizione spesa (struttura ASTAT)"/>
    <div className="analytics-grid-2">
      <Card titleDe="Direkte Wertschöpfung nach Ausgabeposten" titleIt="Valore diretto per voce di spesa">
        <ChartCanvas config={{type:'doughnut',data:{labels:advancedDefaults.astat.map(v=>language==='de'?v.de:v.it),datasets:[{data:advancedDefaults.astat.map(v=>derived.directNet*v.q),backgroundColor:advancedDefaults.astat.map(v=>v.c),borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'58%',plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
      <Card titleDe="Werte nach Ausgabeposten · Network" titleIt="Valori per voce di spesa · network">
        <table className="analytics-table"><thead><tr><th><BilingualText de="Posten" it="Voce"/></th><th>%</th><th>EUR</th></tr></thead><tbody>{advancedDefaults.astat.map(v=><tr key={v.it}><td>{language==='de'?v.de:v.it}</td><td>{pct(v.q*100,1)}</td><td>{euro(derived.directNet*v.q)}</td></tr>)}</tbody></table>
      </Card>
    </div>

    <SectionHeading de="Szenario Tageskarten (explorativ)" it="Scenario giornalieri (esplorativo)"/>
    <BilingualNote de={legacyAdvancedCopy.dayWarningDe} it={legacyAdvancedCopy.dayWarningIt}/>
    <div className="analytics-metrics">
      <Metric label="Tageskarten gesamt" sublabel="Giornalieri totali" value={integer(observed.dayTickets)}/>
      <Metric label="Davon Übernachtungsgäste" sublabel="Quota ospiti" value={integer(derived.dayNights)} note={`${dayShare}%`}/>
      <Metric label="Zusätzl. Wertschöpfung" sublabel="Valore aggiuntivo" value={`€ ${(derived.dayDirect/1e6).toFixed(2)} Mio`}/>
      <Metric label="Gesamt WK + Tageskarten · Szenario" sublabel="Totale scenario" value={`€ ${(derived.grand/1e6).toFixed(2)} Mio`} top/>
    </div>
    <SectionHeading de="Strategische Erkenntnisse" it="Insights strategici"/>
    <div className="analytics-insights">
      {legacyAdvancedCopy.insights.map(item=><Insight key={item.n} {...item}/>)}
    </div>
    <Alert variant="info">
      <span className="analytics-lang-de">Die Annahmen und Quellen aus dem Ausgangs-HTML bleiben im Preservation-Datensatz archiviert. Für Berechnung und Interpretation gilt ausschließlich das nachstehende verifizierte Protokoll.</span>
      <span className="analytics-lang-it">Le assunzioni e le fonti dell’HTML originale restano archiviate nel dataset di preservazione. Per calcolo e interpretazione fa fede esclusivamente il protocollo verificato seguente.</span>
    </Alert>
    <MethodologyPanel titleDe="Methodische Anmerkungen & Quellen — verifiziertes Protokoll" titleIt="Note metodologiche & fonti — protocollo verificato" items={advancedMethodology}/>
    <ReferencePanel titleDe="Referenzwerte & Quellenqualität" titleIt="Valori di riferimento & qualità fonti" items={advancedReferenceSources}/>
    <ReferencePanel titleDe="Übergreifende Grenzen" titleIt="Limiti trasversali" items={crossCuttingReferenceLimits}/>
  </Module>;
}

export function OvernightModule({language}:AnalyticsModuleProps){
  const {snapshot,overnightLiveReady,publicBaseline}=useAnalyticsLive();
  const data=useMemo(()=>selectOvernightDataset(snapshot,overnightLiveReady,publicBaseline),[snapshot,overnightLiveReady,publicBaseline]);
  const historicalRows=publicBaseline?.overnightAreas ?? overnightAreas;
  const historicalTotal=historicalRows.reduce((sum,row)=>sum+Number(row.pn[0]),0);
  const historicalSorted=[...historicalRows].sort((a,b)=>Number(b.pn[0])-Number(a.pn[0]));
  const historicalTop=historicalSorted[0];
  const historicalAverage=historicalRows.length?historicalTotal/historicalRows.length:0;
  const sorted=[...data.rows].sort((a,b)=>b.pn2526-a.pn2526);
  const total2526=data.rows.reduce((s,a)=>s+a.pn2526,0);
  const total2425=data.rows.reduce((s,a)=>s+a.pn2425,0);
  const top=sorted[0];
  const monthly=data.monthly;
  return <Module>
    <SourceBadge state={data.source}
      de={data.source==='fair' ? 'DNS FAIR · PN-Parität geprüft · 8 Berichtsgebiete' : data.source==='public' ? 'DNS_Core öffentliche Baseline · PN Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · PN A.2.1'}
      it={data.source==='fair' ? 'DNS FAIR · parità PN verificata · 8 reporting area' : data.source==='public' ? 'Baseline pubblica DNS_Core · PN zero-loss verificato' : 'Dataset di compatibilità · PN A.2.1'}
    />

    <div className="analytics-metrics">
      <Metric label="Übernachtungen gesamt" sublabel="Pernottamenti totali" value={integer(total2526)} note={`${integer(total2526-total2425)} vs. 2024-25`}/>
      <Metric label="Top-Gebiet" sublabel="Area principale" value={top?.area ?? '—'} note={top?integer(top.pn2526):'—'} top/>
      <Metric label="Gebiete" sublabel="Aree" value={data.rows.length}/>
      <Metric label="Ø pro Gebiet" sublabel="Media per area" value={integer(total2526/data.rows.length)}/>
    </div>

    <SectionHeading de="Historische Basis aus Ausgangs-HTML — WS 2024-25" it="Base storica dal file HTML originale — SI 2024-25"/>
    <Alert variant="warning">
      <span className="analytics-lang-de">Historische Darstellung mit 9 Gebieten: Seiser Alm und Gröden waren getrennt. Die aktuelle FAIR-Struktur verwendet 8 kanonische Reporting Areas. Direkte Gebietsvergleiche sind erst nach Aggregation auf die kanonische Struktur zulässig.</span>
      <span className="analytics-lang-it">Rappresentazione storica a 9 aree: Alpe di Siusi e Val Gardena erano separate. La struttura FAIR attuale usa 8 reporting area canoniche. Il confronto diretto per area è valido solo dopo aggregazione alla struttura canonica.</span>
    </Alert>
    <BilingualNote de={legacyOvernightCopy.basisDe} it={legacyOvernightCopy.basisIt}/>
    <div className="analytics-metrics">
      <Metric label="Übernachtungen gesamt" sublabel="Pernottamenti totali" value={integer(historicalTotal)} noteDe={`WS 2024-25 · ${historicalRows.length} Gebiete`} noteIt={`SI 2024-25 · ${historicalRows.length} aree`}/>
      <Metric label="Top-Gebiet" sublabel="Area top" value={historicalTop?.area ?? '—'} note={historicalTop?`${integer(Number(historicalTop.pn[0]))} · ${pct(Number(historicalTop.pn[0])/historicalTotal*100)}`:'—'} top/>
      <Metric label="Gebiete" sublabel="Aree" value={historicalRows.length} noteDe="DNS Netzwerk" noteIt="Network DNS"/>
      <Metric label="Ø pro Gebiet" sublabel="Media per area" value={integer(historicalAverage)} noteDe="Durchschnitt" noteIt="Media"/>
    </div>
    <div className="analytics-grid-2">
      <Card titleDe="Übernachtungen pro Gebiet — WS 2024-25" titleIt="Pernottamenti per area — SI 2024-25">
        <ChartCanvas config={{type:'bar',data:{labels:historicalSorted.map(a=>a.area),datasets:[{data:historicalSorted.map(a=>a.pn[0]),backgroundColor:historicalSorted.map((_,i)=>i===0?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>(Number(v)/1000).toFixed(0)+'k'}},y:axis}}} as any}/>
      </Card>
      <Card titleDe="Datentabelle · Zeitreihe (Basis)" titleIt="Tabella dati · serie storica (base)">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Gebiet" it="Area"/></th><th>PN 2024-25</th><th><BilingualText de="Anteil" it="Quota"/></th><th>PN 2025-26</th></tr></thead><tbody>
          {historicalRows.map(a=><tr key={a.area}><td>{a.area}</td><td>{integer(a.pn[0])}</td><td>{pct(Number(a.pn[0])/historicalTotal*100)}</td><td>{integer(a.pn[1])}</td></tr>)}
        </tbody></table></div>
        <div className="analytics-note-small analytics-legacy-inline">
          <span className="analytics-lang-de"><strong>Legacy-Archiv · </strong>Quelle: DNS FAIR Model (PN WS 2024-25) · Disaggregation Seiser Alm/Gröden und Ahrntal/Sand in Taufers aus regionalen Tourismusdaten · vorläufig.</span>
          <span className="analytics-lang-it"><strong>Archivio legacy · </strong>Fonte: DNS FAIR Model (PN SI 2024-25) · disaggregazione Alpe di Siusi/Val Gardena e Ahrntal/Sand in Taufers da dati turistici regionali · provvisorio.</span>
        </div>
      </Card>
    </div>
    <EditorialSummary de={legacyOvernightCopy.summaryDe} it={legacyOvernightCopy.summaryIt}/>

    <SectionHeading de="Übernachtungen pro Gebiet — WS 2025-26" it="Pernottamenti per area — SI 2025-26"/>
    <div className="analytics-grid-2">
      <Card titleDe="Übernachtungen pro Gebiet (sortiert)" titleIt="Pernottamenti per area (ordinati)">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(a=>a.area),datasets:[{data:sorted.map(a=>a.pn2526),backgroundColor:sorted.map((_,i)=>i===0?COLORS.deep:COLORS.light),borderWidth:0,borderRadius:3}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>(Number(v)/1000).toFixed(0)+'k'}},y:axis}}} as any}/>
      </Card>
      <Card titleDe="Anteil pro Gebiet" titleIt="Quota per area">
        <ChartCanvas config={{type:'doughnut',data:{labels:sorted.map(a=>a.area),datasets:[{data:sorted.map(a=>a.pn2526),backgroundColor:[COLORS.deep,COLORS.mid,COLORS.light,COLORS.day,COLORS.wkArea,COLORS.skArea,COLORS.wkDns,COLORS.skDns],borderWidth:2,borderColor:COLORS.background}]},options:{...baseOptions,cutout:'55%',plugins:{legend:{display:true,position:'right',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Datentabelle · Zeitreihe" it="Tabella dati · serie storica"/>
    <Card titleDe="WS 2025-26 vs. WS 2024-25" titleIt="SI 2025-26 vs. SI 2024-25">
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Gebiet" it="Area"/></th><th>2025-26</th><th><BilingualText de="Anteil" it="Quota"/></th><th>2024-25</th><th>Δ</th></tr></thead><tbody>
        {sorted.map(a=><tr key={a.areaId}><td><RegionLabel name={a.area} compact/></td><td><strong>{integer(a.pn2526)}</strong></td><td>{pct(a.pn2526/total2526*100)}</td><td>{integer(a.pn2425)}</td><td className={a.pn2526-a.pn2425>=0?'is-positive':'is-negative'}>{integer(a.pn2526-a.pn2425)}</td></tr>)}
      </tbody></table></div>
    </Card>

    <SectionHeading de="Kontext Südtirol — Wintersaison 2025/26 (Provinzebene)" it="Contesto Alto Adige — stagione invernale 2025/26 (livello provinciale)"/>
    <SourceBadge state="historical" de="Monatskontext · historische Quelle · nicht von FAIR bereitgestellt" it="Contesto mensile · fonte storica · non fornito da FAIR"/>
    <BilingualNote de={legacyOvernightCopy.provinceContextDe} it={legacyOvernightCopy.provinceContextIt}/>
    <div className="analytics-metrics">
      {legacyOvernightCopy.months.map((m,i)=><Metric key={m.de} label={m.de} sublabel={m.it} value={integer(monthly[i] ?? m.nights)} noteDe={`Übernachtungen (${m.nightsDelta>0?'+':''}${m.nightsDelta.toFixed(1).replace('.',',')}%) · ${integer(m.arrivals)} Ankünfte (${m.arrivalsDelta>0?'+':''}${m.arrivalsDelta.toFixed(1).replace('.',',')}%)`} noteIt={`Presenze (${m.nightsDelta>0?'+':''}${m.nightsDelta.toFixed(1).replace('.',',')}%) · ${integer(m.arrivals)} arrivi (${m.arrivalsDelta>0?'+':''}${m.arrivalsDelta.toFixed(1).replace('.',',')}%)`}/>)}
    </div>
    <div className="analytics-metrics">
      <Metric label="Summe Dez–März 2025/26" sublabel="Totale dic–mar 2025/26" value={integer(legacyOvernightCopy.winterWindowNights)} noteDe="Übernachtungen — FAIR-Zeitfenster" noteIt="Presenze — finestra FAIR"/>
      <Metric label="Ankünfte Dez–März" sublabel="Arrivi dic–mar" value={integer(legacyOvernightCopy.winterWindowArrivals)} note="01.12.2025–31.03.2026"/>
      <Metric label="Saison gesamt 2025/26" sublabel="Stagione totale 2025/26" value="14,8 Mio" noteDe={`${integer(legacyOvernightCopy.seasonTotalArrivals)} Ankünfte`} noteIt={`${integer(legacyOvernightCopy.seasonTotalArrivals)} arrivi`}/>
      <Metric label="Top-Gemeinde März" sublabel="Comune top marzo" value={legacyOvernightCopy.topMunicipalityMarch} noteDe={`${integer(legacyOvernightCopy.topMunicipalityMarchNights)} Übernachtungen`} noteIt={`${integer(legacyOvernightCopy.topMunicipalityMarchNights)} presenze`} top/>
    </div>
    <div className="analytics-note-small analytics-legacy-inline">
      <span className="analytics-lang-de">Quelle: ASTAT — Landesinstitut für Statistik, monatliche Tourismusentwicklung (Dez. 2025–März 2026). Provinzkontext, nicht DNS-spezifisch. Die Summe Dez–März umfasst ganz Südtirol.</span>
      <span className="analytics-lang-it">{legacyOvernightCopy.provinceSource.replace('Quelle · Fonte: ','Fonte: ')}</span>
    </div>
    <ReferencePanel titleDe="Touristische Referenzquellen & Vergleichbarkeit" titleIt="Fonti turistiche & comparabilità" items={overnightReferenceSources}/>
    <ReferencePanel titleDe="Statistische Grenzen" titleIt="Limiti statistici" items={crossCuttingReferenceLimits}/>
  </Module>;
}


export function IntensityModule({language}:AnalyticsModuleProps){
  const {snapshot,intensityLiveReady,publicBaseline}=useAnalyticsLive();
  const dataset=useMemo(()=>selectIntensityDataset(snapshot,intensityLiveReady,publicBaseline),[snapshot,intensityLiveReady,publicBaseline]);
  const areas=dataset.rows.map(a=>({
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
    <SourceBadge state={dataset.source}
      de={dataset.source==='live' ? 'DNS_Core Verkäufe + DNS FAIR PN · Parität geprüft' : dataset.source==='public' ? 'DNS_Core öffentliche Baseline · Intensitätsinputs Zero-Loss geprüft' : 'Kompatibilitätsdatensatz · Intensitätsinputs A.2.1'}
      it={dataset.source==='live' ? 'Vendite DNS_Core + PN DNS FAIR · parità verificata' : dataset.source==='public' ? 'Baseline pubblica DNS_Core · input intensità zero-loss verificati' : 'Dataset di compatibilità · input intensità A.2.1'}
    />
    <div className="analytics-assumption-note">
      <span className="analytics-lang-de">Modellannahmen: 75% Übernachtungsanteil × 6 Nächte für Wochenkarten; 45% Übernachtungsanteil im DAY-Szenario.</span>
      <span className="analytics-lang-it">Assunzioni del modello: 75% pernottanti × 6 notti per i settimanali; 45% pernottanti nello scenario DAY.</span>
    </div>
    <div className="analytics-metrics">
      <Metric label="Intensivste Region (WK)" sublabel="Regione più intensa" value={sorted[0].area.split('/')[0].trim()} note={pct(sorted[0].intWK,2)} top/>
      <Metric label="Ø Intensität WK-basiert" sublabel="Intensità media" value={pct(areas.reduce((s,a)=>s+a.intWK,0)/areas.length,2)}/>
      <Metric label="Gebiete mit > 1% Intensität" sublabel="Aree oltre 1%" value={areas.filter(a=>a.intWK>=1).length}/>
      <Metric label="Gesamtintensität Network" sublabel="Intensità network" value={pct(netInt,2)}/>
    </div>

    <SectionHeading de="Intensität pro Gebiet — WK-basiert (robust)" it="Intensità per area — basata su WK (robusta)"/>
    <div className="analytics-grid-2">
      <Card titleDe="% Langlauf-Übernachtungen / Gesamt (WK-Proxy)" titleIt="% pernottamenti fondo / totale (proxy WK)">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(a=>a.area),datasets:[{data:sorted.map(a=>a.intWK),backgroundColor:sorted.map(a=>a.intWK>=2?COLORS.deep:a.intWK>=1?COLORS.mid:COLORS.light),borderWidth:0,borderRadius:4}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>Number(v).toFixed(1)+'%'}},y:axis}}} as any}/>
      </Card>
      <Card titleDe="WK-Tickets vs. Gesamtübernachtungen — Verhältnis" titleIt="Ticket WK vs. pernottamenti totali — rapporto">
        <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><BilingualText de="Gebiet" it="Area"/></th><th>SWDNS</th><th><BilingualText de="geschätzte PN" it="PN stimati"/></th><th><BilingualText de="PN gesamt" it="PN totali"/></th><th><BilingualText de="Intensität" it="Intensità"/></th></tr></thead><tbody>
          {sorted.map(a=><tr key={a.area}><td><RegionLabel name={a.area} compact/></td><td>{integer(a.wk)}</td><td>{integer(a.pnWK)}</td><td>{integer(a.pn)}</td><td><strong>{pct(a.intWK,2)}</strong></td></tr>)}
        </tbody></table></div>
      </Card>
    </div>

    <SectionHeading de="Szenario inkl. Tageskarten (explorativ)" it="Scenario incl. giornalieri (esplorativo)"/>
    <div className="analytics-grid-2">
      <Card titleDe="% Intensität inkl. Tageskarten-Schätzung" titleIt="% intensità incl. stima giornalieri">
        <ChartCanvas config={{type:'bar',data:{labels:[...areas].sort((a,b)=>b.intDAY-a.intDAY).map(a=>a.area),datasets:[{data:[...areas].sort((a,b)=>b.intDAY-a.intDAY).map(a=>a.intDAY),backgroundColor:COLORS.wkArea,borderWidth:0,borderRadius:4}]},options:{...baseOptions,indexAxis:'y',scales:{x:{...axis,ticks:{...axis.ticks,callback:(v:any)=>Number(v).toFixed(1)+'%'}},y:axis}}} as any}/>
      </Card>
      <Card titleDe="Vergleich WK-Szenario vs. WK+DAY-Szenario" titleIt="Confronto scenario WK vs. scenario WK+DAY">
        <ChartCanvas config={{type:'bar',data:{labels:sorted.map(a=>a.area),datasets:[
          {label:language==='de'?'WK (robust)':'WK (robusto)',data:sorted.map(a=>a.intWK),backgroundColor:COLORS.deep},
          {label:language==='de'?'WK+DAY (explorativ)':'WK+DAY (esplorativo)',data:sorted.map(a=>a.intDAY),backgroundColor:'rgba(139,58,47,.5)'},
        ]},options:{...baseOptions,plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,font:{size:9},color:COLORS.mid}}},scales:{x:{...axis,ticks:{...axis.ticks,maxRotation:40}},y:{...axis,beginAtZero:true,ticks:{...axis.ticks,callback:(v:any)=>Number(v).toFixed(1)+'%'}}}}} as any}/>
      </Card>
    </div>

    <SectionHeading de="Strategische Erkenntnisse" it="Insights strategici"/>
    <div className="analytics-insights">
      <Insight n="I" de={`${sorted[0].area.split('/')[0].trim()} — höchste Intensität im Netzwerk`} it={`${sorted[0].area.split('/')[0].trim()} — massima intensità nel network`} bodyDe={`${pct(sorted[0].intWK,2)} der Übernachtungen sind geschätzte Langlauf-Gäste.`} bodyIt={`${pct(sorted[0].intWK,2)} dei pernottamenti stimati sono fondisti.`} tag="Strukturelle Verankerung · Radicamento strutturale"/>
      <Insight n="II" de="Comelico — überraschend hohe Intensität" it="Comelico — intensità sorprendentemente alta" bodyDe="Kleines Gebiet, aber der Langlauf ist relativ dominant." bodyIt="Area piccola, ma il fondo vi è relativamente dominante." tagDe="↑ Strukturelle Relevanz" tagIt="↑ Rilevanza strutturale" tag="↑ Strukturelle Relevanz · ↑ Rilevanza strutturale"/>
      <Insight n="III" de="Niedrige % ≠ wirtschaftlich irrelevant" it="% bassa ≠ irrilevante economicamente" bodyDe="Auch kleine Prozentwerte können hunderte direkt zurechenbare Übernachtungen bedeuten." bodyIt="Anche percentuali ridotte possono corrispondere a centinaia di pernottamenti attribuibili." tagDe="Kontext" tagIt="Contesto" tag="Kontext · Contesto"/>
    </div>
    <MethodologyPanel titleDe="KPI-Protokoll & Quellen" titleIt="Protocollo KPI & fonti" items={intensityMethodology}/>
  </Module>;
}

function BilingualNote({de,it}:{de:string;it:string}){
  return <div className="analytics-assumption-note analytics-bilingual-note" data-dns-reveal>
    <p className="analytics-lang-de">{de}</p>
    <p className="analytics-lang-it">{it}</p>
  </div>;
}

function Slider({label,value,min,max,step,onChange,prefix='',suffix=''}:{label:string;value:number;min:number;max:number;step:number;onChange:(v:number)=>void;prefix?:string;suffix?:string}){
  return <label className="analytics-slider"><span>{label}</span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/><strong>{prefix}{value}{suffix}</strong></label>;
}

function Module({children}:{children:ReactNode}){
  return <div className="analytics-module">{children}</div>;
}
