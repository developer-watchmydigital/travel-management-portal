import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  const { id } = params;
  if (db && id) {
    try {
      await db.delete(schema.packages).where(eq(schema.packages.id, id));
    } catch (err) {
      console.error("Drizzle delete package error:", err);
    }
  }

  return NextResponse.json({ success: true, id });
}
