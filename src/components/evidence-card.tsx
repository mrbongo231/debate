'use client';

import { useState } from 'react';
import type { EvidenceCard as EvidenceCardType, Citation } from '@/lib/definitions';
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
import { format } from 'date-fns';

interface EvidenceCardProps {
  evidence: EvidenceCardType;
  argument: string;
  source?: string;
  citation: Citation;
  highlightColor?: string;
}

export function EvidenceCard({ evidence, argument, source, citation, highlightColor = 'cyan' }: EvidenceCardProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const highlightStyles: { [key: string]: { light: string; dark: string } } = {
    cyan: { light: 'rgba(0, 255, 255, 0.3)', dark: 'rgba(0, 255, 250, 0.4)' },
    green: { light: 'rgba(50, 255, 50, 0.4)', dark: 'rgba(50, 255, 50, 0.5)' },
    yellow: { light: 'rgba(255, 255, 0, 0.4)', dark: 'rgba(255, 255, 0, 0.5)' },
    pink: { light: 'rgba(244, 114, 182, 0.3)', dark: 'rgba(244, 114, 182, 0.4)' },
  };

  const getHighlightColor = () => {
    const colorSet = highlightStyles[highlightColor] || highlightStyles.pink;
    return isDark ? colorSet.dark : colorSet.light;
  };

  const formatCitation = (cit: Citation) => {
    if (!cit.author && !cit.title) {
        return source || 'No citation provided.';
    }
    const doa = format(new Date(), 'M-d-yyyy');
    const year = cit.date ? new Date(cit.date).getFullYear().toString().slice(-2) : '';
    const authorLastName = cit.author?.split(' ').pop() || '';
    
    // Ensure date is valid before trying to format
    let dateFormatted = '';
    if (cit.date) {
        try {
            dateFormatted = format(new Date(cit.date.replace(/-/g, '/')), 'M-d-yyyy');
        } catch (e) {
            // keep it empty if date is invalid
        }
    }
    
    let citationString = `${authorLastName} ${year} [`;
    citationString += `${cit.author || ''}`;
    if (cit.title) citationString += `, "${cit.title}"`;
    if (cit.publication) citationString += `, ${cit.publication}`;
    if (dateFormatted) citationString += `, ${dateFormatted}`;
    if (source) citationString += `, ${source}`;
    citationString += `, DOA: ${doa}]`;

    return citationString.replace(/, ,/g, ',').replace(/\[, /g, '[').trim();
  };

  const fullCitationText = formatCitation(citation);

  const handleSave = () => {
    try {
      const savedEvidence = JSON.parse(localStorage.getItem('evidenceLibrary') || '[]');
      const newCard = {
        argument,
        card: evidence.quote, 
        source: source || citation.url || "N/A",
        citation: fullCitationText
      };
      
      const isDuplicate = savedEvidence.some((card: any) => card.card === newCard.card && card.argument === newCard.argument);

      if (!isDuplicate) {
        savedEvidence.push(newCard);
        localStorage.setItem('evidenceLibrary', JSON.stringify(savedEvidence));
        setIsSaved(true);
        toast({
          title: 'Card Saved!',
          description: 'This evidence card has been added to your library.',
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
      <p><b>${argument}</b></p>
      <p><i>${fullCitationText}</i></p>
      <p>${
        evidence.quote.replace(/<highlight>/g, `<span style="background-color: ${getHighlightColor()}; text-decoration: underline;">`).replace(/<\/highlight>/g, '</span>')
      }</p>
    `;

    const plainText = `${argument}\n${fullCitationText}\n\n${evidence.quote.replace(/<\/?highlight>/g, '')}`;

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
    const parts = card.split(/(<highlight>.*?<\/highlight>)/g);
    return (
      <p className="text-sm/relaxed font-code">
        {parts.map((part, i) =>
          part.startsWith('<highlight>') ? (
            <span key={i} className="font-bold underline" style={{ backgroundColor: getHighlightColor() }}>
              {part.replace(/<\/?highlight>/g, '')}
            </span>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  return (
    <>
      <Card className={`${isDark ? 'bg-gradient-to-br from-gray-900/80 to-purple-900/30 backdrop-blur-lg border border-purple-500/30' : 'bg-card border-border'}`}>
        <CardHeader>
          <CardTitle className="text-lg text-primary">{argument}</CardTitle>
           <CardDescription>
            {fullCitationText}
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
    </>
  );
}
