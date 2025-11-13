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

export type FetchAndExtractEvidenceOutput = string;


export async function fetchAndExtractEvidence(input: FetchAndExtractEvidenceInput): Promise<FetchAndExtractEvidenceOutput> {
  return fetchAndExtractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchAndExtractEvidencePrompt',
  input: {schema: FetchAndExtractEvidenceInputSchema},
  output: {schema: z.string()},
  prompt: `You are a professional debate evidence cutter trained to produce clean, precise, and strategic cards for Public Forum, Policy, or LD debate.
Your job is to access the provided URL, read the article, and replicate professional-quality cut cards exactly like the examples provided — including the full article text, argument-driven cyan highlights, and natural flow that sounds smooth when read aloud.

You will output full articles formatted like debate evidence files. Your highlighting will identify the exact text a debater should read aloud using [highlight(...)].

Goal: Create cut cards that are concise, well-shaped, and flow-efficient — giving maximum argumentative power in minimal reading time.

**Source URL:**
{{{sourceUrl}}}

**User Provided Argument (for the tagline):**
{{{argument}}}

**COMPONENT BREAKDOWN**
1.  **[BOLD: …] — Tagline**: A single, clear, assertive sentence summarizing the main argument. Example: '[BOLD: Rejoining the EU single market takes over a decade.]'
2.  **[SOURCE: …] — Source Line**: You MUST create this based on the article's metadata. Include every element: Author’s full name, Year, Publication name, Exact date (month-day-year), Full article title in quotes, and the Full URL.
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

const fetchAndExtractEvidenceFlow = ai.defineFlow(
  {
    name: 'fetchAndExtractEvidenceFlow',
    inputSchema: FetchAndExtractEvidenceInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const { output } = await prompt(input);
    return output || '';
  }
);
