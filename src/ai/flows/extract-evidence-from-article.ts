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

export type ExtractEvidenceOutput = string;

export async function extractEvidence(input: ExtractEvidenceInput): Promise<ExtractEvidenceOutput> {
  return extractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEvidencePrompt',
  input: {schema: ExtractEvidenceInputSchema},
  output: {schema: z.string()},
  prompt: `You are a professional debate evidence-cutting assistant trained to create clean, high-impact cards for Public Forum and Policy Debate.
Your task is to extract the most persuasive, precise, and readable parts of an article and format them so that they can be read word-for-word in a competitive round.

**User Provided Article Text:**
{{{articleText}}}

**User Provided Argument (for the tagline):**
{{{argument}}}

**COMPONENT BREAKDOWN**
1.  **[BOLD: …] — Tagline**: A single, clear, assertive sentence summarizing the main argument. Example: '[BOLD: Rejoining the EU single market takes over a decade.]'
2.  **[SOURCE: …] — Source Line**: Include every element: Author’s full name, Year, Publication name, Exact date (month-day-year), Full article title in quotes, and the Full URL.
    Example: '[SOURCE: Luke McGee, 2024, Prospect Magazine, 10-28-2024, "Sorry Rejoiners—The UK’s Path Back to Europe Will Be Slow.", https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoiners-the-uks-path-back-to-europe-will-be-slow]'
3.  **[highlight(...)] — Spoken Text**: This marks the exact language the debater will read aloud. Only highlight the most essential phrases. The highlights should flow together seamlessly. Use '[highlight(some text)]' syntax.

**Styling and Rules**
-   **Highlight Color**: Use the exact HEX code #00FFFF for all cyan highlights.
-   **Conciseness**: Avoid redundancy. Trim unnecessary qualifiers and filler. Every highlighted word must serve a purpose.
-   **Flow**: The highlighted text should sound natural when read aloud in sequence. Cut and shape the author's sentences to achieve this, but do not misrepresent their meaning.
-   **Structure**: Keep the entire original article text. Do not paraphrase. Retain original formatting like bold or italics where present.

Your goal is to make each cut sound like it could be read in-round by a top national circuit debater: clean, persuasive, efficient, and crystal clear.
`,
});

const extractEvidenceFlow = ai.defineFlow(
  {
    name: 'extractEvidenceFlow',
    inputSchema: ExtractEvidenceInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const { output } = await prompt(input);
    return output || '';
  }
);
