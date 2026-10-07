"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<UserProfile | null>;
  sendPhoneOtp: (phoneNumber: string, elementId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, code: string) => Promise<UserProfile | null>;
  loginWithDemo: (name: string, contact: string) => UserProfile;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = "wmt_user_session_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check saved local session first
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(USER_SESSION_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Local session error:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || fbUser.phoneNumber || "Traveler",
          email: fbUser.email || "",
          phoneNumber: fbUser.phoneNumber || "",
          photoURL: fbUser.photoURL || undefined,
        };
        setUser(profile);
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveUserSession = (profile: UserProfile | null) => {
    setUser(profile);
    if (typeof window !== "undefined") {
      if (profile) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(USER_SESSION_KEY);
      }
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Traveler",
        email: fbUser.email || "",
        phoneNumber: fbUser.phoneNumber || "",
        photoURL: fbUser.photoURL || undefined,
      };
      saveUserSession(profile);
      setIsAuthModalOpen(false);
      return profile;
    } catch (error: any) {
      console.error("Google Auth error:", error);
      throw error;
    }
  };

  const sendPhoneOtp = async (phoneNumber: string, elementId: string): Promise<ConfirmationResult> => {
    if (typeof window === "undefined") throw new Error("Window object missing.");
    const recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {},
    });
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/[^0-9]/g, "")}`;
    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return confirmation;
  };

  const confirmPhoneOtp = async (confirmationResult: ConfirmationResult, code: string): Promise<UserProfile | null> => {
    const result = await confirmationResult.confirm(code);
    const fbUser = result.user;
    const profile: UserProfile = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || `Traveler ${fbUser.phoneNumber?.slice(-4)}`,
      email: fbUser.email || "",
      phoneNumber: fbUser.phoneNumber || "",
      photoURL: fbUser.photoURL || undefined,
    };
    saveUserSession(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const loginWithDemo = (name: string, contact: string): UserProfile => {
    const isEmail = contact.includes("@");
    const profile: UserProfile = {
      uid: "usr-" + Date.now(),
      displayName: name.trim() || "Traveler",
      email: isEmail ? contact.trim() : `${contact.replace(/[^0-9]/g, "")}@watchmytrip.com`,
      phoneNumber: !isEmail ? contact.trim() : "+91 98250 12345",
      isDemo: true,
    };
    saveUserSession(profile);
    setIsAuthModalOpen(false);
    return profile;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("SignOut error:", e);
    }
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        sendPhoneOtp,
        confirmPhoneOtp,
        loginWithDemo,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
