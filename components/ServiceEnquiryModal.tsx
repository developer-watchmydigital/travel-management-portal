"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Send,
  CheckCircle2,
  Phone,
  MessageCircle,
  Building2,
  Car,
  Plane,
  Train,
  Users,
  Briefcase,
  Compass,
  MapPin,
  HeartHandshake,
  Sparkles,
  Sun,
  Calendar,
  Clock,
  ShieldCheck,
  Maximize2,
  Info,
} from "lucide-react";
import { TravelService, ServicePhoto } from "@/lib/types";
import { saveLead } from "@/lib/storage";

interface ServiceEnquiryModalProps {
  service: TravelService | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceEnquiryModal: React.FC<ServiceEnquiryModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  // Core contact states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Dynamic Q&A fields
  const [hotelDestination, setHotelDestination] = useState("Calangute, North Goa (Beachside)");
  const [hotelCategory, setHotelCategory] = useState("Hotel Small Daddy Plus (Recommended)");
  const [hotelCheckIn, setHotelCheckIn] = useState("");
  const [hotelCheckOut, setHotelCheckOut] = useState("");
  const [hotelRooms, setHotelRooms] = useState("1 Room (2 Guests)");
  const [hotelGuests, setHotelGuests] = useState("2 Adults");
  const [hotelMealPlan, setHotelMealPlan] = useState("Breakfast Included (CP)");

  const [carPickupLocation, setCarPickupLocation] = useState("Mopa International Airport (GOX)");
  const [carDropLocation, setCarDropLocation] = useState("Calangute / Baga Beach Area");
  const [carPickupDate, setCarPickupDate] = useState("");
  const [carPickupTime, setCarPickupTime] = useState("10:00 AM");
  const [carVehicleType, setCarVehicleType] = useState("Toyota Innova Crysta (6+1 AC)");
  const [carTripType, setCarTripType] = useState("Full Day Sightseeing (8hr/80km)");
  const [carRentalDays, setCarRentalDays] = useState("3 Days");

  const [flightOrigin, setFlightOrigin] = useState("Ahmedabad (AMD)");
  const [flightDestination, setFlightDestination] = useState("Goa Mopa (GOX) / Dabolim (GOI)");
  const [flightType, setFlightType] = useState<"one-way" | "round-trip">("round-trip");
  const [flightDepartDate, setFlightDepartDate] = useState("");
  const [flightReturnDate, setFlightReturnDate] = useState("");
  const [flightClass, setFlightClass] = useState("Economy");
  const [flightPassengers, setFlightPassengers] = useState("2 Adults");

  const [trainOrigin, setTrainOrigin] = useState("Ahmedabad / Surat");
  const [trainDestination, setTrainDestination] = useState("Madgaon (MAO) / Thivim (THVM)");
  const [trainDate, setTrainDate] = useState("");
  const [trainClass, setTrainClass] = useState("3AC");
  const [trainTatkal, setTrainTatkal] = useState("No (Normal Booking)");
  const [trainPassengers, setTrainPassengers] = useState("2 Passengers");

  const [groupDestination, setGroupDestination] = useState("Goa Coastal Explorer");
  const [groupSize, setGroupSize] = useState("15-25 People");
  const [groupMonth, setGroupMonth] = useState("");
  const [groupFood, setGroupFood] = useState("Jain & Gujarati Vegetarian Food");

  const [corpCompany, setCorpCompany] = useState("");
  const [corpEventType, setCorpEventType] = useState("Annual Retreat & Conference");
  const [corpDelegates, setCorpDelegates] = useState("30-50 Delegates");
  const [corpBudget, setCorpBudget] = useState("₹15,000 - ₹25,000 per delegate");

  const [customTravelers, setCustomTravelers] = useState("");

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Lightbox preview for photos
  const [activePhotoPreview, setActivePhotoPreview] = useState<ServicePhoto | null>(null);

  // Reset form when modal opens or service changes
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage("");
      setFullName("");
      setPhone("");
      setEmail("");
      setSpecialNotes("");
      setActivePhotoPreview(null);
      setCustomTravelers("");
    }
  }, [isOpen, service?.id]);

  if (!isOpen || !service) return null;

  const isHotel = service.id === "hotel-booking";
  const isCar = service.id === "car-rental";
  const isFlight = service.id === "flight-booking";
  const isTrain = service.id === "railway-reservation";
  const isGroup = service.id === "group-tours";
  const isCorporate = service.id === "corporate-tours";
  const hasShowcasePhotos = (isHotel || isCar) && service.photos && service.photos.length > 0;

  // Build structured questions and answers map
  const buildServiceDetails = (): Record<string, string> => {
    if (isHotel) {
      return {
        "Destination Area": hotelDestination,
        "Hotel Category": hotelCategory,
        "Check-in Date": hotelCheckIn || "Flexible / Soon",
        "Check-out Date": hotelCheckOut || "Flexible",
        "Rooms Required": hotelRooms,
        "Guests Count": hotelGuests,
        "Meal Plan": hotelMealPlan,
      };
    }
    if (isCar) {
      return {
        "Pickup Point": carPickupLocation,
        "Drop Location": carDropLocation,
        "Pickup Date & Time": `${carPickupDate || "Flexible"} at ${carPickupTime}`,
        "Vehicle Model": carVehicleType,
        "Service Type": carTripType,
        "Rental Duration": carRentalDays,
      };
    }
    if (isFlight) {
      return {
        "Route": `${flightOrigin} ➔ ${flightDestination}`,
        "Trip Type": flightType === "round-trip" ? "Round Trip" : "One Way",
        "Departure Date": flightDepartDate || "Flexible",
        "Return Date": flightType === "round-trip" ? flightReturnDate || "Flexible" : "N/A",
        "Travel Class": flightClass,
        "Passengers": flightPassengers,
      };
    }
    if (isTrain) {
      return {
        "Station Route": `${trainOrigin} ➔ ${trainDestination}`,
        "Travel Date": trainDate || "Flexible",
        "Class Preference": trainClass,
        "Tatkal Required": trainTatkal,
        "Passengers": trainPassengers,
      };
    }
    if (isGroup) {
      return {
        "Number of Travelers": groupSize,
        "Hotel Name": "Hotel Small Daddy Plus (Calangute, Goa)",
      };
    }
    if (isCorporate) {
      return {
        "Company Name": corpCompany || "Corporate Client",
        "Event Type": corpEventType,
        "Number of Delegates": corpDelegates,
        "Hotel Name": "Hotel Small Daddy Plus (Calangute, Goa)",
      };
    }
    return {
      "Number of Travelers": customTravelers || "2 Adults (Couple)",
      "Hotel Name": "Hotel Small Daddy Plus (Calangute, Goa)",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage("Please enter your Name and Mobile Number to proceed.");
      return;
    }

    if (phone.replace(/[^0-9]/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    const serviceDetails = buildServiceDetails();

    // Determine lead type for database categorization
    let leadType = "service";
    if (isHotel) leadType = "hotel";
    else if (isCar) leadType = "car";
    else if (isFlight) leadType = "flight";
    else if (isTrain) leadType = "train";
    else if (isGroup) leadType = "group";
    else if (isCorporate) leadType = "corporate";

    const destinationValue = isHotel
      ? hotelDestination
      : isCar
      ? `${carPickupLocation} ➔ ${carDropLocation}`
      : isFlight
      ? `${flightOrigin} to ${flightDestination}`
      : isTrain
      ? `${trainOrigin} to ${trainDestination}`
      : `${service.title} - Goa (Hotel Small Daddy Plus)`;

    const dateValue = isHotel
      ? `${hotelCheckIn || "Flexible"} to ${hotelCheckOut || "Flexible"}`
      : isCar
      ? carPickupDate
      : isFlight
      ? flightDepartDate
      : isTrain
      ? trainDate
      : groupMonth;

    const leadPayload = {
      type: leadType,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      destination: destinationValue,
      serviceName: service.title,
      packageName: `${service.title} - ${isHotel ? hotelCategory : isCar ? carVehicleType : "Enquiry"}`,
      travelDate: dateValue,
      travellers: [{ name: fullName.trim(), age: "Adult", gender: "Not Specified" }],
      specialRequirements: specialNotes.trim()
        ? `Notes: ${specialNotes.trim()}`
        : "Standard VIP inquiry via website modal.",
      serviceDetails,
    };

    try {
      // 1. Save to local storage for immediate persistence
      const savedLocal = saveLead(leadPayload);
      const resolvedId = savedLocal.id || "WMT-" + Date.now().toString().slice(-6);
      setLeadId(resolvedId);

      // 2. Submit to backend API (and Supabase)
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      }).catch((err) => console.warn("API lead sync error:", err));

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage("Something went wrong while submitting. Please call or WhatsApp us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp quick redirect
  const handleWhatsAppChat = () => {
    const details = buildServiceDetails();
    const detailsSummary = Object.entries(details)
      .map(([k, v]) => `• *${k}:* ${v}`)
      .join("%0A");

    const message = `Hello Watch My Trip Package! 👋%0A%0AI would like to enquire for *${encodeURIComponent(
      service.title
    )}*.%0A%0A*Customer Details:*%0A• *Name:* ${encodeURIComponent(fullName || "Traveler")}%0A• *Phone:* ${encodeURIComponent(
      phone || "N/A"
    )}%0A%0A*Enquiry Specifications:*%0A${detailsSummary}${
      specialNotes ? `%0A• *Special Requests:* ${encodeURIComponent(specialNotes)}` : ""
    }%0A%0APlease share availability, best quotes, and package details. Thank you!`;

    window.open(`https://wa.me/919588667027?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0C1226] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="relative px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5A3C]/10 text-[#FF5A3C] border border-[#FF5A3C]/20 flex items-center justify-center shrink-0">
              {isHotel && <Building2 className="w-5 h-5" />}
              {isCar && <Car className="w-5 h-5" />}
              {isFlight && <Plane className="w-5 h-5" />}
              {isTrain && <Train className="w-5 h-5" />}
              {isGroup && <Users className="w-5 h-5" />}
              {isCorporate && <Briefcase className="w-5 h-5" />}
              {!isHotel && !isCar && !isFlight && !isTrain && !isGroup && !isCorporate && (
                <Compass className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FF5A3C]/15 text-[#FF5A3C] text-[10px] font-extrabold uppercase tracking-wider">
                  {service.badge}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Direct Enquiry
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
                {service.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left">
          {isSuccess ? (
            /* Celebration Success Screen */
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  Enquiry Received Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you, <strong className="text-slate-900 dark:text-white">{fullName}</strong>. Your enquiry for{" "}
                  <strong className="text-[#FF5A3C]">{service.title}</strong> has been assigned to our senior travel coordinator.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 max-w-md mx-auto text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Reference ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10">
                  {leadId || "WMT-LEAD"}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppChat}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Instant Reply on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Active Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 3 SHOWCASE PHOTOS FOR HOTEL BOOKING & CAR RENTAL */}
              {hasShowcasePhotos && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5A3C]" />
                      <span>{isHotel ? "3 Verified Hotel Showcase Photos" : "3 Verified Fleet Showcase Photos"}</span>
                    </span>
                    <span className="text-[10px] text-[#FF5A3C] font-semibold">Managed via Admin Panel</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {service.photos!.slice(0, 3).map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePhotoPreview(photo)}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 cursor-pointer hover:border-[#FF5A3C] transition-all shadow-sm"
                      >
                        <div className="relative h-24 sm:h-28 w-full overflow-hidden">
                          <Image
                            src={photo.url}
                            alt={photo.title || `Showcase ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-108 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 220px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-extrabold text-white">
                            #{idx + 1}
                          </span>
                          <span className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF5A3C] transition-colors">
                            {photo.title || (isHotel ? `Room / Suite #${idx + 1}` : `Vehicle Model #${idx + 1}`)}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {photo.caption || (isHotel ? "Verified sanitized stay" : "Chauffeur driven AC fleet")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPECIFIC QUESTIONS SECTION */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3.5">
                <div className="flex items-center gap-1.5 border-b border-slate-200/60 dark:border-white/10 pb-2">
                  <Info className="w-3.5 h-3.5 text-[#FF5A3C]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {service.title} - Custom Specifications
                  </span>
                </div>

                {/* 1. HOTEL BOOKING QUESTIONS */}
                {isHotel && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Hotel Name
                        </label>
                        <div className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>⭐ Hotel Small Daddy Plus</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Calangute, Goa
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Number of Travelers / Guests *
                        </label>
                        <input
                          type="text"
                          value={hotelGuests}
                          onChange={(e) => setHotelGuests(e.target.value)}
                          placeholder="e.g. 2 Adults (Couple), Family of 4"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          value={hotelCheckIn}
                          onChange={(e) => setHotelCheckIn(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          value={hotelCheckOut}
                          onChange={(e) => setHotelCheckOut(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Rooms
                        </label>
                        <select
                          value={hotelRooms}
                          onChange={(e) => setHotelRooms(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="1 Room">1 Room</option>
                          <option value="2 Rooms">2 Rooms</option>
                          <option value="3 Rooms">3 Rooms</option>
                          <option value="4+ Rooms (Group)">4+ Rooms (Group)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Guests
                        </label>
                        <select
                          value={hotelGuests}
                          onChange={(e) => setHotelGuests(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="2 Adults (Couple)">2 Adults (Couple)</option>
                          <option value="2 Adults + 1 Kid">2 Adults + 1 Kid</option>
                          <option value="4 Adults (Family)">4 Adults (Family)</option>
                          <option value="6+ Guests (Group)">6+ Guests (Group)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Meal Plan Preference
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "Breakfast Included (CP)", label: "🥐 Free Breakfast (CP)" },
                          { id: "Breakfast & Dinner (MAP)", label: "🍽️ Breakfast + Dinner (MAP)" },
                          { id: "All Meals Included (AP)", label: "🥘 All 3 Meals (AP)" },
                          { id: "Room Only (EP)", label: "🛏️ Room Only (EP)" },
                        ].map((plan) => (
                          <button
                            type="button"
                            key={plan.id}
                            onClick={() => setHotelMealPlan(plan.id)}
                            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                              hotelMealPlan === plan.id
                                ? "bg-[#FF5A3C] text-white border-[#FF5A3C] shadow-sm shadow-[#FF5A3C]/25"
                                : "bg-white dark:bg-[#070B18] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#FF5A3C]/50"
                            }`}
                          >
                            {plan.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CAR RENTAL QUESTIONS */}
                {isCar && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Pickup Location *
                        </label>
                        <select
                          value={carPickupLocation}
                          onChange={(e) => setCarPickupLocation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="Mopa International Airport (GOX)">
                            ✈️ Mopa International Airport (GOX)
                          </option>
                          <option value="Dabolim Airport (GOI)">
                            ✈️ Dabolim Airport (GOI)
                          </option>
                          <option value="Madgaon Railway Station (MAO)">
                            🚆 Madgaon Railway Station (MAO)
                          </option>
                          <option value="Thivim Railway Station (THVM)">
                            🚆 Thivim Railway Station (THVM)
                          </option>
                          <option value="Calangute / Baga / North Goa Hotel Pickup">
                            🏨 North Goa Resort / Hotel Pickup
                          </option>
                          <option value="South Goa Hotel / Resort Pickup">
                            🏨 South Goa Resort / Hotel Pickup
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Drop Location / Destination *
                        </label>
                        <input
                          type="text"
                          value={carDropLocation}
                          onChange={(e) => setCarDropLocation(e.target.value)}
                          placeholder="e.g. Calangute Beach, South Goa, Airport Drop"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Vehicle Preference *
                        </label>
                        <select
                          value={carVehicleType}
                          onChange={(e) => setCarVehicleType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="Toyota Innova Crysta (6+1 AC)">
                            🚐 Toyota Innova Crysta (6+1 / 7+1 AC)
                          </option>
                          <option value="Swift Dzire / AC Sedan (4+1)">
                            🚗 Swift Dzire / AC Sedan (4+1)
                          </option>
                          <option value="Maruti Ertiga (6-Seater AC)">
                            🚙 Maruti Ertiga (6-Seater AC)
                          </option>
                          <option value="Luxury AC Tempo Traveller (12-17 Seater)">
                            🚌 AC Tempo Traveller (12 to 17 Seater)
                          </option>
                          <option value="Mahindra Thar / Self-Drive Automatic">
                            🚙 Mahindra Thar (Self-Drive / Open Top)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Trip / Hire Type
                        </label>
                        <select
                          value={carTripType}
                          onChange={(e) => setCarTripType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="Full Day Sightseeing (8hr/80km)">
                            🌴 Local Sightseeing (8hr / 80km)
                          </option>
                          <option value="Airport Pickup / Drop Transfer">
                            ✈️ Airport Pickup / Drop Transfer
                          </option>
                          <option value="North Goa Beaches & Forts Tour">
                            🏰 North Goa Beaches & Forts Tour
                          </option>
                          <option value="South Goa Churches & Cruise Tour">
                            ⛪ South Goa Churches & Sunset Tour
                          </option>
                          <option value="Multi-Day Outstation / Private Cab">
                            🛣️ Multi-Day Dedicated Private Cab
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Rental Duration
                        </label>
                        <select
                          value={carRentalDays}
                          onChange={(e) => setCarRentalDays(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="1 Day">1 Day</option>
                          <option value="2 Days">2 Days</option>
                          <option value="3 Days">3 Days</option>
                          <option value="4 Days">4 Days</option>
                          <option value="5+ Days (Full Goa Trip)">5+ Days (Full Goa Trip)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Pickup Date
                        </label>
                        <input
                          type="date"
                          value={carPickupDate}
                          onChange={(e) => setCarPickupDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Pickup Time
                        </label>
                        <input
                          type="text"
                          value={carPickupTime}
                          onChange={(e) => setCarPickupTime(e.target.value)}
                          placeholder="e.g. 10:30 AM or Flight arrival time"
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FLIGHT BOOKING QUESTIONS */}
                {isFlight && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Departure Airport / City *
                        </label>
                        <input
                          type="text"
                          value={flightOrigin}
                          onChange={(e) => setFlightOrigin(e.target.value)}
                          placeholder="e.g. Ahmedabad (AMD), Mumbai (BOM), Delhi (DEL)"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Arrival Destination *
                        </label>
                        <input
                          type="text"
                          value={flightDestination}
                          onChange={(e) => setFlightDestination(e.target.value)}
                          placeholder="e.g. Goa (GOX / GOI), Dubai, Singapore"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Trip Type
                        </label>
                        <select
                          value={flightType}
                          onChange={(e) => setFlightType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="round-trip">Round Trip</option>
                          <option value="one-way">One Way</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Departure Date
                        </label>
                        <input
                          type="date"
                          value={flightDepartDate}
                          onChange={(e) => setFlightDepartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Return Date
                        </label>
                        <input
                          type="date"
                          disabled={flightType === "one-way"}
                          value={flightReturnDate}
                          onChange={(e) => setFlightReturnDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C] disabled:opacity-40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Class & Seats
                        </label>
                        <select
                          value={flightClass}
                          onChange={(e) => setFlightClass(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Premium Economy">Premium Economy</option>
                          <option value="Business Class">Business Class</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. RAILWAY RESERVATION QUESTIONS */}
                {isTrain && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Origin Station *
                        </label>
                        <input
                          type="text"
                          value={trainOrigin}
                          onChange={(e) => setTrainOrigin(e.target.value)}
                          placeholder="e.g. Ahmedabad (ADI), Surat (ST)"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Destination Station *
                        </label>
                        <input
                          type="text"
                          value={trainDestination}
                          onChange={(e) => setTrainDestination(e.target.value)}
                          placeholder="e.g. Madgaon (MAO), Thivim (THVM)"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Date of Journey
                        </label>
                        <input
                          type="date"
                          value={trainDate}
                          onChange={(e) => setTrainDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Class Preference
                        </label>
                        <select
                          value={trainClass}
                          onChange={(e) => setTrainClass(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="3AC (3rd AC)">3AC (3rd AC Sleeper)</option>
                          <option value="2AC (2nd AC)">2AC (2nd AC Deluxe)</option>
                          <option value="1AC (1st Class AC)">1AC (Coupe / Cabin)</option>
                          <option value="Vande Bharat Chair Car">Vande Bharat Executive / CC</option>
                          <option value="Sleeper Class (SL)">Sleeper Class (SL)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                          Tatkal Assistance?
                        </label>
                        <select
                          value={trainTatkal}
                          onChange={(e) => setTrainTatkal(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="No (Normal IRCTC)">No (Normal Reservation)</option>
                          <option value="Yes (Tatkal / Premium Tatkal)">Yes (Tatkal Support Needed)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GROUP TOURS QUESTIONS */}
                {isGroup && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Number of Travelers (Group Size) *
                      </label>
                      <input
                        type="text"
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                        placeholder="e.g. 15-25 Travelers"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Hotel Name
                      </label>
                      <div className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>⭐ Hotel Small Daddy Plus</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Calangute, Goa
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CORPORATE / MICE QUESTIONS */}
                {isCorporate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Company / Organization Name *
                      </label>
                      <input
                        type="text"
                        value={corpCompany}
                        onChange={(e) => setCorpCompany(e.target.value)}
                        placeholder="e.g. TechCorp Solutions Pvt Ltd"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Event Type
                      </label>
                      <select
                        value={corpEventType}
                        onChange={(e) => setCorpEventType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                      >
                        <option value="Annual Retreat & Conference">Annual Retreat & Conference</option>
                        <option value="Dealer & Distributor Meet">Dealer & Distributor Meet</option>
                        <option value="Executive Board Meeting">Executive Board Meeting</option>
                        <option value="Incentive Tour & Team Building">Incentive Tour & Team Building</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Delegates Count
                      </label>
                      <input
                        type="text"
                        value={corpDelegates}
                        onChange={(e) => setCorpDelegates(e.target.value)}
                        placeholder="e.g. 25-40 Delegates"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Approximate Budget / Person
                      </label>
                      <input
                        type="text"
                        value={corpBudget}
                        onChange={(e) => setCorpBudget(e.target.value)}
                        placeholder="e.g. ₹15,000 - ₹25,000"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>
                  </div>
                )}

                {/* 7. TOUR ENQUIRY QUESTIONS (Honeymoon, Family, Customized, Domestic, Pilgrimage) */}
                {!isHotel && !isCar && !isFlight && !isTrain && !isGroup && !isCorporate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Number of Travelers *
                      </label>
                      <input
                        type="text"
                        required
                        value={customTravelers}
                        onChange={(e) => setCustomTravelers(e.target.value)}
                        placeholder="e.g. 2 Adults (Couple) or Family of 4"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070B18] border border-slate-200 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Hotel Name
                      </label>
                      <div className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="text-amber-500">⭐</span>
                          <span>Hotel Small Daddy Plus</span>
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Calangute, Goa
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CUSTOMER CONTACT INFORMATION */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
                  Your Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98250 12345"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. vikram@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Special Requests / Notes
                    </label>
                    <input
                      type="text"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Need child seat, early check-in, sea view"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleWhatsAppChat}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enquire Directly on WhatsApp</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-extrabold text-xs shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* LIGHTBOX FOR PHOTO ZOOM */}
      {activePhotoPreview && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActivePhotoPreview(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/20 p-2 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden">
              <Image
                src={activePhotoPreview.url}
                alt={activePhotoPreview.title || "Showcase Preview"}
                fill
                className="object-cover"
              />
            </div>
            <div className="px-2 pb-1 flex items-center justify-between text-white">
              <div>
                <h4 className="font-bold text-sm">{activePhotoPreview.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{activePhotoPreview.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoPreview(null)}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
