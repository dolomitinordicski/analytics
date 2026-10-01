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
