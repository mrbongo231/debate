'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Zap, MoveRight, Layers, Bot, Clock, Sparkles, BookOpen } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { ReviewMarquee } from '@/components/eloquent-engine/review-marquee';

const features = [
    {
      icon: Layers,
      title: 'Structured Outlines',
      description: 'Generate clear, compelling outlines for Impromptu speeches from a single word or quote. Perfect for breaking down complex ideas into manageable points.',
    },
    {
      icon: Bot,
      title: 'Championship-Level Content',
      description: 'Craft full Extemporaneous speeches with creative hooks and sourced evidence, or write perfectly structured affirmative and negative speeches for Congressional Debate.',
    },
    {
      icon: Sparkles,
      title: 'Creative Hooks',
      description: 'Start your speeches with unique analogies to pop culture and real events, grabbing your audience\'s attention from the very first word.',
    },
    {
      icon: Clock,
      title: 'Practice & Refine',
      description: 'Use the built-in timer and speech history to perfect your delivery, track your progress, and master your timing for any event.',
    }
]

export default function HomePage() {
  const [opacity, setOpacity] = useState(1);
  const [showToolButtons, setShowToolButtons] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleScroll = () => {
      const heroSectionHeight = window.innerHeight * 0.6;
      const scrollY = window.scrollY;
      const newOpacity = Math.max(0, 1 - (scrollY / heroSectionHeight) * 2);
      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartClick = () => {
    startTransition(() => {
        setShowToolButtons(true);
    });
  }

  return (
    <div className="relative overflow-hidden my-8">
      {/* Background decorative elements */}
      <div className="absolute -top-10 -left-48 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-20 -right-48 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-200"></div>

      <div className="h-[70vh] flex flex-col items-center justify-center text-center relative z-10 transition-opacity duration-300" style={{ opacity }}>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
          Unleash Your Voice
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          Master the art of public speaking with powerful AI tools designed for both spontaneous brilliance and deep, persuasive arguments.
        </p>
        <div className="mt-12 relative flex justify-center items-center h-24">
            <Button 
                size="lg"
                className={cn(
                    "w-64 bg-gradient-to-r from-primary to-secondary text-white text-lg transition-all duration-500 ease-in-out",
                    showToolButtons ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                )}
                onClick={handleStartClick}
                disabled={isPending}
            >
                Start Winning
            </Button>
            
            {showToolButtons && (
                <div className="absolute inset-0 flex justify-center items-start gap-8">
                     <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up animation-delay-100">
                        <Button asChild className="w-56" variant="outline" size="lg">
                            <Link href="/impromptu">
                                <Zap className="mr-2" />
                                Impromptu Outline
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground w-56">Generate quick, structured outlines from a single topic or quote to kickstart your creativity.</p>
                     </div>
                    <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up animation-delay-300">
                        <Button asChild className="w-56" variant="outline" size="lg">
                            <Link href="/extemp">
                                <Wand2 className="mr-2" />
                                Extemp AI
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground w-56">Craft a full, championship-level speech complete with creative hooks, sourced evidence, and a memorization summary.</p>
                    </div>
                     <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up animation-delay-500">
                        <Button asChild className="w-56" variant="outline" size="lg">
                            <Link href="/congress">
                                <BookOpen className="mr-2" />
                                Congress AI
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground w-56">Write winning affirmative or negative speeches on any piece of legislation.</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      <section className="mt-32 mb-16 relative z-10 animate-fade-in-up animation-delay-400">
         <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight font-headline">Powerful Features, Effortless Delivery</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Everything you need to go from idea to standing ovation.</p>
         </div>
         <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <div key={index} className="text-center p-6 border border-border/20 rounded-xl bg-card/50 hover:bg-card/80 hover:-translate-y-2 transition-transform duration-300">
                    <div className="inline-block p-4 bg-primary/10 border border-primary/20 rounded-full mb-4">
                        <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                </div>
            ))}
         </div>
      </section>

    </div>
  );
}
