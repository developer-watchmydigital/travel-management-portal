import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function PATCH(
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
  const body = await request.json();
  const updateData: any = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.bookingAmount !== undefined) updateData.booking_amount = body.bookingAmount;
  if (body.paymentMode !== undefined) updateData.payment_mode = body.paymentMode;
  if (body.paymentReference !== undefined) updateData.payment_reference = body.paymentReference;
  if (body.bookingDate !== undefined) updateData.booking_date = body.bookingDate;
  if (body.cancellationReason !== undefined) updateData.cancellation_reason = body.cancellationReason;
  if (body.cancelledAt !== undefined) updateData.cancelled_at = body.cancelledAt;
  if (body.refundAmount !== undefined) updateData.refund_amount = body.refundAmount;

  const supabase = getSupabaseServerClient();
  if (supabase && Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  const { id } = params;
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, id });
}
