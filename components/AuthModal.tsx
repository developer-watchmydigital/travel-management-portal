"use client";

import React, { useState } from "react";
import { X, ArrowRight, CheckCircle2, AlertTriangle, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationResult } from "firebase/auth";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithGoogle,
    sendPhoneOtp,
    confirmPhoneOtp,
    loginWithDemo,
  } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isQuickDemo, setIsQuickDemo] = useState(false);

  const [demoName, setDemoName] = useState("");
  const [demoContact, setDemoContact] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleClick = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google Login error:", err);
      if (err?.code === "auth/api-key-not-valid" || err?.message?.includes("API key")) {
        setErrorMsg("Firebase API key not configured yet. Use Quick Demo Login below!");
        setIsQuickDemo(true);
      } else {
        setErrorMsg(err?.message || "Google Sign-In failed. Try Quick Login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const confirmation = await sendPhoneOtp(phoneNumber, "recaptcha-container");
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      setErrorMsg(err?.message || "OTP send failed. You can use Quick Demo Login below!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !confirmationResult) {
      setErrorMsg("Please enter the 6-digit OTP received on your phone.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationResult, otpCode);
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      setErrorMsg("Invalid OTP code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoContact.trim()) {
      setErrorMsg("Please enter your name and phone number.");
      return;
    }
    loginWithDemo(demoName, demoContact);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div id="recaptcha-container"></div>
      
      {/* Luxury Dark Sanctuary Card matching the reference screenshot */}
      <div className="relative w-full max-w-[440px] bg-[#121214] border border-[#D4A373]/35 rounded-[28px] shadow-2xl shadow-black/90 overflow-hidden my-6">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4A373] text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md font-serif">
              W
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif leading-none">
                Guest Login <span className="font-sans text-xs text-slate-400 font-normal">/ Signup</span>
              </h3>
              <p className="text-[11px] font-semibold text-[#D4A373] mt-0.5">
                Watch My Trip Package
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body Content */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Welcome Headline */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-[26px] font-bold text-white font-serif tracking-tight">
              Welcome to Sanctuary
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Log in to manage appointments, earn membership rewards & track refunds.
            </p>
          </div>

          {/* Quick Demo Form View */}
          {isQuickDemo ? (
            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4A373] bg-[#D4A373]/10 px-2.5 py-1 rounded-full border border-[#D4A373]/20">
                  ⚡ Quick Demo Login Mode
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D4A373] uppercase tracking-wider mb-1.5">
                  YOUR FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masum Ahmed"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1C1C22] border border-[#2D2D38] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4A373]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D4A373] uppercase tracking-wider mb-1.5">
                  MOBILE NUMBER OR EMAIL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 95886 67027"
                  value={demoContact}
                  onChange={(e) => setDemoContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1C1C22] border border-[#2D2D38] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4A373]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D4A373] via-[#C58B55] to-[#B06E35] text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-[#D4A373]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ENTER AS GUEST / DEMO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsQuickDemo(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-[#D4A373] underline pt-1"
              >
                Switch back to OTP Verification
              </button>
            </form>
          ) : (
            /* Standard Mobile OTP Verification Form */
            <div>
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#D4A373] uppercase tracking-wider mb-2">
                      MOBILE NUMBER (OTP VERIFICATION)
                    </label>
                    
                    <div className="flex rounded-2xl overflow-hidden border border-[#2D2D38] focus-within:border-[#D4A373] transition-colors">
                      <div className="bg-[#1C1C22] px-4 py-3 text-slate-300 font-bold text-sm border-r border-[#2D2D38] flex items-center shrink-0">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-[#1C1C22] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D4A373] via-[#C58B55] to-[#B06E35] text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-[#D4A373]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? "SENDING OTP..." : "SEND OTP & CONTINUE"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#D4A373] uppercase tracking-wider mb-2">
                      ENTER 6-DIGIT OTP CODE
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-3 text-center tracking-[0.3em] font-mono text-lg font-bold rounded-2xl bg-[#1C1C22] border border-[#2D2D38] text-slate-100 focus:outline-none focus:border-[#D4A373]"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                      Sent to +91 {phoneNumber}{" "}
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[#D4A373] underline ml-1"
                      >
                        Edit Number
                      </button>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D4A373] via-[#C58B55] to-[#B06E35] text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-[#D4A373]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? "VERIFYING..." : "VERIFY OTP & CONTINUE"}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider: OR CONTINUE WITH */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-[#121214] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleClick}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#1C1C22] hover:bg-[#25252E] border border-[#2D2D38] text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Connecting Google..." : "Continue with Google"}</span>
          </button>

          {/* Quick Demo Access Toggle */}
          {!isQuickDemo && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsQuickDemo(true)}
                className="text-[11px] text-slate-400 hover:text-[#D4A373] transition-colors"
              >
                Need quick demo access? <span className="text-[#D4A373] underline font-semibold">Click here for Instant Guest Access</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Policy Disclaimer */}
          <p className="text-[11px] text-slate-500 text-center leading-relaxed pt-2">
            By logging in, you agree to Watch My Trip Privacy Terms &amp; Cancellation Refund Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
