"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { 
  Home, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  HelpCircle
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const sidebarItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: FileText,
      label: "Create Pitch",
      href: "/pitches/new",
    },
    {
      icon: Users,
      label: "Clients",
      href: "/clients",
    },
    {
      icon: BarChart3,
      label: "Competitors",
      href: "/competitors",
    },
    {
      icon: HelpCircle,
      label: "Resources",
      href: "/resources",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <Sidebar>{children}</Sidebar>
  );
} 