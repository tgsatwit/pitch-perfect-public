"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Users, UserPlus, Calendar, Presentation, FileSearch, 
  CheckCircle, Star, Briefcase, Building
} from "lucide-react";

type IconName = 
  | "users" 
  | "userPlus" 
  | "calendar" 
  | "presentation" 
  | "fileSearch" 
  | "check" 
  | "star" 
  | "briefcase" 
  | "building";

type ColorVariant = "blue" | "purple" | "emerald" | "amber" | "green" | "red";

interface ClientResearchStatusProps {
  title: string;
  value: string | number;
  icon: IconName;
  color: ColorVariant;
}

export function ClientResearchStatus({
  title,
  value,
  icon,
  color
}: ClientResearchStatusProps) {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className={cn("h-6 w-6", getIconColor())} />;
      case "userPlus":
        return <UserPlus className={cn("h-6 w-6", getIconColor())} />;
      case "calendar":
        return <Calendar className={cn("h-6 w-6", getIconColor())} />;
      case "presentation":
        return <Presentation className={cn("h-6 w-6", getIconColor())} />;
      case "fileSearch":
        return <FileSearch className={cn("h-6 w-6", getIconColor())} />;
      case "check":
        return <CheckCircle className={cn("h-6 w-6", getIconColor())} />;
      case "star":
        return <Star className={cn("h-6 w-6", getIconColor())} />;
      case "briefcase":
        return <Briefcase className={cn("h-6 w-6", getIconColor())} />;
      case "building":
        return <Building className={cn("h-6 w-6", getIconColor())} />;
      default:
        return <FileSearch className={cn("h-6 w-6", getIconColor())} />;
    }
  };

  const getIconColor = () => {
    switch (color) {
      case "blue":
        return "text-[#0F1C3F] dark:text-[#D1D5DB]";
      case "purple":
        return "text-purple-500 dark:text-purple-400";
      case "emerald":
        return "text-emerald-500 dark:text-emerald-400";
      case "amber":
        return "text-amber-500 dark:text-amber-400";
      case "green":
        return "text-green-500 dark:text-green-400";
      case "red":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-[#0F1C3F] dark:text-[#D1D5DB]";
    }
  };

  const getBgColor = () => {
    switch (color) {
      case "blue":
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
      case "purple":
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
      case "emerald":
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
      case "amber":
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
      case "green":
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
      case "red":
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
      default:
        return "bg-[#f8f9fa] dark:bg-[#161616]/80";
    }
  };

  const getFormattedValue = () => {
    if (typeof value === "string") {
      if (value === "initial") return "Initial Setup";
      if (value === "researching") return "Researching";
      if (value === "complete") return "Complete";
      if (value === "error") return "Error";
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  };

  return (
    <div className={cn("rounded-md p-6 border border-[#e0e0e5]/50 dark:border-[#222222] shadow-sm", getBgColor())}>
      <div className="flex items-center">
        <div className="mr-4">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#4b5563] dark:text-[#9ca3af]">
            {title}
          </h3>
          <p className="mt-1 text-xl font-semibold text-[#111111] dark:text-[#f2f2f2]">
            {getFormattedValue()}
          </p>
        </div>
      </div>
    </div>
  );
} 