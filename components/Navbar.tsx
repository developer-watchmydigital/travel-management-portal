"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Package,
  MapPin,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exploreDropdownItems = [
    {
      name: "Curated Tour Packages",
      description: "42+ Handcrafted Tour Itineraries",
      href: "/#curated",
      icon: Package,
      badge: "42 Tours",
      badgeColor: "bg-[#FF5A3C]/15 text-[#FF5A3C] border-[#FF5A3C]/30",
    },
    {
      name: "Top Destinations",
      description: "Beaches, Fortresses & Scenic Islands",
      href: "/#destinations",
      icon: MapPin,
      badge: "Must Visit",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      name: "Guaranteed Services",
      description: "Deluxe Stays, Cruises, Spa & Watersports",
      href: "/#services",
      icon: Sparkles,
      badge: "Included",
      badgeColor: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-[#070B18]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-2xl pt-2.5 pb-4 sm:pt-3 sm:pb-5 lg:pt-3.5 lg:pb-5.5"
          : "bg-gradient-to-b from-black/60 via-black/30 to-transparent pt-3 pb-5 sm:pt-3.5 sm:pb-6 lg:pt-4 lg:pb-7"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-3 lg:gap-6 xl:gap-8">
        {/* Brand: Bird Logo + "Watch my trip package" nestled inside the bird semi-circle with equal margins */}
        <Link href="/" className="flex items-center group shrink-0 select-none">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/favicon.png?v=4"
              alt="Watch my trip package"
              width={64}
              height={64}
              className="w-full h-full object-contain drop-shadow-md"
              priority
            />
          </div>
          <span className="-ml-[11px] sm:-ml-[13px] lg:-ml-[15px] translate-y-[8px] sm:translate-y-[9.5px] lg:translate-y-[11px] relative z-10 text-base sm:text-lg lg:text-xl xl:text-[22px] font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-none group-hover:text-[#FF5A3C] transition-colors whitespace-nowrap">
            Watch my trip <span className="text-[#FF5A3C]">package</span>
          </span>
        </Link>

        {/* Desktop Nav Links - Aligned with brand name height */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 2xl:gap-8 flex-nowrap shrink-0 translate-y-[8px] sm:translate-y-[9.5px] lg:translate-y-[11px]">
          {/* 1. Home */}
          <Link
            href="/#home"
            className="text-[15px] xl:text-base font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] dark:hover:text-[#FF5A3C] transition-colors relative py-1 px-1 whitespace-nowrap shrink-0 group"
          >
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5A3C] transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* 2. Explore Dropdown (Packages, Destinations, Services) */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`inline-flex items-center gap-1.5 text-[15px] xl:text-base font-bold transition-colors py-1 px-1.5 rounded-lg cursor-pointer ${
                dropdownOpen
                  ? "text-[#FF5A3C]"
                  : "text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] dark:hover:text-[#FF5A3C]"
              }`}
              aria-expanded={dropdownOpen}
            >
              <span>Explore & Packages</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-[#FF5A3C]" : "text-slate-400"
                }`}
              />
            </button>

            {/* Dropdown Menu Box */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-white/98 dark:bg-[#0B1124]/98 backdrop-blur-2xl border border-slate-200 dark:border-white/15 shadow-2xl p-2.5 transition-all z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5A3C]">
                    Tour Highlights & Guide
                  </span>
                </div>
                <div className="space-y-1">
                  {exploreDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-[#FF5A3C]/10 text-slate-700 dark:text-slate-300 group-hover:text-[#FF5A3C] flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF5A3C] transition-colors truncate">
                              {item.name}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border shrink-0 ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. About Us */}
          <Link
            href="/#about"
            className="text-[15px] xl:text-base font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] dark:hover:text-[#FF5A3C] transition-colors relative py-1 px-1 whitespace-nowrap shrink-0 group"
          >
            <span>About Us</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5A3C] transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* 4. Why Us */}
          <Link
            href="/#why-us"
            className="text-[15px] xl:text-base font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] dark:hover:text-[#FF5A3C] transition-colors relative py-1 px-1 whitespace-nowrap shrink-0 group"
          >
            <span>Why Us</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5A3C] transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* 5. Contact & Book */}
          <Link
            href="/#contact"
            className="text-[15px] xl:text-base font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] dark:hover:text-[#FF5A3C] transition-colors relative py-1 px-1 whitespace-nowrap shrink-0 group"
          >
            <span>Contact & Book</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5A3C] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Right CTA Actions - Aligned with brand name height */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 flex-nowrap translate-y-[8px] sm:translate-y-[9.5px] lg:translate-y-[11px]">
          {/* Dark / White Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all shrink-0 cursor-pointer shadow-sm"
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
            href="tel:+919588667027"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs xl:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-[#FF5A3C] transition-all shrink-0 whitespace-nowrap shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-[#FF5A3C] shrink-0" />
            <span className="whitespace-nowrap">+91 95886 67027</span>
          </a>

          {/* Plan Journey Primary CTA */}
          <Link
            href="/#contact"
            className="flex items-center gap-1.5 px-4 xl:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-extrabold text-xs xl:text-sm shadow-lg shadow-[#FF5A3C]/35 hover:shadow-[#FF5A3C]/55 hover:scale-[1.03] active:scale-[0.97] transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span className="whitespace-nowrap">Plan Journey</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>

        {/* Mobile & Tablet Hamburger - Aligned with brand name height */}
        <div className="flex lg:hidden items-center gap-2 shrink-0 translate-y-[8px] sm:translate-y-[9.5px]">
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

      {/* Mobile & Tablet Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-4 pb-6 bg-white/98 dark:bg-[#090E20]/98 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Link
              href="/#home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#FF5A3C] font-bold text-base transition-colors"
            >
              Home
            </Link>

            {/* Mobile Dropdown Group */}
            <div className="p-2 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF5A3C]"
              >
                <span>Explore Tours & Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    mobileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileDropdownOpen && (
                <div className="mt-1 space-y-1">
                  {exploreDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 hover:text-[#FF5A3C] font-semibold text-sm transition-colors"
                      >
                        <Icon className="w-4 h-4 text-[#FF5A3C]" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#FF5A3C] font-bold text-base transition-colors"
            >
              About Us
            </Link>

            <Link
              href="/#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#FF5A3C] font-bold text-base transition-colors"
            >
              Why Us
            </Link>

            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#FF5A3C] font-bold text-base transition-colors"
            >
              Contact & Book
            </Link>

            <div className="pt-3 mt-1 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2.5">
              <a
                href="tel:+919588667027"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-200 font-bold hover:text-[#FF5A3C] border border-slate-200 dark:border-white/10 shadow-sm"
              >
                <Phone className="w-4 h-4 text-[#FF5A3C]" />
                <span>Call: +91 95886 67027</span>
              </a>
              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white text-sm font-extrabold shadow-lg shadow-[#FF5A3C]/30"
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
