"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  Trash2,
  Send,
  Plane,
  Train,
  Package,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { saveLead } from "@/lib/storage";
import { destinationsData, servicesData, companyData } from "@/lib/initialData";

export const InquirySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"package" | "flight" | "train">("package");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [packageName, setPackageName] = useState("");
  const [flightType, setFlightType] = useState<"one-way" | "round-trip" | "multi-city">("round-trip");
  const [trainClass, setTrainClass] = useState("3AC");
  const [travelDate, setTravelDate] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Travellers list
  const [travellers, setTravellers] = useState([
    { name: "", age: "", gender: "Male" },
  ]);

  React.useEffect(() => {
    const handleSelectDest = (e: Event) => {
      const customEvent = e as CustomEvent<{ destination: string }>;
      if (customEvent.detail?.destination) {
        setActiveTab("package");
        setDestination(customEvent.detail.destination);
      }
    };
    window.addEventListener("select-destination", handleSelectDest);
    return () => window.removeEventListener("select-destination", handleSelectDest);
  }, []);

  const handleAddTraveller = () => {
    if (travellers.length < 9) {
      setTravellers([...travellers, { name: "", age: "", gender: "Male" }]);
    }
  };

  const handleRemoveTraveller = (index: number) => {
    if (travellers.length > 1) {
      setTravellers(travellers.filter((_, i) => i !== index));
    }
  };

  const handleTravellerChange = (
    index: number,
    field: "name" | "age" | "gender",
    value: string
  ) => {
    const updated = [...travellers];
    updated[index][field] = value;
    setTravellers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Please provide at least your Full Name and Phone Number.");
      return;
    }

    setIsSubmitting(true);

    try {
      saveLead({
        type: activeTab,
        fullName,
        phone,
        email,
        destination: destination || (activeTab === "package" ? "Goa" : "Ahmedabad to Mumbai"),
        packageName: packageName || (activeTab === "package" ? "Customized Tour Package" : undefined),
        flightType: activeTab === "flight" ? flightType : undefined,
        trainClass: activeTab === "train" ? trainClass : undefined,
        travelDate,
        travellers,
        specialRequirements,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const getWhatsAppRedirectUrl = () => {
    const message = `*New Travel Inquiry - Small Daddy Plus*%0A%0A*Name:* ${encodeURIComponent(
      fullName || "Customer"
    )}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Type:* ${encodeURIComponent(
      activeTab.toUpperCase()
    )}%0A*Destination/Route:* ${encodeURIComponent(
      destination || "General Inquiry"
    )}%0A*Date:* ${encodeURIComponent(
      travelDate || "Flexible"
    )}%0A*Total Travellers:* ${travellers.length}%0A*Special Notes:* ${encodeURIComponent(
      specialRequirements || "None"
    )}`;
    return `https://wa.me/919427286755?text=${message}`;
  };

  return (
    <section id="contact" className="py-24 relative bg-slate-50 dark:bg-[#070B18] transition-colors duration-300 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF5A3C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Information matching Screenshot 5 */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A3C]/10 border border-[#FF5A3C]/30 text-xs font-bold text-[#FF5A3C] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-[1.15]">
              Plan Your <span className="text-gradient-coral">Dream Journey</span> Today
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether you need a custom holiday package, domestic or international flight tickets, or railway reservations, we handle all the paperwork and planning. Select the service you need in the form to get started.
            </p>

            {/* Contact Details Cards */}
            <div className="mt-8 space-y-4">
              {/* Founder */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 flex items-center justify-center shrink-0 text-[#FF5A3C]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#FF5A3C] uppercase tracking-wider">
                    Founder & Owner
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">Priykant Gupta</p>
                </div>
              </div>

              {/* Office Location */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Office Location
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    6/B, Jagdish Chamber, Opp. Rajkamal Petrol pump, Highway, Mehsana 384002 - Gujarat
                  </p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-500 dark:text-sky-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Phone Numbers
                  </span>
                  <div className="flex flex-col text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                    <a href="tel:+919427286755" className="hover:text-[#FF5A3C] transition-colors">
                      +91 94272 86755
                    </a>
                    <a href="tel:+919173136111" className="hover:text-[#FF5A3C] transition-colors">
                      +91 91731 36111
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Addresses */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500 dark:text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Email Address
                  </span>
                  <div className="flex flex-col text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
                    <a href="mailto:info@rtravelworld.com" className="hover:text-[#FF5A3C] transition-colors">
                      info@rtravelworld.com
                    </a>
                    <a href="mailto:rtravelworldmehsana@gmail.com" className="hover:text-[#FF5A3C] transition-colors">
                      rtravelworldmehsana@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button matching screenshot 5 */}
            <div className="mt-6">
              <a
                href="https://wa.me/919427286755?text=Hello%20R%20Travel%20World!%20I%20want%20to%20inquire%20about%20a%20tour%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#25D366]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Multi-tab Interactive Booking Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0F172A]/90 backdrop-blur-2xl shadow-xl dark:shadow-2xl p-6 sm:p-8 text-left">
              
              {/* Form Tabs: Package Enquiry, Flight Booking, Train Booking */}
              <div className="flex items-center border-b border-slate-200 dark:border-white/10 pb-4 mb-6 overflow-x-auto gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("package");
                    setIsSubmitted(false);
                  }}
                  className={`flex items-center gap-2 pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "package"
                      ? "border-[#FF5A3C] text-[#FF5A3C]"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Package Enquiry</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("flight");
                    setIsSubmitted(false);
                  }}
                  className={`flex items-center gap-2 pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "flight"
                      ? "border-[#FF5A3C] text-[#FF5A3C]"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  <span>Flight Booking</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("train");
                    setIsSubmitted(false);
                  }}
                  className={`flex items-center gap-2 pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "train"
                      ? "border-[#FF5A3C] text-[#FF5A3C]"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Train className="w-4 h-4" />
                  <span>Train Booking</span>
                </button>
              </div>

              {/* Success Message Banner */}
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Thank You, {fullName || "Traveller"}!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                    Your inquiry has been successfully recorded in our system. Priykant Gupta and our travel desk will contact you shortly with the best options and fares.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getWhatsAppRedirectUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#25D366]/30 hover:scale-105 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Send Details Directly on WhatsApp</span>
                    </a>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-semibold transition-colors"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* CONTACT DETAILS SECTION */}
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5A3C] mb-3">
                      Contact Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Full Name <span className="text-[#FF5A3C]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Priykant Gupta"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] focus:bg-white dark:focus:bg-white/10 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Phone Number <span className="text-[#FF5A3C]">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 94272 86755"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] focus:bg-white dark:focus:bg-white/10 transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] focus:bg-white dark:focus:bg-white/10 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DESTINATION & SERVICE SPECIFICS */}
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5A3C] mb-3">
                      {activeTab === "package"
                        ? "Destination & Tour Package"
                        : activeTab === "flight"
                        ? "Flight Routes & Class"
                        : "Train Route & Reservation"}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Destination / Sector */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {activeTab === "package" ? "Select Destination State / Country *" : "Origin & Destination *"}
                        </label>
                        <select
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090E20] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] transition-colors"
                        >
                          <option value="" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">-- Select Destination --</option>
                          <optgroup label="Popular India Destinations" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">
                            <option value="Goa">Goa (Sun, Sea & Beaches)</option>
                            <option value="Gujarat">Gujarat (Land of Legends)</option>
                            <option value="Kashmir">Kashmir (Paradise on Earth)</option>
                            <option value="Himachal Pradesh">Himachal Pradesh (Snowy Peaks)</option>
                            <option value="Uttarakhand">Uttarakhand (Devbhoomi)</option>
                            <option value="Kerala">Kerala (God&apos;s Own Country)</option>
                            <option value="Andaman & Nicobar">Andaman & Nicobar Islands</option>
                            <option value="Leh Ladakh">Leh Ladakh</option>
                            <option value="Sikkim & Darjeeling">Sikkim & Darjeeling</option>
                          </optgroup>
                          <optgroup label="International Destinations" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">
                            <option value="Dubai, UAE">Dubai, UAE</option>
                            <option value="Bali, Indonesia">Bali, Indonesia</option>
                            <option value="Maldives">Maldives Luxury Water Villa</option>
                            <option value="Thailand">Thailand (Phuket & Krabi)</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Switzerland">Switzerland</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Package / Ticket Type */}
                      {activeTab === "package" && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Select Package Type *
                          </label>
                          <select
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090E20] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] transition-colors"
                          >
                            <option value="" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">-- Select Package --</option>
                            <option value="Customized Family Holiday" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Customized Family Holiday</option>
                            <option value="Honeymoon & Couple Retreat" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Honeymoon & Couple Retreat</option>
                            <option value="Group Tour Departure" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Group Tour Departure</option>
                            <option value="Pilgrimage & Senior Yatra" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Pilgrimage & Senior Yatra</option>
                            <option value="Corporate / MICE Tour" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Corporate / MICE Tour</option>
                            <option value="Weekend Getaway" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Weekend Getaway</option>
                          </select>
                        </div>
                      )}

                      {activeTab === "flight" && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Flight Journey Type
                          </label>
                          <select
                            value={flightType}
                            onChange={(e) => setFlightType(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090E20] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] transition-colors"
                          >
                            <option value="round-trip" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Round Trip</option>
                            <option value="one-way" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">One Way</option>
                            <option value="multi-city" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Multi City / International</option>
                          </select>
                        </div>
                      )}

                      {activeTab === "train" && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Preferred Train Class
                          </label>
                          <select
                            value={trainClass}
                            onChange={(e) => setTrainClass(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090E20] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] transition-colors"
                          >
                            <option value="3AC" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">3rd AC (3AC)</option>
                            <option value="2AC" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">2nd AC (2AC)</option>
                            <option value="1AC" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">1st AC (1AC)</option>
                            <option value="Vande Bharat / CC" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Vande Bharat (Executive / CC)</option>
                            <option value="Sleeper" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Sleeper Class (SL)</option>
                            <option value="Tatkal Assistance" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Tatkal Urgent Assistance</option>
                          </select>
                        </div>
                      )}

                      {/* Travel Date */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Approximate Travel Date
                        </label>
                        <input
                          type="date"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] focus:bg-white dark:focus:bg-white/10 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TRAVELLER DETAILS SECTION matching screenshot 5 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5A3C]">
                        Traveller Details
                      </h4>
                      {travellers.length < 9 && (
                        <button
                          type="button"
                          onClick={handleAddTraveller}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Traveller (Max 9)</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {travellers.map((traveller, index) => (
                        <div
                          key={index}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-12 gap-3 items-center"
                        >
                          <div className="col-span-12 sm:col-span-6">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                              Traveller #{index + 1} Full Name
                            </label>
                            <input
                              type="text"
                              value={traveller.name}
                              onChange={(e) =>
                                handleTravellerChange(index, "name", e.target.value)
                              }
                              placeholder="Full Name"
                              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-[#FF5A3C]"
                            />
                          </div>

                          <div className="col-span-5 sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              value={traveller.age}
                              onChange={(e) =>
                                handleTravellerChange(index, "age", e.target.value)
                              }
                              placeholder="Age"
                              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-[#FF5A3C]"
                            />
                          </div>

                          <div className="col-span-5 sm:col-span-3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                              Gender
                            </label>
                            <select
                              value={traveller.gender}
                              onChange={(e) =>
                                handleTravellerChange(index, "gender", e.target.value)
                              }
                              className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                            >
                              <option value="Male" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Male</option>
                              <option value="Female" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Female</option>
                              <option value="Other" className="bg-white dark:bg-[#090E20] text-slate-900 dark:text-white">Other</option>
                            </select>
                          </div>

                          <div className="col-span-2 sm:col-span-1 flex justify-end">
                            {travellers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTraveller(index)}
                                className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors"
                                title="Remove traveller"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADDITIONAL MESSAGE / SPECIAL REQUIREMENTS */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Additional Message / Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      placeholder="Enter details like dates of travel, food preferences (Jain/Veg), hotel star ratings, car preference..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF5A3C] focus:bg-white dark:focus:bg-white/10 transition-colors"
                    />
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#FF5A3C] via-[#FF6C4B] to-[#E04629] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#FF5A3C]/40 hover:shadow-[#FF5A3C]/60 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    <span>
                      {activeTab === "package"
                        ? "Send Package Enquiry"
                        : activeTab === "flight"
                        ? "Submit Flight Booking Request"
                        : "Submit Railway Reservation Request"}
                    </span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
