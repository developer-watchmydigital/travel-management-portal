import { NextRequest, NextResponse } from "next/server";
import { servicesData } from "@/lib/initialData";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// In-memory runtime cache for server-side persistence across hot-reloads
let serverServices = [...servicesData];

// GET: Public retrieval of services with showcase photos
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("services").select("*");
      if (!error && data && data.length > 0) {
        const dbMap = new Map(data.map((row: any) => [row.id, row.photos]));
        serverServices = serverServices.map((s) => ({
          ...s,
          photos: dbMap.has(s.id) ? (dbMap.get(s.id) as any) : s.photos,
        }));
      }
    } catch (e) {
      console.warn("Supabase services fetch error:", e);
    }
  }

  return NextResponse.json({
    services: serverServices,
    success: true,
  });
}

// POST: Authenticated admin update of service showcase photos and information
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceId, photos, title, shortDesc, fullDesc } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required." },
        { status: 400 }
      );
    }

    const index = serverServices.findIndex((s) => s.id === serviceId);
    if (index >= 0) {
      serverServices[index] = {
        ...serverServices[index],
        ...(photos ? { photos } : {}),
        ...(title ? { title } : {}),
        ...(shortDesc ? { shortDesc } : {}),
        ...(fullDesc ? { fullDesc } : {}),
      };
    }

    // Persist to Supabase if connected
    const supabase = getSupabaseServerClient();
    if (supabase && photos) {
      try {
        await supabase.from("services").upsert({
          id: serviceId,
          photos,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase services save warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      service: serverServices[index] || null,
      message: "Service updated successfully.",
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service." },
      { status: 500 }
    );
  }
}
