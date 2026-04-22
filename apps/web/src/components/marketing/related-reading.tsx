import Link from "next/link";

type RelatedLink = {
  href: string;
  title: string;
  description: string;
};

type RelatedReadingProps = {
  title?: string;
  links: RelatedLink[];
};

export function RelatedReading({
  title = "Related reading",
  links,
}: RelatedReadingProps) {
  return (
    <section className="mt-16">
      <h2 className="font-heading text-3xl text-foreground">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <p className="font-heading text-2xl text-foreground transition-colors group-hover:text-primary">
              {link.title}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
