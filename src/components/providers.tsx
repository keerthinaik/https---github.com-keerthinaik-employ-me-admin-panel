'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster"
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from '@/context/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
      <AuthProvider>
        <NextTopLoader color="#3F51B5" />
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
