import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = "package",
      fullName,
      phone,
      email,
      destination,
      packageName,
      serviceName,
      flightType,
      trainClass,
      travelDate,
      travellers = [],
      specialRequirements,
      serviceDetails,
      bookingAmount,
      paymentMode,
      paymentReference,
      bookingDate,
      status = "New",
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Full name and phone number are required." }, { status: 400 });
    }

    let formattedRequirements = specialRequirements || "";
    if (serviceDetails && typeof serviceDetails === "object" && Object.keys(serviceDetails).length > 0) {
      const detailsList = Object.entries(serviceDetails)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join(" | ");
      if (formattedRequirements) {
        if (!formattedRequirements.includes("•")) {
          formattedRequirements = `${detailsList} | Notes: ${formattedRequirements}`;
        }
      } else {
        formattedRequirements = detailsList;
      }
    }

    const resolvedPackageName = packageName || (serviceName ? `${serviceName} Enquiry` : null);
    const leadId = body.id || "lead-" + Date.now();

    if (db) {
      try {
        await db.insert(schema.leads).values({
          id: leadId,
          type,
          fullName,
          phone,
          email: email || null,
          destination: destination || null,
          packageName: resolvedPackageName,
          flightType: flightType || null,
          trainClass: trainClass || null,
          serviceName: serviceName || null,
          travelDate: travelDate || null,
          travellers: travellers,
          specialRequirements: formattedRequirements || null,
          status,
          bookingAmount: bookingAmount ? Number(bookingAmount) : null,
          paymentMode: paymentMode || null,
          paymentReference: paymentReference || null,
          bookingDate: bookingDate || null,
          serviceDetails: serviceDetails || null,
        }).onConflictDoUpdate({
          target: schema.leads.id,
          set: {
            status,
            bookingAmount: bookingAmount ? Number(bookingAmount) : null,
            paymentMode: paymentMode || null,
            paymentReference: paymentReference || null,
            serviceDetails: serviceDetails || null,
          },
        });
      } catch (err) {
        console.error("Drizzle insert lead error:", err);
      }
    }

    return NextResponse.json({ success: true, id: leadId, message: "Inquiry lead received successfully." });
  } catch (error: any) {
    console.error("Lead API submission error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process lead inquiry." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  if (db) {
    try {
      const dbLeads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
      return NextResponse.json({ leads: dbLeads, isDbActive: true });
    } catch (err) {
      console.error("Drizzle fetch leads error:", err);
    }
  }

  return NextResponse.json({ leads: [], isDbActive: false });
}
