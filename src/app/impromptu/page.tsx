
'use client';

import React, { useState, useEffect } from 'react';
import { SpeechGenerator } from '@/components/eloquent-engine/speech-generator';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';
import { SavedPrompts } from '@/components/eloquent-engine/saved-prompts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SavedOutline } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


// Context to pass down the onLoad handler to the client-only component
const SavedPromptsContext = React.createContext<{ onLoad: (topic: string) => void }>({ onLoad: () => {} });
export const useSavedPromptsContext = () => React.useContext(SavedPromptsContext);

function ClientOnlyHistory() {
  const [savedOutlines, setSavedOutlines] = useLocalStorage<SavedOutline[]>('eloquent-engine-outlines', []);
  
  const handleDeleteOutline = (id: string) => {
    setSavedOutlines(prev => prev.filter(o => o.id !== id));
  };
  
  const { onLoad } = useSavedPromptsContext();

  return (
    <SavedPrompts
      savedOutlines={savedOutlines}
      onLoad={onLoad}
      onDelete={handleDeleteOutline}
    />
  );
}


export default function ImpromptuPage() {
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = (data: { topic: string; outline: string }) => {
      const key = 'eloquent-engine-outlines';
      const existing = window.localStorage.getItem(key);
      const outlines: SavedOutline[] = existing ? JSON.parse(existing) : [];
      const newOutline: SavedOutline = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      const newOutlines = [newOutline, ...outlines];
      window.localStorage.setItem(key, JSON.stringify(newOutlines));
      window.dispatchEvent(new Event("local-storage"));
  };

  const handleLoadTopic = (topic: string) => {
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
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

        <SpeechGenerator onSave={handleSave} activeTopic={activeTopic} />

        <Tabs defaultValue="history" className="w-full animate-fade-in-up animation-delay-400">
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
            <SavedPromptsContext.Provider value={{ onLoad: handleLoadTopic }}>
                {isClient ? <ClientOnlyHistory /> : (
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                )}
            </SavedPromptsContext.Provider>
          </TabsContent>
          <TabsContent value="timer" className="mt-6">
            <PracticeTimer />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
