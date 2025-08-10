
'use client'

import type { FC } from 'react';
import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, PhoneIncoming, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { CommunicationStatus, Caregiver } from '@/lib/types';

interface CommunicationCardProps {
    status: CommunicationStatus;
    caregiver: Caregiver | null;
    onAccept: () => void;
    onEnd: () => void;
}

const CallingState: FC<{ caregiver: Caregiver; onAccept: () => void }> = ({ caregiver, onAccept }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
        <Avatar className="w-24 h-24 border-4 border-primary animate-pulse">
            <AvatarImage src={caregiver.avatarUrl} alt={caregiver.name} />
            <AvatarFallback>{caregiver.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="text-2xl font-semibold">Incoming Call</h3>
        <p className="text-muted-foreground">{caregiver.name} is calling to check on you.</p>
        <Button onClick={onAccept} size="lg" className="bg-green-600 hover:bg-green-700 text-white mt-4">
            <Phone className="mr-2 h-5 w-5" />
            Accept Call
        </Button>
    </div>
);

const ActiveState: FC<{ caregiver: Caregiver; onEnd: () => void }> = ({ caregiver, onEnd }) => {
    const [isMuted, setIsMuted] = React.useState(false);
    
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
             <Avatar className="w-24 h-24 border-4 border-green-500">
                <AvatarImage src={caregiver.avatarUrl} alt={caregiver.name} />
                <AvatarFallback>{caregiver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-semibold">Connected</h3>
            <p className="text-muted-foreground">Speaking with {caregiver.name}</p>
            <div className="text-green-500 flex items-center gap-2 font-mono">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                00:27
            </div>

            <div className="flex gap-4 pt-6">
                <Button onClick={() => setIsMuted(prev => !prev)} variant="outline" size="lg">
                    {isMuted ? <MicOff /> : <Mic />}
                    {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button onClick={onEnd} variant="destructive" size="lg">
                    <PhoneOff />
                    End Call
                </Button>
            </div>
        </div>
    )
};

const ErrorState: FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      <AlertTriangle className="w-20 h-20 text-destructive" />
      <h3 className="text-2xl font-semibold">Connection Failed</h3>
      <p className="text-muted-foreground max-w-sm">
        Could not establish a connection. Please ensure you have microphone permissions enabled.
      </p>
    </div>
)


export const CommunicationCard: FC<CommunicationCardProps> = ({ status, caregiver, onAccept, onEnd }) => {
    if (!caregiver) return null;

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <PhoneIncoming className="w-6 h-6" />
                    <span>Two-Way Communication</span>
                </CardTitle>
                <CardDescription>Speak with your caregiver to confirm your status.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
                {status === 'calling' && <CallingState caregiver={caregiver} onAccept={onAccept} />}
                {status === 'active' && <ActiveState caregiver={caregiver} onEnd={onEnd} />}
            </CardContent>
        </Card>
    );
};
