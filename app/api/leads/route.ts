import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// POST: Public submission of customer inquiries
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
      travelDate,
      travellers = [],
      specialRequirements,
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Full name and phone number are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    let savedLeadId = "lead-" + Date.now();

    if (supabase) {
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            type,
            full_name: fullName,
            phone,
            email: email || null,
            destination: destination || null,
            package_name: packageName || null,
            travel_date: travelDate || null,
            travellers: travellers,
            special_requirements: specialRequirements || null,
            status: "new",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert lead error:", error);
      } else if (data) {
        savedLeadId = data.id;
      }
    }

    return NextResponse.json({
      success: true,
      id: savedLeadId,
      message: "Inquiry lead received successfully.",
    });
  } catch (error) {
    console.error("Lead API submission error:", error);
    return NextResponse.json(
      { error: "Failed to process lead inquiry." },
      { status: 500 }
    );
  }
}

// GET: Authenticated admin retrieval of all leads
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ leads: [], isSupabaseActive: false });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch leads error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedLeads = (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email || "",
    destination: row.destination || "",
    packageName: row.package_name || "",
    travelDate: row.travel_date || "",
    travellers: row.travellers || [],
    specialRequirements: row.special_requirements || "",
    status: row.status,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ leads: formattedLeads, isSupabaseActive: true });
}
