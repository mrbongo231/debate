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
  if (!cardString || typeof cardString !== 'string') return null;

  const claimRegex = /\[BOLD:\s*([\s\S]*?)\]/;
  const sourceRegex = /\[SOURCE:\s*([\s\S]*?)\]/;

  const claimMatch = cardString.match(claimRegex);
  const sourceMatch = cardString.match(sourceRegex);
  
  if (!claimMatch || !sourceMatch) return null;

  const claim = claimMatch[1].trim();
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

type ActionState = {
  message?: string | null;
  evidence?: (EvidenceCardType & { citation: string })[] | null;
};

export async function runFetchAndExtractEvidence(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = fetchSchema.safeParse({
    sourceUrl: formData.get('sourceUrl'),
    argument: formData.get('argument'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
    };
  }

  const { sourceUrl, argument } = validatedFields.data;

  try {
    const result = await fetchAndExtractEvidenceFlow({ sourceUrl, argument });
    
    if (!result || !result.card) {
      return { message: 'No evidence could be extracted. The AI returned an empty response. Try refining your argument or using a different article.', evidence: [] };
    }

    const parsed = parseCardString(result.card);
    if (!parsed) {
      console.error("Failed to parse card string:", result.card);
      return { message: 'Failed to parse the evidence returned from the AI. The format was incorrect.', evidence: [] };
    }
    const evidence = [{
        ...parsed,
        explanation: '',
    }];
    return { evidence, message: null };
    
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
});


export async function runExtractEvidence(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const validatedFields = extractSchema.safeParse({
        articleText: formData.get('articleText'),
        argument: formData.get('argument'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Validation failed. Please check your inputs.',
        };
    }

    const { articleText, argument } = validatedFields.data;
    
    try {
        const result = await extractEvidenceFlow({ articleText, argument });

        if (!result || !result.card) {
          return { message: 'No evidence could be extracted. The AI returned an empty response. Try refining your argument.', evidence: [] };
        }

        const parsed = parseCardString(result.card);
         if (!parsed) {
            console.error("Failed to parse card string:", result.card);
            return { message: 'Failed to parse the evidence returned from the AI. The format was incorrect.', evidence: [] };
        }
        const evidence = [{
            ...parsed,
            explanation: 'This evidence was extracted directly from the provided text based on your argument.',
        }];
        
        return { evidence: evidence, message: null };

    } catch (error) {
        console.error('Error extracting evidence from text:', error);
        return { message: 'An unexpected error occurred while processing the text.', evidence: null };
    }
}
