'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Scissors, Copy, Bookmark, Download } from 'lucide-react';
import { getCardsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

interface DebateCard {
  tag: string;
  author: string;
  date: string;
  claim: string;
  quote: string;
  impact: string;
}

interface GeneratedCardData {
  title: string;
  source: string;
  cards: DebateCard[];
}

export default function CardCuttingPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedContent, setGeneratedContent] = useState<GeneratedCardData | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setGeneratedContent(null);
    startTransition(async () => {
      const result = await getCardsAction(values);
      if (result.success && result.data) {
        setGeneratedContent(result.data);
        toast({
          title: 'Cards Generated!',
          description: 'Your new debate cards are ready.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Something went wrong. The URL might be inaccessible or behind a paywall.',
        });
      }
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <main className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="space-y-12 my-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Card Cutting AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Paste an article URL and let our AI cut your cards for you.
          </p>
        </div>
        
        <Card className="border-border/40 animate-fade-in-up animation-delay-200">
          <CardHeader>
              <CardTitle className="text-xl">Cut Your Cards</CardTitle>
              <CardDescription>Enter the URL of an article to automatically extract key arguments and evidence.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Article URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.nytimes.com/..."
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                          Paste the full URL of the article you want to cut.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-white">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scissors className="mr-2" />}
                  Generate Cards
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
                    <Separator className="my-4" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )}

        {generatedContent && !isPending && (
          <Card className="animate-fade-in-up animation-delay-300">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-3xl font-headline">{generatedContent.title}</CardTitle>
                        <CardDescription className="pt-2 break-words text-base">
                            Source: <a href={generatedContent.source} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{generatedContent.source}</a>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {generatedContent.cards.map((card, index) => (
                  <div key={index} className="border border-border/60 rounded-lg p-4 bg-muted/20 relative group">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(`${card.tag}\n\n${card.author} ${card.date}\n\n${card.claim}\n\n${card.quote}\n\nIMPACT: ${card.impact}`)}>
                        <Copy className="h-5 w-5" />
                        <span className="sr-only">Copy card</span>
                    </Button>
                    <h3 className="text-lg font-bold text-primary mb-2 pr-10">{card.tag}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{card.author} | {card.date}</p>
                    <p className="font-semibold mb-2 text-foreground/90">{card.claim}</p>
                    <blockquote className="border-l-4 border-secondary pl-4 italic my-4 text-foreground/80">
                      {card.quote}
                    </blockquote>
                    <p className="text-foreground/90"><strong className="text-secondary">IMPACT:</strong> {card.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}