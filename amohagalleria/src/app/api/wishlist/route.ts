// src/app/api/wishlist/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        console.log('[Wishlist GET] Fetching wishlist');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (sessionError || !session || !session.user) {
            console.error('[Wishlist GET] No valid session found');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log(`[Wishlist GET] User ID: ${session.user.id}`);
        const { data, error } = await supabase
            .from("wishlist")
            .select("artwork_id")
            .eq("user_id", session.user.id)
            .eq("status", "active");

        if (error) {
            console.error('[Wishlist GET] Supabase error:', error);
            throw error;
        }

        const wishlistItems: string[] = data?.map((item: { artwork_id: string }) => item.artwork_id) || [];
        console.log('[Wishlist GET] Found items:', wishlistItems);
        return NextResponse.json({ wishlist: wishlistItems });
    } catch (error) {
        console.error('[Wishlist GET] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        console.log('[Wishlist POST] Handling request');
        const { artworkId } = await req.json();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.error('[Wishlist POST] No session found');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log(`[Wishlist POST] User ID: ${session.user.id}, Artwork ID: ${artworkId}`);
        const { data: existing, error: fetchError } = await supabase
            .from("wishlist")
            .select()
            .eq("user_id", session.user.id)
            .eq("artwork_id", artworkId)
            .maybeSingle();

        if (fetchError) {
            console.error('[Wishlist POST] Supabase fetch error:', fetchError);
            throw fetchError;
        }

        if (existing) {
            const newStatus = existing.status === "active" ? "inactive" : "active";
            console.log(`[Wishlist POST] Updating existing (ID: ${existing.id}) to ${newStatus}`);

            const { error: updateError } = await supabase
                .from("wishlist")
                .update({ status: newStatus })
                .eq("id", existing.id);

            if (updateError) {
                console.error('[Wishlist POST] Supabase update error:', updateError);
                throw updateError;
            }
        } else {
            console.log('[Wishlist POST] Creating new wishlist item');
            const { error: insertError } = await supabase.from("wishlist").insert({
                user_id: session.user.id,
                artwork_id: artworkId,
                status: "active",
                created_at: new Date().toISOString()
            });

            if (insertError) {
                console.error('[Wishlist POST] Supabase insert error:', insertError);
                throw insertError;
            }
        }

        console.log('[Wishlist POST] Update successful');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Wishlist POST] Error updating wishlist:", error);
        return NextResponse.json(
            { error: 'Failed to update wishlist' },
            { status: 500 }
        );
    }
}