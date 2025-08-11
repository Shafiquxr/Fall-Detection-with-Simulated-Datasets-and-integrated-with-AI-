
'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, HeartPulse, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function AuthenticatedLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  const [activePage, setActivePage] = React.useState('dashboard');
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl">Loading...</div>
        </div>
    )
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

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
                        onClick={() => router.push('/')}
                        isActive={activePage === 'dashboard'}
                        tooltip="Dashboard"
                    >
                        <LayoutDashboard />
                        Dashboard
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton 
                        onClick={() => router.push('/caregivers')}
                        isActive={activePage === 'caregivers'}
                        tooltip="Caregivers"
                    >
                        <Users />
                        Caregivers
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu className="mt-auto">
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                        <LogOut />
                        Sign Out
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
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
