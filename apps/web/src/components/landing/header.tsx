"use client"

import React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@pilot/ui/lib/utils"
import { Button } from "@pilot/ui/components/button"
import { useScroll } from "@pilot/ui/hooks/use-scroll"
import { siteConfig } from "@/config/site.config"
import { Icons } from "@/components/icons"

const navLinks = [
  { label: "Features", href: "/#platform" },
  { label: "Product", href: "/#pipeline-analytics" },
  { label: "Comparison", href: "/#comparison" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
]

const Header = () => {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(15)

  return (
    <header
      className={cn(
        "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-6xl justify-center rounded-lg border border-transparent px-3 py-3 transition duration-300",
        scrolled || open
          ? "border-border/60 bg-background/80 shadow-2xl shadow-black/5 backdrop-blur-sm"
          : "bg-background/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href="/" aria-label="Home">
            <span className="sr-only">{siteConfig.name} logo</span>
            <Icons.Logo width={88} height={36} className="w-22" priority />
          </Link>
          <nav className="hidden sm:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-4 text-sm font-medium lg:gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} className="px-2 py-1 text-foreground" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
          <Button
            variant="secondary"
            className="hidden sm:block"
            asChild
          >
            <Link href="/waitlist">Join waitlist</Link>
          </Button>
          <Button
            onClick={() => setOpen(!open)}
            variant="secondary"
            className="p-1.5 sm:hidden"
            size="icon"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          >
            {!open ? (
              <Menu className="shrink-0 text-foreground" aria-hidden />
            ) : (
              <X className="shrink-0 text-foreground" aria-hidden />
            )}
          </Button>
        </div>
        <nav
          className={cn(
            "mt-6 flex flex-col gap-6 text-lg ease-in-out will-change-transform sm:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button variant="secondary" asChild>
            <Link href="/waitlist">Join waitlist</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

export default Header
