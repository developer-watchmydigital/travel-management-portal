import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { initialGoaReviews } from "@/lib/initialData";
import { Review } from "@/lib/types";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

let inMemoryReviews: Review[] = [...initialGoaReviews];

function rowToReview(row: any): Review {
  return {
    id: row.id,
    name: row.name,
    location: row.location || "Verified Traveler",
    rating: Number(row.rating) || 5,
    experience: row.experience || "Excellent",
    category: row.category === "hotel" ? "hotel" : "package",
    targetName: row.targetName || row.target_name || "Goa Tour Package",
    comment: row.comment,
    createdAt: row.createdAt || new Date().toISOString().slice(0, 10),
    verified: row.verified ?? true,
  };
}

export async function GET() {
  if (db) {
    try {
      const dbReviews = await db.select().from(schema.reviews);
      if (dbReviews && dbReviews.length > 0) {
        return NextResponse.json({ reviews: dbReviews.map(rowToReview), source: "database" });
      }
    } catch (err) {
      console.warn("Drizzle reviews fetch error:", err);
    }
  }

  return NextResponse.json({ reviews: inMemoryReviews, source: "fallback" });
}

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
      return NextResponse.json({ error: "Your name is required." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Review comment is required." }, { status: 400 });
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

    if (db) {
      try {
        await db.insert(schema.reviews).values({
          id: newReview.id,
          name: newReview.name,
          location: newReview.location,
          rating: newReview.rating,
          experience: newReview.experience,
          category: newReview.category,
          targetName: newReview.targetName,
          comment: newReview.comment,
          createdAt: newReview.createdAt,
          verified: newReview.verified,
        });
      } catch (err) {
        console.warn("Drizzle insert review error:", err);
      }
    }

    inMemoryReviews = [newReview, ...inMemoryReviews];
    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to process review submission." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID parameter 'id' is required." }, { status: 400 });
    }

    if (db) {
      try {
        await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
      } catch (err) {
        console.error("Drizzle delete review error:", err);
      }
    }

    inMemoryReviews = inMemoryReviews.filter((r) => r.id !== id);
    return NextResponse.json({ success: true, id, message: "Review deleted successfully." });
  } catch (error: any) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete review." }, { status: 500 });
  }
}
