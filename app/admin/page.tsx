"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Compass,
  Package,
  Plane,
  Train,
  Phone,
  Mail,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
  Plus,
  ArrowLeft,
  MessageCircle,
  Eye,
  Edit,
  Save,
  Search,
  Lock,
} from "lucide-react";
import {
  getStoredLeads,
  updateLeadStatus,
  deleteLead,
  getStoredDestinations,
  saveDestination,
  deleteDestination,
  getStoredCompanyInfo,
  saveCompanyInfo,
} from "@/lib/storage";
import { InquiryLead, Destination, CompanyInfo } from "@/lib/types";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [activeTab, setActiveTab] = useState<"leads" | "destinations" | "settings">("leads");
  const [leads, setLeads] = useState<InquiryLead[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(getStoredCompanyInfo());
  const [searchQuery, setSearchQuery] = useState("");
  const [leadFilter, setLeadFilter] = useState<"all" | "package" | "flight" | "train">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Destination modal state
  const [isAddDestOpen, setIsAddDestOpen] = useState(false);
  const [newDest, setNewDest] = useState<Partial<Destination>>({
    category: "india",
    highlights: ["Sightseeing", "Hotel Stay", "Transfers"],
  });

  // Load from localStorage on mount & check session auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("r_travel_owner_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
    setLeads(getStoredLeads());
    setDestinations(getStoredDestinations());
    setCompanyInfo(getStoredCompanyInfo());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Owner Passcode
    if (pinInput === "1234" || pinInput === "rtravel2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("r_travel_owner_auth", "true");
      setPinError("");
    } else {
      setPinError("Invalid Owner PIN. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("r_travel_owner_auth");
  };

  const handleStatusChange = (id: string, status: InquiryLead["status"]) => {
    updateLeadStatus(id, status);
    setLeads(getStoredLeads());
  };

  const handleDeleteLead = (id: string) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      deleteLead(id);
      setLeads(getStoredLeads());
    }
  };

  const handleDeleteDestination = (id: string) => {
    if (confirm("Are you sure you want to remove this destination?")) {
      deleteDestination(id);
      setDestinations(getStoredDestinations());
    }
  };

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.name || !newDest.startingPrice) {
      alert("Please fill in destination name and starting price.");
      return;
    }

    const created: Destination = {
      id: "dest-" + Date.now(),
      name: newDest.name || "New Destination",
      tagline: newDest.tagline || "Special Tour",
      category: (newDest.category as any) || "india",
      image:
        newDest.image ||
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
      duration: newDest.duration || "5 Days / 4 Nights",
      startingPrice: newDest.startingPrice || "₹15,000",
      featured: false,
      highlights: newDest.highlights || ["Local Sightseeing", "Complimentary Breakfast"],
    };

    saveDestination(created);
    setDestinations(getStoredDestinations());
    setIsAddDestOpen(false);
    setNewDest({ category: "india", highlights: [] });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyInfo(companyInfo);
    alert("Company settings updated successfully!");
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.destination && lead.destination.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = leadFilter === "all" || lead.type === leadFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070B18] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0C142E]/90 border border-white/15 backdrop-blur-2xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5A3C] to-[#F59E0B] p-0.5 mx-auto mb-5 shadow-lg shadow-[#FF5A3C]/30">
            <div className="w-full h-full bg-[#090E20] rounded-[14px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#FF5A3C]" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white font-['Outfit']">
            Owner Access Only
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            This private administration area is strictly for <strong>Priykant Gupta</strong> and authorized staff.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Owner PIN (Default: 1234)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-center text-sm font-semibold tracking-widest focus:outline-none focus:border-[#FF5A3C] transition-colors"
                autoFocus
              />
              {pinError && (
                <p className="text-xs font-semibold text-rose-400 mt-2">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-bold text-sm shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B18] text-slate-200">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#090E20]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Return to Main Website"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white font-['Outfit']">
                  R TRAVEL <span className="text-[#FF5A3C]">WORLD</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  Owner Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mehsana Office • Managing Leads, Destinations & Content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-300 transition-all"
            >
              Lock / Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</span>
              <div className="p-2 rounded-lg bg-[#FF5A3C]/20 text-[#FF5A3C]">
                <LayoutDashboard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{leads.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Direct website enquiries</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Enquiries</span>
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">
              {leads.filter((l) => l.status === "New").length}
            </div>
            <p className="text-[11px] text-rose-400 mt-1">Pending first call</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Booked</span>
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">
              {leads.filter((l) => l.status === "Booked").length}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">Successful tours planned</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Destinations</span>
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{destinations.length}</div>
            <p className="text-[11px] text-amber-400 mt-1">India & International</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "leads"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Enquiries & Leads ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("destinations")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "destinations"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Manage Destinations ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "settings"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Company Info & Numbers</span>
          </button>
        </div>

        {/* TAB 1: CUSTOMER LEADS */}
        {activeTab === "leads" && (
          <div>
            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or destination..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#FF5A3C]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={leadFilter}
                  onChange={(e) => setLeadFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF5A3C]"
                >
                  <option value="all">All Service Types</option>
                  <option value="package">Tour Packages</option>
                  <option value="flight">Flight Bookings</option>
                  <option value="train">Train Bookings</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF5A3C]"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Booked">Booked</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Leads Card List */}
            {filteredLeads.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No inquiries found</h4>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map((lead) => {
                  const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                    lead.fullName
                  )}!%20This%20is%20Priykant%20Gupta%20from%20R%20Travel%20World.%20Thank%20you%20for%20your%20inquiry%20for%20${encodeURIComponent(
                    lead.destination || "travel package"
                  )}.`;

                  return (
                    <div
                      key={lead.id}
                      className="p-5 rounded-2xl bg-[#0F172A]/90 border border-white/10 backdrop-blur-md shadow-lg text-left"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white font-['Outfit']">
                              {lead.fullName}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                lead.type === "package"
                                  ? "bg-[#FF5A3C]/20 text-[#FF5A3C] border border-[#FF5A3C]/40"
                                  : lead.type === "flight"
                                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              }`}
                            >
                              {lead.type}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 hover:text-[#FF5A3C] font-semibold text-white"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#FF5A3C]" />
                              <span>{lead.phone}</span>
                            </a>
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-1.5 hover:text-[#FF5A3C]"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lead.email}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status Switcher & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Status:</span>
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(lead.id, e.target.value as any)
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none border ${
                                lead.status === "New"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                  : lead.status === "Contacted"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : lead.status === "Booked"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-slate-700 text-slate-300 border-slate-600"
                              }`}
                            >
                              <option value="New" className="bg-[#0F172A] text-rose-300">New</option>
                              <option value="Contacted" className="bg-[#0F172A] text-amber-300">Contacted</option>
                              <option value="Booked" className="bg-[#0F172A] text-emerald-300">Booked</option>
                              <option value="Closed" className="bg-[#0F172A] text-slate-300">Closed</option>
                            </select>
                          </div>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 hover:scale-105 transition-all"
                            title="Open WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Destination / Details
                          </span>
                          <p className="font-bold text-white text-sm">
                            {lead.destination || "Not Specified"}
                          </p>
                          {lead.packageName && (
                            <p className="text-slate-300 text-[11px] mt-0.5">{lead.packageName}</p>
                          )}
                          {lead.flightType && (
                            <p className="text-sky-400 text-[11px] mt-0.5 font-medium">Type: {lead.flightType}</p>
                          )}
                          {lead.trainClass && (
                            <p className="text-amber-400 text-[11px] mt-0.5 font-medium">Class: {lead.trainClass}</p>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Travel Date & Party Size
                          </span>
                          <p className="font-semibold text-white">
                            Date: {lead.travelDate || "Flexible"}
                          </p>
                          <p className="text-slate-300 mt-1">
                            Total Travellers: <strong className="text-emerald-400">{lead.travellers.length}</strong>
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {lead.travellers.map((t, idx) => (
                              <p key={idx} className="text-[11px] text-slate-400">
                                • {t.name || `Traveller ${idx + 1}`} ({t.age || "Age N/A"}, {t.gender})
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Special Requirements
                          </span>
                          <p className="text-slate-300 text-[11px] italic leading-relaxed">
                            {lead.specialRequirements || "No special dietary or accommodation notes given."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DESTINATIONS MANAGEMENT */}
        {activeTab === "destinations" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs sm:text-sm text-slate-400">
                Add, preview, or manage travel destinations featured on the homepage.
              </p>
              <button
                onClick={() => setIsAddDestOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#FF5A3C]/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </button>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="rounded-2xl bg-[#0F172A] border border-white/10 overflow-hidden shadow-lg flex flex-col justify-between text-left"
                >
                  <div className="relative h-44 w-full">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300">
                      {dest.startingPrice}
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FF5A3C] text-[10px] font-bold text-white uppercase">
                      {dest.category}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#FF5A3C]">
                        {dest.tagline}
                      </span>
                      <h4 className="text-base font-bold text-white">{dest.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{dest.duration}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {dest.highlights.length} Highlights
                      </span>
                      <button
                        onClick={() => handleDeleteDestination(dest.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 text-xs"
                        title="Delete Destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Destination Modal */}
            {isAddDestOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-white/20 p-6 shadow-2xl text-left">
                  <h3 className="text-xl font-bold text-white font-['Outfit'] mb-4">
                    Add New Destination
                  </h3>
                  <form onSubmit={handleAddDestination} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Destination Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lakshadweep"
                        value={newDest.name || ""}
                        onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Tagline</label>
                        <input
                          type="text"
                          placeholder="e.g. Coral Paradise"
                          value={newDest.tagline || ""}
                          onChange={(e) => setNewDest({ ...newDest, tagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Category</label>
                        <select
                          value={newDest.category}
                          onChange={(e) => setNewDest({ ...newDest, category: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-[#090E20] border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="india">Explore India</option>
                          <option value="international">Out of India</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Starting Price</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹22,999"
                          value={newDest.startingPrice || ""}
                          onChange={(e) => setNewDest({ ...newDest, startingPrice: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 5 Days / 4 Nights"
                          value={newDest.duration || ""}
                          onChange={(e) => setNewDest({ ...newDest, duration: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Image URL (Unsplash or direct image)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newDest.image || ""}
                        onChange={(e) => setNewDest({ ...newDest, image: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsAddDestOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold"
                      >
                        Add Destination
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPANY SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-2xl text-left">
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10">
              <h3 className="text-lg font-bold text-white font-['Outfit'] mb-4">
                Business Information & Contact Settings
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Business Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Founder / Owner Name</label>
                    <input
                      type="text"
                      value={companyInfo.founder}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, founder: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Experience Years</label>
                    <input
                      type="text"
                      value={companyInfo.experienceYears}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, experienceYears: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Office Location</label>
                  <textarea
                    rows={2}
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Primary Phone Number</label>
                    <input
                      type="text"
                      value={companyInfo.phones[0]}
                      onChange={(e) => {
                        const updated = [...companyInfo.phones];
                        updated[0] = e.target.value;
                        setCompanyInfo({ ...companyInfo, phones: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Secondary Phone Number</label>
                    <input
                      type="text"
                      value={companyInfo.phones[1] || ""}
                      onChange={(e) => {
                        const updated = [...companyInfo.phones];
                        updated[1] = e.target.value;
                        setCompanyInfo({ ...companyInfo, phones: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">WhatsApp Number (e.g. 919427286755)</label>
                  <input
                    type="text"
                    value={companyInfo.whatsapp}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-bold shadow-lg shadow-[#FF5A3C]/30 hover:scale-105 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
