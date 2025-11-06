
'use client';

import React from 'react';
import { SpeechGenerator } from '@/components/eloquent-engine/speech-generator';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';

export default function ImpromptuPage() {
  
  return (
    <main className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="space-y-12 my-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Impromptu Outline Generator
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Craft and practice championship-level speeches.
          </p>
        </div>

        <SpeechGenerator />

        <div className="animate-fade-in-up animation-delay-400">
           <PracticeTimer />
        </div>

      </div>
    </main>
  );
}
