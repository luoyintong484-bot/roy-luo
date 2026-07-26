# R7 Fortune Payment Architecture Plan

Last updated: 2026-07-06

## Current Production Stance

The site is currently in **Coming Soon** mode for all paid features.

- Global lock: `PAYMENT_COMING_SOON` in `src/const.ts`
- Unified paywall entry: `src/lib/payment-service.ts`
- Manual / provider payment shell: `src/pages/PaymentPage.tsx`
- Payment success callback shell: `src/pages/PaymentSuccessPage.tsx`
- Local order and membership records: `src/lib/payment.ts`

This means users can browse free public content and generate free previews, but paid checkout, report unlocks, and membership benefits are blocked before an order is created.

## Existing Payment Records

Local-only records used for preview/testing:

- Orders: `r7_orders`
- Membership: `r7_sub_state`
- Pending provider payment: `r7_pending_payment`
- Pending report unlock: `r7_pending_report`
- Manual QR order: `r7_manual_payment_order`
- Unlocked reports: `r7_unlocked_reports`
- Unlock signatures: `r7_unlock_sig_*`

Profile data export now includes all of the above keys so test orders, unlocks, and membership state are not lost during local backup.

## Existing Pricing Snapshot

Existing pricing is defined in `src/lib/pricing.ts`.

Current CNY prices:

- Tarot: ¥29.90
- Ziwei Tarot: ¥39.90
- Natal / personal Ziwei report: ¥79
- Synastry report: ¥109
- CP report: ¥69.90

Current USD fallback prices:

- Tarot: $4.99
- Ziwei Tarot: $5.99
- Natal / personal report: $10.99
- Synastry report: $15.99
- CP report: $9.99

The execution instruction proposes:

- Birth Chart: $19.99 / ¥99
- Synastry: $29.99 / ¥159

Because the same instruction also requires preserving existing content, pricing, and payment logic, this implementation **does not overwrite current prices**. The proposed prices should be switched only after owner approval.

## Target Paid Model

The intended long-term model has three layers:

1. Free layer
   - Free draw / free chart generation
   - Basic preview report
   - Public share cards

2. Stardust points
   - Share/referral rewards already exist in `src/lib/share-points.ts`
   - Future work: unify points with report unlock discounts

3. Fixed-price reports
   - Personal birth chart report
   - Synastry report
   - CP / idol report
   - Ziwei Tarot deep interpretation

## Stripe Integration Boundary

Stripe is not currently installed or configured. Do not place Stripe secret keys in frontend code.

Recommended implementation path:

1. Add backend environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_NATAL`
   - `STRIPE_PRICE_SYNASTRY`

2. Add backend routes:
   - `POST /api/stripe/create-checkout-session`
   - `POST /api/stripe/webhook`

3. Keep frontend entry unchanged:
   - `src/lib/payment-service.ts` calls one provider adapter
   - Provider adapter returns `{ url, sessionId }`

4. On webhook success:
   - Verify signature
   - Mark order paid
   - Unlock report key
   - Persist order to database
   - Send receipt/report email if configured

## Current Safe Next Step

Keep all payment UI in Coming Soon mode until the production provider account is ready. When ready, switch by replacing the provider adapter behind `initiatePayment()` rather than editing every paywall.
