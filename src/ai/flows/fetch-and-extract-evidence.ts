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
  card: z.string().describe('A single, fully formatted debate evidence card as a string, following the custom format with [BOLD:], [SOURCE:], and [HIGHLIGHT:] tags.'),
});

export type FetchAndExtractEvidenceOutput = z.infer<typeof FetchAndExtractEvidenceOutputSchema>;


export async function fetchAndExtractEvidence(input: FetchAndExtractEvidenceInput): Promise<FetchAndExtractEvidenceOutput> {
  return fetchAndExtractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchAndExtractEvidencePrompt',
  input: {schema: FetchAndExtractEvidenceInputSchema},
  output: {schema: FetchAndExtractEvidenceOutputSchema},
  prompt: `You are a professional debate evidence-cutting assistant trained to create clean, high-impact cards for Public Forum and Policy Debate.
Your task is to access the content of the provided URL, find the most persuasive, precise, and readable parts of the article that support the user's argument, and format them into a single card that can be read word-for-word in a competitive round.

🎯 OVERALL GOAL

You will produce one high-quality debate card that:
- Sounds natural and fast when read aloud.
- Contains only the author’s most essential ideas related to the argument.
- Emphasizes key language and statistics using [HIGHLIGHT: … ] for the spoken portions.
- Clearly attributes every claim to a full, credible source.

⚙️ STRUCTURE FORMAT (MANDATORY)

The card must follow this format exactly:

[BOLD: <tagline summarizing the argument in one short sentence>]
[SOURCE: Author Full Name, Year, Publication, Exact Date, “Full Title of Article”, FULL URL REQUIRED]

<Body text with key phrases marked using [HIGHLIGHT: … ] >

💡 COMPONENT BREAKDOWN
1.  **[BOLD: … ] — Tagline**: A single, clear, assertive sentence summarizing the main argument of the evidence. This should be a strong version of the user's provided argument.
2.  **[SOURCE: … ] — Source Line**: You must generate this line with every element you can find from the article: Author’s full name, Year, Publication name, Exact date (month-day-year), Full article title in quotes, and the Full URL. The URL must be the one provided in the input.
3.  **[HIGHLIGHT: … ] — Spoken Text**: This marks the exact language the debater will read out loud. All unhighlighted words are context only.

🔷 HIGHLIGHTING RULES
- Highlight only what is necessary for clarity and persuasion — no filler.
- Each [HIGHLIGHT: ] segment should contain one short, meaningful phrase (4–12 words).
- All highlights must flow together seamlessly when read without the unhighlighted text.
- Prioritize: Causality (why/how), Scale/Scope (stats, numbers), Impact, and Authority.

🧠 HOW TO THINK WHEN CUTTING
- Ask: “If someone only read these highlighted phrases, would the argument still make sense?”
- The tagline should be the strongest, clearest claim the evidence proves.

🧩 STYLE AND TONE
- The card body should be 100–180 words.
- Do not editorialize. Retain all factual details exactly.

**CRITICAL INSTRUCTIONS:**
1.  **Access and Read:** First, access and read the content of the article at the provided URL.
2.  **Find Relevant Section:** Locate the specific part of the article that most directly and powerfully supports the user's argument.
3.  **Cut the Card:** Apply the rules above to create a single, perfectly formatted card string.

**Source URL:**
{{{sourceUrl}}}

**Argument to Support:**
{{{argument}}}

Cut the card and format your response as a JSON object with a single "card" field containing the fully formatted string.
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
