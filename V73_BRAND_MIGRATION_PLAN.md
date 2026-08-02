# V73 Public Brand Migration Plan

Status: Planning only. Do not merge, redirect, rename, or deploy without Benjamin's explicit approval.

## Objective

Remove public-facing ties to the former EZTrader name while preserving the existing Google Play update path, legal-page availability, support access, and working website links during the transition.

## Final public identity

- Product: **V73**
- Company: **V73 Technologies LLC**
- Target primary website: **https://v73technologies.com**
- Public support email: **support@v73technologies.com**
- Google Play app name: **V73**

## Legacy technical identifiers

The following may remain temporarily or permanently as non-public technical identifiers when changing them would break existing installations, deployment history, or integrations:

- Android application ID: `com.ben.a.eztrader_app`
- Current GitHub repository owner/name: `mooresvillerental/eztrader-site`
- Current Vercel project name: `eztrader-site`
- Current legacy domain: `geteztrader.com`

These identifiers should not be presented as the product name in normal user-facing content.

## Controlled migration sequence

1. Keep Draft PR #1 unmerged while the brand transition is reviewed.
2. Remove the prominent former-name/non-affiliation disclaimer from the homepage.
3. Use V73-only wording in all visible headings, metadata, buttons, legal pages, and support pages.
4. Standardize public support on `support@v73technologies.com`.
5. Prepare `v73technologies.com` to serve the complete V73 website and legal pages.
6. Verify HTTPS, mobile layout, Google Play links, support links, Privacy, Terms, and Data Deletion on the new domain.
7. Update Google Play public URLs only after the new domain is fully verified.
8. Keep `geteztrader.com` active during the transition so existing links do not break.
9. Convert `geteztrader.com` to a permanent redirect only after Play, app, support, and legal references use the V73 domain.
10. Consider renaming or transferring GitHub/Vercel resources later as a separate infrastructure project.

## Do not do during Phase 1

- Do not change the Android application ID.
- Do not create a second Google Play listing.
- Do not break existing legal or support URLs.
- Do not remove the legacy domain before redirects and Play links are verified.
- Do not transfer repositories or Vercel projects during a website content deployment.
- Do not change app trading logic, alerts, confidence, sizing, exits, portfolios, or watched intelligence behavior.

## Approval gates

Benjamin must separately approve:

1. Revised preview wording and layout.
2. Primary-domain cutover to `v73technologies.com`.
3. Google Play URL changes.
4. Legacy-domain redirect.
5. Any GitHub organization, repository rename/transfer, or Vercel project rename/transfer.
