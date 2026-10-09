import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { SOCIAL_IMAGE, SITE_URL, absoluteUrl } from "../lib/site";
import { PWAProvider } from "../components/PWAProvider";
import { CLERK_ENABLED } from "../lib/auth";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = SITE_URL;
const socialImageUrl = absoluteUrl(SOCIAL_IMAGE.path, siteUrl);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "KidZcoop - Amazing Stories for Kids",
  description: "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.",
  applicationName: "KidZcoop",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KidZcoop",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "KidZcoop - Amazing Stories for Kids",
    description: "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.",
    url: siteUrl,
    siteName: "KidZcoop",
    images: [
      {
        url: socialImageUrl,
        width: SOCIAL_IMAGE.width,
        height: SOCIAL_IMAGE.height,
        alt: SOCIAL_IMAGE.alt,
        type: SOCIAL_IMAGE.type,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KidZcoop - Amazing Stories for Kids",
    description: "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.",
    images: [socialImageUrl],
  },
};

export const viewport: Viewport = {
  themeColor: "#581c87",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = siteUrl;
  
  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KidZcoop",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Amazing stories for kids - Where curiosity meets discovery",
  };
  
  // Website structured data
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KidZcoop",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={inter.className}>
        {CLERK_ENABLED ? (
          <ClerkProvider>
            <PWAProvider>
              <LanguageProvider>{children}</LanguageProvider>
            </PWAProvider>
          </ClerkProvider>
        ) : (
          <PWAProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </PWAProvider>
        )}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}',{send_page_view:false});`}</Script>
          </>
        )}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: "4868c7734ede47688d3c245ea3c683f8" })}
        />
      </body>
    </html>
  );
}
