"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { UserProvider } from "@/contexts/UserContext";
import { ThreadProvider } from "@/contexts/ThreadProvider";
import { AssistantProvider } from "@/contexts/AssistantContext";
import { GraphProvider } from "@/contexts/GraphContext";

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContextProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <NuqsAdapter>
          <UserProvider>
            <ThreadProvider>
              <AssistantProvider>
                <GraphProvider>
                  {children}
                </GraphProvider>
              </AssistantProvider>
            </ThreadProvider>
          </UserProvider>
        </NuqsAdapter>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </AuthContextProvider>
  );
} 