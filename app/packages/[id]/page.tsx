"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Compass,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Star,
  Share2,
  Check,
  ChevronRight,
  Send,
  Hotel,
  Car,
  Utensils,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getStoredPackageById, getStoredCompanyInfo, saveLead } from "@/lib/storage";
import { CuratedPackage, CompanyInfo } from "@/lib/types";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id as string;

  const [pkg, setPkg] = useState<CuratedPackage | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  // Booking / Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    travelDate: "",
    travelersCount: "2",
    specialRequests: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCompanyInfo(getStoredCompanyInfo());
      if (packageId) {
        const found = getStoredPackageById(packageId);
        if (found) {
          setPkg(found);
        }
      }
      setLoading(false);
    }
  }, [packageId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.fullName || !bookingForm.phone) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    saveLead({
      type: "package",
      fullName: bookingForm.fullName,
      phone: bookingForm.phone,
      email: bookingForm.email,
      destination: pkg?.state || "Goa",
      packageName: `${pkg?.title} (${pkg?.duration})`,
      travelDate: bookingForm.travelDate,
      travellers: [
        {
          name: bookingForm.fullName,
          age: "30",
          gender: "Not Specified",
        },
      ],
      specialRequirements: `No. of Travelers: ${bookingForm.travelersCount}. Notes: ${bookingForm.specialRequests || "None"}`,
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
    }, 2800);
  };

  const phoneCall = companyInfo?.phones?.[0] || "+91 94272 86755";
  const whatsappNumber = companyInfo?.whatsapp || "919427286755";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Small Daddy Plus! I am interested in booking "${pkg?.title}" (${pkg?.duration}) priced at ₹${pkg?.discountedPrice}. Please share itinerary details and customization options.`
  )}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading tour itinerary...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B18] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 text-[#FF5A3C] flex items-center justify-center mb-6">
            <Compass className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Itinerary Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 leading-relaxed">
            The curated package you requested is unavailable or may have been modified. Browse our other featured destinations or return to homepage.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/#curated"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF5A3C] text-white font-semibold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:bg-[#E04629] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Curated Tours</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate Zig-Zag sequence for detailed inclusions
  let imageCounter = 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B18] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-[#FF5A3C] selection:text-white">
      <Navbar />

      <main className="pt-20 lg:pt-24 pb-20">
        {/* Breadcrumb Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-[#FF5A3C] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/#curated" className="hover:text-[#FF5A3C] transition-colors">
              Curated Tours
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#FF5A3C] font-semibold">{pkg.state}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[200px] sm:max-w-md text-slate-700 dark:text-slate-200">
              {pkg.title}
            </span>
          </nav>
        </div>

        {/* HERO HEADER SECTION WITH BEAUTIFUL COVER IMAGE */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden min-h-[460px] md:min-h-[520px] shadow-2xl flex flex-col justify-end p-6 sm:p-10 lg:p-14 border border-slate-200/60 dark:border-white/10">
            {/* Background Image with Gradient Overlay */}
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              priority
              className="object-cover object-center transform hover:scale-105 transition-transform duration-1000"
            />
            {/* Multi-layered cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-radial-at-t from-transparent via-black/20 to-black/80" />

            {/* Top Badges & Share Action */}
            <div className="relative z-10 flex items-center justify-between gap-4 mb-auto">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${
                    pkg.badgeGradient || "from-pink-500 to-rose-500"
                  }`}
                >
                  {pkg.categoryBadge}
                </span>

                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{pkg.duration}</span>
                </span>

                {pkg.route && (
                  <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-slate-200 border border-white/15">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5A3C]" />
                    <span>{pkg.route}</span>
                  </span>
                )}
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 text-xs font-medium transition-all shadow-md active:scale-95"
                title="Share Itinerary"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>

            {/* Hero Main Content */}
            <div className="relative z-10 mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FF5A3C]/20 border border-[#FF5A3C]/40 text-[#FF5A3C] text-xs font-bold tracking-wider uppercase mb-3 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{pkg.state} Signature Itinerary</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight drop-shadow-md">
                  {pkg.title}
                </h1>

                {pkg.subtitle && (
                  <p className="mt-2.5 text-sm sm:text-base md:text-lg text-slate-200/90 font-light max-w-2xl drop-shadow">
                    {pkg.subtitle}
                  </p>
                )}

                {/* Highlights Pills */}
                {pkg.highlights && pkg.highlights.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {pkg.highlights.map((hl, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-slate-100 text-xs font-medium border border-white/15"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>{hl}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Card & Hero CTAs */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-end gap-4 p-5 sm:p-6 rounded-2xl bg-white/10 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Starting from</span>
                    {pkg.savings && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold text-[11px]">
                        Save ₹{pkg.savings}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
                      ₹{pkg.discountedPrice}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
                        ₹{pkg.originalPrice}
                      </span>
                    )}
                    <span className="text-xs text-slate-300">/ person</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    *Taxes & booking fees included. Customizable.
                  </p>
                </div>

                <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-2 sm:pt-0">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-bold text-sm shadow-xl shadow-[#FF5A3C]/40 hover:shadow-[#FF5A3C]/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Instant Inquiry / Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-lg shadow-[#25D366]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Itinerary</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK KEY FEATURES STRIP */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D142A] border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Duration
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                  {pkg.duration}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D142A] border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Stay Class
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                  Handpicked Deluxe
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D142A] border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Transfers
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                  Private Sanitized Cab
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0D142A] border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Guidance
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                  24/7 Concierge Care
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTENT GRID: LEFT DETAILS (INCLUSIONS + ITINERARY), RIGHT STICKY ENQUIRY */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT 8 COLUMNS: DETAILED INCLUSIONS (ZIG-ZAG / CENTERED) & DAY-BY-DAY ITINERARY */}
          <div className="lg:col-span-8 space-y-16">
            {/* ========================================================================= */}
            {/* SECTION: WHAT IS INCLUDED (ZIG-ZAG FOR PHOTOS, MIDDLE FOR NO-PHOTO) */}
            {/* ========================================================================= */}
            <section id="inclusions" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Included Services & Experiences</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-2">
                    Everything Included in This Package
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {pkg.detailedInclusions?.length || pkg.inclusions?.length || 0} Key Services
                </span>
              </div>

              {/* DETAILED INCLUSIONS CONTAINER */}
              <div className="space-y-10 sm:space-y-12">
                {pkg.detailedInclusions && pkg.detailedInclusions.length > 0 ? (
                  pkg.detailedInclusions.map((item) => {
                    const hasImage = Boolean(item.image && item.image.trim().length > 0);

                    if (hasImage) {
                      // Alternate left/right zig-zag
                      const isEven = imageCounter % 2 === 0;
                      imageCounter++;

                      return (
                        <div
                          key={item.id}
                          className="group relative rounded-3xl bg-white dark:bg-[#0C132B] border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF5A3C]/40"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
                            {/* Text Content */}
                            <div
                              className={`p-6 sm:p-8 md:col-span-7 flex flex-col justify-center ${
                                isEven ? "order-1" : "order-1 md:order-2"
                              }`}
                            >
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A3C]/10 text-[#FF5A3C] text-xs font-bold w-fit mb-3">
                                <Award className="w-3.5 h-3.5" />
                                <span>Included Experience</span>
                              </div>

                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] leading-snug group-hover:text-[#FF5A3C] transition-colors">
                                {item.title}
                              </h3>

                              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                {item.description}
                              </p>

                              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>100% Guaranteed & Included with Package</span>
                              </div>
                            </div>

                            {/* Picture Component */}
                            <div
                              className={`relative h-64 sm:h-72 md:h-full min-h-[260px] md:col-span-5 overflow-hidden ${
                                isEven ? "order-2" : "order-2 md:order-1"
                              }`}
                            >
                              <Image
                                src={item.image!}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // NO PICTURE: RENDER IN THE MIDDLE, NO PICTURE SPACE OR BLANK PLACEHOLDER
                      return (
                        <div
                          key={item.id}
                          className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-white via-slate-50 to-amber-50/30 dark:from-[#0C132B] dark:via-[#090E20] dark:to-[#131B38] border border-amber-300/40 dark:border-amber-500/20 shadow-lg p-6 sm:p-8 text-center sm:text-left transition-all hover:border-[#FF5A3C]/40"
                        >
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A3C] to-amber-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF5A3C]/30">
                              <ShieldCheck className="w-6 h-6" />
                            </div>

                            <div className="flex-1">
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="w-3 h-3" />
                                <span>Complimentary Hospitality Inclusions</span>
                              </div>

                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                                {item.title}
                              </h3>

                              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {item.description}
                              </p>

                              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-4 h-4" />
                                <span>Included at Zero Extra Surcharge</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                ) : (
                  // Fallback if detailedInclusions is not set yet
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(pkg.inclusions || []).map((inc, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white dark:bg-[#0C132B] border border-slate-200 dark:border-white/10 flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{inc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION: DAY-WISE DETAILED ITINERARY TIMELINE */}
            {/* ========================================================================= */}
            <section id="itinerary" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF5A3C]/10 text-[#FF5A3C] text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Day-by-Day Journey Flow</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-2">
                    Detailed Day-Wise Plan
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {pkg.itinerary?.length || 0} Days Planned
                </span>
              </div>

              {/* TIMELINE LIST */}
              <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#FF5A3C] before:via-amber-400 before:to-emerald-400">
                {(pkg.itinerary || []).map((day) => (
                  <div key={day.day} className="relative group">
                    {/* Numbered Node Badge on Vertical Line */}
                    <div className="absolute -left-6 sm:-left-10 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#070B18] border-2 border-[#FF5A3C] flex items-center justify-center text-[11px] font-black text-[#FF5A3C] shadow-md group-hover:scale-110 group-hover:bg-[#FF5A3C] group-hover:text-white transition-all">
                      {day.day}
                    </div>

                    {/* Day Content Card */}
                    <div className="rounded-2xl bg-white dark:bg-[#0C132B] border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-sm group-hover:shadow-md group-hover:border-[#FF5A3C]/30 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FF5A3C]/10 text-[#FF5A3C] font-extrabold text-xs uppercase tracking-wider">
                          Day {day.day}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{pkg.state} Exploration</span>
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                        {day.title}
                      </h3>

                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION: EXCLUSIONS */}
            {/* ========================================================================= */}
            {pkg.exclusions && pkg.exclusions.length > 0 && (
              <section id="exclusions" className="scroll-mt-28">
                <div className="rounded-3xl bg-white dark:bg-[#0C132B] border border-rose-200 dark:border-rose-500/20 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4 text-rose-500">
                    <XCircle className="w-5 h-5" />
                    <h3 className="text-lg font-bold font-['Outfit'] text-slate-900 dark:text-white">
                      Package Exclusions (What is Not Included)
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    We believe in 100% upfront clarity with zero hidden surprises during your travel.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pkg.exclusions.map((exc, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
                      >
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* FAQ & HELP ACCORDION CALLOUT */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-500/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Want to customize this itinerary?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
                  Add extra days, upgrade resorts, include flight tickets from Ahmedabad/Gujarat, or adjust watersport activities according to your family preferences.
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-lg hover:scale-105 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Customize on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: STICKY BOOKING / ENQUIRY CARD (DESKTOP) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#0C132B] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#FF5A3C]">
                    Instant Booking Request
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
                    Lock Best Price
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                    ₹{pkg.discountedPrice}
                  </div>
                  {pkg.originalPrice && (
                    <div className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</div>
                  )}
                </div>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={bookingForm.fullName}
                    onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98250 12345"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={bookingForm.travelDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value })}
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Travelers
                    </label>
                    <select
                      value={bookingForm.travelersCount}
                      onChange={(e) => setBookingForm({ ...bookingForm, travelersCount: e.target.value })}
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    >
                      <option value="1">1 Person (Solo)</option>
                      <option value="2">2 Persons (Couple)</option>
                      <option value="3-4">3-4 Persons (Family)</option>
                      <option value="5+">5+ Persons (Group)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Vegetarian food, airport pickup timing, extra bed..."
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                {formSubmitted ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Inquiry Received! We will call you shortly.</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-bold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Callback & Quote</span>
                  </button>
                )}
              </form>

              {/* Direct Call & WhatsApp Backup */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                <a
                  href={`tel:${phoneCall}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FF5A3C]" />
                  <span>Call Us: {phoneCall}</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Trust Badge */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-[#080D21] border border-slate-100 dark:border-white/5 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Small Daddy Plus Guarantee</span>: 15+ years experience, verified hotels & 24/7 dedicated support.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP MODAL FOR MOBILE / QUICK INQUIRY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0C132B] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="pr-8">
              <span className="text-xs font-bold text-[#FF5A3C] uppercase tracking-wider">
                Booking Inquiry
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                {pkg.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Special Offer: ₹{pkg.discountedPrice} / person ({pkg.duration})
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priykant Gupta"
                  value={bookingForm.fullName}
                  onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 94272 86755"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={bookingForm.travelDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value })}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Travelers
                  </label>
                  <select
                    value={bookingForm.travelersCount}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelersCount: e.target.value })}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Persons</option>
                    <option value="3-4">3-4 Persons</option>
                    <option value="5+">5+ Persons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Any hotel or route preferences..."
                  value={bookingForm.specialRequests}
                  onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070B18] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                />
              </div>

              {formSubmitted ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                  Thank you! We will get in touch with you right away.
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-sm shadow-lg shadow-[#FF5A3C]/30 transition-all"
                >
                  Submit Inquiry
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MOBILE STICKY FLOATING BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090E20]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Offer Price</div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
            ₹{pkg.discountedPrice}
            <span className="text-[10px] font-normal text-slate-400 ml-1">/ person</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-[#25D366] text-white shadow-md shadow-[#25D366]/30"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
          </a>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#FF5A3C] text-white font-bold text-xs shadow-lg shadow-[#FF5A3C]/30"
          >
            Book / Inquire
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
