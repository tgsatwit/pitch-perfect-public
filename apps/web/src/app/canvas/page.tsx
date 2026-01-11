"use client";

import dynamicImport from "next/dynamic";
import { Suspense } from "react";
// Import necessary providers
import { AssistantProvider } from "@/contexts/AssistantContext";
import { GraphProvider } from "@/contexts/GraphContext";
import { ThreadProvider } from "@/contexts/ThreadProvider";
import { UserProvider } from "@/contexts/UserContext";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const Canvas = dynamicImport(() => import("@/components/canvas").then(mod => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => <div>Loading Canvas...</div>
});

export default function CanvasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProvider>
        <ThreadProvider>
          <AssistantProvider>
            <GraphProvider>
              <Canvas />
            </GraphProvider>
          </AssistantProvider>
        </ThreadProvider>
      </UserProvider>
    </Suspense>
  );
} 