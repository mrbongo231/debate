
'use server';

/**
 * @fileOverview Generates a complete 3-minute Congressional Debate speech.
 * 
 * - generateCongressSpeech - A function that generates a sponsorship, affirmation, or negation speech.
 * - GenerateCongressSpeechInput - The input type for the generateCongressSpeech function.
 * - GenerateCongressSpeechOutput - The return type for the generateCongressSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCongressSpeechInputSchema = z.object({
  legislation: z.string().describe('The full text of the bill or resolution.'),
  stance: z.enum(['affirmation', 'negation']).describe('The speaker\'s stance on the legislation.'),
});

export type GenerateCongressSpeechInput = z.infer<typeof GenerateCongressSpeechInputSchema>;

const GenerateCongressSpeechOutputSchema = z.object({
  title: z.string().describe('A concise, impactful title for the legislation.'),
  speech: z.string().describe('A complete, 3-minute speech in the chosen stance.'),
  proPoints: z.string().describe('Bulleted list of key arguments in favor of the legislation.'),
  conPoints: z.string().describe('Bulleted list of key arguments against the legislation.'),
});

export type GenerateCongressSpeechOutput = z.infer<typeof GenerateCongressSpeechOutputSchema>;

export async function generateCongressSpeech(
  input: GenerateCongressSpeechInput
): Promise<GenerateCongressSpeechOutput> {
  return generateCongressSpeechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCongressSpeechPrompt',
  input: { schema: GenerateCongressSpeechInputSchema },
  output: { schema: GenerateCongressSpeechOutputSchema },
  prompt: `You are a multi-time NSDA National Champion in Congressional Debate, known for your brilliant, insightful, and persuasive speeches that consistently earn the top rank. Your task is to write a perfect 3-minute speech (either affirming or negating), create a title for the legislation, and provide key pro/con talking points.

**Legislation Text:**
{{{legislation}}}

**Your Stance:** {{{stance}}}

**CRITICAL INSTRUCTIONS:**
1.  **Speech Persona:** Write in a confident, articulate, and highly persuasive tone. The analysis must be sharp, the logic clear, and the rhetoric powerful. Do NOT begin the speech with "Esteemed colleagues", "Honorable chair", or any similar generic opening. Find a more creative and engaging way to start.
2.  **Sourcing Requirement:** You MUST incorporate at least one piece of evidence from a credible, real, and recent (last 1-2 years) source (e.g., major news outlet, academic journal, reputable think tank). You must mention the source in the speech (e.g., "As the New York Times reported...").
3.  **Speech Structure (3-Minute Target):**
    *   **Introduction (Approx. 45 seconds):**
        *   **Creative Hook:** Start with a powerful, unexpected analogy, a vivid and relevant historical parallel, a poignant literary reference, or a gripping anecdote that is directly tied to the core conflict of the legislation. This must grab the chamber's attention immediately and feel clever.
        *   **Link:** Smoothly connect the hook to the specific legislation being debated.
        *   **Position Statement:** Clearly state your stance (e.g., "And that is why I stand in firm affirmation of this bill") and briefly introduce your core arguments.
    *   **Point 1 (Approx. 1 minute):**
        *   **Claim:** State your first major argument.
        *   **Warrant:** Explain the logic. Why is this claim true?
        *   **Impact & Evidence:** Explain the significance. Why does this argument matter? Use your cited source here to provide strong evidence (statistic, finding, expert quote) and explain the real-world consequences (solvency, harms, economic impact, etc.).
    *   **Point 2 (Approx. 1 minute):**
        *   **Claim:** State your second, distinct argument.
        *   **Warrant:** Explain the logic.
        *   **Impact:** Explain the significance, providing a different angle of impact than the first point.
    *   **Conclusion (Approx. 15-20 seconds):**
        *   **Summary:** Briefly and powerfully restate your main arguments.
        *   **Final Thought & Call to Action:** End with a memorable, impactful statement that crystallizes your position and makes it unequivocally clear whether the chamber must vote to pass or fail the legislation.
4.  **Formatting:** You MUST insert a double line break (an empty line) between the Introduction, Point 1, Point 2, and the Conclusion to create clear visual separation.
5.  **Content Generation:**
    *   **Title:** Based on the legislation's text, create a short, official-sounding title (e.g., "A Bill to Enhance Cybersecurity Infrastructure").
    *   **Pro/Con Points:** After writing the speech, generate 3-4 distinct, bulleted talking points for both the pro and con sides. These should be concise arguments that could be used by other speakers.

Your final output must be in the specified JSON format with the 'title', 'speech', 'proPoints', and 'conPoints' fields.
`,
});


const generateCongressSpeechFlow = ai.defineFlow(
  {
    name: 'generateCongressSpeechFlow',
    inputSchema: GenerateCongressSpeechInputSchema,
    outputSchema: GenerateCongressSpeechOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
