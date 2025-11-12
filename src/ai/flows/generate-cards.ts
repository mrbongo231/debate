'use server';

/**
 * @fileOverview Extracts evidence from an article URL for debate.
 * 
 * - generateCards - A function that takes a URL and returns structured "cards".
 * - GenerateCardsInput - The input type for the generateCards function.
 * - GenerateCardsOutput - The return type for the generateCards function.
 */

import { ai, googleAI } from '@/ai/genkit';
import { z } from 'genkit';
import { extractText } from '@genkit-ai/google-genai/media';

const GenerateCardsInputSchema = z.object({
  url: z.string().url().describe('The URL of the article to cut cards from.'),
});

export type GenerateCardsInput = z.infer<typeof GenerateCardsInputSchema>;

const DebateCardSchema = z.object({
    tag: z.string().describe("A short, descriptive headline for the card (e.g., 'Economy Growing'). 2-3 words max."),
    author: z.string().describe("The author of the article or organization that published it."),
    date: z.string().describe("The publication date of the article in Month Day, Year format (e.g., 'June 1, 2024')."),
    claim: z.string().describe("A concise one-sentence summary of the main argument the card is making."),
    quote: z.string().describe("The direct, verbatim quote from the article that supports the claim. It should be a complete sentence or two."),
    impact: z.string().describe("A brief explanation of why this argument matters (e.g., 'solves for economic inequality', 'prevents great power conflict')."),
});

const GenerateCardsOutputSchema = z.object({
    title: z.string().describe("The original title of the article."),
    source: z.string().describe("The original URL of the article."),
    cards: z.array(DebateCardSchema).describe("An array of 3-5 debate cards extracted from the article."),
});

export type GenerateCardsOutput = z.infer<typeof GenerateCardsOutputSchema>;

export async function generateCards(
  input: GenerateCardsInput
): Promise<GenerateCardsOutput> {
  return generateCardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCardsPrompt',
  input: { schema: z.object({ articleText: z.string(), source: z.string() }) },
  output: { schema: GenerateCardsOutputSchema },
  prompt: `You are an expert debate coach and researcher, specializing in cutting evidence ("cards") for national-level competitors. Your task is to analyze the provided article text and extract 3-5 high-quality, distinct pieces of evidence.

**Article Text:**
{{{articleText}}}

**Source URL:**
{{{source}}}

**CRITICAL INSTRUCTIONS:**
1.  **Identify Core Arguments:** Read through the entire article and identify the 3-5 most important and distinct arguments or claims made by the author.
2.  **Extract Verbatim Evidence:** For each argument, find the most powerful and concise quote that directly supports it. The quote MUST be copied verbatim from the text.
3.  **Synthesize and Structure:** For each piece of evidence, you will create a structured "card" object with the following fields:
    *   **tag:** A very short, punchy headline for the card. 2-3 words max (e.g., "Inflation Cooling," "AI Threatens Jobs").
    *   **author:** The author or publication.
    *   **date:** The publication date.
    *   **claim:** A single sentence that summarizes the core argument of the card.
    *   **quote:** The verbatim text extracted from the article.
    *   **impact:** Briefly explain the significance or "so what" of this argument.
4.  **Article Metadata:**
    *   **title:** The original title of the article.
    *   **source:** The original URL provided.

Your final output must be in the specified JSON format. Ensure all fields are filled out accurately based *only* on the provided text.
`,
});

const generateCardsFlow = ai.defineFlow(
  {
    name: 'generateCardsFlow',
    inputSchema: GenerateCardsInputSchema,
    outputSchema: GenerateCardsOutputSchema,
  },
  async (input) => {
    const articleText = await extractText({ url: input.url });
    
    const { output } = await prompt({ articleText, source: input.url });
    return output!;
  }
);
