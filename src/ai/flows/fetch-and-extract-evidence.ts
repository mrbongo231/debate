'use server';

/**
 * @fileOverview Fetches content from a URL and extracts relevant evidence based on a user-specified argument.
 *
 * - fetchAndExtractEvidence - A function that handles fetching and evidence extraction.
 * - FetchAndExtractEvidenceInput - The input type for the function.
 * - FetchAndExtractEvidenceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {EvidenceCard, Citation} from '@/lib/definitions';

const FetchAndExtractEvidenceInputSchema = z.object({
  sourceUrl: z.string().url().describe('The URL of the article to extract evidence from.'),
  argument: z.string().describe('The specific argument for which to find supporting evidence.'),
});

export type FetchAndExtractEvidenceInput = z.infer<typeof FetchAndExtractEvidenceInputSchema>;

const EvidenceCardSchema = z.object({
    claim: z.string().describe("A concise one-sentence summary of the main argument the card is making."),
    quote: z.string().describe("The direct, verbatim quote from the article that supports the claim. It should be a complete sentence or two."),
    explanation: z.string().describe("A brief explanation of why this argument matters (e.g., 'solves for economic inequality', 'prevents great power conflict')."),
    citation: z.object({
        author: z.string().describe("The author of the article or organization that published it."),
        title: z.string().describe("The original title of the article."),
        publication: z.string().describe("The name of the publication (e.g., The New York Times)."),
        date: z.string().describe("The publication date of the article in Month Day, Year format (e.g., 'June 1, 2024')."),
        url: z.string().url().describe("The original URL of the article."),
    }),
});

const FetchAndExtractEvidenceOutputSchema = z.object({
  evidence: z.array(EvidenceCardSchema).describe('A list of evidence cards generated from the article.'),
});

export type FetchAndExtractEvidenceOutput = z.infer<typeof FetchAndExtractEvidenceOutputSchema>;


export async function fetchAndExtractEvidence(input: FetchAndExtractEvidenceInput): Promise<FetchAndExtractEvidenceOutput> {
  return fetchAndExtractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchAndExtractEvidencePrompt',
  input: {schema: FetchAndExtractEvidenceInputSchema},
  output: {schema: FetchAndExtractEvidenceOutputSchema},
  prompt: `You are an expert debate researcher. Your task is to access the content of the provided URL, analyze the article, and extract 1-2 high-quality pieces of evidence that support the given argument.

**Source URL:**
{{{sourceUrl}}}

**Argument to Support:**
{{{argument}}}

**CRITICAL INSTRUCTIONS:**
1.  **Access and Read:** First, you must access the content of the article at the provided URL.
2.  **Find Supporting Evidence:** Read the article to find the most direct and powerful evidence that supports the user's specific **Argument to Support**.
3.  **Extract Verbatim Quote:** For each piece of evidence, find the most powerful and concise quote that directly supports the argument. The quote MUST be copied verbatim from the text.
4.  **Synthesize and Structure:** For each piece of evidence, you will create a structured "card" object with the following fields:
    *   **claim:** A single sentence that summarizes the core argument of the card, directly related to the user's provided argument.
    *   **quote:** The verbatim text extracted from the article.
    *   **explanation:** Briefly explain the significance or "so what" of this argument. Why does this quote prove the argument?
    *   **citation:** An object containing the author, title, publication, date, and original URL.

Your final output must be in the specified JSON format. Ensure all fields are filled out accurately based *only* on the provided text from the URL. Focus only on evidence that is highly relevant to the user's argument.
  `,
});

const fetchAndExtractEvidenceFlow = ai.defineFlow(
  {
    name: 'fetchAndExtractEvidenceFlow',
    inputSchema: FetchAndExtractEvidenceInputSchema,
    outputSchema: FetchAndExtractEvidenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
