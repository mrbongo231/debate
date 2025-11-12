'use client';

import { CardCutterClient } from '@/components/card-cutter-client';

export default function CardCuttingPage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="space-y-12 my-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Card Cutting AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Paste an article URL or text and let our AI cut your cards for you.
          </p>
        </div>
        
        <CardCutterClient />

      </div>
    </main>
  );
}
