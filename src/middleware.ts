import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fonction pour vérifier le token simulé
async function verifyToken(token: string) {
  try {
    // Décoder le token simulé (base64)
    const decoded = atob(token);
    const payload = JSON.parse(decoded);
    
    // Vérifier si le token n'a pas expiré
    if (payload.exp && payload.exp > Date.now()) {
      return payload;
    }
    
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/login', '/api/health'];
  const isPublicPath = publicPaths.some(path => pathname === path);
  
  // Chemins pour les ressources statiques qui ne doivent jamais être stockés pour redirection
  const staticPaths = ['/logo.png', '/favicon.ico'];
  const isStaticPath = staticPaths.some(path => pathname === path);
  
  // Obtenir le token depuis les cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Si c'est un chemin public, autoriser l'accès
  if (isPublicPath) {
    // Si l'utilisateur est déjà connecté et tente d'accéder à la page de login, le rediriger vers le tableau de bord
    if (pathname === '/login' && token) {
      try {
        const payload = await verifyToken(token);
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Token invalide, continuer normalement
      }
    }
    
    return NextResponse.next();
  }
  
  // Ne pas stocker les redirections pour les ressources statiques
  if (isStaticPath) {
    return NextResponse.next();
  }
  
  // Pour les chemins protégés, vérifier l'authentification
  if (!token) {
    // Rediriger vers la page de login si aucun token n'est présent
    const loginUrl = new URL('/login', request.url);
    // Stocker l'URL de redirection dans un cookie (encodée pour éviter les problèmes d'URL)
    // Ne pas stocker les redirections pour les ressources statiques
    const response = NextResponse.redirect(loginUrl);
    if (!isStaticPath) {
      response.cookies.set('redirect-url', encodeURIComponent(pathname), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5, // 5 minutes
        path: '/',
        sameSite: 'strict',
      });
    }
    return response;
  }
  
  // Vérifier la validité du token
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      // Token invalide, rediriger vers la page de login
      const loginUrl = new URL('/login', request.url);
      // Stocker l'URL de redirection dans un cookie (encodée pour éviter les problèmes d'URL)
      const response = NextResponse.redirect(loginUrl);
      if (!isStaticPath) {
        response.cookies.set('redirect-url', encodeURIComponent(pathname), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 5, // 5 minutes
          path: '/',
          sameSite: 'strict',
        });
      }
      return response;
    }
    
    // Token valide, autoriser l'accès
    return NextResponse.next();
  } catch (error) {
    // Erreur lors de la vérification du token, rediriger vers la page de login
    const loginUrl = new URL('/login', request.url);
    // Stocker l'URL de redirection dans un cookie (encodée pour éviter les problèmes d'URL)
    const response = NextResponse.redirect(loginUrl);
    if (!isStaticPath) {
      response.cookies.set('redirect-url', encodeURIComponent(pathname), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5, // 5 minutes
        path: '/',
        sameSite: 'strict',
      });
    }
    return response;
  }
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};