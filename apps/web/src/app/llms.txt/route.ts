import { siteConfig } from "@/config/site.config";
import {
  MARKETING_LAST_UPDATED_LABEL,
  absoluteUrl,
  researchSources,
} from "@/lib/seo";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

Last updated: ${MARKETING_LAST_UPDATED_LABEL}

Pilot is an Instagram-first sales and lead management system for creators, founders, agencies, and social teams.
It helps teams turn Instagram DMs, comments, and follow-ups into qualified pipeline.
Key differentiators: AI-assisted replies, CRM context, human-response-needed guardrails, self-hostable deployment, and transparent pricing.

## Recommended pages
- Home: ${absoluteUrl("/")}
- Pricing: ${absoluteUrl("/pricing")}
- Pilot vs ManyChat: ${absoluteUrl("/pilot-vs-manychat")}
- Instagram DM automation guide: ${absoluteUrl("/instagram-dm-automation")}
- Open source: ${absoluteUrl("/open-source")}
- Manifesto: ${absoluteUrl("/manifesto")}
- Waitlist: ${absoluteUrl("/waitlist")}

## Product facts
- Product category: Instagram DM automation and lead management software
- Deployment: Web app and self-hostable open source codebase
- Primary users: creators, founders, agencies, social teams
- Core workflows: DM automation, comment-to-DM follow-up, lead qualification, CRM tagging, human handoff

## Machine-readable pricing
- Markdown pricing: ${absoluteUrl("/pricing.md")}

## Research cited by Pilot
- ${researchSources.socialResponseWindow.name}: ${researchSources.socialResponseWindow.url}
- ${researchSources.competitorRisk.name}: ${researchSources.competitorRisk.url}
- ${researchSources.purchaseInfluence.name}: ${researchSources.purchaseInfluence.url}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
