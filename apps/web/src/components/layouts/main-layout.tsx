"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar>
        <main className="flex-1 w-full overflow-auto">
          {children}
        </main>
      </Sidebar>
    </div>
  );
} 