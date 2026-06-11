/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, GraduationCap, FileText, Bookmark, Users, Activity, 
  Send, Plus, Trash, Check, X, ShieldAlert, Sparkles, Building2, 
  Settings, MessageSquare, AlertCircle, RefreshCw, Eye, Video
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { User, Job, Application, Company, Notification, SavedJob, Message, Report, AuditLog } from '../types.js';
import { api } from '../api.js';
import { VideoInterviewsTab } from './VideoInterviewsTab.js';
import { SafetyTab } from './SafetyTab.js';

interface DashboardsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  setView: (view: string) => void;
}

export function Dashboards({ user, onUpdateUser, setView }: DashboardsProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'video_interviews' | 'safety'>('main');

  return (
    <div className="bg-transparent flex-grow py-8 relative z-10" id="dashboard-portal-view">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Jumbotron Banner */}
        <div className="mb-8 rounded-3xl bg-[#0E0E14]/90 p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center border border-white/10 shadow-2xl backdrop-blur-md">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#10B981] font-bold font-mono">Secure Authorized Area</span>
            <h1 className="text-2xl sm:text-3xl mt-1 text-white font-display font-light tracking-wide">Hello, {user.name}</h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Welcome to your personal AttachMee hub. You are authenticated with the role authorization level: <span className="font-bold text-[#10B981] capitalize">{user.role === 'job_seeker' ? 'general job seeker' : user.role === 'student' ? 'university student candidate' : user.role}</span>.
            </p>
          </div>
          <span className="mt-4 md:mt-0 font-mono text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
            Active Session Verified
          </span>
        </div>

        {/* Dynamic Navigation Sub-selector tabs bar */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto gap-4 scrollbar-none" id="subtab-selector-bar">
          <button
            onClick={() => setActiveTab('main')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'main' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            📂 Work Desk Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('video_interviews')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'video_interviews' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="h-4 w-4" />
            📹 Video Interviews
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'safety' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            🛡️ Security Controls
          </button>
        </div>

        {/* Dynamic Router switch */}
        {activeTab === 'main' && (
          <>
            {user.role === 'student' && <StudentDashboard user={user} onUpdateUser={onUpdateUser} setView={setView} />}
            {user.role === 'job_seeker' && <JobSeekerDashboard user={user} onUpdateUser={onUpdateUser} setView={setView} />}
            {user.role === 'employer' && <EmployerDashboard user={user} setView={setView} />}
            {user.role === 'admin' && <AdminDashboard user={user} setView={setView} />}
          </>
        )}

        {activeTab === 'video_interviews' && <VideoInterviewsTab user={user} />}

        {activeTab === 'safety' && <SafetyTab user={user} setView={setView} />}

      </div>
    </div>
  );
}

// ==========================================
// 1. STUDENT DASHBOARD
// ==========================================
function StudentDashboard({ user, onUpdateUser, setView }: { user: User; onUpdateUser: (user: User) => void; setView: (view: string) => void }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  
  // Interactive forms states
  const [newSkill, setNewSkill] = useState('');
  const [inst, setInst] = useState('');
  const [courseVal, setCourseVal] = useState('');
  const [sy, setSy] = useState('');
  const [ey, setEy] = useState('');

  // Multipart uploads files
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [messageNotice, setMessageNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load applicant specific details
  const loadStudentData = async () => {
    try {
      setLoadingData(true);
      const appsRes = await api.getApplications();
      setApps(appsRes.applications || []);

      const savedRes = await api.getSavedJobs();
      setSavedJobs(savedRes.savedJobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  // Handle skills edit
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const skillsList = [...(user.profile.skills || []), newSkill.trim()];
    try {
      const data = await api.updateProfile({ skills: skillsList });
      onUpdateUser(data.user);
      setNewSkill('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSkill = async (skillIndex: number) => {
    const list = (user.profile.skills || []).filter((_, i) => i !== skillIndex);
    try {
      const data = await api.updateProfile({ skills: list });
      onUpdateUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Education Course line
  const handleAddEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inst.trim() || !courseVal.trim()) return;
    const eduLine = { institution: inst.trim(), course: courseVal.trim(), startYear: sy || '2024', endYear: ey || '2028' };
    const list = [...(user.profile.education || []), eduLine];
    try {
      const data = await api.updateProfile({ education: list });
      onUpdateUser(data.user);
      setInst('');
      setCourseVal('');
      setSy('');
      setEy('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveEdu = async (idxVal: number) => {
    const list = (user.profile.education || []).filter((_, i) => i !== idxVal);
    try {
      const data = await api.updateProfile({ education: list });
      onUpdateUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  // Multer Document Uploads handler
  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile && !certFile) {
      setMessageNotice({ type: 'error', text: 'Please select a PDF file first!' });
      return;
    }
    setLoadingUpload(true);
    setMessageNotice(null);

    const formData = new FormData();
    if (cvFile) formData.append('cv', cvFile);
    if (certFile) formData.append('certificate', certFile);

    try {
      const data = await api.uploadDocs(formData);
      onUpdateUser(data.user);
      setMessageNotice({ type: 'success', text: 'Documents uploaded and attached to profile successfully!' });
      setCvFile(null);
      setCertFile(null);
    } catch (err: any) {
      setMessageNotice({ type: 'error', text: err.message || 'Doc upload failed.' });
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Col 1 & 2: Main activities tracking */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Applications pipeline */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center font-display tracking-wide">
            <Activity className="h-5 w-5 mr-2 text-indigo-400" />
            Applied Placements & Internships ({apps.length})
          </h2>

          {loadingData ? (
            <p className="text-xs text-center text-slate-500 py-6">Connecting to database...</p>
          ) : apps.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-2 text-xs font-semibold text-slate-400">You haven't submitted any applications yet.</p>
              <button onClick={() => setView('jobs')} className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-350 transition-colors cursor-pointer">
                Browse open vacancies &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((a) => {
                let statusBadgeType = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (a.status === 'accepted') statusBadgeType = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (a.status === 'rejected') statusBadgeType = 'bg-red-500/10 text-red-400 border-red-500/20';
                if (a.status === 'reviewed') statusBadgeType = 'bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/20';

                return (
                  <div key={a.id} className="rounded-2xl border border-white/5 bg-white/[0.01]/70 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">{a.companyName}</span>
                        <h3 className="text-sm font-semibold text-white mt-1 font-display">{a.jobTitle}</h3>
                        <p className="text-[10.5px] text-slate-450 mt-1">Submitted: {new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[10px] uppercase font-mono tracking-wider font-bold capitalize ${statusBadgeType}`}>
                        {a.status}
                      </span>
                    </div>
                    {a.coverLetter && (
                      <div className="mt-3.5 bg-white/[0.02]/50 p-3.5 rounded-xl border border-white/[0.06] text-xs text-slate-300 leading-relaxed italic">
                        &ldquo;{a.coverLetter}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Saved Placements */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center font-display tracking-wide">
            <Bookmark className="h-5 w-5 mr-2 text-indigo-400" />
            Bookmarked Opportunities ({savedJobs.length})
          </h2>

          {savedJobs.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No saved positions. Click bookmark icon while browsing jobs to list them here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedJobs.map((sj) => (
                <div key={sj.id} className="rounded-2xl border border-white/5 p-4 bg-white/[0.01] flex justify-between items-center hover:border-white/20 transition-all">
                  <div>
                    <h3 className="text-xs font-semibold text-white font-display">{sj.jobDetails?.title}</h3>
                    <p className="text-[10px] text-indigo-400 uppercase font-mono tracking-wider font-bold mt-1">{sj.jobDetails?.companyName}</p>
                  </div>
                  <button 
                    onClick={() => setView('jobs')}
                    className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all active:scale-95"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Col 3: Resume builder, uploads & Skills info */}
      <div className="space-y-8">
        
        {/* CV resume Upload manager */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center font-display tracking-wide uppercase">
            <FileText className="h-5 w-5 mr-2 text-indigo-400" />
            Attachments Desk
          </h2>

          {messageNotice && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-medium ${messageNotice.type === 'success' ? 'bg-[#064E3B]/40 text-[#A7F3D0] border border-emerald-500/20' : 'bg-[#7F1D1D]/30 text-[#FECACA] border border-red-500/20'}`}>
              {messageNotice.text}
            </div>
          )}

          <form onSubmit={handleUploadDocs} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">CV / Resume Transcript (PDF/Word)</label>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full mt-1.5 text-xs text-slate-350 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10.5px] file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer p-1.5 rounded-xl bg-white/[0.03] border border-white/5"
              />
              {user.profile.cvPath && (
                <p className="text-[10.5px] text-emerald-400 font-semibold mt-1.5 flex items-center">
                  <Check className="h-3.5 w-3.5 mr-1" /> Bound Resume: <a href={user.profile.cvPath} download className="underline ml-1 text-slate-300 truncate max-w-[150px] font-mono hover:text-white">{user.profile.cvName || 'resume.pdf'}</a>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">School Log / Dean Authorization letter</label>
              <input 
                type="file" 
                accept=".pdf,.jpg,.png"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                className="w-full mt-1.5 text-xs text-slate-350 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10.5px] file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer p-1.5 rounded-xl bg-white/[0.03] border border-white/5"
              />
              {user.profile.certPath && (
                <p className="text-[10.5px] text-emerald-400 font-semibold mt-1.5 flex items-center">
                  <Check className="h-3.5 w-3.5 mr-1" /> School Authorization Letter: <a href={user.profile.certPath} download className="underline ml-1 text-slate-300 truncate max-w-[150px] font-mono hover:text-white">{user.profile.certName || 'letter.pdf'}</a>
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={loadingUpload}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-505 disabled:opacity-40 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all font-display"
            >
              {loadingUpload ? 'Uploading documents...' : 'Attach Documents'}
            </button>
          </form>
        </div>

        {/* Dynamic Interactive Skills section */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide font-display">Skills Inventory</h2>
          
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(!user.profile.skills || user.profile.skills.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No skills listed yet.</p>
            ) : (
              user.profile.skills.map((s, idx) => (
                <span key={idx} className="bg-white/[0.04] border border-white/5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium text-slate-300 flex items-center font-mono">
                  {s}
                  <button 
                    onClick={() => handleRemoveSkill(idx)}
                    className="ml-1.5 p-0.5 rounded-full hover:bg-white/10 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Kotlin, Docker"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-505 text-white p-2 px-3 rounded-xl text-xs leading-none cursor-pointer flex items-center transition-all active:scale-95">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Education lists details */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide font-display">Academic Institutions</h2>

          <div className="space-y-3 mb-4">
            {(!user.profile.education || user.profile.education.length === 0) ? (
              <p className="text-xs text-slate-500 italic text-center py-2 font-mono">No schools added</p>
            ) : (
              user.profile.education.map((e, idx) => (
                <div key={idx} className="p-3.5 bg-white/[0.01]/50 rounded-2xl border border-white/5 relative group">
                  <button 
                    onClick={() => handleRemoveEdu(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-400 cursor-pointer hidden group-hover:block transition-colors"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                  <h4 className="text-xs font-semibold text-white font-display">{e.institution}</h4>
                  <p className="text-[11px] text-slate-300 font-medium mt-1 font-sans">{e.course}</p>
                  <span className="text-[10px] text-indigo-400 font-mono font-medium block mt-1.5">{e.startYear} &mdash; {e.endYear}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddEdu} className="space-y-2 border-t border-white/5 pt-4">
            <input 
              type="text" 
              required
              placeholder="School / Academic Institution"
              value={inst}
              onChange={(e) => setInst(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:bg-white/[0.06] transition-all"
            />
            <input 
              type="text" 
              required
              placeholder="Course Major (e.g. B.Sc. Computer Science)"
              value={courseVal}
              onChange={(e) => setCourseVal(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:bg-white/[0.06] transition-all"
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number" 
                placeholder="Start Year" 
                value={sy}
                onChange={(e) => setSy(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:bg-white/[0.06] transition-all font-mono"
              />
              <input 
                type="number" 
                placeholder="End Year" 
                value={ey}
                onChange={(e) => setEy(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:bg-white/[0.06] transition-all font-mono"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl py-2 text-xs font-bold font-display cursor-pointer active:scale-95 transition-all">
              Add School Certificate
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// 2. JOB SEEKER DASHBOARD (Practically same but focuses on generic Jobs and resumes as Student is specific)
// ==========================================
function JobSeekerDashboard({ user, onUpdateUser, setView }: { user: User; onUpdateUser: (user: User) => void; setView: (view: string) => void }) {
  return <StudentDashboard user={user} onUpdateUser={onUpdateUser} setView={setView} />;
}

// ==========================================
// 3. EMPLOYER DASHBOARD
// ==========================================
function EmployerDashboard({ user, setView }: { user: User; setView: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState<'applicants' | 'jobs' | 'new_job' | 'chats'>('applicants');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  
  // Create Job Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'job' | 'internship' | 'attachment'>('job');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [desc, setDesc] = useState('');

  // Messager Chat controls
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeApplicantId, setActiveApplicantId] = useState<string | null>(null);
  const [activeApplicantName, setActiveApplicantName] = useState<string>('');
  const [newChatText, setNewChatText] = useState('');

  // Post notifications feedbacks
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadEmployerData = async () => {
    try {
      const jRes = await api.getJobs();
      // Filter jobs posted by employer companyId
      const orgJobs = (jRes.jobs || []).filter((j: any) => j.companyId === user.companyId);
      setJobs(orgJobs);

      const aRes = await api.getApplications();
      setApps(aRes.applications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEmployerData();
  }, [user.companyId]);

  // Load chat messages
  const loadChatHistory = async (peerId: string) => {
    try {
      const res = await api.getMessages(peerId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeApplicantId) {
      loadChatHistory(activeApplicantId);
      const timer = setInterval(() => loadChatHistory(activeApplicantId), 4000); // Fast poll for chatting live!
      return () => clearInterval(timer);
    }
  }, [activeApplicantId]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionNotice(null);

    const payload = {
      title,
      type,
      location,
      salary,
      description: desc,
      requirements: requirementsText.split(',').map(s => s.trim()).filter(Boolean),
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      await api.postJob(payload);
      setActionNotice('Your vacancy opportunity has been successfully published!');
      // Reset
      setTitle('');
      setLocation('');
      setSalary('');
      setRequirementsText('');
      setSkillsText('');
      setDesc('');
      loadEmployerData();
      setTimeout(() => setActiveTab('jobs'), 1500);
    } catch (err: any) {
      setActionNotice(err.message || 'Failed listing vacancy.');
    }
  };

  const handleModifyStatus = async (appId: string, statusValue: string) => {
    try {
      await api.updateApplicationStatus(appId, statusValue);
      loadEmployerData(); // Refreshes status lists
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApplicantId || !newChatText.trim()) return;

    try {
      await api.sendMessage(activeApplicantId, activeApplicantName, newChatText.trim());
      setNewChatText('');
      loadChatHistory(activeApplicantId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this posting?')) return;
    try {
      await api.deleteJob(jobId);
      loadEmployerData();
    } catch (err) {
      console.error(err);
    }
  };

  // Recharts application metrics calculations
  const pendingCountByJob = apps.reduce((acc: any, curr) => {
    acc[curr.jobTitle] = (acc[curr.jobTitle] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(pendingCountByJob).map(key => ({
    name: key.length > 18 ? `${key.substring(0, 15)}...` : key,
    Applicants: pendingCountByJob[key]
  }));

  return (
    <div className="space-y-8" id="employer-view-tab">
      
      {/* 3.1 Aggregate Metrics counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Published Vacancies</span>
            <span className="text-2xl font-black text-white mt-1 block font-display">{jobs.length}</span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl animate-pulse">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Applications Received</span>
            <span className="text-2xl font-black text-white mt-1 block font-display">{apps.length}</span>
          </div>
          <div className="p-3.5 bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20 rounded-2xl">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Awaiting Review</span>
            <span className="text-2xl font-black text-amber-450 mt-1 block font-display">{apps.filter(a => a.status === 'pending').length}</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Navigation tabs within employer portal */}
      <div className="flex border-b border-white/10 gap-6">
        <button 
          onClick={() => setActiveTab('applicants')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'applicants' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Review Pipeline ({apps.length})
        </button>
        <button 
          onClick={() => setActiveTab('jobs')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          My Listings ({jobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('new_job')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'new_job' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Post New Room
        </button>
        <button 
          onClick={() => setActiveTab('chats')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'chats' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Direct Message Chats
        </button>
      </div>

      {/* TAB A: APPLICANTS PIPELINE */}
      {activeTab === 'applicants' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-[#0E0E14]/90 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md space-y-6">
            <h2 className="text-sm font-semibold text-white tracking-wider font-display">Candidate Applications Stream</h2>

            {apps.length === 0 ? (
              <p className="text-xs text-slate-505 italic py-4">No candidates have applied to your postings yet.</p>
            ) : (
              <div className="space-y-4">
                {apps.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-white/5 p-5 bg-white/[0.01]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white font-display">{a.applicantName}</h3>
                          <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${a.applicantRole === 'student' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {a.applicantRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Applied for: <strong className="text-white font-medium">{a.jobTitle}</strong> | Status: <strong className="text-indigo-400 uppercase font-mono">{a.status}</strong></p>
                      </div>

                      {/* Quick decision actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleModifyStatus(a.id, 'accepted')}
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white p-1 px-3.5 rounded-xl text-xs font-bold leading-none cursor-pointer transition-all"
                          title="Accept applicant"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleModifyStatus(a.id, 'rejected')}
                          className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white p-1 px-3.5 rounded-xl text-xs font-bold leading-none cursor-pointer transition-all"
                          title="Reject applicant"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleModifyStatus(a.id, 'reviewed')}
                          className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-[#6366F1] hover:text-white p-1 px-3 rounded-xl text-xs font-bold leading-none cursor-pointer transition-all"
                        >
                          Review
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cover letter */}
                      <div className="bg-[#0e0e14]/65 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">Cover letter excerpt</span>
                        <p className="text-[11.5px] text-slate-350 leading-relaxed whitespace-pre-line font-medium">&ldquo;{a.coverLetter}&rdquo;</p>
                        
                        {/* Messenger trigger */}
                        <div className="mt-3">
                          <button 
                            onClick={() => {
                              setActiveApplicantId(a.userId);
                              setActiveApplicantName(a.applicantName);
                              setActiveTab('chats');
                            }}
                            className="text-[10.5px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center cursor-pointer transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Open chat logs with {a.applicantName.split(' ')[0]}
                          </button>
                        </div>
                      </div>

                      {/* Attached academic papers */}
                      <div className="bg-[#0e0e14]/65 p-4 rounded-xl border border-white/5 space-y-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Academic Credentials</span>
                        {a.cvPath ? (
                          <a 
                            href={a.cvPath} 
                            download 
                            className="flex items-center text-xs font-semibold text-slate-300 hover:text-indigo-400 hover:underline transition-colors"
                          >
                            <FileText className="h-4 w-4 mr-2 text-indigo-400" />
                            CV Resume: <strong className="ml-1 text-indigo-300 truncate max-w-[150px]">{a.cvName || 'resume.pdf'}</strong>
                          </a>
                        ) : (
                          <span className="text-xs text-rose-400 italic font-mono">No resume CV attached</span>
                        )}

                        {a.certPath ? (
                          <a 
                            href={a.certPath} 
                            download 
                            className="flex items-center text-xs font-semibold text-slate-300 hover:text-indigo-400 hover:underline mt-2 pt-2 border-t border-white/5 transition-colors"
                          >
                            <GraduationCap className="h-4 w-4 mr-2 text-indigo-400" />
                            Attachment authorization letter / academic transcripts
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 italic mt-2 block font-mono">No transcript letter attached</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual statistics for company */}
          <div className="col-span-1 bg-[#151521]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Placements Application chart</h3>
            {chartData.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Analytical metric will appear once applicants list postings.</p>
            ) : (
              <div className="h-64 font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0e0e14', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#f8fafc' }} />
                    <Bar dataKey="Applicants" fill="#818cf8" barSize={18} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB B: MY POSTINGS */}
      {activeTab === 'jobs' && (
        <div className="bg-[#151521]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">Active listings ({jobs.length})</h2>
            <button 
              onClick={() => setActiveTab('new_job')}
              className="rounded-xl bg-indigo-650 hover:bg-indigo-505 text-white text-xs font-bold py-2 px-4 flex items-center cursor-pointer transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1" /> Add vacancy
            </button>
          </div>

          {jobs.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6">You have not created any opportunities on AttachME. Click "Add vacancy" to start.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-white/5 p-5 hover:border-white/10 hover:bg-white/[0.02] transition-colors relative group bg-[#0e0e14]/50">
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-450 p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                    title="Delete vacancy"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">{job.type}</span>
                  <h3 className="text-sm font-bold text-white mt-1 font-display">{job.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{job.location} | {job.salary}</p>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[11px] text-slate-450">
                    <span>Applicants count: <strong className="text-indigo-400">{job.applicantsCount}</strong></span>
                    <span className="text-[10px] text-slate-500 font-mono">Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB C: POST VACANCY */}
      {activeTab === 'new_job' && (
        <div className="bg-[#151521]/80 p-6 rounded-3xl border border-white/10 shadow-2xl max-w-2xl mx-auto backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 font-display">Publish New Vacancy Space</h2>

          {actionNotice && (
            <div className="mb-6 rounded-xl bg-indigo-505/10 border border-indigo-500/20 p-4 text-xs font-semibold text-indigo-300">
              {actionNotice}
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Opportunity Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Software Engineering Attachment student"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Opportunity Block</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full mt-1.5 rounded-xl border border-white/10 bg-[#0E0E14] py-2.5 px-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-[#6366F1] focus:bg-[#0E0E14] transition-all font-sans"
                >
                  <option value="attachment" className="bg-[#0e0e14] text-slate-300">Attachment</option>
                  <option value="internship" className="bg-[#0e0e14] text-slate-300">Internship</option>
                  <option value="job" className="bg-[#0e0e14] text-slate-300">Direct Job</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Working Coordinates / Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Nairobi / Redmond / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs text-white placeholder-slate-505 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Salary / Internship Stipend</label>
                <input 
                  type="text" 
                  placeholder="e.g. $800 / mo or Unpaid"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs text-white placeholder-slate-505 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Skills Required(comma separated)</label>
                <input 
                  type="text" 
                  placeholder="React, CSS3, JavaScript"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs text-white placeholder-slate-505 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Essential Academic requirements(comma separated)</label>
              <input 
                type="text" 
                placeholder="Active enrollment in CS degrees, Recommendation letter from university"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs text-white placeholder-slate-505 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Role Description Details</label>
              <textarea 
                required
                placeholder="Give details about key assignments, supervisor routines, timelines here..."
                rows={5}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white placeholder-slate-505 focus:border-indigo-500 focus:bg-white/[0.06] focus:outline-none transition-all font-sans"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/15 cursor-pointer transition-all active:scale-[0.98]"
            >
              Publish vacancy listing
            </button>
          </form>
        </div>
      )}

      {/* TAB D: CHATS MESSAGES */}
      {activeTab === 'chats' && (
        <div className="bg-[#151521]/80 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 overflow-hidden h-[500px]">
          {/* Peer Selector Sidebar */}
          <div className="border-r border-white/5 bg-[#0e0e14]/40 p-4 space-y-3 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4 font-mono">Applicant Chats</h3>
            
            {Array.from(new Set(apps.map(a => JSON.stringify({id: a.userId, name: a.applicantName})))).map((raw) => {
              const item = JSON.parse(raw as string);
              const isActive = activeApplicantId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveApplicantId(item.id); setActiveApplicantName(item.name); }}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isActive ? 'border-indigo-500 bg-indigo-505/10 text-indigo-300 shadow-md' : 'border-white/5 bg-white/[0.01] text-slate-405 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Chat Messenger Window */}
          <div className="col-span-2 flex flex-col justify-between h-full bg-[#0e0e14]/20 p-4">
            {activeApplicantId ? (
              <>
                {/* Chat header */}
                <div className="border-b border-white/5 pb-3 mb-3">
                  <h4 className="text-xs font-extrabold text-white font-display">Conversation with {activeApplicantName}</h4>
                  <span className="text-[9px] text-slate-500">Secure Direct Message channel</span>
                </div>

                {/* Msg list */}
                <div className="flex-grow overflow-y-auto space-y-3.5 pr-2">
                  {messages.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 italic py-12">No messages exchanged yet. Send a greeting to initiate contact!</p>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === user.id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-2xl max-w-xs text-xs font-medium leading-relaxed shadow-md ${
                            isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                          }`}>
                            <p>{m.content}</p>
                            <span className={`text-[9px] block mt-1.5 ${isMe ? 'text-indigo-200' : 'text-slate-505'}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Sender Form */}
                <form onSubmit={handleSendChatSubmit} className="flex gap-2 border-t border-white/5 pt-3">
                  <input 
                    type="text" 
                    placeholder="Type your message here..."
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:bg-[#0E0E14]/50 focus:border-indigo-505 focus:outline-none transition-all font-sans"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl text-xs font-bold leading-none shrink-0 cursor-pointer active:scale-95 transition-all">
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-24">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-600" />
                <h4 className="mt-4 text-sm font-bold text-white">Select an Applicant</h4>
                <p className="text-xs text-slate-500 mt-1">Select any applicant from the chats sidebar to begin exchanging messages.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 4. ADMIN DASHBOARD
// ==========================================
function AdminDashboard({ user, setView }: { user: User; setView: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'tickets'>('stats');

  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [tickets, setTickets] = useState<Report[]>([]);
  const [counters, setCounters] = useState<any>(null);

  const loadAdminSystemData = async () => {
    try {
      const uRes = await api.getAdminUsers();
      setUsers(uRes.users || []);

      const sRes = await api.getAdminStats();
      setCounters(sRes.counters);
      setLogs(sRes.auditLogs || []);
      setTickets(sRes.tickets || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminSystemData();
  }, []);

  const handleToggleSuspend = async (targetId: string) => {
    try {
      const res = await api.toggleUserSuspend(targetId);
      alert(res.message);
      loadAdminSystemData();
    } catch (err: any) {
      alert(err.message || 'Suspension click failed.');
    }
  };

  const handleApproveEmployer = async (targetId: string) => {
    try {
      const res = await api.approveEmployer(targetId);
      alert(res.message);
      loadAdminSystemData();
    } catch (err: any) {
      alert(err.message || 'Approval click failed');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await api.resolveReport(ticketId);
      alert(res.message);
      loadAdminSystemData();
    } catch (err) {
      console.error(err);
    }
  };

  // Prepare standard Pie Chart arrays
  const placementsPieData = counters ? [
    { name: 'Attachments', value: counters.jobs.attachment },
    { name: 'Internships', value: counters.jobs.internship },
    { name: 'Jobs', value: counters.jobs.job }
  ] : [];

  const PIE_COLORS = ['#3B82F6', '#6366F1', '#14B8A6'];

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-view-tab">
      
      {/* 4.1 System metrics totals */}
      {counters && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-[#151521]/80 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-md">
            <span className="text-[10.5px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Total Members</span>
            <span className="text-3xl font-black text-white mt-1.5 block font-display">{counters.users.total}</span>
            <span className="text-[10px] text-slate-500 mt-2 block font-mono">Students: {counters.users.student} | Recruiters: {counters.users.employer}</span>
          </div>
          <div className="bg-[#151521]/80 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-md">
            <span className="text-[10.5px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Opportunity Spaces</span>
            <span className="text-3xl font-black text-indigo-400 mt-1.5 block font-display">{counters.jobs.total}</span>
            <span className="text-[10px] text-indigo-400/80 mt-2 block font-mono">Attachments: {counters.jobs.attachment} | Internships: {counters.jobs.internship}</span>
          </div>
          <div className="bg-[#151521]/80 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-md">
            <span className="text-[10.5px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Submissions Received</span>
            <span className="text-3xl font-black text-emerald-400 mt-1.5 block font-display">{counters.applications.total}</span>
            <span className="text-[10px] text-emerald-400/80 mt-2 block font-mono">Approved: {counters.applications.accepted} | Pending: {counters.applications.pending}</span>
          </div>
          <div className="bg-[#151521]/80 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-md">
            <span className="text-[10.5px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Active Support Tickets</span>
            <span className="text-3xl font-black text-amber-500 mt-1.5 block font-display">{tickets.filter(t => t.status === 'open').length}</span>
            <span className="text-[10px] text-amber-400 mt-2 block font-mono">Resolved: {tickets.filter(t => t.status === 'resolved').length}</span>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-white/10 gap-6">
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'stats' ? 'border-indigo-500 text-indigo-405' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Analytical KPIs & Logs
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'users' ? 'border-indigo-500 text-indigo-405' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Member Management ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('tickets')} 
          className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'tickets' ? 'border-indigo-500 text-indigo-405' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Helpdesk Support Tickets ({tickets.length})
        </button>
      </div>

      {/* TAB 1: ANALYTICAL STATS & SECURITY AUDIT LOGS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Audit Logs panel */}
          <div className="lg:col-span-2 bg-[#151521]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center font-display">
                <Activity className="h-4 w-4 mr-1.5 text-indigo-400" />
                Security Audit Logs Stream
              </h3>
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Enterprise Audit</span>
            </div>

            <div className="max-h-[350px] overflow-y-auto mt-2 text-[11px] font-mono border border-white/5 rounded-2xl divide-y divide-white/5">
              {logs.length === 0 ? (
                <p className="p-4 text-slate-500 italic text-center">No logs generated.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-white/[0.01] flex items-start justify-between">
                    <div>
                      <span className="text-indigo-400 font-bold tracking-tight">[{log.action}]</span>
                      <p className="text-slate-400 mt-1 font-medium">By: {log.performedBy}</p>
                    </div>
                    <div className="text-right text-slate-500 text-[10px]">
                      <span>IP: {log.ip}</span>
                      <span className="block mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Placements Stream distribution pie chart */}
          <div className="bg-[#151521]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Opportunity distribution</h3>
              {placementsPieData.length === 0 ? (
                <p className="text-xs text-slate-500 italic">analytical charts loading...</p>
              ) : (
                <div className="h-48 relative flex justify-center items-center font-sans">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={placementsPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {placementsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="p-3 bg-white/[0.01] rounded-2xl border border-white/5 text-[10.5px] text-slate-405 leading-relaxed mt-4">
              Our placement charts monitor active channels. Adjust parameters within employer panels to balances the distribution weights.
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MEMBER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-[#151521]/80 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">Manage Member Accounts ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                  <th className="p-4 px-6">Name & Email</th>
                  <th className="p-4">Role Assigned</th>
                  <th className="p-4">Suspension State</th>
                  <th className="p-4">Approval status</th>
                  <th className="p-4 text-right px-6">Actions Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={u.profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`} 
                          alt={u.name} 
                          className="h-7 w-7 rounded-full object-cover border border-white/10" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-extrabold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-450 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-lg p-1 px-2.5 text-[10px] font-bold uppercase font-mono ${
                        u.role === 'student' ? 'bg-indigo-500/10 text-indigo-400' : u.role === 'employer' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] text-xs font-semibold font-mono ${u.isSuspended ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {u.isSuspended ? 'Suspended' : 'Clear Account'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] text-xs font-semibold font-mono ${u.isApproved ? 'text-emerald-405' : 'text-amber-500'}`}>
                        {u.isApproved ? 'Approved Recruiter' : 'Pending Verified'}
                      </span>
                    </td>
                    <td className="p-4 text-right px-6 space-x-2">
                      {/* Suspended togglers */}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleSuspend(u.id)}
                          className={`p-1 px-3 text-xs font-bold rounded-xl transition-colors leading-none border cursor-pointer ${
                            u.isSuspended ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white' : 'bg-rose-500/10 text-rose-450 border-rose-500/20 hover:bg-rose-600 hover:text-white'
                          }`}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}

                      {/* Pending approve toggle */}
                      {u.role === 'employer' && !u.isApproved && (
                        <button
                          onClick={() => handleApproveEmployer(u.id)}
                          className="p-1 px-3.5 text-xs font-bold rounded-xl bg-indigo-505/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white leading-none cursor-pointer transition-colors"
                        >
                          Approve Recruiter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HELPDESK TICKETS */}
      {activeTab === 'tickets' && (
        <div className="bg-[#151521]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">Help Support Tickets Stream</h2>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No reports or support tickets logged currently.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-2xl border border-white/5 p-5 bg-[#0e0e14]/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-extrabold text-white font-display">{t.subject}</h3>
                        <span className={`p-0.5 px-2.5 rounded text-[9px] font-bold uppercase font-mono ${t.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-450 mt-1 font-mono">Logged by: {t.userName} ({t.userEmail}) on {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    {t.status === 'open' && (
                      <button
                        onClick={() => handleResolveTicket(t.id)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold p-2 px-4 leading-none shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        Resolve ticket
                      </button>
                    )}
                  </div>

                  <p className="mt-3.5 text-xs text-slate-300 leading-relaxed font-semibold">
                    Description details: {t.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
