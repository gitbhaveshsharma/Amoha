// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to check if we're on client side
export const isClient = typeof window !== 'undefined';

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let instanceCount = 0; // Keep debug counter for monitoring

function getSupabaseClient() {
    if (!supabaseInstance && isClient) {
        instanceCount++;
        console.log(`Creating Supabase instance #${instanceCount}`);

        supabaseInstance = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        });
    }

    // For server-side rendering, create a new instance each time
    // but on client side, return the singleton instance
    return supabaseInstance || createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false, // Disable for SSR instances
        },
    });
}

export const supabase = getSupabaseClient();

// Export a method to check if the client has been initialized
export const hasSupabaseClientInitialized = () => !!supabaseInstance;