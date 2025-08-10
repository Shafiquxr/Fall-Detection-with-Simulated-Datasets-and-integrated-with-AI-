'use client'

import type { FC } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, Loader, AlertTriangle } from 'lucide-react';
import type { AlertStatus, Caregiver, Escalation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AlertStatusCardProps {
  status: AlertStatus;
  caregiver: Caregiver | null;
  escalation: Escalation | null;
  onAcknowledge: () => void;
  onReset: () => void;
}

const IdleState: FC = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
    <ShieldCheck className="w-20 h-20 text-accent" />
    <h3 className="text-2xl font-semibold">All Clear</h3>
    <p className="text-muted-foreground max-w-sm">
      The system is monitoring for falls. No alerts are currently active.
    </p>
  </div>
);

const PendingState: FC = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
    <Loader className="w-20 h-20 text-primary animate-spin" />
    <h3 className="text-2xl font-semibold">Processing Alert...</h3>
    <p className="text-muted-foreground max-w-sm">
      Potential fall detected. Analyzing data and determining escalation path.
    </p>
  </div>
);

const AcknowledgedState: FC<{ caregiver: Caregiver | null; onReset: () => void }> = ({ caregiver, onReset }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
    <UserCheck className="w-20 h-20 text-accent" />
    <h3 className="text-2xl font-semibold">Alert Acknowledged</h3>
    {caregiver && (
      <p className="text-muted-foreground max-w-sm">
        {caregiver.name} has responded to the alert.
      </p>
    )}
    <Button onClick={onReset} variant="outline">Reset System</Button>
  </div>
);

const ErrorState: FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      <AlertTriangle className="w-20 h-20 text-destructive" />
      <h3 className="text-2xl font-semibold">System Error</h3>
      <p className="text-muted-foreground max-w-sm">
        An error occurred while processing the alert. Please check the system or try again.
      </p>
      <Button onClick={onReset} variant="destructive">Reset System</Button>
    </div>
  );

const ActiveState: FC<Omit<AlertStatusCardProps, 'status' | 'onReset'>> = ({ caregiver, escalation, onAcknowledge }) => {
  if (!caregiver || !escalation) return <PendingState />;

  const progress = (escalation.timer / 9) * 100;

  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
            <ShieldAlert className="w-16 h-16 text-destructive" />
        </div>
        <h3 className="text-3xl font-bold text-destructive">FALL DETECTED</h3>
        <p className="text-muted-foreground">Notifying caregiver...</p>
        
        <div className="flex flex-col items-center gap-4 py-6">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarImage src={caregiver.avatarUrl} alt={caregiver.name} />
            <AvatarFallback>{caregiver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-xl font-medium">{caregiver.name}</p>
        </div>

        <div>
          <Progress value={progress} className="w-full h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Escalating in <span className="font-bold text-foreground">{escalation.timer}s</span>
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={onAcknowledge} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Acknowledge Alert
          </Button>
        </div>
      </div>
    </div>
  );
};


export const AlertStatusCard: FC<AlertStatusCardProps> = (props) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Alert Status</CardTitle>
        <CardDescription>Real-time status of the fall detection system.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex items-center justify-center">
        {props.status === 'idle' && <IdleState />}
        {props.status === 'pending' && <PendingState />}
        {props.status === 'active' && <ActiveState {...props} />}
        {props.status === 'acknowledged' && <AcknowledgedState caregiver={props.caregiver} onReset={props.onReset} />}
        {props.status === 'error' && <ErrorState onReset={props.onReset} />}
      </CardContent>
    </Card>
  );
};
