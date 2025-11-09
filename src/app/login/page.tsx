"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

// Fonction pour lire un cookie
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const validateForm = () => {
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return false;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Try to authenticate with the server
      const success = await login(email, password);

      if (success) {
        // Get redirect URL from cookie and decode it
        const redirectUrlEncoded = getCookie('redirect-url');
        
        // Check if user is a manager with assigned businesses
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        let redirectUrl = '/dashboard';
        
        if (user.role === 'Gérant' && user.managedBusinessIds && user.managedBusinessIds.length > 0) {
          // Redirect manager to their first assigned business
          redirectUrl = `/business/${user.managedBusinessIds[0]}`;
        } else if (user.role === 'Admin') {
          // Admin can access all businesses, redirect to dashboard
          redirectUrl = '/dashboard';
        } else if (redirectUrlEncoded) {
          // Use stored redirect URL if available
          redirectUrl = decodeURIComponent(redirectUrlEncoded);
        }
        
        // Clear the redirect cookie
        document.cookie = 'redirect-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Add a small delay to ensure state is updated before redirect
        setTimeout(() => {
          router.push(redirectUrl);
        }, 100);
      } else {
        setError('Email ou mot de passe incorrect. Utilisez admin@bizsuite.com / password123');
      }
    } catch (_error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center w-full justify-center bg-gradient-to-br from-primary-50 to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <div className="mx-auto h-24 w-24  rounded-full bg-primary-500 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full border border-b-neutral-800 rounded-full text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez vos identifiants pour accéder à votre espace
          </p>
        </div>


        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 animate-shake">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition duration-200"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition duration-200 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>


          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 rounded-lg transition duration-200 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Politique de confidentialité
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}