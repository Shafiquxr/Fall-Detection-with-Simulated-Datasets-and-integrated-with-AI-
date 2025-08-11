
'use client';

import type { FC } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { determineAlertEscalation } from '@/ai/flows/alert-escalation-determination';
import type { Caregiver, FallSeverity, AlertStatus, Escalation, Location, CommunicationStatus } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useInterval } from "@/hooks/use-interval";
import { AlertStatusCard } from '@/components/alert-status-card';
import { LocationMap } from '@/components/location-map';
import { sendNotification } from '@/services/notification-service';
import { CommunicationCard } from '@/components/communication-card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TestTubeDiagonal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

const ESCALATION_TIMEOUT = 9; // seconds

const DashboardPage: FC = () => {
    const { user } = useAuth();
    const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
    const [alertStatus, setAlertStatus] = useState<AlertStatus>('idle');
    const [communicationStatus, setCommunicationStatus] = useState<CommunicationStatus>('idle');
    const [escalation, setEscalation] = useState<Escalation | null>(null);
    const [fallSeverity, setFallSeverity] = useState<FallSeverity | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [fallTimestamp, setFallTimestamp] = useState<Date | null>(null);
    const [simulationSeverity, setSimulationSeverity] = useState<FallSeverity>('medium');

  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);


  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCaregivers(data.caregivers || []);
        }
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);


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
    if(!escalation) return;
    const path = escalation.path;
    const caregiverId = path[caregiverIndex];
    const caregiver = caregivers[caregiverId];

    if(!caregiver) return;

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
  }, [caregivers, toast, escalation]);

  const handleEscalation = useCallback(() => {
    if (!escalation || !fallSeverity) return;
  
    if (escalation.timer > 1) {
      setEscalation((prev) => (prev ? { ...prev, timer: prev.timer - 1 } : null));
      return;
    }
  
    const nextIndex = (escalation.currentIndex + 1) % escalation.path.length;
    
    notifyCaregiver(nextIndex, fallSeverity);

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
    setCommunicationStatus("idle");
    setEscalation(null);
    setFallSeverity(null);
    setLocation(null);
    setFallTimestamp(null);
  }, []);

  const handleAcknowledge = () => {
    setAlertStatus("acknowledged");
    setCommunicationStatus('calling');
    if (escalation) {
        const currentCaregiver = caregivers.find(c => c.id === escalation.path[escalation.currentIndex].toString());
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

    const updatedCaregivers = caregivers.map(c => ({
        ...c,
        location: getRandomLocation()
    }));
    // Note: We don't call setCaregivers here as we are not persisting these random locations.
    
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
  const showCommunicationCard = alertStatus === 'acknowledged' && communicationStatus !== 'ended' && currentCaregiver;

  return (
    <>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {showCommunicationCard ? (
              <CommunicationCard
                  caregiver={currentCaregiver}
                  status={communicationStatus}
                  onAccept={() => setCommunicationStatus('active')}
                  onEnd={() => {
                      setCommunicationStatus('ended');
                      resetAlert();
                      toast({ title: "Call Ended", description: "The incident has been resolved."});
                  }}
              />
          ) : (
              <AlertStatusCard 
              status={alertStatus} 
              caregiver={currentCaregiver}
              escalation={escalation}
              fallTimestamp={fallTimestamp}
              onAcknowledge={handleAcknowledge}
              onReset={resetAlert}
              />
          )}
          <LocationMap 
              location={location} 
              caregivers={caregivers.filter(c => c.isAvailable)} 
              isAlertActive={isAlertActive}
            />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <TestTubeDiagonal className="w-6 h-6" />
                      <span>System Simulation</span>
                  </CardTitle>
                  <CardDescription>Trigger a test alert to ensure the system is working correctly.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col gap-4">
                      <Select
                          onValueChange={(value: FallSeverity) => setSimulationSeverity(value)}
                          defaultValue={simulationSeverity}
                          disabled={isAlertActive}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Select fall severity" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="low">Low Severity</SelectItem>
                              <SelectItem value="medium">Medium Severity</SelectItem>
                              <SelectItem value="high">High Severity</SelectItem>
                          </SelectContent>
                      </Select>
                      <Button onClick={() => handleSimulateFall(simulationSeverity)} disabled={isAlertActive} size="lg">
                          Simulate Fall Event
                      </Button>
                  </div>
              </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
