/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Calendar, Bookmark, BookmarkCheck, FileText, X, CheckSquare, Sparkles } from 'lucide-react';
import { Job, User } from '../types.js';
import { api } from '../api.js';

interface JobsListProps {
  user: User | null;
  setView: (view: string) => void;
  filters: { query: string; location: string; type: string };
  setFilters: (filters: { query: string; location: string; type: string }) => void;
}

export function JobsList({ user, setView, filters, setFilters }: JobsListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobsIds, setSavedJobsIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch jobs list
  const loadJobs = async () => {
    try {
      const data = await api.getJobs(filters);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed fetching opportunities list:', err);
    }
  };

  // Fetch saved jobs list for bookmark indicators
  const loadSavedJobs = async () => {
    if (!user) return;
    try {
      const data = await api.getSavedJobs();
      const ids = (data.savedJobs || []).map((sj: any) => sj.jobId);
      setSavedJobsIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters]);

  useEffect(() => {
    loadSavedJobs();
  }, [user]);

  const handleToggleSave = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setView('login');
      return;
    }
    try {
      const result = await api.toggleSaveJob(jobId);
      if (result.saved) {
        setSavedJobsIds([...savedJobsIds, jobId]);
      } else {
        setSavedJobsIds(savedJobsIds.filter(id => id !== jobId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmittingApp(true);
    setNotice(null);

    try {
      const res = await api.applyJob(selectedJob.id, coverLetter);
      setNotice({ type: 'success', text: res.message || 'Application submitted successfully!' });
      setCoverLetter('');
      // Reload matching listings to reflect updated applicantsCount
      loadJobs();
      // Auto-hide modal after delay
      setTimeout(() => {
        setSelectedJob(null);
        setApplying(false);
        setNotice(null);
      }, 2500);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Failed to submit application. Please check CV configs.' });
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ query: '', location: '', type: '' });
  };

  return (
    <div className="bg-transparent flex-grow py-8 relative z-10" id="jobslist-view">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Explore Placements</h1>
          <p className="text-xs text-slate-450 mt-1">
            Browse verified industrial attachments, professional internships, and entry/mid-level jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* A. Search Filters sidebar */}
          <div className="col-span-1 bg-[#0E0E14]/90 p-6 rounded-2xl border border-white/10 h-fit sticky top-24 backdrop-blur-md shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-display">Refine Hunt</h2>
            
            <div className="space-y-4">
              {/* Text query */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Keywords</label>
                <div className="relative mt-1">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Title, skill, team..."
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location query */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Location</label>
                <div className="relative mt-1">
                  <MapPin className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="City or 'Remote'..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tag Stream select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Placement Type</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3 text-xs text-white font-medium focus:border-indigo-500 focus:bg-[#0E0E14] focus:outline-none transition-all"
                >
                  <option value="" className="bg-[#0E0E14] text-slate-300">All Placements</option>
                  <option value="attachment" className="bg-[#0E0E14] text-slate-300">Industrial Attachment</option>
                  <option value="internship" className="bg-[#0E0E14] text-slate-300">Professional Internship</option>
                  <option value="job" className="bg-[#0E0E14] text-slate-300">Entry & Mid-Level Job</option>
                </select>
              </div>

              {/* Reset trigger */}
              <button 
                onClick={handleClearFilters}
                className="w-full rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* B. Job postings Grid list */}
          <div className="col-span-1 lg:col-span-3">
            {jobs.length === 0 ? (
              <div className="text-center rounded-2xl border-2 border-dashed border-white/10 bg-[#0E0E14]/90 p-12 backdrop-blur-md">
                <Briefcase className="mx-auto h-12 w-12 text-slate-600 animate-pulse" />
                <h3 className="mt-4 text-sm font-bold text-white">No postings match your hunt</h3>
                <p className="mt-1 text-xs text-slate-450">Try tweaking your search tags or location queries.</p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all"
                >
                  Reset Search Focus
                </button>
              </div>
            ) : (
              <div className="space-y-4" id="listings-stream">
                {jobs.map((job) => {
                  const isSaved = savedJobsIds.includes(job.id);
                  let badgeColorFull = 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20';
                  if (job.type === 'attachment') badgeColorFull = 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20';
                  if (job.type === 'internship') badgeColorFull = 'bg-violet-950/40 text-violet-400 border-violet-500/20';
                  if (job.type === 'job') badgeColorFull = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20';
 
                  return (
                    <div 
                      key={job.id}
                      onClick={() => { setSelectedJob(job); setApplying(false); setNotice(null); }}
                      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={job.companyLogo} 
                            alt={job.companyName} 
                            className="h-12 w-12 rounded-xl border border-white/5 object-cover bg-white/5"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[10px] font-bold text-slate-450 tracking-widest uppercase font-mono">{job.companyName}</span>
                            <h3 className="text-base font-bold text-white group-hover:text-indigo-455 transition-colors mt-0.5 font-display">{job.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-slate-500" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3.5 w-3.5 mr-0.5 text-slate-500" />
                                {job.salary}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Save Bookmark Action */}
                        <button 
                          onClick={(e) => handleToggleSave(job.id, e)}
                          className="hover:scale-110 transition-transform p-1 px-3.5"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="h-5 w-5 text-indigo-400 fill-indigo-400" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-slate-500 hover:text-white" />
                          )}
                        </button>
                      </div>

                      {/* Excerpt */}
                      <p className="mt-4 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                        {/* Skills and tags */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColorFull}`}>
                            {job.type}
                          </span>
                          {job.skills.map((s, idx) => (
                            <span key={idx} className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-350">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-500 font-medium">
                          {job.applicantsCount > 0 ? `${job.applicantsCount} candidate${job.applicantsCount > 1 ? 's' : ''} applied` : 'Be the first to apply!'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* C. Dynamic Job detailed modal & Applications panel */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0F0F14] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh] transition-all">
            
            {/* Close Toggle */}
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:bg-white/5 hover:text-white rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Heading Details */}
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={selectedJob.companyLogo} 
                alt={selectedJob.companyName}
                className="h-14 w-14 rounded-xl border border-white/5 object-cover bg-white/5"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xs font-bold text-slate-450 tracking-widest uppercase font-mono">{selectedJob.companyName}</span>
                <h2 className="text-xl font-bold text-white mt-0.5 font-display">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-slate-500" />
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-0.5 text-slate-500" />
                    {selectedJob.salary}
                  </span>
                  <span className="rounded-full bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                    {selectedJob.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Display Body description */}
            <div className="space-y-4 border-t border-white/5 pt-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">Ideal Requirements</h4>
                  <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                    {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">Primary Skills</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedJob.skills.map((skill, i) => (
                      <span key={i} className="rounded-full bg-white/5 border border-white/5 px-3 py-1 text-[11px] font-medium text-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notice Feedback banner */}
            {notice && (
              <div className={`mt-6 p-4 rounded-xl text-xs font-semibold ${notice.type === 'success' ? 'bg-[#064E3B]/40 text-[#A7F3D0] border border-emerald-500/20' : 'bg-[#7F1D1D]/30 text-[#FECACA] border border-red-500/20'}`}>
                {notice.text}
              </div>
            )}

            {/* D. Apply Form action controls */}
            <div className="mt-8 border-t border-white/5 pt-6">
              {!user ? (
                <div className="rounded-2xl bg-amber-950/20 p-5 text-center border border-amber-500/15">
                  <p className="text-xs text-amber-300 font-medium">Please sign in with a Student or Job Seeker account to submit applications.</p>
                  <div className="mt-4 flex justify-center space-x-3">
                    <button 
                      onClick={() => { setSelectedJob(null); setView('login'); }}
                      className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow"
                    >
                      Login Account
                    </button>
                    <button 
                      onClick={() => { setSelectedJob(null); setView('register'); }}
                      className="rounded-xl border border-amber-500/25 px-4 py-2 text-xs font-semibold text-amber-100 bg-transparent hover:bg-white/5"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              ) : user.role === 'employer' || user.role === 'admin' ? (
                <p className="text-center text-xs text-slate-500 italic block">As an {user.role}, you can manage vacancies but cannot sign applications.</p>
              ) : applying ? (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">Write a brief cover letter</label>
                      <span className="text-[10px] text-indigo-400 font-medium flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Attaching your profile CV & transcript.
                      </span>
                    </div>
                    <textarea 
                      placeholder="Why are you a perfect fit for this placement? Note any relevant experience, timeline limits, or school authorization files..."
                      required
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {user.profile.cvPath ? (
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center font-medium">
                        <CheckSquare className="h-4 w-4 mr-2 text-indigo-400" />
                        Attached resume: <strong className="ml-1 text-white">{user.profile.cvName || 'Profile CV'}</strong>
                      </span>
                      <button 
                        type="button"
                        onClick={() => { setSelectedJob(null); setView('dashboard'); }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-semibold font-mono"
                      >
                        Change CV
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 text-xs text-rose-300 font-semibold flex items-center justify-between">
                      <span>You have not uploaded a CV to your profile yet!</span>
                      <button 
                        type="button"
                        onClick={() => { setSelectedJob(null); setView('dashboard'); }}
                        className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-1.5 text-xs text-white font-bold transition-all"
                      >
                        Upload Resume
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-3 justify-end mt-4">
                    <button 
                      type="button" 
                      onClick={() => setApplying(false)} 
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={submittingApp || !user.profile.cvPath}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-50 active:scale-95 disabled:opacity-40 px-5 py-2 text-xs font-semibold text-white shadow-lg transition-all"
                    >
                      {submittingApp ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex space-x-3 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setSelectedJob(null)} 
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Close Window
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!user.profile.cvPath) {
                        setNotice({ type: 'error', text: 'You need to upload a resume in your profile dashboard first to apply!' });
                        return;
                      }
                      setApplying(true);
                    }} 
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all font-display"
                  >
                    Apply for Position
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
