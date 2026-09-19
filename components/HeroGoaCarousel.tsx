"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowRight,
  Star,
  MessageCircle,
} from "lucide-react";
import { goaCarouselSlides } from "@/lib/initialData";
import { getStoredHeroBanners } from "@/lib/storage";
import { HeroBannerSlide } from "@/lib/types";

export const HeroGoaCarousel: React.FC = () => {
  const [slides, setSlides] = useState<HeroBannerSlide[]>(goaCarouselSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Load banners on mount and listen to real-time updates from admin
  useEffect(() => {
    // 1. Initial local load
    const stored = getStoredHeroBanners();
    if (stored && stored.length > 0) {
      setSlides(stored);
    }

    // 2. Fetch from API with local fallback
    fetch("/api/banners")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          setSlides(data.banners);
        }
      })
      .catch(() => {});

    // 3. Listen to live updates from admin across tabs and in-page
    const handleBannersUpdate = (e: CustomEvent<HeroBannerSlide[]>) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setSlides(e.detail);
      } else {
        setSlides(getStoredHeroBanners());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wmt_hero_banners_v1") {
        setSlides(getStoredHeroBanners());
      }
    };

    window.addEventListener("banners-updated", handleBannersUpdate as EventListener);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("banners-updated", handleBannersUpdate as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Safe slide count
  const slideCount = slides.length > 0 ? slides.length : goaCarouselSlides.length;

  // Auto-play timer (every 5.5 seconds)
  useEffect(() => {
    if (isPaused || slideCount === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slideCount]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -75) {
      prevSlide();
    }
  };

  const activeSlide: HeroBannerSlide = slides[currentIndex] || slides[0] || goaCarouselSlides[0];

  return (
    <section
      id="home"
      className="relative min-h-[85vh] sm:min-h-[90vh] md:min-h-0 lg:min-h-screen flex items-center justify-center pt-24 sm:pt-28 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-14 lg:pb-16 overflow-hidden bg-slate-50 dark:bg-[#070B18] transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Carousel Visuals with Smooth Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover object-center brightness-90 dark:brightness-60 filter"
              sizes="100vw"
            />
            {/* Multi-layered Vignette & Glow Gradients for Light and Dark */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 via-slate-50/70 to-slate-50/90 dark:from-[#070B18] dark:via-[#070B18]/60 dark:to-[#070B18]/80 transition-colors duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/60 to-transparent dark:from-[#070B18]/90 dark:via-[#070B18]/50 dark:to-transparent transition-colors duration-300" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF5A3C]/15 via-transparent to-transparent opacity-70" />
          </div>
        ))}
      </div>

      {/* Hero Content Container with 7XL width */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Optimized Grid: 1 col on mobile, 2 col side-by-side on tablet (md) and desktop (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 lg:gap-12 xl:gap-16 items-center lg:items-stretch">

          {/* Left Column: Headlines, Details, Actions & Metrics */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between h-full text-left py-1 lg:py-2">
            <div>
              {/* Main Catchy Heading */}
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit'] leading-[1.18] lg:leading-[1.16]">
                Discover Goa & Beyond with <br />
                <span className="text-gradient-coral">Watch My Trip Package</span>
              </h1>

              {/* Dynamic Goa Slide Subtitle & Details */}
              <div
                key={`desc-${currentIndex}`}
                className="mt-3.5 sm:mt-4 max-w-xl transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 text-[11px] font-bold text-[#FF5A3C]">
                    {activeSlide.badge}
                  </span>
                  <span className="text-xs font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating
                  </span>
                </div>

                <h2 className="text-base sm:text-lg md:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                  {activeSlide.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-xs lg:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeSlide.subtitle} We arrange complete domestic & international airfares, luxury stays, railway tickets, and personalized itineraries from Mehsana, Gujarat to worldwide destinations.
                </p>
              </div>

              {/* High-Impact CTA Buttons */}
              <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {/* Main "Plan Your Journey With Us" CTA */}
                <Link
                  href="/#contact"
                  className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] via-[#FF6C4B] to-[#E04629] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                >
                  <span className="relative z-10">Plan Your Journey With Us</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* WhatsApp Quick Chat CTA */}
                <a
                  href="https://wa.me/919588667027?text=Hello%20Watch%20My%20Trip%20Package%20Goa!%20I%20want%20to%20plan%20my%20trip%20to%20Goa%20/%20holiday%20package."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-semibold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>

                {/* Explore Destinations Secondary Button */}
                <Link
                  href="/#destinations"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <span>Top Destinations</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-5 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-3 sm:gap-6 max-w-md">
              <div>
                <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  3+ <span className="text-[#FF5A3C]">Yrs</span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">Industry Legacy</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  1,000+
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">Happy Travelers</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  100%
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">Customized Care</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Showcase Card */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col items-center md:items-end w-full">
            <div className="relative w-full max-w-md">
              {/* Ambient Glow behind card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FF5A3C] to-[#F59E0B] rounded-3xl blur-xl opacity-30 dark:opacity-40 transition duration-500" />

              {/* 3D Glass Container */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/20 bg-white/95 dark:bg-[#0C142E]/80 backdrop-blur-2xl shadow-xl dark:shadow-2xl p-3.5 sm:p-4">
                {/* Active Image Container with Robust Crossfade */}
                <div className="relative h-56 sm:h-64 md:h-52 lg:h-72 w-full rounded-xl overflow-hidden bg-slate-900">
                  {slides.map((slide, idx) => (
                    <div
                      key={slide.id || idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={idx === 0}
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

                      {/* Tag pill */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#FF5A3C] text-white text-[11px] sm:text-xs font-bold shadow">
                        {slide.tag}
                      </div>

                      {/* Title on image */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-left">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-300">Spotlight Tour</p>
                        <h3 className="text-sm sm:text-base font-bold text-white drop-shadow line-clamp-1">
                          {slide.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation Controls & Thumbnails */}
                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {slides.map((slide, idx) => (
                      <button
                        key={slide.id || idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentIndex
                            ? "w-6 sm:w-7 bg-[#FF5A3C]"
                            : "w-2 bg-slate-300 dark:bg-white/30 hover:bg-[#FF5A3C]/60"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Prev / Next Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevSlide}
                      className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all active:scale-95 cursor-pointer"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-1.5 sm:p-2 rounded-lg bg-[#FF5A3C] hover:bg-[#E04629] text-white transition-all active:scale-95 shadow-md shadow-[#FF5A3C]/40 cursor-pointer"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Trip Planner Quick Box */}
                <div className="mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium mb-2">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A3C]" />
                      <span>{activeSlide.locationText || "Goa Package Special"}</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {activeSlide.availabilityText || "Available 24x7"}
                    </span>
                  </div>
                  <Link
                    href={activeSlide.buttonLink || (activeSlide.packageId ? `/packages/${activeSlide.packageId}` : "/packages/pkg-sdp-4n5d-spa")}
                    className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-semibold text-[11px] sm:text-xs tracking-wide shadow hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    <span className="truncate">
                      {activeSlide.buttonText || (activeSlide.price ? `View Offer (${activeSlide.price})` : "View Summer Offer (₹2,499/Day)")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

