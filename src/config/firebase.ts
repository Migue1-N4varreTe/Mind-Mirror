import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Check if Firebase environment variables are configured
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Firebase configuration with fallback values for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-DEMO123'
};

let app: any = null;
let auth: any = null;
let db: any = null;
let analytics: any = null;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);

  // Only initialize analytics in production with valid config
  if (typeof window !== 'undefined' && isFirebaseConfigured) {
    analytics = getAnalytics(app);
  }

  // If using demo config, connect to emulators in development
  if (!isFirebaseConfigured && import.meta.env.DEV) {
    console.warn('🔥 Firebase: Using demo configuration. Set environment variables for production.');

    // Connect to Firebase emulators if they're running
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Emulators not running, continue with demo mode
      console.log('Firebase emulators not available, using mock mode');
    }
  }

} catch (error) {
  console.error('Firebase initialization error:', error);

  // Create mock implementations for development
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: Function) => {
      // Mock authentication state
      callback(null);
      return () => {}; // unsubscribe function
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.resolve(),
    signInWithPopup: () => Promise.reject(new Error('Firebase not configured'))
  };

  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      where: () => ({
        get: () => Promise.resolve({ docs: [] })
      })
    })
  };

  analytics = null;
}

export { auth, db, analytics };
export default app;
