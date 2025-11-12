
'use server';

/**
 * @fileOverview Generates a full extemporaneous speech with a creative, comparative hook and sources.
 *
 * - generateExtempSpeech - A function that generates a full speech.
 * - GenerateExtempSpeechInput - The input type for the generateExtempSpeech function.
 * - GenerateExtempSpeechOutput - The return type for the generateExtempSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExtempSpeechInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for which to generate an extemporaneous speech.'),
});

export type GenerateExtempSpeechInput = z.infer<
  typeof GenerateExtempSpeechInputSchema
>;

const GenerateExtempSpeechOutputSchema = z.object({
  speech: z
    .string()
    .describe('A full, well-structured extemporaneous speech with a creative introduction, main points, and conclusion.'),
  sources: z
    .string()
    .describe('A markdown-formatted string of credible sources used for the data and examples in the speech, with clickable links.'),
  summary: z
    .string()
    .describe('A brief, bulleted summary of the main arguments of the speech to aid memorization.')
});

export type GenerateExtempSpeechOutput = z.infer<
  typeof GenerateExtempSpeechOutputSchema
>;

export async function generateExtempSpeech(
  input: GenerateExtempSpeechInput
): Promise<GenerateExtempSpeechOutput> {
  return generateExtempSpeechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExtempSpeechPrompt',
  input: {schema: GenerateExtempSpeechInputSchema},
  output: {schema: GenerateExtempSpeechOutputSchema},
  prompt: `You are a legendary extemporaneous speaking coach, known for producing national champions. Your specialty is crafting speeches that are not only perfectly structured but also unforgettable due to their creative and insightful introductions.

Your task is to generate a full 7-minute extemporaneous speech, a list of sources, and a brief summary for memorization, based on the provided topic.

**CRITICAL SOURCING AND FORMATTING RULES:**
1.  For all data and examples, you **MUST** use information from credible, real, and publicly accessible web pages.
2.  You **MUST** provide direct, clickable markdown links to the exact pages you used.
3.  **Output Structure:** The final output will be three JSON fields: 'speech', 'sources', and 'summary'.
    - The 'speech' field should contain **ONLY** the text of the speech. You can mention the source (e.g., "according to a report by..."), but **DO NOT** include the markdown link in the speech text itself.
    - The 'sources' field must contain a markdown-formatted list of all sources used (e.g., "* [Source Title](https://example.com)"). Every piece of data or specific example in the speech must have a corresponding entry in this 'sources' list.
    - The 'summary' field must contain a brief, bullet-point summary of the core arguments for easy memorization. The format should be: "- Hook: [description]\n- Question: [question]\n- Answer/Thesis: [answer]\n- Main Point 1: [summary]\n- Main Point 2: [summary]\n- Conclusion: [takeaway]".

Topic: {{{topic}}}

The speech MUST follow this structure and include these specific elements:

## Creative Introduction (Approx. 1:30)
1.  **The Hook:** Start with a highly creative, unexpected comparison. Connect the topic to something from pop culture (a popular TV show like 'Black Mirror' or 'The Office', a video game like 'The Last of Us', a hit movie) or a significant, recent real-life event. The connection should be surprising but insightful.
2.  **Link:** Smoothly transition from your creative hook to the topic.
3.  **Significance:** Briefly explain why this topic is important *right now*.
4.  **Question:** Pose the central question your speech will answer.
5.  **Answer & Preview:** Provide a concise answer to your question (your thesis) and preview your two or three main points.

## Main Point 1: [Descriptive Title] (Approx. 2:00)
-   **Claim:** State your first argument clearly.
-   **Warrant:** Explain the logic behind your claim.
-   **Data/Example:** Provide a specific, credible piece of evidence (statistic, historical example, expert testimony). Mention the source in the text, and add the full link to the 'sources' field.

## Main Point 2: [Descriptive Title] (Approx. 2:00)
-   **Claim:** State your second argument, building on the first.
-   **Warrant:** Explain the logic.
-   **Data/Example:** Provide a different kind of evidence. Mention the source, and add the link to the 'sources' field.

## Conclusion (Approx. 1:30)
1.  **Review:** Briefly summarize your main points in a fresh, impactful way.
2.  **Bookend/Tie-back:** Circle back to the creative hook from the introduction.
3.  **Final Thought:** End with a powerful, memorable statement.

---
Finally, after creating the speech and sources, generate the summary.
`,
});

const generateExtempSpeechFlow = ai.defineFlow(
  {
    name: 'generateExtempSpeechFlow',
    inputSchema: GenerateExtempSpeechInputSchema,
    outputSchema: GenerateExtempSpeechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
