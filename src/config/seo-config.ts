/**
 * ============================================================
 *  SEO & META CONFIGURATION
 *  ------------------------------------------------------------
 *  All SEO, OpenGraph (OG), Twitter Card, Canonical URL, and
 *  JSON-LD Structured Data configurations live here.
 *
 *  Every setting has an `enabled` toggle so it can be enabled or
 *  disabled dynamically without removing the content.
 * ============================================================
 */



/* ──────────────────────────────────────────────────────────────
   1 · GLOBAL SEO DEFAULTS
   ────────────────────────────────────────────────────────────── */

export const SEO_GLOBAL = {
  enabled: true,
  siteName: "Maha Auto Mela 2026",
  titleTemplate: "%s | Maha Auto Mela 2026",
  defaultTitle: "Maha Auto Mela 2026 | 2–4 October · NTR Stadium, Hyderabad",
  defaultDescription:
    "Maha Auto Mela 2026 — South Asia's flagship automotive exhibition. 2–4 October 2026 at NTR Stadium, Hyderabad (NTR Stadium, Hyderabad). Unveiling future EVs, concepts, launches and mobility innovations.",
  defaultKeywords:
    "Maha Auto Mela 2026, NTR Stadium, Hyderabad, Electric Vehicles India, EV Expo 2026, Automotive Exhibition India, Concept Cars Unveiling, Future Mobility Summit, Car Launches 2026",
  author: "Maha Auto Mela Organising Committee",
  publisher: "D2FM",
  themeColor: "#270585",
  faviconUrl: "/favicon.ico",
  baseUrl: "https://mahaautomela.com",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

/* ──────────────────────────────────────────────────────────────
   2 · OPEN GRAPH (FB, LINKEDIN, WHATSAPP PREVIEWS)
   ────────────────────────────────────────────────────────────── */

export const OPEN_GRAPH = {
  enabled: true,
  type: "website",
  locale: "en_IN",
  siteName: SEO_GLOBAL.siteName,
  defaultImage: "https://mahaautomela.com/images/hero.jpg",
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: "Maha Auto Mela 2026 Flagship Showcase at NTR Stadium, Hyderabad",
};

/* ──────────────────────────────────────────────────────────────
   3 · TWITTER CARDS
   ────────────────────────────────────────────────────────────── */

export const TWITTER_CARD = {
  enabled: true,
  cardType: "summary_large_image",
  siteHandle: "@mahaautomela",
  creatorHandle: "@mahaautomela",
  defaultImage: "https://mahaautomela.com/images/hero.jpg",
};

/* ──────────────────────────────────────────────────────────────
   4 · PAGE-SPECIFIC META CONFIGURATIONS
   ────────────────────────────────────────────────────────────── */

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const PAGE_SEO: Record<string, PageSeoConfig> = {
  home: {
    title: "Maha Auto Mela 2026 | 2–4 October · NTR Stadium, Hyderabad",
    description:
      "Witness South Asia's premier automotive event. 500+ exhibitors, 50+ global launches, EV zone, vintage pavilion and live drift arena at NTR Stadium, Hyderabad.",
    keywords:
      "Maha Auto Mela 2026, Auto Expo India, NTR Stadium, Hyderabad Exhibition, EV Showcase, Car Launch 2026, Test Drive Track, B2B Auto Summit",
    path: "/",
    ogImage: "https://mahaautomela.com/images/hero.jpg",
  },
  about: {
    title: "About Us | Maha Auto Mela 2026",
    description:
      "Discover the story behind 8 editions of Maha Auto Mela. Our mission, vision, 4-day itinerary, and supporting government & industry partners.",
    keywords:
      "About Maha Auto Mela, Hyderabad Automobile History, NTR Stadium, Hyderabad Event Venue, Automotive Leaders India, EV Startups Hyderabad",
    path: "/about",
    ogImage: "https://mahaautomela.com/images/expo-floor.jpg",
  },
  exhibitors: {
    title: "Exhibit With Us | Stall Registration — Maha Auto Mela 2026",
    description:
      "Reserve your booth at South Asia's largest automotive showcase. Shell scheme and premium spaces available across 80,000+ sq.m. at NTR Stadium, Hyderabad.",
    keywords:
      "Book Stall Auto Expo, Exhibitor Registration, Automobile Booth Booking, Shell Scheme Pricing, NTR Stadium, Hyderabad Stall Reservation",
    path: "/exhibitors",
    ogImage: "https://mahaautomela.com/images/ev-showcase.jpg",
  },
  floorPlan: {
    title: "Interactive Floor Plan & Booth Availability | Maha Auto Mela 2026",
    description: "Explore the interactive Maha Auto Mela 2026 floor plan, compare booth sizes and availability, and register your interest directly with the exhibitor team.",
    keywords: "Auto Expo Floor Plan, NTR Stadium, Hyderabad Booth Availability, Exhibition Stall Booking, Maha Auto Mela Booths",
    path: "/floor-plan",
    ogImage: "https://mahaautomela.com/images/expo-floor.jpg",
  },
  opportunities: {
    title: "Partnership & Sponsorship Opportunities | Maha Auto Mela 2026",
    description:
      "Elevate your brand at India's leading automotive event. Title, Platinum, Gold, and Silver sponsorship packages available.",
    keywords:
      "Auto Expo Sponsorship, Mobility Partnerships, B2B Lead Generation, Automotive Media Coverage, Title Sponsor Package",
    path: "/opportunities",
    ogImage: "https://mahaautomela.com/images/future-mobility.jpg",
  },
  contact: {
    title: "Contact Us & Directions | Maha Auto Mela 2026",
    description:
      "Get in touch with the organiser team. Venue directions to NTR Stadium, Hyderabad Tumakuru Road, enquiry form, phone numbers, and support email.",
    keywords:
      "NTR Stadium, Hyderabad Address, Auto Expo Contact Number, Maha Auto Mela Venue Map, Exhibitor Helpdesk, Visitor Query Email",
    path: "/contact",
    ogImage: "https://mahaautomela.com/images/venue.jpg",
  },
  visitorPass: {
    title: "Get Free Visitor Pass | Maha Auto Mela 2026",
    description:
      "Register online to generate your official Visitor Pass with unique QR code. Instant image & PDF download.",
    keywords:
      "Free Visitor Pass, Auto Expo Tickets, Online Visitor Registration, QR Entry Pass, NTR Stadium, Hyderabad Entry Pass 2026",
    path: "/visitor-pass",
    ogImage: "https://mahaautomela.com/images/expo-floor.jpg",
  },
  privacyPolicy: {
    title: "Privacy Policy | Maha Auto Mela 2026",
    description:
      "Read our Privacy Policy explaining how we collect, store, and protect visitor and exhibitor information.",
    keywords: "Privacy Policy, Data Protection, User Rights, Cookies Policy",
    path: "/privacy-policy",
  },
  termsConditions: {
    title: "Terms & Conditions | Maha Auto Mela 2026",
    description:
      "Official terms of service and venue entry regulations for Maha Auto Mela 2026.",
    keywords: "Terms and Conditions, Visitor Regulations, Venue Policy",
    path: "/terms-conditions",
  },
  refundPolicy: {
    title: "Refund & Cancellation Policy | Maha Auto Mela 2026",
    description:
      "Transparent refund guidelines for stall bookings, visitor passes, and sponsorship commitments.",
    keywords: "Refund Policy, Ticket Cancellation, Exhibitor Cancellation Rules",
    path: "/refund-policy",
  },
};

/* ──────────────────────────────────────────────────────────────
   5 · STRUCTURED DATA (JSON-LD SCHEMA GENERATOR)
   ────────────────────────────────────────────────────────────── */

export function generateEventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ExhibitionEvent",
    name: SEO_GLOBAL.siteName,
    description: SEO_GLOBAL.defaultDescription,
    startDate: "2026-10-08T10:00:00+05:30",
    endDate: "2026-10-11T19:00:00+05:30",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "NTR Stadium, Hyderabad (NTR Stadium, Hyderabad)",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Indira Park Rd, Lower Tank Bund, Kavadiguda",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        postalCode: "500080",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "13.0614",
        longitude: "77.4746",
      },
    },
    image: [
      "https://mahaautomela.com/images/hero.jpg",
      "https://mahaautomela.com/images/expo-floor.jpg",
      "https://mahaautomela.com/images/venue.jpg",
    ],
    organizer: {
      "@type": "Organization",
      name: "Maha Auto Mela Committee",
      url: SEO_GLOBAL.baseUrl,
      email: "info@mahaautomela.com",
      telephone: "+91-80-4500-8800",
    },
    offers: {
      "@type": "Offer",
      url: `${SEO_GLOBAL.baseUrl}/#/visitor-pass`,
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
    },
  };
}
