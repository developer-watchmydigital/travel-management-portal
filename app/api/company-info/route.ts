import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { companyData } from "@/lib/initialData";
import { CompanyInfo } from "@/lib/types";
import { eq } from "drizzle-orm";

function rowToCompanyInfo(row: any): CompanyInfo {
  return {
    name: row.name || companyData.name,
    tagline: row.tagline || companyData.tagline,
    founder: row.founder || companyData.founder,
    director: row.director || companyData.director,
    experienceYears: row.experienceYears || row.experience_years || companyData.experienceYears,
    satisfiedCustomers: row.satisfiedCustomers || row.satisfied_customers || companyData.satisfiedCustomers,
    formerName: row.formerName || row.former_name || companyData.formerName,
    address: row.address || companyData.address,
    phones: row.phones || companyData.phones,
    whatsapp: row.whatsapp || "919588667027",
    emails: row.emails || companyData.emails,
    instagram: row.instagram || companyData.instagram,
  };
}

export async function GET() {
  if (db) {
    try {
      const dbRows = await db.select().from(schema.companyInfo).where(eq(schema.companyInfo.id, "default"));
      if (dbRows && dbRows.length > 0) {
        return NextResponse.json({ companyInfo: rowToCompanyInfo(dbRows[0]), isDbActive: true });
      }

      // Auto-seed company info
      const defaultRow = {
        id: "default",
        name: companyData.name,
        tagline: companyData.tagline,
        founder: companyData.founder,
        director: companyData.director,
        experienceYears: companyData.experienceYears,
        satisfiedCustomers: companyData.satisfiedCustomers,
        formerName: companyData.formerName,
        address: companyData.address,
        phones: companyData.phones,
        whatsapp: companyData.whatsapp || "919588667027",
        emails: companyData.emails,
        instagram: companyData.instagram,
      };

      await db.insert(schema.companyInfo).values(defaultRow).onConflictDoNothing();
      return NextResponse.json({ companyInfo: companyData, isDbActive: true, seeded: true });
    } catch (err) {
      console.error("Drizzle fetch company_info error:", err);
    }
  }

  return NextResponse.json({ companyInfo: companyData, isDbActive: false });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  try {
    const body: CompanyInfo = await request.json();
    if (db) {
      const row = {
        id: "default",
        name: body.name,
        tagline: body.tagline || null,
        founder: body.founder || null,
        director: body.director || null,
        experienceYears: body.experienceYears || null,
        satisfiedCustomers: body.satisfiedCustomers || null,
        formerName: body.formerName || null,
        address: body.address || null,
        phones: body.phones || null,
        whatsapp: body.whatsapp || "919588667027",
        emails: body.emails || null,
        instagram: body.instagram || null,
        updatedAt: new Date(),
      };

      await db.insert(schema.companyInfo).values(row).onConflictDoUpdate({
        target: schema.companyInfo.id,
        set: row,
      });
    }

    return NextResponse.json({ success: true, companyInfo: body });
  } catch (err: any) {
    console.error("Company info save error:", err);
    return NextResponse.json({ error: err?.message || "Failed to save company settings." }, { status: 500 });
  }
}
