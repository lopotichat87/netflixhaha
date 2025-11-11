import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./nprogress.css";
import Script from "next/script";
import { Suspense } from "react";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import PinGuard from '@/components/PinGuard';
import ProgressBar from '@/components/ProgressBar';
import QueryProvider from '@/components/QueryProvider';
import ActivityTracker from '@/components/ActivityTracker';
import PopupBlocker from '@/components/PopupBlocker';
import './globals.css';
import 'nprogress/nprogress.css';
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ReelVibe - Votre plateforme cinéma sociale et collaborative",
    template: "%s | ReelVibe"
  },
  description: "Découvrez, notez et partagez vos films et séries préférés. ReelVibe est votre réseau social cinéphile avec recommandations personnalisées, listes collaboratives et statistiques détaillées.",
  keywords: ["films", "séries", "streaming", "critiques", "notes", "cinéma", "réseau social", "recommandations", "TMDB", "réseaux sociaux films"],
  authors: [{ name: "ReelVibe Team" }],
  creator: "ReelVibe",
  publisher: "ReelVibe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReelVibe",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://reelvibe.app",
    siteName: "ReelVibe",
    title: "ReelVibe - Votre plateforme cinéma sociale",
    description: "Découvrez, notez et partagez vos films et séries préférés avec votre communauté cinéphile.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReelVibe - Plateforme sociale pour cinéphiles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReelVibe - Votre plateforme cinéma sociale",
    description: "Découvrez, notez et partagez vos films et séries préférés.",
    images: ["/og-image.png"],
  },
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#A855F7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID || ''}');`}
        </Script>
        
        {/* Google Analytics GA4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Cloudflare Browser Insights */}
        {process.env.NEXT_PUBLIC_CLOUDFLARE_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CLOUDFLARE_TOKEN}"}`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <PinGuard>
                {/* <ActivityTracker /> */}
                <PopupBlocker />
                <Suspense fallback={null}>
                  <ProgressBar />
                </Suspense>
                {children}
              </PinGuard>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
