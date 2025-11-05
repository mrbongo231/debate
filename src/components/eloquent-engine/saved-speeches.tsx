'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookUp, Trash2, FileText } from 'lucide-react';
import type { SavedSpeech } from '@/types';

interface SavedSpeechesProps {
  savedSpeeches: SavedSpeech[];
  onLoad: (topic: string) => void;
  onDelete: (id: string) => void;
}

export function SavedSpeeches({ savedSpeeches, onLoad, onDelete }: SavedSpeechesProps) {
  
    const renderContent = (content: string) => {
        return content.split('\n').filter(line => line.trim() !== '').map((line, index) => {
          if (line.match(/^##\s/)) { 
            return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-primary">{line.replace(/##\s/, '')}</h3>;
          }
          if (line.match(/^###\s/)) {
            return <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-primary/80">{line.replace(/###\s/, '')}</h4>;
          }
          if (line.startsWith('- ')) {
            return <li key={index} className="ml-4 list-disc text-sm text-foreground/80 leading-relaxed">{line.substring(2)}</li>;
          }
          return <p key={index} className="mb-2 text-sm text-foreground/90 leading-relaxed">{line}</p>;
        });
    };

    const renderSources = (sources: string) => {
        const sourceLinks = sources.match(/\[.*?\]\(.*?\)/g) || [];
        if (sourceLinks.length === 0) return <p className="text-sm text-foreground/80">No sources were provided.</p>;
    
        return (
            <ul className="list-disc ml-4 space-y-1">
                {sources.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- ')).map((line, index) => {
                    const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
                        const text = linkMatch[1];
                        const url = linkMatch[2];
                        return (
                            <li key={index} className="text-sm text-foreground/80 leading-relaxed">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary/90 underline hover:text-primary transition-colors">
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
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Speech History</CardTitle>
        <CardDescription>Review, reload, and refine your past extemp speeches.</CardDescription>
      </CardHeader>
      <CardContent>
        {savedSpeeches.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 border-2 border-dashed border-border rounded-lg h-full bg-background/20">
            <FileText className="h-12 w-12 mb-4" />
            <p className="font-semibold text-lg">No Saved Speeches</p>
            <p className="text-sm">Your generated speeches will appear here once you save them.</p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4 -mr-4">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {savedSpeeches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item) => (
                <AccordionItem value={item.id} key={item.id} className="border border-border rounded-lg bg-card/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] data-[state=open]:scale-[1.02] data-[state=open]:border-primary/50">
                  <AccordionTrigger className="text-left hover:no-underline px-4 py-3 text-lg">
                    <span className="pr-4">{item.topic}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2 prose prose-invert max-w-none">
                      <div className="space-y-2">
                        {renderContent(item.speech)}
                      </div>
                       <div className="mt-8 pt-4 border-t border-border">
                            <h3 className="text-xl font-bold mb-3 text-primary">Sources</h3>
                            {renderSources(item.sources)}
                        </div>
                      <div className="flex gap-2 justify-end pt-4 border-t border-border mt-4">
                        <Button variant="ghost" size="sm" onClick={() => onLoad(item.topic)}>
                            <BookUp className="mr-2 h-4 w-4" /> Load Topic
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
