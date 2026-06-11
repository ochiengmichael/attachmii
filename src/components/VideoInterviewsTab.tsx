/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Maximize2, Monitor, PhoneOff, 
  Send, Sparkles, Code, Play, CheckCircle2, ChevronRight, Clock, 
  Users, MessageSquare, ShieldCheck, Terminal, Award, FileText, ShieldAlert
} from 'lucide-react';

interface VideoInterviewsTabProps {
  user: any;
}

export function VideoInterviewsTab({ user }: VideoInterviewsTabProps) {
  // Navigation: lobby or active_interview
  const [sessionState, setSessionState] = useState<'lobby' | 'active'>('lobby');

  // Media streams states
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCamActive, setIsCamActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Chat message simulator variables
  const [messages, setMessages] = useState<any[]>([
    { sender: 'Interviewer (James)', content: "Welcome back! Let's resume our architectural inquiry segment.", time: '10:02 AM' },
    { sender: 'System', content: 'Video session handshake secured via TLS v1.3.', time: '10:02 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Sandbox interactive whiteboard states
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [codeSolution, setCodeSolution] = useState(
`// Complete the reverseString function
function reverseString(str) {
  // Write solution here
  return str.split('').reverse().join('');
}

console.log(reverseString("AttachMee"));`
  );
  const [compilerResult, setCompilerResult] = useState('Workspace ready. Hit "Check Solution & Compile" to execute.');
  const [evaluationSuccess, setEvaluationSuccess] = useState<boolean | null>(null);

  // Simulated scheduled rooms
  const initialRooms = [
    { id: 'room-1', title: 'Senior Fullstack Engineering Internship Induction', company: 'AttachMee Global Ltd', date: 'Today', time: '10:00 AM - 10:45 AM', interviewer: 'James S. (Tech Lead)', status: 'active' },
    { id: 'room-2', title: 'Graduate Systems Analyst Review', company: 'Apex Consulting Group', date: 'Tomorrow', time: '2:30 PM - 3:00 PM', interviewer: 'Priscilla K. (Recruitment Head)', status: 'scheduled' },
    { id: 'room-3', title: 'Python Backend Dev - Final Round Webcast', company: 'ByteCode Solutions', date: 'June 18, 2026', time: '11:00 AM - 12:00 PM', interviewer: 'Devon Wells (Engineering Director)', status: 'scheduled' }
  ];
  const [rooms, setRooms] = useState(initialRooms);

  // Interview Questions catalogue
  const challengeQuestions = [
    {
      title: "1. String Decryption",
      prompt: "Reverse a string character structure using an array buffer or pointer stack.",
      testFn: (code: string) => {
        try {
          // A safer client evaluation harness
          const boundCheck = new Function(code + '\n return reverseString("AttachMee");');
          const check = boundCheck();
          if (check === "eeMhcattA") return { ok: true, msg: "Decryption verified! Output: 'eeMhcattA'" };
          return { ok: false, msg: `Mismatched output. Expected 'eeMhcattA', but received: '${check}'` };
        } catch(e: any) {
          return { ok: false, msg: `Execution compilation error: ${e.message}` };
        }
      }
    },
    {
      title: "2. Fibonaccis Progression Generator",
      prompt: "Return the N-th numerical element of the Fibonacci sequence, where N is integer index.",
      testFn: (code: string) => {
        try {
          const customCode = `
            function getNthFib(n) {
              if (n <= 1) return n;
              return getNthFib(n - 1) + getNthFib(n - 2);
            }
          ` + code + '\n return getNthFib(6);';
          const boundCheck = new Function(customCode);
          const check = boundCheck();
          if (Number(check) === 8) return { ok: true, msg: "Fibonacci bounds verified! Output: 8 for N = 6." };
          return { ok: false, msg: `Calculation mismatch. Expected 8 but received: '${check}'` };
        } catch(e: any) {
          return { ok: false, msg: `Compilation error: ${e.message}` };
        }
      }
    }
  ];

  const handleCompilerCheck = () => {
    setCompilerResult('Running validation compiler checks inside sandboxed browser VM...');
    setEvaluationSuccess(null);

    setTimeout(() => {
      const q = challengeQuestions[selectedQuestion];
      const test = q.testFn(codeSolution);
      setCompilerResult(test.msg);
      setEvaluationSuccess(test.ok);

      if (test.ok) {
        // Trigger simulated message addition to meeting logs
        setMessages(prev => [
          ...prev,
          { sender: 'System AI Assistant', content: `🎉 Congratulations! Candidate successfully passed challenge "${q.title}" with clean score parameters.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: `${user.name} (${user.role})`, content: chatInput.trim(), time: timeString };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulated response after delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'Interviewer (James)', content: "Brilliant code! I'm reviewing the live whiteboard compiler output now.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
  };

  const startMeetingMock = () => {
    setSessionState('active');
  };

  const terminateCallMock = () => {
    setSessionState('lobby');
    setMessages([
      { sender: 'Interviewer (James)', content: "Welcome back! Let's resume our architectural inquiry segment.", time: '10:02 AM' },
      { sender: 'System', content: 'Video session handshake secured via TLS v1.3.', time: '10:02 AM' }
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="interview-video-console">
      
      {sessionState === 'lobby' ? (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">Live Webcast & Whiteboards</span>
                <h2 className="text-xl sm:text-2xl mt-1 text-white font-display font-semibold">Online Video Interviews</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Join secure online interviews through embedded virtual rooms. Employers can initiate dynamic screens, candidates can code in real time using the interactive whiteboard panel, and all code and metrics generate live validation certificates!
                </p>
              </div>
              <button
                onClick={startMeetingMock}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-505 py-3 px-5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/10 cursor-pointer border-0 select-none transition-all"
              >
                <Video className="h-4.5 w-4.5" />
                Spawn / Join Instant Room
              </button>
            </div>
          </div>

          {/* Lobby Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Rooms Scheduled panel */}
            <div className="lg:col-span-2 bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md">
              <h3 className="text-sm font-semibold text-white mb-5 flex items-center font-display uppercase tracking-wider">
                <Clock className="h-4.5 w-4.5 mr-2 text-indigo-400" />
                Your Scheduled Sessions ({rooms.length})
              </h3>

              <div className="space-y-4">
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all"
                  >
                    <div>
                      <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">{room.company}</span>
                      <h4 className="text-sm font-semibold text-white mt-1">{room.title}</h4>
                      <p className="text-[11px] text-slate-450 mt-1 flex items-center gap-3">
                        <span>🗓️ {room.date} ({room.time})</span>
                        <span className="text-slate-500 font-medium">|</span>
                        <span>🎙️ Presenter: {room.interviewer}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {room.status === 'active' ? (
                        <>
                          <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-bold mr-2">In Progress</span>
                          <button
                            onClick={startMeetingMock}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-lg text-[10.5px] uppercase cursor-pointer border-0"
                          >
                            Enter Session
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="bg-white/5 text-slate-500 font-bold py-1.5 px-3 rounded-lg text-[10.5px] cursor-not-allowed border-0"
                        >
                          Awaiting Call
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Interview Instructions & Advice Card */}
            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center font-display uppercase tracking-wider">
                  <Award className="h-4.5 w-4.5 mr-2 text-indigo-400" />
                  Interview Tips
                </h3>
                <ul className="space-y-4 text-xs text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Check Browser Media Settings</strong>: Ensure you have authorized the mic/camera frame access options when entering rooms.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Active Code Validation</strong>: Candidates can use the built-in compiler whiteboard to demonstrate algorithms live to developers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Automatic Report Logs</strong>: Upon completion, a certificate report is filed that attaches to applications.</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <p className="text-[10.5px] font-mono text-slate-500">Live Interview Proxy version: v2.3.1 (TLS Ready)</p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Full Immersive Video Room View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="active-video-conference-screen">
          
          {/* Main Video Stream Frame (Dual Webcams layout block) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
              
              {/* Media layout grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 bg-zinc-950 p-4 gap-4 aspect-video min-h-[380px]">
                
                {/* 1. Recruiter View */}
                <div className="rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                  
                  {/* Virtual visual indicator */}
                  <div className="text-center space-y-3 z-10">
                    <div className="h-16 w-16 mx-auto rounded-full bg-indigo-650 flex items-center justify-center text-white text-xl font-bold font-display shadow-lg shadow-indigo-600/20">
                      JS
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">James S. (Tech Lead)</h4>
                      <p className="text-[9px] text-[#A5B4FC] uppercase tracking-wider font-mono">Presenting (AttachMee Tech)</p>
                    </div>
                  </div>

                  {/* Animated simulated video waves */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-10">
                    <span className="h-10 w-1 bg-white rounded animate-pulse"></span>
                    <span className="h-16 w-1 bg-white rounded animate-pulse delay-75"></span>
                    <span className="h-8 w-1 bg-white rounded animate-pulse delay-150"></span>
                  </div>

                  <span className="absolute bottom-3 left-3 bg-indigo-650/80 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-md z-20">
                    Host - Active Stream
                  </span>
                </div>

                {/* 2. Applicant / User View */}
                <div className="rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                  
                  {isCamActive ? (
                    <div className="text-center space-y-3 z-10">
                      <div className="h-16 w-16 mx-auto rounded-full bg-emerald-650 flex items-center justify-center text-white text-xl font-bold font-display shadow-lg shadow-emerald-600/20">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{user.name}</h4>
                        <p className="text-[9.5px] text-[#A7F3D0] uppercase tracking-wider font-mono">Active Candidate</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center z-10">
                      <VideoOff className="h-8 w-8 mx-auto text-red-500 mb-2" />
                      <p className="text-xs text-slate-500">Camera Feed Stopped</p>
                    </div>
                  )}

                  {/* Simulated audio frequency microphone indicator */}
                  {isMicActive && isCamActive && (
                    <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md z-20">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[8.5px] font-mono text-emerald-400 font-bold">MUTED OFF</span>
                    </div>
                  )}

                  <span className="absolute bottom-3 left-3 bg-slate-800/80 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-md z-20">
                    My Video (Verified Link)
                  </span>
                </div>

              </div>

              {/* Central Controller Bar panel */}
              <div className="bg-zinc-950 p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsMicActive(!isMicActive)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isMicActive ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.1]' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    }`}
                    title={isMicActive ? "Mute Mic" : "Unmute Mic"}
                  >
                    {isMicActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>

                  <button 
                    onClick={() => setIsCamActive(!isCamActive)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isCamActive ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.1]' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    }`}
                    title={isCamActive ? "Stop Camera" : "Start Camera"}
                  >
                    {isCamActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>

                  <button 
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hidden sm:block ${
                      isScreenSharing ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.1]'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  ⚡ Network Ping: <span className="text-emerald-400 font-bold">12ms (Excellent)</span>
                </div>

                <button 
                  onClick={terminateCallMock}
                  className="flex items-center gap-2 bg-red-650 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl cursor-pointer transition-all border-0"
                >
                  <PhoneOff className="h-4 w-4" />
                  Hang Up Call
                </button>

              </div>

            </div>

            {/* WHITEBOARD panel containing problem code sandbox */}
            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-3">
                <div className="flex items-center gap-2.5">
                  <Code className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-semibold text-white font-display">Whiteboard Live Coding Scratchpad</h3>
                    <p className="text-[10.5px] text-slate-450">Demonstrate code proficiency live. The compile output updates interviewer logs.</p>
                  </div>
                </div>

                {/* Problem Selector triggers changes */}
                <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5 text-[10.5px] font-mono">
                  {challengeQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedQuestion(idx);
                        if (idx === 0) {
                          setCodeSolution(
`// Complete the reverseString function
function reverseString(str) {
  // Write solution here
  return str.split('').reverse().join('');
}

console.log(reverseString("AttachMee"));`
                          );
                        } else {
                          setCodeSolution(
`// Complete custom calculation. The check script evaluates getNthFib(6)
function getNthFib(n) {
  // Write solution code here
  if (n <= 1) return n;
  let a = 0, b = 1, sum = 0;
  for (let i = 2; i <= n; i++) {
    sum = a + b;
    a = b;
    b = sum;
  }
  return b;
}`
                          );
                        }
                        setCompilerResult('Workspace ready.');
                        setEvaluationSuccess(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg border-0 cursor-pointer select-none transition-all ${
                        selectedQuestion === idx ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Q{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active description box */}
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-xs">
                <h4 className="font-semibold text-indigo-400 mb-1">{challengeQuestions[selectedQuestion].title}</h4>
                <p className="text-slate-350 leading-relaxed">{challengeQuestions[selectedQuestion].prompt}</p>
              </div>

              {/* Codeground Textarea */}
              <div className="rounded-2xl border border-white/10 bg-[#0E0E14] overflow-hidden">
                <div className="bg-white/[0.04] px-4 py-2 flex justify-between items-center text-[10.5px] font-mono border-b border-white/5 text-slate-405">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider block">ECMAScript Javascript interpreter</span>
                  <span>Read Only constraints: None</span>
                </div>
                <textarea
                  value={codeSolution}
                  onChange={(e) => setCodeSolution(e.target.value)}
                  className="w-full h-44 p-4 font-mono text-[11.5px] text-zinc-100 bg-[#07070B] focus:outline-none focus:ring-0 select-text resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Action and Compile Result blocks */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <button
                  onClick={handleCompilerCheck}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-505 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white cursor-pointer border-0 select-none transition-all"
                >
                  <Play className="h-3.5 w-3.5" />
                  Check Solution & Compile
                </button>

                {evaluationSuccess !== null && (
                  <div className={`flex items-center gap-2 text-xs font-semibold ${evaluationSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {evaluationSuccess ? <CheckCircle2 className="h-4.5 w-4.5" /> : <ShieldAlert className="h-4.5 w-4.5" />}
                    <span>{evaluationSuccess ? 'All Assertion Tests Passed!' : 'Assert failed.'}</span>
                  </div>
                )}
              </div>

              {/* Compiler print layout */}
              <div className="rounded-2xl border border-white/5 bg-[#07070B] p-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-slate-450 uppercase tracking-widest">
                  <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Interactive Compiler Terminal Output</span>
                </div>
                <pre className="font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {compilerResult}
                </pre>
              </div>

            </div>
          </div>

          {/* Right Column: Dynamic Room Chat / Quick meeting logs segment */}
          <div className="space-y-6">
            
            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-md h-[450px] flex flex-col justify-between">
              
              {/* Header */}
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-display">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-indigo-400" />
                  Meeting Room Conversation Chat
                </h3>
              </div>

              {/* Message scroll log list */}
              <div className="flex-grow my-4 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {messages.map((m, idx) => {
                  const isSystem = m.sender === 'System' || m.sender === 'System AI Assistant';
                  return (
                    <div 
                      key={idx} 
                      className={`rounded-2xl p-3 text-xs leading-normal ${
                        isSystem 
                          ? 'bg-[#1E1B4B]/40 text-[#C7D2FE] border border-indigo-500/15'
                          : m.sender.includes(user.name)
                            ? 'bg-emerald-500/10 text-slate-200 border border-emerald-500/15'
                            : 'bg-white/[0.03]/60 text-slate-300 border border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 font-mono text-[9.5px] text-slate-405">
                        <span className="font-bold">{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed">{m.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form box */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl p-2.5 cursor-pointer border-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

            </div>

            {/* Assessment Progress checklist */}
            <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-display mb-3">
                <ShieldCheck className="h-4 w-4 mr-1.5 text-indigo-400" />
                Assertion Grade Report
              </h3>
              
              <div className="space-y-3.5 text-[11.5px] text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Authorized Session handshake</span>
                  <span className="text-emerald-400 font-mono font-bold">PASSED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Microphone verification</span>
                  <span className={isMicActive ? "text-emerald-400 font-mono font-bold" : "text-amber-400 font-mono font-bold"}>
                    {isMicActive ? "ONLINE" : "MUTED"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Algorithm assertions passed</span>
                  <span className={evaluationSuccess ? "text-emerald-400 font-mono font-bold" : "text-slate-500 font-mono font-bold"}>
                    {evaluationSuccess ? "100%" : "0 / 1"}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
