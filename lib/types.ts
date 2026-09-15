export interface Destination {
  id: string;
  name: string;
  tagline: string;
  category: "india" | "international";
  image: string;
  duration: string;
  startingPrice: string;
  featured?: boolean;
  highlights: string[];
}

export interface TravelService {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge: string;
  image: string;
}

export interface InquiryLead {
  id: string;
  type: "package" | "flight" | "train";
  fullName: string;
  phone: string;
  email: string;
  destination?: string;
  packageName?: string;
  flightType?: "one-way" | "round-trip" | "multi-city";
  trainClass?: string;
  travelDate?: string;
  travellers: Array<{
    name: string;
    age: string;
    gender: string;
  }>;
  specialRequirements?: string;
  status: "New" | "Contacted" | "Booked" | "Closed";
  createdAt: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  founder: string;
  director?: string;
  experienceYears: string;
  satisfiedCustomers: string;
  formerName: string;
  address: string;
  phones: string[];
  whatsapp: string;
  emails: string[];
  instagram?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface PackageInclusionItem {
  id: string;
  title: string;
  description: string;
  image?: string; // Optional picture URL
  category?: string; // e.g. "Accommodation", "Cruise", "Watersports", "Sightseeing", "Wellness", "Nightlife"
}

export interface CuratedPackage {
  id: string;
  state: string; // e.g. "Goa", "Gujarat", "Himachal"
  title: string;
  subtitle: string;
  route: string; // e.g. "2N Calangute • 1N Baga Beach"
  duration: string; // e.g. "4 Days & 3 Nights"
  categoryBadge: string; // e.g. "Beach & Watersports", "Spiritual Coast"
  badgeGradient?: string;
  image: string;
  flyerImage?: string; // Optional promotional flyer image URL
  galleryImages?: string[]; // 10 Visual Experience Photos
  originalPrice: string; // e.g. "16,000"
  discountedPrice: string; // e.g. "11,999"
  savings: string; // e.g. "4,501"
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  detailedInclusions?: PackageInclusionItem[]; // Rich inclusions with description and optional picture for zig-zag/middle layout
  exclusions: string[];
  featured?: boolean;
}
