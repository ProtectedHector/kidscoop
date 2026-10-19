import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { LANGUAGE_HEADER, SITE_NAME, SITE_URL, SOCIAL_IMAGE, SOCIAL_PROFILES, absoluteUrl } from "../lib/site";
import { jsonLd } from "../lib/seo";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "../lib/languages";
import { PWAProvider } from "../components/PWAProvider";
import { CLERK_ENABLED } from "../lib/auth";

const inter = Inter({ subsets: ["latin"] });
const socialImageUrl = absoluteUrl(SOCIAL_IMAGE.path);
const defaultDescription = "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KidZcoop - Amazing Stories for Kids",
    template: "%s | KidZcoop",
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
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
    description: defaultDescription,
    url: SITE_URL,
    siteName: SITE_NAME,
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
    description: defaultDescription,
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
  const headerLanguage = headers().get(LANGUAGE_HEADER);
  const language = isSupportedLanguage(headerLanguage) ? headerLanguage : DEFAULT_LANGUAGE;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icons/icon-512.png"),
      width: 512,
      height: 512,
    },
    description: "Amazing stories for kids - Where curiosity meets discovery",
    sameAs: SOCIAL_PROFILES,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: language,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <html lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationSchema)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteSchema)} />
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
