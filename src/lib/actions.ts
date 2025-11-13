'use server';

import { extractEvidence as extractEvidenceFlow } from '@/ai/flows/extract-evidence-from-article';
import { GenerateSpeechOutlineInput, generateSpeechOutline } from '@/ai/flows/generate-speech-outline';
import { GenerateExtempSpeechInput, GenerateExtempSpeechOutput, generateExtempSpeech } from '@/ai/flows/generate-extemp-speech';
import { GenerateCongressSpeechInput, GenerateCongressSpeechOutput, generateCongressSpeech } from '@/ai/flows/generate-congress-speech';
import { fetchAndExtractEvidence as fetchAndExtractEvidenceFlow } from '@/ai/flows/fetch-and-extract-evidence';

import { z } from 'zod';
import type { EvidenceCard as EvidenceCardType } from '@/lib/definitions';


export async function getSpeechOutlineAction(input: GenerateSpeechOutlineInput) {
  try {
    const result = await generateSpeechOutline(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate speech outline.' };
  }
}

export async function getExtempSpeechAction(
  input: GenerateExtempSpeechInput
): Promise<{ success: boolean; data?: GenerateExtempSpeechOutput; error?: string }> {
  try {
    const result = await generateExtempSpeech(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate extemp speech.' };
  }
}

export async function getCongressSpeechAction(
  input: GenerateCongressSpeechInput
): Promise<{ success: boolean; data?: GenerateCongressSpeechOutput; error?: string }> {
  try {
    const result = await generateCongressSpeech(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate Congress speech.' };
  }
}

function parseCardString(cardString: string): { claim: string; citation: string; quote: string } | null {
    const boldMatch = cardString.match(/\[BOLD:\s*([\s\S]*?)\]/);
    const sourceMatch = cardString.match(/\[SOURCE:\s*([\s\S]*?)\]/);

    if (!boldMatch || !sourceMatch) {
        // Fallback for old format or malformed new format
        const lines = cardString.trim().split('\n');
        let claim = '';
        let citation = '';
        let quote = '';

        if (lines[0] && !lines[0].includes('[SOURCE:')) {
            claim = lines.shift()?.replace(/\*\*/g, '').trim() || '';
        }
        
        const shaanIndex = lines.findIndex(line => line.trim().toLowerCase() === 'shaan');
        if (shaanIndex !== -1) {
            citation = lines.slice(0, shaanIndex + 1).join('\n').trim();
            quote = lines.slice(shaanIndex + 1).join('\n').trim();
        } else {
            quote = lines.join('\n').trim();
        }

        if (!claim && !citation && !quote) return null;
        return { claim, citation, quote };
    }

    const claim = boldMatch[1].trim();
    const citation = sourceMatch[1].trim();

    const sourceEndIndex = cardString.indexOf(sourceMatch[0]) + sourceMatch[0].length;
    const quote = cardString.substring(sourceEndIndex).trim();

    return { claim, citation, quote };
}


// Schema for URL-based extraction
const fetchSchema = z.object({
  sourceUrl: z.string().url('Please provide a valid source URL.'),
  argument: z.string().min(10, 'Argument must be at least 10 characters.'),
});

type FetchState = {
  errors?: {
    argument?: string[];
    sourceUrl?: string[];
  };
  message?: string | null;
  evidence?: (EvidenceCardType & { citation: string })[] | null;
};

export async function runFetchAndExtractEvidence(prevState: FetchState, formData: FormData): Promise<FetchState> {
  const validatedFields = fetchSchema.safeParse({
    sourceUrl: formData.get('sourceUrl'),
    argument: formData.get('argument'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
    };
  }

  const { sourceUrl, argument } = validatedFields.data;

  try {
    const result = await fetchAndExtractEvidenceFlow({ sourceUrl, argument });
    if (result && result.card) {
      const parsed = parseCardString(result.card);
      if (!parsed) {
        return { message: 'Failed to parse the evidence returned from the AI. The format was incorrect.', evidence: [] };
      }
      const evidence = [{
          ...parsed,
          explanation: '',
      }];
      return { evidence, message: null };
    } else {
      return { message: 'No evidence could be extracted. Try refining your argument or using a different article.', evidence: [] };
    }
  } catch (error) {
    console.error('Error fetching and extracting evidence:', error);
    const errorMessage = (error as Error).message || 'An unexpected error occurred while processing the article. Please try again later.';
    return { message: errorMessage, evidence: null };
  }
}

// Schema for Text-based extraction
const extractSchema = z.object({
  articleText: z.string().min(50, 'Article text must be at least 50 characters.'),
  argument: z.string().min(10, 'Argument must be at least 10 characters.'),
  citation: z.object({
    author: z.string().optional(),
    title: z.string().optional(),
    publication: z.string().optional(),
    date: z.string().optional(),
  }),
  sourceUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type ExtractState = {
    errors?: z.ZodError<z.infer<typeof extractSchema>>['flatten']['fieldErrors'];
    message?: string | null;
    evidence?: (EvidenceCardType & { citation: string })[] | null;
};

export async function runExtractEvidence(prevState: ExtractState, formData: FormData): Promise<ExtractState> {
    const validatedFields = extractSchema.safeParse({
        articleText: formData.get('articleText'),
        argument: formData.get('argument'),
        citation: {
          author: formData.get('citation.author'),
          title: formData.get('citation.title'),
          publication: formData.get('citation.publication'),
          date: formData.get('citation.date') || undefined,
        },
        sourceUrl: formData.get('sourceUrl'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check your inputs.',
        };
    }

    const { articleText, argument } = validatedFields.data;
    
    try {
        const result = await extractEvidenceFlow({ articleText, argument });
        if (result && result.card) {
            const parsed = parseCardString(result.card);
             if (!parsed) {
                return { message: 'Failed to parse the evidence returned from the AI. The format was incorrect.', evidence: [] };
            }
            const evidence = [{
                ...parsed,
                explanation: 'This evidence was extracted directly from the provided text based on your argument.',
            }];

            if (evidence.length > 0) {
                return { evidence: evidence, message: null };
            }
        }
        return { message: 'No evidence could be extracted from the provided text.', evidence: [] };

    } catch (error) {
        console.error('Error extracting evidence from text:', error);
        return { message: 'An unexpected error occurred while processing the text.', evidence: null };
    }
}
