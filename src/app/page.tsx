'use client';

import { useState, useEffect } from 'react';
import { SpeechGenerator } from '@/components/eloquent-engine/speech-generator';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';
import { SavedPrompts } from '@/components/eloquent-engine/saved-prompts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SavedOutline } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Timer } from 'lucide-react';

export default function Home() {
  const [savedOutlines, setSavedOutlines] = useLocalStorage<SavedOutline[]>('eloquent-engine-outlines', []);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


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

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-12">
      <SpeechGenerator onSave={handleSave} activeTopic={activeTopic} />

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">
            <History className="mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="timer">
            <Timer className="mr-2" />
            Practice Timer
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-6">
          <SavedPrompts 
            savedOutlines={savedOutlines} 
            onLoad={handleLoadTopic}
            onDelete={handleDeleteOutline}
          />
        </TabsContent>
        <TabsContent value="timer" className="mt-6">
          <PracticeTimer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
