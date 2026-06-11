/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './components/Home.tsx';
import { JobsList } from './components/JobsList.tsx';
import { AuthPage } from './components/AuthPage.tsx';
import { StaticPages } from './components/StaticPages.tsx';
import { Dashboards } from './components/Dashboards.tsx';
import { MobileSimulator } from './components/MobileSimulator.tsx';

import { User } from './types.js';
import { api } from './api.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<string>('home');
  const [initFinished, setInitFinished] = useState(false);

  // Shared browsing search bar filter state
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    location: '',
    type: ''
  });

  // Verify and auto-login cache token on mounting
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const cachedToken = api.getToken();
      if (cachedToken) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
          } else {
            api.clearToken();
          }
        } catch (err) {
          console.warn('Session expired or server offline. Clearing token cache.', err);
          api.clearToken();
        }
      }
      setInitFinished(true);
    };

    attemptAutoLogin();
  }, []);

  // Set up global hook listener for unauthorized session expiries
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setView('login');
    };
    window.addEventListener('attachme_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('attachme_unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = (token: string, loggedInUser: User) => {
    api.setToken(token);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setView('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!initFinished) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070709] flex-col gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/5 border-t-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
        <p className="text-xs font-semibold text-slate-450 font-mono tracking-widest uppercase">Securing AttachME Portal...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#08080C] text-slate-300 font-sans antialiased relative overflow-x-hidden min-w-[320px]">
      {/* Background glow animations */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px] animate-glow-slow z-0"></div>
      <div className="pointer-events-none absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px] animate-glow-slower z-0"></div>
      <div className="pointer-events-none absolute -bottom-30 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] animate-glow-slow z-0"></div>

      {/* 1. Header Navigation Bar */}
      <Navbar 
        user={user} 
        currentView={currentView} 
        setView={setView} 
        onLogout={handleLogout} 
      />

      {/* 2. Main SPA content frame */}
      <main className="flex-grow flex flex-col relative z-10">
        {currentView === 'home' && (
          <Home 
            setView={setView} 
            setSearchFilters={setSearchFilters} 
          />
        )}

        {currentView === 'jobs' && (
          <JobsList 
            user={user} 
            setView={setView} 
            filters={searchFilters} 
            setFilters={setSearchFilters} 
          />
        )}

        {currentView === 'login' && (
          <AuthPage 
            initialTab="login" 
            setView={setView} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {currentView === 'register' && (
          <AuthPage 
            initialTab="register" 
            setView={setView} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboards 
            user={user} 
            onUpdateUser={handleUpdateUser} 
            setView={setView} 
          />
        )}

        {currentView === 'mobile' && (
          <MobileSimulator 
            user={user} 
            setView={setView} 
          />
        )}

        {/* Catch if dashboard view is loaded but user somehow logs out */}
        {currentView === 'dashboard' && !user && (
          <div className="flex-grow flex items-center justify-center py-20 px-4">
            <div className="text-center bg-[#13131A]/90 border border-white/10 p-8 rounded-2xl max-w-sm shadow-2xl backdrop-blur-md">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Access Denied</h2>
              <p className="text-xs text-slate-400 mt-2">Protected portal. Please log in or register to set coordinates.</p>
              <button 
                onClick={() => setView('login')} 
                className="mt-6 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
              >
                Sign In Now
              </button>
            </div>
          </div>
        )}

        {/* Static public support guides */}
        {['about', 'contact', 'faq', 'privacy', 'terms'].includes(currentView) && (
          <StaticPages 
            mode={currentView as any} 
            user={user} 
            setView={setView} 
          />
        )}
      </main>

      {/* 3. Footer bar */}
      <Footer setView={setView} />

    </div>
  );
}
