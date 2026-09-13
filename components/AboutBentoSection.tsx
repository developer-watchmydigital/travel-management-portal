"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Compass,
  HeartHandshake,
  Eye,
  ArrowRight,
  Sparkles,
  Quote,
} from "lucide-react";
import { MagicBentoCard } from "./ui/MagicBentoCard";

export const AboutBentoSection: React.FC = () => {
  const expertiseList = [
    "Domestic & International Flight Tickets",
    "Affordable Airfares & Special Fares",
    "Customized Tour Packages (Group & Family)",
    "Railway Tour Planning & IRCTC Bookings",
    "Complete Holiday & Hotel Arrangements",
    "24/7 Personalized Travel Assistance",
  ];

  return (
    <section id="about" className="py-24 relative bg-white dark:bg-[#070B18] transition-colors duration-300 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FF5A3C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-xs font-bold text-[#FF5A3C] uppercase tracking-wider mb-3"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>About R Travel World</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight"
          >
            Your Journey, <span className="text-gradient-coral">Our Responsibility</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed"
          >
            Founded by <strong className="text-slate-900 dark:text-white font-semibold">Priykant Gupta</strong>, with nearly{" "}
            <strong className="text-[#FF5A3C] font-semibold">15+ years of trusted experience</strong> (formerly{" "}
            <strong className="text-slate-900 dark:text-white font-semibold">Ranjan Services</strong>), we craft journeys built on honesty, flawless execution, and unforgettable memories.
          </motion.p>
        </div>

        {/* Magic Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

          {/* Tile 1: Founder's Story & Trust Legacy (Large Bento Tile - 7 Cols) */}
          <MagicBentoCard className="lg:col-span-7 p-8 flex flex-col justify-between" glowColor="rgba(255, 90, 60, 0.2)">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 text-[#FF5A3C]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A3C]">
                    Founder & Managing Director
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Priykant Gupta
                  </h3>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                <strong className="text-slate-900 dark:text-white font-semibold">R TRAVEL WORLD</strong> is a trusted and customer-focused travel enterprise dedicated to making every journey smooth, comfortable, affordable, and memorable.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Before establishing R TRAVEL WORLD, we successfully operated under the name{" "}
                <span className="text-slate-900 dark:text-white font-semibold">Ranjan Services</span> in Mehsana, gaining valuable experience and deep-rooted relationships across Gujarat and India.
              </p>

              {/* Quote from Founder */}
              <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 relative">
                <Quote className="w-6 h-6 text-[#FF5A3C]/40 absolute top-3 right-3" />
                <p className="text-xs sm:text-sm italic text-slate-800 dark:text-slate-200 pr-8">
                  &ldquo;Their trust and continued support are our greatest achievements and the motivation behind everything we do.&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">100% Verified Services</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Honest Guidance & Best Service</span>
              </div>
            </div>
          </MagicBentoCard>

          {/* Tile 2: Dual Key Stats Cards (5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Stat 1: 15+ Years */}
            <MagicBentoCard className="p-6 flex items-center gap-5" glowColor="rgba(245, 158, 11, 0.2)">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-baseline gap-1">
                  15+ <span className="text-base font-semibold text-amber-500 dark:text-amber-400">Years</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  Industry experience delivering unwavering trust & satisfaction.
                </p>
              </div>
            </MagicBentoCard>

            {/* Stat 2: 25,000+ Travelers */}
            <MagicBentoCard className="p-6 flex items-center gap-5" glowColor="rgba(255, 90, 60, 0.2)">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-[#FF5A3C]" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-baseline gap-1">
                  25,000+ <span className="text-base font-semibold text-[#FF5A3C]">Served</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  Satisfied customers happily served with tailor-made journeys.
                </p>
              </div>
            </MagicBentoCard>
          </div>

          {/* Tile 3: Visual Parallax Gallery Bento (4 Cols) */}
          <MagicBentoCard className="lg:col-span-4 p-4 flex flex-col justify-between overflow-hidden" glowColor="rgba(13, 148, 136, 0.25)">
            <div className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden mb-4">
              <Image
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop"
                alt="Tropical Beach Resort"
                fill
                className="object-cover hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-[11px] font-bold text-white">
                  Handpicked Stays
                </span>
                <p className="text-xs font-semibold text-white mt-1">
                  Luxury Beachside & Hill Resorts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-24 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=400&auto=format&fit=crop"
                  alt="Limestone Islands"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="relative h-24 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop"
                  alt="Road Trips & Adventures"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          </MagicBentoCard>

          {/* Tile 4: Our Expertise (4 Cols) */}
          <MagicBentoCard className="lg:col-span-4 p-6" glowColor="rgba(255, 90, 60, 0.2)">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-[#FF5A3C]/15 text-[#FF5A3C]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Our Expertise</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              We understand that every traveler has distinct needs and budgets. Our key focus areas include:
            </p>
            <ul className="space-y-2.5">
              {expertiseList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </MagicBentoCard>

          {/* Tile 5: Our Vision & Commitment (4 Cols) */}
          <MagicBentoCard className="lg:col-span-4 p-6 flex flex-col justify-between" glowColor="rgba(245, 158, 11, 0.25)">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500 dark:text-amber-400">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Our Vision</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                To establish R TRAVEL WORLD as a revered name in tourism, known for transparent guidance, competitive pricing, and cherished memories.
              </p>

              {/* Commitment Box */}
              <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 mt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF5A3C]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Our Commitment</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every booking represents a relationship built on trust. We give our 100% while maintaining absolute transparency.
                </p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
              <Link
                href="#contact"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#FF5A3C]/30 hover:scale-[1.02] transition-transform"
              >
                <span>Plan Your Journey With Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </MagicBentoCard>

        </div>
      </div>
    </section>
  );
};
