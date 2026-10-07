import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { servicesData } from "@/lib/initialData";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

let serverServices = [...servicesData];

export async function GET() {
  if (db) {
    try {
      const dbServices = await db.select().from(schema.services);
      if (dbServices && dbServices.length > 0) {
        const dbMap = new Map(dbServices.map((row) => [row.id, row.photos]));
        serverServices = serverServices.map((s) => ({
          ...s,
          photos: dbMap.has(s.id) ? (dbMap.get(s.id) as any) : s.photos,
        }));
      }
    } catch (e) {
      console.warn("Drizzle services fetch error:", e);
    }
  }

  return NextResponse.json({ services: serverServices, success: true });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, photos, title, shortDesc, fullDesc } = body;

    if (!serviceId) {
      return NextResponse.json({ error: "serviceId is required." }, { status: 400 });
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

    if (db) {
      const targetService = serverServices.find((s) => s.id === serviceId);
      if (targetService) {
        await db.insert(schema.services).values({
          id: serviceId,
          title: targetService.title,
          shortDesc: targetService.shortDesc,
          fullDesc: targetService.fullDesc,
          iconName: targetService.iconName,
          badge: targetService.badge,
          image: targetService.image,
          photos: targetService.photos || null,
        }).onConflictDoUpdate({
          target: schema.services.id,
          set: {
            photos: targetService.photos || null,
            title: targetService.title,
            shortDesc: targetService.shortDesc,
            fullDesc: targetService.fullDesc,
          },
        });
      }
    }

    return NextResponse.json({ success: true, service: serverServices[index] || null, message: "Service updated successfully." });
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: error?.message || "Failed to update service." }, { status: 500 });
  }
}
