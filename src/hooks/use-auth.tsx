
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Caregiver } from '@/lib/types';


const KUNDRATHUR_SRIPERUMBUDUR_BOUNDS = {
    minLat: 12.96,
    maxLat: 13.00,
    minLng: 79.95,
    maxLng: 80.11,
};
  
const getRandomLocation = (bounds = KUNDRATHUR_SRIPERUMBUDUR_BOUNDS) => {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;
    return { lat, lng };
};

const getInitialCaregivers = (): Omit<Caregiver, 'id'>[] => [
];


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    // Create a fresh list of caregivers for the new user.
    // Each caregiver gets a unique ID to be used as a key in React components.
    const initialCaregivers = getInitialCaregivers().map(c => ({
        ...c,
        id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
    }));

    // Create a new document for the new user in the 'users' collection in Firestore.
    // The document is named with the user's unique ID (uid).
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      caregivers: initialCaregivers,
    });
    return userCredential;
  };

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
