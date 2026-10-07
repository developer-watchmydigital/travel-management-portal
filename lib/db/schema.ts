import { pgTable, text, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";

/**
 * 1. Admin Users Table
 */
export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 2. Curated Tour Packages Table
 */
export const packages = pgTable("packages", {
  id: text("id").primaryKey(),
  state: text("state").default("Goa").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  route: text("route"),
  duration: text("duration").notNull(),
  categoryBadge: text("category_badge").default("Holiday Tour"),
  badgeGradient: text("badge_gradient").default("from-pink-500 to-rose-500"),
  image: text("image").notNull(),
  flyerImage: text("flyer_image"),
  galleryImages: jsonb("gallery_images").$type<string[]>(),
  originalPrice: text("original_price").notNull(),
  discountedPrice: text("discounted_price").notNull(),
  savings: text("savings"),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  itinerary: jsonb("itinerary").$type<
    { day: number; title: string; description: string }[]
  >().default([]),
  inclusions: jsonb("inclusions").$type<string[]>().default([]),
  detailedInclusions: jsonb("detailed_inclusions").$type<any[]>(),
  exclusions: jsonb("exclusions").$type<string[]>().default([]),
  featured: boolean("featured").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 3. Hero Carousel Banners Table
 */
export const heroBanners = pgTable("hero_banners", {
  id: text("id").primaryKey(),
  orderIndex: integer("order_index").default(0).notNull(),
  packageId: text("package_id"),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  image: text("image").notNull(),
  badge: text("badge").notNull(),
  tag: text("tag").notNull(),
  price: text("price"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  locationText: text("location_text"),
  availabilityText: text("availability_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 4. Destinations Table
 */
export const destinations = pgTable("destinations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  category: text("category").notNull(), // 'india' | 'international'
  image: text("image").notNull(),
  duration: text("duration"),
  startingPrice: text("starting_price"),
  featured: boolean("featured").default(false),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 5. Services Table (Flight, Train, Hotels, Car Rental, etc.)
 */
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  shortDesc: text("short_desc").notNull(),
  fullDesc: text("full_desc").notNull(),
  iconName: text("icon_name").notNull(),
  badge: text("badge").notNull(),
  image: text("image").notNull(),
  photos: jsonb("photos").$type<{ url: string; title?: string; caption?: string }[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 6. Inquiry Leads & Customer Bookings Table
 */
export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'package' | 'flight' | 'train' | 'hotel' | 'car'
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  destination: text("destination"),
  packageName: text("package_name"),
  flightType: text("flight_type"),
  trainClass: text("train_class"),
  serviceName: text("service_name"),
  travelDate: text("travel_date"),
  travellers: jsonb("travellers").$type<{ name: string; age: string; gender: string }[]>(),
  specialRequirements: text("special_requirements"),
  status: text("status").default("New").notNull(), // 'New' | 'Contacted' | 'Booked' | 'Cancelled' | 'Refund Pending'
  bookingAmount: integer("booking_amount"),
  paymentMode: text("payment_mode"), // 'cash' | 'online'
  paymentReference: text("payment_reference"),
  bookingDate: text("booking_date"),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: text("cancelled_at"),
  refundAmount: integer("refund_amount"),
  serviceDetails: jsonb("service_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 7. Customer Reviews & Testimonials Table
 */
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  rating: integer("rating").notNull(),
  experience: text("experience"),
  category: text("category").notNull(), // 'package' | 'hotel'
  targetName: text("target_name"),
  comment: text("comment").notNull(),
  createdAt: text("created_at").notNull(),
  verified: boolean("verified").default(true),
});

/**
 * 8. Company Profile & Info Table
 */
export const companyInfo = pgTable("company_info", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull(),
  tagline: text("tagline"),
  founder: text("founder"),
  director: text("director"),
  experienceYears: text("experience_years"),
  satisfiedCustomers: text("satisfied_customers"),
  formerName: text("former_name"),
  address: text("address"),
  phones: jsonb("phones").$type<string[]>(),
  whatsapp: text("whatsapp"),
  emails: jsonb("emails").$type<string[]>(),
  instagram: text("instagram"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
