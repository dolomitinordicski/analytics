# DNS Analytics — Legacy HTML Content Audit

Source reviewed: `dns_dashboardf.html` supplied by the user.

Goal: retain the complete informational/editorial content of the legacy dashboard while keeping the current React/Vite architecture, DNS_Core live adapters, FAIR integration, Foundation design system, and the additional Intensity module.

## Parity status

| Legacy page | Current destination | Preserved content |
| --- | --- | --- |
| P1 · WS 2025-26 | Overview | 4 KPIs; regional quantity/revenue; annual comparison; product mix; sales-channel mix; revenue vs quantity interpretation; all 6 strategic insights; bilingual editorial summary |
| P2 · Jahresvergleich | Annual | 4 KPIs; index-100 trends; DNS vs Area; DNS SK/WK series; total tickets; revenue trend/composition; full delta table including percentage deltas; per-product average prices; average-price trend; bilingual editorial summary |
| P3 · Regionen | Regional | 4 legacy regional KPIs; ticket-mix charts; per-product detail; revenue; heatmap; all 6 original regional insights; bilingual editorial summary |
| P4 · Network Reliability | Reliability | KS/NS/KP legend; network opening KPIs; KP chart; KS/NS/unopened composition; 3 milestones; regional KP table; network classification block; Biathlon exclusion; Osttirol provisional caveat; 16-partner detail; methodology/source protocol; bilingual editorial summary |
| P5 · Advanced Analytics | Advanced | Legacy methodology intro; break-even 5.1 days; simulator assumptions; weekly-ticket metrics; South Tyrol vs network scope; €425,398 weekly-ticket revenue bridge; impact ratio; ASTAT spend structure; DAY warning/scenario; all 3 original strategic insights; original assumptions/limits/source note; verified methodology protocol |
| P6 · Übernachtungen | Overnights | Complete 2024-25 9-area legacy baseline; legacy time-series table; source/provisional note; 28.8% Gröden summary; current FAIR 2025-26 view; full ASTAT provincial Dec–Mar context including arrivals, deltas, window totals, season total and March top municipality |
| New module | Intensity | Additional post-refactor analysis retained; it does not replace any legacy page |

## Preservation rule

The original HTML is treated as the content baseline. Current verified source notes may qualify legacy assumptions or historical references, but legacy editorial/context information must not disappear silently.

The automated parity script checks representative source anchors and verifies that the restored content is actually rendered, not merely stored.
