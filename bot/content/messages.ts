/* R7 Wellness Bot — User-facing messages
   Uses Telegram HTML parse mode (simpler than MarkdownV2).
   Psychology-framed. ZERO divination vocabulary. */

export const M = {
  welcome: (name: string) =>
    `<b>Welcome to R7 Wellness, ${name}</b>\n\n` +
    `Private, mobile-first personality insight for self-discovery and emotional clarity.\n\n` +
    `No app download. No public profile. Just a quiet chat space for understanding your patterns.\n\n` +
    `<b>What would you like to explore today?</b>`,

  menu: {
    selfDiscovery: "\u{1F9ED} Personality Blueprint",
    relationship: "\u{1F91D} Relationship Dynamics",
    chat: "\u{1F4AC} Wellness Chat",
  },

  sd: {
    askName: "What should I call you?\n\n<i>(used only in your report — your data is never stored)</i>",
    askBirthDate: "When were you born?\n\nFormat: <b>YYYY-MM-DD</b>\n(e.g. 1995-03-21)",
    askBirthTime: "What time were you born?\n\nFormat: <b>HH:MM</b> (24h)\nOr type <b>skip</b> if you don't know",
    askBirthPlace: "Where were you born?\n\nCity and country\n(e.g. Dubai, UAE or London, UK)",
    generating: "<b>Generating your Personality Pattern Blueprint...</b>\n\nThis takes about 30 seconds. Please wait.",
    upsell: (preview: string) =>
      `<b>Your Personality Blueprint — Preview</b>\n\n${preview}\n\n...\n\n` +
      `<b>Unlock the full 4-section report for $9.99</b>\n\n` +
      `Career Orientation & Talents\n` +
      `Resource Management Style\n` +
      `Relationship Patterns & Attachment\n` +
      `Mind-Body Balance`,
    fullReportSent: "Your complete Personality Blueprint has been sent above.",
  },

  rel: {
    askYourName: "First, what's <b>your</b> name?",
    askYourBirthDate: "Your birth date?\n\nFormat: <b>YYYY-MM-DD</b>",
    askYourBirthTime: "Your birth time?\n\nFormat: <b>HH:MM</b> or <b>skip</b>",
    askYourBirthPlace: "Your birth city & country?",
    askPartnerName: "What's your <b>partner's</b> name?",
    askPartnerBirthDate: "Partner's birth date?\n\nFormat: <b>YYYY-MM-DD</b>",
    askPartnerBirthTime: "Partner's birth time? (or <b>skip</b>)",
    askPartnerBirthPlace: "Partner's birth city & country?",
    generating: "<b>Analyzing your relationship dynamics...</b>\n\nThis takes about 30 seconds.",
    upsell: (preview: string) =>
      `<b>Relationship Dynamics — Preview</b>\n\n${preview}\n\n...\n\n` +
      `<b>Unlock the full 5-section report for $14.99</b>\n\n` +
      `Connection Dynamics\n` +
      `Communication Patterns\n` +
      `Growth Edges & Challenges\n` +
      `Relationship Depth Assessment\n` +
      `Relationship Growth Path`,
    fullReportSent: "Your complete Relationship Dynamics report has been sent above.",
  },

  chat: {
    intro:
      "<b>Wellness Chat</b>\n\n" +
      "Share whatever is on your mind. I'm here to listen and help you explore your patterns with care and curiosity.\n\n" +
      "Your first <b>5 messages are free</b>. After that, you can subscribe for unlimited chat.\n\n" +
      "What would you like to talk about?",
    freeUsed: (used: number, limit: number) =>
      `<b>${used}/${limit} free messages used</b>\n\n` +
      `Subscribe for unlimited wellness chat: <b>$4.99/month</b>`,
    thinking: "...",
  },

  payment: {
    unlockButton: (price: string) => `Unlock Full Report (${price})`,
    payButton: (provider: string, price: string) => `Pay with ${provider} (${price})`,
    paidButton: "I have paid - unlock",
    subscribeButton: "Subscribe Now",
    processing: "Preparing your secure payment link...",
    checkoutInstructions: (provider: string, manual: boolean) =>
      manual
        ? `<b>Pay with ${provider}</b>\n\nOpen the payment link below. After payment, tap <b>I have paid - unlock</b> to receive your full report instantly.\n\nFor this early access version, please keep your receipt in case support needs to confirm it.`
        : `<b>Pay with ${provider}</b>\n\nOpen the payment link below. Your report will unlock automatically after checkout.`,
    success: "<b>Access confirmed.</b> Your report has been unlocked.",
    cancelled: "No worries! You can unlock anytime when you're ready.",
    error: "Something went wrong with payment. Please try again or contact support.",
  },

  back: "Back to menu",
  privacy: "<b>Your data is never stored or shared.</b> This is an anonymous service.",
  disclaimer:
    "<b>Disclaimer:</b> This service is for self-reflection and personal growth only. " +
    "It is not a substitute for professional mental health diagnosis or treatment. " +
    "If you're in crisis, please contact a licensed professional.",
};
