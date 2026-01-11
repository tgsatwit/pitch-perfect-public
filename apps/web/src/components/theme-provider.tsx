"use client"

import * as React from "react"

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

const ThemeContext = React.createContext({
  theme: "light",
  setTheme: (theme: string) => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme);
  const [mounted, setMounted] = React.useState(false);

  // Only run this effect on client-side after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme class to html element
  React.useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Remove existing class
    root.classList.remove("light", "dark");
    
    // Add the new theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  // Don't render with theme until mounted to avoid hydration mismatch
  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 