import { Analytics } from '@vercel/analytics/next';
import React, { useEffect, useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showAuth, setShowAuth] = React.useState(true);
  const [isLogin, setIsLogin] = React.useState(true);
  const [error, setError] = React.useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) setShowAuth(false);
    }
  }, []);
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
    const username = (form.elements.namedItem('username') as HTMLInputElement)?.value;
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = { username, password };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({ username }));
        setShowAuth(false);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <html lang="en">
      <head>
        <title>3alemny Shokran</title>
      </head>
      <body className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen flex flex-col transition-colors duration-300">
        {showAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setIsLogin(!isLogin)} className="absolute top-4 right-4 text-blue-600 dark:text-blue-400 underline text-sm">{isLogin ? 'Register' : 'Login'}</button>
              <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">{isLogin ? 'Login to Your Account' : 'Create an Account'}</h2>
              <form className="space-y-5" onSubmit={handleAuth}>              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input type="text" id="username" name="username" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200" placeholder="Your username" />
              </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" id="password" name="password" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200" placeholder="••••••••" />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors">{isLogin ? 'Login' : 'Register'}</button>
              </form>
            </div>
          </div>
        )}
        {!showAuth && (
          <>
            {children}
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
