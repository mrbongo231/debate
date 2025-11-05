'use server';

/**
 * @fileOverview Generates a structured speech outline based on a user-provided topic or quote.
 *
 * - generateSpeechOutline - A function that generates a speech outline.
 * - GenerateSpeechOutlineInput - The input type for the generateSpeechOutline function.
 * - GenerateSpeechOutlineOutput - The return type for the generateSpeechOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpeechOutlineInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or quote for which to generate a speech outline.'),
});

export type GenerateSpeechOutlineInput = z.infer<
  typeof GenerateSpeechOutlineInputSchema
>;

const GenerateSpeechOutlineOutputSchema = z.object({
  outline: z
    .string()
    .describe('A well-structured speech outline with introduction, main points, and conclusion.'),
});

export type GenerateSpeechOutlineOutput = z.infer<
  typeof GenerateSpeechOutlineOutputSchema
>;

export async function generateSpeechOutline(
  input: GenerateSpeechOutlineInput
): Promise<GenerateSpeechOutlineOutput> {
  return generateSpeechOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpeechOutlinePrompt',
  input: {schema: GenerateSpeechOutlineInputSchema},
  output: {schema: GenerateSpeechOutlineOutputSchema},
  prompt: `You are an expert speechwriter. Generate a clear and concise speech outline based on the following topic or quote:\n\nTopic: {{{topic}}}\n\nThe outline should include:\n- An engaging introduction\n- 3-5 main points with brief explanations\n- A strong conclusion that summarizes the key takeaways\n\nEnsure the outline is structured for a short, impromptu speech.`,
});

const generateSpeechOutlineFlow = ai.defineFlow(
  {
    name: 'generateSpeechOutlineFlow',
    inputSchema: GenerateSpeechOutlineInputSchema,
    outputSchema: GenerateSpeechOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
