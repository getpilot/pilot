import Link from "next/link";
import { Avatar, AvatarFallback } from "@pilot/ui/components/avatar";
import { researchSources } from "@/lib/seo";

const proofCards = [
  {
    stat: "73%",
    label: "of social users expect brands to respond within 24 hours or sooner",
    href: researchSources.socialResponseWindow.url,
    source: researchSources.socialResponseWindow.name,
  },
  {
    stat: "73%",
    label: "say they will buy from a competitor if a brand does not respond",
    href: researchSources.competitorRisk.url,
    source: researchSources.competitorRisk.name,
  },
  {
    stat: "76%",
    label: "say social media influenced at least some recent purchases",
    href: researchSources.purchaseInfluence.url,
    source: researchSources.purchaseInfluence.name,
  },
];

const Testimonial = () => {
  return (
    <section
      id="social-proof"
      className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-primary/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/30" />
      <div className="relative z-10 px-8 py-14 sm:px-14 lg:px-24">
        <figure className="mx-auto flex w-full max-w-xl flex-col items-center justify-center">
          <blockquote className="font-heading text-center text-lg leading-tight tracking-tight sm:text-xl md:text-3xl">
            &quot;Pilot gave us the follow-up discipline we were missing. Warm
            leads stopped slipping through inbox cracks.&quot;
          </blockquote>

          <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mx-auto my-5 h-px w-full max-w-sm bg-border" />

          <figcaption className="flex flex-col items-center gap-5">
            <div className="space-y-0.5 text-center">
              <cite className="font-medium text-foreground text-lg not-italic">
                Early access customer
              </cite>
              <div className="text-base text-muted-foreground">
                Creator-led business operator
              </div>
            </div>

            <Avatar className="size-12 rounded-full border object-cover">
              <AvatarFallback>EC</AvatarFallback>
            </Avatar>
          </figcaption>
        </figure>

        <div className="mx-auto mt-12 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          {proofCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-border/70 bg-background/70 p-5"
            >
              <p className="font-heading text-3xl text-foreground">
                {card.stat}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.label}
              </p>
              <Link
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-xs text-primary underline underline-offset-4"
              >
                Source: {card.source}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonial
