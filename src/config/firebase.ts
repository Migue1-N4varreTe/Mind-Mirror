// Mock Firebase configuration that works without real Firebase keys
// This allows the app to function completely offline until real Firebase keys are added

// Check if we have real Firebase keys (not demo keys)
const hasRealFirebaseKeys = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('demo') &&
  !import.meta.env.VITE_FIREBASE_PROJECT_ID.includes('demo')
);

console.log('🔥 Firebase Status:', hasRealFirebaseKeys ? 'Real keys detected' : 'Using mock mode');

let app: any = null;
let auth: any = null;
let db: any = null;
let analytics: any = null;

if (hasRealFirebaseKeys) {
  // Only import and initialize Firebase if we have real keys
  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getAnalytics } = await import('firebase/analytics');

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    console.log('✅ Firebase initialized with real configuration');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    // Fall back to mock mode
    hasRealFirebaseKeys = false;
  }
}

// Mock implementations for development without Firebase
if (!hasRealFirebaseKeys) {
  console.log('🧪 Using Firebase mock mode for development');

  // Mock user for development
  const mockUser = {
    uid: 'mock-user-123',
    email: 'demo@mindmirror.dev',
    displayName: 'Usuario Demo',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve('mock-id-token'),
    getIdTokenResult: () => Promise.resolve({
      token: 'mock-id-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: 'password',
      claims: {}
    }),
    reload: () => Promise.resolve(),
    toJSON: () => ({ uid: 'mock-user-123', email: 'demo@mindmirror.dev' })
  };

  // Mock authentication
  auth = {
    currentUser: mockUser,
    onAuthStateChanged: (callback: Function) => {
      // Simulate authenticated user in development
      setTimeout(() => callback(mockUser), 100);
      return () => {}; // unsubscribe function
    },
    signInWithEmailAndPassword: (email: string, password: string) => {
      console.log('🧪 Mock sign in with:', email);
      return Promise.resolve({ user: mockUser });
    },
    createUserWithEmailAndPassword: (email: string, password: string) => {
      console.log('🧪 Mock create user with:', email);
      return Promise.resolve({ user: { ...mockUser, email } });
    },
    signOut: () => {
      console.log('🧪 Mock sign out');
      return Promise.resolve();
    },
    signInWithPopup: (provider: any) => {
      console.log('🧪 Mock sign in with popup');
      return Promise.resolve({ user: mockUser });
    },
    updateProfile: (profile: any) => {
      console.log('🧪 Mock update profile:', profile);
      return Promise.resolve();
    }
  };

  // Mock Firestore
  const mockDoc = {
    id: 'mock-doc-id',
    exists: true,
    data: () => ({
      displayName: 'Usuario Demo',
      email: 'demo@mindmirror.dev',
      preferences: {
        theme: 'neon-cyberpunk',
        difficulty: 'intermediate'
      },
      stats: {
        gamesPlayed: 42,
        totalScore: 15650,
        achievements: 12
      }
    }),
    get: (field: string) => {
      const data = mockDoc.data();
      return data[field as keyof typeof data];
    },
    ref: {
      id: 'mock-doc-id',
      path: 'users/mock-user-123'
    }
  };

  db = {
    collection: (path: string) => ({
      doc: (id?: string) => ({
        id: id || 'mock-doc-id',
        get: () => Promise.resolve(mockDoc),
        set: (data: any) => {
          console.log(`🧪 Mock set ${path}/${id}:`, data);
          return Promise.resolve();
        },
        update: (data: any) => {
          console.log(`🧪 Mock update ${path}/${id}:`, data);
          return Promise.resolve();
        },
        delete: () => {
          console.log(`🧪 Mock delete ${path}/${id}`);
          return Promise.resolve();
        },
        onSnapshot: (callback: Function) => {
          setTimeout(() => callback(mockDoc), 100);
          return () => {}; // unsubscribe
        }
      }),
      add: (data: any) => {
        console.log(`🧪 Mock add to ${path}:`, data);
        return Promise.resolve({ id: 'mock-new-doc-id' });
      },
      where: (field: string, operator: string, value: any) => ({
        get: () => {
          console.log(`🧪 Mock query ${path} where ${field} ${operator} ${value}`);
          return Promise.resolve({
            docs: [mockDoc],
            empty: false,
            size: 1
          });
        },
        onSnapshot: (callback: Function) => {
          setTimeout(() => callback({
            docs: [mockDoc],
            empty: false,
            size: 1
          }), 100);
          return () => {};
        }
      }),
      orderBy: (field: string, direction?: string) => ({
        limit: (count: number) => ({
          get: () => Promise.resolve({
            docs: [mockDoc],
            empty: false,
            size: 1
          })
        })
      })
    }),
    doc: (path: string) => ({
      get: () => Promise.resolve(mockDoc),
      set: (data: any) => {
        console.log(`🧪 Mock set ${path}:`, data);
        return Promise.resolve();
      },
      update: (data: any) => {
        console.log(`🧪 Mock update ${path}:`, data);
        return Promise.resolve();
      },
      delete: () => {
        console.log(`🧪 Mock delete ${path}`);
        return Promise.resolve();
      }
    })
  };

  // Mock Analytics
  analytics = {
    logEvent: (eventName: string, parameters?: any) => {
      console.log(`🧪 Mock analytics event: ${eventName}`, parameters);
    },
    setUserId: (userId: string) => {
      console.log(`🧪 Mock analytics setUserId: ${userId}`);
    },
    setUserProperties: (properties: any) => {
      console.log(`🧪 Mock analytics setUserProperties:`, properties);
    }
  };

  // Mock app
  app = {
    name: 'mock-app',
    options: {
      projectId: 'mock-project'
    }
  };
}

export { auth, db, analytics };
export default app;
