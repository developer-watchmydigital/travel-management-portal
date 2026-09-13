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
  experienceYears: string;
  satisfiedCustomers: string;
  formerName: string;
  address: string;
  phones: string[];
  whatsapp: string;
  emails: string[];
}
