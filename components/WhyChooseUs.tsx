"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Star,
  Clock,
  HeartHandshake,
  Sparkles,
  Award,
  Headphones,
  CheckCircle,
} from "lucide-react";
import { MagicBentoCard } from "./ui/MagicBentoCard";
import { ReviewsSection } from "./ReviewsSection";

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: <Award className="w-6 h-6 text-[#FF5A3C]" />,
      title: "3+ Years of Industry Trust",
      desc: "A rich legacy of over a decade and a half serving thousands of happy travelers across India with integrity.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-amber-400" />,
      title: "Leadership Assurance",
      desc: "Personalized attention and direct honest consultation with founder Masrur Ahmed & director Masum Ahmed for every major booking.",
    },
    {
      icon: <Headphones className="w-6 h-6 text-emerald-400" />,
      title: "24/7 On-Trip Assistance",
      desc: "We stand by your side from the moment you leave home until your safe return, resolving any travel disruptions instantly.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-sky-400" />,
      title: "No Hidden Costs",
      desc: "100% transparent pricing with clear itemized inclusions, zero surprise charges, and special discounted airfares.",
    },
  ];

  return (
    <section id="why-us" className="py-24 relative bg-white dark:bg-[#090E20] transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-xs font-bold text-[#FF5A3C] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Travelers Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Crafting Extraordinary <span className="text-gradient-coral">Travel Experiences</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            We don&apos;t just sell tickets and tour packages; we build lifelong memories and enduring customer relationships.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((p, idx) => (
            <MagicBentoCard
              key={idx}
              className="p-6 flex flex-col justify-between"
              glowColor="rgba(255, 90, 60, 0.2)"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.desc}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="w-3 h-3" /> Guaranteed Commitment
              </div>
            </MagicBentoCard>
          ))}
        </div>

        {/* Dedicated Goa & Hotel Small Daddy Plus Review System */}
        <ReviewsSection />

      </div>
    </section>
  );
};
