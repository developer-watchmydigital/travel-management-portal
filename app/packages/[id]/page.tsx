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
  Camera,
  ChevronLeft,
  Download,
  Maximize2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getStoredPackageById, getStoredCompanyInfo, saveLead } from "@/lib/storage";
import { CuratedPackage, CompanyInfo } from "@/lib/types";
import { getPerDayPrice, getPerDayPriceNumber, calculateTravelersTotal } from "@/lib/pricing";

export default function PackageDetailPage({ params: propParams }: { params?: { id?: string } }) {
  const clientParams = useParams();
  const router = useRouter();
  const packageId = (clientParams?.id as string) || (propParams?.id as string) || "";

  const [pkg, setPkg] = useState<CuratedPackage | null>(() => (packageId ? getStoredPackageById(packageId) || null : null));
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(() => getStoredCompanyInfo());
  const [loading, setLoading] = useState(() => (packageId && getStoredPackageById(packageId) ? false : true));
  const [copiedShare, setCopiedShare] = useState(false);
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);

  // 3-Room Photos Lightbox Modal State
  const [roomLightbox, setRoomLightbox] = useState<{
    isOpen: boolean;
    serviceTitle: string;
    images: string[];
    activeIndex: number;
  } | null>(null);

  // Booking / Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    travelDate: "",
    travelersCount: "2",
    customTravelers: "",
    specialRequests: "",
  });

  const numTravelers =
    bookingForm.travelersCount === "custom"
      ? Math.max(1, parseInt(bookingForm.customTravelers || "1", 10) || 1)
      : parseInt(bookingForm.travelersCount || "1", 10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCompanyInfo(getStoredCompanyInfo());
      if (packageId) {
        const found = getStoredPackageById(packageId);
        if (found) {
          setPkg(found);
          setLoading(false);
        }
        // Check API in case package was updated or added in database
        fetch("/api/packages")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.packages) {
              const livePkg = data.packages.find((p: CuratedPackage) => p.id === packageId);
              if (livePkg) {
                setPkg(livePkg);
              }
            }
          })
          .catch(() => { })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [packageId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryLightboxIndex !== null && pkg?.galleryImages) {
        if (e.key === "ArrowRight") {
          setGalleryLightboxIndex((prev) =>
            prev !== null && pkg.galleryImages ? (prev + 1) % pkg.galleryImages.length : null
          );
        } else if (e.key === "ArrowLeft") {
          setGalleryLightboxIndex((prev) =>
            prev !== null && pkg.galleryImages
              ? (prev - 1 + pkg.galleryImages.length) % pkg.galleryImages.length
              : null
          );
        } else if (e.key === "Escape") {
          setGalleryLightboxIndex(null);
        }
      }
      if (roomLightbox && roomLightbox.isOpen) {
        if (e.key === "ArrowRight") {
          setRoomLightbox((prev) =>
            prev ? { ...prev, activeIndex: (prev.activeIndex + 1) % prev.images.length } : null
          );
        } else if (e.key === "ArrowLeft") {
          setRoomLightbox((prev) =>
            prev
              ? {
                ...prev,
                activeIndex: (prev.activeIndex - 1 + prev.images.length) % prev.images.length,
              }
              : null
          );
        } else if (e.key === "Escape") {
          setRoomLightbox(null);
        }
      }
      if (isFlyerModalOpen && e.key === "Escape") {
        setIsFlyerModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryLightboxIndex, isFlyerModalOpen, roomLightbox, pkg]);

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

    const calculatedTotal = calculateTravelersTotal(pkg?.discountedPrice || "0", numTravelers);
    const perDay = getPerDayPrice(pkg?.discountedPrice || "0", pkg?.duration || "4 Days");
    const perDayNum = getPerDayPriceNumber(pkg?.discountedPrice || "0", pkg?.duration || "4 Days");
    const groupDaily = (perDayNum * numTravelers).toLocaleString("en-IN");

    const leadPayload = {
      type: "package" as const,
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
      specialRequirements: `Travelers: ${numTravelers} ${numTravelers === 1 ? "Person" : "Persons"}. Daily Rate: ₹${groupDaily}/Day (₹${perDay} per person). Total Tour Cost: ₹${calculatedTotal}. Notes: ${bookingForm.specialRequests || "None"}`,
    };

    saveLead(leadPayload);

    // Asynchronously send to server API for central Supabase storage
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadPayload),
    }).catch((e) => console.error("Supabase lead sync error:", e));

    // Automatically launch WhatsApp with pre-filled booking details
    const waPhone = companyInfo?.whatsapp || "919588667027";
    const inquiryWhatsAppText = `*New Booking Request - Watch My Trip Package*%0A%0A*Package:* ${encodeURIComponent(
      pkg?.title || ""
    )} (${encodeURIComponent(pkg?.duration || "")})%0A*Total Tour Cost:* ₹${encodeURIComponent(
      calculatedTotal
    )} (${numTravelers} ${numTravelers === 1 ? "Person" : "Persons"} @ ₹${encodeURIComponent(
      pkg?.discountedPrice || ""
    )}/person)%0A*Daily Rate:* ₹${encodeURIComponent(
      groupDaily
    )}/day (${numTravelers} ${numTravelers === 1 ? "Person" : "Persons"} @ ₹${encodeURIComponent(
      perDay
    )}/person/day)%0A*Name:* ${encodeURIComponent(bookingForm.fullName)}%0A*Phone:* ${encodeURIComponent(
      bookingForm.phone
    )}%0A*Email:* ${encodeURIComponent(
      bookingForm.email || "N/A"
    )}%0A*Travel Date:* ${encodeURIComponent(
      bookingForm.travelDate || "Flexible"
    )}%0A*Total Travelers:* ${numTravelers}%0A*Special Notes:* ${encodeURIComponent(bookingForm.specialRequests || "None")}`;

    const directWhatsAppUrl = `https://wa.me/${waPhone}?text=${inquiryWhatsAppText}`;
    if (typeof window !== "undefined") {
      window.open(directWhatsAppUrl, "_blank");
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
    }, 3000);
  };

  const phoneCall = companyInfo?.phones?.[0] || "+91 95886 67027";
  const whatsappNumber = companyInfo?.whatsapp || "919588667027";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Watch My Trip Package! I am interested in booking "${pkg?.title}" (${pkg?.duration}) priced at ₹${pkg?.discountedPrice}. Please share itinerary details and customization options.`
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${pkg.badgeGradient || "from-pink-500 to-rose-500"
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

              {/* Top Badges & Share / Flyer Actions */}
              <div className="flex items-center gap-2">
                {pkg.flyerImage && (
                  <button
                    onClick={() => setIsFlyerModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-extrabold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="View Official Promotional Flyer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Official Flyer</span>
                  </button>
                )}

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
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

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-amber-300 text-xs font-bold mt-1.5">
                    <span>₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)} / Day</span>
                    <span>•</span>
                    <span>{pkg.duration}</span>
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

                  <a
                    href={`tel:${phoneCall}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300" />
                    <span>Call Direct: {phoneCall}</span>
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

              {/* Dynamic Promotional Flyer Banner Callout */}
              {pkg.flyerImage && (
                <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-400/40 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3.5 text-center sm:text-left">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5A3C] to-amber-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FF5A3C]/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF5A3C]">
                        Verified Promotional Offer Available
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {pkg.title} • ₹{pkg.discountedPrice} {pkg.originalPrice ? `(Save ₹${pkg.savings})` : ""}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {pkg.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFlyerModalOpen(true)}
                    className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white text-xs font-bold shadow-md shadow-[#FF5A3C]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    View Official Flyer
                  </button>
                </div>
              )}

              {/* DETAILED INCLUSIONS CONTAINER */}
              <div className="space-y-10 sm:space-y-12">
                {pkg.detailedInclusions && pkg.detailedInclusions.length > 0 ? (
                  pkg.detailedInclusions.map((item, itemIdx) => {
                    const hasMultipleImages = Boolean(item.images && item.images.length > 1);
                    const hasImage = Boolean(hasMultipleImages || (item.image && item.image.trim().length > 0));
                    const isEven = itemIdx % 2 === 0;
                    const itemImageList = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);

                    return (
                      <div
                        key={item.id || itemIdx}
                        className="group relative rounded-3xl bg-white dark:bg-[#0C132B] border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF5A3C]/40"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch">
                          {/* Text Content */}
                          <div
                            className={`p-6 sm:p-8 flex flex-col justify-between ${hasImage
                                ? isEven
                                  ? "md:col-span-7 order-1"
                                  : "md:col-span-7 order-1 md:order-2"
                                : "md:col-span-12 order-1"
                              }`}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF5A3C] to-[#FF8C6B] text-white text-[11px] font-black tracking-wider uppercase shadow-sm">
                                  <Award className="w-3.5 h-3.5" />
                                  <span>
                                    Service {String(itemIdx + 1).padStart(2, "0")} of{" "}
                                    {String(pkg.detailedInclusions?.length || 8).padStart(2, "0")}
                                  </span>
                                </span>

                                {item.category && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                                    {item.category}
                                  </span>
                                )}

                                {hasMultipleImages && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold border border-amber-500/30">
                                    <Camera className="w-3 h-3" />
                                    <span>3 Room Photos</span>
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] leading-snug group-hover:text-[#FF5A3C] transition-colors">
                                {item.title}
                              </h3>

                              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>100% Guaranteed & Included with Package</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                #0{itemIdx + 1}
                              </span>
                            </div>
                          </div>

                          {/* Picture Component: 3 Room Photos Collage or Single Photo */}
                          {hasMultipleImages ? (
                            <div
                              className={`p-3 bg-slate-900 flex flex-col justify-between ${isEven
                                  ? "md:col-span-5 order-2"
                                  : "md:col-span-5 order-2 md:order-1"
                                }`}
                            >
                              {/* Primary Room Photo */}
                              <div
                                onClick={() =>
                                  setRoomLightbox({
                                    isOpen: true,
                                    serviceTitle: item.title,
                                    images: itemImageList,
                                    activeIndex: 0,
                                  })
                                }
                                className="relative h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group/mainphoto border border-white/10 shadow-md"
                              >
                                <Image
                                  src={itemImageList[0]}
                                  alt={`${item.title} - Main Room Photo`}
                                  fill
                                  unoptimized
                                  sizes="(max-width: 768px) 100vw, 40vw"
                                  className="object-cover group-hover/mainphoto:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover/mainphoto:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/mainphoto:opacity-100">
                                  <div className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-xl">
                                    <Maximize2 className="w-3.5 h-3.5 text-[#FF5A3C]" />
                                    <span>Expand All 3 Room Photos</span>
                                  </div>
                                </div>
                                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                                  <Camera className="w-3 h-3 text-[#FF5A3C]" />
                                  <span>Room Photo 1</span>
                                </div>
                              </div>

                              {/* 2 Supporting Room Photos */}
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {itemImageList.slice(1, 3).map((rImg, rIdx) => (
                                  <div
                                    key={rIdx}
                                    onClick={() =>
                                      setRoomLightbox({
                                        isOpen: true,
                                        serviceTitle: item.title,
                                        images: itemImageList,
                                        activeIndex: rIdx + 1,
                                      })
                                    }
                                    className="relative h-20 sm:h-24 rounded-xl overflow-hidden cursor-pointer group/subphoto border border-white/10"
                                  >
                                    <Image
                                      src={rImg}
                                      alt={`${item.title} - Room Photo ${rIdx + 2}`}
                                      fill
                                      unoptimized
                                      sizes="(max-width: 768px) 50vw, 20vw"
                                      className="object-cover group-hover/subphoto:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover/subphoto:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/subphoto:opacity-100">
                                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-semibold text-white">
                                      Room Photo {rIdx + 2}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-2 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRoomLightbox({
                                      isOpen: true,
                                      serviceTitle: item.title,
                                      images: itemImageList,
                                      activeIndex: 0,
                                    })
                                  }
                                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Click Photo to Expand (3 Room Photos in Box)</span>
                                </button>
                              </div>
                            </div>
                          ) : hasImage ? (
                            <div
                              onClick={() =>
                                setRoomLightbox({
                                  isOpen: true,
                                  serviceTitle: item.title,
                                  images: itemImageList,
                                  activeIndex: 0,
                                })
                              }
                              className={`relative h-64 sm:h-72 md:h-auto min-h-[260px] overflow-hidden bg-slate-900 cursor-pointer group/single ${isEven
                                  ? "md:col-span-5 order-2"
                                  : "md:col-span-5 order-2 md:order-1"
                                }`}
                            >
                              <Image
                                src={item.image!}
                                alt={item.title}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover object-center group-hover/single:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                                <Camera className="w-3 h-3 text-[#FF5A3C]" />
                                <span>Verified Photo</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(pkg.inclusions || []).map((inc, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white dark:bg-[#0C132B] border border-slate-200 dark:border-white/10 flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {inc}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION: 6-PHOTO VISUAL EXPERIENCE GALLERY */}
            {/* ========================================================================= */}
            {pkg.galleryImages && pkg.galleryImages.length > 0 && (
              <section id="gallery" className="scroll-mt-28">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Experience Highlights</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-2">
                      Captivating Tour Moments & Sights
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Get a vivid glimpse of the scenic coastlines, luxury stays, exciting island adventures, and sunset cruises included in your tour. Tap any photo to expand.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                    6 Curated Moments
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  {pkg.galleryImages.slice(0, 6).map((imgUrl, gIdx) => (
                    <div
                      key={gIdx}
                      onClick={() => setGalleryLightboxIndex(gIdx)}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#FF5A3C]/60"
                      title="Click to expand photo in full resolution"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Experience photo ${gIdx + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <span className="self-end p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm shadow-md">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-extrabold text-white tracking-wide">
                          Moment {String(gIdx + 1).padStart(2, "0")} / 06
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold mb-1">
                    ₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)} / Day
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                    ₹{pkg.discountedPrice}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
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
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons</option>
                      <option value="3">3 Persons</option>
                      <option value="4">4 Persons</option>
                      <option value="5">5 Persons</option>
                      <option value="custom">Custom Travelers...</option>
                    </select>
                  </div>
                </div>

                {bookingForm.travelersCount === "custom" && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D21] border border-slate-200 dark:border-white/10">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter Number of Travelers *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      placeholder="e.g. 8"
                      value={bookingForm.customTravelers}
                      onChange={(e) => setBookingForm({ ...bookingForm, customTravelers: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C1226] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                )}

                {/* Dynamic Price Calculation Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-orange-500/20 dark:border-orange-500/30">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Selected Travelers:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {numTravelers} {numTravelers === 1 ? "Person" : "Persons"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Daily Breakdown:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{(getPerDayPriceNumber(pkg.discountedPrice, pkg.duration) * numTravelers).toLocaleString("en-IN")} / Day
                      {numTravelers > 1 && (
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)} × {numTravelers})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-orange-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Total Package Cost:
                    </span>
                    <span className="text-base font-extrabold text-[#FF5A3C] font-['Outfit']">
                      ₹{calculateTravelersTotal(pkg.discountedPrice, numTravelers)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 text-right">
                    (₹{pkg.discountedPrice} × {numTravelers} {numTravelers === 1 ? "Person" : "Persons"})
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
                  <span className="font-bold text-slate-700 dark:text-slate-300">Watch My Trip Package Guarantee</span>: 3+ years experience, verified hotels & 24/7 dedicated support.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP MODAL FOR OFFICIAL FLYER LIGHTBOX */}
      {isFlyerModalOpen && pkg.flyerImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsFlyerModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white dark:bg-[#0C132B] rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl overflow-hidden p-4 sm:p-6 my-auto text-left transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Verified Promotional Flyer
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                  {pkg.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFlyerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Close"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Flyer Image Preview */}
            <div className="relative w-full aspect-[3/4] max-h-[65vh] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-inner">
              <Image
                src={pkg.flyerImage}
                alt={`${pkg.title} Official Promotional Flyer`}
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Flyer Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
              <a
                href={pkg.flyerImage}
                download={`${pkg.title.replace(/[^a-zA-Z0-9_-]/g, "-")}-Flyer.jpeg`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-white/10 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Flyer Image</span>
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${phoneCall}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FF5A3C]" />
                  <span>Call</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-md shadow-[#25D366]/30 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR 6-MOMENT EXPERIENCE GALLERY LIGHTBOX */}
      {galleryLightboxIndex !== null && pkg.galleryImages && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setGalleryLightboxIndex(null)}
        >
          {(() => {
            const galleryList = (pkg.galleryImages || []).slice(0, 6);
            return (
              <div
                className="relative max-w-5xl w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Bar: Counter & Close */}
                <div className="w-full flex items-center justify-between text-white pb-3 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#FF5A3C]" />
                    <span className="text-xs sm:text-sm font-bold">
                      Moment {galleryLightboxIndex + 1} of {galleryList.length}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">• {pkg.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryLightboxIndex(null)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Close Lightbox (Esc)"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Image View */}
                <div className="relative w-full aspect-[16/10] max-h-[72vh] rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-2xl">
                  <Image
                    src={galleryList[galleryLightboxIndex] || galleryList[0]}
                    alt={`Moment image ${galleryLightboxIndex + 1}`}
                    fill
                    priority
                    className="object-contain"
                  />

                  {/* Prev Arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryLightboxIndex(
                        (galleryLightboxIndex - 1 + galleryList.length) % galleryList.length
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-lg"
                    title="Previous Moment (Left Arrow)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Next Arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryLightboxIndex(
                        (galleryLightboxIndex + 1) % galleryList.length
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-lg"
                    title="Next Moment (Right Arrow)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Thumbnails Strip */}
                <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto max-w-full py-1">
                  {galleryList.map((tImg, tIdx) => (
                    <button
                      type="button"
                      key={tIdx}
                      onClick={() => setGalleryLightboxIndex(tIdx)}
                      className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${galleryLightboxIndex === tIdx
                          ? "border-[#FF5A3C] scale-105 shadow-md shadow-[#FF5A3C]/40"
                          : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      title={`Moment ${tIdx + 1}`}
                    >
                      <Image src={tImg} alt={`thumb ${tIdx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* POPUP MODAL FOR 3-ROOM PHOTOS LIGHTBOX (ALL THREE IN SAME BOX) */}
      {roomLightbox && roomLightbox.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setRoomLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#0C132B] rounded-3xl border border-white/20 shadow-2xl p-4 sm:p-6 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4 text-[#FF5A3C]" />
                <span className="text-xs sm:text-sm font-bold">
                  {roomLightbox.serviceTitle}
                </span>
                <span className="text-xs text-amber-400 font-semibold ml-2">
                  (Photo {roomLightbox.activeIndex + 1} of {roomLightbox.images.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRoomLightbox(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Main Image Box */}
            <div className="relative w-full aspect-[16/10] max-h-[65vh] rounded-2xl overflow-hidden bg-black border border-white/15 shadow-inner">
              <Image
                src={roomLightbox.images[roomLightbox.activeIndex]}
                alt={`Room Photo ${roomLightbox.activeIndex + 1}`}
                fill
                priority
                unoptimized
                className="object-contain"
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={() =>
                  setRoomLightbox((prev) =>
                    prev
                      ? {
                        ...prev,
                        activeIndex:
                          (prev.activeIndex - 1 + prev.images.length) % prev.images.length,
                      }
                      : null
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
                title="Previous Room Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() =>
                  setRoomLightbox((prev) =>
                    prev
                      ? {
                        ...prev,
                        activeIndex: (prev.activeIndex + 1) % prev.images.length,
                      }
                      : null
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
                title="Next Room Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* All 3 Room Photos Thumbnails Inside Same Box */}
            <div className="mt-4 flex items-center justify-center gap-3 w-full">
              {roomLightbox.images.map((thumbUrl, tIdx) => (
                <button
                  type="button"
                  key={tIdx}
                  onClick={() =>
                    setRoomLightbox((prev) => (prev ? { ...prev, activeIndex: tIdx } : null))
                  }
                  className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden transition-all border-2 cursor-pointer ${roomLightbox.activeIndex === tIdx
                      ? "border-[#FF5A3C] scale-105 shadow-lg shadow-[#FF5A3C]/40"
                      : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  title={`View Room Photo ${tIdx + 1}`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`Room thumbnail ${tIdx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-bold">
                    Room {tIdx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                  ₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)} / Day
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total: ₹{pkg.discountedPrice} / person ({pkg.duration})
                </span>
              </div>
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
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="5">5 Persons</option>
                    <option value="custom">Custom Travelers...</option>
                  </select>
                </div>
              </div>

              {bookingForm.travelersCount === "custom" && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080D21] border border-slate-200 dark:border-white/10">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Number of Travelers *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    placeholder="e.g. 8"
                    value={bookingForm.customTravelers}
                    onChange={(e) => setBookingForm({ ...bookingForm, customTravelers: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0C1226] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>
              )}

              {/* Dynamic Price Calculation Box */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-orange-500/20 dark:border-orange-500/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Selected Travelers:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {numTravelers} {numTravelers === 1 ? "Person" : "Persons"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Daily Breakdown:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{(getPerDayPriceNumber(pkg.discountedPrice, pkg.duration) * numTravelers).toLocaleString("en-IN")} / Day
                    {numTravelers > 1 && (
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        (₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)} × {numTravelers})
                      </span>
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-orange-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Total Package Cost:
                  </span>
                  <span className="text-base font-extrabold text-[#FF5A3C] font-['Outfit']">
                    ₹{calculateTravelersTotal(pkg.discountedPrice, numTravelers)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 text-right">
                  (₹{pkg.discountedPrice} × {numTravelers} {numTravelers === 1 ? "Person" : "Persons"})
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090E20]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 p-3 shadow-2xl flex items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{getPerDayPrice(pkg.discountedPrice, pkg.duration)}/Day
            </span>
            <span className="text-[10px] text-slate-400">• Total:</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Outfit'] leading-tight">
            ₹{pkg.discountedPrice}
            <span className="text-[10px] font-normal text-slate-400 ml-1">/ person</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Call Button (Replacing Flyer Button as requested) */}
          <a
            href={`tel:${phoneCall}`}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm transition-colors"
            title={`Call Direct: ${phoneCall}`}
          >
            <Phone className="w-4 h-4 text-[#FF5A3C]" />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-[#25D366] text-white shadow-md shadow-[#25D366]/30 transition-transform active:scale-95"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </a>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF5A3C] text-white font-bold text-xs shadow-lg shadow-[#FF5A3C]/30 hover:bg-[#E04629] transition-all"
          >
            Inquire Now
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
