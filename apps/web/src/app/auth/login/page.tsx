"use client";

import dynamicImport from "next/dynamic";
import { Suspense } from "react";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const Login = dynamicImport(() => import("@/components/auth/login/Login").then(mod => ({ default: mod.Login })), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Page() {
  return (
    <main className="h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Login />
      </Suspense>
    </main>
  );
}
