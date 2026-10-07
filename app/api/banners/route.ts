import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { goaCarouselSlides } from "@/lib/initialData";
import { HeroBannerSlide } from "@/lib/types";

function rowToHeroBanner(row: any): HeroBannerSlide {
  return {
    id: row.id,
    packageId: row.packageId || undefined,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    badge: row.badge,
    tag: row.tag,
    price: row.price || undefined,
    buttonText: row.buttonText || undefined,
    buttonLink: row.buttonLink || undefined,
    locationText: row.locationText || undefined,
    availabilityText: row.availabilityText || undefined,
  };
}

export async function GET() {
  if (db) {
    try {
      const dbBanners = await db.select().from(schema.heroBanners).orderBy(schema.heroBanners.orderIndex);
      if (dbBanners && dbBanners.length > 0) {
        return NextResponse.json({ banners: dbBanners.map(rowToHeroBanner), isDbActive: true });
      }

      // Auto-seed default banners
      const rows = goaCarouselSlides.map((slide, idx) => ({
        id: slide.id,
        orderIndex: idx,
        packageId: slide.packageId || null,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        badge: slide.badge,
        tag: slide.tag,
        price: slide.price || null,
        buttonText: slide.buttonText || null,
        buttonLink: slide.buttonLink || null,
        locationText: slide.locationText || null,
        availabilityText: slide.availabilityText || null,
      }));

      await db.insert(schema.heroBanners).values(rows).onConflictDoNothing();
      return NextResponse.json({ banners: goaCarouselSlides, isDbActive: true, seeded: true });
    } catch (err) {
      console.error("Drizzle fetch hero_banners error:", err);
    }
  }

  return NextResponse.json({ banners: goaCarouselSlides, isDbActive: false });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  try {
    const body = await request.json();
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

    if (db) {
      const rows = incomingBanners.map((slide, idx) => ({
        id: slide.id,
        orderIndex: idx,
        packageId: slide.packageId || null,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        badge: slide.badge,
        tag: slide.tag,
        price: slide.price || null,
        buttonText: slide.buttonText || null,
        buttonLink: slide.buttonLink || null,
        locationText: slide.locationText || null,
        availabilityText: slide.availabilityText || null,
        updatedAt: new Date(),
      }));

      for (const row of rows) {
        await db.insert(schema.heroBanners).values(row).onConflictDoUpdate({
          target: schema.heroBanners.id,
          set: row,
        });
      }
    }

    return NextResponse.json({ success: true, banners: incomingBanners });
  } catch (err: any) {
    console.error("Hero banners save error:", err);
    return NextResponse.json({ error: err?.message || "Failed to save hero banner." }, { status: 500 });
  }
}
