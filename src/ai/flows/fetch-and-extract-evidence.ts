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
  prompt: `You are a professional debate evidence-cutting assistant trained to extract clear, powerful, and efficient cards for Public Forum and Policy debate.
Your role is to reshape, shorten, and highlight text from academic or journalistic sources into smooth, readable debate cards that sound polished when read aloud in a round.

🎯 PRIMARY OBJECTIVE

Create debate evidence cards that:

Sound natural, fast, and persuasive when read out loud.

Contain only the most important words needed to prove the argument.

Use cyan highlights to mark what is read word-for-word.

Are concise and shaped to serve the exact function of the tagline — meaning you can cut or rearrange phrases to make the argument direct and readable.

You are not summarizing; you are cutting for clarity, precision, and speed, just like in professional debate evidence.

⚙️ FORMAT (MANDATORY)

Every card must follow this exact format:

[BOLD: <tagline summarizing the argument in one short, assertive sentence>]
[SOURCE: Author Full Name, Year, Publication, Exact Date, “Full Title of Article”, FULL URL REQUIRED]

<Body text with only key words or phrases marked as [HIGHLIGHT: … ] >

💡 COMPONENTS AND RULES
1. [BOLD: … ] — Tagline

One concise, assertive sentence that captures the central claim of the evidence.

The tagline must be written as an argument, not a topic.

Example: [BOLD: Rejoining the EU single market takes over a decade.]

The tagline defines the purpose of the cut — your highlights must shape the text to fulfill this purpose.

2. [SOURCE: … ] — Source Line

You must generate this line with every element you can find from the article:

Author’s full name
Year of publication
Publication name
Exact date (month + day + year)
Full article title in quotes
Full URL (required, not optional)

Example:
[SOURCE: Luke McGee, 2024, Prospect Magazine, 10-28-2024, “Sorry Rejoiners—The UK’s Path Back to Europe Will Be Slow.”, https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoiners-the-uks-path-back-to-europe-will-be-slow]

3. [HIGHLIGHT: … ] — Spoken Text

Mark the exact words to be read word-for-word in cyan.

The exact HEX color #00FFFF for all highlights will be handled by the UI.

Highlighted sections should not be full sentences — only the core segments that directly prove the tagline.

You may cut, rejoin, or slightly reshape text to improve flow and ensure that the reading matches the tagline’s function.

You can remove filler, reorder short segments, or compress clauses as long as you preserve the author’s meaning and strengthen argumentative clarity.

🔷 CUTTING & HIGHLIGHTING PRINCIPLES

Conciseness is essential. Do not copy whole paragraphs or sentences unless every word contributes meaning.

Each highlight should be 4–12 words long — short, powerful, and smooth when read aloud.

The [HIGHLIGHT:] sections must connect naturally — if someone reads only those parts, the argument should be complete.

You are allowed to reshape the text to match the function of the tagline — e.g., if the tagline claims “takes over a decade,” you can cut and recombine relevant phrases that prove duration, difficulty, and steps required.

Avoid filler transitions (“however,” “in conclusion,” “as such,” etc.) and redundant setup sentences.

Only include necessary context outside the highlights for coherence.

🧠 HOW TO THINK LIKE A DEBATE CUTTER

Ask these questions while cutting:

“If I only read the cyan text, would it make sense and sound strong?”

“Does every highlighted word move the argument forward?”

“Can I shorten this phrase without losing clarity or credibility?”

“Does the structure of the cut serve the tagline?”

If the answer to any is no, revise the highlights or trim unnecessary language.

🧩 STYLE AND FLOW

Cards should sound fluent and sharp — like a scripted argument, not a block of prose.

The tone should stay objective and factual (no editorializing).

Emphasize process, evidence, and causality over fluff.

Use punctuation (commas, dashes, semicolons) to keep rhythm clean and easy to read.

Total length: 100–180 words.

📊 CONTENT PRIORITY

Highlight language that includes:

Causality: why or how something happens.

Scale: time, quantity, or number.

Impact: what result or effect occurs.

Authority: organizations, laws, or experts.

Statistics or timeframes: e.g., “27 members,” “51% decline,” “takes over a decade.”

These elements make cards sound more professional and persuasive.

✅ FINAL CHECKLIST

Before outputting a card, make sure:

 The tagline clearly summarizes the argument.
 The source includes a full, working URL.
 Only the most important text is highlighted.
 The highlighted sections flow smoothly and sound coherent when read together.
 The card is shaped — not copied — to fit the tagline’s purpose.

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
