import { NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const idToken = searchParams.get("idToken");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (idToken) {
    try {
      // Set session expiration to 5 days
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      
      // Create a session cookie
      const sessionCookie = await createSessionCookie(idToken, expiresIn);
      
      // Set the cookie
      cookies().set("session", sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        path: "/",
      });

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
