import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { destinationsData } from "@/lib/initialData";
import { Destination } from "@/lib/types";

function rowToDestination(row: any): Destination {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    category: (row.category as "india" | "international") || "india",
    startingPrice: row.startingPrice || row.starting_price,
    duration: row.duration,
    image: row.image,
    highlights: row.highlights || [],
    featured: row.featured || false,
  };
}

export async function GET() {
  if (db) {
    try {
      const dbDests = await db.select().from(schema.destinations);
      if (dbDests && dbDests.length > 0) {
        return NextResponse.json({ destinations: dbDests.map(rowToDestination), isDbActive: true });
      }

      // Auto-seed destinations
      const rows = destinationsData.map((dest) => ({
        id: dest.id,
        name: dest.name,
        tagline: dest.tagline || null,
        category: dest.category || "india",
        startingPrice: dest.startingPrice,
        duration: dest.duration,
        image: dest.image,
        featured: dest.featured || false,
        highlights: dest.highlights || [],
      }));

      await db.insert(schema.destinations).values(rows).onConflictDoNothing();
      return NextResponse.json({ destinations: destinationsData, isDbActive: true, seeded: true });
    } catch (err) {
      console.error("Drizzle fetch destinations error:", err);
    }
  }

  return NextResponse.json({ destinations: destinationsData, isDbActive: false });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  try {
    const body: Destination = await request.json();
    if (!body.name || !body.startingPrice) {
      return NextResponse.json({ error: "Destination name and starting price are required." }, { status: 400 });
    }

    if (db) {
      const row = {
        id: body.id || "dest-" + Date.now(),
        name: body.name,
        tagline: body.tagline || null,
        category: body.category || "india",
        startingPrice: body.startingPrice,
        duration: body.duration,
        image: body.image,
        featured: body.featured || false,
        highlights: body.highlights || [],
      };

      await db.insert(schema.destinations).values(row).onConflictDoUpdate({
        target: schema.destinations.id,
        set: row,
      });
    }

    return NextResponse.json({ success: true, destination: body });
  } catch (err: any) {
    console.error("Destination save error:", err);
    return NextResponse.json({ error: err?.message || "Failed to save destination." }, { status: 500 });
  }
}
