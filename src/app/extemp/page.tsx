
'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Timer } from 'lucide-react';
import { getExtempSpeechAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PracticeTimer } from '@/components/eloquent-engine/practice-timer';

const formSchema = z.object({
  topic: z.string().min(1, 'Please enter a topic.'),
});

interface GeneratedSpeech {
  speech: string;
  sources: string;
  summary: string;
}

export default function ExtempPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedContent, setGeneratedContent] = useState<GeneratedSpeech | null>(null);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setActiveTopic(values.topic);
    setGeneratedContent(null);
    startTransition(async () => {
      const result = await getExtempSpeechAction({ topic: values.topic });
      if (result.success && result.data) {
        setGeneratedContent(result.data);
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

  const renderSummary = (summary: string) => {
    return (
      <ul className="space-y-2">
        {summary.split('\n').filter(line => line.trim().startsWith('- ')).map((line, index) => (
          <li key={index} className="text-foreground/80 leading-relaxed flex">
            <span className="font-semibold w-32 shrink-0">{line.substring(2, line.indexOf(':') + 1)}</span>
            <span>{line.substring(line.indexOf(':') + 2)}</span>
          </li>
        ))}
      </ul>
    );
  }

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

        {generatedContent && !isPending && (
          <Tabs defaultValue="speech" className="w-full animate-fade-in-up animation-delay-300">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-headline">Your Generated Speech</CardTitle>
                <CardDescription className="pt-2 break-words text-base">
                  For topic: "{activeTopic}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="speech">Speech</TabsTrigger>
                  <TabsTrigger value="summary">Memorization Summary</TabsTrigger>
                  <TabsTrigger value="sources">Sources</TabsTrigger>
                </TabsList>
                <TabsContent value="speech" className="mt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {renderContent(generatedContent.speech)}
                  </div>
                </TabsContent>
                <TabsContent value="summary" className="mt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {renderSummary(generatedContent.summary)}
                  </div>
                </TabsContent>
                <TabsContent value="sources" className="mt-6">
                    <h3 className="text-2xl font-bold mb-4 text-primary">Sources</h3>
                    {renderSources(generatedContent.sources)}
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        )}
        
        <div className="animate-fade-in-up animation-delay-400">
          <PracticeTimer />
        </div>
      </div>
    </main>
  );
}

    