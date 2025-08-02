import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: number;
  xp: number;
  totalGames: number;
  gamesWon: number;
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: string;
    difficulty: string;
    soundEnabled: boolean;
    visualEffects: boolean;
  };
  stats: {
    totalScore: number;
    averageReactionTime: number;
    bestReactionTime: number;
    combosAchieved: number;
    specialCellsActivated: number;
    aiPhaseReached: string;
    preferredQuadrants: number[];
    playtime: number;
    winStreak: number;
    bestWinStreak: number;
  };
  achievements: string[];
  unlockedPersonalities: string[];
  customAIs: string[];
}

export const createUserProfile = async (user: User): Promise<UserProfile> => {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Jugador Anónimo',
    photoURL: user.photoURL || undefined,
    level: 1,
    xp: 0,
    totalGames: 0,
    gamesWon: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'neon',
      difficulty: 'intermediate',
      soundEnabled: true,
      visualEffects: true
    },
    stats: {
      totalScore: 0,
      averageReactionTime: 0,
      bestReactionTime: 0,
      combosAchieved: 0,
      specialCellsActivated: 0,
      aiPhaseReached: 'learning',
      preferredQuadrants: [0, 0, 0, 0],
      playtime: 0,
      winStreak: 0,
      bestWinStreak: 0
    },
    achievements: [],
    unlockedPersonalities: ['chameleon'],
    customAIs: []
  };

  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      lastLogin: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, 'users', result.user.uid), {
      lastLogin: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserProfile(result.user);
    return result;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user profile exists, create if not
    const existingProfile = await getUserProfile(result.user.uid);
    if (!existingProfile) {
      await createUserProfile(result.user);
    } else {
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: new Date().toISOString()
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};