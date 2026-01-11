import { cookies } from "next/headers";
import { verifySessionCookie } from "./admin";
import { User } from "firebase/auth";

export async function verifyUserAuthenticated(): Promise<{ user: User; uid: string } | undefined> {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      return undefined;
    }
    
    // Verify the session cookie
    const { valid, uid } = await verifySessionCookie(sessionCookie);
    
    if (!valid || !uid) {
      return undefined;
    }
    
    // Return a simplified user object with the UID
    return { 
      user: { 
        uid,
        email: null, // We don't have the email from just the session verification
        emailVerified: false,
      } as User,
      uid
    };
  } catch (error) {
    console.error("Error verifying user authentication:", error);
    return undefined;
  }
} 