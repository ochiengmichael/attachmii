/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Trash2, KeyRound, Shield, CheckCircle2, Lock, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { api } from '../api.js';

interface SafetyTabProps {
  user: any;
  setView: (view: string) => void;
}

export function SafetyTab({ user, setView }: SafetyTabProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorText, setErrorText] = useState('');

  // Password modify state variables
  const [newPassword, setNewPassword] = useState('');
  const [pinSent, setPinSent] = useState(false);
  const [receivedPin, setReceivedPin] = useState('');
  const [resetPinInput, setResetPinInput] = useState('');

  // Account deletion security confirmations
  const [confirmUnlinkRecs, setConfirmUnlinkRecs] = useState(false);
  const [confirmFilesPurge, setConfirmFilesPurge] = useState(false);
  const [confirmAuditPurge, setConfirmAuditPurge] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');

  const targetPhrase = "DELETE MY ACCOUNT";

  const handleRequestPin = async () => {
    setLoading(true);
    setErrorText('');
    setSuccessMsg('');
    try {
      const res = await api.forgotPassword(user.email);
      setReceivedPin(res.pin);
      setPinSent(true);
      setSuccessMsg(`A security authorization reset PIN (${res.pin}) has been successfully generated in system simulation!`);
    } catch (err: any) {
      setErrorText(err.message || 'Verification system request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinInput || !newPassword) {
      setErrorText('Please enter the verification PIN and new password.');
      return;
    }
    setLoading(true);
    setErrorText('');
    setSuccessMsg('');
    try {
      await api.resetPassword({
        email: user.email,
        pin: resetPinInput,
        newPassword
      });
      setSuccessMsg('Your secret account password has been updated and locked successfully.');
      setResetPinInput('');
      setNewPassword('');
      setPinSent(false);
      setReceivedPin('');
    } catch (err: any) {
      setErrorText(err.message || 'Mismatched or invalid PIN code entered.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountCascade = async () => {
    if (!confirmUnlinkRecs || !confirmFilesPurge || !confirmAuditPurge) {
      setErrorText('You must check and confirm all cascading deletion conditions to proceed.');
      return;
    }
    if (confirmPhrase.trim().toUpperCase() !== targetPhrase) {
      setErrorText(`Please type "${targetPhrase}" exactly to authorize account deletion.`);
      return;
    }

    setLoading(true);
    setErrorText('');
    setSuccessMsg('');

    try {
      const res = await api.deleteAccount();
      alert(res.message || 'Account successfully deleted.');
      
      // Clear token and reload/redirect
      api.clearToken();
      window.dispatchEvent(new Event('attachme_unauthorized'));
      setView('auth');
      window.location.reload();
    } catch (err: any) {
      setErrorText(err.message || 'Cascade deletion failed due to server error.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="security-control-centre">
      
      <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center font-display mb-2">
          <Shield className="h-5.5 w-5.5 mr-2 text-emerald-400" />
          AttachMee Security & Control Centre
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Manage system compliance settings, update secure passwords, or purge accounts. 
          Our cascade account clearing protocol ensures absolutely no residual data, cookies, logs, or file transcripts are left on developer systems.
        </p>
      </div>

      {successMsg && (
        <div className="bg-[#064E3B]/30 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Success Action Message</span>
          </div>
          <p className="text-slate-300">{successMsg}</p>
          {receivedPin && (
            <div className="flex items-center justify-between bg-white/[0.04] p-2.5 rounded-xl border border-white/5 font-mono text-white tracking-widest mt-1">
              <span className="font-bold">{receivedPin}</span>
              <button 
                type="button"
                onClick={() => setResetPinInput(receivedPin)}
                className="text-[10px] uppercase font-sans tracking-tight bg-indigo-600 hover:bg-indigo-500 font-bold py-1 px-2.5 rounded-lg border-0 cursor-pointer text-white"
              >
                Copy PIN
              </button>
            </div>
          )}
        </div>
      )}

      {errorText && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Passwords change card */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center font-display mb-4">
              <KeyRound className="h-4.5 w-4.5 mr-2 text-indigo-400" />
              Credentials Rotation
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Rotate your account password regularly. For safety, this requires triggering an email PIN validation code.
            </p>

            {!pinSent ? (
              <div className="space-y-4">
                <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 font-sans text-xs">
                  <span className="text-slate-450 font-mono block mb-1">Target Authorized Email</span>
                  <span className="text-white font-mono font-medium">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs uppercase tracking-wider font-bold text-white transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate Security Auth PIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Verification PIN</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 582910"
                    value={resetPinInput}
                    onChange={(e) => setResetPinInput(e.target.value)}
                    className="w-full mt-1.5 text-center text-sm font-bold tracking-widest font-mono rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">New Secret Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setPinSent(false); setReceivedPin(''); }}
                    className="w-1/3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs py-2.5 font-bold cursor-pointer transition-all border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 font-bold uppercase tracking-wider cursor-pointer transition-all border-0"
                  >
                    Lock Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Account Cascade Deletion Card */}
        <div className="bg-[#0E0E14]/90 rounded-3xl border border-red-500/10 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-red-400 flex items-center font-display mb-4">
              <Trash2 className="h-4.5 w-4.5 mr-2 text-red-500" />
              Cascade Purge Account Entirely
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This triggers a 256-bit safe deletion process that cleans up storage disks, unlinks attachment transcripts, and deletes messages and trace audits.
            </p>

            <div className="space-y-3.5 mb-6">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmUnlinkRecs}
                  onChange={(e) => setConfirmUnlinkRecs(e.target.checked)}
                  className="rounded border-white/10 bg-white/[0.04] text-red-600 focus:ring-red-500 h-4.5 w-4.5 mt-0.5 cursor-pointer"
                />
                <span className="text-[11.5px] text-slate-300 leading-normal">
                  Purge my personal database record, jobs applications, and saved bookmarks cascade from JSON database.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmFilesPurge}
                  onChange={(e) => setConfirmFilesPurge(e.target.checked)}
                  className="rounded border-white/10 bg-white/[0.04] text-red-600 focus:ring-red-500 h-4.5 w-4.5 mt-0.5 cursor-pointer"
                />
                <span className="text-[11.5px] text-slate-300 leading-normal">
                  Permanently delete linked resume transcripts, academics scorecards, and cover files from the host server.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmAuditPurge}
                  onChange={(e) => setConfirmAuditPurge(e.target.checked)}
                  className="rounded border-white/10 bg-white/[0.04] text-red-600 focus:ring-red-500 h-4.5 w-4.5 mt-0.5 cursor-pointer"
                />
                <span className="text-[11.5px] text-slate-300 leading-normal">
                  Clear activity logs, chat text caches, and cookies so that absolutely no trace is preserved.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Confirm Action Phrase</label>
              <input
                type="text"
                placeholder='Type "DELETE MY ACCOUNT"'
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                className="w-full mt-1.5 text-xs rounded-xl border border-white/10 bg-white/[0.04] py-2.5 px-3.5 text-white placeholder-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleDeleteAccountCascade}
              disabled={loading || !confirmUnlinkRecs || !confirmFilesPurge || !confirmAuditPurge || confirmPhrase !== targetPhrase}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-650 hover:bg-red-600 text-white py-3 text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
            >
              <Trash2 className="h-4 w-4" />
              Erase My Profile and Safe Cache Completely
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
