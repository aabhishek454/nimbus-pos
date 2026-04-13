import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ThemeProvider from "@/components/ThemeProvider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nimbus POS",
  description: "Premium SaaS dashboard for orders, analytics, and team operations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nimbus POS",
  },
};

export const viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import BackgroundBlobs from "@/components/BackgroundBlobs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-inter)] bg-[var(--bg-primary)] overflow-x-hidden relative">
        <BackgroundBlobs />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
