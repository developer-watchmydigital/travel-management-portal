import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  timingSafeEqual,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Admin ID and Password are required." },
        { status: 400 }
      );
    }

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "GoaTravel@2026Secure!";

    const isUsernameMatch = timingSafeEqual(username.trim(), expectedUsername);
    const isPasswordMatch = timingSafeEqual(password, expectedPassword);

    if (!isUsernameMatch || !isPasswordMatch) {
      const attemptInfo = recordFailedAttempt(ip);
      return NextResponse.json(
        {
          error: "Invalid Admin ID or Password.",
          remainingAttempts: attemptInfo.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Success - Reset rate limit tracker
    resetRateLimit(ip);

    // Create tamper-proof session token
    const token = await createSessionToken(username);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      username,
    });

    // Set HTTP-Only, Secure, SameSite=Strict cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal authentication error." },
      { status: 500 }
    );
  }
}
