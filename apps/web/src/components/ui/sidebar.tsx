"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfile } from "@/components/ui/user-profile";
import { Moon, Sun, LucideIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
}

interface SidebarProps {
  className?: string;
  items: {
    icon: LucideIcon;
    label: string;
    href: string;
  }[];
}

function SidebarItem({ icon: Icon, label, href, isActive }: SidebarItemProps) {
  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start",
        isActive ? "bg-primary text-primary-foreground" : ""
      )}
    >
      <Link href={href} className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="mr-2"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Sidebar({ className, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-background p-4 light:bg-white dark:bg-slate-950",
        className
      )}
    >
      <div className="space-y-2">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </div>
      <div className="mt-auto pt-4 border-t">
        <UserProfile />
      </div>
    </div>
  );
} 