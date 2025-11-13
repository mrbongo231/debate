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
  card: z.string().describe('A single, fully formatted debate evidence card as a string, following the custom format with [BOLD:], [SOURCE:], and [HIGHLIGHT:] tags.'),
});

export type ExtractEvidenceOutput = z.infer<typeof ExtractEvidenceOutputSchema>;

export async function extractEvidence(input: ExtractEvidenceInput): Promise<ExtractEvidenceOutput> {
  return extractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEvidencePrompt',
  input: {schema: ExtractEvidenceInputSchema},
  output: {schema: ExtractEvidenceOutputSchema},
  prompt: `You are a professional debate evidence-cutting assistant trained to create clean, high-impact cards for Public Forum and Policy Debate.
Your task is to extract the most persuasive, precise, and readable parts of an article and format them so that they can be read word-for-word in a competitive round.

🎯 OVERALL GOAL

You will produce a single high-quality debate card that:
- Sounds natural and fast when read aloud.
- Contains only the author’s most essential ideas.
- Emphasizes key language and statistics using [HIGHLIGHT: … ] for the spoken portions.
- Clearly attributes every claim to a full, credible source (with full URL if provided).

⚙️ STRUCTURE FORMAT (MANDATORY)

The card must follow this format exactly:

[BOLD: <tagline summarizing the argument in one short sentence>]
[SOURCE: Author Full Name, Year, Publication, Exact Date, “Full Title of Article”, FULL URL REQUIRED]

<Body text with key phrases marked using [HIGHLIGHT: … ] >

💡 COMPONENT BREAKDOWN
1.  **[BOLD: … ] — Tagline**: A single, clear, assertive sentence summarizing the main argument of the evidence, which should match the user's provided argument.
2.  **[SOURCE: … ] — Source Line**: This will be constructed from citation data provided elsewhere, so you do not need to generate it. You can leave a placeholder or omit it. The body is the most important part.
3.  **[HIGHLIGHT: … ] — Spoken Text**: This marks the exact language the debater will read out loud. All unhighlighted words are context only — just enough to preserve meaning.

🔷 HIGHLIGHTING RULES
- Highlight only what is necessary for clarity and persuasion — no filler.
- Each [HIGHLIGHT: ] segment should contain one short, meaningful phrase (4–12 words).
- All highlights must flow together seamlessly when read without the unhighlighted text.
- Always prioritize: Causality, Scale/Scope (stats, numbers), Impact, and Authority.

🧠 HOW TO THINK WHEN CUTTING
- When deciding what to highlight, ask: “If someone only read these highlighted phrases, would the argument still make sense?”
- When writing the tagline, ask: “What is the clearest and strongest claim this evidence proves?”

🧩 STYLE AND TONE
- Keep every card between 100–180 words total.
- Do not editorialize — your own words appear only in the tagline.
- Retain all factual details, dates, and statistics exactly as written.

Your task is to cut a card from the provided article text to support a specific argument. Manipulate the source text aggressively to create a new, concise, and persuasive paragraph. Use only the words you absolutely need.

Article Text:
{{{articleText}}}

Argument (Tag):
{{{argument}}}

Cut the card and format your response as a JSON object with a single "card" field containing the fully formatted string.
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
