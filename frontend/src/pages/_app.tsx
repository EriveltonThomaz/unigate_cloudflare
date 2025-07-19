import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import ErrorBoundaryTailwind from '../components/ui/ErrorBoundaryTailwind';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>UniGate - Sistema de Gerenciamento</title>
      </Head>
      
      <ErrorBoundaryTailwind>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Component {...pageProps} />
        </ThemeProvider>
      </ErrorBoundaryTailwind>
    </>
  );
}

export default MyApp;