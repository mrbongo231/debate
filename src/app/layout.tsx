import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Sora } from 'next/font/google';
import { Header } from '@/components/eloquent-engine/header';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Eloquent Engine',
  description: 'A dynamic public speaking aid app to generate impromptu speech outlines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body antialiased ${inter.variable} ${sora.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="container mx-auto p-4 md:p-6 max-w-4xl">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
