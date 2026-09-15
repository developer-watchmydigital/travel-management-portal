"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plane,
  Train,
  Users,
  Briefcase,
  Compass,
  MapPin,
  HeartHandshake,
  Sparkles,
  Sun,
  Building2,
  Car,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { servicesData } from "@/lib/initialData";
import { MagicBentoCard } from "./ui/MagicBentoCard";

export const ServicesBentoSection: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case "Plane":
        return <Plane className="w-5 h-5 text-[#FF5A3C]" />;
      case "Train":
        return <Train className="w-5 h-5 text-amber-400" />;
      case "Users":
        return <Users className="w-5 h-5 text-sky-400" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case "Compass":
        return <Compass className="w-5 h-5 text-emerald-400" />;
      case "MapPin":
        return <MapPin className="w-5 h-5 text-[#FF5A3C]" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-5 h-5 text-rose-400" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case "Sun":
        return <Sun className="w-5 h-5 text-amber-300" />;
      case "Building2":
        return <Building2 className="w-5 h-5 text-teal-400" />;
      case "Car":
        return <Car className="w-5 h-5 text-orange-400" />;
      default:
        return <Compass className="w-5 h-5 text-[#FF5A3C]" />;
    }
  };

  return (
    <section id="services" className="py-24 relative bg-slate-50 dark:bg-[#090E20] transition-colors duration-300 overflow-hidden">
      {/* Ambient background illumination */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#FF5A3C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

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
            <span>What We Do</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight"
          >
            Comprehensive <span className="text-gradient-coral">Travel Services</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed"
          >
            From domestic and international air ticketing to IRCTC railway planning, luxury stays, and customized holiday packages, we handle every detail with precision.
          </motion.p>
        </div>

        {/* Dynamic Bento Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {servicesData.map((service, idx) => {
            // Give hero service cards a prominent 2-column span on large screens
            const isFeatured = idx === 0 || idx === 1 || idx === 6;

            return (
              <MagicBentoCard
                key={service.id}
                className={`group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-500 ${
                  isFeatured ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                }`}
                glowColor={
                  idx % 3 === 0
                    ? "rgba(255, 90, 60, 0.25)"
                    : idx % 3 === 1
                    ? "rgba(245, 158, 11, 0.25)"
                    : "rgba(13, 148, 136, 0.25)"
                }
              >
                {/* Background Ambient Photo with Smooth Zoom on Hover */}
                <div className="absolute inset-0 z-0 overflow-hidden opacity-25 group-hover:opacity-40 transition-opacity duration-500">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/40 dark:from-[#090E20] dark:via-[#090E20]/80 dark:to-transparent transition-colors duration-300" />
                </div>

                {/* Content Area */}
                <div className="relative z-10">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100/90 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-sm">
                      {getIcon(service.iconName)}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/15 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2 group-hover:text-[#FF5A3C] transition-colors flex items-center gap-1.5">
                    <span>{service.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF5A3C]" />
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                    {service.shortDesc}
                  </p>

                  {/* Feature description for expanded cards */}
                  {isFeatured && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed hidden sm:block border-l-2 border-[#FF5A3C]/60 pl-2.5 mt-2">
                      {service.fullDesc}
                    </p>
                  )}
                </div>

                {/* Bottom Quick Action */}
                <div className="relative z-10 mt-5 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Direct Assistance
                  </span>
                  <Link
                    href={`#contact`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A3C] hover:text-[#E04629] dark:hover:text-white transition-colors group-hover:underline"
                  >
                    <span>Enquire Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </MagicBentoCard>
            );
          })}
        </div>

        {/* Trust Highlight Banner below services */}
        <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-slate-200/60 via-[#FF5A3C]/10 to-slate-200/60 dark:from-white/5 dark:via-[#FF5A3C]/10 dark:to-white/5 border border-slate-300/80 dark:border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Need a specialized or customized itinerary?</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Speak directly with Masrur Ahmed & Masum Ahmed for honest guidance, tailored domestic or international departures, and group bookings.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+919588667027"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-semibold text-xs tracking-wide transition-all shadow-sm"
            >
              Call Us: +91 95886 67027
            </a>
            <Link
              href="#contact"
              className="px-5 py-2.5 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-semibold text-xs tracking-wide shadow-lg shadow-[#FF5A3C]/30 transition-all"
            >
              Plan Your Journey Now
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
