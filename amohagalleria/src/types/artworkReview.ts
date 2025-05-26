export interface NSFWJSResponse {
    className: 'Porn' | 'Sexy' | 'Hentai' | 'Neutral' | 'Drawing';
    probability: number;
}

export interface ImageAnalysisResult {
    verdict: 'approved' | 'rejected';
    scores: {
        porn: number;
        sexy: number;
        hentai: number;
        neutral: number;
        drawing: number;
    };
    rejectionReasons: string[];
}

export interface GrammarIssue {
    id: string;
    confidence: number;
    message: string;
    offset: number;
    length: number;
    type: string;
    shortMessage: string;
    replacements?: string[];
}

export interface TextAnalysisResult {
    verdict: 'approved' | 'rejected';
    issues: GrammarIssue[];
    rejectionReasons: string[];
}

export interface ArtworkReviewPayload {
    artworkId: string;
    imageUrl: string;
    description: string;
}