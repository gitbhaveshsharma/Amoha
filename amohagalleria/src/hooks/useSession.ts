// hooks/useSession.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export function useSession() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { session, loading };
}