# DNS — Guida Aggiornamento Dati Annuale
**DNS Network Analytics + FAIR Model · Da aggiornare ogni estate (luglio–agosto)**

---

## FILE 1 — DNS Network Analytics (`analytics.html`)

### TAB 1 · WS corrente — KPI headline

Cerca nel codice: `class="mv"` nella sezione `<!-- ═══ PAGE 1 ═══ -->`

```html
<div class="mv">77.462</div>          <!-- Gesamttickets: totale biglietti -->
<div class="mv">€ 1,89 Mio</div>     <!-- Gesamteinnahmen: entrate totali -->
<div class="mv">€ 24,40</div>        <!-- Ø Ticketpreis: prezzo medio -->
<div class="mv">3 Zinnen</div>       <!-- Top Leistung: regione top -->
<div class="ms">€ 702.623 · 28.023 Tkts</div>  <!-- dettaglio top region -->
```

Aggiorna anche le variazioni vs anno precedente nei tag `<div class="ms">`:
```html
<div class="ms">↓ 10,9% vs. WS 2024-25</div>
```

---

### TAB 1 · Grafici per regione

Cerca: `new Chart(document.getElementById('cRegQty')`

```javascript
datasets:[{data:[4538,12586,28023,8931,7904,13710,1085,685]  // quantità per regione
```

```javascript
datasets:[{data:[134868,302512,702623,352673,147409,206245,27780,15123]  // entrate per regione (€)
```

**Ordine regioni fisso** (non cambiare):
`Antholzertal · Gsiesertal · 3 Zinnen · Osttirol · Ahrntal+Sand · Seiser Alm · Comelico · Cortina`

---

### TAB 1 · Confronto annuale per tipo ticket

Cerca: `new Chart(document.getElementById('cYearComp')`

```javascript
datasets:[
  {label:'2025-26', data:[65017,4032,3458,2600,2355]},   // ← nuova stagione
  {label:'2024-25', data:[74038,4448,4003,3597,1927]},   // ← scorre di 1
  {label:'2023-24', data:[71264,4716,3693,1974,2139]},   // ← scorre di 1
  {label:'2022-23', data:[66242,4371,1759,2422,1801]}    // ← elimina il più vecchio
]
```

**Ordine colonne**: DAY · WK Area · WK DNS · SK Area · SK DNS

---

### TAB 1 · Grafici a torta (tipo e canale)

```javascript
// Tipo ticket — quantità
new Chart(document.getElementById('cPieType')
  data:[65017,4032,3458,2600,2355]   // DAY · WK Area · WK DNS · SK Area · SK DNS

// Canale di vendita
new Chart(document.getElementById('cChannels')
  data:[56003,11201,5069]   // Büro/Uffici · Online · Loipe
```

Aggiorna anche la leggenda HTML sopra il grafico canali:
```html
<span>Büro 77%</span><span>Online 15%</span><span>Loipe 7%</span>
```

---

### TAB 1 · Entrate per tipo ticket

```javascript
new Chart(document.getElementById('cRevBar')
  data:[842555,210672,214726,303415,319020]
  // DAY · WK Area · WK DNS · SK Area · SK DNS  (valori in €)
```

---

### TAB 1 · Insights strategici

Aggiorna manualmente i 6 blocchi `.ins-card` con i nuovi insight narrativi. Controlla soprattutto:
- Numeri DNS SK (record o meno)
- % DAY sul totale
- Confronto vs anno base 2022-23

---

### TAB 2 · Serie storica (Jahresvergleich)

Aggiorna le variabili base:

```javascript
const qty={
  day:[66242,71264,74038,65017],   // 4 stagioni: 2022-23 → ultima
  wka:[4371,4716,4448,4032],
  ska:[2422,1974,3597,2600],
  wkd:[1759,3693,4003,3458],
  skd:[1801,2139,1927,2355]
};
```

Aggiorna anche i grafici entrate:

```javascript
new Chart(document.getElementById('cRevYear')
  data:[1572292,1767774,2051327,1890388]   // entrate totali 4 stagioni

new Chart(document.getElementById('cStackedRev')
  // 5 dataset (DAY/WKA/SKA/WKD/SKD), ciascuno con 4 valori per stagione
```

Aggiorna la **tabella delta** nella sezione `<table class="dtable">` (valori Δ menge e Δ entrate vs stagione base).

Aggiorna i **prezzi medi** nella `<table class="ptable">`:
```html
<tr><td>DAY</td><td>€ 12,96</td></tr>
<tr><td>DNS SK</td><td>€ 135,46</td></tr>
```

---

### TAB 2 · KPI headline

```html
<div class="mv">2.355</div>     <!-- DNS SK record -->
<div class="mv">+97%</div>      <!-- crescita DNS WK vs base -->
<div class="mv">+20,2%</div>    <!-- Umsatz 4 anni -->
<div class="mv">2024-25</div>   <!-- stagione record -->
```

---

### TAB 3 · Performance Regioni

Aggiorna i 5 array di quantità per regione:

```javascript
const dayQ=[3528,10888,23329,6205,7277,12279,921,590];
const wkaQ=[186,504,1231,561,225,1309,15,1];
const wkdQ=[360,624,2162,233,45,1,24,9];
const skaQ=[96,248,477,1474,172,79,30,24];
const skdQ=[362,320,809,458,185,34,84,51];
const totQ=[4538,12586,28023,8931,7904,13710,1085,685];
```

Aggiorna i 5 array di entrate per regione:

```javascript
const dayR=[42336,165356,334802,72995,87324,122790,11052,5900];
const wkaR=[...], wkdR=[...], skaR=[...], skdR=[...];
const totR=[134868,302512,702623,352673,147409,206245,27780,15123];
```

Aggiorna anche la **heatmap** (array `hmData`):

```javascript
const hmData=[
  ['Antholzertal/OK Biathlon', 3528, 186, 360, 96,  362, 134868],
  ['Gsiesertal',               10888, 504, 624, 248, 320, 302512],
  // ... una riga per regione: nome, DAY, WKA, WKD, SKA, SKD, entrate totali
];
```

---

### TAB 4 · Network Reliability (KP Index)

Aggiorna l'array `kpRegioni` con i dati della nuova stagione:

```javascript
const kpRegioni=[
  {r:'Antholzertal', pot:45,
    tot1:23.2, ks1:23.2, pct1:...,   // milestone 23.12
    tot2:24.3, ks2:24.3, pct2:...,   // milestone 06.01
    tot3:35.9, ks3:33.5, pct3:...,   // milestone 20.01
    kp:Math.min(100, 33.5/45*100),   // KP = ks3 / pot (max 100%)
    note:'...'},
  // ... una voce per regione
];
```

**Campi da aggiornare per ogni regione:**
- `tot1/2/3` = km totali aperti (KS + NS) alle 3 milestone
- `ks1/2/3` = km KS aperti alle 3 milestone
- `kp` = formula automatica: `Math.min(100, ks3/pot*100)`

Aggiorna anche i **KPI headline** della tab (valori in HTML):
```html
<div class="mv">52,3%</div>    <!-- % rete aperta al 20.01 -->
<div class="mv">54,0%</div>    <!-- % KS sul totale aperto -->
<div class="mv">30,0%</div>    <!-- % rete aperta al 23.12 -->
```

Aggiorna l'array `kpPartner` (16 partner individuali) con gli stessi dati a livello operativo.

---

## FILE 2 — DNS FAIR Model (`fair-model.html`)

### Dati input stagione corrente

Aggiorna l'array `DEF` con i dati della nuova stagione:

```javascript
const DEF = [
  {name:"Osttirol",                        PN:800690,  SW:691,  KP:24, SA:11},
  {name:"3 Zinnen Dolomites",              PN:964968,  SW:2971, KP:27, SA:51},
  {name:"Cortina d'Ampezzo",               PN:362135,  SW:60,   KP:0,  SA:5 },
  {name:"Comelico",                        PN:34514,   SW:108,  KP:29, SA:5 },
  {name:"Gsiesertal / Welsberg / Taisten", PN:194461,  SW:944,  KP:85, SA:11},
  {name:"Antholzertal",                    PN:188788,  SW:722,  KP:79, SA:9 },
  {name:"Ahrntal / Sand in Taufers",       PN:678847,  SW:230,  KP:9,  SA:10},
  {name:"Seiser Alm / Val Gardena",        PN:2426065, SW:35,   KP:3,  SA:9 },
];
```

**Fonti per ogni campo:**
- `PN` = pernottamenti invernali (fonte: ASTAT / IDM / dati regionali)
- `SW` = DNS SK + DNS WK venduti (fonte: tab Analytics → array `skdQ + wkdQ` per regione)
- `KP` = indice neve artificiale in % (fonte: tab Network Reliability → campo `kp`)
- `SA` = strutture associate (fonte: censimento DNS)

---

### Quote anno precedente (riferimento per Δ)

Aggiorna l'array `PREV` con le quote **fatturate nell'anno in corso** (che diventano il confronto per il prossimo):

```javascript
const PREV = [12344, 21447, 11261, 9185, 13162, 12383, 11291, 13925];
// Ordine: Osttirol · 3 Zinnen · Cortina · Comelico · Gsiesertal · Antholzertal · Ahrntal · Seiser Alm
```

---

### Parametri fissi (non cambiare salvo delibera Vorstand)

```javascript
const VF  = 45000;   // Variable Fee totale
const FF  = 7500;    // Fixed Fee per partner
const BF  = 1500;    // Base Fee minima garantita
const N   = 8;       // numero partner
```

Pesi FAIR (non cambiare):
```javascript
const WW = {PN:15, SW:55, KP:20, SA:10};
```

---

## Checklist annuale

| # | Azione | File | Fonte dati |
|---|--------|------|-----------|
| 1 | Aggiorna KPI headline (ticket, entrate, prezzo medio) | Analytics tab 1 | Report vendite |
| 2 | Aggiorna dati per regione (quantità + entrate) | Analytics tab 1+3 | Report vendite |
| 3 | Scorrimento serie storica (4 stagioni) | Analytics tab 2 | Report vendite |
| 4 | Aggiorna prezzi medi e tabella delta | Analytics tab 2 | Report vendite |
| 5 | Aggiorna dati KP (3 milestone per regione) | Analytics tab 4 | Rilevazione neve |
| 6 | Aggiorna `DEF` (PN, SW, KP, SA) | FAIR Model | Fonti miste |
| 7 | Aggiorna `PREV` (quote anno corrente) | FAIR Model | Fatturazione DNS |
| 8 | Commit su GitHub | entrambi | — |
| 9 | Verifica rendering su browser | entrambi | — |

---

*Dolomiti NordicSki · Guida interna aggiornamento dati · Versione giugno 2026*
