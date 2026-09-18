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

export interface ServicePhoto {
  url: string;
  title?: string;
  caption?: string;
}

export interface TravelService {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge: string;
  image: string;
  photos?: ServicePhoto[]; // 3 showcase photos (especially for Hotel Booking and Car Rental)
}

export interface InquiryLead {
  id: string;
  type: "package" | "flight" | "train" | "hotel" | "car" | "group" | "corporate" | "customized" | "domestic" | "family" | "honeymoon" | "pilgrimage" | string;
  fullName: string;
  phone: string;
  email: string;
  destination?: string;
  packageName?: string;
  serviceName?: string;
  flightType?: "one-way" | "round-trip" | "multi-city";
  preferredAirline?: string;
  trainClass?: string;
  preferredTrain?: string;
  travelDate?: string;
  travellers: Array<{
    name: string;
    age: string;
    gender: string;
  }>;
  specialRequirements?: string;
  serviceDetails?: Record<string, string>;
  status: "New" | "Contacted" | "Booked" | "Cancelled" | "Closed";
  bookingAmount?: number;
  paymentMode?: "cash" | "online";
  paymentReference?: string;
  bookingDate?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  serviceOrPackage: string;
  amount: number;
  mode: "cash" | "online";
  status: "paid" | "cancelled";
  referenceId?: string;
  date: string;
  cancellationReason?: string;
  cancelledAt?: string;
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
  image?: string; // Optional primary picture URL
  images?: string[]; // Up to 3 room/service photos
  category?: string; // e.g. "Accommodation", "Cruise", "Watersports", "Sightseeing", "Wellness", "Nightlife"
  badge?: string;
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
  galleryImages?: string[]; // 6 Curated Moments & Sights Photos
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

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number; // 1 to 5
  experience: "Excellent" | "Good" | "Average" | "Bad" | "Terrible";
  category: "package" | "hotel"; // "package" for Goa packages, "hotel" for Hotel Small Daddy Plus
  targetName: string; // e.g. "Goa Honeymoon & Cruise Package" or "Hotel Small Daddy Plus, Calangute"
  comment: string;
  createdAt: string;
  verified?: boolean;
}
