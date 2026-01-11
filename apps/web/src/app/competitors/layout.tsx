"use client";

import { MainLayout } from "@/components/layouts/main-layout";

export default function CompetitorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
} 