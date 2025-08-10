
'use client';

import type { FC } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { determineAlertEscalation } from '@/ai/flows/alert-escalation-determination';
import type { Caregiver, FallSeverity, AlertStatus, Escalation, Location } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useInterval } from "@/hooks/use-interval";
import { CaregiverManager } from '@/components/caregiver-manager';
import { AlertStatusCard } from '@/components/alert-status-card';
import { LocationMap } from '@/components/location-map';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { sendNotification } from '@/services/notification-service';

const KUNDRATHUR_SRIPERUMBUDUR_BOUNDS = {
    minLat: 12.96,
    maxLat: 13.00,
    minLng: 79.95,
    maxLng: 80.11,
};
  
const getRandomLocation = (bounds = KUNDRATHUR_SRIPERUMBUDUR_BOUNDS): Location => {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;
    return { lat, lng };
};

const initialCaregivers: Caregiver[] = [
  { id: '1', name: 'Guru Prasath A', phoneNumber: '+915642786743', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-5', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 30, location: getRandomLocation() },
  { id: '2', name: 'Shafiqur Rahaman', phoneNumber: '+918939837897', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-4', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: false, call: true, app: true }, historicalResponseTime: 65, location: getRandomLocation() },
  { id: '3', name: 'Sham Andrew R', phoneNumber: '+916538901510', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-2', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: false }, historicalResponseTime: 90, location: getRandomLocation() },
  { id: '4', name: 'Sean Maximus J', phoneNumber: '+915368109091', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-3', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 25, location: getRandomLocation() },
  { id: '5', name: 'Sanjana Umapathy', phoneNumber: '+917871015864', avatarUrl: 'https://i.pravatar.cc/150?u=professional-woman-2', dataAiHint: "professional woman", isAvailable: false, contactMethods: { sms: true, call: false, app: true }, historicalResponseTime: 45, location: getRandomLocation() },
];

const ESCALATION_TIMEOUT = 9; // seconds

const GuardianAngelPage: FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(initialCaregivers);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('idle');
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [fallSeverity, setFallSeverity] = useState<FallSeverity | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [fallTimestamp, setFallTimestamp] = useState<Date | null>(null);

  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);


  useEffect(() => {
    if (alertStatus === 'active') {
      audioRef.current?.play().catch(console.error);
    } else {
      audioRef.current?.pause();
      if(audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [alertStatus]);

  const isTimerRunning = alertStatus === 'active' && escalation !== null;

  const notifyCaregiver = useCallback(async (caregiverIndex: number, severity: FallSeverity) => {
    const caregiver = caregivers[caregiverIndex];
    if (!caregiver) return;

    toast({
        title: "Notifying Caregiver",
        description: `Contacting ${caregiver.name}...`,
    });

    try {
        await sendNotification(caregiver, severity);
    } catch (error) {
        console.error("Failed to send notification:", error);
        toast({
            title: "Notification Failed",
            description: `Could not send notification to ${caregiver.name}.`,
            variant: "destructive",
        });
    }
  }, [caregivers, toast]);

  const handleEscalation = useCallback(() => {
    if (!escalation || !fallSeverity) return;
  
    if (escalation.timer > 1) {
      setEscalation((prev) => (prev ? { ...prev, timer: prev.timer - 1 } : null));
      return;
    }
  
    const nextIndex = (escalation.currentIndex + 1) % escalation.path.length;
    const nextCaregiverIndex = escalation.path[nextIndex];
  
    notifyCaregiver(nextCaregiverIndex, fallSeverity);
  
    const isLooping = nextIndex < escalation.currentIndex;
  
    toast({
      title: isLooping ? "Restarting Alert Cycle" : "Alert Escalated",
      description: `No response. Notifying ${isLooping ? 'first' : 'next'} caregiver.`,
      variant: "destructive",
    });
  
    setEscalation((prev) => (prev ? { ...prev, currentIndex: nextIndex, timer: ESCALATION_TIMEOUT } : null));
  }, [escalation, fallSeverity, notifyCaregiver, toast]);

  useInterval(handleEscalation, isTimerRunning ? 1000 : null);

  const resetAlert = useCallback(() => {
    setAlertStatus("idle");
    setEscalation(null);
    setFallSeverity(null);
    setLocation(null);
    setFallTimestamp(null);
  }, []);

  const handleAcknowledge = () => {
    setAlertStatus("acknowledged");
    if (escalation) {
        const currentCaregiver = caregivers[escalation.path[escalation.currentIndex]];
        if (currentCaregiver) {
            toast({
                title: "Alert Acknowledged",
                description: `${currentCaregiver.name} has responded.`,
            });
        }
    }
  };


  const handleSimulateFall = async (severity: FallSeverity) => {
    resetAlert();

    // Regenerate caregiver locations for each simulation
    const updatedCaregivers = caregivers.map(c => ({
        ...c,
        location: getRandomLocation()
    }));
    setCaregivers(updatedCaregivers);

    const newLocation = getRandomLocation();
    setLocation(newLocation);
    setFallTimestamp(new Date());
    setAlertStatus('pending');
    setFallSeverity(severity);
    
    const availableCaregivers = updatedCaregivers.filter(c => c.isAvailable);
    if (availableCaregivers.length === 0) {
        toast({
            title: "Simulation Failed",
            description: "No caregivers are available.",
            variant: "destructive",
        });
        setAlertStatus('idle');
        return;
    }
    
    try {
      const result = await determineAlertEscalation({
        caregiverAvailability: updatedCaregivers.map(c => c.isAvailable),
        caregiverLocations: updatedCaregivers.map(c => c.location),
        historicalResponseTimes: updatedCaregivers.map(c => c.historicalResponseTime),
        fallLocation: newLocation,
        fallSeverity: severity,
        escalationTimeout: ESCALATION_TIMEOUT,
      });

      if (!result.escalationPath || result.escalationPath.length === 0) {
        toast({ title: "Simulation Error", description: "Could not determine an escalation path. Are any caregivers available?", variant: "destructive" });
        setAlertStatus('idle');
        return;
      }

      const firstCaregiverIndex = result.escalationPath[0];
      
      setEscalation({
        path: result.escalationPath,
        currentIndex: 0,
        timer: ESCALATION_TIMEOUT,
      });
      setAlertStatus('active');
      
      await notifyCaregiver(firstCaregiverIndex, severity);
      
      toast({
        title: "Fall Detected!",
        description: `Severity: ${severity}. Notifying the nearest caregiver.`,
      });

    } catch (error) {
      console.error("Error determining escalation path:", error);
      toast({ title: "AI Error", description: "The AI model failed to determine an escalation path.", variant: "destructive" });
      setAlertStatus('error');
    }
  };

  const isAlertActive = alertStatus === 'active' || alertStatus === 'pending' || alertStatus === 'acknowledged';
  const currentCaregiver = escalation ? caregivers[escalation.path[escalation.currentIndex]] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" loop />
      <header className="p-4 border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Fall Wise
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <AlertStatusCard 
              status={alertStatus} 
              caregiver={currentCaregiver}
              escalation={escalation}
              fallTimestamp={fallTimestamp}
              onAcknowledge={handleAcknowledge}
              onReset={resetAlert}
            />
            <LocationMap 
                location={location} 
                caregivers={caregivers.filter(c => c.isAvailable)} 
                isAlertActive={isAlertActive}
             />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <CaregiverManager 
              caregivers={caregivers} 
              setCaregivers={setCaregivers}
              onSimulateFall={handleSimulateFall}
              isAlertActive={isAlertActive}
            />
          </div>
        </div>
      </main>

      <footer className="container mx-auto p-4 mt-8">
          <Separator />
          <p className="text-center text-sm text-muted-foreground pt-4">
            Fall Wise &copy; {new Date().getFullYear()} - Your safety is our priority.
          </p>
      </footer>
    </div>
  );
};

export default GuardianAngelPage;

    

    

    