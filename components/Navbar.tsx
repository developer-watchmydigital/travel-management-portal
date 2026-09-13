"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Compass, ShieldCheck, Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Top Destinations", href: "#destinations" },
    { name: "Why Us", href: "#why-us" },
    { name: "Contact & Book", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 dark:bg-[#070B18]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="#home" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF5A3C] via-[#FF7844] to-[#F59E0B] p-0.5 shadow-lg shadow-[#FF5A3C]/30 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white dark:bg-[#090E20] rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-[#FF5A3C] group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                R TRAVEL <span className="text-[#FF5A3C]">WORLD</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide flex items-center gap-1">
              <span>Your Journey, Our Responsibility</span>
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#FF5A3C] dark:hover:text-[#FF5A3C] transition-colors relative py-1 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5A3C] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Dark / White Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all"
            title={`Switch to ${theme === "dark" ? "White" : "Dark"} Theme`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Quick Call Pill */}
          <a
            href="tel:+919427286755"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#FF5A3C]" />
            <span>+91 94272 86755</span>
          </a>

          {/* Plan Journey Primary CTA */}
          <Link
            href="#contact"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-semibold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:shadow-[#FF5A3C]/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Plan Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-4 pb-6 bg-white/98 dark:bg-[#090E20]/98 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-xl">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#FF5A3C] font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
              <a
                href="tel:+919427286755"
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-200 font-medium hover:text-[#FF5A3C]"
              >
                <Phone className="w-4 h-4 text-[#FF5A3C]" />
                <span>Call: +91 94272 86755</span>
              </a>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#FF5A3C] text-white text-sm font-semibold shadow-md"
              >
                <span>Plan Your Journey With Us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
