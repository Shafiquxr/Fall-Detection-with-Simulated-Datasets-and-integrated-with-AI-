
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Page() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/');
            } else {
                router.replace('/signin');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl">Loading...</div>
        </div>
    );
}
