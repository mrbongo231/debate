'use server';

import { extractEvidence as extractEvidenceFlow } from '@/ai/flows/extract-evidence-from-article';
import { generateCards as generateCardsFlow } from '@/ai/flows/generate-cards';
import { z } from 'zod';
import type { EvidenceCard as EvidenceCardType, Citation } from '@/lib/definitions';
import { GenerateSpeechOutlineInput, generateSpeechOutline } from '@/ai/flows/generate-speech-outline';
import { GenerateExtempSpeechInput, GenerateExtempSpeechOutput, generateExtempSpeech } from '@/ai/flows/generate-extemp-speech';
import { GenerateCongressSpeechInput, GenerateCongressSpeechOutput, generateCongressSpeech } from '@/ai/flows/generate-congress-speech';


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
  evidence?: (EvidenceCardType & { citation: Citation })[] | null;
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
    const result = await generateCardsFlow({ url: sourceUrl });
    if (result && result.cards.length > 0) {
        const evidenceWithCitation: (EvidenceCardType & { citation: Citation })[] = result.cards.map(card => ({
            claim: card.claim,
            quote: card.quote,
            explanation: card.impact,
            citation: {
                author: card.author,
                date: card.date,
                publication: '',
                title: result.title,
                url: result.source,
            }
        }));
      return { evidence: evidenceWithCitation, message: null };
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
    evidence?: (EvidenceCardType & { citation: Citation })[] | null;
};

export async function runExtractEvidence(prevState: ExtractState, formData: FormData): Promise<ExtractState> {
    const rawData = {
        articleText: formData.get('articleText'),
        argument: formData.get('argument'),
        citation: {
          author: formData.get('citation.author'),
          title: formData.get('citation.title'),
          publication: formData.get('citation.publication'),
          date: formData.get('citation.date') || undefined,
        },
        sourceUrl: formData.get('sourceUrl'),
    };

    const validatedFields = extractSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check your inputs.',
        };
    }

    const { articleText, argument, sourceUrl, citation } = validatedFields.data;
    
    try {
        const result = await extractEvidenceFlow({ articleText, argument });
        const evidenceWithCitation = result.evidence.map(ev => ({
            claim: '',
            quote: ev.card,
            explanation: '',
            citation: {
                author: citation.author || '',
                date: citation.date || '',
                publication: citation.publication || '',
                title: citation.title || '',
                url: sourceUrl || '',
            }
        }));

        if (evidenceWithCitation.length > 0) {
            return { evidence: evidenceWithCitation, message: null };
        } else {
             return { message: 'No evidence could be extracted from the provided text.', evidence: [] };
        }
    } catch (error) {
        console.error('Error extracting evidence from text:', error);
        return { message: 'An unexpected error occurred while processing the text.', evidence: null };
    }
}