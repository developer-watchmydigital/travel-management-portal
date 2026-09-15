"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  X,
  Sparkles,
  MapPin,
  Check,
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
  getStoredPackages,
  savePackage,
  deletePackage,
} from "@/lib/storage";
import { InquiryLead, Destination, CompanyInfo, CuratedPackage, ItineraryDay, PackageInclusionItem } from "@/lib/types";
import { curatedRegionsList } from "@/lib/initialData";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [activeTab, setActiveTab] = useState<"leads" | "packages" | "destinations" | "settings">("leads");
  const [leads, setLeads] = useState<InquiryLead[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<CuratedPackage[]>([]);
  const [packageFilterState, setPackageFilterState] = useState<string>("all");
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [packagePage, setPackagePage] = useState(1);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CuratedPackage | null>(null);
  const [pkgFormData, setPkgFormData] = useState<Partial<CuratedPackage>>({
    state: "Goa",
    title: "",
    subtitle: "",
    route: "",
    duration: "4 Days & 3 Nights",
    categoryBadge: "Beach & Watersports",
    badgeGradient: "from-pink-500 to-rose-500",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
    originalPrice: "16,000",
    discountedPrice: "11,999",
    savings: "4,001",
    highlights: ["Grand Island Scuba", "North Goa Forts", "Sunset Cruise"],
    itinerary: [
      { day: 1, title: "Arrival & Hotel Check-in", description: "Arrival, private cab transfer to resort, and leisure beach evening." },
      { day: 2, title: "Local Sightseeing & Tour", description: "Full-day sightseeing of popular points with private vehicle." },
      { day: 3, title: "Scenic Exploration & Sunset", description: "Experience scenic sights and local sunset views." },
      { day: 4, title: "Shopping & Departure Drop", description: "Free time for local markets and drop to airport/railway station." },
    ],
    inclusions: ["Deluxe Hotel Stay", "Daily Breakfast", "Private AC Cab Transfers", "All Driver Allowances & Tolls"],
    exclusions: ["Airfare / Train tickets", "Personal expenses", "Optional watersports"],
  });
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
    setMounted(true);
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("r_travel_owner_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
    setLeads(getStoredLeads());
    setDestinations(getStoredDestinations());
    setPackages(getStoredPackages());
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

  // Package Handlers
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPkgFormData({
      state: packageFilterState !== "all" ? packageFilterState : "Goa",
      title: "",
      subtitle: "",
      route: "",
      duration: "4 Days & 3 Nights",
      categoryBadge: "Beach & Watersports",
      badgeGradient: "from-pink-500 to-rose-500",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
      originalPrice: "16,000",
      discountedPrice: "11,999",
      savings: "4,001",
      highlights: ["Grand Island Scuba & Snorkeling", "North Goa Forts & Sunset Cruise", "Private Cab & Resort Transfers"],
      itinerary: [
        { day: 1, title: "Arrival & Check-in", description: "Airport/Station pickup, check-in to resort and leisure beach evening." },
        { day: 2, title: "Grand Island Boat Tour & Watersports", description: "Dolphin spotting, scuba diving, island lunch and watersports." },
        { day: 3, title: "North Goa Sightseeing & Mandovi Cruise", description: "Aguada Fort, Chapora Fort, Anjuna Beach and luxury evening river cruise." },
        { day: 4, title: "Local Markets & Departure", description: "Morning shopping and timely drop to airport or railway station." },
      ],
      inclusions: [
        "3 Nights Deluxe AC Hotel Stay",
        "Daily Buffet Breakfast",
        "Private AC Cab for Sightseeing & Transfers",
        "All Tolls, Parking & Driver Allowances",
      ],
      detailedInclusions: [
        {
          id: "inc-" + Date.now() + "-1",
          title: "Grand Island Scuba Diving & Dolphin Safari Cruise",
          description: "Arabian Sea catamaran cruise, dolphin watching, certified scuba diving with underwater photos & buffet lunch.",
          image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop",
        },
        {
          id: "inc-" + Date.now() + "-2",
          title: "4-Star Beachside Resort Stay with Pool & Breakfast",
          description: "Deluxe air-conditioned rooms, swimming pool, private sun terrace, and daily chef-curated breakfast.",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        },
        {
          id: "inc-" + Date.now() + "-3",
          title: "24/7 Dedicated On-Trip Concierge & Trip Manager Support",
          description: "Our dedicated ground team remains at your service throughout the tour for check-in coordination and guidance.",
          image: "", // Centered, no photo
        },
      ],
      exclusions: [
        "Airfare or Train tickets (Bookings available on request)",
        "Personal expenses and meals not mentioned",
        "Optional adventure rides",
      ],
    });
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: CuratedPackage) => {
    setEditingPackage(pkg);
    setPkgFormData({
      ...pkg,
      highlights: [...(pkg.highlights || [])],
      itinerary: pkg.itinerary ? pkg.itinerary.map((d) => ({ ...d })) : [],
      inclusions: [...(pkg.inclusions || [])],
      detailedInclusions: pkg.detailedInclusions
        ? pkg.detailedInclusions.map((d) => ({ ...d }))
        : (pkg.inclusions || []).map((inc, idx) => ({
            id: `inc-${Date.now()}-${idx}`,
            category: "Included Service",
            title: inc,
            description: "Service included with package guarantee.",
            image: "",
          })),
      flyerImage: pkg.flyerImage || "",
      galleryImages: pkg.galleryImages ? [...pkg.galleryImages] : [],
      exclusions: [...(pkg.exclusions || [])],
    });
    setIsPackageModalOpen(true);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm("Are you sure you want to delete this curated package?")) {
      deletePackage(id);
      setPackages(getStoredPackages());
    }
  };

  const handleAddDetailedInclusion = () => {
    const current = pkgFormData.detailedInclusions || [];
    setPkgFormData({
      ...pkgFormData,
      detailedInclusions: [
        ...current,
        {
          id: "inc-" + Date.now(),
          category: "Included Service",
          title: "",
          description: "",
          image: "",
        },
      ],
    });
  };

  const handleUpdateDetailedInclusion = (
    index: number,
    field: "title" | "description" | "image" | "category",
    value: string
  ) => {
    const updated = [...(pkgFormData.detailedInclusions || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setPkgFormData({ ...pkgFormData, detailedInclusions: updated });
    }
  };

  const handleRemoveDetailedInclusion = (index: number) => {
    const updated = (pkgFormData.detailedInclusions || []).filter((_, i) => i !== index);
    setPkgFormData({ ...pkgFormData, detailedInclusions: updated });
  };

  const handleUpdateGalleryImage = (index: number, value: string) => {
    const updated = [...(pkgFormData.galleryImages || [])];
    updated[index] = value;
    setPkgFormData({ ...pkgFormData, galleryImages: updated });
  };

  const handleAddGalleryImage = () => {
    const updated = [...(pkgFormData.galleryImages || [])];
    updated.push("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop");
    setPkgFormData({ ...pkgFormData, galleryImages: updated });
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = (pkgFormData.galleryImages || []).filter((_, i) => i !== index);
    setPkgFormData({ ...pkgFormData, galleryImages: updated });
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgFormData.title || !pkgFormData.discountedPrice || !pkgFormData.state) {
      alert("Please enter package title, state, and discounted price.");
      return;
    }

    const origNum = parseInt(pkgFormData.originalPrice?.replace(/[^0-9]/g, "") || "0");
    const discNum = parseInt(pkgFormData.discountedPrice?.replace(/[^0-9]/g, "") || "0");
    const calculatedSavings = origNum > discNum ? (origNum - discNum).toLocaleString("en-IN") : (pkgFormData.savings || "0");

    const packageToSave: CuratedPackage = {
      id: editingPackage ? editingPackage.id : "pkg-" + Date.now(),
      state: pkgFormData.state || "Goa",
      title: pkgFormData.title || "",
      subtitle: pkgFormData.subtitle || "",
      route: pkgFormData.route || "",
      duration: pkgFormData.duration || "4 Days & 3 Nights",
      categoryBadge: pkgFormData.categoryBadge || "Holiday Tour",
      badgeGradient: pkgFormData.badgeGradient || "from-pink-500 to-rose-500",
      image: pkgFormData.image || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
      flyerImage: pkgFormData.flyerImage ? pkgFormData.flyerImage.trim() : undefined,
      galleryImages: (pkgFormData.galleryImages && pkgFormData.galleryImages.length > 0) ? pkgFormData.galleryImages : undefined,
      originalPrice: pkgFormData.originalPrice || "0",
      discountedPrice: pkgFormData.discountedPrice || "0",
      savings: calculatedSavings,
      highlights: (pkgFormData.highlights && pkgFormData.highlights.length > 0) ? pkgFormData.highlights : ["Sightseeing", "Hotel Stay", "Transfers"],
      itinerary: (pkgFormData.itinerary && pkgFormData.itinerary.length > 0) ? pkgFormData.itinerary : [
        { day: 1, title: "Day 1: Arrival & Transfer", description: "Arrival, hotel check-in and evening at leisure." },
        { day: 2, title: "Day 2: Sightseeing", description: "Full day sightseeing tour." }
      ],
      inclusions: (pkgFormData.inclusions && pkgFormData.inclusions.length > 0) ? pkgFormData.inclusions : ["Hotel Stay", "Breakfast", "Cab Transfers"],
      detailedInclusions: (pkgFormData.detailedInclusions && pkgFormData.detailedInclusions.length > 0) ? pkgFormData.detailedInclusions : undefined,
      exclusions: (pkgFormData.exclusions && pkgFormData.exclusions.length > 0) ? pkgFormData.exclusions : ["Flight/Train", "Personal Expenses"],
    };

    savePackage(packageToSave);
    setPackages(getStoredPackages());
    setIsPackageModalOpen(false);
  };

  const handleAddItineraryDay = () => {
    const currentItinerary = pkgFormData.itinerary || [];
    const nextDayNum = currentItinerary.length + 1;
    setPkgFormData({
      ...pkgFormData,
      itinerary: [
        ...currentItinerary,
        { day: nextDayNum, title: `Day ${nextDayNum}: Sightseeing & Exploration`, description: "Full day private sightseeing of key attractions." },
      ],
    });
  };

  const handleUpdateItineraryDay = (index: number, field: "title" | "description", value: string) => {
    const updated = [...(pkgFormData.itinerary || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setPkgFormData({ ...pkgFormData, itinerary: updated });
    }
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = (pkgFormData.itinerary || [])
      .filter((_, i) => i !== index)
      .map((day, idx) => ({ ...day, day: idx + 1 }));
    setPkgFormData({ ...pkgFormData, itinerary: updated });
  };

  // Filtered Curated Packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesState = packageFilterState === "all" || pkg.state === packageFilterState;
    const matchesSearch =
      !packageSearchQuery ||
      pkg.title.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
      pkg.state.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
      (pkg.subtitle && pkg.subtitle.toLowerCase().includes(packageSearchQuery.toLowerCase())) ||
      (pkg.route && pkg.route.toLowerCase().includes(packageSearchQuery.toLowerCase()));
    return matchesState && matchesSearch;
  });

  const packagesPerPage = 9;
  const totalPackagePages = Math.max(1, Math.ceil(filteredPackages.length / packagesPerPage));
  const paginatedPackages = filteredPackages.slice(
    (packagePage - 1) * packagesPerPage,
    packagePage * packagesPerPage
  );

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
            This private administration area is strictly for <strong>Masrur Ahmed, Masum Ahmed</strong> and authorized staff.
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
                <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <Image
                    src="/favicon.png"
                    alt="Watch My Trip Package Goa"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-bold text-white font-['Outfit']">
                  Watch My Trip Package Goa
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curated Packages</span>
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{packages.length}</div>
            <p className="text-[11px] text-pink-400 mt-1">State-wise tours & plans</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destinations</span>
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{destinations.length}</div>
            <p className="text-[11px] text-amber-400 mt-1">India & International</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4 mb-8">
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
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "packages"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Curated Packages ({packages.length})</span>
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
                  )}!%20This%20is%20Watch%20My%20Trip%20Package%20Goa.%20Thank%20you%20for%20your%20inquiry%20for%20${encodeURIComponent(
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

        {/* TAB: CURATED EXPERIENCES & PACKAGES MANAGEMENT */}
        {activeTab === "packages" && (
          <div>
            {/* Top Bar with Info, Search, State Filter & Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Curated Tour Packages
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage state-wise packages, day-by-day itineraries, pricing, and highlights.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={packageSearchQuery}
                    onChange={(e) => {
                      setPackageSearchQuery(e.target.value);
                      setPackagePage(1);
                    }}
                    placeholder="Search packages..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#FF5A3C]"
                  />
                </div>

                {/* State Filter Dropdown */}
                <select
                  value={packageFilterState}
                  onChange={(e) => {
                    setPackageFilterState(e.target.value);
                    setPackagePage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF5A3C]"
                >
                  <option value="all">All States ({packages.length})</option>
                  {curatedRegionsList.map((state) => {
                    const count = packages.filter((p) => p.state === state).length;
                    return (
                      <option key={state} value={state}>
                        {state} ({count})
                      </option>
                    );
                  })}
                </select>

                {/* Add New Package Button */}
                <button
                  onClick={handleOpenAddPackage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs shadow-lg shadow-[#FF5A3C]/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Package</span>
                </button>
              </div>
            </div>

            {/* Quick State Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
              <button
                onClick={() => {
                  setPackageFilterState("all");
                  setPackagePage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  packageFilterState === "all"
                    ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                All States ({packages.length})
              </button>
              {curatedRegionsList.map((st) => {
                const count = packages.filter((p) => p.state === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => {
                      setPackageFilterState(st);
                      setPackagePage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      packageFilterState === st
                        ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/20"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        count > 0 ? "bg-white/20 text-white font-bold" : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Packages Grid / Empty State */}
            {filteredPackages.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10 p-6">
                <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">
                  No curated packages found {packageFilterState !== "all" ? `for ${packageFilterState}` : ""}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {packageFilterState !== "all"
                    ? `Visitors selecting '${packageFilterState}' currently see the 'Service Launching Soon' notice. Click below to add a package and launch this state!`
                    : "Create your first package to display it on the website."}
                </p>
                <button
                  onClick={handleOpenAddPackage}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs shadow-lg shadow-[#FF5A3C]/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Package for {packageFilterState !== "all" ? packageFilterState : "Goa"}</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-5 rounded-2xl bg-[#0F172A] border border-white/10 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all"
                    >
                      <div>
                        {/* Image with badges */}
                        <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-slate-800">
                          <Image
                            src={pkg.image}
                            alt={pkg.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/40" />

                          {/* State badge */}
                          <div className="absolute top-3 left-3 bg-[#FF5A3C] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-md">
                            {pkg.state}
                          </div>

                          {/* Duration badge */}
                          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1.5 shadow-md">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{pkg.duration}</span>
                          </div>

                          {/* Category badge */}
                          <div className="absolute bottom-3 left-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-md bg-gradient-to-r ${
                                pkg.badgeGradient || "from-pink-500 to-rose-500"
                              }`}
                            >
                              {pkg.categoryBadge}
                            </span>
                          </div>
                        </div>

                        {/* Route & Title */}
                        <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{pkg.route}</span>
                        </div>

                        <h4 className="text-base font-bold text-white font-['Outfit'] line-clamp-2 mb-1">
                          {pkg.title}
                        </h4>
                        {pkg.subtitle && (
                          <p className="text-xs text-slate-400 line-clamp-1 mb-3">{pkg.subtitle}</p>
                        )}

                        {/* Highlights */}
                        <div className="space-y-1 mb-4">
                          {(pkg.highlights || []).slice(0, 3).map((hl, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{hl}</span>
                            </div>
                          ))}
                        </div>

                        {/* Itinerary & Inclusion stats */}
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 flex items-center justify-between mb-4">
                          <span className="text-slate-400">Itinerary & Services</span>
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{(pkg.itinerary || []).length} Days</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-400">
                              {(pkg.detailedInclusions || []).length} Services
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        {/* Price row */}
                        <div className="flex items-baseline justify-between border-t border-white/10 pt-3 mb-4">
                          <div>
                            <div className="text-[11px] text-slate-400">
                              Starting from{" "}
                              <span className="line-through text-slate-500">₹{pkg.originalPrice}</span>
                            </div>
                            <div className="text-xl font-extrabold text-white font-['Outfit']">
                              ₹{pkg.discountedPrice}
                              <span className="text-[10px] font-normal text-slate-400 ml-1">/ person</span>
                            </div>
                          </div>

                          {pkg.savings && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              Save ₹{pkg.savings}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/packages/${pkg.id}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors flex items-center justify-center"
                            title="Open Live Itinerary Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEditPackage(pkg)}
                            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Package</span>
                          </button>

                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Delete Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPackagePages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F172A] border border-white/10">
                    <span className="text-xs text-slate-400">
                      Showing <strong className="text-white">{(packagePage - 1) * packagesPerPage + 1}</strong> to{" "}
                      <strong className="text-white">
                        {Math.min(packagePage * packagesPerPage, filteredPackages.length)}
                      </strong>{" "}
                      of <strong className="text-white">{filteredPackages.length}</strong> packages
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={packagePage === 1}
                        onClick={() => setPackagePage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPackagePages }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPackagePage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            packagePage === num
                              ? "bg-[#FF5A3C] text-white shadow-md shadow-[#FF5A3C]/30"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {num}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={packagePage === totalPackagePages}
                        onClick={() => setPackagePage((p) => Math.min(totalPackagePages, p + 1))}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Package Modal using createPortal */}
        {mounted && isPackageModalOpen && typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
              <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0C1226] border border-white/20 shadow-2xl text-left overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-[#090E20] border-b border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#FF5A3C]/20 text-[#FF5A3C]">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Outfit']">
                        {editingPackage ? "Edit Curated Package" : "Create New Curated Package"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Configure package details, day-by-day plan, pricing, and inclusions.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPackageModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSavePackage} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
                  {/* 1. Destination & Identity */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>1. State & Identity</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">State / Region *</label>
                        <select
                          value={pkgFormData.state}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, state: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090E20] border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                          required
                        >
                          {curatedRegionsList.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Duration (e.g. 4 Days & 3 Nights) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4 Days & 3 Nights"
                          value={pkgFormData.duration || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, duration: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Package Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Goa Coastal Paradise & Watersports Package"
                        value={pkgFormData.title || ""}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Subtitle / Tagline</label>
                        <input
                          type="text"
                          placeholder="e.g. Scuba, Dolphin Safari & Island Cruise Special"
                          value={pkgFormData.subtitle || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, subtitle: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Route / Night Breakup</label>
                        <input
                          type="text"
                          placeholder="e.g. 2N Calangute • 1N Baga Beach"
                          value={pkgFormData.route || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, route: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Category Badge Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Beach & Watersports, Heritage & Forts"
                          value={pkgFormData.categoryBadge || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, categoryBadge: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Badge Gradient Theme</label>
                        <select
                          value={pkgFormData.badgeGradient || "from-pink-500 to-rose-500"}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, badgeGradient: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090E20] border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        >
                          <option value="from-pink-500 to-rose-500">Pink / Rose (Coastal / Honeymoon)</option>
                          <option value="from-amber-500 to-orange-500">Amber / Orange (Sunset / Adventure)</option>
                          <option value="from-cyan-500 to-blue-600">Cyan / Blue (Island / Water)</option>
                          <option value="from-emerald-500 to-teal-600">Emerald / Teal (Nature / Hillstation)</option>
                          <option value="from-purple-500 to-indigo-600">Purple / Indigo (Heritage / Royal)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Cover Image URL</label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={pkgFormData.image || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, image: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Official Flyer Image URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="/goa-packages/package_01_luxury_3n4d.jpg"
                          value={pkgFormData.flyerImage || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, flyerImage: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Pricing & Savings */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>2. Pricing & Deals</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Original Price (₹)</label>
                        <input
                          type="text"
                          placeholder="e.g. 16,500"
                          value={pkgFormData.originalPrice || ""}
                          onChange={(e) => {
                            const orig = e.target.value;
                            const disc = pkgFormData.discountedPrice || "";
                            const o = parseInt(orig.replace(/[^0-9]/g, "") || "0");
                            const d = parseInt(disc.replace(/[^0-9]/g, "") || "0");
                            const autoSav = o > d ? (o - d).toLocaleString("en-IN") : (pkgFormData.savings || "0");
                            setPkgFormData({ ...pkgFormData, originalPrice: orig, savings: autoSav });
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Discounted Offer Price (₹) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 11,999"
                          value={pkgFormData.discountedPrice || ""}
                          onChange={(e) => {
                            const disc = e.target.value;
                            const orig = pkgFormData.originalPrice || "";
                            const o = parseInt(orig.replace(/[^0-9]/g, "") || "0");
                            const d = parseInt(disc.replace(/[^0-9]/g, "") || "0");
                            const autoSav = o > d ? (o - d).toLocaleString("en-IN") : (pkgFormData.savings || "0");
                            setPkgFormData({ ...pkgFormData, discountedPrice: disc, savings: autoSav });
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Customer Savings (₹)</label>
                        <input
                          type="text"
                          placeholder="e.g. 4,501"
                          value={pkgFormData.savings || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, savings: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Key Highlights */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-300 font-medium">Key Highlights (1 point per line)</label>
                        <span className="text-[10px] text-slate-500">Separated by Enter</span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Grand Island Scuba & Snorkeling&#10;North Goa Forts (Aguada & Chapora)&#10;Sunset Cruise on Mandovi River"
                        value={(pkgFormData.highlights || []).join("\n")}
                        onChange={(e) => setPkgFormData({ ...pkgFormData, highlights: e.target.value.split("\n") })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C] font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* 4. Day-by-Day Itinerary */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>4. Day-Wise Detailed Itinerary</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Appears inside the &apos;View Itinerary&apos; modal on the website.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddItineraryDay}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Day</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(pkgFormData.itinerary || []).map((day, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#FF5A3C]/20 text-[#FF5A3C] font-extrabold text-[11px]">
                              Day {day.day}
                            </span>
                            {(pkgFormData.itinerary || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItineraryDay(idx)}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Day</span>
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Day Title</label>
                            <input
                              type="text"
                              placeholder={`e.g. Day ${day.day}: Arrival & Resort Check-in`}
                              value={day.title}
                              onChange={(e) => handleUpdateItineraryDay(idx, "title", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Day Description</label>
                            <textarea
                              rows={2}
                              placeholder="Detail out activities, places visited, and transfers..."
                              value={day.description}
                              onChange={(e) => handleUpdateItineraryDay(idx, "description", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Inclusions & Exclusions */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>5. Inclusions & Exclusions (1 per line)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Inclusions</label>
                        <textarea
                          rows={4}
                          placeholder="3 Nights AC Deluxe Stay&#10;Daily Buffet Breakfast&#10;Private Cab for Sightseeing"
                          value={(pkgFormData.inclusions || []).join("\n")}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, inclusions: e.target.value.split("\n") })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C] font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Exclusions</label>
                        <textarea
                          rows={4}
                          placeholder="Airfare / Train tickets&#10;Personal expenses & laundry&#10;Optional watersports"
                          value={(pkgFormData.exclusions || []).join("\n")}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, exclusions: e.target.value.split("\n") })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C] font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 6. Detailed Included Services (with Optional Picture & Zig-Zag / Center Layout) */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>6. Detailed Included Services (Itinerary Page Layout)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Configure services for the Itinerary Page. Add a picture URL for alternating left/right zig-zag showcase, or leave picture URL blank to render in the middle with zero empty picture space.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDetailedInclusion}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Service</span>
                      </button>
                    </div>

                    {/* Inclusion Items List */}
                    <div className="space-y-3.5">
                      {(pkgFormData.detailedInclusions || []).map((item, idx) => {
                        const hasImg = Boolean(item.image && item.image.trim().length > 0);
                        return (
                          <div
                            key={item.id || idx}
                            className={`p-4 rounded-xl border transition-all ${
                              hasImg
                                ? "bg-white/[0.04] border-cyan-500/30 shadow-sm"
                                : "bg-white/[0.02] border-amber-500/30"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-extrabold text-[11px]">
                                  Service #{idx + 1}
                                </span>
                                {hasImg ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
                                    <span>📸 Zig-Zag Mode (Alternating Image & Text)</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                                    <span>📑 Middle Mode (Centered, No Photo Space)</span>
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveDetailedInclusion(idx)}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                  <label className="block text-[11px] text-slate-400 mb-1">
                                    Service Title *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Grand Island Scuba Diving & Dolphin Safari Cruise"
                                    value={item.title}
                                    onChange={(e) => handleUpdateDetailedInclusion(idx, "title", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-slate-400 mb-1">
                                    Category Badge (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Watersports, Cruise, Spa"
                                    value={item.category || ""}
                                    onChange={(e) => handleUpdateDetailedInclusion(idx, "category", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1">
                                  Service Description *
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Explain what is included in this service (resort amenities, boat details, transfers, etc.)..."
                                  value={item.description}
                                  onChange={(e) => handleUpdateDetailedInclusion(idx, "description", e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[11px] text-slate-400">
                                    Picture URL (Optional)
                                  </label>
                                  <span className="text-[10px] text-slate-500">
                                    Leave blank for centered middle layout
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="url"
                                    placeholder="https://images.unsplash.com/... (optional)"
                                    value={item.image || ""}
                                    onChange={(e) => handleUpdateDetailedInclusion(idx, "image", e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                  />
                                  {hasImg && (
                                    <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                                      <Image
                                        src={item.image!}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7. 10-Photo Visual Experience Gallery */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>7. 10-Photo Visual Experience Gallery</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          HD photo gallery showcase for the Itinerary page. Enter image URLs for high-resolution gallery view & interactive lightbox.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(pkgFormData.galleryImages || []).map((imgUrl, gIdx) => (
                        <div
                          key={gIdx}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3"
                        >
                          <div className="relative w-14 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                            <Image
                              src={imgUrl}
                              alt={`Gallery ${gIdx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-[10px] text-slate-400 mb-1 font-semibold">
                              Photo #{gIdx + 1}
                            </span>
                            <input
                              type="url"
                              value={imgUrl}
                              onChange={(e) => handleUpdateGalleryImage(gIdx, e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(gIdx)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-[#090E20] border-t border-white/10 flex items-center justify-end gap-3 shrink-0 z-20">
                    <button
                      type="button"
                      onClick={() => setIsPackageModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-bold shadow-lg shadow-[#FF5A3C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingPackage ? "Save Changes" : "Create Package"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
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
                  <label className="block text-slate-300 mb-1 font-medium">WhatsApp Number (e.g. 919588667027)</label>
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
