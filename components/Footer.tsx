"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, Phone, Mail, MapPin, ShieldCheck, Heart, LayoutDashboard, ArrowUp } from "lucide-react";
import { companyData } from "@/lib/initialData";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-100 dark:bg-[#050814] border-t border-slate-200 dark:border-white/10 pt-16 pb-12 relative text-slate-600 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          
          {/* Col 1 & 2: Brand & Story */}
          <div className="lg:col-span-2 text-left">
            <Link href="/#home" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/favicon.png"
                  alt="Watch My Trip Package Goa"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight group-hover:text-[#FF5A3C] transition-colors">
                Watch My Trip Package <span className="text-[#FF5A3C]">Goa</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-sm">
              Dedicated to crafting smooth, memorable, and personalized journeys with 15+ years of trust. Formerly operating as <strong className="text-slate-900 dark:text-white font-semibold">Ranjan Services</strong>, Mehsana.
            </p>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-1.5 flex-wrap">
                <span>Founder: <strong className="text-slate-900 dark:text-white">Masrur Ahmed</strong></span>
                <span>•</span>
                <span>Director: <strong className="text-slate-900 dark:text-white">Masum Ahmed</strong></span>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                15+ Yrs Trust
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#home" className="hover:text-[#FF5A3C] transition-colors">
                  Home & Goa Spotlight
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#FF5A3C] transition-colors">
                  About Us & Story
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#FF5A3C] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/#destinations" className="hover:text-[#FF5A3C] transition-colors">
                  Top Destinations
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="hover:text-[#FF5A3C] transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[#FF5A3C] transition-colors">
                  Book & Inquire
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Key Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Domestic & International Flights</li>
              <li>IRCTC Railway & Tatkal Bookings</li>
              <li>Customized Holiday Itineraries</li>
              <li>Goa & Beach Vacation Packages</li>
              <li>Kashmir, Himachal & Hill Stations</li>
              <li>Pilgrimage & Senior Citizen Yatras</li>
              <li>Dubai, Bali & Maldives Packages</li>
            </ul>
          </div>

          {/* Col 5: Contact Mehsana & Goa */}
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Contact & Bookings
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 dark:text-slate-300">
                  {companyData.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF5A3C] shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+919588667027" className="text-slate-800 dark:text-slate-200 hover:text-[#FF5A3C] font-semibold">
                    +91 95886 67027 <span className="text-[10px] text-amber-500 font-bold">(Direct & WhatsApp)</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <a href="mailto:info@rtravelworld.com" className="text-slate-600 dark:text-slate-300 hover:text-[#FF5A3C]">
                  info@rtravelworld.com
                </a>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-white/5">
                <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                  Instagram
                </span>
                <a
                  href="https://instagram.com/watchmytrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 dark:text-slate-200 hover:text-[#FF5A3C] font-semibold text-xs"
                >
                  @watchmytrip
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © {new Date().getFullYear()} WATCH MY TRIP PACKAGE GOA. All rights reserved. Registered in Mehsana, Gujarat.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
