'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { getSpeechOutlineAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { SavedOutline } from '@/types';

const formSchema = z.object({
  topic: z.string().min(10, 'Please enter a topic or quote of at least 10 characters.'),
});

interface SpeechGeneratorProps {
  onSave: (outline: Omit<SavedOutline, 'id' | 'createdAt'>) => void;
  activeTopic?: string;
}

export function SpeechGenerator({ onSave, activeTopic }: SpeechGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [generatedOutline, setGeneratedOutline] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: activeTopic || '',
    },
  });

  useEffect(() => {
    form.reset({ topic: activeTopic || '' });
    if (activeTopic) {
        setGeneratedOutline(null);
    }
  }, [activeTopic, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setGeneratedOutline(null);
    startTransition(async () => {
      const result = await getSpeechOutlineAction({ topic: values.topic });
      if (result.success && result.data) {
        setGeneratedOutline(result.data.outline);
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
        description: 'Your speech outline has been saved.',
      });
    }
  };
  
  const renderOutline = (outline: string) => {
    return outline.split('\n').filter(line => line.trim() !== '').map((line, index) => {
      if (line.match(/^#+\s/)) { // Matches h1, h2, h3 etc.
        return <h3 key={index} className="text-xl font-semibold mt-6 mb-2 text-primary">{line.replace(/#+\s/, '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc text-foreground/80">{line.substring(2)}</li>;
      }
      return <p key={index} className="mb-2 text-foreground/90">{line}</p>;
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Speech</CardTitle>
          <CardDescription>Enter a topic or a quote to generate a structured speech outline.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic / Quote</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'The only way to do great work is to love what you do.' - Steve Jobs"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <CardTitle>Your Generated Outline</CardTitle>
            <CardDescription className="pt-2 break-words">
              For topic: "{form.getValues('topic')}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {renderOutline(generatedOutline)}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Outline
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
