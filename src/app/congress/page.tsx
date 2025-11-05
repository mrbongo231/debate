'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Mic, CheckCircle, XCircle } from 'lucide-react';
import { getCongressSpeechAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  legislation: z.string().min(10, 'Please enter the full text of the legislation.'),
  stance: z.enum(['affirmation', 'negation'], { required_error: 'You must select a stance.'}),
});

interface GeneratedCongressContent {
  title: string;
  speech: string;
  proPoints: string;
  conPoints: string;
}

export default function CongressPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedContent, setGeneratedContent] = useState<GeneratedCongressContent | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legislation: '',
      stance: 'affirmation',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setGeneratedContent(null);
    startTransition(async () => {
      const result = await getCongressSpeechAction(values);
      if (result.success && result.data) {
        setGeneratedContent(result.data);
        toast({
          title: 'Speech Generated!',
          description: 'Your new Congressional Debate speech is ready.',
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

  const renderSpeech = (content: string) => {
    return content.split('\n').filter(line => line.trim() !== '').map((line, index) => {
      if (line.match(/^(introduction|point 1|point 2|conclusion)/i)) { 
        return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-primary">{line}</h3>;
      }
      return <p key={index} className="mb-4 text-foreground/90 leading-relaxed">{line}</p>;
    });
  };

  const renderPoints = (points: string) => {
    return (
        <ul className="list-disc ml-6 space-y-2">
            {points.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- ')).map((line, index) => (
                <li key={index} className="text-foreground/80 leading-relaxed">
                    {line.substring(2)}
                </li>
            ))}
        </ul>
    )
  };

  return (
    <main className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="space-y-12 my-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Congress AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Craft a winning speech from the perspective of an NSDA National Champion.
          </p>
        </div>
        
        <Card className="border-border/40 animate-fade-in-up animation-delay-200">
          <CardHeader>
              <CardTitle className="text-xl">Generate Your Speech</CardTitle>
              <CardDescription>Enter the legislation and choose your stance to generate a 3-minute masterpiece.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="legislation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Legislation Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A Bill to Implement a Four-Day Work Week"
                          rows={5}
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                          Paste the full bill or resolution text here.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="stance"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base">Select Your Stance</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col md:flex-row gap-4 md:gap-8"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="affirmation" />
                            </FormControl>
                            <FormLabel className="font-normal text-base">
                              Affirmation
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="negation" />
                            </FormControl>
                            <FormLabel className="font-normal text-base">
                              Negation
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-white">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2" />}
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
          <Card className="animate-fade-in-up animation-delay-300">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">{generatedContent.title}</CardTitle>
              <CardDescription className="pt-2 break-words text-base">
                A speech in {form.getValues('stance')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {renderSpeech(generatedContent.speech)}
              </div>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <h3 className="text-2xl font-bold mb-4 text-green-500 flex items-center"><CheckCircle className="mr-2"/> Pro Points</h3>
                      {renderPoints(generatedContent.proPoints)}
                  </div>
                   <div>
                      <h3 className="text-2xl font-bold mb-4 text-red-500 flex items-center"><XCircle className="mr-2"/> Con Points</h3>
                      {renderPoints(generatedContent.conPoints)}
                  </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
