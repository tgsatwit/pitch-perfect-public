"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-5 w-10 cursor-pointer items-center rounded-full border border-gray-300 transition-colors",
          checked ? "bg-blue-600" : "bg-gray-200",
          disabled ? "cursor-not-allowed opacity-50" : "",
          className
        )}
        onClick={handleClick}
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <div
          className={cn(
            "h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch }; 