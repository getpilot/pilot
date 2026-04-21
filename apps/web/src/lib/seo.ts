import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { pricingPlans } from "@/lib/pricing";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export const MARKETING_LAST_UPDATED_ISO = "2026-04-21";
export const MARKETING_LAST_UPDATED_LABEL = "April 21, 2026";

export const marketingKeywords = [
  "instagram dm automation",
  "instagram lead management",
  "instagram crm",
  "manychat alternative",
  "pilot vs manychat",
  "comment to dm automation",
  "ai instagram assistant",
  "instagram sales automation",
  "instagram inbox automation",
  "instagram lead qualification",
];

export const marketingPages = [
  "/",
  "/waitlist",
  "/manifesto",
  "/open-source",
  "/privacy",
  "/tos",
  "/pricing",
  "/pilot-vs-manychat",
  "/instagram-dm-automation",
];

export const researchSources = {
  socialResponseWindow: {
    name: "Sprout Social Index 2025",
    url: "https://sproutsocial.com/insights/social-media-customer-service-statistics/",
    stat: "Nearly three-quarters of consumers expect a response on social within 24 hours or sooner.",
  },
  competitorRisk: {
    name: "Sprout Social Index 2025",
    url: "https://sproutsocial.com/insights/conversational-ai/",
    stat: "73% of social users say they will buy from a competitor if a brand does not respond on social.",
  },
  purchaseInfluence: {
    name: "Sprout Social Q2 2025 Pulse Survey",
    url: "https://sproutsocial.com/insights/social-media-consumer-behavior/",
    stat: "76% of social users say social media influenced at least some of their purchases in the last six months.",
  },
};

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.origin).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const mergedKeywords = [...new Set([...marketingKeywords, ...keywords])];

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.og,
          width: 2880,
          height: 1800,
          alt: `${title} - ${siteConfig.name}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.og],
    },
  };
}

export function getFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is Pilot different from flow-builder bots?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pilot is a sales system, not a brittle keyword tree. It combines intent-aware AI replies, CRM depth, and human handoff when risk or complexity appears.",
        },
      },
      {
        "@type": "Question",
        name: "Why does Pilot emphasize HRN safety routing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pilot is designed to pause risky threads, respect messaging constraints, and route conversations to humans before damage is done.",
        },
      },
      {
        "@type": "Question",
        name: "Can I self-host Pilot?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Pilot is open source and self-hostable so teams can control data, reduce vendor lock-in, and adapt workflows to their own infrastructure.",
        },
      },
      {
        "@type": "Question",
        name: "What is Pilot built for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pilot is built for creators, founders, agencies, and social teams that want to turn Instagram conversations into qualified pipeline without brittle automation.",
        },
      },
    ],
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.origin,
    logo: absoluteUrl("/logo.png"),
    sameAs: [
      siteConfig.socials.github,
      siteConfig.socials.x,
      siteConfig.socials.instagram,
      "https://www.linkedin.com/company/pilot-ops/",
    ],
    foundingDate: "2026",
    description: siteConfig.description,
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.origin,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteConfig.origin,
    offers: pricingPlans.map((plan) => ({
      "@type": "Offer",
      price: (plan.monthlyPriceCents / 100).toFixed(2),
      priceCurrency: "USD",
      name: plan.title,
      description: plan.description,
      url: absoluteUrl("/pricing"),
    })),
    description:
      "Pilot is an AI-powered Instagram DM automation and lead management system for creators, founders, and social teams.",
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    featureList: [
      "Instagram DM automation",
      "Lead qualification",
      "Built-in CRM",
      "Human response needed guardrails",
      "AI-assisted replies",
      "Self-hostable deployment",
    ],
  };
}

export function getPricingSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Pilot",
    description:
      "Instagram DM automation and lead management software with AI replies, CRM context, and human handoff guardrails.",
    brand: {
      "@type": "Brand",
      name: "Pilot",
    },
    offers: pricingPlans.map((plan) => ({
      "@type": "Offer",
      name: plan.title,
      description: plan.description,
      priceCurrency: "USD",
      price: (plan.monthlyPriceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing"),
      category: "Software subscription",
    })),
  };
}
