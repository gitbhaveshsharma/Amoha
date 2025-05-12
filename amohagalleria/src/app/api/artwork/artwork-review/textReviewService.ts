import axios from 'axios';
import { GrammarIssue, TextAnalysisResult } from '@/types/artworkReview';

const LANGUAGE_TOOL_API = 'https://api.languagetool.org/v2/check';

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
    try {
        const response = await axios.post(LANGUAGE_TOOL_API, {
            text,
            language: 'en',
            enabledOnly: false
        }, {
            params: {
                username: process.env.LANGUAGE_TOOL_USERNAME,
                apiKey: process.env.LANGUAGE_TOOL_API_KEY
            }
        });

        interface Match {
            message: string;
            offset: number;
            length: number;
            replacements?: { value: string }[];
        }

        const issues = response.data.matches.map((match: Match): GrammarIssue => ({
            message: match.message,
            offset: match.offset,
            length: match.length,
            replacements: match.replacements?.map((r) => r.value)
        }));

        // Determine verdict (reject if more than 5 serious issues)
        const seriousIssues = issues.filter((issue: GrammarIssue) =>
            !issue.message.includes('typographical') &&
            !issue.message.includes('whitespace')
        );

        return {
            verdict: seriousIssues.length > 5 ? 'rejected' : 'approved',
            issues,
            rejectionReasons: seriousIssues.length > 5
                ? ['Excessive grammar/spelling issues']
                : []
        };
    } catch (error) {
        console.error('Text analysis failed:', error);
        throw new Error('Failed to analyze text');
    }
};