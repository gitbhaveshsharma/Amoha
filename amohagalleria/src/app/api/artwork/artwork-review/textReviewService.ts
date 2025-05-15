import axios from 'axios';
import { GrammarIssue, TextAnalysisResult as BaseTextAnalysisResult } from '@/types/artworkReview';

interface TextAnalysisResult extends BaseTextAnalysisResult {
    analysisFailed?: boolean;
}

const LANGUAGE_TOOL_API = process.env.LANGUAGE_TOOL_API as string;
if (!LANGUAGE_TOOL_API) {
    throw new Error('LANGUAGE_TOOL_API environment variable is not set');
}

const MAX_SERIOUS_ISSUES = 5;
const REJECTION_THRESHOLD = 0.7; // Confidence threshold for serious issues

interface LanguageToolMatch {
    message: string;
    shortMessage?: string;
    offset: number;
    length: number;
    replacements?: { value: string }[];
    rule: {
        id: string;
        description: string;
        issueType: string;
    };
}

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
    if (!text || text.trim().length === 0) {
        return {
            verdict: 'approved',
            issues: [],
            rejectionReasons: []
        };
    }

    try {
        // Fixed request payload format
        const response = await axios.post(LANGUAGE_TOOL_API, {
            text,
            language: 'en-US', // Specify a more specific language variant
            enabledOnly: false
        }, {
            timeout: 10000, // 10 seconds timeout
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        const issues: GrammarIssue[] = response.data.matches.map((match: LanguageToolMatch) => ({
            id: match.rule.id,
            message: match.message,
            shortMessage: match.shortMessage || match.rule.description,
            offset: match.offset,
            length: match.length,
            replacements: match.replacements?.map(r => r.value) || [],
            type: match.rule.issueType || 'unknown',
            confidence: 1 // Default confidence (can be adjusted based on rule)
        }));

        // Classify serious issues (non-whitespace, non-typographical)
        const seriousIssues = issues.filter(issue =>
            !issue.type.includes('whitespace') &&
            !issue.type.includes('typographical') &&
            !issue.id.startsWith('STYLE_')
        );

        // Calculate rejection score based on issue severity
        const rejectionScore = seriousIssues.reduce((score, issue) => {
            return score + (issue.confidence || 1);
        }, 0);

        const shouldReject = rejectionScore >= REJECTION_THRESHOLD * MAX_SERIOUS_ISSUES;

        return {
            verdict: shouldReject ? 'rejected' : 'approved',
            issues,
            rejectionReasons: shouldReject
                ? [`Found ${seriousIssues.length} serious grammar/spelling issues`]
                : []
        };

    } catch (error) {
        console.error('Text analysis failed:', error);

        // Log more detailed error information
        if (axios.isAxiosError(error) && error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }

        // Fail-safe approval if service is unavailable
        return {
            verdict: 'approved',
            issues: [],
            rejectionReasons: [],
            analysisFailed: true
        };
    }
};