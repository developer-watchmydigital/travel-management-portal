import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

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
  if (!id) {
    return NextResponse.json({ error: "Destination ID required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      success: true,
      id,
      isSupabaseActive: false,
      message: "Deleted locally (Supabase unconfigured).",
    });
  }

  try {
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete destination error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id, isSupabaseActive: true });
  } catch (err) {
    console.error("Destination delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete destination." },
      { status: 500 }
    );
  }
}
