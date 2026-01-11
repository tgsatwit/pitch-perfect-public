import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClientProviders } from "@/components/client-providers";

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pitch Perfect",
  description: "Create winning pitches with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen" suppressHydrationWarning>
      <body className={cn("min-h-full", inter.className)}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
