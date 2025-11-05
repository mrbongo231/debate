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
  prompt: `You are a world-champion public speaking coach, training a national finalist. Your task is to craft an exceptional, impromptu-style speech outline from the given topic. The structure should be compelling, clear, and designed for maximum impact.

Topic: {{{topic}}}

Your output MUST be a Markdown-formatted string and follow this structure precisely:

## Introduction
Start with a powerful, attention-grabbing hook. This could be a startling statistic, a provocative question, a short, vivid anecdote, or a powerful quote.
Clearly state the speech's core message or argument.
Briefly preview the main points you will cover.

## Main Point 1: [Descriptive Title]
Develop your first key idea.
Use evidence, a brief story, or a logical argument to support it.
Incorporate a rhetorical device (e.g., parallelism, analogy, or a rhetorical question).

## Main Point 2: [Descriptive Title]
Develop your second key idea.
This point should build upon the first, creating a logical flow.
Use a contrasting example or a different form of evidence than in the first point.

## Main Point 3: [Descriptive Title]
Develop your final key idea.
This should be the emotional or logical crescendo of your speech.
Connect this point back to the overall theme and the audience's experience.

## Conclusion
Summarize the main points in a fresh, memorable way (don't just list them).
End with a powerful, lingering thought or a clear call to action that ties back to your introduction. Leave the audience with something to think about.
`,
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
