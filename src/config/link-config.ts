/**
 * ============================================================
 *  LINK CONFIGURATION — EXTERNAL INTEGRATIONS
 *  ------------------------------------------------------------
 *  Every external service, API, sheet, and integration toggle
 *  lives here. Each setting has an `enabled` boolean.
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────────
   1 · SITE DATA SHEET (GOOGLE SHEETS CMS)
   ──────────────────────────────────────────────────────────────
   This is the MASTER sheet that provides all dynamic content
   for the site (Highlights, Sectors, Sponsors, FAQs, etc.).
   It does NOT handle form submissions — those use FORM_URLS below.
   ────────────────────────────────────────────────────────────── */

export const SHEETS = {
  /** Set to true to fetch site content from the Google Sheet. */
  enabled:        true,
  /** The Site Data Sheet ID from the Google Sheet URL. */
  spreadsheetId:  "1HKkBXKKT8PBj1ch5W6D17upo2742l3EwFHI0ezZIBKk",
  /** Cache fetched data in the browser (minutes). */
  cacheMinutes:   10,
  /** Control columns used in every tab for show/hide and ordering. */
  controlColumns: { status: "Status", order: "Order" },
};

export const GOOGLE_SHEETS = SHEETS;

/* ──────────────────────────────────────────────────────────────
   2 · EMAIL SERVICE (e.g. EmailJS)
   ────────────────────────────────────────────────────────────── */

export const EMAIL_SERVICE = {
  enabled:           false,
  provider:          "emailjs",
  publicApiKey:      "",
  serviceId:         "",
  exhibitorTemplate: "",
  visitorTemplate:   "",
  contactTemplate:   "",
};

/* ──────────────────────────────────────────────────────────────
   3B · VISITOR PASS ATTACHMENT SETTINGS
   ──────────────────────────────────────────────────────────────
   Controls whether pass files are sent via email as attachments.
   The pass image is always embedded inline in the email body for
   immediate display. These toggles control the downloadable file
   attachments that accompany the email.
   ────────────────────────────────────────────────────────────── */

export const VISITOR_PASS_ATTACHMENTS = {
  /** Send the PNG image file as an email attachment */
  attachImage: false,
  /** Send the print-ready 3in×4in PDF file as an email attachment */
  attachPdf:   false,
};

/* ──────────────────────────────────────────────────────────────
   3C · EXHIBITOR BROCHURE ATTACHMENT SETTING
   ──────────────────────────────────────────────────────────────
   Controls whether the Event Brochure PDF is attached to the
   Exhibitor Welcome email. The brochure download link button
   is always shown in the email body regardless of this setting.
   ────────────────────────────────────────────────────────────── */

export const EXHIBITOR_BROCHURE = {
  /** Attach the event brochure PDF to the exhibitor welcome email */
  attachFile: false,
};

/* ──────────────────────────────────────────────────────────────
   5 · WHATSAPP CHAT WIDGET
   ────────────────────────────────────────────────────────────── */

export const WHATSAPP_CHAT = {
  enabled:            true,
  phoneNumber:        "+917799270585",
  prefillMessage:     "Hi! I'm interested in the Maha Auto Mela 2026. Can you help me?",
  autoOpenAfterSecs:  4,
  autoCloseAfterSecs: 10,
};

/* ──────────────────────────────────────────────────────────────
   6 · ANALYTICS & TRACKING
   ────────────────────────────────────────────────────────────── */

export const ANALYTICS = {
  enabled:      false,
  googleTagId:  "",
  facebookPixel:"",
  hotjarId:     "",
};

/* ──────────────────────────────────────────────────────────────
   7 · MAPS & GEOLOCATION
   ────────────────────────────────────────────────────────────── */

export const MAPS = {
  enabled: true,
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=NTR%20Stadium%20Hyderabad&t=&z=14&ie=UTF8&iwloc=&output=embed",
  googleMapsDirectionsUrl:
    "https://maps.google.com/?q=NTR+Stadium+Hyderabad",
};

/* ──────────────────────────────────────────────────────────────
   8 · SOCIAL / OAUTH
   ────────────────────────────────────────────────────────────── */

export const SOCIAL_AUTH = {
  enabled:       false,
  googleClientId:"",
};

/* ──────────────────────────────────────────────────────────────
   9 · CUSTOM APIs
   ────────────────────────────────────────────────────────────── */

export const CUSTOM_API = {
  enabled: false,
  baseUrl: "",
  apiKey:  "",
};

/* ──────────────────────────────────────────────────────────────
   10 · FORM SUBMISSION ENDPOINTS
   ──────────────────────────────────────────────────────────────
   Each form type has its own standalone Apps Script Web App URL.
   Deploy each script from sheet-content/apps-script/ as a separate
   Web App, then paste the URLs below.
   ────────────────────────────────────────────────────────────── */

export const FORM_URLS = {
  /** Exhibitor Registration → sheet-content/apps-script/exhibitor-submissions.gs */
  exhibitor: "https://script.google.com/macros/s/AKfycbyUkvFzLpMt_N5B-dBzIypofOzk4CcWLoYWlzqMJNo9QnweLmiernk27QFi0N9v0bFC/exec",
  /** Visitor Pass Registration → sheet-content/apps-script/visitor-submissions.gs */
  visitor:   "https://script.google.com/macros/s/AKfycbwua1pCt_CkmDqvvLqibIjRSp17EPHsQ0nochLFEKU3nfNgMiAtVAX6cN3qOQGbG3QVFA/exec",
  /** General Enquiry (Home + Contact pages) → sheet-content/apps-script/general-enquiries.gs */
  contact:   "https://script.google.com/macros/s/AKfycbxB48G5J7Fp7UOkp3lyYl5uboisOAWA1nPCXpat9vL9Kp7R-wP37dYi-se2lmFlbkEB7A/exec",
};

/* ──────────────────────────────────────────────────────────────
   10B · FLOOR PLAN DATA SHEET
   ──────────────────────────────────────────────────────────────
   The Floor Plan sheet supplies stall/booth details for the
   interactive information panel. Keep it separate from the
   general Site Data Sheet so the sales team can update availability.
   ────────────────────────────────────────────────────────────── */
export const FLOOR_PLAN_SHEET = {
  enabled: true,
  spreadsheetId: "1hn3340Wx3E1SgaBCjmbd-TsEcrmLhR6NYc2dLjAeKyQ",
  tabs: {
    "Floor Plan 1": "Floor Plan 1",
    "Floor Plan 2": "Floor Plan 2",
  },
};

/* ──────────────────────────────────────────────────────────────
   11 · GOOGLE SHEETS TAB DEFINITIONS (SITE DATA SHEET MAPPING)
   ──────────────────────────────────────────────────────────────
   Maps human-readable sheet headers to internal field keys.
   These tabs belong to the Site Data Sheet (SHEETS.spreadsheetId).
   ────────────────────────────────────────────────────────────── */

export interface TabMapping {
  tab: string;
  fields: Record<string, string>;
  iconField?: string;
}

export const SHEET_TABS = {
  highlights: { tab: "Highlights", iconField: "icon", fields: { Icon: "icon", "Custom Icon URL": "customIcon", Title: "title", Description: "desc" } } as TabMapping,
  sectors: { tab: "Sectors", iconField: "icon", fields: { Icon: "icon", "Custom Icon URL": "customIcon", Title: "title", Description: "desc" } } as TabMapping,
  industryStats: { tab: "Industry Stats", fields: { Value: "value", Label: "label", Subtext: "sub" } } as TabMapping,
  facts: { tab: "Facts", iconField: "icon", fields: { Icon: "icon", "Custom Icon URL": "customIcon", Title: "title", Description: "desc" } } as TabMapping,
  sponsors: { tab: "Sponsors", fields: { Category: "category", "Category Icon": "categoryIcon", "Category Color": "categoryColor", Name: "name", "Full Name": "full", Role: "role", "Logo URL": "logo", "Custom Icon URL": "customIcon", Website: "website" } } as TabMapping,
  testimonials: { tab: "Testimonials", fields: { Quote: "quote", Name: "name", Role: "role", Initials: "initials", "Photo URL": "photo" } } as TabMapping,
  timeline: { tab: "Timeline", fields: { Day: "day", Title: "title", Description: "desc" } } as TabMapping,
  boothPlans: { tab: "Booth Plans", fields: { Name: "name", Price: "price", Unit: "unit", Tagline: "tagline", Features: "features", Featured: "featured" } } as TabMapping,
  opportunityPoints: { tab: "Opportunity Points", fields: { Title: "title", Description: "desc" } } as TabMapping,
  sponsorshipPlans: { tab: "Sponsorship Plans", fields: { Name: "name", "Accent Gradient": "accent", Featured: "featured", Perks: "perks" } } as TabMapping,
  partners: { tab: "Partners", iconField: "categoryIcon", fields: { Category: "category", "Category Icon": "categoryIcon", "Category Blurb": "categoryBlurb", "Category Color": "categoryColor", "Short Name": "name", "Full Name": "full", Role: "role", "Logo URL": "logo" } } as TabMapping,
  clients: { tab: "Clients", fields: { Category: "category", Name: "name", "Full Name": "full", "Logo URL": "logo", "Custom Icon URL": "customIcon", Website: "website" } } as TabMapping,
  faqs: { tab: "FAQs", fields: { Question: "q", Answer: "a" } } as TabMapping,
  exhibitors: { tab: "Exhibitors", fields: { Category: "category", "Category Icon": "categoryIcon", "Category Blurb": "categoryBlurb", "Category Color": "categoryColor", "Company Name": "name", "Full Name": "full", "Booth Number": "booth", "Logo URL": "logo", "Custom Icon URL": "customIcon" } } as TabMapping,
  whyExhibit: { tab: "Why Exhibit", iconField: "icon", fields: { Icon: "icon", "Custom Icon URL": "customIcon", Title: "title", Description: "desc" } } as TabMapping,
};

export type SheetKey = keyof typeof SHEET_TABS;
