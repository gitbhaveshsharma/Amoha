//api/artwork/review-processor/route.ts
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
        status: string;
    };
}

interface ProcessedResult {
    artworkId: string;
    status: 'processed' | 'failed';
    error?: string;
    details?: any;
}

const PROCESSING_TIMEOUT = 240000; // 4 minutes

export async function GET() {
    try {
        // Get the single artwork that needs processing
        const { data: artworkReview, error: fetchError } = await supabase
            .from('artwork_reviews')
            .select(`
        id,
        artwork_id,
        artworks(
          image_url,
          description,
          user_id,
          status
        )
      `)
            .eq('processing_status', 'queued')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!artworkReview) {
            return NextResponse.json({
                message: 'No artwork reviews to process',
                status: 'skipped'
            });
        }

        // Mark as processing
        const { error: updateError } = await supabase
            .from('artwork_reviews')
            .update({
                processing_status: 'processing',
                updated_at: new Date().toISOString()
            })
            .eq('id', validateArtworkReview(artworkReview).id);

        if (updateError) throw updateError;

        // Process the single artwork
        const result = await processReview(artworkReview as unknown as ArtworkReview);

        return NextResponse.json({
            message: result.status === 'processed'
                ? 'Artwork processed successfully'
                : 'Artwork processing failed',
            ...result
        });

    } catch (error) {
        console.error('Processing failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                error: 'Failed to process artwork',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

function validateArtworkReview(data: any): ArtworkReview {
    if (
        typeof data.id === 'string' &&
        typeof data.artwork_id === 'string' &&
        data.artworks &&
        typeof data.artworks.image_url === 'string' &&
        typeof data.artworks.description === 'string' &&
        typeof data.artworks.user_id === 'string' &&
        typeof data.artworks.status === 'string'
    ) {
        return data as ArtworkReview;
    }
    throw new Error('Invalid artwork review data structure');
}

async function processReview(review: ArtworkReview): Promise<ProcessedResult> {
    const timer = setTimeout(async () => {
        await supabase
            .from('artwork_reviews')
            .update({
                processing_status: 'failed',
                updated_at: new Date().toISOString(),
                error: 'Processing timeout'
            })
            .eq('id', review.id);
    }, PROCESSING_TIMEOUT);

    try {
        // Validate artwork data
        if (!review.artworks ||
            !review.artworks.image_url ||
            !review.artworks.description ||
            !review.artworks.user_id) {
            throw new Error('Incomplete artwork data');
        }

        // Skip if already processed
        if (review.artworks.status !== 'pending_review') {
            return {
                artworkId: review.artwork_id,
                status: 'processed',
                error: 'Artwork already processed',
                details: { currentStatus: review.artworks.status }
            };
        }

        const payload: ArtworkReviewPayload = {
            artworkId: review.artwork_id,
            imageUrl: review.artworks.image_url,
            description: review.artworks.description
        };

        // Call the review endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/artwork/artwork-review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(PROCESSING_TIMEOUT - 1000)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Review API returned ${response.status}`);
        }

        const result = await response.json();

        return {
            artworkId: review.artwork_id,
            status: 'processed',
            details: result
        };
    } catch (error) {
        console.error(`Error processing artwork ${review.artwork_id}:`, error);

        await supabase
            .from('artwork_reviews')
            .update({
                processing_status: 'failed',
                updated_at: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Processing failed'
            })
            .eq('id', review.id);

        return {
            artworkId: review.artwork_id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Processing failed',
            details: error instanceof Error ? { stack: error.stack } : undefined
        };
    } finally {
        clearTimeout(timer);
    }
}