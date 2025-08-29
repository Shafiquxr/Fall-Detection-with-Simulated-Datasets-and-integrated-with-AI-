
'use client';

import type { FC } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { CaregiverManager } from '@/components/caregiver-manager';
import type { Caregiver } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CaregiversPage: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This function is now responsible for writing any changes to Firestore.
  const updateCaregiversInDb = useCallback(async (updatedCaregivers: Caregiver[]) => {
    if (!user) return;
    
    try {
        const userDocRef = doc(db, 'users', user.uid);
        // We write the entire updated list back to the document.
        // The 'merge: true' option prevents overwriting other fields in the user document.
        await setDoc(userDocRef, { caregivers: updatedCaregivers }, { merge: true });
    } catch (error) {
        console.error("Error updating caregivers: ", error);
        toast({
            title: "Update Failed",
            description: "Could not save caregiver changes to the database.",
            variant: "destructive",
        });
    }
  }, [user, toast]);

  // The onSnapshot listener remains the single source of truth for reading data.
  // It ensures that any change in the database (from this or any other client)
  // is reflected in the UI in real-time.
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (user) {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // If caregivers exist in the DB, update the state. Otherwise, use an empty array.
                const caregiversFromDb = data.caregivers || [];
                setCaregivers(caregiversFromDb);
            } else {
                // This case might happen for a brand new user before their doc is created.
                setCaregivers([]);
                console.log("No user document found for this user yet.");
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching caregivers:", error);
            toast({
                title: "Error",
                description: "Could not fetch caregiver data.",
                variant: "destructive"
            });
            setIsLoading(false);
        });
    } else {
        // If there's no user, we are not loading and there are no caregivers.
        setIsLoading(false);
        setCaregivers([]);
    }

    // Cleanup the listener when the component unmounts or the user changes.
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [user, toast]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <CaregiverManager 
            caregivers={caregivers} 
            onCaregiversChange={updateCaregiversInDb} // Pass the DB update function
        />
    </div>
  );
};

export default CaregiversPage;
