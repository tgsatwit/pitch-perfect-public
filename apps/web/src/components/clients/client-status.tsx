"use client";

import React from "react";

type IconType = "users" | "userPlus" | "calendar" | "presentation" | "fileSearch";
type ColorType = "blue" | "purple" | "emerald" | "amber" | "green";

interface ClientStatusProps {
  title: string;
  value: number;
  icon: IconType;
  color: ColorType;
}

export function ClientStatus({ title, value, icon, color }: ClientStatusProps) {
  const getIconComponent = (iconType: IconType) => {
    switch (iconType) {
      case "users":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "userPlus":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
        );
      case "calendar":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case "presentation":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M2 3h20" />
            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
            <path d="m7 16 5 5 5-5" />
          </svg>
        );
      case "fileSearch":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <circle cx="11.5" cy="14.5" r="2.5" />
            <path d="M13.25 16.25 15 18" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = (colorType: ColorType) => {
    switch (colorType) {
      case "blue":
        return {
          bg: "bg-[#f8f9fa] dark:bg-[#161616]/80", 
          text: "text-[#0F1C3F] dark:text-[#D1D5DB]",
          icon: "text-[#0F1C3F] dark:text-[#D1D5DB]",
        };
      case "purple":
        return {
          bg: "bg-[#f8f9fa] dark:bg-[#161616]/80",
          text: "text-purple-600 dark:text-purple-400",
          icon: "text-purple-500 dark:text-purple-400",
        };
      case "emerald":
        return {
          bg: "bg-[#f8f9fa] dark:bg-[#161616]/80",
          text: "text-emerald-600 dark:text-emerald-400",
          icon: "text-emerald-500 dark:text-emerald-400",
        };
      case "amber":
        return {
          bg: "bg-[#f8f9fa] dark:bg-[#161616]/80",
          text: "text-amber-600 dark:text-amber-400",
          icon: "text-amber-500 dark:text-amber-400",
        };
      case "green":
        return {
          bg: "bg-[#f8f9fa] dark:bg-[#161616]/80",
          text: "text-green-600 dark:text-green-400",
          icon: "text-green-500 dark:text-green-400",
        };
      default:
        return {
          bg: "bg-[#f8f9fa] dark:bg-[#161616]/80",
          text: "text-[#111111] dark:text-[#f2f2f2]",
          icon: "text-[#4b5563] dark:text-[#9ca3af]",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md border border-[#e0e0e5]/50 dark:border-[#222222] rounded-md shadow-sm">
      <div className="flex items-center p-6">
        <div className={`${colorClasses.bg} p-3 rounded-md mr-4 border border-[#e0e0e5]/30 dark:border-[#222222]/50`}>
          <div className={colorClasses.icon}>{getIconComponent(icon)}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-[#4b5563] dark:text-[#9ca3af]">{title}</p>
          <h3 className={`text-3xl font-bold ${colorClasses.text}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
} 