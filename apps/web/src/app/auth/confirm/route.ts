import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  
  // For Firebase email verification, the user needs to be redirected to the client
  // where the Firebase JS SDK can handle the verification code
  if (mode === "verifyEmail" && oobCode) {
    // We'll redirect to a client-side handler that can process the verification
    return NextResponse.redirect(new URL(`/auth/verify-email?oobCode=${oobCode}`, request.url));
  }
  
  // Handle password reset
  if (mode === "resetPassword" && oobCode) {
    // Redirect to password reset page with the oobCode
    return NextResponse.redirect(new URL(`/auth/reset-password?oobCode=${oobCode}`, request.url));
  }
  
  // If we get here, something went wrong
  return NextResponse.redirect(new URL("/auth/error", request.url));
}
