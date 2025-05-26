// api/artwork/artwork-review/route.ts
import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/nsfwjs/classifier';
import { analyzeText } from './textReviewService';
import { supabase } from '@/lib/supabase';
import { ArtworkReviewPayload } from '@/types/artworkReview';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const validatePayload = (payload: ArtworkReviewPayload): ArtworkReviewPayload => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid payload format');
    }
    if (!payload.artworkId || typeof payload.artworkId !== 'string') {
        throw new Error('Missing or invalid artworkId');
    }
    if (!payload.imageUrl || typeof payload.imageUrl !== 'string') {
        throw new Error('Missing or invalid imageUrl');
    }
    if (!payload.description || typeof payload.description !== 'string') {
        throw new Error('Missing or invalid description');
    }
    return payload as ArtworkReviewPayload;
};

export async function POST(request: Request) {
    console.log('📝 Starting artwork review process');
    let payload: ArtworkReviewPayload;

    try {
        payload = validatePayload(await request.json());
        console.log('Payload validation successful');
    } catch (error) {
        console.error('❌ Payload validation failed:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Invalid request payload' },
            { status: 400 }
        );
    }

    try {
        // Verify artwork exists and get current review record
        console.log(`Fetching artwork and review for ID: ${payload.artworkId}`);
        const { data: artwork, error: artworkError } = await supabase
            .from('artworks')
            .select('id, user_id, status')
            .eq('id', payload.artworkId)
            .single();

        if (artworkError || !artwork) {
            console.error('❌ Artwork not found:', artworkError);
            return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
        }

        // Get existing review record to update
        const { data: existingReview, error: reviewError } = await supabase
            .from('artwork_reviews')
            .select('id')
            .eq('artwork_id', payload.artworkId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single() as { data: { id: string } | null, error: any };

        if (reviewError && !existingReview) {
            console.error('❌ No review record found:', reviewError);
            return NextResponse.json({ error: 'Review record not found' }, { status: 404 });
        }

        // Process image analysis
        console.log('Starting image analysis');
        const imageResult = await withTimeout(analyzeImage(payload.imageUrl), 150000, 'Image analysis timed out');
        console.log('✅ Image analysis completed:', imageResult);

        // Process text analysis
        console.log('Starting text analysis');
        const textResult = await withTimeout(analyzeText(payload.description), 60000, 'Text analysis timed out');
        console.log('✅ Text analysis completed:', textResult);

        // Prepare update data for existing record
        const updateData = {
            processing_status: 'completed',
            image_verdict: imageResult.verdict,
            nsfw_scores: {
                porn: imageResult.scores.porn,
                sexy: imageResult.scores.sexy,
                hentai: imageResult.scores.hentai,
                neutral: imageResult.scores.neutral,
                drawing: imageResult.scores.drawing
            },
            image_rejection_reasons: imageResult.rejectionReasons,
            text_verdict: textResult.verdict,
            grammar_issues: textResult.issues.map(issue => ({
                id: issue.id,
                message: issue.message,
                shortMessage: issue.shortMessage,
                offset: issue.offset,
                length: issue.length,
                type: issue.type,
                confidence: issue.confidence
            })),
            text_rejection_reasons: textResult.rejectionReasons,
            last_processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attempt_count: 1
        };

        // Update existing review record (not creating new one)
        console.log('Updating existing review record');
        const { error: updateError } = await supabase
            .from('artwork_reviews')
            .update(updateData)
            .eq('id', existingReview?.id ?? '');

        if (updateError) {
            console.error('❌ Error updating artwork_reviews:', updateError);
            throw updateError;
        }

        console.log('✅ Review process completed - artwork status will be updated by trigger');
        return NextResponse.json({
            success: true,
            message: 'Review completed - database trigger will update artwork status',
            imageVerdict: imageResult.verdict,
            textVerdict: textResult.verdict
        });

    } catch (error) {
        console.error('❌ Review processing error:', error);

        // Update existing record with failure status
        try {
            if (payload?.artworkId) {
                console.log('Updating review record with failure status');
                await supabase
                    .from('artwork_reviews')
                    .update({
                        processing_status: 'failed',
                        last_processed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        attempt_count: 1
                    })
                    .eq('artwork_id', payload.artworkId)
                    .order('created_at', { ascending: false })
                    .limit(1);
            }
        } catch (dbError) {
            console.error('❌ Failed to update review status:', dbError);
        }

        return NextResponse.json(
            {
                error: 'Failed to process review',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
    console.log(`Setting timeout of ${ms}ms`);
    const timeout = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMsg)), ms)
    );
    return Promise.race([promise, timeout]);
}