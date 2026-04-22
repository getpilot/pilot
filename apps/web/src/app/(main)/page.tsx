import type { Metadata } from "next";
import CallToAction from "@/components/landing/call-to-action";
import FAQSection from "@/components/landing/faq";
import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";
import ControlSurface from "@/components/landing/control-surface";
import Pricing from "@/components/landing/pricing";
import SolarAnalytics from "@/components/landing/product-overview";
import Testimonial from "@/components/landing/testimonial";
import CompareTable from "@/components/landing/compare";
import {
  buildPageMetadata,
  getFaqSchema,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebsiteSchema,
} from "@/lib/seo";
import { BlurFade } from "@pilot/ui/components/blur-fade";
import Supporters from "@pilot/ui/components/supporters";

export const metadata: Metadata = buildPageMetadata({
  title: "Turn Instagram DMs Into Qualified Leads",
  description:
    "Pilot helps creators, founders, and social teams turn Instagram DMs into qualified pipeline with AI replies, CRM context, and human handoff guardrails.",
  path: "/",
  keywords: [
    "instagram dm automation software",
    "instagram lead management software",
    "instagram sales crm",
  ],
});

const HomePage = () => {
  return (
    <main className="relative mx-auto flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebsiteSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSoftwareApplicationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFaqSchema()),
        }}
      />
      <BlurFade
        delay={0.06}
        inView
        inViewMargin="-100px"
        className="pt-36 lg:pt-56"
      >
        <Hero />
      </BlurFade>
      <BlurFade
        delay={0.09}
        inView
        inViewMargin="-100px"
        className="mt-8 px-4 xl:px-0"
      >
        <Supporters />
      </BlurFade>
      <BlurFade
        delay={0.12}
        inView
        inViewMargin="-100px"
        className="mt-24 mb-16 px-4 xl:px-0"
      >
        <Features />
      </BlurFade>
      <BlurFade
        delay={0.18}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <SolarAnalytics />
      </BlurFade>
      <BlurFade
        delay={0.24}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <CompareTable />
      </BlurFade>
      <BlurFade
        delay={0.3}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <Testimonial />
      </BlurFade>
      <BlurFade
        delay={0.36}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <ControlSurface />
      </BlurFade>
      <BlurFade
        delay={0.42}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <Pricing />
      </BlurFade>
      <BlurFade
        delay={0.48}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <FAQSection />
      </BlurFade>
      <BlurFade
        delay={0.54}
        inView
        inViewMargin="-100px"
        className="my-16 px-4 xl:px-0"
      >
        <CallToAction />
      </BlurFade>
    </main>
  );
};

export default HomePage;
