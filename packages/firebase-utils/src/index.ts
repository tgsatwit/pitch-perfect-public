import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth'; 

let adminApp: App;
let dbInstance: Firestore;
let authInstance: Auth;

function initializeFirebaseAdmin(): void {
  if (getApps().length === 0) {
    console.log("Initializing Firebase Admin SDK...");
    
    // Development fallbacks - ONLY FOR LOCAL DEVELOPMENT!
    const projectId = process.env.FIREBASE_PROJECT_ID || (process.env.NODE_ENV === 'development' ? 'dev-project-id' : undefined);
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || (process.env.NODE_ENV === 'development' ? 'dev-email@example.com' : undefined);
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 
                      (process.env.NODE_ENV === 'development' ? '-----BEGIN PRIVATE KEY-----\nMIIEFAKEKEYCONTENT\n-----END PRIVATE KEY-----\n' : undefined);
    
    // Warn if using fallbacks
    if (process.env.NODE_ENV === 'development' && (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY)) {
      console.warn('⚠️ Using Firebase fallback values for development. This will NOT work for production or with actual Firebase services!');
      console.warn('⚠️ Set the following environment variables in your .env file:');
      console.warn('⚠️   - FIREBASE_PROJECT_ID');
      console.warn('⚠️   - FIREBASE_CLIENT_EMAIL');
      console.warn('⚠️   - FIREBASE_PRIVATE_KEY');
    }
    
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
      );
    }
    
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (e) {
        console.error("Failed to initialize Firebase Admin:", e);
        throw e; // Rethrow to prevent proceeding without initialization
    }
  } else {
    console.log("Using existing Firebase Admin SDK instance.");
    adminApp = getApps()[0];
  }
  
  // Get Firestore and Auth instances only once
  if (!dbInstance) {
    try {
        dbInstance = getFirestore(adminApp);
    } catch (e) {
        console.error("Failed to get Firestore instance:", e);
        throw e;
    }
  }
  if (!authInstance) {
     try {
        authInstance = getAuth(adminApp);
     } catch(e) {
        console.error("Failed to get Auth instance:", e);
        // Decide if this is critical - maybe auth isn't needed everywhere
     }
  }
}

// Initialize on module load
initializeFirebaseAdmin();

// --- Export Getter Functions ---
export function getDbInstance(): Firestore {
  if (!dbInstance) {
     console.warn("Firestore instance requested before initialization completed. Re-initializing...");
     // This shouldn't happen if initialization on load worked, but as a fallback:
     initializeFirebaseAdmin(); 
     if (!dbInstance) { // Check again after re-init attempt
         throw new Error("Failed to initialize Firestore instance.");
     }
  }
  return dbInstance;
}

export function getAuthInstance(): Auth {
    if (!authInstance) {
        // Handle error or optional initialization like db
        console.warn("Auth instance requested but potentially not initialized.");
        initializeFirebaseAdmin(); // Attempt re-init
        if (!authInstance) {
             throw new Error("Failed to initialize Auth instance.");
        }
    }
    return authInstance;
}

export function getAppInstance(): App {
    if (!adminApp) {
        // Handle error or optional initialization
         throw new Error("Firebase Admin App not initialized.");
    }
    return adminApp;
}

// Keep helper functions if they are used by other parts of the monorepo via this package
export const verifySessionCookie = async (session: string) => {
  // ... implementation using getAuthInstance() ...
  const auth = getAuthInstance();
  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);
    return { valid: true, uid: decodedClaims.uid };
  } catch (error) {
    return { valid: false, uid: null };
  }
};

export const createSessionCookie = async (idToken: string, expiresIn: number) => {
  // ... implementation using getAuthInstance() ...
  const auth = getAuthInstance();
  return auth.createSessionCookie(idToken, { expiresIn });
}; 