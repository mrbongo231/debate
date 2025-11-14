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

  const lines = cardString.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return null;
  
  const claim = lines[0].trim();

  let citationEndIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].includes(']')) {
      citationEndIndex = i;
      break;
    }
  }

  if (citationEndIndex === -1) {
     console.warn("Parsing failed: Could not find the end of the citation block.");
     return null;
  }
  
  const citation = lines.slice(1, citationEndIndex + 1).join('\n').trim();

  const quote = lines.slice(citationEndIndex + 1).join('\n').trim();

  if (!claim || !citation || !quote) {
    console.warn("Parsing failed, one of the fields was empty", { claim, citation, quote: quote.substring(0, 50) });
    return null;
  }

  return { claim, citation, quote };
}


// Schema for URL-based extraction
const fetchSchema = z.object({
  sourceUrl: z.string().url('Please provide a valid source URL.'),
  argument: z.string().min(10, 'Argument must be at least 10 characters.'),
});

type ActionState = {
  message?: string | null;
  evidence?: EvidenceCardType | null;
  id: number;
};

export async function runFetchAndExtractEvidence(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = fetchSchema.safeParse({
    sourceUrl: formData.get('sourceUrl'),
    argument: formData.get('argument'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      id: prevState.id + 1,
    };
  }

  const { sourceUrl, argument } = validatedFields.data;

  try {
    const result = await fetchAndExtractEvidenceFlow({ sourceUrl, argument });
    
    if (!result || !result.card) {
      return { message: 'No evidence could be extracted. The AI returned an empty response. Try refining your argument or using a different article.', id: prevState.id + 1 };
    }

    const parsed = parseCardString(result.card);
    if (!parsed) {
      console.error("Failed to parse card string:", result.card);
      return { message: 'Failed to parse the evidence returned from the AI. The format was incorrect.', id: prevState.id + 1 };
    }
    const evidence = {
        ...parsed,
        explanation: '',
    };
    return { evidence, message: null, id: prevState.id + 1 };
    
  } catch (error) {
    console.error('Error fetching and extracting evidence:', error);
    const errorMessage = (error as Error).message || 'An unexpected error occurred while processing the article. Please try again later.';
    return { message: errorMessage, id: prevState.id + 1 };
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
            id: prevState.id + 1
        };
    }

    const { articleText, argument } = validatedFields.data;
    
    try {
        const result = await extractEvidenceFlow({ articleText, argument });

        if (!result || !result.card) {
          return { message: 'No evidence could be extracted. The AI returned an empty response. Try refining your argument.', id: prevState.id + 1 };
        }

        const parsed = parseCardString(result.card);
         if (!parsed) {
            console.error("Failed to parse card string:", result.card);
            return { message: 'Failed to parse the evidence returned from the AI. The format was incorrect.', id: prevState.id + 1 };
        }
        const evidence = {
            ...parsed,
            explanation: 'This evidence was extracted directly from the provided text based on your argument.',
        };
        
        return { evidence: evidence, message: null, id: prevState.id + 1 };

    } catch (error) {
        console.error('Error extracting evidence from text:', error);
        return { message: 'An unexpected error occurred while processing the text.', id: prevState.id + 1 };
    }
}
