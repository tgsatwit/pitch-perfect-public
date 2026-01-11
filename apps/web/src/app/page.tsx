"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Client-side entry point for the Home component
import { Dashboard } from "@/components/dashboard";
// Import necessary providers
import { AssistantProvider } from "@/contexts/AssistantContext";
import { GraphProvider } from "@/contexts/GraphContext";
import { ThreadProvider } from "@/contexts/ThreadProvider";
import { UserProvider } from "@/contexts/UserContext";
import { MainLayout } from "@/components/layouts/main-layout";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <UserProvider>
        <ThreadProvider>
          <AssistantProvider>
            <GraphProvider>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </GraphProvider>
          </AssistantProvider>
        </ThreadProvider>
      </UserProvider>
    </Suspense>
  );
}
