
'use client';

import type { FC } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { CaregiverManager } from '@/components/caregiver-manager';
import type { Caregiver } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const CaregiversPage: FC = () => {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSetCaregivers = useCallback(async (newCaregivers: React.SetStateAction<Caregiver[]>) => {
    if (!user) return;
    
    const caregiverResolver = (typeof newCaregivers === 'function') ? newCaregivers(caregivers) : newCaregivers;
    
    try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { caregivers: caregiverResolver }, { merge: true });
        // The onSnapshot listener will update the state, so we don't need to call setCaregivers here.
    } catch (error) {
        console.error("Error updating caregivers: ", error);
    }
  }, [user, caregivers]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const caregiversFromDb = data.caregivers || [];
                setCaregivers(caregiversFromDb);
            } else {
                console.log("No user document found!");
            }
            setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [user]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                 <CaregiverManager 
                    caregivers={caregivers} 
                    setCaregivers={handleSetCaregivers}
                />
            </div>
        </div>

      <footer className="container mx-auto p-4 mt-8">
          <Separator />
          <p className="text-center text-sm text-muted-foreground pt-4">
            Fall Wise &copy; {new Date().getFullYear()} - Your safety is our priority.
          </p>
      </footer>
    </div>
  );
};

export default CaregiversPage;
