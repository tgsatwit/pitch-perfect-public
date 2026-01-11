import { verifySessionCookie } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = cookies().get('session')?.value;
  
  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const { valid, uid } = await verifySessionCookie(session);
    
    if (valid) {
      return NextResponse.json({ valid: true, uid });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return NextResponse.json({ valid: false, error: 'Failed to verify session' }, { status: 500 });
  }
} 