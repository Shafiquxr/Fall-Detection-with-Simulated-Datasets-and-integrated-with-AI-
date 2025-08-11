
'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, HeartPulse } from 'lucide-react';
import DashboardPage from '@/components/dashboard-page';

export default function HomePage() {
  const [activePage, setActivePage] = React.useState('dashboard');

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <HeartPulse className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Fall Wise
                    </h1>
                </div>
            </SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => setActivePage('dashboard')}
                        isActive={activePage === 'dashboard'}
                        tooltip="Dashboard"
                    >
                        <LayoutDashboard />
                        Dashboard
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => setActivePage('caregivers')}
                        isActive={activePage === 'caregivers'}
                        tooltip="Caregivers"
                    >
                        <Users />
                        Caregivers
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </Sidebar>
        <SidebarInset>
            <header className="p-4 border-b flex items-center gap-4 md:hidden sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-primary" />
                    <h1 className="text-lg font-bold tracking-tight text-foreground">
                        Fall Wise
                    </h1>
                </div>
            </header>
            <main className="flex-1">
                <DashboardPage />
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
