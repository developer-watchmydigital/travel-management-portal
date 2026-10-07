"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CheckCircle2, Calendar, MapPin, Users, Ticket, ArrowRight, ShieldCheck, Sparkles, X } from "lucide-react";

export interface BookingSuccessDetails {
  bookingId: string;
  packageTitle: string;
  destinationName?: string;
  travelerCount: number;
  childCount?: number;
  travelDate: string;
  paymentMode: "full_online" | "advance_30" | "cod";
  totalCost: number;
  amountPaidNow: number;
  remainingAmount: number;
  customerName: string;
  customerPhone: string;
}

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingSuccessDetails | null;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive party popper / confetti blast
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen]);

  if (!isOpen || !bookingDetails) return null;

  const paymentModeLabel =
    bookingDetails.paymentMode === "full_online"
      ? "100% Online Paid"
      : bookingDetails.paymentMode === "advance_30"
      ? "30% Advance Online Paid"
      : "100% Pay at Hotel / COD";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1528] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner with Party Popper Vibe */}
        <div className="relative bg-gradient-to-br from-[#FF5A3C] via-[#E04629] to-[#8C1E0B] p-6 text-center text-white overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl" />

          {/* Success Check Badge with Pulsing Glow */}
          <div className="relative mx-auto mb-3 w-16 h-16 rounded-full bg-white text-[#FF5A3C] flex items-center justify-center shadow-xl shadow-black/20 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-[#FF5A3C]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black uppercase tracking-wider text-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 🎉 Booking Confirmed!
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
            Congratulations, {bookingDetails.customerName.split(" ")[0]}!
          </h2>
          <p className="text-sm text-amber-100/90 mt-1 max-w-sm mx-auto">
            Your tour reservation has been received & logged under booking ID{" "}
            <span className="font-extrabold text-white underline decoration-amber-300">
              #{bookingDetails.bookingId}
            </span>
          </p>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200">
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5A3C]">
                  Reserved Tour
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {bookingDetails.packageTitle}
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold whitespace-nowrap">
                Confirmed
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5A3C] shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Date</div>
                  <div className="font-bold">{bookingDetails.travelDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5A3C] shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Travelers</div>
                  <div className="font-bold">
                    {bookingDetails.travelerCount} Adults
                    {bookingDetails.childCount && bookingDetails.childCount > 0
                      ? ` + ${bookingDetails.childCount} Child`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Payment Option</span>
              <span className="font-bold text-amber-300">{paymentModeLabel}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Total Tour Cost</span>
              <span className="font-extrabold text-white text-sm">
                ₹{bookingDetails.totalCost.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-t border-slate-800 pt-2">
              <span>Amount Paid Now</span>
              <span className="text-base">₹{bookingDetails.amountPaidNow.toLocaleString("en-IN")}</span>
            </div>

            {bookingDetails.remainingAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                <span>Balance to Pay at Hotel</span>
                <span>₹{bookingDetails.remainingAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              Please remember to carry <strong>Original Aadhaar Cards</strong> for all travelers during check-in.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <Link
              href="/my-bookings"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-[#FFFFFF] font-extrabold text-sm sm:text-base shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Ticket className="w-5 h-5" />
              <span>Go to My Bookings</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors"
            >
              Close & Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
