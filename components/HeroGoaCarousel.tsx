"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
  Star,
  MessageCircle,
} from "lucide-react";
import { goaCarouselSlides } from "@/lib/initialData";

export const HeroGoaCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-play timer (every 5.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % goaCarouselSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? goaCarouselSlides.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % goaCarouselSlides.length);
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

  const activeSlide = goaCarouselSlides[currentIndex];

  return (
    <section
      id="home"
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-slate-50 dark:bg-[#070B18] transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Carousel Visuals with Smooth Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {goaCarouselSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-stretch">

          {/* Left Column: Headlines, Details, Actions & Metrics aligned with Card Height */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full text-left py-1 lg:py-2">
            <div>
              {/* Main Catchy Heading - Guaranteed 100% visible immediately */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit'] leading-[1.16]">
                Discover Goa & Beyond with <br />
                <span className="text-gradient-coral">Watch My Trip Package</span>
              </h1>

              {/* Dynamic Goa Slide Subtitle & Details */}
              <div
                key={`desc-${currentIndex}`}
                className="mt-4 max-w-xl transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 text-[11px] font-bold text-[#FF5A3C]">
                    {activeSlide.badge}
                  </span>
                  <span className="text-xs font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Rating
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {activeSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeSlide.subtitle} We arrange complete domestic & international airfares, luxury stays, railway tickets, and personalized itineraries from Mehsana, Gujarat to worldwide destinations.
                </p>
              </div>

              {/* High-Impact CTA Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                {/* Main "Plan Your Journey With Us" CTA */}
                <Link
                  href="/#contact"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] via-[#FF6C4B] to-[#E04629] text-white font-bold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                >
                  <span className="relative z-10">Plan Your Journey With Us</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* WhatsApp Quick Chat CTA */}
                <a
                  href="https://wa.me/919588667027?text=Hello%20Watch%20My%20Trip%20Package%20Goa!%20I%20want%20to%20plan%20my%20trip%20to%20Goa%20/%20holiday%20package."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] dark:text-[#25D366] font-semibold text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>

                {/* Explore Destinations Secondary Button */}
                <Link
                  href="/#destinations"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-semibold text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
                >
                  <span>Top Destinations</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar aligned at the bottom of the card */}
            <div className="mt-8 lg:mt-10 pt-5 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">3+ <span className="text-[#FF5A3C]">Yrs</span></p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Industry Legacy</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">25,000+</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Happy Travelers</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">100%</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Customized Care</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Goa Carousel Showcase Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end w-full">
            <div className="relative w-full max-w-md">
              {/* Ambient Glow behind card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FF5A3C] to-[#F59E0B] rounded-3xl blur-xl opacity-30 dark:opacity-40 transition duration-500" />

              {/* 3D Glass Container */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/20 bg-white/95 dark:bg-[#0C142E]/80 backdrop-blur-2xl shadow-xl dark:shadow-2xl p-4">
                {/* Active Image Container with Robust Crossfade */}
                <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-900">
                  {goaCarouselSlides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                        }`}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={idx === 0}
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

                      {/* Tag pill without price */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FF5A3C] text-white text-xs font-bold shadow">
                        {slide.tag}
                      </div>

                      {/* Title on image */}
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <p className="text-xs font-medium text-slate-300">Spotlight Tour</p>
                        <h3 className="text-base font-bold text-white drop-shadow">
                          {slide.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation Controls & Thumbnails */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {goaCarouselSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? "w-7 bg-[#FF5A3C]"
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
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all active:scale-95"
                      aria-label="Previous Goa Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-2 rounded-lg bg-[#FF5A3C] hover:bg-[#E04629] text-white transition-all active:scale-95 shadow-md shadow-[#FF5A3C]/40"
                      aria-label="Next Goa Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Trip Planner Quick Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left">
                  <div className="flex items-center justify-between text-xs font-medium mb-2">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5A3C]" /> Goa Package Special
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Available 24x7</span>
                  </div>
                  <Link
                    href="/packages/pkg-goa-small-daddy-special"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-semibold text-xs tracking-wide shadow hover:brightness-110 transition-all"
                  >
                    <span>View 4N/5D Summer Offer (₹2,499/Day)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
