"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  CheckCircle2,
  Hotel,
  Package,
  PlusCircle,
  X,
  Send,
  Filter,
  ShieldCheck,
  MessageSquareHeart,
} from "lucide-react";
import { Review } from "@/lib/types";
import { initialGoaReviews } from "@/lib/initialData";
import { MagicBentoCard } from "./ui/MagicBentoCard";

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(initialGoaReviews);
  const [activeTab, setActiveTab] = useState<"all" | "package" | "hotel">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [experience, setExperience] = useState<"Excellent" | "Good" | "Average" | "Bad">("Excellent");
  const [category, setCategory] = useState<"package" | "hotel">("package");
  const [targetName, setTargetName] = useState("Goa Honeymoon & Mandovi Dinner Cruise Package");
  const [comment, setComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch live reviews from API
  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.warn("Could not load reviews API:", err));
  }, []);

  const packageOptions = [
    "Goa Honeymoon & Mandovi Dinner Cruise Package",
    "Goa 4N/5D Family Adventure & Beach Tour",
    "Goa Grand Island Scuba & Adventure Boat Package",
    "Goa North & South Deluxe Sightseeing Tour",
    "Goa Weekend Friends Beach & Nightlife Trip",
  ];

  const hotelOptions = [
    "Hotel Small Daddy Plus, Calangute (Deluxe Room)",
    "Hotel Small Daddy Plus, Calangute (Poolside Suite)",
    "Hotel Small Daddy Plus, Calangute (Family Room)",
  ];

  const handleCategoryChange = (newCat: "package" | "hotel") => {
    setCategory(newCat);
    setTargetName(newCat === "package" ? packageOptions[0] : hotelOptions[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Please write a few words about your experience.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim() || "Goa Traveler",
          rating,
          experience,
          category,
          targetName,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setSuccessToast("Thank you! Your 5-star review has been recorded.");
        setIsModalOpen(false);

        // Reset form
        setName("");
        setLocation("");
        setRating(5);
        setExperience("Excellent");
        setComment("");

        setTimeout(() => setSuccessToast(""), 4500);
      } else {
        setErrorMsg(data.error || "Failed to submit review.");
      }
    } catch {
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "all") return true;
    return r.category === activeTab;
  });

  const packageCount = reviews.filter((r) => r.category === "package").length;
  const hotelCount = reviews.filter((r) => r.category === "hotel").length;

  // Average Rating
  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Score Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-xs font-bold text-[#FF5A3C] uppercase tracking-wider mb-2.5">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Goa Verified Reviews</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Stories & Reviews From <span className="text-[#FF5A3C]">Goa Travelers</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Real feedback from guests who booked our curated Goa packages and enjoyed hospitality at Hotel Small Daddy Plus.
          </p>
        </div>

        {/* Action + Metric Pills */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {avgRating}
              </span>
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {reviews.length} Verified Reviews
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-[#FF5A3C]/30 hover:shadow-[#FF5A3C]/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Rate 5-Star / Write Review</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "all"
              ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/30"
              : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("package")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "package"
              ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/30"
              : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Goa Packages ({packageCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("hotel")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "hotel"
              ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/30"
              : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          <Hotel className="w-3.5 h-3.5" />
          <span>Hotel Small Daddy Plus ({hotelCount})</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((rev) => {
          const isHotel = rev.category === "hotel";
          const initials = rev.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <MagicBentoCard
              key={rev.id}
              className="p-6 flex flex-col justify-between"
              glowColor={isHotel ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 90, 60, 0.2)"}
            >
              <div>
                {/* Header: Stars + Category & Experience Badges */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Experience Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      rev.experience === "Excellent"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : rev.experience === "Good"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
                    }`}
                  >
                    {rev.experience}
                  </span>
                </div>

                {/* Target Name Pill */}
                <div className="mb-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {isHotel ? (
                      <Hotel className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <Package className="w-3 h-3 text-[#FF5A3C] shrink-0" />
                    )}
                    <span className="truncate max-w-[240px]">{rev.targetName}</span>
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic mb-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Reviewer Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF5A3C] to-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span>{rev.name}</span>
                      {rev.verified && (
                        <span title="Verified Guest">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {rev.location}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                  {rev.createdAt}
                </span>
              </div>
            </MagicBentoCard>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* COMPACT INTERACTIVE REVIEW MODAL (z-[100] above navbar, never cut off) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-[460px] my-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0C1226] border border-slate-200 dark:border-white/15 p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-3.5 text-left pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-[10px] font-bold text-[#FF5A3C] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Rate Your Goa Trip</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-['Outfit'] leading-snug">
                Share Your 5-Star Experience
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                Your review helps fellow travelers choose the best Goa tour & stay!
              </p>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 text-left">
              {/* Star Rating Interactive Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= (hoverRating || rating);
                      return (
                        <button
                          type="button"
                          key={starVal}
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${
                              isFilled ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-extrabold text-[#FF5A3C] ml-auto whitespace-nowrap">
                    {rating === 5
                      ? "⭐⭐⭐⭐⭐ Exceptional!"
                      : rating === 4
                      ? "⭐⭐⭐⭐ Very Good"
                      : rating === 3
                      ? "⭐⭐⭐ Average"
                      : rating === 2
                      ? "⭐⭐ Fair"
                      : "⭐ Poor"}
                  </span>
                </div>
              </div>

              {/* Experience Tag Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Overall Experience *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["Excellent", "Good", "Average", "Bad"] as const).map((exp) => (
                    <button
                      type="button"
                      key={exp}
                      onClick={() => setExperience(exp)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center truncate ${
                        experience === exp
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/30"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {exp === "Excellent" && "✨ "}
                      {exp === "Good" && "👍 "}
                      {exp === "Average" && "👌 "}
                      {exp === "Bad" && "👎 "}
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Picker: Package vs Hotel */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  What are you reviewing? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("package")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      category === "package"
                        ? "bg-[#FF5A3C] text-white border-[#FF5A3C] shadow-sm shadow-[#FF5A3C]/30"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span className="truncate">Goa Tour Package</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange("hotel")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      category === "hotel"
                        ? "bg-[#FF5A3C] text-white border-[#FF5A3C] shadow-sm shadow-[#FF5A3C]/30"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Hotel className="w-3.5 h-3.5" />
                    <span className="truncate">Hotel Small Daddy Plus</span>
                  </button>
                </div>
              </div>

              {/* Specific Item Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {category === "package" ? "Tour Package" : "Room / Stay Option"}
                </label>
                <select
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A3C]"
                >
                  {(category === "package" ? packageOptions : hotelOptions).map((opt, idx) => (
                    <option key={idx} value={opt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name & Location in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A3C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A3C]"
                  />
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Your Review Story *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Share details about your room, cab driver, cruise, food, or overall service..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A3C] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#FF5A3C]/35 hover:shadow-[#FF5A3C]/55 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting review...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post 5-Star Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
