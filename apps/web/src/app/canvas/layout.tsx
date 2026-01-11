"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CanvasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* ReactFlow style navbar for canvas page */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold cursor-pointer text-slate-900 dark:text-white">Pitch Perfect</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  Back to Dashboard
                </Button>
              </Link>
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                Save Pitch
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white">
                Export
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Canvas content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 