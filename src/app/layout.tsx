import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Sora } from 'next/font/google';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Header } from '@/components/eloquent-engine/header';
import Link from 'next/link';
import { Mic, Wand2 } from 'lucide-react';

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
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground font-headline">Eloquent Engine</h2>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Wand2 />
                      Impromptu Outline
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/extemp">
                       <Wand2 />
                       Extemp AI
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <Header>
               <SidebarTrigger />
            </Header>
            <main className="container mx-auto p-4 md:p-6 max-w-4xl">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
