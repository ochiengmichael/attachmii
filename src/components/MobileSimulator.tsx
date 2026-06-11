import React, { useState, useEffect } from 'react';
import { 
  Smartphone, ShieldAlert, Key, Fingerprint, Lock, 
  User as UserIcon, LogIn, ChevronRight, Briefcase, 
  MapPin, Bell, Send, CheckCircle2, CloudLightning, 
  CloudOff, HelpCircle, Star, Phone, StarHalf, FileText, 
  Share2, Volume2, Moon, Sun, ToggleLeft, ToggleRight,
  Heart, Trash2, ArrowLeft, RefreshCw, Sparkles, MessageSquare, AlertCircle
} from 'lucide-react';
import { User, Notification, Job } from '../types.js';
import { api } from '../api.js';

interface MobileSimulatorProps {
  user: User | null;
  setView: (view: string) => void;
}

export function MobileSimulator({ user, setView }: MobileSimulatorProps) {
  // Mobile UI States
  const [phoneTheme, setPhoneTheme] = useState<'dark' | 'light'>('dark');
  const [phoneOnline, setPhoneOnline] = useState<boolean>(true);
  const [phoneBiometrics, setPhoneBiometrics] = useState<boolean>(true);
  const [phoneView, setPhoneView] = useState<string>('greeting'); // greeting -> login -> biometrics -> student_dash -> employer_dash -> messages -> notifications -> support -> saved
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [scannedSuccess, setScannedSuccess] = useState<boolean>(false);
  const [messagesInput, setMessagesInput] = useState<string>('');
  
  // Simulated State for Candidate Cart
  const [shortlistCart, setShortlistCart] = useState<any[]>([
    { id: 'u3', name: 'Sophia Chen', university: 'MIT / CS Senior', rating: 4.8 },
    { id: 'u4', name: 'David Kim', university: 'Stanford / Soft Eng', rating: 4.6 }
  ]);
  const [showReviewsUser, setShowReviewsUser] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  
  // Message Thread Simulation
  const [sampleChats, setSampleChats] = useState<any[]>([
    { sender: 'David', text: 'Hi, I saw your shortlisting for the cloud developer attachment! When can we schedule a WhatsApp technical brief?', isMe: false, time: '11:21 AM' },
    { sender: 'Me', text: 'Great! We can jump on a brief session this Wednesday afternoon. Please prepare your CV & transcript credentials.', isMe: true, time: '11:24 AM' }
  ]);

  // Support Screen state
  const [supportSubject, setSupportSubject] = useState<string>('');
  const [supportDesc, setSupportDesc] = useState<string>('');
  const [supportTickets, setSupportTickets] = useState<any[]>([
    { id: 'T-904', subject: 'JWT Expired Issue', status: 'Solved', date: 'Yesterday' }
  ]);

  // Public/Offline Client list caching
  const [offlineCachedJobs, setOfflineCachedJobs] = useState<any[]>([
    { id: 'j1', title: 'Cloud Infrastructure Intern', company: 'Amazon AWS Technologies', location: 'Seattle / Remote', stipend: '$3,400/mo', type: 'Internship' },
    { id: 'j2', title: 'Cybersecurity Associate Placer', company: 'CrowdStrike Sec Dev', location: 'Austin, TX', stipend: '$3,800/mo', type: 'Attachment' },
    { id: 'j3', title: 'Graduate Analyst Developer', company: 'Goldman Sachs fintech', location: 'New York City', stipend: '$4,200/mo', type: 'Full-Time' }
  ]);

  // CV Upload simulator state
  const [uploadedResumeName, setUploadedResumeName] = useState<string>('');
  const [uploadedResumeProgress, setUploadedResumeProgress] = useState<number>(0);

  // Floating simulated Push Notification alert screen
  const [simulatedPushMessage, setSimulatedPushMessage] = useState<string | null>(null);

  // Audio simulation feedback (using web synthesizer sound effects)
  const playBeep = (freq: number, type: 'sine' | 'square' | 'triangle' = 'sine', duration: number = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported in background
    }
  };

  // Simulate incoming feedback push notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerPush('🚀 AttachME Recruitment: Sophian Chen has accepted your attachment brief!');
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const triggerPush = (text: string) => {
    setSimulatedPushMessage(text);
    playBeep(880, 'sine', 0.25);
    setTimeout(() => {
      setSimulatedPushMessage(null);
    }, 45000);
  };

  const attemptBiometrics = () => {
    if (biometricScanning) return;
    setBiometricScanning(true);
    playBeep(440, 'triangle', 0.1);
    
    setTimeout(() => {
      setBiometricScanning(false);
      setScannedSuccess(true);
      playBeep(987.77, 'sine', 0.3);
      setTimeout(() => {
        // Redirect based on user role or mock default of student dashboard
        if (user) {
          if (user.role === 'employer') {
            setPhoneView('employer_dash');
          } else {
            setPhoneView('student_dash');
          }
        } else {
          setPhoneView('student_dash');
        }
      }, 800);
    }, 1800);
  };

  const handleSendMessage = () => {
    if (!messagesInput.trim()) return;
    const newMsg = { sender: 'Me', text: messagesInput, isMe: true, time: 'Now' };
    setSampleChats(prev => [...prev, newMsg]);
    setMessagesInput('');
    playBeep(600, 'sine', 0.08);

    // Auto simulated reply in 1.5 seconds
    setTimeout(() => {
      const reply = {
        sender: 'Recruiter / Candidate',
        text: 'Hello! This is a real-time responsive simulation triggered in AttachME Mobile. Our Webhook relays look verified. Let\'s continue our tech discussion on workspace integration call.',
        isMe: false,
        time: 'Now'
      };
      setSampleChats(prev => [...prev, reply]);
      playBeep(523.25, 'sine', 0.15);
      triggerPush('💬 New Message: Candidate has responded to your workspace conversation!');
    }, 1500);
  };

  // Simulated CV uploading feedback loops
  const simulateCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedResumeName(file.name);
    setUploadedResumeProgress(10);
    playBeep(350, 'triangle', 0.1);

    const intv = setInterval(() => {
      setUploadedResumeProgress(prev => {
        if (prev >= 100) {
          clearInterval(intv);
          playBeep(1046.5, 'sine', 0.2);
          triggerPush(`📄 CV Successfully Uploaded: "${file.name}" cached and ready for recruitment matching.`);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  // Cart Management
  const removeFromCart = (id: string, name: string) => {
    setShortlistCart(prev => prev.filter(c => c.id !== id));
    playBeep(330, 'triangle', 0.1);
    triggerPush(`🗑️ Removed ${name} from Candidate Evaluation Cart.`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    triggerPush(`⭐ Star Rating Logged! Recommended ${reviewRating}/5 stars for shortlist evaluation.`);
    setReviewComment('');
    setShowReviewsUser(null);
    playBeep(784, 'sine', 0.2);
  };

  const handleAddSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim()) return;
    const newTkt = { id: `T-${Math.floor(100 + Math.random() * 900)}`, subject: supportSubject, status: 'Active Queue', date: 'Just now' };
    setSupportTickets(prev => [newTkt, ...prev]);
    setSupportSubject('');
    setSupportDesc('');
    playBeep(660, 'sine', 0.15);
    triggerPush(`⚙️ Support Ticket Created: Our system queued your report request.`);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-[#0B0B11] to-[#050508] border-t border-b border-white/5 relative z-10 overflow-hidden" id="mobile-preview-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Module Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300 uppercase tracking-widest font-mono">
            Interactive Showcase
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
            The AttachME <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Mobile Simulator</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-400">
            Preview, test, and control the native AttachME smartphone experience right inside your browser! This interactive replica demonstrates the entire design flow, biometric auth checks, offline network toggles, and multi-user candidate shortlists.
          </p>
        </div>

        {/* Master Grid Layout: Simulator Screen (Left/Center) + Code Structure Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Live Interactive Mobile Emulator */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            
            {/* Native Mobile Frame */}
            <div className={`w-full max-w-[370px] aspect-[9/18.5] rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_rgba(99,102,241,0.15)] flex flex-col relative overflow-hidden transition-all duration-300 ${
              phoneTheme === 'dark' ? 'bg-[#0E0E14] text-slate-300 ring-1 ring-white/10' : 'bg-slate-50 text-slate-800 ring-1 ring-black/10'
            }`}>
              
              {/* Dynamic Simulated Push Notification Pop-up inside user phone */}
              {simulatedPushMessage && (
                <div className="absolute top-12 left-3 right-3 bg-slate-900/95 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 z-50 shadow-2xl animate-bounce flex items-start gap-2.5">
                  <div className="flex-shrink-0 bg-indigo-600 rounded-lg p-1.5 text-white">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Push Notification</p>
                    <p className="text-[11px] text-white mt-0.5 leading-snug">{simulatedPushMessage}</p>
                  </div>
                  <button 
                    onClick={() => setSimulatedPushMessage(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold font-mono px-1 rounded hover:bg-white/10"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Speaker notch / Dynamic Island bar */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-40">
                <div className="w-32 h-4.5 bg-black rounded-b-2xl flex items-center justify-around px-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]"></span>
                  <span className="w-10 h-1 bg-slate-800 rounded-full"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                </div>
              </div>

              {/* Mobile device screen status indicator */}
              <div className={`pt-7 px-5 pb-2.5 flex justify-between items-center text-[10px] font-mono select-none z-30 tracking-tight ${
                phoneTheme === 'dark' ? 'text-slate-400' : 'text-slate-550'
              }`}>
                <span>09:41 AM</span>
                <div className="flex items-center space-x-1.5">
                  {phoneOnline ? (
                    <CloudLightning className="h-3.5 w-3.5 text-indigo-400" title="Simulated Online Connection" />
                  ) : (
                    <CloudOff className="h-3.5 w-3.5 text-rose-500" title="Simulated Offline Cache Active" />
                  )}
                  <span className="text-[9px] uppercase font-bold tracking-wider">{phoneOnline ? '5G' : 'OFFLINE'}</span>
                  <span className="w-4 h-2.5 border border-current rounded-sm p-[1px] flex items-center"><span className="w-full h-full bg-emerald-500 rounded-2xs"></span></span>
                </div>
              </div>

              {/* Dynamic device screen content viewport */}
              <div className="flex-grow flex flex-col overflow-y-auto px-4.5 pb-20 relative z-20">
                
                {/* VIEW A: Lock Screen / Lock Screen Greeting */}
                {phoneView === 'greeting' && (
                  <div className="flex-grow flex flex-col justify-between py-6">
                    <div className="text-center mt-6">
                      <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <FileText className="h-7 w-7" />
                      </div>
                      <h4 className="mt-4 text-xl font-bold font-display tracking-tight text-white">AttachME Native</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">v1.4.2 production-ready build</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl text-center space-y-4">
                      <p className="text-xs text-slate-300">Choose simulated credential workflow to unlock device or use instant Touch/Face ID.</p>
                      
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            playBeep(523, 'sine', 0.1);
                            setPhoneView('login');
                          }}
                          className="w-full bg-indigo-605 hover:bg-indigo-500 py-2.5 rounded-xl text-xs font-semibold text-white shadow flex items-center justify-center gap-2 transition-all"
                        >
                          <Key className="h-3.5 w-3.5" />
                          <span>Credentials Login</span>
                        </button>

                        <button 
                          onClick={() => {
                            playBeep(587, 'sine', 0.1);
                            setPhoneView('biometrics');
                          }}
                          className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
                        >
                          <Fingerprint className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Use Biometric Login</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Secured with Biometric Keychain</p>
                    </div>
                  </div>
                )}

                {/* VIEW B: Credentials Mock Login Screen */}
                {phoneView === 'login' && (
                  <div className="flex-grow flex flex-col justify-center py-4 space-y-4">
                    <div>
                      <h5 className="text-base font-bold text-white flex items-center gap-1.5 leading-snug">
                        <Lock className="h-4 w-4 text-indigo-400" />
                        <span>Sign In Securely</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">JWT Token cache synchronized over SSL APIs.</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Authenticated Account Email</label>
                        <input 
                          type="email" 
                          disabled
                          placeholder={user ? user.email : 'demo.student@attachme.com'}
                          className="w-full text-xs py-2 bg-white/5 border border-white/10 rounded-lg px-2.5 text-slate-450 font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">User Role Type</label>
                        <select 
                          disabled
                          className="w-full text-xs py-2 bg-white/5 border border-white/10 rounded-lg px-2 text-slate-450 font-mono focus:outline-none"
                        >
                          <option>{user ? (user.role === 'job_seeker' ? 'Student Seeker' : 'Verified Employer') : 'Student Seeker (Demo)'}</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => {
                          playBeep(880, 'sine', 0.2);
                          // Sync on user role if available
                          if (user && user.role === 'employer') {
                            setPhoneView('employer_dash');
                          } else {
                            setPhoneView('student_dash');
                          }
                          triggerPush(`🔐 Logged in successfully. Stashed JWT inside secure offline storage.`);
                        }}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/10"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Authenticate & Access</span>
                      </button>

                      <div className="text-center pt-2">
                        <button 
                          onClick={() => {
                            playBeep(400, 'sine', 0.1);
                            setPhoneView('biometrics');
                          }}
                          className="text-[11px] text-indigo-400 hover:underline"
                        >
                          Or use Face ID/Touch unlock
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW C: Biometric scanning simulator */}
                {phoneView === 'biometrics' && (
                  <div className="flex-grow flex flex-col justify-around py-6 text-center">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Biometric Pass</h4>
                      <p className="text-[11px] text-slate-450 mt-1">Simulated FaceID & Keychain Verification</p>
                    </div>

                    <div className="flex flex-col items-center justify-center my-6">
                      <div className={`relative p-8 rounded-full border-2 transition-all duration-300 ${
                        biometricScanning ? 'border-indigo-500 animate-pulse scale-105' : 
                        scannedSuccess ? 'border-emerald-500 scale-100 bg-emerald-500/10' : 'border-indigo-600/35'
                      }`}>
                        <Fingerprint className={`h-16 w-16 transition-all ${
                          biometricScanning ? 'text-indigo-400 scale-110' : 
                          scannedSuccess ? 'text-emerald-400' : 'text-indigo-400'
                        }`} />
                        {biometricScanning && (
                          <div className="absolute inset-0 border-t-2 border-indigo-400 rounded-full animate-spin"></div>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-300 mt-6 min-h-[30px] font-mono font-semibold">
                        {biometricScanning ? 'Scanning biometrics (Touch bar)...' : 
                         scannedSuccess ? 'Access Granted! Syncing JWT keys...' : 'Tap fingerprint sensor below'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button 
                        onClick={attemptBiometrics}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl text-xs font-semibold text-white shadow transition-all flex items-center justify-center gap-2"
                      >
                        <Fingerprint className="h-3.5 w-3.5" />
                        <span>Touch Sensor to Scan</span>
                      </button>
                      <button 
                        onClick={() => setPhoneView('greeting')}
                        className="text-[11px] text-slate-450 hover:text-white"
                      >
                        Cancel authentication
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW D: Student Dashboard Screen */}
                {phoneView === 'student_dash' && (
                  <div className="flex-grow flex flex-col py-3 space-y-4">
                    {/* Header profile brief */}
                    <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <img 
                          src={user && user.profile.avatar ? user.profile.avatar : 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophian'}
                          className="h-9 w-9 rounded-full border border-indigo-500/20 object-cover" 
                          referrerPolicy="no-referrer"
                          alt="avatar"
                        />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Welcome Portal</p>
                          <h6 className="text-xs font-extrabold text-white truncate max-w-[120px]">{user ? user.name : 'Sophian Student'}</h6>
                        </div>
                      </div>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/25">STUDENT</span>
                    </div>

                    {/* Interactive Resume Upload segment */}
                    <div className="bg-gradient-to-tr from-indigo-950/20 to-slate-900 border border-indigo-500/10 p-3.5 rounded-2xl relative overflow-hidden">
                      <h6 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Interactive CV Upload Setup</span>
                      </h6>
                      
                      {uploadedResumeName ? (
                        <div className="mt-2 text-left space-y-1.5 bg-black/30 p-2 rounded-xl border border-white/5">
                          <p className="text-[10px] font-semibold text-white truncate">{uploadedResumeName}</p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${uploadedResumeProgress}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                            <span>{uploadedResumeProgress}% uploaded success</span>
                            <span className="text-emerald-400">{uploadedResumeProgress === 100 ? 'Verified' : 'In Progress...'}</span>
                          </div>
                        </div>
                      ) : (
                        <label className="mt-2 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl py-3 px-2 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all">
                          <span className="text-[10px] text-slate-350 text-center">Drag or click photo catalog to mock upload CV credentials file.</span>
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            className="hidden" 
                            onChange={simulateCvUpload}
                          />
                        </label>
                      )}
                    </div>

                    {/* Jobs placement cache carousel */}
                    <div>
                      <h6 className="text-[11px] font-bold text-white uppercase tracking-widest font-mono mb-2 flex items-center justify-between">
                        <span>Offline Cached Openings ({offlineCachedJobs.length})</span>
                        <HelpCircle 
                          className="h-3.5 w-3.5 text-slate-450 hover:text-white cursor-pointer" 
                          onClick={() => {
                            playBeep(440, 'sine', 0.1);
                            alert('Offline Caching Mechanism: In low signal network zones, AttachME Native uses reactive SQLite to pull cached attachments instantly without loading delay.');
                          }}
                        />
                      </h6>

                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-0.5">
                        {offlineCachedJobs.map(job => (
                          <div key={job.id} className="p-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl text-left relative group">
                            <div className="flex justify-between items-start">
                              <h6 className="text-xs font-extrabold text-white leading-tight">{job.title}</h6>
                              <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">{job.type}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{job.company}</p>
                            
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1 text-[9px] text-[#A78BFA] font-mono">
                                <MapPin className="h-3 w-3" />
                                <span>{job.location}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  playBeep(880, 'sine', 0.2);
                                  triggerPush(`🎯 Applied successfully: CV matched to ${job.title} listing.`);
                                }}
                                className="text-[9px] font-bold text-white bg-indigo-650 hover:bg-indigo-500 py-1 px-3 rounded-lg"
                              >
                                Quick Apply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW E: Employer Dashboard & Candidate Star Ratings */}
                {phoneView === 'employer_dash' && (
                  <div className="flex-grow flex flex-col py-3 space-y-4">
                    {/* Header employer info */}
                    <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <img 
                          src={user && user.profile.avatar ? user.profile.avatar : 'https://api.dicebear.com/7.x/adventurer/svg?seed=GoogleRecruiter'}
                          className="h-9 w-9 rounded-full border border-indigo-500/20 object-cover" 
                          referrerPolicy="no-referrer"
                          alt="avatar"
                        />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Enterprise Portal</p>
                          <h6 className="text-xs font-extrabold text-white truncate max-w-[120px]">{user ? user.name : 'Google HR Tech'}</h6>
                        </div>
                      </div>
                      <span className="text-[8px] bg-emerald-500/25 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">EMPLOYER</span>
                    </div>

                    {/* Shortlist Evaluations Queue Cart count */}
                    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl text-left">
                      <div className="flex justify-between items-center">
                        <h6 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          <span>Evaluation Queue Cart</span>
                          <span className="bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 rounded-full h-4.5 w-4.5 flex items-center justify-center">
                            {shortlistCart.length}
                          </span>
                        </h6>
                        <button 
                          onClick={() => {
                            playBeep(220, 'square', 0.1);
                            setShortlistCart([]);
                            triggerPush('🗑️ Emptied candidate evaluator cart.');
                          }}
                          className="text-[9px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5 hover:underline"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Clear</span>
                        </button>
                      </div>

                      {shortlistCart.length === 0 ? (
                        <p className="text-[10px] text-slate-450 mt-3 text-center py-4 bg-white/[0.01] rounded-xl border border-dashed border-white/5">Cart is empty. shortlist candidates from browse screen.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {shortlistCart.map(cand => (
                            <div key={cand.id} className="flex items-center justify-between p-2 bg-black/20 hover:bg-black/30 rounded-xl border border-white/5">
                              <div>
                                <p className="text-xs font-semibold text-white">{cand.name}</p>
                                <p className="text-[9px] text-slate-400">{cand.university}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => {
                                    playBeep(440, 'sine', 0.15);
                                    setShowReviewsUser(cand.name);
                                  }}
                                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-505/20 px-2 py-0.5 rounded"
                                >
                                  Review
                                </button>
                                <button 
                                  onClick={() => removeFromCart(cand.id, cand.name)}
                                  className="p-1 text-slate-450 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive review panel popup trigger */}
                    {showReviewsUser && (
                      <div className="bg-slate-900 border border-indigo-500/25 p-3 rounded-2xl text-left space-y-2 index-50 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <p className="text-[11px] font-extrabold text-white">Reviewing: {showReviewsUser}</p>
                          <button 
                            onClick={() => setShowReviewsUser(null)}
                            className="text-slate-400 text-xs font-mono font-bold hover:bg-white/10 px-1 rounded"
                          >
                            ×
                          </button>
                        </div>
                        <form onSubmit={handleReviewSubmit} className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono">Simulate Rating</span>
                            <div className="flex items-center gap-1.5 mt-1 text-amber-400">
                              {[1, 2, 3, 4, 5].map(st => (
                                <button
                                  type="button"
                                  key={st}
                                  onClick={() => {
                                    playBeep(500 + st * 50, 'sine', 0.08);
                                    setReviewRating(st);
                                  }}
                                >
                                  <Star className={`h-4.5 w-4.5 ${st <= reviewRating ? 'fill-current' : 'text-slate-700'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono">Feedback Comment</span>
                            <input 
                              type="text" 
                              required
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Describe student performance, technical score..."
                              className="w-full text-xs py-1.5 bg-black/40 border border-white/10 rounded-lg px-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] py-1.5 w-full rounded"
                          >
                            Submit Review Log
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Social Media Sharing Simulator */}
                    <div className="bg-gradient-to-tr from-[#0284C7]/10 to-slate-900 border border-[#0284C7]/20 p-3 rounded-2xl text-left">
                      <h6 className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                        <Share2 className="h-3.5 w-3.5 text-[#0284C7]" />
                        <span>Social Media Link Matching</span>
                      </h6>
                      <p className="text-[10px] text-slate-450 mt-1">Announce active open placements automatically to LinkedIn or WhatsApp recruiting groups.</p>
                      
                      <div className="flex items-center gap-2 mt-2.5">
                        <button 
                          onClick={() => {
                            playBeep(880, 'sine', 0.15);
                            triggerPush('🔗 LinkedIn API Share: Placements matched announcements propagated successfully.');
                          }}
                          className="flex-1 py-1.5 bg-[#0284C7] text-white hover:bg-[#0369A1] rounded-xl text-[9px] font-bold text-center"
                        >
                          Send to LinkedIn
                        </button>
                        <button 
                          onClick={() => {
                            playBeep(700, 'sine', 0.1);
                            triggerPush('💬 WhatsApp Brief Shared: Invite code distributed to student circle.');
                          }}
                          className="flex-1 py-1.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-xl text-[9px] font-bold text-center flex items-center justify-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>WhatsApp Group</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* VIEW F: Chat/Messages Area and Reply Thread Simulator */}
                {phoneView === 'messages' && (
                  <div className="flex-grow flex flex-col pt-3 min-h-[300px]">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      <div className="text-left">
                        <h6 className="text-xs font-bold text-white">Recruitment Brief Support</h6>
                        <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold font-mono">● Direct Signal</span>
                      </div>
                    </div>

                    {/* Chat Messages Frame list */}
                    <div className="flex-grow my-3 space-y-2.5 max-h-[190px] overflow-y-auto pr-0.5 text-left">
                      {sampleChats.map((ch, idx) => (
                        <div key={idx} className={`flex flex-col ${ch.isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-2.5 rounded-xl text-[11px] max-w-[85%] leading-relaxed shadow ${
                            ch.isMe ? 'bg-indigo-650 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                          }`}>
                            <p>{ch.text}</p>
                          </div>
                          <span className="text-[8px] text-slate-500 mt-1 px-1 font-mono">{ch.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chat input keyboard widget bar */}
                    <div className="flex items-center gap-1.5 border-t border-white/5 pt-2">
                      <input 
                        type="text" 
                        value={messagesInput}
                        onChange={(e) => setMessagesInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type messaging thread reply..."
                        className="flex-grow text-xs py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW G: Device Push notifications archive log */}
                {phoneView === 'notifications' && (
                  <div className="flex-grow flex flex-col py-3 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-left">
                      <h6 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Notification Archive</h6>
                      <button 
                        onClick={() => {
                          playBeep(200, 'sine', 0.1);
                          triggerPush('🔔 Device Alert: Push channels active. Test notification triggers in standby loops.');
                        }}
                        className="text-[9px] text-indigo-400 hover:underline"
                      >
                        Send Test Tag
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto text-left">
                      <div className="p-2 bg-white/[0.03] border border-white/5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-indigo-400 font-mono">RECRUITMENT LOG</span>
                          <span className="text-[8px] text-slate-450 font-mono">Just Now</span>
                        </div>
                        <p className="text-[11px] text-white font-semibold mt-0.5">Sophia Chen Shortlisted</p>
                        <p className="text-[10px] text-slate-400">Your candidate pipeline updated successfully.</p>
                      </div>

                      <div className="p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 font-mono">SYSTEM UPDATE</span>
                          <span className="text-[8px] text-slate-450 font-mono">2h ago</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-semibold mt-0.5">Biometric Login Enabled</p>
                        <p className="text-[10px] text-slate-500">Fast login profile keychain activated successfully.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW H: Customer support Ticket Screen */}
                {phoneView === 'support' && (
                  <div className="flex-grow flex flex-col py-3 space-y-3">
                    <div className="text-left border-b border-white/5 pb-2">
                      <h6 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">AttachMe Support Center</h6>
                      <p className="text-[10px] text-slate-400">Create ticket reports, synchronized to database logs.</p>
                    </div>

                    <form onSubmit={handleAddSupportTicket} className="space-y-2 text-left bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono">SUBJECT / TITLE</span>
                        <input 
                          type="text" 
                          required
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          placeholder="What is wrong? e.g. CV parser error"
                          className="w-full text-xs py-1.5 px-2 bg-black/40 border border-white/10 rounded-lg text-white mt-1 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-1.5 bg-indigo-605 hover:bg-indigo-500 text-white rounded text-[10px] font-bold"
                      >
                        Submit Ticket Report
                      </button>
                    </form>

                    <div>
                      <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5 text-left">Submitted Records ({supportTickets.length})</h6>
                      <div className="space-y-1.5">
                        {supportTickets.map((tkt, idx) => (
                          <div key={idx} className="p-2 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between text-left">
                            <div>
                              <p className="text-[10px] font-semibold text-white">{tkt.subject}</p>
                              <p className="text-[8px] text-slate-500">ID: {tkt.id} • {tkt.date}</p>
                            </div>
                            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
                              tkt.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>{tkt.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Native Soft Bottom Bar & Navigation Control Deck */}
              <div className={`absolute bottom-0 inset-x-0 pt-2 pb-5.5 px-3 border-t backdrop-blur-md z-40 ${
                phoneTheme === 'dark' ? 'bg-[#0E0E12]/90 border-white/5 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-800'
              }`}>
                {/* Simulated Bottom Navigation Icons */}
                <div className="flex justify-around items-center h-10">
                  <button 
                    onClick={() => {
                      playBeep(450, 'sine', 0.1);
                      if (user && user.role === 'employer') {
                        setPhoneView('employer_dash');
                      } else {
                        setPhoneView('student_dash');
                      }
                    }} 
                    className={`flex flex-col items-center gap-0.5 transition-colors ${
                      ['student_dash', 'employer_dash'].includes(phoneView) ? 'text-indigo-400' : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="text-[8px] font-mono leading-none">Portal</span>
                  </button>

                  <button 
                    onClick={() => {
                      playBeep(480, 'sine', 0.1);
                      setPhoneView('messages');
                    }}
                    className={`flex flex-col items-center gap-0.5 transition-colors ${
                      phoneView === 'messages' ? 'text-indigo-400' : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[8px] font-mono leading-none">Chats</span>
                  </button>

                  {/* Circle Home/Lock Key */}
                  <button 
                    onClick={() => {
                      playBeep(300, 'triangle', 0.15);
                      setPhoneView('greeting');
                      setScannedSuccess(false);
                    }}
                    className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center hover:bg-slate-800 focus:outline-none relative group ring-1 ring-white/10"
                    title="Home / Lock Screen Button"
                  >
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
                  </button>

                  <button 
                    onClick={() => {
                      playBeep(520, 'sine', 0.1);
                      setPhoneView('notifications');
                    }}
                    className={`flex flex-col items-center gap-0.5 transition-colors relative ${
                      phoneView === 'notifications' ? 'text-indigo-400' : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <span className="text-[8px] font-mono leading-none">Alerts</span>
                    <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 border border-black animate-pulse"></span>
                  </button>

                  <button 
                    onClick={() => {
                      playBeep(550, 'sine', 0.1);
                      setPhoneView('support');
                    }}
                    className={`flex flex-col items-center gap-0.5 transition-colors ${
                      phoneView === 'support' ? 'text-indigo-400' : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-[8px] font-mono leading-none">Support</span>
                  </button>
                </div>

                {/* Simulated Home Indicator bar */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2"></div>
              </div>

            </div>

          </div>

          {/* RIGHT: Production Details & Native Device Controls panel */}
          <div className="col-span-1 lg:col-span-6 space-y-6">
            
            {/* Control Panel widget */}
            <div className="bg-[#0E0E14]/90 border border-white/10 p-6 rounded-3xl backdrop-blur-md text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Smartphone className="h-4.5 w-4.5 text-indigo-400" />
                <span>Emulator Device Parameters</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Network Signal toggle */}
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Device Network Status</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle local state offline caching</p>
                  </div>
                  <button 
                    onClick={() => {
                      playBeep(phoneOnline ? 300 : 700, 'sine', 0.15);
                      setPhoneOnline(!phoneOnline);
                      triggerPush(phoneOnline ? '⚠️ Cached Offline Mode Active: Fallback local state activated.' : '📶 Online Signal Acquired: Synchronizing direct REST API endpoints.');
                    }}
                    className="flex-shrink-0"
                    id="sim-network-toggle"
                  >
                    {phoneOnline ? (
                      <ToggleRight className="h-8 w-8 text-indigo-400 transition-all cursor-pointer" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-500 transition-all cursor-pointer" />
                    )}
                  </button>
                </div>

                {/* 2. Audio Beep feedback selector */}
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Device Audio Driver</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Test real-time tactile speaker</p>
                  </div>
                  <button 
                    onClick={() => {
                      playBeep(1000, 'square', 0.2);
                    }}
                    className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-950 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Ping</span>
                  </button>
                </div>

                {/* 3. Dark/Light Theme Selector */}
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Device Screen Theme</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle light/dark phone body</p>
                  </div>
                  <button 
                    onClick={() => {
                      playBeep(650, 'sine', 0.1);
                      setPhoneTheme(phoneTheme === 'dark' ? 'light' : 'dark');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-705 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    {phoneTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                    <span className="capitalize">{phoneTheme}</span>
                  </button>
                </div>

                {/* 4. Instant push trigger */}
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Manual Push Alert</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Test iOS/Android loop signals</p>
                  </div>
                  <button 
                    onClick={() => {
                      const phrases = [
                        '🎉 New Job Offer: Amazon AWS invited you to a technical placement!',
                        '👥 Candidate Shortlist: sophian.chen added to evaluation database.',
                        '💬 Slack Integration: Client support representative online.',
                        '🔒 Security Verification: Backup session token rotated successfully.'
                      ];
                      const random = phrases[Math.floor(Math.random() * phrases.length)];
                      triggerPush(random);
                    }}
                    className="p-1 px-3 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-650 hover:text-white border border-indigo-500/20 rounded-xl text-xs font-black"
                  >
                    Trigger
                  </button>
                </div>

              </div>

              {/* Support Guidelines details */}
              <div className="mt-5 border-t border-white/5 pt-4">
                <p className="text-xs text-slate-450 leading-relaxed">
                  <span className="text-indigo-400 font-bold">Touch Indicator:</span> Feel free to click around the bottom bar icons (<span className="text-slate-300">Portal, Chats, Alerts, Support</span>), test simulated CV file uploading on the student dashboard, evaluation cart scoring ratings on the employer dashboard, or type a text to the simulated candidate in the messaging dashboard.
                </p>
              </div>

            </div>

            {/* Architecture breakdown panel */}
            <div className="bg-[#0E0E14]/90 border border-white/10 p-6 rounded-3xl backdrop-blur-md text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-[#A78BFA]" />
                <span>Production Mobile Codebase Config</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                We have generated a fully functional Cross-Platform **React Native (Expo + TypeScript)** codebase inside our project tree under `/mobile`. It contains absolute type-safe native API matching configurations, state management, components, and detailed build scripts.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-indigo-500/15 rounded-lg text-indigo-300 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Biometric Credentials Support</span>
                    <span className="text-[11px] text-slate-450 block font-sans">Uses `expo-local-authentication` to hook into Android Keystore & iOS FaceID secure hardware modules.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-indigo-500/15 rounded-lg text-indigo-300 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Offline Cache Recovery System</span>
                    <span className="text-[11px] text-slate-450 block font-sans">Uses `AsyncStorage` / `NetInfo` to cache REST responses with robust automatic reconnect sync hooks.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-indigo-500/15 rounded-lg text-indigo-300 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Push Notification Webhooks</span>
                    <span className="text-[11px] text-slate-450 block font-sans">Includes complete webhook setup code configurations with Expo / Firebase Cloud Messaging (FCM).</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-indigo-400 font-bold font-mono">CODE EXPORT READY</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">Directory: `/mobile`</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
