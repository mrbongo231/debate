'use client';

import { useState } from 'react';
import type { EvidenceCard as EvidenceCardType } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface EvidenceCardProps {
  evidence: EvidenceCardType & { citation: string };
  highlightColor?: string;
}

export function EvidenceCard({ evidence, highlightColor = '#00FFFF' }: EvidenceCardProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getHighlightCss = () => {
    // Using a more transparent color for better readability
    const color = highlightColor;
    const alpha = isDark ? '40' : '30'; // 40% opacity for dark, 30% for light
    return `${color}${alpha}`;
  };
  
  const handleSave = () => {
    // This function can be expanded to save to a database or other persistent storage
    try {
      const savedEvidence = JSON.parse(localStorage.getItem('evidenceLibrary') || '[]');
      const newCard = {
        claim: evidence.claim,
        quote: evidence.quote, 
        citation: evidence.citation,
      };
      
      const isDuplicate = savedEvidence.some((card: any) => card.quote === newCard.quote && card.claim === newCard.claim);

      if (!isDuplicate) {
        savedEvidence.push(newCard);
        localStorage.setItem('evidenceLibrary', JSON.stringify(savedEvidence));
        setIsSaved(true);
        toast({
          title: 'Card Saved!',
          description: 'This evidence card has been added to your local library.',
        });
      } else {
        setIsSaved(true);
        toast({
          variant: 'default',
          title: 'Already Saved',
          description: 'This card is already in your library.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the card to your library.',
      });
    }
  };

  const handleCopy = () => {
    const cardHtml = `
      <p><b>${evidence.claim}</b></p>
      <pre style="white-space: pre-wrap; font-family: monospace;">${evidence.citation}</pre>
      <p>${
        evidence.quote.replace(/\[highlight\((.*?)\)\]/g, `<span style="background-color: ${getHighlightCss()};">$1</span>`)
      }</p>
    `;

    const plainText = `${evidence.claim}\n${evidence.citation}\n\n${evidence.quote.replace(/\[highlight\((.*?)\)\]/g, '$1')}`;

    try {
      const blob = new Blob([cardHtml], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([plainText], {type: 'text/plain'}) })];
      navigator.clipboard.write(data).then(() => {
        toast({
          title: 'Copied to Clipboard!',
          description: 'The evidence card has been copied.',
        });
      });
    } catch(e) {
      // Fallback for older browsers
      navigator.clipboard.writeText(plainText).then(() => {
        toast({
          title: 'Copied to Clipboard!',
          description: 'The evidence card has been copied (rich text not supported).',
        });
      });
    }
  };

  const renderHighlightedCard = (card: string) => {
    const parts = card.split(/(\[highlight\(.*?\)\])/g);
    return (
      <p className="text-sm/relaxed">
        {parts.map((part, i) =>
          part.startsWith('[highlight(') ? (
            <span key={i} style={{ backgroundColor: getHighlightCss() }}>
              {part.substring(10, part.length - 2)}
            </span>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  return (
    <Card className={`${isDark ? 'bg-gradient-to-br from-gray-900/80 to-purple-900/30 backdrop-blur-lg border border-purple-500/30' : 'bg-card border-border'}`}>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">{evidence.claim}</CardTitle>
         <CardDescription className="text-xs whitespace-pre-wrap font-mono">
          {evidence.citation}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className={`border-l-4 pl-4 ${isDark ? 'border-cyan-400' : 'border-primary'}`}>
            <div className={`${isDark ? 'bg-black/40' : 'bg-muted'} p-3 rounded-r-md`}>
                {renderHighlightedCard(evidence.quote)}
            </div>
        </blockquote>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
        <Button onClick={handleSave} disabled={isSaved}>
          <Save className="mr-2 h-4 w-4" />
          {isSaved ? 'Saved' : 'Save to Library'}
        </Button>
      </CardFooter>
    </Card>
  );
}
