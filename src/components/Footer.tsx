/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Paperclip, Github, Linkedin, Twitter } from 'lucide-react';

interface FooterProps {
  setView: (view: string) => void;
}

export function Footer({ setView }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[#07070A]/90 backdrop-blur-md relative z-10" id="app-footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2 text-xl font-bold tracking-tight text-indigo-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow shadow-indigo-600/30">
                <Paperclip className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-white">
                Attach<span className="text-indigo-400">Mee</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The modern job, industrial attachment, internship, and smart recruitment network for students, job seekers, and recruiters. Get attached to greatness.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-450 hover:text-white transition-colors">
                <Twitter className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="text-slate-450 hover:text-white transition-colors">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="text-slate-450 hover:text-white transition-colors">
                <Github className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <button onClick={() => setView('jobs')} className="text-xs text-slate-400 hover:text-indigo-400 font-medium bg-transparent border-none cursor-pointer transition-colors">
                  Browse Openings
                </button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="text-xs text-slate-400 hover:text-indigo-400 font-medium bg-transparent border-none cursor-pointer transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => setView('faq')} className="text-xs text-slate-400 hover:text-indigo-400 font-medium bg-transparent border-none cursor-pointer transition-colors">
                  FAQ Help Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Guidelines / Privacy */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Information</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <button onClick={() => setView('privacy')} className="text-xs text-slate-400 hover:text-indigo-400 font-medium bg-transparent border-none cursor-pointer transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setView('terms')} className="text-xs text-slate-400 hover:text-indigo-400 font-medium bg-transparent border-none cursor-pointer transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => setView('contact')} className="text-xs text-slate-400 hover:text-indigo-400 font-medium bg-transparent border-none cursor-pointer transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">&copy; {new Date().getFullYear()} AttachMee Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
