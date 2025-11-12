'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EvidenceCard as EvidenceCardType, Citation } from '@/lib/definitions';

interface EvidenceCardProps {
  evidence: EvidenceCardType;
  argument: string;
  source?: string;
  citation?: Citation;
}

export function EvidenceCard({
  evidence,
  argument,
  source,
  citation,
}: EvidenceCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    const citationText = [
      citation?.author,
      citation?.date,
      citation?.publication,
      citation?.title,
      citation?.url,
    ]
      .filter(Boolean)
      .join(', ');

    const textToCopy = `Argument: ${argument}\nSource: ${citationText}\nClaim: ${evidence.claim}\nQuote: "${evidence.quote}"\nExplanation: ${evidence.explanation}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Claim: {evidence.claim}</CardTitle>
            {citation && (
              <CardDescription className="text-xs text-muted-foreground pt-1">
                {citation.author && `${citation.author}, `}
                {citation.publication && `${citation.publication}, `}
                {citation.date && `(${citation.date})`}
              </CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm">Quote</h4>
          <blockquote className="border-l-2 pl-4 italic text-muted-foreground my-2">
            "{evidence.quote}"
          </blockquote>
        </div>
        <div>
          <h4 className="font-semibold text-sm">Explanation</h4>
          <p className="text-sm text-foreground/90">{evidence.explanation}</p>
        </div>
        {citation?.url && (
            <div>
                 <h4 className="font-semibold text-sm">Source URL</h4>
                <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline hover:text-primary/80">
                    {citation.url}
                </a>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
