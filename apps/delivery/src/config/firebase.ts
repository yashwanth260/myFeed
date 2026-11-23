import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
export const isFirebaseConfigured = Boolean(
  rawApiKey && rawApiKey.trim().length > 0 && !rawApiKey.includes('YOUR_')
);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'feedodeliverypartner.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'feedodeliverypartner',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'feedodeliverypartner.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Singleton Firebase App instance (safely initialized only when valid apiKey is set)
export const app: FirebaseApp | null = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

// Singleton Firebase Auth instance
export const auth: Auth | null = app ? getAuth(app) : null;

if (auth) {
  auth.languageCode = 'en';
}

let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

/**
 * Initializes or reuses an invisible RecaptchaVerifier on the specified container.
 * Cleans up existing widget instances to prevent duplicates.
 */
export const initRecaptchaVerifier = (
  containerId: string,
  onSuccess?: () => void,
  onExpired?: () => void
): RecaptchaVerifier | null => {
  if (!auth) {
    return null;
  }

  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear();
    } catch {
      // Ignored if already cleared
    }
    recaptchaVerifierInstance = null;
  }

  recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      if (onSuccess) onSuccess();
    },
    'expired-callback': () => {
      if (onExpired) onExpired();
    },
  });

  return recaptchaVerifierInstance;
};

/**
 * Sends a phone OTP through Firebase Phone Authentication.
 */
export const sendPhoneOtp = async (
  phoneWithCountryCode: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure VITE_FIREBASE_API_KEY in .env.');
  }
  return await signInWithPhoneNumber(auth, phoneWithCountryCode, verifier);
};

export const safeSignOut = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

export const safeOnAuthStateChanged = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
};
export type { ConfirmationResult, FirebaseUser };
