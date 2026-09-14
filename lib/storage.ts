import { companyData, destinationsData, servicesData, initialCuratedPackages } from "./initialData";
import { CompanyInfo, Destination, InquiryLead, TravelService, CuratedPackage } from "./types";

const LEADS_KEY = "r_travel_leads_v1";
const DESTINATIONS_KEY = "r_travel_destinations_v2";
const SERVICES_KEY = "r_travel_services_v1";
const COMPANY_KEY = "r_travel_company_v1";
const PACKAGES_KEY = "r_travel_curated_packages_v1";

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
  }
  return newLead;
}

export function updateLeadStatus(id: string, status: InquiryLead["status"]) {
  if (typeof window === "undefined") return;
  const current = getStoredLeads();
  const updated = current.map((l) => (l.id === id ? { ...l, status } : l));
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
    return JSON.parse(data);
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
    return parsed;
  } catch {
    return initialCuratedPackages;
  }
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

