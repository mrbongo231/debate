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
  prompt: `You are a professional debate evidence-cutting assistant trained to create clean, high-impact cards for Public Forum and Policy Debate.
Your task is to extract the most persuasive, precise, and readable parts of an article and format them so that they can be read word-for-word in a competitive round. Your final output must be a single string, not a JSON object.

**User Provided Article Text:**
{{{articleText}}}

**User Provided Argument (for the tagline):**
{{{argument}}}

Follow these rules exactly:

**FORMAT (MANDATORY)**
Each card must follow this format exactly:

[BOLD: <tagline summarizing the argument in one short sentence>]
[SOURCE: Author Full Name, Year, Publication, Exact Date, “Full Title of Article”, FULL URL REQUIRED]

<Body text with key phrases marked using [highlight(...)].>


**COMPONENT BREAKDOWN**
1.  **[BOLD: …] — Tagline**: A single, clear, assertive sentence summarizing the main argument. Example: `[BOLD: Rejoining the EU single market takes over a decade.]`
2.  **[SOURCE: …] — Source Line**: Include every element: Author’s full name, Year, Publication name, Exact date (month-day-year), Full article title in quotes, and the Full URL.
    Example: `[SOURCE: Luke McGee, 2024, Prospect Magazine, 10-28-2024, “Sorry Rejoiners—The UK’s Path Back to Europe Will Be Slow.”, https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoiners-the-uks-path-back-to-europe-will-be-slow]`
3.  **[highlight(...)] — Spoken Text**: This marks the exact language the debater will read aloud. Only highlight the most essential phrases. The highlights should flow together seamlessly. Use `[highlight(some text)]` syntax.

**STRUCTURAL RULES**
- Keep the entire article text visible under the citation.
- Maintain the original paragraph order and formatting.
- Do not paraphrase or rewrite the author’s words, only highlight them.
- Each card should look identical to professional evidence files.

**EXAMPLE OUTPUT (AS A SINGLE STRING)**
[BOLD: Joining the Single Market takes over a decade.]
[SOURCE: McGee 24, Luke McGee; Emmy award-winning journalist covering European politics and diplomacy, 10-28-2024, “Sorry Rejoiners—The UK’s path back to Europe will be slow,” Prospect Magazine, https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoinersthe-uks-path-back-to-europe-will-be-slow, DOA: 8-31-2025]
shaan

Process
Anyone who has dealt with the [highlight(EU)] in a professional capacity will know it [highlight(involves a lot of process)]. This would be the case with any meaningful [highlight(Brexit reset)], as significant changes in the current relationship—as outlined in a binding treaty—[highlight(would almost certainly require the approval of all EU27 member states)], the European Parliament and potentially more stakeholders.

To join the EEA, Britain would [highlight(need the approval of Norway, Iceland, Liechtenstein and Switzerland first)], then the approval of the EU27. It would [highlight(have to swallow all of the single market’s rules)]—including freedom of movement—and accept the jurisdiction of the EFTA court.
`,
});

const extractEvidenceFlow = ai.defineFlow(
  {
    name: 'extractEvidenceFlow',
    inputSchema: ExtractEvidenceInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    const {text} = await ai.generate({
        prompt: prompt.compile({input}),
        model: 'googleai/gemini-2.5-flash',
        output: {
            format: 'text',
        }
    });
    return text;
  }
);
