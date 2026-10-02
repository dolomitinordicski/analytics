export const legacyDashboardMeta = {
  source: 'dns_dashboardf.html',
  purpose: 'Preserve editorial, contextual and methodological content from the pre-refactor Analytics dashboard.',
} as const;

export const legacyOverviewNotes = {
  channelMix: 'Büro 77% · Online 15% · Loipe 7%',
  revenueVsQuantity: 'Esterno: Entrate · Interno: quantità',
} as const;

export const legacyAnnualDelta = [
  { type: 'DAY', qty: -1225, revenue: 69321, qtyPct: -1.85, revenuePct: 8.96 },
  { type: 'Area WK', qty: -339, revenue: 2264, qtyPct: -7.76, revenuePct: 1.09 },
  { type: 'Area SK', qty: 178, revenue: 33715, qtyPct: 7.35, revenuePct: 12.5 },
  { type: 'DNS WK', qty: 1699, revenue: 109056, qtyPct: 96.6, revenuePct: 103.2 },
  { type: 'DNS SK', qty: 554, revenue: 103740, qtyPct: 30.8, revenuePct: 48.2 },
  { type: 'GESAMT / TOT', qty: 867, revenue: 318096, qtyPct: 1.1, revenuePct: 20.2 },
] as const;

export const legacyAnnualPrices2025 = [
  { type: 'DAY', value: 12.96 },
  { type: 'Area WK', value: 52.25 },
  { type: 'Area SK', value: 116.70 },
  { type: 'DNS WK', value: 62.10 },
  { type: 'DNS SK', value: 135.46 },
] as const;

export const legacyRegionalInsights = [
  {
    n: 'I',
    de: 'Seiser Alm/Val Gardena — starkes WK Area Profil',
    it: 'Seiser Alm/Val Gardena — forte profilo WK Area',
    bodyDe: 'Mit 1.309 WK Area-Tickets der höchste Wert im Network. DNS-Produkte kaum vertreten — Potenzial.',
    bodyIt: 'Con 1.309 WK Area è il valore più alto. Prodotti DNS poco presenti — potenziale di integrazione.',
    tag: '↗ DNS-Potenzial · Potenziale DNS',
  },
  {
    n: 'II',
    de: 'Osttirol — starke lokale SK Area Verankerung',
    it: 'Osttirol — forte radicamento locale SK Area',
    bodyDe: '1.474 SK Area = 56,7% des Network-Wertes. Treue lokale Stammkundschaft.',
    bodyIt: '1.474 SK Area = 56,7% del totale. Clientela locale fidelizzata.',
    tag: 'Lokale Verankerung · Radicamento locale',
  },
  {
    n: 'III',
    de: 'Gsiesertal — ausgewogenes DNS-Profil',
    it: 'Gsiesertal — profilo DNS equilibrato',
    bodyDe: 'Ausgewogenster Produktmix — ideales Pilotgebiet für digitales Ticketing (RFID).',
    bodyIt: 'Mix più equilibrato — territorio pilota ideale per ticketing digitale RFID.',
    tag: 'Pilotgebiet · Territorio pilota',
  },
  {
    n: 'IV',
    de: '3 Zinnen — starker Beitrag zum DNS WK',
    it: '3 Zinnen — contributo rilevante al DNS WK',
    bodyDe: '2.162 von 3.458 DNS WK (62,5%) — Motor des Netzwochenprodukts.',
    bodyIt: '2.162 su 3.458 DNS WK (62,5%) — motore del prodotto settimanale di rete.',
    tag: 'DNS WK Beitrag · Contributo DNS WK',
  },
  {
    n: 'V',
    de: 'Comelico & Cortina — strategische Reichweite',
    it: 'Comelico & Cortina — copertura strategica',
    bodyDe: 'Unter €43k Umsatz, aber 135 SK DNS-Pässe. Wert in der geografischen Reichweite.',
    bodyIt: 'Sotto €43k, ma 135 tessere SK DNS. Valore nella copertura geografica.',
    tag: 'Strategische Reichweite · Copertura strategica',
  },
  {
    n: 'VI',
    de: 'Ahrntal+Sand — stark bei DAY, Potenzial für DNS',
    it: 'Ahrntal+Sand — forte nei DAY, potenziale DNS',
    bodyDe: '92,1% DAY-Anteil. Mit nur 45 DNS WK großes Integrationspotenzial.',
    bodyIt: '92,1% DAY. Con soli 45 DNS WK ampio spazio di integrazione.',
    tag: '↗ DNS-Integration · Integrazione DNS',
  },
] as const;

export const legacyReliabilityCopy = {
  legendDe: 'KS = Kunstschnee / neve artificiale · NS = Naturschnee / neve naturale · Loipe non aperte / nicht geöffnet · KP = KS-km am 20.01 / potenzielle Gesamt-km (max. 100%)',
  legendIt: 'KS = neve artificiale · NS = neve naturale · piste non aperte · KP = km KS al 20.01 / km potenziali totali (max. 100%)',
  classification: [
    'KP ≥ 70% — Hohe KS-Abhängigkeit / Alta dipendenza KS',
    'KP 30–70% — Mix KS / NS',
    'KP < 30% — Naturschnee / Neve naturale',
  ],
  biathlonDe: 'Biathlon Antholz vom KP ausgeschlossen (Pisten für Athleten Milano Cortina 2026 reserviert).',
  biathlonIt: 'Biathlon Antholz escluso dal KP (piste riservate agli atleti Milano Cortina 2026).',
  osttirolDe: 'Osttirol vorläufig — mit der Region zu überprüfen (Snowfarming Obertilliach).',
  osttirolIt: 'Osttirol provvisorio — da verificare con la regione (snowfarming Obertilliach).',
} as const;

export const legacyAdvancedCopy = {
  introDe: 'Methodik: Wochenkarten (DNS WK + Area WK) als Indikator für mehrtägige Aufenthalte. Break-Even: ab 5,1 Skitagen lohnt die Wochenkarte (72€). Daraus werden Übernachtungen und touristische Wertschöpfung geschätzt.',
  introIt: 'Metodologia: i settimanali (DNS WK + Area WK) come indicatore di soggiorni multi-giornata. Break-even: dai 5,1 giorni il settimanale (72€) conviene. Da qui si stimano pernottamenti e valore economico turistico.',
  southTyrolScopeDe: 'Südtirol = 5 Regionen: Antholz, Gsies, 3 Zinnen, Ahrntal+Sand, Seiser Alm/Gröden. Network = + Osttirol, Comelico, Cortina.',
  southTyrolScopeIt: 'Alto Adige = 5 regioni: Antholz, Gsies, 3 Zinnen, Ahrntal+Sand, Seiser Alm/Gröden. Network = + Osttirol, Comelico, Cortina.',
  dayWarningDe: 'Achtung: Tageskarten sind ein unsicherer Indikator (Übernachtungstourist, Tagesausflügler oder Einheimischer). Explorativ — Anteil über Schieberegler. Referenz im Ausgangs-HTML: Seilbahnen AT = 21,4% Tagesgäste / 66,8% Übernachtungsgäste.',
  dayWarningIt: 'Attenzione: i giornalieri sono un indicatore incerto (turista pernottante, escursionista o residente). Esplorativo — quota dallo slider. Riferimento nel file HTML di partenza: Seilbahnen AT = 21,4% giornalieri / 66,8% pernottanti.',
  weeklyRevenue: 425398,
  weeklyRevenueBreakdown: 'DNS WK €214.726 + Area WK €210.672',
  insights: [
    {
      n: 'α',
      de: 'Hebelwirkung des Langlaufs',
      it: "L'effetto leva dello sci di fondo",
      bodyDe: '€425k Ticketeinnahmen erzeugen ein Vielfaches an territorialer Wertschöpfung — der Gast übernachtet, isst und kauft ein.',
      bodyIt: "€425k di incasso generano un multiplo di valore territoriale — l'ospite dorme, mangia e acquista.",
      tag: '↑ Hebel · Leva economica',
    },
    {
      n: 'β',
      de: 'Wochenkarte = Aufenthalt',
      it: 'Settimanale = soggiorno',
      bodyDe: 'Ab 5,1 Skitagen lohnt die Wochenkarte — solider Indikator für Übernachtungen.',
      bodyIt: 'Dai 5,1 giorni il settimanale conviene — indicatore solido di pernottamenti.',
      tag: 'Indikator · Indicatore robusto',
    },
    {
      n: 'γ',
      de: 'Langlauf = sanfter Tourismus',
      it: 'Fondo = turismo dolce',
      bodyDe: 'Hohe Wertschöpfung bei geringer Infrastruktur. Argument für Klimaanpassung & Interreg.',
      bodyIt: 'Alto valore con bassa infrastruttura. Argomento per adattamento climatico & Interreg.',
      tag: '↗ Nachhaltigkeit · Sostenibilità',
    },
  ],
  assumptionsDe: [
    '5,5 Skitage / 6 Übernachtungen pro Wochenkarte',
    '75% der Wochenkarten = echte Übernachtungsgäste',
    'Tagesausgabe €117 (ASTAT, historische Referenz im Ausgangs-HTML)',
    'Multiplikator exogen (I-O/TSA-Literatur), prudent',
    'Network: €117 auf alle Regionen (Vereinfachung)',
  ],
  assumptionsIt: [
    '5,5 giorni / 6 pernottamenti per settimanale',
    '75% dei settimanali = veri pernottanti',
    'Spesa giornaliera €117 (ASTAT, riferimento storico nel file di partenza)',
    'Moltiplicatore esogeno (letteratura I-O/TSA), prudenziale',
    'Network: €117 su tutte le regioni (semplificazione)',
  ],
  limitsDe: 'Grenzen: Wochenkarte = Näherungswert für Aufenthalt, kein Beweis. Wertschöpfung = Gesamtausgabe der Gäste, nicht ausschließlich dem Langlauf zurechenbar.',
  limitsIt: 'Limiti: il settimanale è un proxy del soggiorno, non una prova. Il valore economico è la spesa totale degli ospiti, non attribuibile esclusivamente al fondo.',
  sources: 'ASTAT — Spesa media giornaliera ospite invernale Alto Adige (€117) · Seilbahnen Österreich, Wertschöpfungsstudie dwif/Manova (66,8% pernottanti, 21,4% giornalieri, 11,8% stagionali) · DNS Verkaufsstatistik WS 2025-26 · Multiplikatoren: UNWTO / TSA Tourismus-Input-Output-Literatur.',
} as const;

export const legacyOvernightCopy = {
  basisDe: 'Daten der Saison 2024-25 als Basis; Spalte 2025-26 nun befüllt (Dez–März). Erster Punkt der Zeitreihe für künftige Jahresvergleiche. Zeitfenster FAIR-Modell: 01.12.2025–31.03.2026. Seiser Alm und Gröden getrennt; Ahrntal/Sand in Taufers zusammengefasst.',
  basisIt: 'Dati stagione 2024-25 come base; colonna 2025-26 ora popolata (dic–mar). Primo punto della serie storica per i confronti annuali futuri. Finestra temporale del modello FAIR: 01.12.2025–31.03.2026. Alpe di Siusi e Val Gardena separate; Ahrntal/Sand in Taufers aggregati.',
  total2425: 5650468,
  topArea2425: 'Gröden',
  topArea2425Value: 1629071,
  topArea2425Share: 28.8,
  areas2425: 9,
  average2425: 627830,
  sourceNote: 'Quelle · Fonte: DNS FAIR Model (PN WS 2024-25) · Disaggregation Seiser Alm/Gröden & Ahrntal/Sand in Taufers aus regionalen Tourismusdaten · disaggregazione da dati turistici regionali. ⚠ vorläufig · provvisorio.',
  summaryDe: 'Gröden allein erzeugt 28,8% aller Übernachtungen des DNS-Netzwerks — die touristische Dimension der Gebiete ist sehr unterschiedlich. Diese Basis dient künftig zur Einordnung des Langlauf-Anteils pro Gebiet.',
  summaryIt: 'La sola Val Gardena genera il 28,8% di tutti i pernottamenti del network DNS — la dimensione turistica delle aree è molto diversa. Questa base servirà a inquadrare il peso del fondo per ogni area.',
  provinceContextDe: 'Zur Einordnung: offizielle ASTAT-Zahlen auf Provinzebene (gesamtes Südtirol, alle Tourismusformen) — nicht DNS-spezifisch. Monatswerte für das FAIR-Zeitfenster 01.12.2025–31.03.2026 (nur Südtirol; Osttirol und Veneto nicht enthalten).',
  provinceContextIt: 'Per inquadramento: dati ufficiali ASTAT a livello provinciale (tutto l’Alto Adige, ogni forma di turismo) — non specifici DNS. Valori mensili per la finestra FAIR 01.12.2025–31.03.2026 (solo Alto Adige; Osttirol e Veneto non inclusi).',
  months: [
    { de: 'Dezember 2025', it: 'Dicembre 2025', nights: 2921272, nightsDelta: 7.5, arrivals: 780665, arrivalsDelta: 6.5 },
    { de: 'Januar 2026', it: 'Gennaio 2026', nights: 3400190, nightsDelta: 1.6, arrivals: 733038, arrivalsDelta: 6.1 },
    { de: 'Februar 2026', it: 'Febbraio 2026', nights: 3492235, nightsDelta: 5.1, arrivals: 718383, arrivalsDelta: 2.8 },
    { de: 'März 2026', it: 'Marzo 2026', nights: 2320065, nightsDelta: -4.8, arrivals: 532756, arrivalsDelta: -4.0 },
  ],
  winterWindowNights: 12133762,
  winterWindowArrivals: 2764842,
  seasonTotalNights: 14800000,
  seasonTotalArrivals: 3500000,
  topMunicipalityMarch: 'Wolkenstein / Selva di Val Gardena',
  topMunicipalityMarchNights: 166322,
  provinceSource: 'Quelle · Fonte: ASTAT — Istituto provinciale di statistica, andamento turistico mensile (dic. 2025 – mar. 2026). Dati provinciali di contesto, non riferiti alle aree DNS. ⚠ La somma dic–mar comprende l’intera provincia, non solo le aree del network.',
} as const;
