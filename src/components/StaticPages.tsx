/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MapPin, Send, Shield, Lock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { User } from '../types.js';
import { api } from '../api.js';

interface StaticPagesProps {
  mode: 'about' | 'contact' | 'faq' | 'privacy' | 'terms';
  user: User | null;
  setView: (view: string) => void;
}

export function StaticPages({ mode, user, setView }: StaticPagesProps) {
  // Contact States
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customEmail, setCustomEmail] = useState(user?.email || '');
  const [customName, setCustomName] = useState(user?.name || '');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // FAQ Accordion states
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({
    0: true // Keep first open by default
  });

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    setNotice(null);

    // If student/jobseeker isn't logged in, they must log in to submit a ticket, OR we allow anyone to submit
    if (!user) {
      setNotice({ type: 'error', text: 'Please sign in to log interactive support tickets!' });
      setSubmittingTicket(false);
      return;
    }

    try {
      const res = await api.submitReport(subject, `${description}\n\nSubmitted by external contact: ${customName} (${customEmail})`);
      setNotice({ type: 'success', text: res.message || 'Help ticket logged. Admins will review this shortly!' });
      setSubject('');
      setDescription('');
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Failed log ticket.' });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const faqs = [
    {
      q: "What is AttachME?",
      a: "AttachME is a modern fullstack industrial attachment, internship, and professional career recruitment platform designed specifically for students, graduates, and approved corporate partners."
    },
    {
      q: "Who is an industrial attachment for?",
      a: "Industrial attachments are mandatory, credit-bearing workspace training terms requested by university and vocational college departments. AttachME provides official supervisor loops and placement catalogs."
    },
    {
      q: "Is it free for students/seekers?",
      a: "Yes, 100%! AttachME will never charge students or graduates to set up credentials profiles, upload document files, or apply for open vacancies."
    },
    {
      q: "How are employers verified?",
      a: "Our administrative squad reviews all newly registered employer organizations. Employers must declare valid corporate emails and websites before listing public openings."
    },
    {
      q: "What upload formats are allowed?",
      a: "We support PDF, DOC, DOCX files, and JPG/PNG images. Files must not exceed 5MB."
    }
  ];

  return (
    <div className="bg-transparent flex-grow py-12 relative z-10" id="static-views-panel">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* VIEW 1: ABOUT */}
        {mode === 'about' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display sm:text-4xl">About AttachME</h1>
              <p className="mt-3 text-xs text-slate-450 max-w-2xl mx-auto">
                Bridging the gap between academic theory and industry excellence.
              </p>
            </div>

            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-md">
              <h2 className="text-base font-bold text-white mb-4 font-display">Our Vision</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Finding the right industrial attachment or graduate internship is historically complicated. Students struggle to find companies, and recruitment supervisors have no standard portals to review portfolios. AttachME streamlines this by unifying student profiles, school attachment logs, and company databases within a secured, premium workspace.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                <div>
                  <h3 className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider font-mono">For Universities</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Automations to track student placement catalogs in real-time, reviewing employer supervisors logs easily and guaranteeing regulatory compliance.
                  </p>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider font-mono">For Corporates</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Source highly trained, eager college talent from premier universities immediately. Track applicant flow metrics on high-fidelity visual charts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CONTACT */}
        {mode === 'contact' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display sm:text-4xl">Support Desk</h1>
              <p className="mt-3 text-xs text-slate-450 max-w-xl mx-auto">
                Do you have an issue or a structural inquiry? Log a help ticket directly to our admin panel below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Contact metadata */}
              <div className="col-span-1 bg-[#121218]/90 border border-white/10 text-white rounded-3xl p-6 space-y-6 shadow-xl backdrop-blur-md">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">HQ Office</h3>
                <div className="space-y-4 text-xs text-slate-350">
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-indigo-400 shrink-0 mt-0.5" />
                    <span>8th Floor, Academic Towers, University Road, Nairobi</span>
                  </p>
                  <p className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 text-indigo-400 shrink-0" />
                    <span>support@attachme.com</span>
                  </p>
                  <p className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 text-indigo-400 shrink-0" />
                    <span>+254 (020) 234 5678</span>
                  </p>
                </div>
              </div>

              {/* Form panel */}
              <div className="col-span-2 bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                <h3 className="text-sm font-bold text-white mb-4 font-display">Log Support Ticket</h3>
                {notice && (
                  <div className={`mb-6 p-4 rounded-xl text-xs font-semibold ${notice.type === 'success' ? 'bg-[#064E3B]/40 text-[#A7F3D0] border border-emerald-500/20' : 'bg-[#7F1D1D]/30 text-[#FECACA] border border-red-500/20'}`}>
                    {notice.text}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Contact Email</label>
                      <input 
                        type="email" 
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Ticket Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Help on uploading school log approval letters"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Detailed Description</label>
                    <textarea 
                      required
                      placeholder="Describe the bug or request in details here..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 focus:bg-white/[0.06] px-3 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submittingTicket}
                    className="w-full flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-505 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/10 disabled:opacity-40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-display"
                  >
                    {submittingTicket ? 'Submitting ticket...' : 'Submit Support Ticket'}
                    <Send className="h-4 w-4 ml-2" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: FAQ */}
        {mode === 'faq' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display sm:text-4xl">Frequently Asked Questions</h1>
              <p className="mt-3 text-xs text-slate-450 max-w-xl mx-auto">
                Got a question? Quick answers to standard procedures in AttachME.
              </p>
            </div>

            <div className="space-y-4" id="faq-accordions">
              {faqs.map((faq, index) => {
                const isOpen = faqOpen[index];
                return (
                  <div key={index} className="bg-[#0E0E14]/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-md">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-white hover:bg-white/5 active:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-display">{faq.q}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <div className="p-5 border-t border-white/5 bg-white/[0.01] text-xs text-slate-350 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: PRIVACY */}
        {mode === 'privacy' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display sm:text-4xl">Privacy & Security</h1>
              <p className="mt-3 text-xs text-slate-450">
                Data defense standards on how we encrypt resume uploads, passwords, and sessions.
              </p>
            </div>

            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center space-x-3 text-indigo-450">
                <Shield className="h-5 w-5" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Data Use & Defense Encryption</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                AttachME employs advanced cryptography factors to defend academic records. Credentials passwords are processed using dynamic salt-rounds in bcrypt, ensuring hash storage safety. JWT access tokens are signed per session and invalidated on logout commands.
              </p>
              
              <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">1. Document protection</h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Every uploaded academic transcript and resume CV undergoes sanitization on our Express server. The file is renamed with cryptographic seeds and stored behind secure gateways, served only to verified hiring companies.
                </p>
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">2. Cookies & Session caching</h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Access keys are securely transmitted directly via API and preserved client-side in browser storage. No persistent, cross-site telemetry trackers are planted on candidate sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: TERMS */}
        {mode === 'terms' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display sm:text-4xl">Platform Terms of Service</h1>
              <p className="mt-3 text-xs text-slate-450">
                Regulatory responsibilities for students, task seekers, and approved employers.
              </p>
            </div>

            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center space-x-3 text-indigo-450">
                <Lock className="h-5 w-5" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Platforms Usage Compliance</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By accessing AttachME, users accept strict adherence to educational standards. Student applicants guarantee the files and letter from deans uploaded represent genuine academic enrollments. Registered recruiter organizations verify that listed salaries, stipends, and working coordinates represent real positions.
              </p>
              
              <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">1. Academic Authenticity</h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Fraudulent claims regarding active college studies or transcripts are penalizable and lead directly to account suspension and audit logging report filing to the respective institution.
                </p>
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">2. Recruiter Responsibilities</h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Employers are forbidden from charging candidates processing fees of any format. AttachME represents a free placement catalog. Failure to comply leads to instant organization blacklist.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
