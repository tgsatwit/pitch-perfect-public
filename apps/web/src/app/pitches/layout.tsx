"use client";

import { MainLayout } from "@/components/layouts/main-layout";

export default function PitchesLayout({
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