import type { Metadata } from "next";
import { Geist_Mono, Geist, Prata } from "next/font/google";
import "@pilot/ui/styles/globals.css";
import { siteConfig } from "@/config/site.config";
import RootProviders from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@pilot/ui/lib/utils";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fontHeading = Prata({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: siteConfig.title,
    template: "%s | Pilot Dashboard",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: siteConfig.creator.name,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-image-preview": "none",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.origin,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.og,
        width: 2880,
        height: 1800,
        alt: siteConfig.name,
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.socials.x,
    title: siteConfig.title,
    description: siteConfig.description,
    images: {
      url: siteConfig.og,
      width: 2880,
      height: 1800,
      alt: siteConfig.name,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable
        )}
      >
        <RootProviders>{children}</RootProviders>
        <Analytics />
      </body>
    </html>
  );
}
