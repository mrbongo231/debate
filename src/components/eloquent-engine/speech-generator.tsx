'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Wand2 } from 'lucide-react';
import { getSpeechOutlineAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { SavedOutline } from '@/types';

const formSchema = z.object({
  topic: z.string().min(1, 'Please enter a topic or quote.'),
});

interface SpeechGeneratorProps {
  onSave: (outline: Omit<SavedOutline, 'id' | 'createdAt'>) => void;
  activeTopic?: string;
}

export function SpeechGenerator({ onSave, activeTopic }: SpeechGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [generatedOutline, setGeneratedOutline] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

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
          setGeneratedOutline(null);
      }
    }
  }, [activeTopic, form, isClient]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setGeneratedOutline(null);
    startTransition(async () => {
      const result = await getSpeechOutlineAction({ topic: values.topic });
      if (result.success && result.data) {
        setGeneratedOutline(result.data.outline);
        toast({
          title: 'Outline Generated!',
          description: 'Your new speech outline is ready.',
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
    if (topic && generatedOutline) {
      onSave({ topic, outline: generatedOutline });
      toast({
        title: 'Saved!',
        description: 'Your speech outline has been saved to your history.',
      });
    }
  };
  
  const renderOutline = (outline: string) => {
    return outline.split('\n').filter(line => line.trim() !== '').map((line, index) => {
      if (line.match(/^##\s/)) { 
        return <h3 key={index} className="text-2xl font-bold mt-8 mb-4 text-primary">{line.replace(/##\s/, '')}</h3>;
      }
      if (line.match(/^###\s/)) {
        return <h4 key={index} className="text-xl font-semibold mt-6 mb-3 text-primary/80">{line.replace(/###\s/, '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc text-foreground/80 leading-relaxed">{line.substring(2)}</li>;
      }
      return <p key={index} className="mb-4 text-foreground/90 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-3xl">Create Your Speech</CardTitle>
          <CardDescription>Enter a topic, quote, or idea to generate a masterpiece.</CardDescription>
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
                        placeholder="e.g., 'Hurricanes', 'Social Media', or 'The only way to do great work is to love what you do.' - Steve Jobs"
                        rows={3}
                        className="text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} size="lg">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
                Generate Outline
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
          <Card>
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

      {generatedOutline && !isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Generated Outline</CardTitle>
            <CardDescription className="pt-2 break-words text-base">
              For topic: "{form.getValues('topic')}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              {renderOutline(generatedOutline)}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Outline to History
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
