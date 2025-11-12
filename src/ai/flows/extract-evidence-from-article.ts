'use server';

/**
 * @fileOverview Extracts relevant evidence from an article based on a user-specified argument.
 *
 * - extractEvidence - A function that handles the evidence extraction process.
 * - ExtractEvidenceInput - The input type for the extractEvidence function.
 * - ExtractEvidenceOutput - The return type for the extractEvidence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEvidenceInputSchema = z.object({
  articleText: z.string().describe('The text content of the article from which to extract evidence.'),
  argument: z.string().describe('The specific argument for which to find supporting evidence in the article.'),
});
export type ExtractEvidenceInput = z.infer<typeof ExtractEvidenceInputSchema>;

const ExtractEvidenceOutputSchema = z.object({
  evidence: z.array(
    z.object({
      card: z.string().describe('A single paragraph of text, synthesized and manipulated from the source article to strongly support the argument. This paragraph must be readable word-for-word. Key words and phrases that should be read aloud for emphasis are marked with <highlight> and </highlight> tags.'),
    })
  ).describe('A list of evidence cards generated from the article.'),
});
export type ExtractEvidenceOutput = z.infer<typeof ExtractEvidenceOutputSchema>;

export async function extractEvidence(input: ExtractEvidenceInput): Promise<ExtractEvidenceOutput> {
  return extractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEvidencePrompt',
  input: {schema: ExtractEvidenceInputSchema},
  output: {schema: ExtractEvidenceOutputSchema},
  prompt: `You are an expert debate evidence editor and rhetorical coach. You specialize in cutting professional-quality debate cards that are ready to be read in-round — concise, impactful, and rhythmically smooth. Your cards must maintain professional formatting, powerful flow, and strategic delivery emphasis.

Your goal is to transform complex source material into tight, flowing debate cards where highlighted phrases are spoken word-for-word, the card flows smoothly, and the argument is trimmed to its core claim and impact. The tone should be confident and persuasive. The cut text can be reshaped to better match the tagline, as long as meaning and author intent remain accurate.

When cutting and formatting, you must treat phrases wrapped in <highlight></highlight> tags as the parts of the card that the debater will read exactly, word-for-word, during the speech.

To make this work naturally, surround the highlighted phrase with short, rhythmic connective text that keeps the sentence fluid. Structure sentences with clear pacing. Never over-highlight; emphasize only 20–40% of the text for rhythm and clarity.

You may reorder, merge, or trim parts of the original text if it improves clarity or aligns better with the tagline. Do not invent claims — only tighten and refocus existing ones. Conclude with a strong sentence that ties back to the tagline or impact. Cards can be 70–250 words, as long as they are complete and compelling.

Your task is to cut a card from the provided article text to support a specific argument. Manipulate the source text aggressively to create a new, concise, and persuasive paragraph. Use only the words you absolutely need. The final output must be a single, coherent paragraph.

Inside the final paragraph, you must wrap only the most important "punch words" and short phrases that a debater should read aloud with emphasis inside <highlight>tags</highlight>. The highlighted text, when read word-for-word, should still form a brief, coherent point.

Article Text:
{{{articleText}}}

Argument (Tag):
{{{argument}}}

Cut the card and format your response as a JSON object. The paragraph should be a single continuous string within the 'card' field.
  `,
});

const extractEvidenceFlow = ai.defineFlow(
  {
    name: 'extractEvidenceFlow',
    inputSchema: ExtractEvidenceInputSchema,
    outputSchema: ExtractEvidenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
