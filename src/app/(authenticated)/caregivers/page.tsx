
'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { CaregiverManager } from '@/components/caregiver-manager';
import type { Caregiver } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const getRandomLocation = (): { lat: number; lng: number } => {
    const KUNDRATHUR_SRIPERUMBUDUR_BOUNDS = {
        minLat: 12.96,
        maxLat: 13.00,
        minLng: 79.95,
        maxLng: 80.11,
    };
    const { minLat, maxLat, minLng, maxLng } = KUNDRATHUR_SRIPERUMBUDUR_BOUNDS;
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;
    return { lat, lng };
};

const getInitialCaregivers = (): Caregiver[] => [
    { id: '1', name: 'Guru Prasath A', phoneNumber: '+915642786743', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-5', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 30, location: getRandomLocation() },
    { id: '2', name: 'Shafiqur Rahaman', phoneNumber: '+918939837897', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-4', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: false, call: true, app: true }, historicalResponseTime: 65, location: getRandomLocation() },
    { id: '3', name: 'Sham Andrew R', phoneNumber: '+916538901510', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-2', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: false }, historicalResponseTime: 90, location: getRandomLocation() },
    { id: '4', name: 'Sean Maximus J', phoneNumber: '+915368109091', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-3', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 25, location: getRandomLocation() },
    { id: '5', name: 'Sanjana Umapathy', phoneNumber: '+917871015864', avatarUrl: 'https://i.pravatar.cc/150?u=professional-woman-2', dataAiHint: "professional woman", isAvailable: false, contactMethods: { sms: true, call: false, app: true }, historicalResponseTime: 45, location: getRandomLocation() },
];

const CaregiversPage: FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);

  useEffect(() => {
    // In a real app, you would fetch this from your backend.
    // For this demo, we'll load from a function and store in localStorage.
    const storedCaregivers = localStorage.getItem('caregivers');
    if (storedCaregivers) {
      setCaregivers(JSON.parse(storedCaregivers));
    } else {
      const initialCaregivers = getInitialCaregivers();
      setCaregivers(initialCaregivers);
      localStorage.setItem('caregivers', JSON.stringify(initialCaregivers));
    }
  }, []);

  const handleSetCaregivers = (newCaregivers: React.SetStateAction<Caregiver[]>) => {
    const updatedCaregivers = typeof newCaregivers === 'function' ? newCaregivers(caregivers) : newCaregivers;
    setCaregivers(updatedCaregivers);
    localStorage.setItem('caregivers', JSON.stringify(updatedCaregivers));
  };

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
