'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import ErrorBoundaryTailwind from '@/components/ui/ErrorBoundaryTailwind';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundaryTailwind>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ErrorBoundaryTailwind>
  );
}

export default Providers;