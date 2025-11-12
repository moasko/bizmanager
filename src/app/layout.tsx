import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
// Les composants Sidebar et Header sont importés mais non utilisés
// Ils seront ajoutés dans les pages individuelles

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "devSongue suite",
  description: "Multi-company management suite",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  themeColor: "#3b82f6",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="application-name" content="devSongue suite" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="devSongue suite" />
        <meta name="description" content="Multi-company management suite" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-gray-50 text-gray-800">
            {/* Sidebar and Header will be added in individual pages */}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}