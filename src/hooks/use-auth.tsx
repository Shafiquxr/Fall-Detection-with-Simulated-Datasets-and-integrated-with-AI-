
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
    { name: 'Guru Prasath A', phoneNumber: '+915642786743', isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 30, location: getRandomLocation() },
    { name: 'Shafiqur Rahaman', phoneNumber: '+918939837897', isAvailable: true, contactMethods: { sms: false, call: true, app: true }, historicalResponseTime: 65, location: getRandomLocation() },
    { name: 'Sham Andrew R', phoneNumber: '+916538901510', isAvailable: true, contactMethods: { sms: true, call: true, app: false }, historicalResponseTime: 90, location: getRandomLocation() },
    { name: 'Sean Maximus J', phoneNumber: '+915368109091', isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 25, location: getRandomLocation() },
    { name: 'Sanjana Umapathy', phoneNumber: '+917871015864', isAvailable: false, contactMethods: { sms: true, call: false, app: true }, historicalResponseTime: 45, location: getRandomLocation() },
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
    
    const initialCaregivers = getInitialCaregivers().map(c => ({
        ...c,
        id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
    }));

    // Create a document for the new user in Firestore
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
