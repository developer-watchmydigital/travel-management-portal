import { companyData, destinationsData, servicesData, initialCuratedPackages, initialGoaReviews } from "./initialData";
import { CompanyInfo, Destination, InquiryLead, TravelService, CuratedPackage, ServicePhoto, Review } from "./types";

const LEADS_KEY = "r_travel_leads_v2";
const DESTINATIONS_KEY = "r_travel_destinations_v2";
const SERVICES_KEY = "r_travel_services_v2";
const COMPANY_KEY = "r_travel_company_v2";
const PACKAGES_KEY = "r_travel_curated_packages_v3";
const REVIEWS_KEY = "r_travel_reviews_v2";

export const initialLeads: InquiryLead[] = [
  {
    id: "lead-1",
    type: "package",
    fullName: "Rajesh Patel",
    phone: "+91 98250 12345",
    email: "rajesh.patel@gmail.com",
    destination: "Goa",
    packageName: "Exclusive 4N/5D Goa Coastal Bliss",
    travelDate: "2026-10-15",
    travellers: [
      { name: "Rajesh Patel", age: "38", gender: "Male" },
      { name: "Meena Patel", age: "35", gender: "Female" },
      { name: "Aarav Patel", age: "10", gender: "Male" },
    ],
    specialRequirements: "Beachfront resort preferred, vegetarian/Jain food arrangements, airport pickup from Mopa.",
    status: "New",
    createdAt: "2026-09-13T10:30:00.000Z",
  },
  {
    id: "lead-2",
    type: "flight",
    fullName: "Dr. Sanjay Mehta",
    phone: "+91 94260 88990",
    email: "dr.sanjaymehta@yahoo.com",
    destination: "Dubai",
    flightType: "round-trip",
    travelDate: "2026-11-04",
    travellers: [
      { name: "Dr. Sanjay Mehta", age: "45", gender: "Male" },
      { name: "Dr. Bhavna Mehta", age: "43", gender: "Female" },
    ],
    specialRequirements: "Emirates or Air India direct flight from Ahmedabad to Dubai with extra baggage.",
    status: "Contacted",
    createdAt: "2026-09-12T16:15:00.000Z",
  },
  {
    id: "lead-3",
    type: "train",
    fullName: "Kamleshbhai Prajapati",
    phone: "+91 99241 77654",
    email: "kamlesh.p@gmail.com",
    destination: "Kashmir",
    trainClass: "3AC",
    travelDate: "2026-10-22",
    travellers: [
      { name: "Kamleshbhai Prajapati", age: "52", gender: "Male" },
      { name: "Savitaben Prajapati", age: "50", gender: "Female" },
    ],
    specialRequirements: "Lower berth required for senior citizens. Connecting Jammu Tawi express.",
    status: "Booked",
    createdAt: "2026-09-11T12:00:00.000Z",
  },
  {
    id: "lead-4",
    type: "hotel",
    fullName: "Pooja & Vikram Singhania",
    phone: "+91 97123 45678",
    email: "vikram.singhania@gmail.com",
    destination: "Calangute, North Goa",
    serviceName: "Hotel Booking",
    packageName: "Hotel Small Daddy Plus (2 Deluxe Rooms)",
    travelDate: "2026-10-18",
    travellers: [
      { name: "Vikram Singhania", age: "34", gender: "Male" },
      { name: "Pooja Singhania", age: "31", gender: "Female" },
    ],
    serviceDetails: {
      "Hotel Category": "Hotel Small Daddy Plus (Beachside)",
      "Check-in": "18 Oct 2026",
      "Check-out": "22 Oct 2026",
      "Rooms": "2 Deluxe Pool View Rooms",
      "Meal Plan": "Breakfast Included (CP)",
      "Special Request": "Ground floor near pool with early check-in assistance",
    },
    specialRequirements: "Hotel: Hotel Small Daddy Plus | Rooms: 2 Deluxe Pool View | Check-in: 18-Oct-2026 to 22-Oct-2026 | Meal: CP (Breakfast) | Special: Early check-in requested.",
    status: "New",
    createdAt: "2026-09-17T09:40:00.000Z",
  },
  {
    id: "lead-5",
    type: "car",
    fullName: "Hardik Joshi",
    phone: "+91 98980 11223",
    email: "hardik.joshi@outlook.com",
    destination: "Goa (North & South)",
    serviceName: "Car Rental",
    packageName: "Toyota Innova Crysta (6+1 AC)",
    travelDate: "2026-10-25",
    travellers: [
      { name: "Hardik Joshi", age: "29", gender: "Male" },
      { name: "Ananya Joshi", age: "27", gender: "Female" },
    ],
    serviceDetails: {
      "Vehicle Type": "Toyota Innova Crysta (6+1 AC)",
      "Pickup Point": "Mopa International Airport (GOX)",
      "Drop Point": "Calangute Resort & South Goa Sightseeing",
      "Rental Duration": "4 Full Days with Chauffeur",
      "Special Instructions": "English/Hindi speaking polite driver, child car seat requested",
    },
    specialRequirements: "Car: Toyota Innova Crysta AC | Pickup: Mopa GOX Airport | Drop: Calangute & Sightseeing | Duration: 4 Days | Driver: Sanitized cab, non-smoker driver.",
    status: "Contacted",
    createdAt: "2026-09-17T11:20:00.000Z",
  },
];

export function getStoredLeads(): InquiryLead[] {
  if (typeof window === "undefined") return initialLeads;
  try {
    const data = localStorage.getItem(LEADS_KEY);
    if (!data) {
      localStorage.setItem(LEADS_KEY, JSON.stringify(initialLeads));
      return initialLeads;
    }
    return JSON.parse(data);
  } catch {
    return initialLeads;
  }
}

export function saveLead(lead: Omit<InquiryLead, "id" | "createdAt" | "status">): InquiryLead {
  const newLead: InquiryLead = {
    ...lead,
    id: "lead-" + Date.now(),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const current = getStoredLeads();
    const updated = [newLead, ...current];
    localStorage.setItem(LEADS_KEY, JSON.stringify(updated));

    // Instant local and cross-tab notification
    window.dispatchEvent(new CustomEvent("wmt-new-lead", { detail: newLead }));
    try {
      const bc = new BroadcastChannel("wmt_leads_channel");
      bc.postMessage({ type: "NEW_LEAD", lead: newLead });
      bc.close();
    } catch {}
  }
  return newLead;
}

export function updateLeadStatus(id: string, status: InquiryLead["status"]) {
  if (typeof window === "undefined") return;
  const current = getStoredLeads();
  const updated = current.map((l) => (l.id === id ? { ...l, status } : l));
  localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
}

export function updateLeadBookingDetails(
  id: string,
  details: {
    status?: InquiryLead["status"];
    bookingAmount?: number;
    paymentMode?: "cash" | "online";
    paymentReference?: string;
    bookingDate?: string;
    cancellationReason?: string;
    cancelledAt?: string;
    refundAmount?: number;
  }
) {
  if (typeof window === "undefined") return;
  const current = getStoredLeads();
  const updated = current.map((l) => (l.id === id ? { ...l, ...details } : l));
  localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
}

export function deleteLead(id: string) {
  if (typeof window === "undefined") return;
  const current = getStoredLeads();
  const updated = current.filter((l) => l.id !== id);
  localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
}

export function getStoredDestinations(): Destination[] {
  if (typeof window === "undefined") return destinationsData;
  try {
    const data = localStorage.getItem(DESTINATIONS_KEY);
    if (!data) {
      localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinationsData));
      return destinationsData;
    }
    return JSON.parse(data);
  } catch {
    return destinationsData;
  }
}

export function saveDestination(dest: Destination) {
  if (typeof window === "undefined") return;
  const current = getStoredDestinations();
  const index = current.findIndex((d) => d.id === dest.id);
  let updated: Destination[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = dest;
  } else {
    updated = [dest, ...current];
  }
  localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(updated));
}

export function deleteDestination(id: string) {
  if (typeof window === "undefined") return;
  const current = getStoredDestinations();
  const updated = current.filter((d) => d.id !== id);
  localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(updated));
}

export function getStoredCompanyInfo(): CompanyInfo {
  if (typeof window === "undefined") return companyData;
  try {
    const data = localStorage.getItem(COMPANY_KEY);
    if (!data) {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(companyData));
      return companyData;
    }
    const parsed: CompanyInfo = JSON.parse(data);
    if (
      !parsed.phones?.includes("+91 70583 23165") ||
      !parsed.address?.includes("Calangute") ||
      !parsed.instagram?.includes("watchmytrippackage") ||
      parsed.emails?.length !== 1 ||
      !parsed.emails?.includes("support-package@watchmydigital.com") ||
      parsed.name !== "WATCH MY TRIP PACKAGE"
    ) {
      parsed.name = "WATCH MY TRIP PACKAGE";
      parsed.whatsapp = "919588667027";
      parsed.phones = ["+91 95886 67027", "+91 70583 23165"];
      parsed.emails = ["support-package@watchmydigital.com"];
      parsed.address = "Golden Beach Road, Calangute Beach, Calangute, Goa - 403516";
      parsed.instagram = "https://www.instagram.com/watchmytrippackage?stkn=MWxieXNncG5hcDl4OA%3D%3D&utm_source=qr";
      localStorage.setItem(COMPANY_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return companyData;
  }
}

export function saveCompanyInfo(info: CompanyInfo) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPANY_KEY, JSON.stringify(info));
}

export function getStoredPackages(): CuratedPackage[] {
  if (typeof window === "undefined") return initialCuratedPackages;
  try {
    const data = localStorage.getItem(PACKAGES_KEY);
    if (!data) {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(initialCuratedPackages));
      return initialCuratedPackages;
    }
    const parsed = JSON.parse(data);
    // If empty or older version, fallback to initialCuratedPackages
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(initialCuratedPackages));
      return initialCuratedPackages;
    }
    // Auto-merge detailedInclusions & flyerImage from initialCuratedPackages if not present
    let updatedNeeded = false;
    const merged: CuratedPackage[] = parsed.map((pkg) => {
      const updatedPkg = { ...pkg };
      const initial = initialCuratedPackages.find((init) => init.id === pkg.id);
      if (initial) {
        // Clean out filler services (items 9 & 10) from cached data
        if (updatedPkg.detailedInclusions && Array.isArray(updatedPkg.detailedInclusions)) {
          const beforeLen = updatedPkg.detailedInclusions.length;
          updatedPkg.detailedInclusions = updatedPkg.detailedInclusions.filter((item: any) => {
            const isSunset = item.category === "Sunset Vantage" || item.title?.includes("Panoramic Sunset Viewing");
            const isConcierge = item.category === "Concierge Support" || item.title?.includes("24/7 Dedicated Trip Manager");
            return !isSunset && !isConcierge;
          });
          if (updatedPkg.detailedInclusions.length !== beforeLen) {
            updatedNeeded = true;
          }
          // Ensure accommodation item has the 3 room images
          updatedPkg.detailedInclusions.forEach((item: any) => {
            if (
              (item.category === "Accommodation" || item.title?.includes("Hotel Small Daddy Plus") || item.title?.includes("Stay")) &&
              (!item.images || item.images.length < 3)
            ) {
              const initAcc = initial.detailedInclusions?.find((i: any) => i.category === "Accommodation" || i.title?.includes("Hotel Small Daddy Plus"));
              if (initAcc?.images) {
                item.images = initAcc.images;
                updatedNeeded = true;
              }
            }
          });
        } else if (initial.detailedInclusions) {
          updatedPkg.detailedInclusions = initial.detailedInclusions;
          updatedNeeded = true;
        }

        if ((!pkg.galleryImages || pkg.galleryImages.length < 6) && initial.galleryImages) {
          updatedPkg.galleryImages = initial.galleryImages;
          updatedNeeded = true;
        }
        if (!pkg.flyerImage && initial.flyerImage) {
          updatedPkg.flyerImage = initial.flyerImage;
          updatedNeeded = true;
        }
      }
      return updatedPkg;
    });

    // Prepend any new initial packages that do not exist in localStorage yet
    const existingIds = new Set(merged.map((p) => p.id));
    const missingInitials = initialCuratedPackages.filter((init) => !existingIds.has(init.id));
    const finalPackages = missingInitials.length > 0 ? [...missingInitials, ...merged] : merged;

    if (missingInitials.length > 0 || updatedNeeded) {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(finalPackages));
    }
    return finalPackages;
  } catch {
    return initialCuratedPackages;
  }
}

export function getStoredPackageById(id: string): CuratedPackage | undefined {
  const all = getStoredPackages();
  return all.find((p) => p.id === id);
}

export function savePackage(pkg: CuratedPackage) {
  if (typeof window === "undefined") return;
  const current = getStoredPackages();
  const index = current.findIndex((p) => p.id === pkg.id);
  let updated: CuratedPackage[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = pkg;
  } else {
    updated = [pkg, ...current];
  }
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(updated));
}

export function deletePackage(id: string) {
  if (typeof window === "undefined") return;
  const current = getStoredPackages();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(updated));
}

export function getStoredServices(): TravelService[] {
  if (typeof window === "undefined") return servicesData;
  try {
    const data = localStorage.getItem(SERVICES_KEY);
    if (!data) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(servicesData));
      return servicesData;
    }
    const parsed: TravelService[] = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(servicesData));
      return servicesData;
    }
    // Merge any missing services or photos from servicesData
    let updated = false;
    const merged = servicesData.map((initial) => {
      const existing = parsed.find((p) => p.id === initial.id);
      if (!existing) {
        updated = true;
        return initial;
      }
      if ((!existing.photos || existing.photos.length < 3) && initial.photos) {
        existing.photos = initial.photos;
        updated = true;
      }
      return existing;
    });
    if (updated) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return servicesData;
  }
}

export function getStoredServiceById(id: string): TravelService | undefined {
  const all = getStoredServices();
  return all.find((s) => s.id === id);
}

export function saveService(service: TravelService) {
  if (typeof window === "undefined") return;
  const current = getStoredServices();
  const index = current.findIndex((s) => s.id === service.id);
  let updated: TravelService[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = service;
  } else {
    updated = [service, ...current];
  }
  localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
}

export function updateServicePhotos(id: string, photos: ServicePhoto[]) {
  if (typeof window === "undefined") return;
  const current = getStoredServices();
  const updated = current.map((s) => (s.id === id ? { ...s, photos } : s));
  localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
}

export function getStoredReviews(): Review[] {
  if (typeof window === "undefined") return initialGoaReviews;
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    if (!data) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(initialGoaReviews));
      return initialGoaReviews;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialGoaReviews;
  } catch {
    return initialGoaReviews;
  }
}

export function saveStoredReview(review: Review) {
  if (typeof window === "undefined") return;
  const current = getStoredReviews();
  const index = current.findIndex((r) => r.id === review.id);
  let updated: Review[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = review;
  } else {
    updated = [review, ...current];
  }
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("reviews-updated", { detail: updated }));
}

export function deleteStoredReview(id: string) {
  if (typeof window === "undefined") return;
  const current = getStoredReviews();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("reviews-updated", { detail: updated }));
}


