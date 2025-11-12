import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({
    // Explicitly specify API version.
    apiVersion: 'v1beta'
  })],
  model: 'googleai/gemini-2.5-flash',
});

export { googleAI };
