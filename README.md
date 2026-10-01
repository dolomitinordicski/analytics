# DNS Analytics

DNS Analytics is the reporting and analytical application for Dolomiti NordicSki.

## A.2.1 — Foundation refactor

The application is migrated to:

- Vite
- React
- TypeScript
- Tailwind CSS v4 / Vite
- DNS Foundation / Design System v1.13.x
- shared navigation runtime
- Accessibility v1
- shared print runtime
- shared DNS brand assets and regional logo manifest
- shared Data Contract metadata
- Firebase DNS_Core master-data connection

The A.2.1 migration preserves the existing analytical values, graph colors and analytical meaning before changing data sources.

### Preserved modules

The current distribution and the richer alternate dashboard have been merged functionally. The live architecture contains:

1. WS 2025-26 overview
2. Jahresvergleich / annual comparison
3. Performance Regionen / regional performance
4. Network Reliability / KP
5. Advanced Analytics
6. Übernachtungen / overnight stays
7. Langlauf-Intensität / cross-country intensity

The additional modules are not replacements for the original dashboard; they are additive.

## Data layers

The target architecture supports:

- `analyticsRaw`
- `analyticsAggregates`
- `analyticsModels`
- `analyticsAssumptions`
- network, reporting-area, destination and organization scopes

A.2.1 keeps the source values in `src/data/analyticsData.ts` as a controlled compatibility dataset. A.3 will replace those values incrementally with canonical DNS_Core sources.

## Important A.3 data gap

The existing `ticketSales` operational contract contains season, organization, reporting area, destination, product, quantity, pricing and calculated amount, but does not yet expose the sales channel needed for Büro / Online / Loipe analytics. That contract must be extended before the channel chart can become fully DNS_Core-driven.

Chart colors are intentionally preserved from the existing Analytics application.

A.2.1 validation runs through the repository GitHub Pages workflow before merge.


## A.2.3 — architecture consolidation

A.2.3 introduces the canonical analytical boundary without changing the visible calculations:

- canonical metric IDs in `src/data/metrics.ts`
- canonical scope resolution in `src/data/scopes.ts`
- compatibility aggregates, model registry and explicit assumptions in `src/data/architecture.ts`
- DNS_Core / compatibility boundary policy in `src/services/analyticsBoundary.ts`
- `analyticsRaw` remains intentionally empty until operational facts are migrated in A.3
- preserved A.2.1 values remain the source of truth for the live UI during A.2.3

A.3 is explicitly outside this phase: no production analytical fact is switched to a new source in A.2.3.


## A.3 live operational migration

- A.3.1 introduces authenticated DNS_Core reads for ticket sales and KP.
- A.3.2 migrates WS 2025-26 Overview only after full live-vs-compatibility parity.
- A.3.3 migrates Regional Performance only after complete area × product parity.
- A.3.4 migrates area-level Network Reliability / KP only after all 8 reporting areas × 3 milestones × 3 values (potential, opened, artificial-snow km) match the preserved compatibility dataset.
- KP source priority is validation-first: `kpFairValidations` overrides reconstructed area values from included `kpEntries` for the same area/milestone.
- Partner-level KP detail remains explicitly on the A.2.1 compatibility dataset until a separate organization-level parity gate is implemented.


### A.3.5 historical source routing

- Season 2025-26 is read from immutable `historicalSeasonRecords`, not from editable operational collections.
- Historical sales facts feed the same live aggregation/parity pipeline as operational ticket sales.
- Historical KP facts are converted into dated milestone observations and retain original source labels.
- From 2026-27 onward Analytics continues to use operational `ticketSales`, `kpMilestones`, `kpEntries` and `kpFairValidations`.
- Historical source discrepancies are surfaced by parity checks and do not silently overwrite the preserved A.2.1 dashboard.
- KP partner detail is eligible for live historical display only when all 16 partners × 5 checks match the preserved partner table.


### A.3.6 annual historical series

- Annual Comparison resolves 2022-23, 2023-24 and 2024-25 from the immutable 2024-25 `annual-network-comparison` record.
- 2025-26 is derived from its immutable historical sales facts.
- The historical DNS SK series maps `DNS SK incl. Langlauflehrer` to one analytical group; for 2025-26 this means `sk-dns + sk-instructor`.
- Annual switches from A.2.1 only when all 48 checks (4 seasons × totals plus 5 product quantity/revenue pairs) match.
- Historical discrepancies remain visible and do not trigger automatic normalization.

A.3 integration validation runs on pull requests targeting `a3-integration` before any reconciliation with `main`.


### A.3.7 Advanced Analytics observed inputs

- Advanced Analytics now separates observed ticket volumes from model assumptions.
- Observed inputs are DNS weekly tickets, South Tyrol weekly tickets, and DAY tickets from the same verified historical sales source used by Overview/Regional.
- The economic model assumptions remain explicit and user-adjustable: nights per weekly guest, overnight-share assumption, spend per night, multiplier, and DAY overnight-share assumption.
- The module switches observed inputs only after all three source checks match the preserved A.2.1 values.
- Overnight totals are not duplicated into Advanced Analytics. The next overnight/intensity migration will source PN from the FAIR model (fairModel/ws-2026-27 and canonical successors) without changing the FAIR calculation engine.


### A.3.8 Overnights from FAIR

- Overnight PN values for WS 2025-26 are read from DNS FAIR document fairModel/ws-2026-27.
- FAIR remains the canonical source for PN; Analytics reads it without modifying the FAIR calculation engine or persistence behavior.
- The old 9-row destination presentation is normalized to 8 canonical DNS reporting areas. Seiser Alm and Val Gardena are combined because FAIR stores one reporting-area PN and their preserved A.2.1 values reconcile exactly to that area total.
- The FAIR switch is guarded by 8 PN parity checks, one per reporting area.
- The 2024-25 comparison remains the preserved Analytics historical baseline.
- Monthly December–March context remains explicitly compatibility-sourced because FAIR does not provide monthly PN.


### A.3.9 Langlauf intensity

- Intensity inputs are now assembled from DNS_Core sales by reporting area plus PN from DNS FAIR.
- Weekly input = WK Area + WK DNS ticket quantities; DAY input = DAY ticket quantity; PN = FAIR overnight value.
- The source switch is guarded by 24 checks: 8 reporting areas × WK, DAY, and PN.
- Existing model assumptions are preserved explicitly: 75% overnight share and 6 nights for weekly-ticket guests; 45% overnight share for the exploratory DAY scenario.
- No FAIR calculation logic is modified and no new assumptions are introduced.
