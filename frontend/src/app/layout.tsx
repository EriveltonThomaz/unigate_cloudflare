// src/app/layout.tsx

import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
// Passo 1: Importar a nova função que busca a sessão no servidor.
import { getUserSession } from "../lib/session"; 
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Unigate",
  description: "Cloudflare Multi-tenant Application",
};

// Passo 2: Transformar o RootLayout em uma função 'async'.
export default async function RootLayout({
  children,
}: Readonly<{ children: React.Node }>) {
  
  // Passo 3: Buscar os dados do usuário no servidor ANTES de renderizar a página.
  const user = await getUserSession();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {/* Passo 4: Passar o usuário (ou null) como uma propriedade para o AuthProvider. */}
        <AuthProvider user={user}>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}