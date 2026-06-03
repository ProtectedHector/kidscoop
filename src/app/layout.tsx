import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidscoop.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "KidScoop - Amazing Stories for Kids",
  description: "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.",
  openGraph: {
    title: "KidScoop - Amazing Stories for Kids",
    description: "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.",
    url: siteUrl,
    siteName: "KidScoop",
    images: [
      {
        url: "/logo.png",
        width: 1019,
        height: 573,
        alt: "KidScoop",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KidScoop - Amazing Stories for Kids",
    description: "Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.",
    images: ["/logo.png"],
  },
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
    "name": "KidScoop",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Amazing stories for kids - Where curiosity meets discovery",
  };
  
  // Website structured data
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KidScoop",
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
    <html lang="en">
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
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
