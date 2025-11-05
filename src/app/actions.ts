'use server';

import { generateSpeechOutline, GenerateSpeechOutlineInput } from '@/ai/flows/generate-speech-outline';
import { generateExtempSpeech, GenerateExtempSpeechInput, GenerateExtempSpeechOutput } from '@/ai/flows/generate-extemp-speech';
import { generateCongressSpeech, GenerateCongressSpeechInput, GenerateCongressSpeechOutput } from '@/ai/flows/generate-congress-speech';

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

export async function getCongressSpeechAction(input: GenerateCongressSpeechInput): Promise<{ success: boolean, data?: GenerateCongressSpeechOutput, error?: string}> {
  try {
    const result = await generateCongressSpeech(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate Congress speech.' };
  }
}
