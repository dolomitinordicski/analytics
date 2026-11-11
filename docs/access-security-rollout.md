# Analytics access security: staging checklist

This branch implements **an interim entry gate**, not full data confidentiality.

## Implemented
- Direct GitHub Pages entry is held at the DNS Identity gate until authentication and access checks finish.
- Google Sign-In is supported alongside the pre-existing email/password flow.
- The legacy dashboard's *whole-network* dataset is accessible only to DNS Admin or active network users carrying both `ticketSales.read` and `kp.read` network grants.
- No access is given to reporting-area-only grants because legacy content is not area-scoped.
- Failed identity/grant fetches deny dashboard entry; `App` is dynamically imported only when authorized.

## Must be completed BEFORE any claim of confidentiality or production security
1. `src/data/analyticsData.ts` is still bundled into public JS assets by the legacy Analytics build. Anyone can request those files directly without logging in. Migrate confidential compatibility/baseline sources into server-enforced storage, and replace the public frontend source with a publication-approved aggregate DTO.
2. Public `analyticsAuditSnapshots` reads in shared-data Firestore rules must be reviewed for exposed sensitive data and tightened if required.
3. Internal Analytics must move to a secure API/Firestore design where network vs reporting-area scopes are checked **server side** for every query; a client-side grant check does not replace Firestore security rules.
4. Reconcile the legacy `LiveSourcePanel` email login with Workspace's shared Identity UX without changing historical parity data.
5. Verify static HTML, JS chunks, source maps, browser network panel and public URLs cannot disclose confidential data; public GitHub source itself also exposes bundled literals until they are removed from commit history/visibility.
6. Emulator tests: unauthenticated, inactive, admin, two organizations/AT scopes, revoked membership, direct URL and embed; verify denied cross-area reads and exports.
7. Build/test the branch, preserve golden parity, bilingual and reference-source checks.
8. Once safe, provide a distinct public/partner dashboard consuming only published `analyticsPublicSnapshots`, with publication approval and independently scoped bundles.

**No merge/deploy of this partial gate as a complete security fix.** Deployment needs explicit authorization.
