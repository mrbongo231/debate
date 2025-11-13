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
  card: z.string().describe('A single, fully formatted debate evidence card as a string, following the custom format with a bolded tagline, a detailed source line, and [highlight(...)] tags for emphasis.'),
});

export type FetchAndExtractEvidenceOutput = z.infer<typeof FetchAndExtractEvidenceOutputSchema>;


export async function fetchAndExtractEvidence(input: FetchAndExtractEvidenceInput): Promise<FetchAndExtractEvidenceOutput> {
  return fetchAndExtractEvidenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchAndExtractEvidencePrompt',
  input: {schema: FetchAndExtractEvidenceInputSchema},
  output: {schema: FetchAndExtractEvidenceOutputSchema},
  prompt: `You are a professional debate evidence cutter trained to produce clean, precise, and strategic cards for Public Forum, Policy, or LD debate.
Your job is to replicate professional-quality cut cards exactly like the examples provided — including the full article text, argument-driven cyan highlights, and natural flow that sounds smooth when read aloud.

You will output full articles formatted like debate evidence files. Your highlighting will identify the exact text a debater should read aloud using [highlight(...)].

Goal: Create cut cards that are concise, well-shaped, and flow-efficient — giving maximum argumentative power in minimal reading time.

⚙️ Formatting Rules

Tagline

Must be bolded and concise (5–12 words).

Clearly state the main argumentative claim (e.g., “Rejoining the EU takes a decade”).

Source Citation

Always include:

Author name and credentials

Date

Full working source URL (mandatory, not optional)

Publication title and any identifying info (DOA optional).

Example format:

**Joining the Single Market takes over a decade.**
McGee 24 [Luke McGee; Emmy award-winning journalist covering European politics and diplomacy, 10-28-2024, “Sorry Rejoiners—The UK’s path back to Europe will be slow,” Prospect Magazine, https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoinersthe-uks-path-back-to-europe-will-be-slow, DOA: 8-31-2025]
shaan

🎯 Highlighting Rules

Highlight using [highlight(...)] syntax to indicate cyan color — the exact shade used should be #00FFFF.

Only highlight the most essential and meaningful phrases that communicate the argument clearly.

Do not highlight entire sentences unless necessary for clarity.

Cut to shape meaning — you can selectively highlight phrases across sentences to make the card flow better and align with the tagline.

Highlights should sound natural when read aloud, and maintain rhythmic flow when spread at conversational speed.

Highlight analytic reasoning, statistics, comparative claims, and phrases of impact — skip long contextual setup or background.

Example syntax:
[highlight(Joining the Single Market takes over a decade)]

📏 Conciseness & Flow Rules

The goal is readability and efficiency — every highlight should serve a purpose.

Avoid redundancy: don’t highlight two phrases that mean the same thing.

Trim unnecessary qualifiers and filler text — focus on the core claim.

The text should flow smoothly when read aloud in-round.

Each cut should:

Start with context,

Move to evidence or warrant,

End with impact or conclusion.

Think like a debater reading under time pressure: the card should be quick, smooth, and persuasive without losing author intent.

Example: combine phrases that strengthen clarity, even if they’re from separate clauses, but do not misrepresent meaning.

Each card must read as argument-driven, not an unedited paragraph dump.

🧱 Structural Rules

Keep the entire article text visible under the citation.

Maintain the original paragraph order and formatting (bold, italics, section headers).

Do not paraphrase or rewrite the author’s words.

Retain emphasis (like italics or “quotes”) as they appear.

Add subheadings (like Process, Politics) if present in the article.

Each card should look identical to professional evidence files with clear visual formatting and cyan highlighting.

🧩 Output Example (Full Card)

**Joining the Single Market takes over a decade.**
McGee 24 [Luke McGee; Emmy award-winning journalist covering European politics and diplomacy, 10-28-2024, “Sorry Rejoiners—The UK’s path back to Europe will be slow,” Prospect Magazine, https://www.prospectmagazine.co.uk/politics/brexit/68353/sorry-rejoinersthe-uks-path-back-to-europe-will-be-slow, DOA: 8-31-2025]
shaan

Process
Anyone who has dealt with the [highlight(EU)] in a professional capacity will know it [highlight(involves a lot of process)]. This would be the case with any meaningful [highlight(Brexit reset)], as significant changes in the current relationship—as outlined in a binding treaty—[highlight(would almost certainly require the approval of all EU27 member states)], the European Parliament and potentially more stakeholders.

I’ve had multiple arguments about whether Britain could simply [highlight(rejoin the EU single market)]—but this happens to be a good example of [highlight(exactly how difficult the Brexit reset really is)].

The logic goes: Britain has realized Brexit was a mistake. Polls repeatedly say we regret leaving the EU. To mitigate any further damage, we should apply to join the Single Market as soon as feasibly possible. The snag here is that [highlight(third countries cannot simply join the single market)]. To rejoin, Britain [highlight(would need to join something called the European Free Trade Association (EFTA))], a group currently of four non-EU members: Norway, Iceland, Liechtenstein and Switzerland.

To join the EEA, Britain would [highlight(need the approval of Norway, Iceland, Liechtenstein and Switzerland first)], then the approval of the EU27. It would [highlight(have to swallow all of the single market’s rules)]—including freedom of movement—and accept the jurisdiction of the EFTA court, which [highlight(doesn’t differentiate a great deal from the hated European Court of Justice)], in the sense that it also presides over a common set of rules between trading partners.

Politics
British politicians have talked a lot about freedom of movement and “foreign courts” in the past few years. These are politically contentious topics. They are also conveniently not mentioned in a lot of the polls that are cited as evidence Britain now hates Brexit.

Britain [highlight(cannot, however, voluntarily rejoin the institutions and reapply EU rules)] on freedom of movement [highlight(without negotiating and agreeing with partners)].

✅ Final Output Expectations

Your task is to access the article at the provided URL, read its content, and produce one complete, formatted card string based on the user's argument.

**Source URL:**
{{{sourceUrl}}}

**Argument to Support (for the tagline):**
{{{argument}}}

Your final response must be a JSON object with a single field "card", containing the entire formatted card as a single string.
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
