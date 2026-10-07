"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  Ticket,
  Calendar,
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ChevronRight,
  ArrowLeft,
  LogIn,
} from "lucide-react";

export interface BookingRecord {
  id: string;
  userId?: string;
  packageId: string;
  packageTitle: string;
  destinationName?: string;
  travelerCount: number;
  childCount?: number;
  travelDate: string;
  paymentMode: "full_online" | "advance_30" | "cod";
  totalCost: number;
  amountPaidNow: number;
  remainingAmount: number;
  status: "confirmed" | "refund_processing" | "cancelled";
  createdAt: string;
  customerName: string;
  customerPhone: string;
}

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "confirmed" | "refund_processing" | "cancelled">("all");
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  // Load user bookings from local storage or initialize demo bookings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("my_travel_bookings");
      let allBookings: BookingRecord[] = [];

      if (stored) {
        try {
          allBookings = JSON.parse(stored);
        } catch (e) {
          allBookings = [];
        }
      }

      // If empty, supply representative initial mock bookings for demonstration
      if (allBookings.length === 0) {
        const demoUserId = user?.uid || "demo_user";
        allBookings = [
          {
            id: "BK-984210",
            userId: demoUserId,
            packageId: "goa-deluxe-beach-resort",
            packageTitle: "Goa 4 Nights / 5 Days Deluxe Beach Resort Package",
            destinationName: "North & South Goa",
            travelerCount: 2,
            childCount: 1,
            travelDate: "2026-11-15",
            paymentMode: "advance_30",
            totalCost: 23191,
            amountPaidNow: 6957,
            remainingAmount: 16234,
            status: "confirmed",
            createdAt: "2026-10-07T16:00:00.000Z",
            customerName: user?.displayName || "Masum Ahmed",
            customerPhone: "+91 95886 67027",
          },
          {
            id: "BK-871402",
            userId: demoUserId,
            packageId: "kashmir-paradise-tour",
            packageTitle: "Kashmir Paradise 5N/6D Gulmarg & Srinagar Houseboat",
            destinationName: "Srinagar & Gulmarg",
            travelerCount: 3,
            childCount: 0,
            travelDate: "2026-12-01",
            paymentMode: "full_online",
            totalCost: 45000,
            amountPaidNow: 45000,
            remainingAmount: 0,
            status: "refund_processing",
            createdAt: "2026-09-20T10:30:00.000Z",
            customerName: user?.displayName || "Masum Ahmed",
            customerPhone: "+91 95886 67027",
          },
          {
            id: "BK-651289",
            userId: demoUserId,
            packageId: "himachal-shimla-manali",
            packageTitle: "Himachal Explorer 6N/7D Shimla & Manali Volvo Tour",
            destinationName: "Manali & Solang Valley",
            travelerCount: 2,
            childCount: 0,
            travelDate: "2026-08-10",
            paymentMode: "cod",
            totalCost: 32000,
            amountPaidNow: 0,
            remainingAmount: 32000,
            status: "cancelled",
            createdAt: "2026-08-01T12:00:00.000Z",
            customerName: user?.displayName || "Masum Ahmed",
            customerPhone: "+91 95886 67027",
          },
        ];
        localStorage.setItem("my_travel_bookings", JSON.stringify(allBookings));
      }

      setBookings(allBookings);
    }
  }, [user]);

  // Handle requesting cancellation & refund
  const handleRequestCancel = (bookingId: string) => {
    const updated = bookings.map((item) => {
      if (item.id === bookingId) {
        return {
          ...item,
          status: "refund_processing" as const,
        };
      }
      return item;
    });
    setBookings(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("my_travel_bookings", JSON.stringify(updated));
    }
    setCancellingBookingId(null);
  };

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#FF5A3C] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-[#FF5A3C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs font-semibold text-slate-400">
            Account:{" "}
            <span className="text-white font-bold">
              {user ? user.displayName || user.email || user.phoneNumber : "Guest / Demo Profile"}
            </span>
          </div>
        </div>

        {/* Page Header Title Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-[#0E172E] to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#FF5A3C]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 text-xs font-extrabold text-[#FF5A3C] uppercase tracking-wider mb-2">
                <Ticket className="w-3.5 h-3.5" /> My Travel Reservations
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white">
                My Bookings & Tickets
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                View confirmed tour itineraries, check refund status, or request booking cancellations.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 text-center shrink-0">
              <div className="text-2xl font-black text-[#FF5A3C]">{bookings.length}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Bookings
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === "all"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "confirmed"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed ({bookings.filter((b) => b.status === "confirmed").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("refund_processing")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "refund_processing"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refund ({bookings.filter((b) => b.status === "refund_processing").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "cancelled"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled ({bookings.filter((b) => b.status === "cancelled").length})</span>
          </button>
        </div>

        {/* Bookings List Container */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">No Bookings Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              You haven't made any reservations under this category yet. Explore our top Goa & holiday packages to plan your trip!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF5A3C] text-white font-extrabold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.03] transition-all"
            >
              <span>Explore Holiday Packages</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((item) => {
              const statusBadge =
                item.status === "confirmed" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Booking Confirmed
                  </span>
                ) : item.status === "refund_processing" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5" /> Refund Processing
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Cancelled
                  </span>
                );

              const paymentBadge =
                item.paymentMode === "full_online" ? (
                  <span className="text-xs font-bold text-emerald-400">100% Online Paid</span>
                ) : item.paymentMode === "advance_30" ? (
                  <span className="text-xs font-bold text-amber-400">30% Advance Online Paid</span>
                ) : (
                  <span className="text-xs font-bold text-cyan-400">100% Pay at Hotel / COD</span>
                );

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all p-5 sm:p-6 shadow-xl space-y-4"
                >
                  {/* Top Card Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-[#FF5A3C] flex items-center justify-center font-bold text-sm shrink-0">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            Booking Reference
                          </span>
                          <span className="text-xs font-extrabold text-[#FF5A3C]">{item.id}</span>
                        </div>
                        <h2 className="text-lg font-black text-white font-['Outfit'] mt-0.5">
                          {item.packageTitle}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {statusBadge}
                    </div>
                  </div>

                  {/* Tour Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 rounded-2xl p-4 border border-slate-850">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#FF5A3C] shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">Travel Date</div>
                        <div className="text-sm font-bold text-white">{item.travelDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-[#FF5A3C] shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">Travelers</div>
                        <div className="text-sm font-bold text-white">
                          {item.travelerCount} Adults
                          {item.childCount && item.childCount > 0 ? ` + ${item.childCount} Child` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#FF5A3C] shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">Destination</div>
                        <div className="text-sm font-bold text-white">
                          {item.destinationName || "Goa, India"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Payment Option:</span>
                        {paymentBadge}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400">
                          Total Cost: <strong className="text-white">₹{item.totalCost.toLocaleString("en-IN")}</strong>
                        </span>
                        <span className="text-emerald-400">
                          Paid: <strong>₹{item.amountPaidNow.toLocaleString("en-IN")}</strong>
                        </span>
                        {item.remainingAmount > 0 && (
                          <span className="text-amber-400">
                            Hotel Pay: <strong>₹{item.remainingAmount.toLocaleString("en-IN")}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {item.status === "confirmed" && (
                        <button
                          onClick={() => setCancellingBookingId(item.id)}
                          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-extrabold text-xs transition-all"
                        >
                          Cancel / Request Refund
                        </button>
                      )}

                      <Link
                        href={`/packages/${item.packageId}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <span>View Tour Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold text-white">Cancel Reservation?</h3>
              <p className="text-sm text-slate-400">
                Are you sure you want to cancel booking reference{" "}
                <strong className="text-white">#{cancellingBookingId}</strong>? Our refund policy will process eligible online payments back to your account.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleRequestCancel(cancellingBookingId)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/30"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
