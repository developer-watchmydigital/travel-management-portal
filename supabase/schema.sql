-- =========================================================================
-- WATCH MY TRIP PACKAGE - SUPABASE PRODUCTION DATABASE SCHEMA
-- Copy and paste this complete script into Supabase SQL Editor and click RUN.
-- Safe to run multiple times (idempotent with IF NOT EXISTS & DROP POLICY IF EXISTS).
-- =========================================================================

-- =========================================================================
-- 1. LEADS TABLE (Customer Enquiries from Website & Modal)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'package', -- 'package', 'hotel', 'car', 'flight', 'train', 'group', 'corporate', 'service'
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    destination TEXT,
    package_name TEXT,
    travel_date TEXT,
    travellers JSONB DEFAULT '[]'::jsonb,
    special_requirements TEXT,
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Contacted', 'Booked', 'Cancelled', 'Closed'
    booking_amount NUMERIC DEFAULT 0,
    payment_mode TEXT, -- 'cash', 'online'
    payment_reference TEXT,
    booking_date TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    refund_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was already created earlier (Idempotent Migration)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_airline TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_train TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS booking_amount NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_mode TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS booking_date TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_type ON public.leads (type);
CREATE INDEX IF NOT EXISTS idx_leads_payment_mode ON public.leads (payment_mode);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public website visitors to submit enquiries
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
CREATE POLICY "Allow public insert on leads" 
ON public.leads FOR INSERT 
TO anon, authenticated, service_role 
WITH CHECK (true);

-- Allow reading leads (admin dashboard & authenticated sessions)
DROP POLICY IF EXISTS "Allow read on leads" ON public.leads;
CREATE POLICY "Allow read on leads" 
ON public.leads FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

-- Allow updating leads status (admin dashboard)
DROP POLICY IF EXISTS "Allow update on leads" ON public.leads;
CREATE POLICY "Allow update on leads" 
ON public.leads FOR UPDATE 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Allow deleting leads (admin dashboard)
DROP POLICY IF EXISTS "Allow delete on leads" ON public.leads;
CREATE POLICY "Allow delete on leads" 
ON public.leads FOR DELETE 
TO anon, authenticated, service_role 
USING (true);

-- Full access for service_role
DROP POLICY IF EXISTS "Allow service role full access on leads" ON public.leads;
CREATE POLICY "Allow service role full access on leads" 
ON public.leads FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);


-- =========================================================================
-- 2. REVIEWS TABLE (Goa Packages & Hotel Small Daddy Plus Reviews)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT DEFAULT 'Goa Traveler',
    rating INTEGER NOT NULL DEFAULT 5,
    experience TEXT NOT NULL DEFAULT 'Excellent',
    category TEXT NOT NULL DEFAULT 'package', -- 'package' or 'hotel'
    target_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_category ON public.reviews (category);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on reviews" ON public.reviews;
CREATE POLICY "Allow public select on reviews" 
ON public.reviews FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

DROP POLICY IF EXISTS "Allow public insert on reviews" ON public.reviews;
CREATE POLICY "Allow public insert on reviews" 
ON public.reviews FOR INSERT 
TO anon, authenticated, service_role 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on reviews" ON public.reviews;
CREATE POLICY "Allow update on reviews" 
ON public.reviews FOR UPDATE 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete on reviews" ON public.reviews;
CREATE POLICY "Allow delete on reviews" 
ON public.reviews FOR DELETE 
TO anon, authenticated, service_role 
USING (true);

DROP POLICY IF EXISTS "Allow service role full access on reviews" ON public.reviews;
CREATE POLICY "Allow service role full access on reviews" 
ON public.reviews FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Seed Initial 5 Goa Reviews (3 Goa Packages, 2 Hotel Small Daddy Plus)
INSERT INTO public.reviews (id, name, location, rating, experience, category, target_name, comment, verified, created_at)
VALUES
  ('rev-pkg-1', 'Rahul & Neha Sharma', 'Mumbai, Maharashtra', 5, 'Excellent', 'package', 'Goa Honeymoon & Mandovi Dinner Cruise Package', 'Our 5D/4N Goa holiday package with Watch My Trip Package was completely magical! The open-deck Mandovi river cruise with Goan folk dance, private sanitised cab for North & South Goa sightseeing, and seamless transfers were handled with perfection.', true, now() - interval '8 days'),
  ('rev-pkg-2', 'Amit Patel', 'Ahmedabad, Gujarat', 5, 'Excellent', 'package', 'Goa 4N/5D Family Adventure & Beach Tour', 'Traveled with our entire family including parents and kids. Everything was transparently itemized with zero surprise charges. From Calangute & Baga beaches to Aguada Fort and Old Goa churches, the driver was courteous and punctual.', true, now() - interval '22 days'),
  ('rev-pkg-3', 'Vikram Singh & Friends', 'Delhi NCR', 5, 'Good', 'package', 'Goa Grand Island Scuba & Adventure Boat Package', 'The Grand Island boat trip and scuba diving in Goa were top-notch! The team coordinated our railway pickups, daily breakfast, and beach excursions flawlessly. 24/7 on-call support made the trip stress-free.', true, now() - interval '45 days'),
  ('rev-hotel-1', 'Sneha Kulkarni', 'Pune, Maharashtra', 5, 'Excellent', 'hotel', 'Hotel Small Daddy Plus, Calangute', 'Stayed at Hotel Small Daddy Plus near Calangute beach. The deluxe room was clean, AC was chilly, and the swimming pool was well-maintained. The staff was super helpful and the breakfast spread had delicious varieties every morning.', true, now() - interval '15 days'),
  ('rev-hotel-2', 'Dr. Jayesh Mehta', 'Mehsana, Gujarat', 5, 'Good', 'hotel', 'Hotel Small Daddy Plus, Calangute', 'Very peaceful yet only a 5-minute walk from Calangute beach. Safe family atmosphere, prompt room service, and comfortable bedding. Director Masum Ahmed personally ensured our stay was hassle-free. Highly recommended!', true, now() - interval '34 days')
ON CONFLICT (id) DO NOTHING;


-- =========================================================================
-- 3. SERVICES TABLE (Hotel & Car Rental Showcase Photos)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    photos JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on services" ON public.services;
CREATE POLICY "Allow public select on services" 
ON public.services FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

DROP POLICY IF EXISTS "Allow all on services" ON public.services;
CREATE POLICY "Allow all on services" 
ON public.services FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);


-- =========================================================================
-- 4. CURATED PACKAGES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL DEFAULT 'Goa',
    title TEXT NOT NULL,
    subtitle TEXT,
    route TEXT,
    duration TEXT NOT NULL DEFAULT '4 Days & 3 Nights',
    category_badge TEXT DEFAULT 'Holiday Tour',
    badge_gradient TEXT DEFAULT 'from-pink-500 to-rose-500',
    image TEXT NOT NULL,
    flyer_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    original_price TEXT NOT NULL DEFAULT '0',
    discounted_price TEXT NOT NULL DEFAULT '0',
    savings TEXT NOT NULL DEFAULT '0',
    highlights JSONB DEFAULT '[]'::jsonb,
    itinerary JSONB DEFAULT '[]'::jsonb,
    inclusions JSONB DEFAULT '[]'::jsonb,
    detailed_inclusions JSONB DEFAULT '[]'::jsonb,
    exclusions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_packages_state ON public.packages (state);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on packages" ON public.packages;
DROP POLICY IF EXISTS "Allow all on packages" ON public.packages;
CREATE POLICY "Allow all on packages" 
ON public.packages FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);


-- =========================================================================
-- 5. DESTINATIONS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL DEFAULT 'india',
    starting_price TEXT NOT NULL,
    duration TEXT NOT NULL,
    image TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on destinations" ON public.destinations;
DROP POLICY IF EXISTS "Allow all on destinations" ON public.destinations;
CREATE POLICY "Allow all on destinations" 
ON public.destinations FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);


-- =========================================================================
-- 6. COMPANY INFO TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.company_info (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'WATCH MY TRIP PACKAGE',
    tagline TEXT DEFAULT 'Your Journey, Our Responsibility',
    founder TEXT DEFAULT 'Masrur Ahmed',
    director TEXT DEFAULT 'Masum Ahmed',
    experience_years TEXT DEFAULT '3+',
    satisfied_customers TEXT DEFAULT '1,000+',
    former_name TEXT DEFAULT 'Ranjan Services',
    address TEXT DEFAULT 'Golden Beach Road, Calangute Beach, Calangute, Goa - 403516',
    phones JSONB DEFAULT '["+91 95886 67027", "+91 70583 23165"]'::jsonb,
    whatsapp TEXT DEFAULT '919588667027',
    emails JSONB DEFAULT '["support-package@watchmydigital.com"]'::jsonb,
    instagram TEXT DEFAULT 'https://www.instagram.com/watchmytrippackage?stkn=MWxieXNncG5hcDl4OA%3D%3D&utm_source=qr',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on company_info" ON public.company_info;
DROP POLICY IF EXISTS "Allow all on company_info" ON public.company_info;
CREATE POLICY "Allow all on company_info" 
ON public.company_info FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);


-- =========================================================================
-- 7. HERO CAROUSEL BANNERS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id TEXT PRIMARY KEY,
    order_index INTEGER NOT NULL DEFAULT 0,
    package_id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image TEXT NOT NULL,
    badge TEXT NOT NULL,
    tag TEXT NOT NULL,
    price TEXT,
    button_text TEXT,
    button_link TEXT,
    location_text TEXT,
    availability_text TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on hero_banners" ON public.hero_banners;
CREATE POLICY "Allow public select on hero_banners" 
ON public.hero_banners FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

DROP POLICY IF EXISTS "Allow all on hero_banners" ON public.hero_banners;
CREATE POLICY "Allow all on hero_banners" 
ON public.hero_banners FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Seed Initial 4 Hero Carousel Banners
INSERT INTO public.hero_banners (id, order_index, package_id, title, subtitle, image, badge, tag, price, button_text, button_link, location_text, availability_text)
VALUES
  ('goa-summer-offer', 0, 'pkg-sdp-4n5d-spa', 'Hotel Small Daddy Plus Signature Package', '4N/5D Summer Best Offer: Dinner Cruise, Adventure Boat Party, North/South Tour & Full Body Spa.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop', 'Summer Best Offer: ₹2,499 / Day', 'Summer Best Offer', 'From ₹9,996 / person', 'View 4N/5D Summer Offer (₹2,499/Day)', '/packages/pkg-sdp-4n5d-spa', 'Goa Package Special', 'Available 24x7'),
  ('goa-2', 1, 'pkg-goa-4n5d-luxury', 'Heritage Forts & Portuguese Villas', 'Wander through colorful Latin quarters of Fontainhas, historic Aguada & Chapora Forts.', 'https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=1600&auto=format&fit=crop', 'Cultural & Heritage Tours', 'Historical Marvels', 'From ₹14,499 / person', 'Explore Heritage Tour (₹14,499)', '/packages/pkg-goa-4n5d-luxury', 'Goa Cultural Special', 'Available 24x7'),
  ('goa-3', 2, 'pkg-goa-3n4d-watersports', 'Luxury Catamaran & Island Cruises', 'Sail along the pristine Mandovi river, spot dolphins at Grand Island, and enjoy watersports.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop', 'VIP Yacht & Watersport Experience', 'Adventure & Thrill', 'From ₹16,999 / person', 'Book Island & Cruise Tour (₹16,999)', '/packages/pkg-goa-3n4d-watersports', 'Grand Island Special', 'Available 24x7'),
  ('goa-4', 3, 'pkg-goa-5n6d-honeymoon', 'Tropical Palms & Serene Backwaters', 'Unwind at tranquil South Goa resorts surrounded by emerald palms and serene coastal rivers.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop', 'Custom Family & Honeymoon Retreat', 'Ultimate Relaxation', 'From ₹18,500 / person', 'View Honeymoon Retreat (₹18,500)', '/packages/pkg-goa-5n6d-honeymoon', 'South Goa Special', 'Available 24x7')
ON CONFLICT (id) DO NOTHING;

