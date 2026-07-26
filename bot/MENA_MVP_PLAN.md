# R7 Wellness — Middle East MVP Launch Plan

## Positioning

R7 Wellness is a private, mobile-first self-discovery companion for users who want emotional clarity without public exposure, app downloads, or heavy clinical language.

Core product angle:
- Anonymous chat-based experience
- Structured personality insight
- Relationship pattern analysis
- Gentle wellbeing conversation
- Fast digital delivery after payment

Avoid mystical, religious, or future-oriented framing in public copy. Keep the language close to self-reflection, personality patterns, relationship dynamics, and wellbeing.

## Platform Priority

1. Web preview link
   - Fastest for China-based development and testing.
   - Can be shared in Reddit, Instagram bio, TikTok bio, WhatsApp groups, or direct messages.
   - Use this before Telegram registration is solved.

2. Telegram Bot
   - Good fit for private, lightweight chat products.
   - No app download for users who already use Telegram.
   - Supports report delivery, buttons, payment links, and follow-up chat.

3. WhatsApp Business
   - Stronger mainstream reach in many GCC markets.
   - Add after the offer is proven because setup and automation are more work.

4. Instagram / TikTok
   - Use for discovery, not the main product experience.
   - Post short anonymous self-reflection prompts and send users into the Web or Bot flow.

## MVP Payment Setup

Current code is PayPal-first.

Fill one of these options in `bot/.env`:

```env
PAYMENT_PROVIDER=paypal
PAYMENT_CONFIRMATION_MODE=manual

PAYPAL_ME_USERNAME=your_paypal_me_name
```

Or create separate PayPal Payment Links and paste them:

```env
PAYPAL_LINK_SELF_DISCOVERY=https://...
PAYPAL_LINK_RELATIONSHIP=https://...
PAYPAL_LINK_CHAT_MONTHLY=https://...
```

Recommended product links:
- Personality Blueprint — $9.99
- Relationship Dynamics — $14.99
- Wellness Chat Monthly — $4.99/month

Manual confirmation is intentional for the first version:
- User pays through PayPal.
- User taps `I have paid - unlock`.
- Bot delivers the full report immediately.
- Keep receipts for manual checks during early testing.

After the first 10-20 paid users, upgrade to automatic payment verification with PayPal API or Stripe checkout.

## Fastest Monetization Path

1. Keep the free preview short and useful.
2. Sell one clear paid upgrade immediately after the preview.
3. Start with PayPal Payment Links because they require no custom checkout.
4. Share the Web preview first while Telegram registration is unresolved.
5. Collect feedback from 10-20 users before adding Arabic, WhatsApp, or complex account systems.

## Public Copy Direction

Use:
- Private self-discovery
- Personality insight
- Relationship patterns
- Emotional clarity
- Wellbeing chat
- Anonymous, judgment-free, mobile-first

Avoid:
- Future claims
- Religious framing
- Mystical framing
- Medical diagnosis claims
- Overpromising results

## Next Build Steps

1. Fill PayPal links in `.env`.
2. Restart the Web server.
3. Test full report purchase flow locally.
4. Create a public Web preview URL.
5. Use Reddit and short-form social posts to recruit the first 10-20 testers.
