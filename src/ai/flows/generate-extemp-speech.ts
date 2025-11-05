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

Your task is to generate a full 7-minute extemporaneous speech based on the provided topic. For all data and examples, you MUST provide credible, clickable markdown links to your sources.

Topic: {{{topic}}}

The speech MUST follow this structure and include these specific elements:

## Creative Introduction (Approx. 1:30)
1.  **The Hook:** This is your signature move. Start with a highly creative, unexpected comparison. Connect the topic to something from pop culture (a popular TV show like 'Black Mirror' or 'The Office', a video game like 'The Last of Us', a hit movie) or a significant, recent real-life event. The connection should be surprising but insightful, immediately grabbing the audience's attention and framing the topic in a new light.
2.  **Link:** Smoothly transition from your creative hook to the topic itself.
3.  **Significance:** Briefly explain why this topic is important and relevant to the audience *right now*.
4.  **Question:** Pose the central question your speech will answer.
5.  **Answer & Preview:** Provide a concise answer to your question, which will serve as your thesis. Then, briefly list the two or three main points you will use to support that answer.

## Main Point 1: [Descriptive Title] (Approx. 2:00)
-   **Claim:** State your first argument clearly.
-   **Warrant:** Explain the logic behind your claim.
-   **Data/Example:** Provide a specific, credible piece of evidence (statistic, historical example, expert testimony) to support your claim. You MUST cite your source.

## Main Point 2: [Descriptive Title] (Approx. 2:00)
-   **Claim:** State your second argument, building on the first.
-   **Warrant:** Explain the logic.
-   **Data/Example:** Provide a different kind of evidence than in the first point. If you used a statistic, maybe use an anecdote or a case study here. You MUST cite your source.

## Conclusion (Approx. 1:30)
1.  **Review:** Briefly summarize your main points in a fresh, impactful way. Do not just list them again.
2.  **Bookend/Tie-back:** Circle back to the creative hook you used in the introduction. This creates a satisfying, cohesive feel.
3.  **Final Thought:** End with a powerful, memorable statement that leaves the audience thinking. This could be a call to action, a profound thought, or a vision for the future.

The final output will be two fields. The 'speech' field should be a single Markdown-formatted string containing the full speech. The 'sources' field must contain a markdown-formatted list of all sources used, with clickable links.
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
