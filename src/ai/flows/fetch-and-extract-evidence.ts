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

const FetchAndExtractEvidenceInputSchema = z.object({
  sourceUrl: z.string().url().describe('The URL of the article to extract evidence from.'),
  argument: z.string().describe('The specific argument for which to find supporting evidence.'),
});

export type FetchAndExtractEvidenceInput = z.infer<typeof FetchAndExtractEvidenceInputSchema>;

const FetchAndExtractEvidenceOutputSchema = z.object({
  card: z.string(),
});
export type FetchAndExtractEvidenceOutput = z.infer<typeof FetchAndExtractEvidenceOutputSchema>;


export async function fetchAndExtractEvidence(input: FetchAndExtractEvidenceInput): Promise<FetchAndExtractEvidenceOutput> {
  return fetchAndExtractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchAndExtractEvidencePrompt',
  input: {schema: FetchAndExtractEvidenceInputSchema},
  output: { schema: FetchAndExtractEvidenceOutputSchema },
  prompt: `You are a professional debate evidence cutter. Your job is to access the provided URL, read the article, and cut cards exactly like the high-quality examples provided, with concise, shaped highlights, professional formatting, clean flow, and full source material included. Your final output must be a single JSON object with a "card" property containing the fully formatted card as a string.

**Source URL:**
{{{sourceUrl}}}

**User Provided Argument (for the tagline):**
{{{argument}}}

**🎯 RULE 1 — Tagline Formatting (MANDATORY)**

Every card must begin with:

1. A bold, concise tagline (5–12 words) summarizing the argument.
2. On a new line, the citation: Author Last Name YY [Full Name; Credentials (if available), MM-DD-YYYY, “Article Title,” Publication, Full URL (REQUIRED), DOA: MM-DD-YYYY] cutter_initials

Format example:
Joining the Single Market takes over a decade.
McGee 24 [Luke McGee; Emmy award-winning journalist covering European politics and diplomacy, 10-28-2024, “Sorry Rejoiners—The UK’s path back to Europe will be slow,” Prospect Magazine, https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoinersthe-uks-path-back-to-europe-will-be-slow, DOA: 8-31-2025] shaan

**🎯 RULE 2 — Cyan Highlighting With [highlight(...)]**

All highlighting must use [highlight(...)] syntax. The highlight represents cyan (#00FFFF). Only highlight short, powerful phrases, NOT whole sentences. Every highlight must be shaped to improve argumentative flow. Highlight core claims, causal mechanisms, statistics, warrants, and impacts. Do NOT highlight full paragraphs or bold random text.

**🎯 RULE 3 — Conciseness and Flow**

Your goal is to make the card clean, professional, concise but not choppy, and shaped for in-round readability. The highlights must read smoothly when spoken.

**🎯 RULE 4 — Full Article Appears Below the Cite (MANDATORY)**

You must ALWAYS print the entire article text after the citation. Keep the original paragraph structure and any bold/italic formatting. Insert [highlight(...)] markings directly into the full text.

**🎯 RULE 5 — Bold Detection Rule**

Because pasted text may lose formatting, you must infer where the title, headers, and bolded elements were originally placed and reconstruct them. Reconstruct bold headers such as "Process," "Analysis," "Conclusion," etc.

Your final product must look exactly like a professional debate evidence file.
`,
});

const fetchAndExtractEvidenceFlow = ai.defineFlow(
  {
    name: 'fetchAndExtractEvidenceFlow',
    inputSchema: FetchAndExtractEvidenceInputSchema,
    outputSchema: FetchAndExtractEvidenceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output || { card: '' };
  }
);
