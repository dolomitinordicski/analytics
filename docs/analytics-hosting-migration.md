# Analytics hosting migration — compatibility-first plan

## Current state (do not change during staging)
- DNS Workspace embeds the public GitHub Pages origin, currently served by `/analytics/`.
- The existing internal build contains legacy historical compatibility literals. Firebase authorization and a login UI do not hide those already-public assets.
- Even a private GitHub repository would **not** protect JavaScript assets deployed on publicly accessible Pages/Hosting.
- PR #59 introduces DNS Identity and an isolated Partner candidate, but is **not** proof of confidential internal distribution.
- `.github/workflows/pages.yml` deliberately continues to publish the **current** `dist` artifact on main. This keeps Workspace links working; it does not resolve legacy exposure. The isolated `dist-partner` candidate is built/tested and uploaded as a **PR artifact only**, not deployed.

## Safe staged migration (no production switch in this PR)
1. Inventory all internal Analytics references and embed behavior in Workspace; record the exact current public URL, links and routing before changing anything.
2. Remove financial/partner compatibility literals from the **production** entrypoint by moving protected historical baseline and parity logic behind authenticated, rules-enforced Firebase reads or a protected service. Keep golden zero-loss fixture values only in CI/test-only modules which are never imported into a public production bundle.
3. Check server-side grants for whole-network Admin and each authorized reporting-area/AT scope. Do not expose entire network metrics to a user merely because they have area permissions.
4. Add a CI scan of **all** externally served assets, not only the Partner assets. Gate by a positive content manifest and negative historical fixtures; validate source maps and public fetches.
5. Deploy an internal candidate to a **separate staging host**; any static JS on that host is assumed publicly retrievable. Exercise Google sign-in, direct URL, Workspace embed, inactive accounts, scoped accounts and sign-out.
6. Create and validate approved `analyticsPartnerPublic` DTO through a trusted DNS Admin publication workflow, not browser writes. The external Partner candidate must show no data until published.
7. Only after smoke/parity and rollback checks, change Workspace's Analytics URL through a small separate PR. Keep the previous URL intact until the replacement is proven operational, then choose a safe final publishing layout.
8. Treat previous public source history and historic Pages assets as already exposed, review retention/visibility and invalidate caches as possible.

## Release and rollback
- This PR must stay Draft until the migration and smoke tests are done.
- A URL cutover needs a DNS authorization and a reversible deployment; the existence of a green build is insufficient.
- Roll back Workspace's tool URL and retain its original Pages artifact if login, authorization, visuals, parity or exports regress.
