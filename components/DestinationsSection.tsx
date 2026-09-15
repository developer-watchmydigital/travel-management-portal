"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import { Destination } from "@/lib/types";
import { destinationsData } from "@/lib/initialData";
import { MagicBentoCard } from "./ui/MagicBentoCard";

export const DestinationsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"india" | "international">("india");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedDestination) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedDestination(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedDestination]);

  const handleEnquiryClick = (destName: string) => {
    setSelectedDestination(null);
    window.dispatchEvent(
      new CustomEvent("select-destination", { detail: { destination: destName } })
    );
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800&auto=format&fit=crop";

  const filteredDestinations = destinationsData.filter(
    (d) => d.category === activeTab
  );

  return (
    <section id="destinations" className="py-24 relative bg-slate-50 dark:bg-[#070B18] transition-colors duration-300 overflow-hidden">
      {/* Background illumination */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#FF5A3C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Title & Filter Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-xs font-bold text-[#FF5A3C] uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Where We Take You</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Top <span className="text-gradient-coral">Destinations</span>
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl">
              From the spiritual heritage of Gujarat to the snowy peaks of Kashmir and the serene beaches of Goa and the Maldives.
            </p>
          </div>

          {/* Interactive Category Switcher matching screenshot 4 */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 backdrop-blur-md self-start md:self-auto">
            <button
              onClick={() => setActiveTab("india")}
              className={`relative px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === "india"
                  ? "text-white shadow-lg shadow-[#FF5A3C]/40"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeTab === "india" && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-[#FF5A3C] rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Explore India ({destinationsData.filter(d => d.category === "india").length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("international")}
              className={`relative px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === "international"
                  ? "text-white shadow-lg shadow-[#FF5A3C]/40"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {activeTab === "international" && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-[#FF5A3C] rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Out of India ({destinationsData.filter(d => d.category === "international").length})
              </span>
            </button>
          </div>
        </div>

        {/* 3D Destinations Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
        >
          <AnimatePresence>
            {filteredDestinations.map((dest) => (
              <motion.div
                key={dest.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <MagicBentoCard
                  onClick={() => setSelectedDestination(dest)}
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer p-0"
                  glowColor="rgba(255, 90, 60, 0.3)"
                >
                  {/* Destination Photo */}
                  <Image
                    src={imageErrors[dest.id] ? fallbackImage : dest.image}
                    alt={dest.name}
                    fill
                    onError={() => setImageErrors((prev) => ({ ...prev, [dest.id]: true }))}
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 350px"
                  />

                  {/* Multi-step Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                  {/* Top Badge: Featured if applicable */}
                  {dest.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2 py-0.5 rounded bg-[#FF5A3C] text-[10px] font-extrabold text-white uppercase tracking-wider shadow">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Bottom Text Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-left">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5A3C] mb-0.5">
                      {dest.tagline}
                    </p>
                    <h3 className="text-lg font-bold text-white font-['Outfit'] drop-shadow leading-snug">
                      {dest.name}
                    </h3>
                    
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-2">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" /> {dest.duration}
                      </span>
                      <span className="text-[11px] font-semibold text-[#FF5A3C] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </MagicBentoCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Selected Destination Quick Detail Modal via Portal to avoid stacking context overrides */}
        {mounted && selectedDestination && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedDestination(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/20 shadow-2xl overflow-hidden text-left my-auto"
            >
              {/* Close Button - Guaranteed 100% visible in both Light and Dark themes over any background */}
              <button
                type="button"
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 text-slate-900 border border-slate-200/90 shadow-lg shadow-black/25 hover:bg-white hover:scale-110 active:scale-95 dark:bg-slate-900/95 dark:text-white dark:border-white/20 dark:hover:bg-slate-800 z-30 transition-all cursor-pointer"
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* Modal Image Header */}
                <div className="relative h-48 sm:h-56 -mx-6 -mt-6 mb-5 overflow-hidden">
                  <Image
                    src={imageErrors[selectedDestination.id] ? fallbackImage : selectedDestination.image}
                    alt={selectedDestination.name}
                    fill
                    onError={() => setImageErrors((prev) => ({ ...prev, [selectedDestination.id]: true }))}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
                  <div className="absolute bottom-3 left-6 right-6">
                    <span className="px-2.5 py-0.5 rounded bg-[#FF5A3C] text-xs font-bold text-white shadow-sm">
                      {selectedDestination.tagline}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Outfit'] drop-shadow-md">
                      {selectedDestination.name}
                    </h3>
                  </div>
                </div>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs font-medium">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold">
                    Duration: <strong className="text-slate-900 dark:text-white">{selectedDestination.duration}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold">
                    Service Launching Soon
                  </span>
                </div>

                {/* Service Availability / Notice Box with Direct CTA */}
                <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="block text-amber-800 dark:text-amber-400 font-bold mb-1">
                      Service Status Notice:
                    </strong>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      We currently do not provide scheduled tour package services for <strong>{selectedDestination.name}</strong>, but will be launching this service soon! In the meantime, you can submit an enquiry for private custom itineraries, flight tickets, and hotel arrangements.
                    </p>
                    {/* Direct In-Notice CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleEnquiryClick(selectedDestination.name)}
                      className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs shadow-md shadow-[#FF5A3C]/25 transition-all hover:scale-105 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enquire for Custom Tour / Tickets</span>
                    </button>
                  </div>
                </div>

                {/* Key Attractions / Highlights */}
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                    Package Highlights & Sightseeing
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDestination.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer - Always visible and sticky */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#0F172A]/90 backdrop-blur-sm flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEnquiryClick(selectedDestination.name)}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span>Submit Custom Enquiry for {selectedDestination.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/919588667027?text=Hello%20Small%20Daddy%20Plus!%20I%20want%20to%20inquire%20about%20a%20trip%20for%20${encodeURIComponent(
                    selectedDestination.name
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      </div>
    </section>
  );
};
