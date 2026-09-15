import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { destinationsData } from "@/lib/initialData";
import { Destination } from "@/lib/types";

// Helper to convert database row to Destination
function rowToDestination(row: any): Destination {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    category: row.category || "india",
    startingPrice: row.starting_price,
    duration: row.duration,
    image: row.image,
    highlights: row.highlights || [],
    featured: row.featured || false,
  };
}

// Helper to convert Destination to database row
function destinationToRow(dest: Destination): any {
  return {
    id: dest.id,
    name: dest.name,
    tagline: dest.tagline || null,
    category: dest.category || "india",
    starting_price: dest.startingPrice,
    duration: dest.duration,
    image: dest.image,
    highlights: dest.highlights || [],
  };
}

// GET: Public retrieval of destinations
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      destinations: destinationsData,
      isSupabaseActive: false,
    });
  }

  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase fetch destinations error:", error);
      return NextResponse.json({
        destinations: destinationsData,
        isSupabaseActive: false,
      });
    }

    // Auto-seed if table is empty
    if (!data || data.length === 0) {
      const rows = destinationsData.map(destinationToRow);
      await supabase.from("destinations").insert(rows);
      return NextResponse.json({
        destinations: destinationsData,
        isSupabaseActive: true,
        seeded: true,
      });
    }

    const destinations = data.map(rowToDestination);
    return NextResponse.json({ destinations, isSupabaseActive: true });
  } catch (err) {
    console.error("Destinations GET error:", err);
    return NextResponse.json({
      destinations: destinationsData,
      isSupabaseActive: false,
    });
  }
}

// POST: Admin upsert of destination
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
    const body: Destination = await request.json();
    if (!body.name || !body.startingPrice) {
      return NextResponse.json(
        { error: "Destination name and starting price are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        destination: body,
        isSupabaseActive: false,
        message: "Saved locally (Supabase unconfigured).",
      });
    }

    const row = destinationToRow(body);
    const { data, error } = await supabase
      .from("destinations")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert destination error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      destination: data ? rowToDestination(data) : body,
      isSupabaseActive: true,
    });
  } catch (err) {
    console.error("Destination save error:", err);
    return NextResponse.json(
      { error: "Failed to save destination." },
      { status: 500 }
    );
  }
}
