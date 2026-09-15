import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { companyData } from "@/lib/initialData";
import { CompanyInfo } from "@/lib/types";

// Helper to convert database row to CompanyInfo
function rowToCompanyInfo(row: any): CompanyInfo {
  return {
    name: row.name || companyData.name,
    tagline: row.tagline || companyData.tagline,
    founder: row.founder || companyData.founder,
    director: row.director || companyData.director,
    experienceYears: row.experience_years || companyData.experienceYears,
    satisfiedCustomers: row.satisfied_customers || companyData.satisfiedCustomers,
    formerName: row.former_name || companyData.formerName,
    address: row.address || companyData.address,
    phones: row.phones || companyData.phones,
    whatsapp: row.whatsapp || "919588667027",
    emails: row.emails || companyData.emails,
    instagram: row.instagram || companyData.instagram,
  };
}

// Helper to convert CompanyInfo to database row
function companyInfoToRow(info: CompanyInfo): any {
  return {
    id: "default",
    name: info.name,
    tagline: info.tagline,
    founder: info.founder,
    director: info.director,
    experience_years: info.experienceYears,
    satisfied_customers: info.satisfiedCustomers,
    former_name: info.formerName,
    address: info.address,
    phones: info.phones,
    whatsapp: info.whatsapp || "919588667027",
    emails: info.emails,
    instagram: info.instagram,
    updated_at: new Date().toISOString(),
  };
}

// GET: Public retrieval of company info
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      companyInfo: companyData,
      isSupabaseActive: false,
    });
  }

  try {
    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      console.error("Supabase fetch company_info error:", error);
      return NextResponse.json({
        companyInfo: companyData,
        isSupabaseActive: false,
      });
    }

    if (!data) {
      // Auto-seed default company info row
      const defaultRow = companyInfoToRow(companyData);
      await supabase.from("company_info").insert([defaultRow]);
      return NextResponse.json({
        companyInfo: companyData,
        isSupabaseActive: true,
        seeded: true,
      });
    }

    return NextResponse.json({
      companyInfo: rowToCompanyInfo(data),
      isSupabaseActive: true,
    });
  } catch (err) {
    console.error("Company info GET error:", err);
    return NextResponse.json({
      companyInfo: companyData,
      isSupabaseActive: false,
    });
  }
}

// POST: Admin update of company info
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
    const body: CompanyInfo = await request.json();
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        companyInfo: body,
        isSupabaseActive: false,
        message: "Saved locally (Supabase unconfigured).",
      });
    }

    const row = companyInfoToRow(body);
    const { data, error } = await supabase
      .from("company_info")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert company_info error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      companyInfo: data ? rowToCompanyInfo(data) : body,
      isSupabaseActive: true,
    });
  } catch (err) {
    console.error("Company info save error:", err);
    return NextResponse.json(
      { error: "Failed to save company settings." },
      { status: 500 }
    );
  }
}
