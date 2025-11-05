
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Save, History, Timer } from 'lucide-react';
import { getExtempSpeechAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SavedSpeech } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';
import { SavedSpeeches } from '@/components/eloquent-engine/saved-speeches';
import React from 'react';

const formSchema = z.object({
  topic: z.string().min(1, 'Please enter a topic.'),
});

interface GeneratedSpeech {
  speech: string;
  sources: string;
}

// This component will only be rendered on the client.
function ClientOnlyHistory() {
  const [savedSpeeches, setSavedSpeeches] = useLocalStorage<SavedSpeech[]>('eloquent-engine-speeches', []);

  const handleDeleteSpeech = (id: string) => {
    setSavedSpeeches(prev => prev.filter(o => o.id !== id));
  };

  // Get the onLoad handler from context.
  const { onLoad } = useSavedSpeechesContext();

  return (
    <SavedSpeeches
      savedSpeeches={savedSpeeches}
      onLoad={onLoad}
      onDelete={handleDeleteSpeech}
    />
  );
}

// Create a context to pass the onLoad function down.
const SavedSpeechesContext = React.createContext<{ onLoad: (topic: string) => void }>({ onLoad: () => {} });
const useSavedSpeechesContext = () => React.useContext(SavedSpeechesContext);

export default function ExtempPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedSpeech, setGeneratedSpeech] = useState<GeneratedSpeech | null>(null);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: activeTopic || '',
    },
  });

  useEffect(() => {
    if (isClient) {
      form.reset({ topic: activeTopic || '' });
      if (activeTopic) {
        setGeneratedSpeech(null);
      }
    }
  }, [activeTopic, form, isClient]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setGeneratedSpeech(null);
    startTransition(async () => {
      const result = await getExtempSpeechAction({ topic: values.topic });
      if (result.success && result.data) {
        setGeneratedSpeech(result.data);
        toast({
          title: 'Speech Generated!',
          description: 'Your new extemporaneous speech is ready.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Something went wrong.',
        });
      }
    });
  };

  const handleSave = () => {
    const topic = form.getValues('topic');
    if (topic && generatedSpeech) {
      try {
        const key = 'eloquent-engine-speeches';
        const existing = window.localStorage.getItem(key);
        const speeches: SavedSpeech[] = existing ? JSON.parse(existing) : [];
        const newSpeech: SavedSpeech = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          topic,
          speech: generatedSpeech.speech,
          sources: generatedSpeech.sources,
        };
        const newSpeeches = [newSpeech, ...speeches];
        window.localStorage.setItem(key, JSON.stringify(newSpeeches));
        window.dispatchEvent(new Event("local-storage"));

        toast({
          title: 'Saved!',
          description: 'Your extemp speech has been saved to your history.',
        });
      } catch (error) {
        console.warn('Failed to save speech:', error);
      }
    }
  };

  const handleLoadTopic = (topic: string) => {
    setActiveTopic(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = (content: string) => {
    return content.split('\n').filter(line => line.trim() !== '').map((line, index) => {
      if (line.match(/^##\s/)) {
        return <h3 key={index} className="text-2xl font-bold mt-8 mb-4 text-primary">{line.replace(/##\s/, '')}</h3>;
      }
      if (line.match(/^###\s/)) {
        return <h4 key={index} className="text-xl font-semibold mt-6 mb-3 text-secondary">{line.replace(/###\s/, '')}</h4>;
      }
      if (line.match(/^\d\.\s/)) { // Numbered list for intro/conclusion points
        return <p key={index} className="mb-2 text-foreground/90 leading-relaxed"><span className="font-semibold">{line.substring(0, 2)}</span>{line.substring(2)}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc text-foreground/80 leading-relaxed">{line.substring(2)}</li>;
      }
      return <p key={index} className="mb-4 text-foreground/90 leading-relaxed">{line}</p>;
    });
  };

  const renderSources = (sources: string) => {
    const sourceLinks = sources.match(/\[.*?\]\(.*?\)/g) || [];
    if (sourceLinks.length === 0) return <p className="text-foreground/80">No sources were provided.</p>;

    return (
        <ul className="list-disc ml-6 space-y-2">
            {sources.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- ')).map((line, index) => {
                const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    const text = linkMatch[1];
                    const url = linkMatch[2];
                    return (
                        <li key={index} className="text-foreground/80 leading-relaxed">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 transition-colors">
                                {text}
                            </a>
                        </li>
                    )
                }
                return null;
            })}
        </ul>
    )
};

  return (
    <main className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="space-y-12 my-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Extemp AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Generate and perfect a championship-level extemporaneous speech.
          </p>
        </div>
        
        <Card className="border-border/40 animate-fade-in-up animation-delay-200">
          <CardHeader>
              <CardTitle className="text-xl">Create Your Speech</CardTitle>
              <CardDescription>Enter a topic to generate a masterpiece with creative hooks and sources.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Artificial Intelligence', 'Climate Change', or 'The gig economy'"
                          rows={3}
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-white">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
                  Generate Speech
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isPending && (
            <Card className="animate-fade-in">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-6 w-1/3 mt-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )}

        {generatedSpeech && !isPending && (
          <Card className="animate-fade-in-up animation-delay-300">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Your Generated Speech</CardTitle>
              <CardDescription className="pt-2 break-words text-base">
                For topic: "{form.getValues('topic')}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {renderContent(generatedSpeech.speech)}
              </div>
              <div className="mt-12 pt-6 border-t border-border">
                  <h3 className="text-2xl font-bold mb-4 text-primary">Sources</h3>
                  {renderSources(generatedSpeech.sources)}
              </div>
            </CardContent>
             <CardFooter>
              <Button variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Speech to History
              </Button>
            </CardFooter>
          </Card>
        )}
        
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
             <SavedSpeechesContext.Provider value={{ onLoad: handleLoadTopic }}>
                {isClient ? <ClientOnlyHistory /> : <div>Loading history...</div>}
            </SavedSpeechesContext.Provider>
          </TabsContent>
          <TabsContent value="timer" className="mt-6">
            <PracticeTimer />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
