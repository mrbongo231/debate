
'use client';

import { useState, useEffect } from 'react';
import { SpeechGenerator } from '@/components/eloquent-engine/speech-generator';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';
import { SavedPrompts } from '@/components/eloquent-engine/saved-prompts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SavedOutline } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Timer } from 'lucide-react';

function ClientOnlyHistory() {
  const [savedOutlines, setSavedOutlines] = useLocalStorage<SavedOutline[]>('eloquent-engine-outlines', []);
  
  const handleDeleteOutline = (id: string) => {
    setSavedOutlines(prev => prev.filter(o => o.id !== id));
  };
  
  // The onLoad handler is passed up to the parent `ImpromptuPage`
  // so we will get it from props. This component only handles
  // fetching and deleting from localStorage. The parent still
  // controls the state for the generator.
  const { onLoad } = useSavedPromptsContext();

  return (
    <SavedPrompts
      savedOutlines={savedOutlines}
      onLoad={onLoad}
      onDelete={handleDeleteOutline}
    />
  );
}

// Context to pass down the onLoad handler to the client-only component
const SavedPromptsContext = React.createContext<{ onLoad: (topic: string) => void }>({ onLoad: () => {} });
const useSavedPromptsContext = () => React.useContext(SavedPromptsContext);


export default function ImpromptuPage() {
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = (data: { topic: string; outline: string }) => {
    // We need to access localStorage for this, so we find the key and update it manually
    // This is a bit of a hack, but it avoids re-rendering the whole page
    // when we just want to save something.
    try {
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
        // Manually dispatch an event to notify other components (like our history tab)
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key “eloquent-engine-outlines”:`, error);
      }
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
                {isClient ? <ClientOnlyHistory /> : <div>Loading history...</div>}
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
