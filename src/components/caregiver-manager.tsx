
'use client'

import type { FC, Dispatch, SetStateAction } from 'react';
import React, { useState } from 'react';
import { Phone, MessageSquare, Bell, User, Users, Edit, PlusCircle, Trash } from 'lucide-react';
import type { Caregiver } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface CaregiverManagerProps {
    caregivers: Caregiver[];
    setCaregivers: Dispatch<SetStateAction<Caregiver[]>>;
}

const emptyCaregiver: Omit<Caregiver, 'id' | 'location'> = {
    name: '',
    phoneNumber: '',
    avatarUrl: 'https://i.pravatar.cc/150',
    dataAiHint: "person",
    isAvailable: true,
    contactMethods: { sms: true, call: true, app: true },
    historicalResponseTime: 40,
}

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


const CaregiverForm: FC<{ 
    caregiver: Partial<Caregiver>; 
    onSave: (updatedCaregiver: Partial<Caregiver>) => void; 
    children: React.ReactNode;
    dialogTitle: string;
}> = ({ caregiver, onSave, children, dialogTitle }) => {
    const [editedCaregiver, setEditedCaregiver] = useState(caregiver);
    const [open, setOpen] = useState(false);

    const handleSave = () => {
        onSave(editedCaregiver);
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={editedCaregiver.name} onChange={(e) => setEditedCaregiver({...editedCaregiver, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" value={editedCaregiver.phoneNumber} onChange={(e) => setEditedCaregiver({...editedCaregiver, phoneNumber: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar URL</Label>
                        <Input id="avatarUrl" value={editedCaregiver.avatarUrl} onChange={(e) => setEditedCaregiver({...editedCaregiver, avatarUrl: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="responseTime">Historical Response Time (s)</Label>
                        <Input id="responseTime" type="number" value={editedCaregiver.historicalResponseTime} onChange={(e) => setEditedCaregiver({...editedCaregiver, historicalResponseTime: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Methods</Label>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="sms" checked={editedCaregiver.contactMethods?.sms} onCheckedChange={(checked) => setEditedCaregiver({...editedCaregiver, contactMethods: {...editedCaregiver.contactMethods, sms: !!checked}})} />
                                <Label htmlFor="sms">SMS</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="call" checked={editedCaregiver.contactMethods?.call} onCheckedChange={(checked) => setEditedCaregiver({...editedCaregiver, contactMethods: {...editedCaregiver.contactMethods, call: !!checked}})} />
                                <Label htmlFor="call">Call</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="app" checked={editedCaregiver.contactMethods?.app} onCheckedChange={(checked) => setEditedCaregiver({...editedCaregiver, contactMethods: {...editedCaregiver.contactMethods, app: !!checked}})} />
                                <Label htmlFor="app">App</Label>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const CaregiverCard: FC<{ caregiver: Caregiver; onAvailabilityChange: (id: string, isAvailable: boolean) => void; onCaregiverUpdate: (caregiver: Caregiver) => void; onCaregiverDelete: (id: string) => void; }> = ({ caregiver, onAvailabilityChange, onCaregiverUpdate, onCaregiverDelete }) => (
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
        <div className="flex items-center gap-1">
             <CaregiverForm caregiver={caregiver} onSave={(updated) => onCaregiverUpdate({...caregiver, ...updated})} dialogTitle="Edit Caregiver">
                <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
            </CaregiverForm>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash className="h-4 w-4"/></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the caregiver from your network.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCaregiverDelete(caregiver.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex flex-col items-end gap-2 pl-2">
                <Switch
                    id={`availability-${caregiver.id}`}
                    checked={caregiver.isAvailable}
                    onCheckedChange={(checked) => onAvailabilityChange(caregiver.id, checked)}
                    aria-label={`${caregiver.name}'s availability`}
                />
                 <Badge variant={caregiver.isAvailable ? "default" : "secondary"} className={`transition-colors text-xs ${caregiver.isAvailable ? 'bg-accent text-accent-foreground' : ''}`}>
                    {caregiver.isAvailable ? 'Available' : 'Away'}
                </Badge>
            </div>
        </div>
    </div>
);


export const CaregiverManager: FC<CaregiverManagerProps> = ({ caregivers, setCaregivers }) => {

  const handleAvailabilityChange = (id: string, isAvailable: boolean) => {
    setCaregivers(prev => prev.map(c => c.id === id ? { ...c, isAvailable } : c));
  };
  
  const handleCaregiverUpdate = (updatedCaregiver: Caregiver) => {
    setCaregivers(prev => prev.map(c => c.id === updatedCaregiver.id ? updatedCaregiver : c));
  };
  
  const handleCaregiverAdd = (newCaregiver: Partial<Caregiver>) => {
    const caregiverToAdd: Caregiver = {
        id: new Date().getTime().toString(), // simple unique id
        location: getRandomLocation(),
        ...emptyCaregiver,
        ...newCaregiver,
    };
    setCaregivers(prev => [...prev, caregiverToAdd]);
  }

  const handleCaregiverDelete = (id: string) => {
    setCaregivers(prev => prev.filter(c => c.id !== id));
  }
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className='flex-row items-center justify-between'>
        <div className='space-y-1.5'>
            <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <span>Caregiver Network</span>
            </CardTitle>
            <CardDescription>Add, edit, and manage caregivers in your network.</CardDescription>
        </div>
        <CaregiverForm caregiver={emptyCaregiver} onSave={handleCaregiverAdd} dialogTitle="Add New Caregiver">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Caregiver
            </Button>
        </CaregiverForm>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {caregivers.length > 0 ? caregivers.map(caregiver => (
                <CaregiverCard 
                    key={caregiver.id} 
                    caregiver={caregiver} 
                    onAvailabilityChange={handleAvailabilityChange}
                    onCaregiverUpdate={handleCaregiverUpdate}
                    onCaregiverDelete={handleCaregiverDelete}
                />
            )) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No caregivers in your network.</p>
                    <p className='text-sm'>Click "Add Caregiver" to get started.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};
