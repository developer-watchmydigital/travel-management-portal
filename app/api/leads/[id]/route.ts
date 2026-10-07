import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const updateData: any = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.bookingAmount !== undefined) updateData.bookingAmount = body.bookingAmount;
  if (body.paymentMode !== undefined) updateData.paymentMode = body.paymentMode;
  if (body.paymentReference !== undefined) updateData.paymentReference = body.paymentReference;
  if (body.bookingDate !== undefined) updateData.bookingDate = body.bookingDate;
  if (body.cancellationReason !== undefined) updateData.cancellationReason = body.cancellationReason;
  if (body.cancelledAt !== undefined) updateData.cancelledAt = body.cancelledAt;
  if (body.refundAmount !== undefined) updateData.refundAmount = body.refundAmount;

  if (db && id && Object.keys(updateData).length > 0) {
    try {
      await db.update(schema.leads).set(updateData).where(eq(schema.leads.id, id));
    } catch (err) {
      console.error("Drizzle update lead error:", err);
    }
  }

  return NextResponse.json({ success: true, id, ...updateData });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
  }

  const { id } = params;
  if (db && id) {
    try {
      await db.delete(schema.leads).where(eq(schema.leads.id, id));
    } catch (err) {
      console.error("Drizzle delete lead error:", err);
    }
  }

  return NextResponse.json({ success: true, id });
}
