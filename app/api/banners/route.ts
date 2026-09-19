import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { goaCarouselSlides } from "@/lib/initialData";
import { HeroBannerSlide } from "@/lib/types";

// Helper to convert database row to HeroBannerSlide
function rowToHeroBanner(row: any): HeroBannerSlide {
  return {
    id: row.id,
    packageId: row.package_id || undefined,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    badge: row.badge,
    tag: row.tag,
    price: row.price || undefined,
    buttonText: row.button_text || undefined,
    buttonLink: row.button_link || undefined,
    locationText: row.location_text || undefined,
    availabilityText: row.availability_text || undefined,
  };
}

// Helper to convert HeroBannerSlide to database row
function heroBannerToRow(slide: HeroBannerSlide, orderIndex: number): any {
  return {
    id: slide.id,
    order_index: orderIndex,
    package_id: slide.packageId || null,
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    badge: slide.badge,
    tag: slide.tag,
    price: slide.price || null,
    button_text: slide.buttonText || null,
    button_link: slide.buttonLink || null,
    location_text: slide.locationText || null,
    availability_text: slide.availabilityText || null,
    updated_at: new Date().toISOString(),
  };
}

// GET: Public retrieval of hero banners
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      banners: goaCarouselSlides,
      isSupabaseActive: false,
    });
  }

  try {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Supabase fetch hero_banners error:", error);
      return NextResponse.json({
        banners: goaCarouselSlides,
        isSupabaseActive: false,
      });
    }

    if (!data || data.length === 0) {
      // Auto-seed default banners
      const defaultRows = goaCarouselSlides.map((slide, idx) => heroBannerToRow(slide, idx));
      await supabase.from("hero_banners").insert(defaultRows);
      return NextResponse.json({
        banners: goaCarouselSlides,
        isSupabaseActive: true,
        seeded: true,
      });
    }

    return NextResponse.json({
      banners: data.map(rowToHeroBanner),
      isSupabaseActive: true,
    });
  } catch (err) {
    console.error("Hero banners GET error:", err);
    return NextResponse.json({
      banners: goaCarouselSlides,
      isSupabaseActive: false,
    });
  }
}

// POST: Admin update of hero banners (single banner or array of all 4 banners)
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
    const body = await request.json();
    const supabase = getSupabaseServerClient();

    let incomingBanners: HeroBannerSlide[] = [];
    if (Array.isArray(body)) {
      incomingBanners = body;
    } else if (body.banners && Array.isArray(body.banners)) {
      incomingBanners = body.banners;
    } else if (body.id) {
      incomingBanners = [body];
    }

    if (incomingBanners.length === 0) {
      return NextResponse.json({ error: "No valid banner data provided." }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        banners: incomingBanners,
        isSupabaseActive: false,
        message: "Saved locally (Supabase unconfigured).",
      });
    }

    const rows = incomingBanners.map((slide, idx) => heroBannerToRow(slide, idx));
    const { data, error } = await supabase
      .from("hero_banners")
      .upsert(rows, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase upsert hero_banners error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      banners: data ? data.map(rowToHeroBanner) : incomingBanners,
      isSupabaseActive: true,
    });
  } catch (err) {
    console.error("Hero banners save error:", err);
    return NextResponse.json(
      { error: "Failed to save hero banner." },
      { status: 500 }
    );
  }
}
