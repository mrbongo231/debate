'use client';

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { runExtractEvidence, runFetchAndExtractEvidence } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EvidenceCard } from './evidence-card';
import { Scissors, LoaderCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EvidenceCard as EvidenceCardType } from '@/lib/definitions';

const urlFormSchema = z.object({
  sourceUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  argument: z.string().min(10, {
    message: 'Argument must be at least 10 characters.',
  }),
});

const textFormSchema = z.object({
  articleText: z.string().min(50, { message: 'Article text must be at least 50 characters.' }),
  argument: z.string().min(10, {
    message: 'Argument must be at least 10 characters.',
  }),
  'citation.author': z.string().optional(),
  'citation.title': z.string().optional(),
  'citation.publication': z.string().optional(),
  'citation.date': z.string().optional(),
  sourceUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={`w-full font-bold`}>
      {pending ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <>
          <Scissors className="mr-2" />
          Cut Cards
        </>
      )}
    </Button>
  );
}

type ActionState = {
  message?: string | null;
  evidence?: EvidenceCardType | null;
  id: number;
};

export function CardCutterClient() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [startTransition, isPending] = useTransition();
  const [evidenceList, setEvidenceList] = useState<EvidenceCardType[]>([]);

  const [urlState, urlFormAction] = useActionState(runFetchAndExtractEvidence, {
    message: null,
    evidence: null,
    id: 0,
  });
  
  const [textState, textFormAction] = useActionState(runExtractEvidence, {
    message: null,
    evidence: null,
    id: 0,
  });

  const [activeTab, setActiveTab] = useState('url');
  
  // Use a unified state that updates based on the most recent action.
  const [activeState, setActiveState] = useState<ActionState>({ message: null, evidence: null, id: 0 });

  useEffect(() => {
    if (urlState.id > 0 && urlState.id !== activeState.id) {
        setActiveState(urlState);
        if (urlState.evidence) {
            setEvidenceList(prev => [urlState.evidence!, ...prev]);
        }
    }
  }, [urlState, activeState.id]);

  useEffect(() => {
    if (textState.id > 0 && textState.id !== activeState.id) {
        setActiveState(textState);
        if (textState.evidence) {
            setEvidenceList(prev => [textState.evidence!, ...prev]);
        }
    }
  }, [textState, activeState.id]);

  useEffect(() => {
    if (activeState?.message) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: activeState.message,
      });
    }
  }, [activeState, toast]);

  
  useEffect(() => {
    setMounted(true);
  }, []);

  const urlForm = useForm<z.infer<typeof urlFormSchema>>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      sourceUrl: '',
      argument: '',
    },
  });

  const textForm = useForm<z.infer<typeof textFormSchema>>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      articleText: '',
      argument: '',
      'citation.author': '',
      'citation.title': '',
      'citation.publication': '',
      'citation.date': '',
      sourceUrl: '',
    },
  });
  
  const { formState: urlFormState } = urlForm;
  const { formState: textFormState } = textForm;

  const isSubmitting = urlFormState.isSubmitting || textFormState.isSubmitting;
  const isDark = mounted && theme === 'dark';


  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <Card className={`w-full ${isDark ? 'bg-gray-900/50 backdrop-blur-sm border-gray-700' : 'bg-card border-border'}`}>
        <CardHeader>
          <CardTitle className="text-primary">Card Cutter</CardTitle>
          <CardDescription>Enter a source URL for automated extraction, or paste text for manual cutting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="text">From Text</TabsTrigger>
            </TabsList>
            <TabsContent value="url">
              <Form {...urlForm}>
                <form 
                  action={urlFormAction}
                  className="space-y-6 pt-4"
                >
                  <FormField
                    control={urlForm.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://apnews.com/article/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={urlForm.control}
                    name="argument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Argument</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'Economic growth is slowing in Europe.'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <SubmitButton />
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="text">
                <Form {...textForm}>
                <form 
                  action={textFormAction} 
                  className="space-y-6 pt-4"
                >
                    <FormField
                      control={textForm.control}
                      name="articleText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Paste the full text of the article here." {...field} rows={8}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={textForm.control}
                        name="argument"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Argument</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'Economic growth is slowing in Europe.'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Citation Details (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={textForm.control}
                                    name="citation.author"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Author</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., Jane Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={textForm.control}
                                    name="citation.publication"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Publication</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., The New York Times" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={textForm.control}
                                    name="citation.title"
                                    render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Article Title</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., The Future of AI" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={textForm.control}
                                    name="citation.date"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Publication Date</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., 2024-01-01" type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={textForm.control}
                                    name="sourceUrl"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source URL</FormLabel>
                                        <FormControl>
                                        <Input placeholder="https://example.com/article" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <SubmitButton />
                </form>
                </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center lg:text-left font-headline">Extracted Evidence</h2>
        <div className="relative">
          { isSubmitting ? (
            <div className="space-y-4">
              <Skeleton className={`h-48 w-full ${isDark ? 'bg-gray-800/50' : 'bg-muted'}`} />
            </div>
          ) : evidenceList.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto scroll-fade p-2 -m-2 space-y-4">
              {evidenceList.map((ev, index) => (
                <EvidenceCard
                  key={index}
                  evidence={ev}
                />
              ))}
            </div>
          ) : (
            <Card className="flex h-64 w-full items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <p>Your evidence cards will appear here.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
