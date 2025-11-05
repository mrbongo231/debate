'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookUp, Trash2, FileText } from 'lucide-react';
import type { SavedOutline } from '@/types';

interface SavedPromptsProps {
  savedOutlines: SavedOutline[];
  onLoad: (topic: string) => void;
  onDelete: (id: string) => void;
}

export function SavedPrompts({ savedOutlines, onLoad, onDelete }: SavedPromptsProps) {
  
  const renderOutline = (outline: string) => {
    return outline.split('\n').filter(line => line.trim() !== '').map((line, index) => {
      if (line.match(/^#+\s/)) {
        return <h4 key={index} className="text-md font-semibold mt-3 mb-1 text-primary">{line.replace(/#+\s/, '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc text-sm text-foreground/80">{line.substring(2)}</li>;
      }
      return <p key={index} className="mb-1 text-sm text-foreground/90">{line}</p>;
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Review Past Outlines</CardTitle>
        <CardDescription>Access your saved prompts and outlines.</CardDescription>
      </CardHeader>
      <CardContent>
        {savedOutlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10 border-2 border-dashed border-border rounded-lg h-full">
            <FileText className="h-12 w-12 mb-4" />
            <p className="font-semibold">No saved outlines yet.</p>
            <p className="text-sm">Your saved speech outlines will appear here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {savedOutlines.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item) => (
                <AccordionItem value={item.id} key={item.id} className="border border-border rounded-lg bg-background/50 data-[state=open]:bg-accent/10">
                  <AccordionTrigger className="text-left hover:no-underline px-4 py-3">
                    <span className="truncate pr-4">{item.topic}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        {renderOutline(item.outline)}
                      </div>
                      <div className="flex gap-2 justify-end pt-4 border-t border-border">
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
