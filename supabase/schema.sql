-- =========================================================
-- WATCH MY TRIP - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (supabase.com)
-- =========================================================

-- 1. LEADS TABLE (Customer Inquiries from Website)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'package', -- 'package', 'flight', 'train', 'custom'
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    destination TEXT,
    package_name TEXT,
    travel_date TEXT,
    travellers JSONB DEFAULT '[]'::jsonb,
    special_requirements TEXT,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'converted', 'closed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);

-- 2. CURATED PACKAGES TABLE
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

-- 3. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL DEFAULT 'india', -- 'india' or 'international'
    starting_price TEXT NOT NULL,
    duration TEXT NOT NULL,
    image TEXT NOT NULL,
    highlights JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. COMPANY INFO TABLE
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

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- POLICIES: LEADS
-- Anyone (public website visitors) can insert inquiry leads
CREATE POLICY "Allow public insert on leads" 
ON public.leads FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Only service role / admin can view, update, delete leads
CREATE POLICY "Allow service role full access on leads" 
ON public.leads FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- POLICIES: PACKAGES
-- Anyone can view packages
CREATE POLICY "Allow public select on packages" 
ON public.packages FOR SELECT 
TO anon, authenticated 
USING (true);

-- Service role / admin can insert, update, delete packages
CREATE POLICY "Allow service role full access on packages" 
ON public.packages FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- POLICIES: DESTINATIONS
-- Anyone can view destinations
CREATE POLICY "Allow public select on destinations" 
ON public.destinations FOR SELECT 
TO anon, authenticated 
USING (true);

-- Service role full access on destinations
CREATE POLICY "Allow service role full access on destinations" 
ON public.destinations FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- POLICIES: COMPANY INFO
-- Anyone can view company info
CREATE POLICY "Allow public select on company_info" 
ON public.company_info FOR SELECT 
TO anon, authenticated 
USING (true);

-- Service role full access on company_info
CREATE POLICY "Allow service role full access on company_info" 
ON public.company_info FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- =========================================================================
-- 5. REVIEWS TABLE (Goa Packages & Hotel Small Daddy Plus 5-Star Reviews)
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

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on reviews" 
ON public.reviews FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public insert on reviews" 
ON public.reviews FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

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

