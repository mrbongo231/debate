'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah L.',
    title: 'National Champion, Extemp',
    body: 'Eloquent Engine is my secret weapon. The hooks are pure genius, and the sourced evidence gives me an unbeatable edge.',
  },
  {
    name: 'Kevin T.',
    title: 'State Finalist, Congress',
    body: 'I went from struggling with structure to delivering the top-ranked speech in the chamber. The Congress AI is a game-changer.',
  },
  {
    name: 'Maria G.',
    title: 'Debate Team Captain',
    body: 'The impromptu generator is incredible for practice. I can run drills for hours and never get bored. My confidence has skyrocketed.',
  },
  {
    name: 'David C.',
    title: '2x TOC Qualifier',
    body: 'The quality of the arguments and the creative angles are better than anything I\'ve seen. This is like having a national-level coach on call 24/7.',
  },
  {
    name: 'Jessica P.',
    title: 'Speech & Debate Coach',
    body: 'I recommend this to my entire team. It helps novices learn structure and veterans refine their arguments. An indispensable tool for any competitor.',
  },
   {
    name: 'Ben "The Gavel" H.',
    title: 'Presiding Officer',
    body: 'The talking points for each bill are a PO\'s dream. It helps me anticipate arguments and keep the session flowing smoothly. Outstanding.',
  },
];

const ReviewCard = ({
  name,
  title,
  body,
}: {
  name: string;
  title: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        'relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4',
        'border-gray-900/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{title}</p>
        </div>
      </div>
       <div className="flex items-center text-primary mt-2">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
       </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function ReviewMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background/50 py-20 md:shadow-xl mt-32 mb-16">
        <h2 className="text-4xl font-extrabold tracking-tight font-headline text-center mb-12">Loved by Champions Nationwide</h2>
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-marquee">
                {reviews.map((review) => (
                    <li key={review.name}>
                        <ReviewCard {...review} />
                    </li>
                ))}
            </ul>
             <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-marquee" aria-hidden="true">
                {reviews.map((review) => (
                    <li key={review.name}>
                        <ReviewCard {...review} />
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
}
