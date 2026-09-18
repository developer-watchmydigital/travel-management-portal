"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  LogOut,
  Database,
  ShieldCheck,
  Building2,
  Car,
  Camera,
  Layers,
  RefreshCw,
  Star,
  MessageSquareHeart,
  AlertTriangle,
  ChevronDown,
  Wallet,
  CreditCard,
  Ban,
  Upload,
} from "lucide-react";
import {
  getStoredLeads,
  updateLeadStatus,
  updateLeadBookingDetails,
  deleteLead,
  getStoredDestinations,
  saveDestination,
  deleteDestination,
  getStoredCompanyInfo,
  saveCompanyInfo,
  getStoredPackages,
  savePackage,
  deletePackage,
  getStoredServices,
  saveService,
  updateServicePhotos,
  getStoredReviews,
  deleteStoredReview,
} from "@/lib/storage";
import {
  InquiryLead,
  Destination,
  CompanyInfo,
  CuratedPackage,
  ItineraryDay,
  PackageInclusionItem,
  TravelService,
  ServicePhoto,
  Review,
} from "@/lib/types";
import { curatedRegionsList, initialGoaReviews } from "@/lib/initialData";
import { getPerDayPrice } from "@/lib/pricing";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("admin");
  const [isSupabaseSynced, setIsSupabaseSynced] = useState(false);

  const [activeTab, setActiveTab] = useState<"leads" | "packages" | "destinations" | "cash" | "online" | "cancelled" | "services" | "reviews" | "settings">("leads");
  const [leads, setLeads] = useState<InquiryLead[]>([]);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [lastLeadsSync, setLastLeadsSync] = useState<string>("Just now");

  // Booking confirmation & payment modal state
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    lead: InquiryLead | null;
    amount: string;
    paymentMode: "cash" | "online";
    reference: string;
    bookingDate: string;
  }>({
    isOpen: false,
    lead: null,
    amount: "",
    paymentMode: "online",
    reference: "",
    bookingDate: new Date().toISOString().slice(0, 10),
  });

  // Booking cancellation modal state
  const [cancellationModal, setCancellationModal] = useState<{
    isOpen: boolean;
    lead: InquiryLead | null;
    reason: string;
    refundAmount: string;
  }>({
    isOpen: false,
    lead: null,
    reason: "",
    refundAmount: "",
  });

  // Reviews moderation state - initialized with initialGoaReviews so it never starts as 0
  const [reviewsList, setReviewsList] = useState<Review[]>(initialGoaReviews);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState("all");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [isDeletingReviewId, setIsDeletingReviewId] = useState<string | null>(null);
  const [reviewToast, setReviewToast] = useState("");
  const [servicesList, setServicesList] = useState<TravelService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("hotel-booking");
  const [servicePhotosState, setServicePhotosState] = useState<{ [serviceId: string]: ServicePhoto[] }>({});
  const [serviceToast, setServiceToast] = useState("");
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
  const [leadFilter, setLeadFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cashSearchQuery, setCashSearchQuery] = useState("");
  const [onlineSearchQuery, setOnlineSearchQuery] = useState("");
  const [cancelledSearchQuery, setCancelledSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "last7days" | "thisMonth" | "custom">("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const dateMenuRef = useRef<HTMLDivElement>(null);

  const dateFilterLabels: Record<string, string> = {
    all: "All Dates",
    today: "Today",
    yesterday: "Yesterday",
    last7days: "Last 7 Days",
    thisMonth: "This Month",
    custom: "Specific Day...",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setIsDateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Destination modal state
  const [isAddDestOpen, setIsAddDestOpen] = useState(false);
  const [newDest, setNewDest] = useState<Partial<Destination>>({
    category: "india",
    highlights: ["Sightseeing", "Hotel Stay", "Transfers"],
  });

  // Custom In-App Modal Dialog States (Replaces native browser window.confirm and window.alert)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
  } | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // Image file upload handler (Local Computer / Gallery)
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    onSuccess: (uploadedUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting same file triggers change
    e.target.value = "";

    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onSuccess(data.url);
      showAlert("Upload Successful", `Image saved successfully as ${data.filename || "file"}.`, "success");
    } catch (err: any) {
      console.error("Image upload error:", err);
      showAlert("Upload Failed", err?.message || "Could not upload image from computer.", "error");
    } finally {
      setUploadingField(null);
    }
  };

  // Verify server session on mount & load data with Supabase sync
  useEffect(() => {
    setMounted(true);

    // 1. Verify server-side session
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/admin/login";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated) {
          setAdminUsername(data.username || "admin");
          setIsAuthenticated(true);
        } else {
          window.location.href = "/admin/login";
        }
      })
      .catch(() => {
        window.location.href = "/admin/login";
      });

    // 2. Load leads from API (Supabase) with local fallback
    const localLeads = getStoredLeads();
    setLeads(localLeads);
    fetch("/api/leads")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isSupabaseActive && data?.leads && data.leads.length > 0) {
          setLeads(data.leads);
          setIsSupabaseSynced(true);
        }
      })
      .catch(() => {});

    // 3. Load packages: ALWAYS prioritize stored packages to prevent resetting custom edits
    const localPackages = getStoredPackages();
    setPackages(localPackages);
    fetch("/api/packages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isSupabaseActive && data?.packages && data.packages.length > 0) {
          // If Supabase has packages, use them
          setPackages(data.packages);
          setIsSupabaseSynced(true);
        }
      })
      .catch(() => {});

    // 4. Load destinations from API with local fallback
    const localDests = getStoredDestinations();
    setDestinations(localDests);
    fetch("/api/destinations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isSupabaseActive && data?.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations);
          setIsSupabaseSynced(true);
        }
      })
      .catch(() => {});

    // 5. Load company settings with local fallback
    const localCompany = getStoredCompanyInfo();
    setCompanyInfo(localCompany);
    fetch("/api/company-info")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isSupabaseActive && data?.companyInfo) {
          setCompanyInfo(data.companyInfo);
          setIsSupabaseSynced(true);
        }
      })
      .catch(() => {});

    // 6. Load services & showcase photos (Hotel Booking, Car Rental, etc.)
    const localServices = getStoredServices();
    setServicesList(localServices);
    const initialPhotosMap: { [id: string]: ServicePhoto[] } = {};
    localServices.forEach((s) => {
      initialPhotosMap[s.id] = s.photos ? [...s.photos] : [];
    });
    setServicePhotosState(initialPhotosMap);

    fetch("/api/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services && Array.isArray(data.services) && data.services.length > 0) {
          setServicesList(data.services);
          const serverPhotosMap: { [id: string]: ServicePhoto[] } = {};
          data.services.forEach((s: TravelService) => {
            if (s.photos && s.photos.length > 0) {
              serverPhotosMap[s.id] = s.photos;
            }
          });
          setServicePhotosState((prev) => ({ ...prev, ...serverPhotosMap }));
        }
      })
      .catch(() => {});

    // 7. Load reviews from Supabase API with local fallback
    refreshReviews();

    // Listen for instant local / cross-tab lead submissions & reviews updates
    const handleNewLead = () => refreshLeads(true);
    const handleReviewsSync = () => refreshReviews();

    window.addEventListener("wmt-new-lead", handleNewLead);
    window.addEventListener("reviews-updated", handleReviewsSync);
    window.addEventListener("storage", (e) => {
      if (e.key === "r_travel_leads_v2") refreshLeads(true);
      if (e.key === "r_travel_reviews_v2") refreshReviews();
    });

    let leadsChannel: BroadcastChannel | null = null;
    try {
      leadsChannel = new BroadcastChannel("wmt_leads_channel");
      leadsChannel.onmessage = (event) => {
        if (event.data?.type === "NEW_LEAD") {
          refreshLeads(true);
        }
      };
    } catch {}

    // Auto-polling every 4 seconds so enquiries from other devices arrive automatically
    const pollInterval = setInterval(() => {
      refreshLeads(true);
    }, 4000);

    return () => {
      window.removeEventListener("wmt-new-lead", handleNewLead);
      window.removeEventListener("reviews-updated", handleReviewsSync);
      if (leadsChannel) leadsChannel.close();
      clearInterval(pollInterval);
    };
  }, []);

  const refreshLeads = async (silent = false) => {
    if (!silent) setIsRefreshingLeads(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        if (data?.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
          if (data.isSupabaseActive) setIsSupabaseSynced(true);
        }
      } else {
        setLeads(getStoredLeads());
      }
      setLastLeadsSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      setLeads(getStoredLeads());
    } finally {
      if (!silent) setTimeout(() => setIsRefreshingLeads(false), 400);
    }
  };

  const refreshReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data?.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList(data.reviews);
          if (typeof window !== "undefined") {
            localStorage.setItem("r_travel_reviews_v2", JSON.stringify(data.reviews));
          }
          return;
        }
      }
    } catch {}
    const stored = getStoredReviews();
    setReviewsList(stored && stored.length > 0 ? stored : initialGoaReviews);
  };

  const handleDeleteReview = (id: string) => {
    const targetRev = reviewsList.find((r) => r.id === id);
    const reviewer = targetRev ? `"${targetRev.name}"` : "this review";
    setConfirmModal({
      isOpen: true,
      title: "Delete Customer Review",
      message: `Are you sure you want to permanently delete the review by ${reviewer}? It will be removed immediately from the live website and Supabase database.`,
      confirmText: "Yes, Delete Review",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        setIsDeletingReviewId(id);
        try {
          deleteStoredReview(id);
          setReviewsList((prev) => prev.filter((r) => r.id !== id));
          await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
          setReviewToast("Review removed successfully from the website.");
          setTimeout(() => setReviewToast(""), 3500);
        } catch (err) {
          console.error("Failed to delete review:", err);
        } finally {
          setIsDeletingReviewId(null);
          setConfirmModal(null);
        }
      },
    });
  };

  const handlePhotoChange = (serviceId: string, index: number, field: keyof ServicePhoto, value: string) => {
    setServicePhotosState((prev) => {
      const current = prev[serviceId] ? [...prev[serviceId]] : [];
      while (current.length <= index) {
        current.push({ url: "", title: "", caption: "" });
      }
      current[index] = { ...current[index], [field]: value };
      return { ...prev, [serviceId]: current };
    });
  };

  const handleSaveServicePhotos = async (serviceId: string) => {
    const photos = servicePhotosState[serviceId] || [];
    updateServicePhotos(serviceId, photos);
    const updated = getStoredServices();
    setServicesList(updated);
    const targetTitle = servicesList.find((s) => s.id === serviceId)?.title || "Service";
    setServiceToast(`Showcase photos for ${targetTitle} saved and live on website!`);
    setTimeout(() => setServiceToast(""), 4000);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("services-updated"));
    }

    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, photos }),
    }).catch((err) => console.warn("Service photo sync API error:", err));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const handleStatusChange = (id: string, status: InquiryLead["status"]) => {
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;

    if (status === "Booked") {
      setBookingModal({
        isOpen: true,
        lead: targetLead,
        amount: targetLead.bookingAmount ? String(targetLead.bookingAmount) : "",
        paymentMode: targetLead.paymentMode || "online",
        reference: targetLead.paymentReference || "",
        bookingDate: targetLead.bookingDate ? targetLead.bookingDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
      return;
    }

    if (status === "Cancelled") {
      setCancellationModal({
        isOpen: true,
        lead: targetLead,
        reason: targetLead.cancellationReason || "",
        refundAmount: targetLead.bookingAmount ? String(targetLead.bookingAmount) : "0",
      });
      return;
    }

    updateLeadStatus(id, status);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch((err) => console.error("Lead status sync error:", err));
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModal.lead) return;
    const numAmount = parseFloat(bookingModal.amount.replace(/[^0-9.]/g, "")) || 0;
    if (numAmount <= 0) {
      showAlert("Invalid Amount", "Please enter a valid booking amount in Rupees (₹).", "warning");
      return;
    }

    const leadId = bookingModal.lead.id;
    const bookingDetails = {
      status: "Booked" as const,
      bookingAmount: numAmount,
      paymentMode: bookingModal.paymentMode,
      paymentReference: bookingModal.reference.trim() || undefined,
      bookingDate: bookingModal.bookingDate || new Date().toISOString(),
      cancellationReason: undefined,
      cancelledAt: undefined,
      refundAmount: 0,
    };

    updateLeadBookingDetails(leadId, bookingDetails);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...bookingDetails } : l)));

    fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingDetails),
    }).catch((err) => console.error("Supabase booking details sync error:", err));

    const modeLabel = bookingModal.paymentMode === "cash" ? "Cash" : "Online";
    showAlert("Booking Confirmed!", `Successfully booked for ₹${numAmount.toLocaleString("en-IN")} via ${modeLabel} payment. Record added to ${modeLabel} Payments tab!`, "success");
    setBookingModal({ isOpen: false, lead: null, amount: "", paymentMode: "online", reference: "", bookingDate: "" });
  };

  const handleConfirmCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationModal.lead) return;
    if (!cancellationModal.reason.trim()) {
      showAlert("Reason Required", "Please provide a reason for cancelling this booking.", "warning");
      return;
    }

    const leadId = cancellationModal.lead.id;
    const refundNum = parseFloat(cancellationModal.refundAmount.replace(/[^0-9.]/g, "")) || 0;

    const cancellationDetails = {
      status: "Cancelled" as const,
      cancellationReason: cancellationModal.reason.trim(),
      cancelledAt: new Date().toISOString(),
      refundAmount: refundNum,
    };

    updateLeadBookingDetails(leadId, cancellationDetails);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...cancellationDetails } : l)));

    fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cancellationDetails),
    }).catch((err) => console.error("Supabase cancellation sync error:", err));

    showAlert("Booking Cancelled", `The booking has been marked cancelled and ₹${refundNum.toLocaleString("en-IN")} has been deducted. You can review it in the Cancelled Bookings tab.`, "info");
    setCancellationModal({ isOpen: false, lead: null, reason: "", refundAmount: "" });
  };

  const handleReactivateBooking = (lead: InquiryLead) => {
    setConfirmModal({
      isOpen: true,
      title: "Re-activate Booking",
      message: `Do you want to re-activate the booking for "${lead.fullName}"? It will restore the booking amount of ₹${(lead.bookingAmount || 0).toLocaleString("en-IN")} to ${lead.paymentMode === "cash" ? "Cash" : "Online"} payments.`,
      confirmText: "Yes, Re-activate",
      cancelText: "Cancel",
      variant: "info",
      onConfirm: () => {
        const details = {
          status: "Booked" as const,
          cancellationReason: undefined,
          cancelledAt: undefined,
          refundAmount: 0,
        };
        updateLeadBookingDetails(lead.id, details);
        setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...details } : l)));
        fetch(`/api/leads/${lead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        }).catch((err) => console.error("Supabase reactivate error:", err));
        setConfirmModal(null);
        showAlert("Booking Restored", `Booking for ${lead.fullName} is now active again.`, "success");
      },
    });
  };

  const handleDeleteLead = (id: string) => {
    const targetLead = leads.find((l) => l.id === id);
    const leadDesc = targetLead
      ? `"${targetLead.fullName}" (${targetLead.packageName || targetLead.destination || "Inquiry"})`
      : "this customer inquiry";

    setConfirmModal({
      isOpen: true,
      title: "Delete Customer Inquiry",
      message: `Are you sure you want to delete the inquiry for ${leadDesc}? This action cannot be undone.`,
      confirmText: "Yes, Delete Inquiry",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deleteLead(id);
        setLeads((prev) => prev.filter((l) => l.id !== id));
        fetch(`/api/leads/${id}`, { method: "DELETE" }).catch((err) =>
          console.error("Lead delete sync error:", err)
        );
        setConfirmModal(null);
      },
    });
  };

  const handleDeleteDestination = (id: string) => {
    const targetDest = destinations.find((d) => d.id === id);
    const destName = targetDest ? `"${targetDest.name}"` : "this destination";

    setConfirmModal({
      isOpen: true,
      title: "Remove Destination",
      message: `Are you sure you want to remove ${destName} from featured destinations?`,
      confirmText: "Yes, Remove Destination",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deleteDestination(id);
        setDestinations((prev) => prev.filter((d) => d.id !== id));
        fetch(`/api/destinations/${id}`, { method: "DELETE" }).catch((err) =>
          console.error("Supabase destination delete error:", err)
        );
        setConfirmModal(null);
      },
    });
  };

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.name || !newDest.startingPrice) {
      showAlert("Missing Information", "Please fill in both the destination name and starting price.", "warning");
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
    setDestinations((prev) => [created, ...prev]);
    setIsAddDestOpen(false);
    setNewDest({ category: "india", highlights: [] });

    // Sync to Supabase server API
    fetch("/api/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(created),
    }).catch((err) => console.error("Supabase destination save error:", err));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyInfo(companyInfo);

    // Sync to Supabase server API
    fetch("/api/company-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyInfo),
    }).catch((err) => console.error("Supabase company info save error:", err));

    showAlert("Settings Saved", "Company business settings and contact numbers updated and saved successfully!", "success");
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
        ? pkg.detailedInclusions.map((d) => ({
            ...d,
            images: d.images ? [...d.images] : undefined,
          }))
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
    field: "title" | "description" | "image" | "category" | "badge",
    value: string
  ) => {
    const updated = [...(pkgFormData.detailedInclusions || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setPkgFormData({ ...pkgFormData, detailedInclusions: updated });
    }
  };

  const handleUpdateDetailedInclusionRoomPhoto = (
    itemIndex: number,
    photoIndex: number,
    value: string
  ) => {
    const updated = [...(pkgFormData.detailedInclusions || [])];
    if (updated[itemIndex]) {
      const currentImages = [...(updated[itemIndex].images || ["", "", ""])];
      while (currentImages.length < 3) currentImages.push("");
      currentImages[photoIndex] = value;
      const primaryImg = updated[itemIndex].image || currentImages[0] || "";
      updated[itemIndex] = {
        ...updated[itemIndex],
        image: primaryImg,
        images: currentImages,
      };
      setPkgFormData({ ...pkgFormData, detailedInclusions: updated });
    }
  };

  const handleEnableRoomPhotos = (itemIndex: number) => {
    const updated = [...(pkgFormData.detailedInclusions || [])];
    if (updated[itemIndex]) {
      const existing = updated[itemIndex].images || [];
      const defaultPhotos = [
        updated[itemIndex].image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
      ];
      updated[itemIndex] = {
        ...updated[itemIndex],
        images: [
          existing[0] || defaultPhotos[0],
          existing[1] || defaultPhotos[1],
          existing[2] || defaultPhotos[2],
        ],
      };
      setPkgFormData({ ...pkgFormData, detailedInclusions: updated });
    }
  };

  const handleRemoveRoomPhotos = (itemIndex: number) => {
    const updated = [...(pkgFormData.detailedInclusions || [])];
    if (updated[itemIndex]) {
      const copy = { ...updated[itemIndex] };
      delete copy.images;
      updated[itemIndex] = copy;
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
    if (updated.length >= 6) {
      showAlert("Gallery Limit", "Recommended gallery size is 6 curated photos for the 3x2 moments grid.", "info");
      return;
    }
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
      showAlert("Missing Package Details", "Please enter package title, state, and discounted price before saving.", "warning");
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
    setPackages((prev) => {
      const exists = prev.some((p) => p.id === packageToSave.id);
      if (exists) {
        return prev.map((p) => (p.id === packageToSave.id ? packageToSave : p));
      }
      return [packageToSave, ...prev];
    });
    setIsPackageModalOpen(false);

    // Sync to Supabase server API
    fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageToSave),
    }).catch((err) => console.error("Supabase package save error:", err));
  };

  const handleDeletePackage = (id: string) => {
    const targetPkg = packages.find((p) => p.id === id);
    const pkgName = targetPkg ? `"${targetPkg.title}"` : "this package";

    setConfirmModal({
      isOpen: true,
      title: "Delete Tour Package",
      message: `Are you sure you want to permanently delete ${pkgName}? It will be removed from the package listings on the website.`,
      confirmText: "Yes, Delete Package",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: () => {
        deletePackage(id);
        setPackages((prev) => prev.filter((p) => p.id !== id));
        fetch(`/api/packages/${id}`, { method: "DELETE" }).catch((err) =>
          console.error("Supabase package delete error:", err)
        );
        setConfirmModal(null);
      },
    });
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

  // Date-filtered leads (base for KPI metrics and date-filtered views)
  const dateFilteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (dateFilter === "all") return true;
      let leadDateStr = "";
      if (lead.createdAt) {
        try {
          const d = new Date(lead.createdAt);
          if (!isNaN(d.getTime())) {
            leadDateStr = d.toISOString().slice(0, 10);
          }
        } catch {}
      }

      if (!leadDateStr) return true;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      if (dateFilter === "today") {
        return leadDateStr === todayStr;
      }
      if (dateFilter === "yesterday") {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return leadDateStr === yesterday.toISOString().slice(0, 10);
      }
      if (dateFilter === "last7days") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        return leadDateStr >= sevenDaysAgo && leadDateStr <= todayStr;
      }
      if (dateFilter === "thisMonth") {
        const currentMonth = todayStr.slice(0, 7);
        return leadDateStr.startsWith(currentMonth);
      }
      if (dateFilter === "custom") {
        if (!customDate) return true;
        return leadDateStr === customDate;
      }
      return true;
    });
  }, [leads, dateFilter, customDate]);

  // KPI Metrics (strictly recalculated dynamically from dateFilteredLeads!)
  const kpiTotalLeads = dateFilteredLeads.length;
  const kpiNewLeads = dateFilteredLeads.filter((l) => l.status === "New").length;
  const kpiBookedLeads = dateFilteredLeads.filter((l) => l.status === "Booked");
  const kpiCashLeads = dateFilteredLeads.filter((l) => l.status === "Booked" && l.paymentMode === "cash");
  const kpiCashTotal = kpiCashLeads.reduce((sum, l) => sum + (Number(l.bookingAmount) || 0), 0);
  const kpiOnlineLeads = dateFilteredLeads.filter((l) => l.status === "Booked" && l.paymentMode === "online");
  const kpiOnlineTotal = kpiOnlineLeads.reduce((sum, l) => sum + (Number(l.bookingAmount) || 0), 0);
  const kpiCancelledLeads = dateFilteredLeads.filter((l) => l.status === "Cancelled");
  const kpiCancelledTotal = kpiCancelledLeads.reduce((sum, l) => sum + (Number(l.refundAmount ?? l.bookingAmount) || 0), 0);

  // Filtered Leads
  const filteredLeads = dateFilteredLeads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.destination && lead.destination.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = leadFilter === "all" || lead.type === leadFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filtered Cash Bookings (status === "Booked" && paymentMode === "cash")
  const filteredCashLeads = dateFilteredLeads.filter((lead) => {
    if (lead.status !== "Booked" || lead.paymentMode !== "cash") return false;
    const q = cashSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lead.fullName.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.destination && lead.destination.toLowerCase().includes(q)) ||
      (lead.paymentReference && lead.paymentReference.toLowerCase().includes(q))
    );
  });

  // Filtered Online Bookings (status === "Booked" && paymentMode === "online")
  const filteredOnlineLeads = dateFilteredLeads.filter((lead) => {
    if (lead.status !== "Booked" || lead.paymentMode !== "online") return false;
    const q = onlineSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lead.fullName.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.destination && lead.destination.toLowerCase().includes(q)) ||
      (lead.paymentReference && lead.paymentReference.toLowerCase().includes(q))
    );
  });

  // Filtered Cancelled Bookings (status === "Cancelled")
  const filteredCancelledLeads = dateFilteredLeads.filter((lead) => {
    if (lead.status !== "Cancelled") return false;
    const q = cancelledSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lead.fullName.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.destination && lead.destination.toLowerCase().includes(q)) ||
      (lead.cancellationReason && lead.cancellationReason.toLowerCase().includes(q))
    );
  });

  // Filtered Reviews
  const filteredReviewsList = reviewsList.filter((rev) => {
    const q = reviewSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rev.name.toLowerCase().includes(q) ||
      rev.comment.toLowerCase().includes(q) ||
      rev.targetName.toLowerCase().includes(q) ||
      (rev.location && rev.location.toLowerCase().includes(q));

    const matchesCategory =
      reviewCategoryFilter === "all" || rev.category === reviewCategoryFilter;

    const matchesRating =
      reviewRatingFilter === "all" || rev.rating === parseInt(reviewRatingFilter, 10);

    return matchesSearch && matchesCategory && matchesRating;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070B18] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Verifying secure admin session...</p>
          <p className="text-xs text-slate-500">Redirecting to login if unauthenticated.</p>
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
                    src="/favicon.png?v=4"
                    alt="Watch My Trip Package"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-bold text-white font-['Outfit']">
                  Watch My Trip Package
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
            {/* Admin ID Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ID: {adminUsername}</span>
            </span>

            {/* Database Sync Status */}
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                isSupabaseSynced
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                  : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseSynced ? "Supabase Live" : "Local Sync"}</span>
            </span>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Live Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Control Toolbar with Date Filter and Live Sync */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090E20]/90 border border-white/10 backdrop-blur-xl mb-6 shadow-xl text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF5A3C]/20 text-[#FF5A3C]">
                <LayoutDashboard className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-black text-white font-['Outfit']">
                Business Overview & KPI Metrics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Showing dynamic revenue, booking and enquiry metrics for:{" "}
              <strong className="text-white">
                {dateFilterLabels[dateFilter] || "All Dates"}
                {dateFilter === "custom" && customDate ? ` (${customDate})` : ""}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Refresh Button */}
            <button
              type="button"
              onClick={() => refreshLeads(false)}
              disabled={isRefreshingLeads}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-xs text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Refresh all leads and bookings from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF5A3C] ${isRefreshingLeads ? "animate-spin" : ""}`} />
              <span>{isRefreshingLeads ? "Syncing..." : "Refresh Live"}</span>
              <span className="text-[10px] text-emerald-400 font-semibold hidden sm:inline">
                • {lastLeadsSync}
              </span>
            </button>

            {/* Date-wise Filter Custom Dropdown */}
            <div className="relative flex items-center gap-1.5" ref={dateMenuRef}>
              <button
                type="button"
                onClick={() => setIsDateMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none border transition-all cursor-pointer shadow-sm ${
                  dateFilter !== "all"
                    ? "bg-[#1E293B] border-[#FF5A3C] text-[#FF8E79] ring-1 ring-[#FF5A3C]/50 font-bold"
                    : "bg-[#0F172A] border-white/15 text-white hover:border-white/30"
                }`}
                title="Filter metrics and enquiries date-wise"
              >
                <Calendar className={`w-3.5 h-3.5 ${dateFilter !== "all" ? "text-[#FF5A3C]" : "text-slate-400"}`} />
                <span>Filter: {dateFilterLabels[dateFilter] || "All Dates"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDateMenuOpen ? "rotate-180 text-white" : ""}`} />
              </button>

              {/* Dropdown Menu Popup */}
              {isDateMenuOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-56 rounded-2xl bg-[#0F172A] border border-white/15 shadow-2xl shadow-black/90 p-1.5 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1.5 tracking-wider border-b border-white/10 mb-1">
                    Select Date Period
                  </div>
                  {[
                    { key: "all", label: "All Dates (Lifetime)", icon: "📅" },
                    { key: "today", label: "Today", icon: "⚡" },
                    { key: "yesterday", label: "Yesterday", icon: "⏮️" },
                    { key: "last7days", label: "Last 7 Days", icon: "📊" },
                    { key: "thisMonth", label: "This Month", icon: "🗓️" },
                    { key: "custom", label: "Specific Day...", icon: "🎯" },
                  ].map((opt) => {
                    const isSelected = dateFilter === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setDateFilter(opt.key as any);
                          setIsDateMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white shadow-md shadow-[#FF5A3C]/30"
                            : "text-slate-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {dateFilter === "custom" && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#0F172A] border border-[#FF5A3C] text-xs text-white focus:outline-none shadow-sm"
                  title="Select a specific date to filter"
                />
              )}

              {dateFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter("all");
                    setCustomDate("");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] text-slate-300 font-bold cursor-pointer border border-white/10 transition-colors"
                  title="Clear date filter to show all dates"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 6 Recalculated KPI Summary Cards (Dynamically updated by date filter) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 text-left">
          {/* 1. Total Leads */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
              <div className="p-2 rounded-lg bg-[#FF5A3C]/20 text-[#FF5A3C]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-['Outfit']">{kpiTotalLeads}</div>
            <p className="text-[11px] text-slate-400 mt-1">In selected timeframe</p>
          </div>

          {/* 2. New Enquiries */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New Enquiries</span>
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-400 font-['Outfit']">{kpiNewLeads}</div>
            <p className="text-[11px] text-rose-300/80 mt-1">Pending first contact</p>
          </div>

          {/* 3. Confirmed Booked */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Booked</span>
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-['Outfit']">{kpiBookedLeads.length}</div>
            <p className="text-[11px] text-emerald-300/80 mt-1">Active confirmed tours</p>
          </div>

          {/* 4. Cash Payments Received */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-md hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Cash Received</span>
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Outfit'] truncate">
              ₹{kpiCashTotal.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              {kpiCashLeads.length} cash {kpiCashLeads.length === 1 ? "booking" : "bookings"}
            </p>
          </div>

          {/* 5. Online Payments */}
          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 backdrop-blur-md hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Online Payments</span>
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-['Outfit'] truncate">
              ₹{kpiOnlineTotal.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-cyan-300/80 mt-1">
              {kpiOnlineLeads.length} online {kpiOnlineLeads.length === 1 ? "booking" : "bookings"}
            </p>
          </div>

          {/* 6. Cancelled Bookings */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-md hover:border-rose-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Cancelled</span>
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <Ban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-400 font-['Outfit']">
              {kpiCancelledLeads.length}
            </div>
            <p className="text-[11px] text-rose-300/80 mt-1 truncate" title={`-₹${kpiCancelledTotal.toLocaleString("en-IN")} deducted`}>
              -₹{kpiCancelledTotal.toLocaleString("en-IN")} deducted
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-white/10 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Enquiries ({filteredLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "packages"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Curated Packages ({packages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("destinations")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "destinations"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Manage Destinations ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cash")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "cash"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Cash Payments ({filteredCashLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("online")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "online"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Online Payments ({filteredOnlineLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "cancelled"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Ban className="w-4 h-4 text-rose-400" />
            <span>Cancelled Bookings ({filteredCancelledLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Services & Showcase Photos</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Customer Reviews ({reviewsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Company Info</span>
          </button>
        </div>

        {/* TAB 1: CUSTOMER LEADS */}
        {activeTab === "leads" && (
          <div>
            {/* Filters, Search Bar, and Live Refresh Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
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

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => refreshLeads(false)}
                  disabled={isRefreshingLeads}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-xs text-white font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Refresh leads on the same page without reload"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#FF5A3C] ${isRefreshingLeads ? "animate-spin" : ""}`} />
                  <span>{isRefreshingLeads ? "Syncing..." : "Refresh Live"}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold hidden sm:inline">
                    • {lastLeadsSync}
                  </span>
                </button>

                <select
                  value={leadFilter}
                  onChange={(e) => setLeadFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5A3C] shadow-sm"
                  style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
                >
                  <option value="all" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>All Service Types ({leads.length})</option>
                  <option value="hotel" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>🏨 Hotel Bookings ({leads.filter((l) => l.type === "hotel").length})</option>
                  <option value="car" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>🚗 Car Rentals ({leads.filter((l) => l.type === "car").length})</option>
                  <option value="flight" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>✈️ Flight Bookings ({leads.filter((l) => l.type === "flight").length})</option>
                  <option value="train" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>🚆 Train Bookings ({leads.filter((l) => l.type === "train").length})</option>
                  <option value="package" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>📦 Tour Packages ({leads.filter((l) => l.type === "package").length})</option>
                  <option value="group" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>👥 Group Tours ({leads.filter((l) => l.type === "group").length})</option>
                  <option value="corporate" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>💼 Corporate MICE ({leads.filter((l) => l.type === "corporate").length})</option>
                  <option value="service" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>🌟 General Services ({leads.filter((l) => l.type === "service").length})</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5A3C] shadow-sm"
                  style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
                >
                  <option value="all" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>All Statuses</option>
                  <option value="New" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>New ({leads.filter(l => l.status === "New").length})</option>
                  <option value="Contacted" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>Contacted ({leads.filter(l => l.status === "Contacted").length})</option>
                  <option value="Booked" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>Booked ({leads.filter(l => l.status === "Booked").length})</option>
                  <option value="Cancelled" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>Cancelled ({leads.filter(l => l.status === "Cancelled").length})</option>
                  <option value="Closed" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>Closed ({leads.filter(l => l.status === "Closed").length})</option>
                </select>

                {dateFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 text-[#FF8E79] text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date: {dateFilterLabels[dateFilter]}</span>
                  </span>
                )}
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
                    lead.destination || lead.packageName || "travel services"
                  )}.`;

                  return (
                    <div
                      key={lead.id}
                      className="p-5 rounded-2xl bg-[#0F172A]/90 border border-white/10 backdrop-blur-md shadow-lg text-left"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-white font-['Outfit']">
                              {lead.fullName}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                lead.type === "hotel"
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                                  : lead.type === "car"
                                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                                  : lead.type === "package"
                                  ? "bg-[#FF5A3C]/20 text-[#FF5A3C] border border-[#FF5A3C]/40"
                                  : lead.type === "flight"
                                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                                  : lead.type === "train"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : lead.type === "group"
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                                  : lead.type === "corporate"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              }`}
                            >
                              {lead.type === "hotel"
                                ? "🏨 Hotel Booking"
                                : lead.type === "car"
                                ? "🚗 Car Rental"
                                : lead.type === "flight"
                                ? "✈️ Flight"
                                : lead.type === "train"
                                ? "🚆 Train"
                                : lead.type === "package"
                                ? "📦 Package"
                                : lead.type === "group"
                                ? "👥 Group"
                                : lead.type === "corporate"
                                ? "💼 MICE"
                                : lead.type}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>

                            {lead.status === "Booked" && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                <Wallet className="w-3 h-3" />
                                <span>₹{(lead.bookingAmount || 0).toLocaleString("en-IN")} via {lead.paymentMode === "cash" ? "Cash" : "Online"}</span>
                              </span>
                            )}
                            {lead.status === "Cancelled" && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300 flex items-center gap-1">
                                <Ban className="w-3 h-3" />
                                <span>Cancelled (-₹{(lead.refundAmount ?? lead.bookingAmount ?? 0).toLocaleString("en-IN")})</span>
                              </span>
                            )}
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
                                  : lead.status === "Cancelled"
                                  ? "bg-rose-950/40 text-rose-300 border-rose-600/50"
                                  : "bg-slate-700 text-slate-300 border-slate-600"
                              }`}
                            >
                              <option value="New" className="bg-[#0F172A] text-rose-300">New</option>
                              <option value="Contacted" className="bg-[#0F172A] text-amber-300">Contacted</option>
                              <option value="Booked" className="bg-[#0F172A] text-emerald-300">Booked</option>
                              <option value="Cancelled" className="bg-[#0F172A] text-rose-400">Cancelled</option>
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
                          {lead.preferredAirline && (
                            <p className="text-sky-300 text-[11px] mt-0.5 font-bold flex items-center gap-1">
                              <Plane className="w-3 h-3 text-sky-400" />
                              <span>Airline: {lead.preferredAirline}</span>
                            </p>
                          )}
                          {lead.trainClass && (
                            <p className="text-amber-400 text-[11px] mt-0.5 font-medium">Class: {lead.trainClass}</p>
                          )}
                          {lead.preferredTrain && (
                            <p className="text-amber-300 text-[11px] mt-0.5 font-bold flex items-center gap-1">
                              <Train className="w-3 h-3 text-amber-400" />
                              <span>Train: {lead.preferredTrain}</span>
                            </p>
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

                        {lead.specialRequirements && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Special Requirements
                            </span>
                            <p className="text-slate-300 text-[11px] italic leading-relaxed">
                              {lead.specialRequirements}
                            </p>
                          </div>
                        )}

                        {lead.serviceDetails && Object.keys(lead.serviceDetails).length > 0 && (
                          <div className="sm:col-span-3 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#FF5A3C] flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              <span>Enquiry Questionnaire Responses ({lead.serviceName || lead.type})</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {Object.entries(lead.serviceDetails).map(([key, val]) => (
                                <div
                                  key={key}
                                  className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-start justify-between gap-2"
                                >
                                  <span className="text-[10px] text-slate-400 font-semibold">{key}:</span>
                                  <span className="text-xs font-bold text-white text-right">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: SERVICES & 3 SHOWCASE PHOTOS MANAGEMENT */}
        {activeTab === "services" && (
          <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A3C]/15 border border-[#FF5A3C]/30 text-[10px] font-extrabold text-[#FF5A3C] uppercase tracking-wider mb-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Enquiry Flow & Photos</span>
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  Services & Showcase Photos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage the 3 showcase photos displayed in the customer enquiry modal for Hotel Booking & Car Rental.
                </p>
              </div>

              {serviceToast && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>{serviceToast}</span>
                </div>
              )}
            </div>

            {/* Service Selection Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
              {servicesList.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const isFeatured = service.id === "hotel-booking" || service.id === "car-rental";
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {service.id === "hotel-booking" && <Building2 className="w-3.5 h-3.5" />}
                    {service.id === "car-rental" && <Car className="w-3.5 h-3.5" />}
                    {service.id === "flight-booking" && <Plane className="w-3.5 h-3.5" />}
                    {service.id === "railway-reservation" && <Train className="w-3.5 h-3.5" />}
                    {service.id !== "hotel-booking" &&
                      service.id !== "car-rental" &&
                      service.id !== "flight-booking" &&
                      service.id !== "railway-reservation" && <Compass className="w-3.5 h-3.5" />}
                    <span>{service.title}</span>
                    {isFeatured && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? "bg-white/25 text-white" : "bg-teal-500/20 text-teal-300"}`}>
                        3 Photos
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Service Editor */}
            {(() => {
              const currentService = servicesList.find((s) => s.id === selectedServiceId) || servicesList[0];
              if (!currentService) return null;

              const photos = servicePhotosState[currentService.id] || [
                { url: "", title: "", caption: "" },
                { url: "", title: "", caption: "" },
                { url: "", title: "", caption: "" },
              ];

              return (
                <div className="space-y-6">
                  {/* Service Header Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0C1226] to-slate-900/90 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#FF5A3C]/10 border border-[#FF5A3C]/20 flex items-center justify-center text-[#FF5A3C] shrink-0">
                        {currentService.id === "hotel-booking" && <Building2 className="w-7 h-7" />}
                        {currentService.id === "car-rental" && <Car className="w-7 h-7" />}
                        {currentService.id === "flight-booking" && <Plane className="w-7 h-7" />}
                        {currentService.id === "railway-reservation" && <Train className="w-7 h-7" />}
                        {currentService.id !== "hotel-booking" &&
                          currentService.id !== "car-rental" &&
                          currentService.id !== "flight-booking" &&
                          currentService.id !== "railway-reservation" && <Compass className="w-7 h-7" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-white font-['Outfit']">
                            {currentService.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                            {currentService.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl">
                          {currentService.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSaveServicePhotos(currentService.id)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5A3C]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Showcase Photos</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Photos Editor Section */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#FF5A3C]" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                          3 Verified Showcase Photos for {currentService.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        These photos appear inside the customer enquiry modal on the website.
                      </span>
                    </div>

                    {/* Grid of 3 Photos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {[0, 1, 2].map((idx) => {
                        const currentPhoto = photos[idx] || { url: "", title: "", caption: "" };
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[#0F172A] border border-white/10 space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Photo Number & Badge */}
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md bg-[#FF5A3C]/20 border border-[#FF5A3C]/30 text-[10px] font-extrabold text-[#FF5A3C]">
                                  Showcase Photo #{idx + 1}
                                </span>
                                {currentPhoto.url && (
                                  <a
                                    href={currentPhoto.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-white transition-colors"
                                  >
                                    Test Link ↗
                                  </a>
                                )}
                              </div>

                              {/* Photo Preview */}
                              <div className="relative h-36 w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                {currentPhoto.url ? (
                                  <Image
                                    src={currentPhoto.url}
                                    alt={`Showcase ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="350px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                                    <Camera className="w-6 h-6" />
                                    <span className="text-[10px]">No photo URL entered</span>
                                  </div>
                                )}
                              </div>

                              {/* Image URL Input */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Image URL *
                                  </label>
                                  <label className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer">
                                    <Upload className="w-3 h-3" />
                                    <span>{uploadingField === `service_${currentService.id}_${idx}` ? "Uploading..." : "Upload from Computer"}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={uploadingField === `service_${currentService.id}_${idx}`}
                                      onChange={(e) =>
                                        handleFileUpload(e, `service_${currentService.id}_${idx}`, (url) =>
                                          handlePhotoChange(currentService.id, idx, "url", url)
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  value={currentPhoto.url}
                                  onChange={(e) =>
                                    handlePhotoChange(currentService.id, idx, "url", e.target.value)
                                  }
                                  placeholder="https://images.unsplash.com/... or /uploads/..."
                                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A3C]"
                                />
                              </div>

                              {/* Title Input */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Photo Title *
                                </label>
                                <input
                                  type="text"
                                  value={currentPhoto.title || ""}
                                  onChange={(e) =>
                                    handlePhotoChange(currentService.id, idx, "title", e.target.value)
                                  }
                                  placeholder={
                                    currentService.id === "hotel-booking"
                                      ? "e.g. Deluxe Suite & Room"
                                      : "e.g. Toyota Innova Crysta AC"
                                  }
                                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A3C]"
                                />
                              </div>

                              {/* Caption Input */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Short Caption / Highlights
                                </label>
                                <input
                                  type="text"
                                  value={currentPhoto.caption || ""}
                                  onChange={(e) =>
                                    handlePhotoChange(currentService.id, idx, "caption", e.target.value)
                                  }
                                  placeholder="e.g. King bed, balcony, sea breeze comfort"
                                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A3C]"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Save Action */}
                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                      <span className="text-xs text-slate-400">
                        Changes will immediately reflect on the live website enquiry modal.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSaveServicePhotos(currentService.id)}
                        className="px-6 py-2.5 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5A3C]/30 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Photos for {currentService.title}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5A3C] shadow-sm"
                  style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
                >
                  <option value="all" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>All States ({packages.length})</option>
                  {curatedRegionsList.map((state) => {
                    const count = packages.filter((p) => p.state === state).length;
                    return (
                      <option key={state} value={state} style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>
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
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-300 font-medium">Cover Image URL *</label>
                          <label className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === "pkg_cover" ? "Uploading..." : "Upload from Computer"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingField === "pkg_cover"}
                              onChange={(e) =>
                                handleFileUpload(e, "pkg_cover", (url) =>
                                  setPkgFormData((prev) => ({ ...prev, image: url }))
                                )
                              }
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/... or /uploads/..."
                          value={pkgFormData.image || ""}
                          onChange={(e) => setPkgFormData({ ...pkgFormData, image: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-300 font-medium">Official Flyer Image URL (Optional)</label>
                          <label className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === "pkg_flyer" ? "Uploading..." : "Upload from Computer"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingField === "pkg_flyer"}
                              onChange={(e) =>
                                handleFileUpload(e, "pkg_flyer", (url) =>
                                  setPkgFormData((prev) => ({ ...prev, flyerImage: url }))
                                )
                              }
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="/goa-packages/... or /uploads/..."
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

                    {/* Auto-converted Per Day Amount based on Duration */}
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-emerald-300">
                            Auto-Calculated Daily Rate
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Based on full package amount & {pkgFormData.duration || "4 Days"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 mr-2">Per Person Per Day:</span>
                        <span className="text-base font-black text-emerald-400 font-['Outfit']">
                          ₹{getPerDayPrice(pkgFormData.discountedPrice || "0", pkgFormData.duration || "4 Days")} / Day
                        </span>
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
                                    <span>📄 Center Clean Mode (No Image)</span>
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveDetailedInclusion(idx)}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Service</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] text-slate-400 mb-1">Service Title *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Scuba Diving & Island Cruise"
                                    value={item.title}
                                    onChange={(e) =>
                                      handleUpdateDetailedInclusion(idx, "title", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] text-slate-400 mb-1">Badge Tag</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Top Rated Experience, AC Transport"
                                    value={item.badge || ""}
                                    onChange={(e) =>
                                      handleUpdateDetailedInclusion(idx, "badge", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Service Description</label>
                                <textarea
                                  rows={2}
                                  placeholder="Describe the inclusions, timings, hotel details, or experience..."
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdateDetailedInclusion(idx, "description", e.target.value)
                                  }
                                  className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5A3C]"
                                />
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                  <label className="block text-[11px] text-slate-400">
                                    Service Image URL (Optional - leave blank for clean centered card)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <label className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer">
                                      <Upload className="w-3 h-3" />
                                      <span>{uploadingField === `inclusion_${idx}` ? "Uploading..." : "Upload Photo"}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingField === `inclusion_${idx}`}
                                        onChange={(e) =>
                                          handleFileUpload(e, `inclusion_${idx}`, (url) =>
                                            handleUpdateDetailedInclusion(idx, "image", url)
                                          )
                                        }
                                      />
                                    </label>
                                    {hasImg && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateDetailedInclusion(idx, "image", "")}
                                        className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                                      >
                                        Clear image
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/... or /uploads/... (optional)"
                                    value={item.image || ""}
                                    onChange={(e) =>
                                      handleUpdateDetailedInclusion(idx, "image", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg bg-[#090E20] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
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

                              {/* 3 Room Photos Management */}
                              <div className="pt-2 border-t border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-cyan-300">
                                      🏨 3 Room Photos (Collage + 3-in-1 Lightbox Modal)
                                    </span>
                                    {item.images && item.images.length > 0 && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                                        3 Room Photos Enabled
                                      </span>
                                    )}
                                  </div>
                                  {item.images && item.images.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRoomPhotos(idx)}
                                      className="text-[10px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
                                    >
                                      Disable 3 Photos
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleEnableRoomPhotos(idx)}
                                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium underline transition-colors"
                                    >
                                      + Add 3 Room Photos
                                    </button>
                                  )}
                                </div>

                                {item.images && item.images.length > 0 && (
                                  <div className="p-3 rounded-lg bg-black/30 border border-cyan-500/20 space-y-2.5">
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                      Displays a 3-photo room grid on the package page. When visitors click any room photo, all 3 photos expand inside the same modal box with previous/next controls.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                      {[0, 1, 2].map((photoIdx) => {
                                        const photoUrl = item.images?.[photoIdx] || "";
                                        const labels = ["Room Photo 1 (Main / Bed)", "Room Photo 2 (Interior / Living)", "Room Photo 3 (Balcony / View)"];
                                        const uploadKey = `room_${idx}_${photoIdx}`;
                                        return (
                                          <div key={photoIdx} className="space-y-1">
                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                              <span className="font-semibold text-slate-300">#{photoIdx + 1}</span>
                                              <label className="inline-flex items-center gap-0.5 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer">
                                                <Upload className="w-2.5 h-2.5" />
                                                <span>{uploadingField === uploadKey ? "..." : "Upload"}</span>
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  disabled={uploadingField === uploadKey}
                                                  onChange={(e) =>
                                                    handleFileUpload(e, uploadKey, (url) =>
                                                      handleUpdateDetailedInclusionRoomPhoto(idx, photoIdx, url)
                                                    )
                                                  }
                                                />
                                              </label>
                                            </div>
                                            <input
                                              type="text"
                                              placeholder={`Room photo #${photoIdx + 1} URL`}
                                              value={photoUrl}
                                              onChange={(e) =>
                                                handleUpdateDetailedInclusionRoomPhoto(idx, photoIdx, e.target.value)
                                              }
                                              className="w-full px-2.5 py-1.5 rounded-md bg-[#090E20] border border-white/10 text-white text-[11px] focus:outline-none focus:border-cyan-400"
                                            />
                                            {photoUrl ? (
                                              <div className="relative w-full h-16 rounded overflow-hidden border border-white/10 bg-black">
                                                <Image
                                                  src={photoUrl}
                                                  alt={`Room ${photoIdx + 1}`}
                                                  fill
                                                  className="object-cover"
                                                  unoptimized
                                                />
                                              </div>
                                            ) : (
                                              <div className="w-full h-16 rounded border border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-600">
                                                No photo URL
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7. Curated Moments Gallery (6 Photos) */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>7. Curated Moments Gallery (6 Photos)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Captivating tour moments & sights showcase for the itinerary page (6 photos grid). Enter image URLs for high-resolution gallery view & interactive lightbox.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo (Max 6)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(pkgFormData.galleryImages || []).map((imgUrl, gIdx) => {
                        const uploadKey = `gallery_${gIdx}`;
                        return (
                          <div
                            key={gIdx}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3"
                          >
                            <div className="relative w-14 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                              {imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={`Gallery ${gIdx + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="block text-[10px] text-slate-400 font-semibold">
                                  Photo #{gIdx + 1}
                                </span>
                                <label className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer">
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>{uploadingField === uploadKey ? "..." : "Upload File"}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField === uploadKey}
                                    onChange={(e) =>
                                      handleFileUpload(e, uploadKey, (url) =>
                                        handleUpdateGalleryImage(gIdx, url)
                                      )
                                    }
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={imgUrl}
                                onChange={(e) => handleUpdateGalleryImage(gIdx, e.target.value)}
                                placeholder="https://... or /uploads/..."
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
                        );
                      })}
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

        {/* TAB: DESTINATIONS MANAGEMENT */}
        {activeTab === "destinations" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Featured Destinations
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add, preview, or manage travel destinations featured on the homepage.
                </p>
              </div>
              <button
                onClick={() => setIsAddDestOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#FF5A3C]/30 transition-all cursor-pointer"
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
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
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
                      <label className="block text-slate-300 mb-1 font-medium">Destination Name *</label>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-300 font-medium">Image URL *</label>
                        <label className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingField === "new_dest" ? "Uploading..." : "Upload from Computer"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingField === "new_dest"}
                            onChange={(e) =>
                              handleFileUpload(e, "new_dest", (url) =>
                                setNewDest((prev) => ({ ...prev, image: url }))
                              )
                            }
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="https://images.unsplash.com/... or /uploads/..."
                        value={newDest.image || ""}
                        onChange={(e) => setNewDest({ ...newDest, image: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF5A3C]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsAddDestOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#FF5A3C] hover:bg-[#E04629] text-white font-bold cursor-pointer"
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

        {/* TAB 2: CASH PAYMENTS */}
        {activeTab === "cash" && (
          <div className="space-y-6">
            {/* Header & Metric Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0F172A] to-[#0F172A] border border-emerald-500/30 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-2">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Cash Accounting</span>
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  Cash Payments Received
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Track physical cash collected at Mehsana / Goa offices for confirmed tours. When bookings are cancelled, deducted amounts are subtracted automatically.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Cash Collected</span>
                  <span className="text-2xl font-black text-emerald-400 font-['Outfit']">
                    ₹{filteredCashLeads.reduce((s, l) => s + (Number(l.bookingAmount) || 0), 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {filteredCashLeads.length} {filteredCashLeads.length === 1 ? "record" : "records"}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cashSearchQuery}
                  onChange={(e) => setCashSearchQuery(e.target.value)}
                  placeholder="Search cash bookings by name, phone, ref..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Cash Bookings List / Table */}
            {filteredCashLeads.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10">
                <Wallet className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No cash bookings found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mark any enquiry as &quot;Booked&quot; with &quot;Cash&quot; mode to record cash payments here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCashLeads.map((lead) => {
                  const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                    lead.fullName
                  )}!%20Your%20cash%20booking%20of%20₹${(lead.bookingAmount || 0).toLocaleString("en-IN")}%20with%20Watch%20My%20Trip%20Package%20is%20confirmed.`;

                  return (
                    <div
                      key={lead.id}
                      className="p-5 rounded-2xl bg-[#0F172A]/90 border border-emerald-500/20 backdrop-blur-md shadow-lg text-left"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white font-['Outfit']">
                              {lead.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              <span>Cash Payment</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Booked: {lead.bookingDate ? new Date(lead.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 hover:text-emerald-400 font-semibold text-white"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{lead.phone}</span>
                            </a>
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-1.5 hover:text-emerald-400"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lead.email}</span>
                              </a>
                            )}
                            {lead.paymentReference && (
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300">
                                Receipt/Note: <strong className="text-white">{lead.paymentReference}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Collected</span>
                            <span className="text-2xl font-extrabold text-emerald-400 font-['Outfit']">
                              ₹{(lead.bookingAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-md hover:scale-105 transition-all"
                            title="WhatsApp Receipt Message"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              setCancellationModal({
                                isOpen: true,
                                lead,
                                reason: "",
                                refundAmount: lead.bookingAmount ? String(lead.bookingAmount) : "0",
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                            title="Cancel Booking & Deduct Amount"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        </div>
                      </div>

                      {/* Summary breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination / Tour</span>
                          <p className="font-bold text-white">{lead.destination || lead.packageName || "Custom Tour"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Travel Date</span>
                          <p className="font-semibold text-white">{lead.travelDate || "Flexible"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Travellers</span>
                          <p className="font-semibold text-white">{lead.travellers?.length || 1} Persons</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ONLINE PAYMENTS */}
        {activeTab === "online" && (
          <div className="space-y-6">
            {/* Header & Metric Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0F172A] to-[#0F172A] border border-cyan-500/30 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Digital Gateway & UPI</span>
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  Online Payments & Gateway Records
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Track all digital tour booking payments (UPI, Cards, NetBanking, and Payment Gateway). When payment gateways are integrated, online checkouts will automatically log here.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-5 py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-right">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 block">Total Online Revenue</span>
                  <span className="text-2xl font-black text-cyan-400 font-['Outfit']">
                    ₹{filteredOnlineLeads.reduce((s, l) => s + (Number(l.bookingAmount) || 0), 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {filteredOnlineLeads.length} {filteredOnlineLeads.length === 1 ? "transaction" : "transactions"}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={onlineSearchQuery}
                  onChange={(e) => setOnlineSearchQuery(e.target.value)}
                  placeholder="Search online payments by name, phone, txn ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Online Bookings List / Table */}
            {filteredOnlineLeads.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10">
                <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No online payments found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mark any enquiry as &quot;Booked&quot; with &quot;Online Payment&quot; mode or connect a payment gateway.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOnlineLeads.map((lead) => {
                  const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                    lead.fullName
                  )}!%20Your%20online%20payment%20of%20₹${(lead.bookingAmount || 0).toLocaleString("en-IN")}%20for%20Watch%20My%20Trip%20Package%20is%20received%20successfully.`;

                  return (
                    <div
                      key={lead.id}
                      className="p-5 rounded-2xl bg-[#0F172A]/90 border border-cyan-500/20 backdrop-blur-md shadow-lg text-left"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white font-['Outfit']">
                              {lead.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              <span>Online Payment</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Date: {lead.bookingDate ? new Date(lead.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 hover:text-cyan-400 font-semibold text-white"
                            >
                              <Phone className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{lead.phone}</span>
                            </a>
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-1.5 hover:text-cyan-400"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lead.email}</span>
                              </a>
                            )}
                            {lead.paymentReference && (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
                                Txn ID: <strong className="text-white">{lead.paymentReference}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Online Amount</span>
                            <span className="text-2xl font-extrabold text-cyan-400 font-['Outfit']">
                              ₹{(lead.bookingAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-md hover:scale-105 transition-all"
                            title="Send Online Receipt via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              setCancellationModal({
                                isOpen: true,
                                lead,
                                reason: "",
                                refundAmount: lead.bookingAmount ? String(lead.bookingAmount) : "0",
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                            title="Cancel Booking & Deduct Amount"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        </div>
                      </div>

                      {/* Summary breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination / Tour</span>
                          <p className="font-bold text-white">{lead.destination || lead.packageName || "Custom Tour"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Travel Date</span>
                          <p className="font-semibold text-white">{lead.travelDate || "Flexible"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Travellers</span>
                          <p className="font-semibold text-white">{lead.travellers?.length || 1} Persons</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CANCELLED BOOKINGS */}
        {activeTab === "cancelled" && (
          <div className="space-y-6">
            {/* Header & Metric Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0F172A] to-[#0F172A] border border-rose-500/30 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-extrabold text-rose-400 uppercase tracking-wider mb-2">
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancellations & Refunds</span>
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  Cancelled Bookings & Deductions
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Bookings that were cancelled after confirmation. The refunded amounts shown here have been subtracted from active Cash or Online payment revenue.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-5 py-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-right">
                  <span className="text-[10px] uppercase font-bold text-rose-300 block">Total Deductions</span>
                  <span className="text-2xl font-black text-rose-400 font-['Outfit']">
                    -₹{filteredCancelledLeads.reduce((s, l) => s + (Number(l.refundAmount ?? l.bookingAmount) || 0), 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {filteredCancelledLeads.length} cancelled {filteredCancelledLeads.length === 1 ? "tour" : "tours"}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cancelledSearchQuery}
                  onChange={(e) => setCancelledSearchQuery(e.target.value)}
                  placeholder="Search cancelled bookings by name, reason..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Cancelled Bookings List / Table */}
            {filteredCancelledLeads.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No cancelled bookings</h4>
                <p className="text-xs text-slate-400 mt-1">
                  All confirmed tours are currently active with zero cancellations!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCancelledLeads.map((lead) => {
                  const refund = lead.refundAmount ?? lead.bookingAmount ?? 0;
                  return (
                    <div
                      key={lead.id}
                      className="p-5 rounded-2xl bg-[#0F172A]/90 border border-rose-500/30 backdrop-blur-md shadow-lg text-left"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white font-['Outfit']">
                              {lead.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              <span>Cancelled Booking</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Cancelled on: {lead.cancelledAt ? new Date(lead.cancelledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 hover:text-rose-400 font-semibold text-white"
                            >
                              <Phone className="w-3.5 h-3.5 text-rose-400" />
                              <span>{lead.phone}</span>
                            </a>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300">
                              Original Mode: <strong className="text-white capitalize">{lead.paymentMode || "Online"}</strong>
                            </span>
                            {lead.bookingAmount && (
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300">
                                Original Booking: <strong className="text-white">₹{lead.bookingAmount.toLocaleString("en-IN")}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Refund & Reactivate Action */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-rose-300 block">Deducted / Refunded</span>
                            <span className="text-2xl font-extrabold text-rose-400 font-['Outfit']">
                              -₹{refund.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleReactivateBooking(lead)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                            title="Reactivate this booking and re-credit payment"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Reactivate Booking</span>
                          </button>
                        </div>
                      </div>

                      {/* Reason & Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <span className="text-[10px] uppercase font-bold text-rose-300 block mb-1">Cancellation Reason</span>
                          <p className="text-rose-200 font-medium">{lead.cancellationReason || "Customer cancelled travel plan"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination</span>
                          <p className="font-semibold text-white">{lead.destination || lead.packageName || "Tour"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CUSTOMER REVIEWS & MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-left">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Customer Reviews Moderation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live reviews submitted by travelers for Goa Packages and Hotel Small Daddy Plus. You can moderate or delete unwanted reviews at any time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshReviews}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-bold transition-all border border-white/10 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#FF5A3C]" />
                  <span>Refresh Reviews</span>
                </button>
              </div>
            </div>

            {reviewToast && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-left">
                {reviewToast}
              </div>
            )}

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  placeholder="Search by name, comment, or hotel..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#FF5A3C]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={reviewCategoryFilter}
                  onChange={(e) => setReviewCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5A3C] shadow-sm"
                  style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
                >
                  <option value="all" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>All Categories ({reviewsList.length})</option>
                  <option value="package" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>📦 Tour Packages ({reviewsList.filter((r) => r.category === "package").length})</option>
                  <option value="hotel" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>🏨 Hotel Small Daddy Plus ({reviewsList.filter((r) => r.category === "hotel").length})</option>
                </select>

                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5A3C] shadow-sm"
                  style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
                >
                  <option value="all" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>All Star Ratings</option>
                  <option value="5" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>⭐⭐⭐⭐⭐ 5 Stars</option>
                  <option value="4" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>⭐⭐⭐⭐ 4 Stars</option>
                  <option value="3" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>⭐⭐⭐ 3 Stars</option>
                  <option value="2" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>⭐⭐ 2 Stars</option>
                  <option value="1" style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}>⭐ 1 Star</option>
                </select>
              </div>
            </div>

            {/* Reviews Grid */}
            {filteredReviewsList.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white/5 border border-white/10">
                <MessageSquareHeart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No reviews found</h4>
                <p className="text-xs text-slate-400 mt-1">Try resetting search filters or submit a review on the website.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {filteredReviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-[#0F172A]/90 border border-white/10 backdrop-blur-md shadow-lg flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top bar: Reviewer, Location, Category, Delete */}
                      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-white font-['Outfit']">{rev.name}</h4>
                            <span className="text-[10px] text-slate-400">({rev.location})</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-[#FF5A3C] font-semibold mt-1 flex items-center gap-1">
                            <span>{rev.category === "hotel" ? "🏨" : "📦"}</span>
                            <span>{rev.targetName}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id)}
                          disabled={isDeletingReviewId === rev.id}
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                          title="Delete this review from website and database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Rating & Experience */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-300">
                          {rev.experience || "Excellent"}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-auto">{rev.createdAt}</span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-slate-300 leading-relaxed mt-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Review ID: {rev.id}</span>
                      <span className="text-emerald-400 font-semibold">Live on Website</span>
                    </div>
                  </div>
                ))}
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

        {/* Custom Confirmation Modal (Replaces native browser window.confirm) */}
        {mounted && confirmModal?.isOpen && typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
              <div
                className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-white/15 p-6 shadow-2xl text-left overflow-hidden transform animate-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
              >
                {/* Accent top gradient bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    confirmModal.variant === "danger"
                      ? "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"
                      : confirmModal.variant === "warning"
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
                      : "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"
                  }`}
                />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      confirmModal.variant === "danger"
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10"
                        : confirmModal.variant === "warning"
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                        : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                    }`}
                  >
                    {confirmModal.variant === "danger" ? (
                      <Trash2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      {confirmModal.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {confirmModal.message}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    {confirmModal.cancelText || "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmModal.onConfirm()}
                    className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer ${
                      confirmModal.variant === "danger"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30"
                        : "bg-gradient-to-r from-[#FF5A3C] to-[#E04629] hover:from-[#ff6b50] hover:to-[#ea5235] shadow-[#FF5A3C]/30"
                    }`}
                  >
                    {confirmModal.confirmText || "Confirm"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Custom Booking Confirmation & Payment Modal Dialog */}
        {mounted && bookingModal.isOpen && bookingModal.lead && typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
              <div
                className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-white/15 p-6 sm:p-7 shadow-2xl text-left overflow-hidden transform animate-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
              >
                {/* Accent top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                <button
                  type="button"
                  onClick={() =>
                    setBookingModal({ isOpen: false, lead: null, amount: "", paymentMode: "online", reference: "", bookingDate: "" })
                  }
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Confirm Tour Booking
                    </span>
                    <h3 className="text-lg font-bold text-white font-['Outfit'] mt-1">
                      {bookingModal.lead.fullName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Phone: <strong className="text-white">{bookingModal.lead.phone}</strong> • {bookingModal.lead.destination || bookingModal.lead.packageName || "Tour"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {/* Mode of Payment Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Select Mode of Payment *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBookingModal({ ...bookingModal, paymentMode: "cash" })}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          bookingModal.paymentMode === "cash"
                            ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${bookingModal.paymentMode === "cash" ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400"}`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">💵 Cash Payment</div>
                          <div className="text-[10px] text-slate-400">Office cash receipt</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingModal({ ...bookingModal, paymentMode: "online" })}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          bookingModal.paymentMode === "online"
                            ? "bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${bookingModal.paymentMode === "online" ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400"}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">💳 Online Payment</div>
                          <div className="text-[10px] text-slate-400">UPI / Card / Gateway</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Booking Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Booking Amount (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">₹</span>
                      <input
                        type="text"
                        required
                        value={bookingModal.amount}
                        onChange={(e) => setBookingModal({ ...bookingModal, amount: e.target.value })}
                        placeholder="e.g. 25000"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Booking Date & Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Booking Date
                      </label>
                      <input
                        type="date"
                        value={bookingModal.bookingDate}
                        onChange={(e) => setBookingModal({ ...bookingModal, bookingDate: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {bookingModal.paymentMode === "cash" ? "Receipt / Note (Optional)" : "UPI / Txn Ref ID (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={bookingModal.reference}
                        onChange={(e) => setBookingModal({ ...bookingModal, reference: e.target.value })}
                        placeholder={bookingModal.paymentMode === "cash" ? "e.g. Receipt #104" : "e.g. UPI-98437298"}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setBookingModal({ isOpen: false, lead: null, amount: "", paymentMode: "online", reference: "", bookingDate: "" })
                      }
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      Confirm Booking & Record Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Custom Booking Cancellation & Refund Modal Dialog */}
        {mounted && cancellationModal.isOpen && cancellationModal.lead && typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
              <div
                className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-rose-500/30 p-6 sm:p-7 shadow-2xl text-left overflow-hidden transform animate-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
              >
                {/* Accent top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 to-red-600" />

                <button
                  type="button"
                  onClick={() =>
                    setCancellationModal({ isOpen: false, lead: null, reason: "", refundAmount: "" })
                  }
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10">
                    <Ban className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Cancel Confirmed Booking
                    </span>
                    <h3 className="text-lg font-bold text-white font-['Outfit'] mt-1">
                      {cancellationModal.lead.fullName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Original Booking: <strong className="text-white">₹{(cancellationModal.lead.bookingAmount || 0).toLocaleString("en-IN")}</strong> via <strong className="text-emerald-400 capitalize">{cancellationModal.lead.paymentMode || "Online"}</strong>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 mb-4 leading-relaxed">
                  ⚠️ <strong>Notice:</strong> Cancelling this tour will automatically subtract this amount from active <strong>{cancellationModal.lead.paymentMode === "cash" ? "Cash" : "Online"}</strong> totals and move this booking to the <strong>Cancelled Bookings</strong> tab.
                </div>

                <form onSubmit={handleConfirmCancellation} className="space-y-4">
                  {/* Cancellation Reason */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Reason for Cancellation *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={cancellationModal.reason}
                      onChange={(e) => setCancellationModal({ ...cancellationModal, reason: e.target.value })}
                      placeholder="e.g. Client requested cancellation due to date conflict / emergency"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500 shadow-sm"
                    />
                  </div>

                  {/* Refund / Deduction Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Amount to Deduct / Refund (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">₹</span>
                      <input
                        type="text"
                        required
                        value={cancellationModal.refundAmount}
                        onChange={(e) => setCancellationModal({ ...cancellationModal, refundAmount: e.target.value })}
                        placeholder="e.g. 25000"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:border-rose-500 shadow-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter the refund amount to subtract from total revenue.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCancellationModal({ isOpen: false, lead: null, reason: "", refundAmount: "" })
                      }
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                    >
                      Keep Booking Active
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                    >
                      Confirm Cancellation & Deduct Amount
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Custom Alert/Notice Modal (Replaces native browser window.alert) */}
        {mounted && alertModal?.isOpen && typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
              <div
                className="relative w-full max-w-sm rounded-2xl bg-[#0F172A] border border-white/15 p-6 shadow-2xl text-left overflow-hidden transform animate-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
              >
                {/* Accent top gradient bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    alertModal.type === "success"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : alertModal.type === "warning"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : alertModal.type === "error"
                      ? "bg-gradient-to-r from-rose-500 to-red-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      alertModal.type === "success"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                        : alertModal.type === "warning"
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                        : alertModal.type === "error"
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                        : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                    }`}
                  >
                    {alertModal.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : alertModal.type === "warning" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      {alertModal.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {alertModal.message}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAlertModal(null)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5A3C] to-[#E04629] hover:from-[#ff6b50] hover:to-[#ea5235] text-white text-xs font-bold shadow-lg shadow-[#FF5A3C]/30 transition-all cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

      </div>
    </div>
  );
}
