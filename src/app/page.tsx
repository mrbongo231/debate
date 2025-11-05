
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Zap, MoveRight, Layers, Bot, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
    {
      icon: Layers,
      title: 'Structured Outlines',
      description: 'Generate clear, compelling outlines from a single word or quote.',
    },
    {
      icon: Bot,
      title: 'Championship-Level Content',
      description: 'Craft full speeches with creative hooks and sourced evidence.',
    },
    {
      icon: Sparkles,
      title: 'Creative Hooks',
      description: 'Start your speeches with unique analogies to pop culture and real events.',
    },
    {
      icon: Clock,
      title: 'Practice & Refine',
      description: 'Use the built-in timer and speech history to perfect your delivery.',
    }
]

export default function HomePage() {
  const [opacity, setOpacity] = useState(1);

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
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 animate-fade-in-up">
        <Card className="border-border/40 hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Impromptu Outline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Generate structured, impactful outlines from any topic or quote in seconds. Perfect for quick thinking and clear delivery.
            </CardDescription>
            <Button asChild className="mt-6 w-full" variant="outline">
              <Link href="/impromptu">
                Start Creating <MoveRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-border/40 hover:border-secondary/80 transition-all duration-300 transform hover:-translate-y-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <Wand2 className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-bold">Extemp AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
                Craft championship-level extemporaneous speeches with creative hooks, sourced evidence, and memorization summaries.
            </CardDescription>
            <Button asChild className="mt-6 w-full bg-gradient-to-r from-primary to-secondary text-white">
              <Link href="/extemp">
                Generate Full Speech <MoveRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
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
