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
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface EvidenceCardProps {
  evidence: EvidenceCardType;
  highlightColor?: string;
}

export function EvidenceCard({ evidence, highlightColor = '#00FFFF' }: EvidenceCardProps) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getHighlightCss = () => {
    const color = highlightColor;
    const alpha = isDark ? '40' : '30';
    return `${color}${alpha}`;
  };

  const handleCopy = () => {
    const cardHtml = `
      <p><b>${evidence.claim}</b></p>
      <pre style="white-space: pre-wrap; font-family: monospace; color: #666;">${evidence.citation}</pre>
      <p>${
        evidence.quote.replace(/\[highlight\(([\s\S]*?)\)\]/g, `<span style="background-color: ${highlightColor}4D;">$1</span>`)
      }</p>
    `;
    const plainText = `${evidence.claim}\n${evidence.citation}\n\n${evidence.quote.replace(/\[highlight\(([\s\S]*?)\)\]/g, '$1')}`;

    try {
      const blob = new Blob([cardHtml], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([plainText], {type: 'text/plain'}) })];
      navigator.clipboard.write(data).then(() => {
        toast({
          title: 'Copied to Clipboard!',
          description: 'The evidence card has been copied with highlighting.',
        });
      });
    } catch(e) {
      navigator.clipboard.writeText(plainText).then(() => {
        toast({
          title: 'Copied to Clipboard!',
          description: 'The evidence card has been copied (rich text not supported).',
        });
      });
    }
  };

  const renderHighlightedCard = (card: string) => {
    const parts = card.match(/\[highlight\(([\s\S]*?)\)\]|[\s\S]+?(?=\[highlight\(|$)/g) || [];
    
    return (
      <p className="text-sm/relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          const highlightMatch = part.match(/\[highlight\(([\s\S]*?)\)\]/);
          if (highlightMatch) {
            return (
              <span key={i} style={{ backgroundColor: getHighlightCss() }}>
                {highlightMatch[1]}
              </span>
            );
          }
          return part;
        })}
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
      </CardFooter>
    </Card>
  );
}
