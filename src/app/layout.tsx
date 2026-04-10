import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Swishti | Civic Tech Platform",
  description: "Report garbage hotspots and coordinate volunteer cleanups.",
  keywords: ["garbage", "waste management", "civic tech", "smart city", "cleanup", "volunteer"],
};

import { AuthSync } from "@/components/AuthSync";
import ProofModal from "@/components/ProofModal";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("swishti-lang")?.value;
  const initialLang = cookieLang === "ta" ? "ta" : cookieLang === "hi" ? "hi" : "en";

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col font-sans brutal-bg">
        <LanguageProvider initialLang={initialLang}>
          <AuthSync />
          <Navbar />
          <main className="flex-1">{children}</main>
          <ProofModal />
        </LanguageProvider>
      </body>
    </html>
  );
}
