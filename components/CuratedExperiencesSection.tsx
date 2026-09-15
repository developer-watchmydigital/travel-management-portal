"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Phone,
  MessageCircle,
  Send,
  Compass,
  Check,
  Minus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { CuratedPackage } from "@/lib/types";
import { curatedRegionsList, initialCuratedPackages } from "@/lib/initialData";
import { getStoredPackages } from "@/lib/storage";
import { getPerDayPrice } from "@/lib/pricing";

const ITEMS_PER_PAGE = 8;

export const CuratedExperiencesSection: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("Goa");
  const [packages, setPackages] = useState<CuratedPackage[]>(initialCuratedPackages);
  const [selectedPackage, setSelectedPackage] = useState<CuratedPackage | null>(null);
  const [mounted, setMounted] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isViewAll, setIsViewAll] = useState<boolean>(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    setMounted(true);
    const local = getStoredPackages();
    setPackages(local);

    // Check database API for live updates
    fetch("/api/packages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isSupabaseActive && data?.packages && data.packages.length > 0) {
          setPackages(data.packages);
        }
      })
      .catch(() => {});
  }, []);

  // Sync when storage changes (e.g. from admin)
  useEffect(() => {
    const handleStorage = () => {
      setPackages(getStoredPackages());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Lock scroll when modal is open & listen for escape key
  useEffect(() => {
    if (selectedPackage) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedPackage(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedPackage]);

  // Filter packages for selected region
  const filteredPackages = packages.filter(
    (p) => p.state.toLowerCase() === selectedRegion.toLowerCase()
  );

  const totalPackages = filteredPackages.length;
  const totalPages = Math.max(1, Math.ceil(totalPackages / ITEMS_PER_PAGE));

  // Ensure currentPage is within range
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalPackages);

  const displayedPackages = isViewAll
    ? filteredPackages
    : filteredPackages.slice(startIndex, endIndex);

  const scrollToGridTop = () => {
    const element = document.getElementById("curated-packages-grid");
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setCurrentPage(1);
    setIsViewAll(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setIsViewAll(false);
      scrollToGridTop();
    }
  };

  const handleToggleViewAll = () => {
    const nextState = !isViewAll;
    setIsViewAll(nextState);
    if (!nextState) {
      setCurrentPage(1);
    }
    scrollToGridTop();
  };

  const handleEnquiry = (packageName?: string, destinationName?: string) => {
    setSelectedPackage(null);
    const dest = destinationName || selectedRegion;
    window.dispatchEvent(
      new CustomEvent("select-destination", { detail: { destination: dest } })
    );
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="curated"
      className="py-24 relative bg-white dark:bg-[#070B18] transition-colors duration-300 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#FF5A3C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header matching user's screenshot */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Curated <span className="text-gradient-coral">Experiences</span>
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Explore carefully crafted domestic tours across India&apos;s most stunning regions. Pick a destination below to see detailed day-wise itineraries.
          </p>
        </div>

        {/* State / Region Filter Pills matching user's screenshot */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-14">
          {curatedRegionsList.map((region) => {
            const isActive = selectedRegion.toLowerCase() === region.toLowerCase();
            const hasPackages = packages.some(
              (p) => p.state.toLowerCase() === region.toLowerCase()
            );

            return (
              <button
                key={region}
                type="button"
                onClick={() => handleRegionSelect(region)}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/40 scale-105"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-[#FF5A3C]/40"
                }`}
              >
                <span>{region}</span>
                {hasPackages && (
                  <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-emerald-500"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Packages Grid or Coming Soon View */}
        {filteredPackages.length > 0 ? (
          <div>
            {/* Header info & View All quick toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 px-1">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
                Showing{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {isViewAll ? `all ${totalPackages}` : `${startIndex + 1}–${endIndex}`}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {totalPackages}
                </span>{" "}
                curated experiences in {selectedRegion}
              </p>

              {totalPackages > ITEMS_PER_PAGE && (
                <button
                  type="button"
                  onClick={handleToggleViewAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#FF5A3C] hover:text-[#FF5A3C]"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{isViewAll ? `Show ${ITEMS_PER_PAGE} per page` : `View All (${totalPackages})`}</span>
                </button>
              )}
            </div>

            {/* Packages Grid */}
            <div
              id="curated-packages-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 scroll-mt-24"
            >
              {displayedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-[#0C142E] rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group text-left"
                >
                  {/* Package Image & Top Badges */}
                  <Link
                    href={`/packages/${pkg.id}`}
                    className="block relative h-56 w-full overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
                  >
                    <Image
                      src={imageErrors[pkg.id] ? fallbackImage : pkg.image}
                      alt={pkg.title}
                      fill
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [pkg.id]: true }))
                      }
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 350px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                    {/* Top-Right Duration Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 shadow">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{pkg.duration}</span>
                    </div>

                    {/* Bottom-Left Category Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full bg-gradient-to-r ${
                          pkg.badgeGradient || "from-pink-500 to-rose-500"
                        } text-white text-[11px] font-extrabold shadow`}
                      >
                        {pkg.categoryBadge}
                      </span>
                    </div>
                  </Link>

                  {/* Card Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Route Line */}
                      <p className="flex items-center gap-1 text-xs text-[#FF5A3C] font-bold mb-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{pkg.route}</span>
                      </p>

                      {/* Title */}
                      <Link href={`/packages/${pkg.id}`} className="block">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-[#FF5A3C] transition-colors leading-snug">
                          {pkg.title}
                        </h3>
                      </Link>

                      {/* Subtitle */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 leading-relaxed">
                        {pkg.subtitle}
                      </p>

                      {/* Highlights Bulleted List */}
                      <div className="space-y-1.5 mb-5">
                        {pkg.highlights.slice(0, 3).map((h, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & Actions Row */}
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                      {/* Pricing with Per Day and Total Package Breakdown */}
                      <div className="flex items-center justify-between mb-3.5 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {pkg.originalPrice && (
                              <span className="line-through text-xs text-slate-400 font-semibold">
                                ₹{pkg.originalPrice}
                              </span>
                            )}
                            {pkg.savings && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                                SAVE ₹{pkg.savings}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#FF5A3C] bg-[#FF5A3C]/10 px-2 py-0.5 rounded-md border border-[#FF5A3C]/20 inline-flex items-center w-fit">
                            ₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)} / Day
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Total Package</span>
                          <strong className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                            ₹{pkg.discountedPrice}
                          </strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">/Person</span>
                        </div>
                      </div>

                      {/* Action Buttons: Phone, WhatsApp, View Itinerary */}
                      <div className="flex items-center gap-2">
                        <a
                          href="tel:+919588667027"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#FF5A3C] text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] transition-colors"
                          title="Call Watch My Trip Package Goa"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <a
                          href={`https://wa.me/919588667027?text=Hello%20Watch%20My%20Trip%20Package%20Goa!%20I%20am%20interested%20in%20booking%20the%20${encodeURIComponent(
                            pkg.title
                          )}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="WhatsApp Enquiry"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                        </a>

                        <Link
                          href={`/packages/${pkg.id}`}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs shadow-md shadow-[#FF5A3C]/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <span>View Itinerary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination and View All Controls (when more than 4 packages exist) */}
            {totalPackages > ITEMS_PER_PAGE && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!isViewAll ? (
                  <>
                    {/* Pagination Navigation (Previous, Page Numbers, Next) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={validCurrentPage === 1}
                        onClick={() => handlePageChange(validCurrentPage - 1)}
                        className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          validCurrentPage === 1
                            ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-white/5 text-slate-400"
                            : "cursor-pointer border-slate-200 dark:border-white/10 hover:border-[#FF5A3C] text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] bg-white dark:bg-[#0C142E] shadow-sm"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                              page === validCurrentPage
                                ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/30 scale-105"
                                : "bg-white dark:bg-[#0C142E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#FF5A3C] hover:text-[#FF5A3C]"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={validCurrentPage === totalPages}
                        onClick={() => handlePageChange(validCurrentPage + 1)}
                        className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          validCurrentPage === totalPages
                            ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-white/5 text-slate-400"
                            : "cursor-pointer border-slate-200 dark:border-white/10 hover:border-[#FF5A3C] text-slate-700 dark:text-slate-200 hover:text-[#FF5A3C] bg-white dark:bg-[#0C142E] shadow-sm"
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile & Desktop Expand / View All Button */}
                    <button
                      type="button"
                      onClick={handleToggleViewAll}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-[#FF5A3C] hover:text-white dark:bg-white/5 dark:hover:bg-[#FF5A3C] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-[#FF5A3C] text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>View All ({totalPackages} Packages)</span>
                    </button>
                  </>
                ) : (
                  /* If View All is active, collapse button */
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Showing all {totalPackages} packages in {selectedRegion}.
                    </p>
                    <button
                      type="button"
                      onClick={handleToggleViewAll}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300 dark:border-white/20 text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <Layers className="w-4 h-4 text-[#FF5A3C]" />
                      <span>Collapse to {ITEMS_PER_PAGE} Per Page</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Branded Coming Soon Notice when no packages exist for this region */
          <div className="max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-[#0C142E] border border-amber-200/80 dark:border-amber-500/30 text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
              Service Launching Soon
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-2 mb-3">
              Curated Itineraries for {selectedRegion} Coming Soon!
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto mb-8">
              We are currently curating handpicked premium stays, private cab transfers, and licensed local guide arrangements for <strong>{selectedRegion}</strong>. In the meantime, you can submit an enquiry for private custom itineraries, flight tickets, and hotel bookings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => handleEnquiry(undefined, selectedRegion)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Request Custom Itinerary for {selectedRegion}</span>
              </button>

              <a
                href={`https://wa.me/919588667027?text=Hello%20Watch%20My%20Trip%20Package%20Goa!%20I%20want%20to%20inquire%20about%20a%20custom%20trip%20for%20${encodeURIComponent(
                  selectedRegion
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Day-Wise Itinerary Modal (Portaled directly to document.body) */}
        {mounted && selectedPackage && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedPackage(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/20 shadow-2xl overflow-hidden text-left my-auto"
            >
              {/* High-Contrast Close Button */}
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 text-slate-900 border border-slate-200/90 shadow-lg shadow-black/25 hover:bg-white hover:scale-110 active:scale-95 dark:bg-slate-900/95 dark:text-white dark:border-white/20 dark:hover:bg-slate-800 z-30 transition-all cursor-pointer"
                aria-label="Close itinerary"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto flex-1 p-6">
                {/* Header Image */}
                <div className="relative h-52 sm:h-60 -mx-6 -mt-6 mb-5 overflow-hidden">
                  <Image
                    src={imageErrors[selectedPackage.id] ? fallbackImage : selectedPackage.image}
                    alt={selectedPackage.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
                  <div className="absolute bottom-3 left-6 right-6">
                    <span className="px-2.5 py-0.5 rounded bg-[#FF5A3C] text-xs font-bold text-white shadow-sm">
                      {selectedPackage.duration}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Outfit'] drop-shadow-md">
                      {selectedPackage.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A3C]" />
                      <span>{selectedPackage.route}</span>
                    </p>
                  </div>
                </div>

                {/* Highlights Summary */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                    Package Key Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPackage.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day-by-Day Detailed Itinerary */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF5A3C]" />
                    <span>Day-Wise Tour Itinerary</span>
                  </h4>

                  <div className="space-y-4">
                    {selectedPackage.itinerary.map((day) => (
                      <div
                        key={day.day}
                        className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="w-6 h-6 rounded-full bg-[#FF5A3C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {day.day}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">
                            {day.title}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 pl-8 leading-relaxed">
                          {day.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Package Inclusions
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                      {selectedPackage.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Minus className="w-4 h-4" /> Exclusions
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                      {selectedPackage.exclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#0F172A]/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-xs text-slate-400 font-semibold">
                      ₹{selectedPackage.originalPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      SAVE ₹{selectedPackage.savings}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Starting from{" "}
                    <strong className="text-xl font-black text-slate-900 dark:text-white">
                      ₹{selectedPackage.discountedPrice}
                    </strong>{" "}
                    <span className="text-xs">/Person</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      handleEnquiry(selectedPackage.title, selectedPackage.state)
                    }
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Book Package Enquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/919588667027?text=Hello%20Watch%20My%20Trip%20Package%20Goa!%20I%20want%20to%20book%20the%20${encodeURIComponent(
                      selectedPackage.title
                    )}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs transition-all hover:scale-[1.02] active:scale-95"
                    title="WhatsApp Enquiry"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </section>
  );
};
