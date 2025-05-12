import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/nsfwjs/classifier';
import { analyzeText } from './textReviewService';
import { supabase } from '@/lib/supabase';
import { ArtworkReviewPayload } from '@/types/artworkReview';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const payload: ArtworkReviewPayload = await request.json();

    try {
        // Verify artwork exists
        const { data: artwork, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', payload.artworkId)
            .single();

        if (error || !artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            );
        }

        // Process image and text in parallel
        const [imageResult, textResult] = await Promise.all([
            analyzeImage(payload.imageUrl),
            analyzeText(payload.description)
        ]);

        // Update database
        const { error: updateError } = await supabase
            .from('artwork_reviews')
            .upsert({
                artwork_id: payload.artworkId,
                user_id: artwork.user_id,
                processing_status: 'completed',
                image_verdict: imageResult.verdict,
                nsfw_scores: imageResult.scores,
                image_rejection_reasons: imageResult.rejectionReasons,
                text_verdict: textResult.verdict,
                grammar_issues: textResult.issues,
                text_rejection_reasons: textResult.rejectionReasons,
                updated_at: new Date().toISOString()
            });

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            imageResult,
            textResult
        });

    } catch (error) {
        console.error('Review processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process review' },
            { status: 500 }
        );
    }
}