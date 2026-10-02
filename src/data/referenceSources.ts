export type ReferenceReliability = 'official'|'assumption'|'provisional';

export type ReferenceSourceItem = {
  key:string;
  labelDe:string;
  labelIt:string;
  value?:string;
  source:string;
  reliability:ReferenceReliability;
  noteDe:string;
  noteIt:string;
  scopeDe?:string;
  scopeIt?:string;
  sourceUrl?:string;
};

export const referenceReliabilityLabels:Record<ReferenceReliability,{de:string;it:string;status:'ready'|'warning'|'error'}>={
  official:{de:'Offiziell / überprüfbar',it:'Ufficiale / verificabile',status:'ready'},
  assumption:{de:'Schätzung / deklarierte Annahme',it:'Stima / assunzione dichiarata',status:'warning'},
  provisional:{de:'Vorläufig / zu prüfen',it:'Provvisorio / da verificare',status:'error'},
};

export const salesReferenceSources:ReferenceSourceItem[]=[
  {
    key:'sales-statistics',
    labelDe:'Ticketverkäufe, Einnahmen und Durchschnittspreise',
    labelIt:'Vendite, entrate e prezzi medi dei biglietti',
    value:'WS 2022-23 → 2025-26',
    source:'DNS — VERKAUFSTATISTIK',
    reliability:'official',
    noteDe:'Interne DNS-Verkaufsstatistik; Grundlage für Übersicht, Jahresvergleich und Regionen.',
    noteIt:'Statistica vendite interna DNS; base per panoramica, confronto annuale e regioni.',
  },
  {
    key:'weekly-volume',
    labelDe:'Wochenkarten WS 2025-26',
    labelIt:'Settimanali SI 2025-26',
    value:'DNS WK 3.458 · Area WK 4.032 · Gesamt 7.490',
    source:'DNS — VERKAUFSTATISTIK WS 2025-26',
    reliability:'official',
    noteDe:'Beobachteter interner Wert; im Runtime aus dem aktiven Datensatz abgeleitet.',
    noteIt:'Dato interno osservato; nel runtime viene derivato dal dataset attivo.',
  },
  {
    key:'weekly-revenue',
    labelDe:'Einnahmen Wochenkarten WS 2025-26',
    labelIt:'Incasso settimanali SI 2025-26',
    value:'€ 425.398 · DNS WK € 214.726 + Area WK € 210.672',
    source:'DNS — VERKAUFSTATISTIK WS 2025-26',
    reliability:'official',
    noteDe:'Referenzwert des Quelldossiers; Analytics berechnet den sichtbaren Wert aus dem aktiven Datensatz.',
    noteIt:'Valore di riferimento del dossier; Analytics calcola il valore visibile dal dataset attivo.',
  },
];

export const reliabilityReferenceSources:ReferenceSourceItem[]=[
  {
    key:'potential-km',
    labelDe:'Potenzielle Loipenkilometer pro Region',
    labelIt:'Km piste potenziali per regione',
    value:'DNS gesamt 736 km',
    source:'DNS-Website + GPX-Tracks',
    reliability:'official',
    noteDe:'Interne Referenzbasis. Osttirol bleibt wegen Snowfarming Obertilliach gesondert zu prüfen.',
    noteIt:'Base di riferimento interna. Osttirol resta da verificare separatamente per lo snowfarming di Obertilliach.',
  },
  {
    key:'snow-milestones',
    labelDe:'Kunstschnee-km je Meilenstein',
    labelIt:'Km neve artificiale per milestone',
    value:'23.12.2025 · 06.01.2026 · 20.01.2026',
    source:'KP Artificial vs. natural snow 2025-26 · Google Drive · Tab KP WS 2025-26',
    reliability:'assumption',
    noteDe:'Von den Regionen zusammengestellt. Laut Quelldossier ist die Spalte Naturschnee nicht ausreichend zuverlässig.',
    noteIt:'Compilazione delle aree. Secondo il dossier fonti la colonna neve naturale non è sufficientemente affidabile.',
  },
  {
    key:'kp-definition',
    labelDe:'KP-Definition',
    labelIt:'Definizione KP',
    value:'KS-km am 20.01 / potenzielle km · max. 100%',
    source:'DNS Methodik',
    reliability:'assumption',
    noteDe:'Interne methodische Definition; nicht als externe amtliche Kennzahl zu verstehen.',
    noteIt:'Definizione metodologica interna; non è un indicatore statistico ufficiale esterno.',
  },
  {
    key:'biathlon-exclusion',
    labelDe:'Biathlon Antholz',
    labelIt:'Biathlon Anterselva',
    value:'vom KP ausgeschlossen',
    source:'DNS operative Festlegung · Milano Cortina 2026',
    reliability:'official',
    noteDe:'Loipen waren für Athleten reserviert und werden deshalb nicht in den KP einbezogen.',
    noteIt:'Le piste erano riservate agli atleti e sono quindi escluse dal KP.',
  },
  {
    key:'osttirol-provisional',
    labelDe:'Osttirol / Obertilliach',
    labelIt:'Osttirol / Obertilliach',
    value:'vorläufig',
    source:'DNS KP Arbeitsstand',
    reliability:'provisional',
    noteDe:'Snowfarming Obertilliach mit der Region prüfen, bevor der Wert extern als final verwendet wird.',
    noteIt:'Verificare con la regione lo snowfarming di Obertilliach prima di usare il dato come definitivo all’esterno.',
  },
];

export const advancedReferenceSources:ReferenceSourceItem[]=[
  {
    key:'daily-spend',
    labelDe:'Tagesausgabe pro Wintergast',
    labelIt:'Spesa media giornaliera ospite invernale',
    value:'€ 117 · IT € 124 · DE € 115',
    source:'ASTAT — Spesa media giornaliera ospite, Winterhalbjahr Südtirol',
    reliability:'official',
    scopeDe:'Nur Südtirol; historische Referenz, nicht DNS-Netzwerk gesamt.',
    scopeIt:'Solo Alto Adige; riferimento storico, non intero network DNS.',
    noteDe:'Amtlicher Referenzwert im Quelldossier. Die Übertragung auf Osttirol und Veneto ist eine Modellvereinfachung.',
    noteIt:'Valore ufficiale di riferimento nel dossier. L’applicazione a Osttirol e Veneto è una semplificazione del modello.',
  },
  {
    key:'guest-composition',
    labelDe:'Gästezusammensetzung',
    labelIt:'Composizione ospiti',
    value:'66,8% Übernachtung · 21,4% Tagesgäste · 11,8% Saisonkarten',
    source:'Seilbahnen Österreich — Wertschöpfungsstudie · dwif / Manova',
    reliability:'official',
    scopeDe:'Österreichische Seilbahnen; Kontextwert, nicht Langlauf-spezifisch.',
    scopeIt:'Impianti a fune austriaci; dato di contesto, non specifico per lo sci di fondo.',
    noteDe:'Dient als externer Kontext. Der DNS-DAY-Szenariowert von 45% wird dadurch nicht belegt.',
    noteIt:'Serve come contesto esterno. Non dimostra il valore di scenario DNS del 45% per i DAY.',
  },
  {
    key:'multiplier',
    labelDe:'Wirtschaftsmultiplikator',
    labelIt:'Moltiplicatore economico',
    value:'1,5 · Referenzbereich 1,0–1,7',
    source:'Tourismus Input-Output / Tourism Satellite Account · UNWTO / TSA',
    reliability:'assumption',
    noteDe:'Exogener, bewusst deklarierter Modellparameter; kein amtlicher DNS-spezifischer Multiplikator.',
    noteIt:'Parametro esogeno dichiarato del modello; non esiste un moltiplicatore ufficiale specifico per DNS.',
  },
  {
    key:'ticket-prices',
    labelDe:'Ticketpreise / Break-even',
    labelIt:'Prezzi biglietti / break-even',
    value:'DNS WK € 72 · Area WK € 62 · DAY € 12–16',
    source:'DNS — Preisliste WS 2025-26',
    reliability:'official',
    noteDe:'Interne Tarifreferenz für die Break-even-Logik der Wochenkarte.',
    noteIt:'Riferimento tariffario interno per la logica di break-even del settimanale.',
  },
  {
    key:'nights-assumption',
    labelDe:'Übernachtungen pro Wochenkarte',
    labelIt:'Pernottamenti per settimanale',
    value:'6',
    source:'DNS Modellannahme · 5,5 Skitage + An-/Abreise',
    reliability:'assumption',
    noteDe:'Regelbarer Standardwert des Simulators.',
    noteIt:'Valore predefinito regolabile del simulatore.',
  },
  {
    key:'weekly-overnight-share',
    labelDe:'Anteil echter Übernachtungsgäste bei Wochenkarten',
    labelIt:'Quota pernottanti reali tra i settimanali',
    value:'75%',
    source:'DNS vorsichtige Modellannahme',
    reliability:'assumption',
    noteDe:'Rest umfasst u. a. Zweitwohnungen und Einheimische.',
    noteIt:'Il resto comprende tra l’altro seconde case e residenti.',
  },
  {
    key:'day-overnight-share',
    labelDe:'DAY-Tickets als Übernachtungsgäste',
    labelIt:'DAY come ospiti pernottanti',
    value:'45% · explorativ · max. Referenz 67%',
    source:'DNS Szenario · externer Kontext Seilbahnen Österreich',
    reliability:'assumption',
    noteDe:'Nur exploratives DAY-Szenario; kein beobachteter DNS-Wert.',
    noteIt:'Solo scenario DAY esplorativo; non è un valore osservato DNS.',
  },
];

export const overnightReferenceSources:ReferenceSourceItem[]=[
  {
    key:'south-tyrol-context',
    labelDe:'Südtirol — Wintersaison 2025/26',
    labelIt:'Alto Adige — stagione invernale 2025/26',
    value:'Dez–März: 12.133.762 Übernachtungen · 2.764.842 Ankünfte',
    source:'ASTAT — monatliche Tourismusentwicklung',
    reliability:'official',
    scopeDe:'Ganz Südtirol, alle Tourismusformen; nicht DNS-spezifisch.',
    scopeIt:'Tutto l’Alto Adige, ogni forma di turismo; non specifico DNS.',
    noteDe:'Provinzkontext für das FAIR-Zeitfenster 01.12.2025–31.03.2026.',
    noteIt:'Contesto provinciale per la finestra FAIR 01.12.2025–31.03.2026.',
  },
  {
    key:'tirol-context',
    labelDe:'Tirol — Wintersaison 2025/26',
    labelIt:'Tirolo — stagione invernale 2025/26',
    value:'Nov–März: 24,7 Mio Übernachtungen · gesamte Saison Nov–Apr: 26,9 Mio',
    source:'Land Tirol / Statistik Austria / Tirol Werbung',
    reliability:'official',
    scopeDe:'Ganz Tirol (Nord- und Osttirol); Wintersaison Nov–Apr, nicht FAIR Dez–März.',
    scopeIt:'Tutto il Tirolo (Nordtirol + Osttirol); inverno nov–apr, non finestra FAIR dic–mar.',
    noteDe:'Nur regionaler Kontext; nicht als Osttirol-Wert in DNS verwenden.',
    noteIt:'Solo contesto regionale; non usare come dato Osttirol nel DNS.',
  },
  {
    key:'cortina-2024',
    labelDe:'Cortina d’Ampezzo — PN 2024-25',
    labelIt:'Cortina d’Ampezzo — PN 2024-25',
    value:'Quelldossier: 362.135',
    source:'DNS FAIR Model · Arbeitsdossier',
    reliability:'provisional',
    noteDe:'Möglicherweise Jahreswert statt Winterwert. Nicht zur Überschreibung des kanonischen Analytics-/FAIR-Werts verwenden.',
    noteIt:'Possibile valore annuale anziché invernale. Non usare per sovrascrivere il valore canonico Analytics/FAIR.',
  },
  {
    key:'comelico-cortina-comparability',
    labelDe:'Cortina & Comelico — Vergleichbarkeit',
    labelIt:'Cortina & Comelico — comparabilità',
    source:'DNS Quelldossier',
    reliability:'provisional',
    noteDe:'Die PN-Basis 2024-25 könnte von der Winterdefinition der übrigen Gebiete abweichen; Jahresvergleich vor externer Nutzung validieren.',
    noteIt:'La base PN 2024-25 potrebbe differire dalla definizione invernale delle altre aree; validare il confronto annuale prima dell’uso esterno.',
  },
];

export const crossCuttingReferenceLimits:ReferenceSourceItem[]=[
  {
    key:'geographic-systems',
    labelDe:'Drei Statistiksysteme',
    labelIt:'Tre sistemi statistici',
    source:'ASTAT · Land Tirol / Statistik Austria · ISTAT / Regione Veneto',
    reliability:'official',
    noteDe:'Südtirol, Tirol und Veneto verwenden unterschiedliche Definitionen, Saisonfenster und Publikationszeiten.',
    noteIt:'Alto Adige, Tirolo e Veneto usano definizioni, finestre stagionali e tempi di pubblicazione differenti.',
  },
  {
    key:'dns-areas',
    labelDe:'DNS-Gebiete ≠ amtliche Statistikeinheiten',
    labelIt:'Aree DNS ≠ unità statistiche ufficiali',
    source:'DNS Datenmodell',
    reliability:'assumption',
    noteDe:'DNS-Gebiete sind touristische Aggregationen; Gebiets-PN stammen aus Tourismusverbänden oder Gemeindesummen.',
    noteIt:'Le aree DNS sono aggregazioni turistiche; i PN per area provengono da associazioni turistiche o somme comunali.',
  },
  {
    key:'weekly-proxy',
    labelDe:'Wochenkarte als Aufenthalts-Proxy',
    labelIt:'Settimanale come proxy di soggiorno',
    source:'DNS Advanced Analytics Methodik',
    reliability:'assumption',
    noteDe:'Ein Wochenkartenticket ist ein Indikator für Aufenthalt, kein Beweis für eine Übernachtung.',
    noteIt:'Il settimanale è un indicatore di soggiorno, non una prova di pernottamento.',
  },
];


export const overnightWorkingPn2526 = [
  {area:'Gröden / Val Gardena',pn:1601988,delta:-1.7,reliability:'official' as const},
  {area:'3 Zinnen Dolomites',pn:937875,delta:-2.8,reliability:'official' as const},
  {area:'Osttirol',pn:842993,delta:5.3,reliability:'official' as const},
  {area:'Seiser Alm / Alpe di Siusi',pn:809490,delta:1.6,reliability:'official' as const},
  {area:'Ahrntal / Sand in Taufers',pn:692590,delta:2.0,reliability:'official' as const},
  {area:"Cortina d'Ampezzo",pn:77181,delta:null,reliability:'provisional' as const},
  {area:'Gsiesertal / Welsberg / Taisten',pn:193052,delta:-0.7,reliability:'official' as const},
  {area:'Antholzertal',pn:183676,delta:-2.7,reliability:'official' as const},
  {area:'Comelico',pn:7564,delta:null,reliability:'assumption' as const},
] as const;
