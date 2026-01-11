"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  FileText,
  Settings,
  Home,
  Target,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      color: "text-indigo-600"
    },
    {
      title: "Clients",
      icon: Users,
      href: "/clients",
      color: "text-indigo-600"
    },
    {
      title: "Competitors",
      icon: BarChart3,
      href: "/competitors",
      color: "text-indigo-600"
    },
    {
      title: "Pitch Library",
      icon: FileText,
      href: "/pitches",
      color: "text-indigo-600"
    },
    {
      title: "Bull Pen",
      icon: Target,
      href: "/pitch-practice",
      color: "text-indigo-600"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="flex h-full w-full">
      <motion.div
        animate={{
          width: expanded ? 240 : 72,
          transition: {
            duration: 0.3,
            type: "spring",
            damping: 16,
          },
        }}
        className="relative h-full bg-white border-r border-slate-200 flex flex-col flex-shrink-0"
      >
        <div className="p-4 flex items-center border-b border-slate-200">
          {expanded && (
            <Link href="/" className="flex items-center flex-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 font-sora text-2xl font-bold">
                <span className="italic font-bold">Pitch</span>
                <span className="font-medium">Perfect</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 pt-4 overflow-y-auto">
          <div className="p-4">
            <Link href="/pitches/new">
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                {expanded ? "Create Pitch" : ""}
            </Button>
          </Link>
          </div>
          <ul className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <motion.li
                  key={item.title}
                  initial={false}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center py-2.5 px-3 rounded-md transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", item.color)} />
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          transition: { delay: 0.1, duration: 0.15 }
                        }}
                        className="ml-3 font-medium"
                      >
                        {item.title}
                      </motion.span>
                    )}
                    
                    {isActive && (
                      <motion.div
                        className="absolute right-0 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-l-md"
                        layoutId="activeIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200 flex flex-col gap-3">
          {expanded ? (
            <div className="flex items-center gap-x-3 mt-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100">
                <span className="text-indigo-700 font-medium">TG</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Tim Gillam</p>
                <p className="text-xs text-slate-500">tim@example.com</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100">
                <span className="text-indigo-700 font-medium">TG</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-auto w-full">
        {children}
      </div>
    </div>
  );
} 