'use server';

import { generateSpeechOutline, GenerateSpeechOutlineInput } from '@/ai/flows/generate-speech-outline';
import { generateExtempSpeech, GenerateExtempSpeechInput, GenerateExtempSpeechOutput } from '@/ai/flows/generate-extemp-speech';

export async function getSpeechOutlineAction(input: GenerateSpeechOutlineInput) {
  try {
    const result = await generateSpeechOutline(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate speech outline.' };
  }
}

export async function getExtempSpeechAction(input: GenerateExtempSpeechInput): Promise<{ success: boolean, data?: GenerateExtempSpeechOutput, error?: string}> {
    try {
      const result = await generateExtempSpeech(input);
      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to generate extemp speech.' };
    }
  }
