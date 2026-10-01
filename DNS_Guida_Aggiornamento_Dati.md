# DNS Analytics — Guida aggiornamento dati

## Stato architettura

DNS Analytics è ora una app Vite + React + TypeScript + Tailwind v4 allineata alla DNS Foundation.

La struttura dati è separata dalla UI:

- `src/data/analyticsData.ts` = dataset compatibilità A.2.1;
- `src/data/layers.ts` = architettura target `analyticsRaw`, `analyticsAggregates`, `analyticsModels`, `analyticsAssumptions`;
- DNS_Core = master data canonico già connesso;
- A.3 = sostituzione progressiva dei valori locali con fonti operative DNS_Core.

## Moduli Analytics

1. WS 2025-26
2. Jahresvergleich · Confronto annuale
3. Performance Regionen · Regioni
4. Network Reliability
5. Advanced Analytics
6. Übernachtungen · Pernottamenti
7. Langlauf-Intensität · Peso del fondo

I moduli 5–7 provengono dalla distribuzione Analytics estesa e sono stati integrati senza sostituire i moduli originali.

## Aggiornamenti durante A.2.1

Finché A.3 non è completato, i valori compatibilità vanno modificati esclusivamente in:

```text
src/data/analyticsData.ts
```

Non modificare i componenti React per aggiornare un numero.

I colori dei grafici sono intenzionalmente preservati dalla distribuzione Analytics esistente.

## A.3 — fonti canoniche previste

### Ticket sales

Fonte target: `DNS_Core / ticketSales`

Campi già disponibili:
- seasonId
- organizationId
- reportingAreaId
- destinationId
- productCode
- quantity
- pricing
- calculatedAmount

Da aggiungere prima della migrazione completa:
- sales channel / Vertriebskanal, necessario per Büro · Online · Loipe.

### KP / Network Reliability

Fonte target:
- `kpMilestones`
- `kpEntries`
- `kpFairValidations`

### Pernottamenti e modelli

Saranno mappati nei livelli Analytics:
- `analyticsRaw`
- `analyticsAggregates`
- `analyticsModels`
- `analyticsAssumptions`

Gli scenari di Advanced Analytics e Langlauf-Intensität devono mantenere separati fatti osservati e assunzioni di modello.

## Regola

Nessun dato Analytics deve tornare a essere hardcoded nel markup o nei componenti visuali.
