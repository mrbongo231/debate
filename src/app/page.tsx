'use client';

import { useState } from 'react';
import { Header } from '@/components/eloquent-engine/header';
import { SpeechGenerator } from '@/components/eloquent-engine/speech-generator';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';
import { SavedPrompts } from '@/components/eloquent-engine/saved-prompts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SavedOutline } from '@/types';

export default function Home() {
  const [savedOutlines, setSavedOutlines] = useLocalStorage<SavedOutline[]>('eloquent-engine-outlines', []);
  const [activeTopic, setActiveTopic] = useState<string>('');

  const handleSave = (data: { topic: string; outline: string }) => {
    const newOutline: SavedOutline = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    setSavedOutlines(prev => [newOutline, ...prev]);
  };

  const handleLoadTopic = (topic: string) => {
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteOutline = (id: string) => {
    setSavedOutlines(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
          <div className="lg:col-span-2 space-y-8">
            <SpeechGenerator onSave={handleSave} activeTopic={activeTopic} />
            <PracticeTimer />
          </div>
          <div className="lg:col-span-1">
             <SavedPrompts 
              savedOutlines={savedOutlines} 
              onLoad={handleLoadTopic}
              onDelete={handleDeleteOutline}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
