import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { DM_Sans } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import { MainWithLoader } from "@/components/layout/MainWithLoader";
import { SITE_NAME } from "@/utils/constants";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} – Event Venues in Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find and compare the best event venues in Pakistan. Weddings, engagements, corporate events and more. Browse halls, farmhouses, and marquees in Lahore, Karachi, Islamabad and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const grainStyle = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 9999,
    pointerEvents: "none" as const,
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "256px",
  };

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="font-sans antialiased flex min-h-screen flex-col bg-background text-foreground">
        <div aria-hidden style={grainStyle} />
        <NextTopLoader
          color="#c07860"
          height={3}
          showSpinner={false}
          crawl
          crawlSpeed={200}
          initialPosition={0.08}
          easing="ease"
          speed={200}
          shadow={false}
          zIndex={1600}
        />
        <NavigationProvider>
          <Header />
          <MainWithLoader>{children}</MainWithLoader>
          <Footer />
        </NavigationProvider>
      </body>
    </html>
  );
}
