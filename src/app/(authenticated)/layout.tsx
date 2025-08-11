
'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, HeartPulse, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function AuthenticatedLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  const pathname = usePathname();
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

  const getActivePage = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/caregivers')) return 'caregivers';
    return '';
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                            isActive={getActivePage() === 'dashboard'}
                            tooltip="Dashboard"
                        >
                            <LayoutDashboard />
                            Dashboard
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => router.push('/caregivers')}
                            isActive={getActivePage() === 'caregivers'}
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
                <main className="flex-1 container mx-auto p-4 md:p-8">
                    {children}
                </main>
                 <footer className="container mx-auto p-4 mt-8">
                    <Separator />
                    <p className="text-center text-sm text-muted-foreground pt-4">
                        Fall Wise &copy; {new Date().getFullYear()} - Your safety is our priority.
                    </p>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
