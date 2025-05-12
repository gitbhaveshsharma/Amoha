import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ArtworkReviewPayload } from '@/types/artworkReview';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

interface ArtworkReview {
    id: string;
    artwork_id: string;
    artworks: {
        image_url: string;
        description: string;
        user_id: string;
    };
}

interface ProcessedResult {
    artworkId: string;
    status: 'processed' | 'failed';
}

export async function GET() {
    try {
        // Get up to 15 queued reviews (with artwork data)
        const { data: queuedReviews, error } = await supabase
            .from('artwork_reviews')
            .select(`
        id,
        artwork_id,
        artworks(
          image_url,
          description,
          user_id
        )
      `)
            .eq('processing_status', 'queued')
            .order('created_at', { ascending: true })
            .limit(15);

        if (error) throw error;
        if (!queuedReviews || queuedReviews.length === 0) {
            return NextResponse.json({ message: 'No queued reviews to process' });
        }

        // Update status to processing
        const { error: updateError } = await supabase
            .from('artwork_reviews')
            .update({ processing_status: 'processing' })
            .in('id', queuedReviews.map(r => r.id));

        if (updateError) throw updateError;

        // Process each review
        const results: ProcessedResult[] = [];
        for (const review of queuedReviews as unknown as ArtworkReview[]) {
            try {
                if (!review.artworks || !review.artworks.image_url || !review.artworks.description || !review.artworks.user_id) {
                    throw new Error(`Invalid artwork data for review ${review.id}`);
                }

                const payload: ArtworkReviewPayload = {
                    artworkId: review.artwork_id,
                    imageUrl: review.artworks.image_url,
                    description: review.artworks.description
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/artwork-review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`Failed to process artwork ${review.artwork_id}`);

                results.push({
                    artworkId: review.artwork_id,
                    status: 'processed'
                });
            } catch (error) {
                console.error(`Error processing artwork ${review.artwork_id}:`, error);
                await supabase
                    .from('artwork_reviews')
                    .update({
                        processing_status: 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', review.id);

                results.push({
                    artworkId: review.artwork_id,
                    status: 'failed'
                });
            }
        }

        return NextResponse.json({
            message: 'Processing completed',
            processedCount: results.filter(r => r.status === 'processed').length,
            results
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json(
            { error: 'Failed to process reviews' },
            { status: 500 }
        );
    }
}