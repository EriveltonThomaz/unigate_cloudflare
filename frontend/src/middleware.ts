
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// O nome do cookie que você usa para armazenar o token de autenticação.
// Garanta que seja o mesmo nome usado no seu contexto de autenticação.
const AUTH_TOKEN_COOKIE = 'access_token';

// Este middleware é executado para todas as rotas que correspondem ao "matcher".
export function middleware(request: NextRequest) {
  // Obtém o token de autenticação dos cookies da requisição.
  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  // Se não houver token, o usuário não está autenticado.
  if (!authToken) {
    // Redireciona o usuário para a página de login.
    // A URL completa é necessária para o redirecionamento.
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se o token existir, permite que a requisição continue para a rota solicitada.
  // A validação da autenticidade e expiração do token deve ser feita aqui em um cenário real,
  // possivelmente contatando um endpoint de validação no backend ou decodificando o JWT.
  return NextResponse.next();
}

// O "matcher" define em quais rotas este middleware deve ser aplicado.
// Aqui, ele será aplicado a todas as rotas dentro de "/admin", incluindo sub-rotas.
export const config = {
  matcher: '/admin/:path*',
};
