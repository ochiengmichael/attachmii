/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Award, GraduationCap, Building2, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface HomeProps {
  setView: (view: string) => void;
  setSearchFilters: (filters: { query: string; location: string; type: string }) => void;
}

export function Home({ setView, setSearchFilters }: HomeProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFilters({ query, location, type });
    setView('jobs');
  };

  const handleCategoryClick = (jobType: string) => {
    setSearchFilters({ query: '', location: '', type: jobType });
    setView('jobs');
  };

  return (
    <div className="bg-transparent flex-grow relative z-10" id="home-view-container">
      
      {/* 1. Hero Section plus Job Seeker Query bar */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-300">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>Connecting Talent to Global Placement Partnerships</span>
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white max-w-4xl mx-auto leading-tight font-display">
            Get Attached to Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.25)]">Career Milestone</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
            AttachMee facilitates industrial attachments, internships, and career placements. Find verified employers looking for students and job seekers alike.
          </p>

          {/* Search Bar Form */}
          <form 
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-[#0E0E14]/85 p-3.5 shadow-2xl backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300"
            id="home-search-form"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-center">
              {/* Keywords Input */}
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute top-3.5 left-4 h-4.5 w-4.5 text-slate-455" />
                <input 
                  type="text" 
                  placeholder="Jobs, skills, attachments, internships..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 border border-white/10 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all"
                />
              </div>

              {/* Location Input */}
              <div className="relative">
                <MapPin className="absolute top-3.5 left-4 h-4.5 w-4.5 text-slate-455" />
                <input 
                  type="text" 
                  placeholder="Location / Remote..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 border border-white/10 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all"
                />
              </div>

              {/* Search Action Buttons */}
              <div>
                <button 
                  type="submit" 
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Find Openings
                </button>
              </div>
            </div>
          </form>

          {/* Quick Stats Tags */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-slate-450 font-mono">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Verified Employers Only</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% Free for Students</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Attachment Endorsement Support</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Platform Category Grids */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 border-t border-white/5">
        <h2 className="text-center text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">Browse Opportunity Streams</h2>
        <p className="mt-2 text-center text-2xl font-light tracking-tight text-white sm:text-3xl font-display">
          What category are you looking for?
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Industrial Attachment Card */}
          <div 
            onClick={() => handleCategoryClick('attachment')}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-indigo-500/50 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 block backdrop-blur-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/40 text-indigo-400 font-bold border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-base font-bold text-white group-hover:text-indigo-400 transition-colors">Industrial Attachment</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Required workplace assignments for ongoing university & college students. Comes with approved logs, supervisor guidelines, and attachment letters.
            </p>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
              Browse Attachments
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </span>
          </div>

          {/* Internship Card */}
          <div 
            onClick={() => handleCategoryClick('internship')}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-indigo-500/50 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 block backdrop-blur-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-950/40 text-violet-450 font-bold border border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-base font-bold text-white group-hover:text-violet-400 transition-colors">Professional Internship</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Fixed-term corporate programs designed for fresh graduates entering the job market. Excellent for gaining foundational experience.
            </p>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-violet-400 group-hover:text-violet-300">
              Browse Internships
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </span>
          </div>

          {/* Full Career Placement Card */}
          <div 
            onClick={() => handleCategoryClick('job')}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-indigo-500/50 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 block backdrop-blur-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Entry & Mid-Level Jobs</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Full-time and permanent positions for experienced job seekers. High quality salaries, benefits, and long-term career growth options.
            </p>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              Browse All Jobs
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </section>

      {/* 3. Platform Benefit Pillars */}
      <section className="py-16 border-t border-b border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">Designed For Growth</h2>
            <p className="mt-2 text-2xl font-light text-white font-display">One Portal. Personalized Paths.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Column */}
            <div className="bg-[#121218]/40 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-650 text-white shadow-md shadow-indigo-600/10">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">For College Students</h3>
              <ul className="mt-4 space-y-3.5 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                  <span>Apply for official institutional attachments with supervisor coordination.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Store academic credentials plus letter from dean in cloud profile.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Receive instant approval, status progression and interview requests.</span>
                </li>
              </ul>
            </div>

            {/* General Job Seeker Column */}
            <div className="bg-[#121218]/40 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/80 text-white shadow-md shadow-violet-600/10">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">For General Seekers</h3>
              <ul className="mt-4 space-y-3.5 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
                  <span>Find full-time and temporary positions with detailed matching keys.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-violet-400 shrink-0 mt-0.5" />
                  <span>Interactive resume profiles mapping certificates and portfolio links.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-violet-400 shrink-0 mt-0.5" />
                  <span>Follow-up panel showing reviewed, accepted or rejected milestones.</span>
                </li>
              </ul>
            </div>

            {/* Recruiter Column */}
            <div className="bg-[#121218]/40 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/80 text-white shadow-md shadow-emerald-600/10">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">For Recruiter Teams</h3>
              <ul className="mt-4 space-y-3.5 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <span>Post attachments, internships and jobs easily within 60 seconds.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Review applicants, download candidate CVs & school certificates safely.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Analytics tracking applicant growth, interview pipelines, and logs.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Action CTA Section */}
      <section className="py-16 relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/65 to-violet-950/65 border border-indigo-500/15 p-10 py-16 text-center backdrop-blur-xl shadow-2xl">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]"></div>
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]"></div>
          
          <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl font-display">Ready to secure your role?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-slate-350 leading-relaxed">
            Create an AttachMee account as a Student, Job Seeker, or Enterprise Recruiter today. Start exploring hundreds of opportunities.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setView('register')} 
              className="rounded-xl bg-[#6366F1] hover:bg-[#5558DD] active:scale-95 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              Sign Up For Free
            </button>
            <button 
              onClick={() => setView('jobs')} 
              className="rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 px-6 py-3 text-xs font-bold text-slate-250 transition-all"
            >
              Search Opportunities
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
