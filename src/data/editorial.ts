export type EditorialSummary = { de:string; it:string };
export type MethodologyItem = {
  key:string;
  labelDe:string;
  labelIt:string;
  value:string;
  classification:'observed'|'external-source'|'assumption'|'derived'|'limitation';
  source:string;
  sourceYear?:string;
  sourceUrl?:string;
  noteDe:string;
  noteIt:string;
};

export const editorialSummaries:Record<string,EditorialSummary>={
  overview:{
    de:'Trotz ungünstiger Schneebedingungen bestätigt DNS seine wirtschaftliche Stärke und erzielt mit dem DNS SK den besten Serienrekord.',
    it:'Nonostante condizioni meno favorevoli, DNS conferma la propria solidità e registra il miglior risultato storico del DNS SK.',
  },
  annual:{
    de:'In vier Saisons: Umsatz +20,2%, DNS SK Rekord, DNS WK fast verdoppelt — das Netzkonzept überzeugt zunehmend.',
    it:'In quattro stagioni: fatturato +20,2%, DNS SK record, DNS WK quasi raddoppiato — il concetto di rete convince sempre di più.',
  },
  regional:{
    de:'Jedes Partnergebiet bringt sein eigenes Profil in das DNS-Network ein — diese Vielfalt ist eine Stärke des Verbunds.',
    it:'Ogni territorio porta il proprio profilo nel network DNS — questa diversità è un punto di forza del consorzio.',
  },
  reliability:{
    de:'30% des Netzes war am 23.12. geöffnet — das erklärt den Rückgang der DNS WK-Verkäufe zu Saisonbeginn. Gsiesertal als einzige Region mit 100% über alle drei Meilensteine.',
    it:'Il 30% della rete era aperto al 23.12 — spiega il calo vendite DNS WK a inizio stagione. Gsiesertal unica regione al 100% nelle 3 milestone.',
  },
  overnight:{
    de:'Die touristische Dimension der DNS-Gebiete ist sehr unterschiedlich. Die Übernachtungsbasis dient zur Einordnung des Langlauf-Anteils pro Gebiet.',
    it:'La dimensione turistica delle aree DNS è molto diversa. La base dei pernottamenti serve a inquadrare il peso del fondo per ogni area.',
  },
};

export const advancedMethodology:MethodologyItem[]=[
  {
    key:'weekly-ticket-proxy',labelDe:'Wochenkarte als Aufenthalts-Proxy',labelIt:'Settimanale come proxy di soggiorno',
    value:'WK Area + WK DNS',classification:'derived',source:'DNS Verkaufsstatistik / DNS_Core',
    noteDe:'Wochenkarten werden als Indikator für mehrtägige Aufenthalte verwendet; Proxy, kein Beweis.',
    noteIt:'I settimanali sono usati come indicatore di soggiorni multi-giornata; proxy, non prova.',
  },
  {
    key:'nights',labelDe:'Übernachtungen pro Wochenkarte',labelIt:'Pernottamenti per settimanale',
    value:'6',classification:'assumption',source:'Legacy Analytics methodology',
    noteDe:'Referenz: 5,5 Skitage + An-/Abreise.',noteIt:'Riferimento: 5,5 giorni sciati + arrivo/partenza.',
  },
  {
    key:'overnight-share',labelDe:'Wochenkarten = echte Übernachtungsgäste',labelIt:'Settimanali = veri pernottanti',
    value:'75%',classification:'assumption',source:'Prudential scenario',
    noteDe:'Prudenter Szenariowert; Rest u.a. Zweitwohnungen und Einheimische.',
    noteIt:'Valore prudenziale di scenario; resto incl. seconde case e residenti.',
  },
  {
    key:'spend',labelDe:'Tagesausgabe pro Gast',labelIt:'Spesa giornaliera per ospite',
    value:'€117',classification:'external-source',source:'ASTAT + EURAC — Spesa turistica in Alto Adige, stagione invernale 2004/05',
    sourceYear:'2005',sourceUrl:'https://www.provincia.bz.it/agricoltura-foreste/servizio-forestale-forestali/news.asp?aktuelles_action=4&aktuelles_article_id=112862',
    noteDe:'Verifizierter historischer Referenzwert: €117 pro Kopf/Tag im Winter 2004/05; Italien €124, Deutschland €115. Für 2025-26 kein aktueller ASTAT-Wert nachgewiesen; Network-Anwendung ist daher ein Szenario.',
    noteIt:'Riferimento storico verificato: €117 pro capite/giorno nell’inverno 2004/05; Italia €124, Germania €115. Non è stato verificato un valore ASTAT aggiornato al 2025-26; l’applicazione al network resta quindi uno scenario.',
  },
  {
    key:'multiplier',labelDe:'Wirtschaftsmultiplikator',labelIt:'Moltiplicatore economico',
    value:'1,5',classification:'assumption',source:'UNSD / UNWTO — Tourism Satellite Account: Recommended Methodological Framework 2008',
    sourceYear:'2008',sourceUrl:'https://unstats.un.org/unsd/publication/seriesf/seriesf_80rev1e.pdf',
    noteDe:'Die TSA-Methodik beschreibt exogene Multiplikatoren als vereinfachte Näherung, liefert aber keinen DNS-spezifischen Wert 1,5. 1,5 bleibt deshalb ein transparenter Szenarioparameter; 1,0 = nur direkte Wirkung.',
    noteIt:'La metodologia TSA descrive i moltiplicatori esogeni come approssimazioni semplificate, ma non fornisce un valore 1,5 specifico per DNS. 1,5 resta quindi un parametro di scenario trasparente; 1,0 = solo effetto diretto.',
  },
  {
    key:'day-share',labelDe:'DAY = Übernachtungsgäste',labelIt:'DAY = ospiti pernottanti',
    value:'45%',classification:'assumption',source:'Seilbahnen Österreich — Wertschöpfungsstudie, Wintersaison 2004/05 (historical reference)',
    sourceYear:'2006',sourceUrl:'https://www.mountain-manager.com/wp-content/uploads/2019/01/mountain_manager_0106.pdf',
    noteDe:'Explorativ. Die historische österreichische Studie nennt 66,8% Übernachtungsgäste, 21,4% Tagesgäste und 11,8% Saisonkartenbesitzer; sie belegt den DNS-Wert 45% nicht.',
    noteIt:'Esplorativo. Lo studio austriaco storico indica 66,8% pernottanti, 21,4% giornalieri e 11,8% stagionali; non dimostra il valore DNS del 45%.',
  },
  {
    key:'economic-impact-limit',labelDe:'Grenze der Wertschöpfung',labelIt:'Limite del valore economico',
    value:'Proxy',classification:'limitation',source:'Legacy Analytics methodology',
    noteDe:'Gesamtausgabe der Gäste ist nicht ausschließlich dem Langlauf zurechenbar.',
    noteIt:'La spesa totale degli ospiti non è attribuibile esclusivamente allo sci di fondo.',
  },
];

export const reliabilityMethodology:MethodologyItem[]=[
  {
    key:'kp-formula',labelDe:'KP-Definition',labelIt:'Definizione KP',value:'KS km / potenzielle km',
    classification:'derived',source:'DNS Website + GPX (legacy methodology); current values DNS_Core KP history',
    noteDe:'KP am 20.01.; im Legacy-Modell bei 100% gedeckelt.',noteIt:'KP al 20.01; nel modello legacy cappato al 100%.',
  },
  {
    key:'biathlon',labelDe:'Biathlon Antholz',labelIt:'Biathlon Anterselva',value:'excluded',
    classification:'limitation',source:'DNS operational note',
    noteDe:'Aus KP ausgeschlossen: Loipen für Milano Cortina 2026 reserviert.',noteIt:'Escluso dal KP: piste riservate a Milano Cortina 2026.',
  },
  {
    key:'osttirol',labelDe:'Osttirol / Obertilliach',labelIt:'Osttirol / Obertilliach',value:'historical caveat',
    classification:'limitation',source:'Legacy Analytics note',
    noteDe:'Legacy-Dashboard markierte Osttirol wegen Snowfarming Obertilliach als vorläufig.',noteIt:'Il dashboard legacy segnalava Osttirol come provvisorio per lo snowfarming di Obertilliach.',
  },
];

export const overnightMethodology:MethodologyItem[]=[
  {
    key:'pn-source',labelDe:'PN 2025-26',labelIt:'PN 2025-26',value:'FAIR',
    classification:'observed',source:'DNS FAIR Model',
    noteDe:'Aktuell aus dem kanonischen FAIR-Modell gelesen; 8 DNS Reporting Areas.',noteIt:'Attualmente letto dal modello FAIR canonico; 8 reporting area DNS.',
  },
  {
    key:'legacy-history',labelDe:'Historische Basis',labelIt:'Base storica',value:'2024-25',
    classification:'observed',source:'Legacy Analytics / DNS FAIR Model',
    noteDe:'Legacy-Analytics führte 2024-25 als Basis; frühere Disaggregationen werden nicht als operative FAIR-Struktur übernommen.',
    noteIt:'Analytics legacy usava il 2024-25 come base; le precedenti disaggregazioni non vengono ripristinate come struttura FAIR operativa.',
  },
];

export const intensityMethodology:MethodologyItem[]=[
  {
    key:'inputs',labelDe:'Beobachtete Inputs',labelIt:'Input osservati',value:'WK + DAY + PN',
    classification:'observed',source:'DNS_Core Sales + DNS FAIR',
    noteDe:'WK und DAY nach Reporting Area aus Sales; PN aus FAIR.',noteIt:'WK e DAY per reporting area da Sales; PN da FAIR.',
  },
  ...advancedMethodology.filter(item=>['nights','overnight-share','day-share'].includes(item.key)),
];
