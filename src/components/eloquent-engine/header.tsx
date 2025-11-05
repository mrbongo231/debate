import { Mic } from 'lucide-react';

export function Header() {
  return (
    <header className="py-8 px-4 md:px-6 mb-8">
      <div className="container mx-auto flex flex-col items-center justify-center text-center gap-3">
        <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-foreground">
          Eloquent Engine
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Craft and practice championship-level speeches from a single idea. Transform your thoughts into powerful oratory.
        </p>
      </div>
    </header>
  );
}
