import { Mic } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-6 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <Mic className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline text-foreground">
          Eloquent Engine
        </h1>
      </div>
    </header>
  );
}
