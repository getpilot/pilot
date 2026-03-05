import { Button } from "@pilot/ui/components/button"
import Link from "next/link"
import { siteConfig } from "@/config/site.config"
import { Icons } from "@/components/icons"
import ThemeToggler from "@/components/theme/toggler"
import { ArrowUpRight } from "lucide-react"

const CURRENT_YEAR = new Date().getFullYear()

const sections = {
  landing: {
    title: "Landing",
    items: [
      { label: "Features", href: "#platform" },
      { label: "Product", href: "#pipeline-analytics" },
      { label: "Comparison", href: "#comparison" },
      { label: "Workflow", href: "#workflow" },
      { label: "Proof", href: "#social-proof" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  pages: {
    title: "Pages",
    items: [
      { label: "Waitlist", href: "/waitlist" },
      { label: "Open source", href: "/open-source" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/tos" },
    ],
  },
  resources: {
    title: "Resources",
    items: [
      { label: "Manifesto", href: "/waitlist" },
      { label: "App", href: "https://pilot-ops-app.vercel.app/" },
      { label: "GitHub", href: "https://github.com/getpilot" },
    ],
  },
  socials: {
    title: "Socials",
    items: [
      { label: "X", href: "https://x.com/PilotOps_" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/pilot-ops/" },
      { label: "Instagram", href: "https://www.instagram.com/pilot.ops/" },
      { label: "GitHub", href: "https://github.com/getpilot" },
    ],
  },
}

const Footer = () => {
  return (
    <div className="px-4 xl:px-0">
      <footer
        id="footer"
        className="relative mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-10"
      >
        <div className="pointer-events-none inset-0">
          <div
            className="absolute inset-y-0 -my-20 w-px"
            style={{ maskImage: "linear-gradient(transparent, white 5rem)" }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-border"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
          <div
            className="absolute inset-y-0 right-0 -my-20 w-px"
            style={{ maskImage: "linear-gradient(transparent, white 5rem)" }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-border"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        </div>

        <svg className="mb-4 h-20 w-full border-y border-dashed border-border stroke-border">
          <defs>
            <pattern
              id="diagonal-footer-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    strokeWidth="1"
                  />
                )
              })}
            </pattern>
          </defs>
          <rect
            stroke="none"
            width="100%"
            height="100%"
            fill="url(#diagonal-footer-pattern)"
          />
        </svg>

        <div className="mr-auto flex w-full min-w-[180px] flex-col gap-4 lg:w-auto">
          <Link
            href="/"
            className="flex items-center font-medium text-muted-foreground select-none sm:text-sm"
          >
            <Icons.Logo width={80} height={34} className="ml-2 w-20" />
            <span className="sr-only">{siteConfig.name} watermark</span>
          </Link>
          <div className="ml-2 text-sm text-muted-foreground">
            &copy; {CURRENT_YEAR} {siteConfig.name}
          </div>
          <div className="ml-2 flex items-center mt-auto gap-2">
            <ThemeToggler />
            <Button asChild variant="outline" className="h-10 flex items-center px-3">
              <Link
                href="https://pilot-ops-app.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open app
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="min-w-40">
            <h3 className="font-heading mb-4 font-medium text-foreground sm:text-sm">
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.label} className="text-sm">
                  <Link
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  )
}

export default Footer
