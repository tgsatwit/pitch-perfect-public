import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
export const getFirebaseAdmin = () => {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getApps()[0];
};

// Get Firebase Admin Auth
export const getAdminAuth = () => {
  const app = getFirebaseAdmin();
  return getAuth(app);
};

// Verify session cookie
export const verifySessionCookie = async (session: string) => {
  try {
    const auth = getAdminAuth();
    // Check that the cookie is valid (not expired, etc.)
    const decodedClaims = await auth.verifySessionCookie(session, true);
    return { valid: true, uid: decodedClaims.uid };
  } catch (error) {
    return { valid: false, uid: null };
  }
};

// Create session cookie
export const createSessionCookie = async (idToken: string, expiresIn: number) => {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, { expiresIn });
}; 