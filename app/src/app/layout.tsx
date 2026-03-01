import type { Metadata } from "next";
import { Manrope, DM_Mono } from "next/font/google";
import { TRPCProvider } from "@/lib/api/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://reqflow.com"),
  title: {
    default: "Reqflow - Procurement Software for Small Teams",
    template: "%s | Reqflow",
  },
  description: "Procurement software for teams of 5-50. Track SaaS spend, catch duplicates, never miss renewals. Free during early access. No credit card required.",
  keywords: ["procurement software", "saas spend management", "vendor management", "renewal tracking", "purchase order system", "procurement for startups"],
  authors: [{ name: "Reqflow" }],
  creator: "Reqflow",
  publisher: "Reqflow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Reqflow",
    title: "Reqflow - Procurement Software for Small Teams",
    description: "Track SaaS spend, catch duplicates, never miss renewals. Built for teams of 5-50 people.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Reqflow - Procurement Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reqflow - Procurement Software for Small Teams",
    description: "Track SaaS spend, catch duplicates, never miss renewals. Built for teams of 5-50 people.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${dmMono.variable} antialiased`}>
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <TRPCProvider>{children}</TRPCProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
