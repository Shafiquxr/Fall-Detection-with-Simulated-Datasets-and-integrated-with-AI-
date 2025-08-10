'use client'

import type { FC, Dispatch, SetStateAction } from 'react';
import React, { useState } from 'react';
import { Phone, MessageSquare, Bell, User, Users, ChevronDown } from 'lucide-react';
import type { Caregiver, FallSeverity } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';

const CaregiverCard: FC<{ caregiver: Caregiver; onAvailabilityChange: (id: string, isAvailable: boolean) => void; isAlertActive: boolean }> = ({ caregiver, onAvailabilityChange, isAlertActive }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src={caregiver.avatarUrl} alt={caregiver.name} data-ai-hint={caregiver.dataAiHint} />
                <AvatarFallback>{caregiver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{caregiver.name}</p>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    {caregiver.contactMethods.call && <Phone className="h-4 w-4" />}
                    {caregiver.contactMethods.sms && <MessageSquare className="h-4 w-4" />}
                    {caregiver.contactMethods.app && <Bell className="h-4 w-4" />}
                </div>
                {caregiver.phoneNumber && <p className="text-xs text-muted-foreground">{caregiver.phoneNumber}</p>}
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Switch
                id={`availability-${caregiver.id}`}
                checked={caregiver.isAvailable}
                onCheckedChange={(checked) => onAvailabilityChange(caregiver.id, checked)}
                disabled={isAlertActive}
                aria-label={`${caregiver.name}'s availability`}
            />
             <Badge variant={caregiver.isAvailable ? "default" : "secondary"} className={`transition-colors ${caregiver.isAvailable ? 'bg-accent text-accent-foreground' : ''}`}>
                {caregiver.isAvailable ? 'Available' : 'Away'}
            </Badge>
        </div>
    </div>
);


export const CaregiverManager: FC<CaregiverManagerProps> = ({ caregivers, setCaregivers, onSimulateFall, isAlertActive }) => {
  const [severity, setSeverity] = useState<FallSeverity>('medium');

  const handleAvailabilityChange = (id: string, isAvailable: boolean) => {
    setCaregivers(prev => prev.map(c => c.id === id ? { ...c, isAvailable } : c));
  };
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span>Caregiver Network</span>
        </CardTitle>
        <CardDescription>Manage caregivers and simulate fall events.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {caregivers.map(caregiver => (
                <CaregiverCard 
                    key={caregiver.id} 
                    caregiver={caregiver} 
                    onAvailabilityChange={handleAvailabilityChange}
                    isAlertActive={isAlertActive}
                />
            ))}
        </div>

        <Separator className="my-6" />

        <div>
            <h3 className="text-lg font-semibold mb-2">Fall Simulation</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Trigger a test alert to ensure the system is working correctly.
            </p>
            <div className="flex flex-col gap-4">
                <Select
                    onValueChange={(value: FallSeverity) => setSeverity(value)}
                    defaultValue={severity}
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
                <Button onClick={() => onSimulateFall(severity)} disabled={isAlertActive} size="lg">
                    Simulate Fall Event
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
