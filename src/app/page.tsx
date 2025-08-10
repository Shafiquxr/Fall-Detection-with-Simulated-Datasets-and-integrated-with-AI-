
'use client';

import type { FC } from 'react';
import React, { useState, useCallback } from 'react';
import { determineAlertEscalation } from '@/ai/flows/alert-escalation-determination';
import type { Caregiver, FallSeverity, AlertStatus, Escalation } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useInterval } from "@/hooks/use-interval";
import { CaregiverManager } from '@/components/caregiver-manager';
import { AlertStatusCard } from '@/components/alert-status-card';
import { LocationMap } from '@/components/location-map';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { sendNotification } from '@/services/notification-service';

const initialCaregivers: Caregiver[] = [
  { id: '1', name: 'ARIFA', phoneNumber: '+918939837897', avatarUrl: 'https://i.pravatar.cc/150?u=professional-woman-1', dataAiHint: "professional woman", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 30 },
  { id: '2', name: 'Marcus Holloway', phoneNumber: '+14155551234', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-1', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: false, call: true, app: true }, historicalResponseTime: 65 },
  { id: '3', name: 'Chloe Decker', phoneNumber: '+13235555678', avatarUrl: 'https://i.pravatar.cc/150?u=professional-woman-2', dataAiHint: "professional woman", isAvailable: false, contactMethods: { sms: true, call: false, app: true }, historicalResponseTime: 45 },
  { id: '4', name: 'Ben Carter', phoneNumber: '+12125559876', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-2', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: false }, historicalResponseTime: 90 },
  { id: '5', name: 'Dr. Evelyn Reed', phoneNumber: '+442079460958', avatarUrl: 'https://i.pravatar.cc/150?u=professional-man-3', dataAiHint: "professional man", isAvailable: true, contactMethods: { sms: true, call: true, app: true }, historicalResponseTime: 25 },
];

const ESCALATION_TIMEOUT = 9; // seconds

const GuardianAngelPage: FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(initialCaregivers);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('idle');
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [fallSeverity, setFallSeverity] = useState<FallSeverity | null>(null);
  const { toast } = useToast();

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
        setEscalation(prev => prev ? { ...prev, timer: prev.timer - 1 } : null);
        return;
    }

    const nextIndex = escalation.currentIndex + 1;
    if (nextIndex < escalation.path.length) {
        const nextCaregiverIndex = escalation.path[nextIndex];
        notifyCaregiver(nextCaregiverIndex, fallSeverity);
        toast({
            title: "Alert Escalated",
            description: `No response. Notifying next caregiver.`,
            variant: "destructive",
        });
        setEscalation(prev => prev ? { ...prev, currentIndex: nextIndex, timer: ESCALATION_TIMEOUT } : null);
    } else {
        setAlertStatus("idle");
        setEscalation(null);
        toast({
            title: "No Response",
            description: "No caregivers responded to the alert.",
            variant: "destructive",
        });
    }
  }, [escalation, fallSeverity, notifyCaregiver, toast]);

  useInterval(handleEscalation, isTimerRunning ? 1000 : null);

  const resetAlert = useCallback(() => {
    setAlertStatus("idle");
    setEscalation(null);
    setFallSeverity(null);
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
    setAlertStatus('pending');
    setFallSeverity(severity);
    
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
            Fall Wise &copy; {new Date().getFullYear()} - Your safety is our priority.
          </p>
      </footer>
    </div>
  );
};

export default GuardianAngelPage;
