import React from 'react';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      {/* Você pode adicionar elementos de layout comuns aqui, como um cabeçalho ou navegação lateral */}
      {children}
    </section>
  );
}
