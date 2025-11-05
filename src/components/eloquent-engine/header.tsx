import { Mic } from 'lucide-react';

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="py-6 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {children}
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-3 rounded-full border border-primary/20 hidden sm:block">
                <Mic className="h-8 w-8 text-primary" />
             </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-headline">
                Eloquent Engine
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Craft and practice championship-level speeches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
