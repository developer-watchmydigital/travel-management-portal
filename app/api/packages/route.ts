import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { initialCuratedPackages } from "@/lib/initialData";
import { CuratedPackage } from "@/lib/types";

function rowToPackage(row: any): CuratedPackage {
  return {
    id: row.id,
    state: row.state,
    title: row.title,
    subtitle: row.subtitle || "",
    route: row.route || "",
    duration: row.duration,
    categoryBadge: row.categoryBadge || "Holiday Tour",
    badgeGradient: row.badgeGradient || "from-pink-500 to-rose-500",
    image: row.image,
    flyerImage: row.flyerImage || undefined,
    galleryImages: row.galleryImages || undefined,
    originalPrice: row.originalPrice,
    discountedPrice: row.discountedPrice,
    savings: row.savings || undefined,
    highlights: row.highlights || [],
    itinerary: row.itinerary || [],
    inclusions: row.inclusions || [],
    detailedInclusions: row.detailedInclusions || undefined,
    exclusions: row.exclusions || [],
  };
}

export async function GET() {
  if (db) {
    try {
      const dbPackages = await db.select().from(schema.packages);
      if (dbPackages && dbPackages.length > 0) {
        return NextResponse.json({ packages: dbPackages.map(rowToPackage), isDbActive: true });
      }

      // Auto-seed initial packages into PostgreSQL
      const rows = initialCuratedPackages.map((p) => ({
        id: p.id,
        state: p.state || "Goa",
        title: p.title,
        subtitle: p.subtitle || null,
        route: p.route || null,
        duration: p.duration,
        categoryBadge: p.categoryBadge,
        badgeGradient: p.badgeGradient,
        image: p.image,
        flyerImage: p.flyerImage || null,
        galleryImages: p.galleryImages || null,
        originalPrice: p.originalPrice,
        discountedPrice: p.discountedPrice,
        savings: p.savings || null,
        highlights: p.highlights,
        itinerary: p.itinerary,
        inclusions: p.inclusions,
        detailedInclusions: p.detailedInclusions || null,
        exclusions: p.exclusions,
      }));

      await db.insert(schema.packages).values(rows).onConflictDoNothing();
      return NextResponse.json({ packages: initialCuratedPackages, isDbActive: true, seeded: true });
    } catch (err) {
      console.error("Drizzle fetch packages error:", err);
    }
  }

  return NextResponse.json({ packages: initialCuratedPackages, isDbActive: false });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  try {
    const pkg: CuratedPackage = await request.json();
    if (!pkg.id || !pkg.title || !pkg.discountedPrice) {
      return NextResponse.json({ error: "Package ID, title, and price are required." }, { status: 400 });
    }

    if (db) {
      const row = {
        id: pkg.id,
        state: pkg.state || "Goa",
        title: pkg.title,
        subtitle: pkg.subtitle || null,
        route: pkg.route || null,
        duration: pkg.duration,
        categoryBadge: pkg.categoryBadge,
        badgeGradient: pkg.badgeGradient,
        image: pkg.image,
        flyerImage: pkg.flyerImage || null,
        galleryImages: pkg.galleryImages || null,
        originalPrice: pkg.originalPrice,
        discountedPrice: pkg.discountedPrice,
        savings: pkg.savings || null,
        highlights: pkg.highlights,
        itinerary: pkg.itinerary,
        inclusions: pkg.inclusions,
        detailedInclusions: pkg.detailedInclusions || null,
        exclusions: pkg.exclusions,
        updatedAt: new Date(),
      };

      await db.insert(schema.packages).values(row).onConflictDoUpdate({
        target: schema.packages.id,
        set: row,
      });
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    console.error("Package save error:", error);
    return NextResponse.json({ error: error?.message || "Failed to save package." }, { status: 500 });
  }
}
