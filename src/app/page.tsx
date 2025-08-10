'use client';

import type { FC } from 'react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { determineAlertEscalation } from '@/ai/flows/alert-escalation-determination';
import type { Caregiver, FallSeverity, AlertStatus, Escalation } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { CaregiverManager } from '@/components/caregiver-manager';
import { AlertStatusCard } from '@/components/alert-status-card';
import { LocationMap } from '@/components/location-map';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

const initialCaregivers: Caregiver[] = [
  { id: '1', name: 'Eleanor Vance', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: "woman portrait", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 30 },
  { id: '2', name: 'Marcus Holloway', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: "man portrait", isAvailable: true, contactMethods: { sms: false, call: true, app: true }, historicalResponseTime: 65 },
  { id: '3', name: 'Chloe Decker', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: "woman face", isAvailable: false, contactMethods: { sms: true, call: false, app: true }, historicalResponseTime: 45 },
  { id: '4', name: 'Ben Carter', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: "man face", isAvailable: true, contactMethods: { sms: true, call: true, app: false }, historicalResponseTime: 90 },
];

const ESCALATION_TIMEOUT = 9; // seconds

const GuardianAngelPage: FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(initialCaregivers);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('idle');
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetAlert = useCallback(() => {
    stopTimer();
    setAlertStatus("idle");
    setEscalation(null);
  }, [stopTimer]);

  const handleAcknowledge = () => {
    setAlertStatus("acknowledged");
    stopTimer();
    if (escalation) {
        toast({
            title: "Alert Acknowledged",
            description: `${caregivers[escalation.path[escalation.currentIndex]].name} has responded.`,
        });
    }
  };

  useEffect(() => {
    if (alertStatus !== 'active' || !escalation) {
        stopTimer();
        return;
    }

    if(timerRef.current) return;

    timerRef.current = setInterval(() => {
      setEscalation(prev => {
        if (!prev) {
            stopTimer();
            return null;
        }
        if (prev.timer > 1) {
          return { ...prev, timer: prev.timer - 1 };
        }
        
        // Timer reached 0, escalate
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex < prev.path.length) {
          setTimeout(() => {
            toast({
                title: "Alert Escalated",
                description: `No response. Notifying next caregiver.`,
                variant: "destructive",
            });
          }, 0);
          return { ...prev, currentIndex: nextIndex, timer: ESCALATION_TIMEOUT };
        }
        
        // End of escalation path
        stopTimer();
        setAlertStatus("idle"); // Or some "unresolved" state
        setTimeout(() => {
            toast({
                title: "No Response",
                description: "No caregivers responded to the alert.",
                variant: "destructive",
            });
        }, 0);
        return null;
      });
    }, 1000);

    return () => stopTimer();
  }, [alertStatus, escalation, toast, stopTimer]);

  const handleSimulateFall = async (severity: FallSeverity) => {
    resetAlert();
    setAlertStatus('pending');
    
    const availableCaregivers = caregivers.filter(c => c.isAvailable);
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
        caregiverAvailability: caregivers.map(c => c.isAvailable),
        historicalResponseTimes: caregivers.map(c => c.historicalResponseTime),
        fallSeverity: severity,
        escalationTimeout: ESCALATION_TIMEOUT,
      });

      if (!result.escalationPath || result.escalationPath.length === 0) {
        toast({ title: "Simulation Error", description: "Could not determine an escalation path. Are any caregivers available?", variant: "destructive" });
        setAlertStatus('idle');
        return;
      }
      
      setEscalation({
        path: result.escalationPath,
        currentIndex: 0,
        timer: ESCALATION_TIMEOUT,
      });
      setAlertStatus('active');
      toast({
        title: "Fall Detected!",
        description: `Severity: ${severity}. Notifying the first caregiver.`,
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
      <header className="p-4 border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Guardian Angel
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
              onAcknowledge={handleAcknowledge}
              onReset={resetAlert}
            />
            <LocationMap />
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
            Guardian Angel &copy; {new Date().getFullYear()} - Your safety is our priority.
          </p>
      </footer>
    </div>
  );
};

export default GuardianAngelPage;
