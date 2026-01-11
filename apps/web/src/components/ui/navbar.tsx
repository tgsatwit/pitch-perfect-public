"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ppLogo from "@/public/pp-logo.png";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Clients", href: "/clients" },
    { label: "Competitors", href: "/competitors" },
    { label: "Resources", href: "/resources" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700",
      className
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src={ppLogo} alt="PitchPerfect Logo" width={32} height={32} />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">PitchPerfect</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-indigo-500",
                    isActive 
                      ? "text-indigo-500 dark:text-indigo-400" 
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/canvas">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg">
                Create Pitch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 