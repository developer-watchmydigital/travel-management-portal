import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { initialCuratedPackages } from "@/lib/initialData";
import { CuratedPackage } from "@/lib/types";

// Helper to convert database row to CuratedPackage
function rowToPackage(row: any): CuratedPackage {
  return {
    id: row.id,
    state: row.state,
    title: row.title,
    subtitle: row.subtitle || "",
    route: row.route || "",
    duration: row.duration,
    categoryBadge: row.category_badge || "Holiday Tour",
    badgeGradient: row.badge_gradient || "from-pink-500 to-rose-500",
    image: row.image,
    flyerImage: row.flyer_image || undefined,
    galleryImages: row.gallery_images || undefined,
    originalPrice: row.original_price,
    discountedPrice: row.discounted_price,
    savings: row.savings,
    highlights: row.highlights || [],
    itinerary: row.itinerary || [],
    inclusions: row.inclusions || [],
    detailedInclusions: row.detailed_inclusions || undefined,
    exclusions: row.exclusions || [],
  };
}

// Helper to convert CuratedPackage to database row
function packageToRow(pkg: CuratedPackage): any {
  return {
    id: pkg.id,
    state: pkg.state || "Goa",
    title: pkg.title,
    subtitle: pkg.subtitle || null,
    route: pkg.route || null,
    duration: pkg.duration,
    category_badge: pkg.categoryBadge,
    badge_gradient: pkg.badgeGradient,
    image: pkg.image,
    flyer_image: pkg.flyerImage || null,
    gallery_images: pkg.galleryImages || null,
    original_price: pkg.originalPrice,
    discounted_price: pkg.discountedPrice,
    savings: pkg.savings,
    highlights: pkg.highlights,
    itinerary: pkg.itinerary,
    inclusions: pkg.inclusions,
    detailed_inclusions: pkg.detailedInclusions || null,
    exclusions: pkg.exclusions,
    updated_at: new Date().toISOString(),
  };
}

// GET: Public package retrieval (Supabase with fallback & auto-seed)
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      packages: initialCuratedPackages,
      isSupabaseActive: false,
    });
  }

  try {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase fetch packages error:", error);
      return NextResponse.json({
        packages: initialCuratedPackages,
        isSupabaseActive: false,
      });
    }

    // Auto-seed if database packages table is empty
    if (!data || data.length === 0) {
      const rows = initialCuratedPackages.map(packageToRow);
      // Batch insert initial packages
      await supabase.from("packages").insert(rows);
      return NextResponse.json({
        packages: initialCuratedPackages,
        isSupabaseActive: true,
        seeded: true,
      });
    }

    const packages = data.map(rowToPackage);
    return NextResponse.json({ packages, isSupabaseActive: true });
  } catch (err) {
    console.error("Packages GET error:", err);
    return NextResponse.json({
      packages: initialCuratedPackages,
      isSupabaseActive: false,
    });
  }
}

// POST: Protected admin upsert package
export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  try {
    const pkg: CuratedPackage = await request.json();
    if (!pkg.id || !pkg.title || !pkg.discountedPrice) {
      return NextResponse.json(
        { error: "Package ID, title, and price are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const row = packageToRow(pkg);
      const { error } = await supabase.from("packages").upsert(row);
      if (error) {
        console.error("Supabase upsert package error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error) {
    console.error("Package save error:", error);
    return NextResponse.json(
      { error: "Failed to save package." },
      { status: 500 }
    );
  }
}
