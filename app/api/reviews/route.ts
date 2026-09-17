import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { initialGoaReviews } from "@/lib/initialData";
import { Review } from "@/lib/types";

// In-memory reviews store as fallback
let inMemoryReviews: Review[] = [...initialGoaReviews];

function rowToReview(row: any): Review {
  return {
    id: row.id,
    name: row.name,
    location: row.location || "Verified Traveler",
    rating: Number(row.rating) || 5,
    experience: row.experience || "Excellent",
    category: row.category === "hotel" ? "hotel" : "package",
    targetName: row.target_name || "Goa Tour Package",
    comment: row.comment,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    verified: row.verified ?? true,
  };
}

function reviewToRow(rev: Review): any {
  return {
    id: rev.id,
    name: rev.name,
    location: rev.location,
    rating: rev.rating,
    experience: rev.experience,
    category: rev.category,
    target_name: rev.targetName,
    comment: rev.comment,
    verified: rev.verified ?? true,
    created_at: new Date().toISOString(),
  };
}

// GET: Retrieve all reviews
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          reviews: data.map(rowToReview),
          source: "database",
        });
      }
    }
  } catch (err) {
    console.warn("Could not query Supabase reviews table, using fallback:", err);
  }

  return NextResponse.json({
    reviews: inMemoryReviews,
    source: "fallback",
  });
}

// POST: Submit a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      location = "Goa Traveler",
      rating = 5,
      experience = "Excellent",
      category = "package",
      targetName = "Goa Holiday Package",
      comment,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Your name is required." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { error: "Review comment is required." },
        { status: 400 }
      );
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || "Goa Traveler",
      rating: numericRating,
      experience: experience || "Excellent",
      category: category === "hotel" ? "hotel" : "package",
      targetName: targetName.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      verified: true,
    };

    // Try inserting into Supabase
    try {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const { error } = await supabase
          .from("reviews")
          .insert([reviewToRow(newReview)]);

        if (error) {
          console.warn("Supabase review insert failed, using memory:", error.message);
        }
      }
    } catch (e) {
      console.warn("Supabase review insert error:", e);
    }

    // Always keep in-memory up to date
    inMemoryReviews = [newReview, ...inMemoryReviews];

    return NextResponse.json({
      success: true,
      review: newReview,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process review submission." },
      { status: 500 }
    );
  }
}
