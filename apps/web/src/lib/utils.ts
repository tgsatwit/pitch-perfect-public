import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 * @param value The number to format
 * @param currency The currency symbol (default: $)
 * @param options Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currency: string = '$', 
  options: Intl.NumberFormatOptions = {}
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options,
  });
  
  // Use the formatter but replace the currency symbol with the requested one
  const formatted = formatter.format(value);
  
  // Handle special case for $ which is already correct in USD formatter
  if (currency === '$') {
    return formatted;
  }
  
  // Replace the currency symbol
  return formatted.replace('$', currency);
}
