# R7 Fortune Instruction Execution Status

Last updated: 2026-07-06

## Completed In This Pass

### 1. Existing Function Inventory

Created:

- `docs/r7-existing-function-inventory.md`

The inventory covers current routes, public pages, report pages, payment shell, profile center, admin page, idol system, tarot system, Ziwei system, and preserved pricing state.

### 2. Privacy Notice On Birth Forms

Added reusable component:

- `src/components/PrivacyNotice.tsx`

Integrated into:

- `src/sections/DestinySection.tsx`
- `src/pages/IdolMatchPage.tsx`
- `src/pages/IdolCompatibilityPage.tsx`
- `src/pages/ArtistCompatibilityPage.tsx`
- `src/pages/Profile.tsx`

Required copy is included in English and Traditional Chinese.

### 3. Privacy Policy Page

Added:

- `src/pages/PrivacyPolicy.tsx`

Route added:

- `/#/privacy-policy`

### 4. User Data Export / Local Data Clearing

Updated:

- `src/pages/Profile.tsx`

Profile settings now include:

- Export local user data
- Clear local saved data
- Privacy policy link

Export/clear now includes the real local keys used by the app:

- Birth profile
- Reports
- Ziwei report caches
- Payment orders
- Membership state
- Pending payment state
- Report unlock state
- Unlock signatures
- Share points and referrals
- Chart archive
- Privacy preferences
- Avatar
- Locale/theme

### 5. Payment Architecture Documentation

Added:

- `docs/r7-payment-architecture-plan.md`

This documents current Coming Soon lock state, current pricing, proposed pricing conflict, provider boundary, and future Stripe integration path.

## Preserved By Design

The following existing systems were intentionally not rewritten:

- Current payment lock and report paywall behavior
- Existing CNY/USD prices in `src/lib/pricing.ts`
- Existing manual/Creem payment shell
- Existing Ziwei engine and report pages
- Existing tarot draw logic and card assets
- Existing idol matching UI and data structures
- Existing route structure and HashRouter behavior

## Not Yet Implemented

These require a backend account/database/provider decision before production-grade implementation:

- Real email/password account backend
- Google / Apple / WeChat OAuth
- Server-side AES-256 birth data encryption
- Stripe production checkout and webhook
- Email sending of paid PDF reports
- Database-backed order export
- Full 100+ idol verified database refresh from Naver/official sources
- `/idol/:slug` SEO static/public landing pages

## Build Verification

Command:

```bash
npm run build
```

Result:

- Passed
- Existing non-blocking warnings:
  - Browserslist data is outdated
  - Large JavaScript chunk warning
