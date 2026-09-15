// Edge and Node compatible cryptographic authentication utilities

export const ADMIN_COOKIE_NAME = "admin_session";

// Fallback session secret if not specified in environment
const DEFAULT_SECRET = "c83066f41fd8b0c2c58db286a913f84098da32286f021d5642b90df5059019d2";

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

function textToBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  const uint8 = encoder.encode(str);
  // Slice to guarantee standalone ArrayBuffer
  return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function strToBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToStr(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

// Import CryptoKey for HMAC-SHA256
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    textToBuffer(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Creates a signed JWT session token using HMAC-SHA256
 * Valid for 7 days
 */
export async function createSessionToken(username: string): Promise<string> {
  const secret = getSecretKey();
  const key = await getCryptoKey(secret);

  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedHeader = strToBase64Url(JSON.stringify(header));
  const encodedPayload = strToBase64Url(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    textToBuffer(dataToSign)
  );

  const encodedSignature = uint8ToBase64Url(new Uint8Array(signatureBuffer));
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Cryptographically verifies the session token and checks expiration
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const secret = getSecretKey();
    const key = await getCryptoKey(secret);

    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textToBuffer(dataToVerify)
    );
    const expectedSignature = uint8ToBase64Url(new Uint8Array(expectedSignatureBuffer));

    if (!timingSafeEqual(expectedSignature, encodedSignature)) {
      return null;
    }

    const payloadJson = base64UrlToStr(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// In-Memory Rate Limiting Tracker
interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  // Check if locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Reset window if expired
  if (now - record.firstAttemptTime > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return { allowed: remaining > 0, remainingAttempts: remaining, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(ip: string): { remainingAttempts: number; locked: boolean } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttemptTime > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttemptTime: now });
    return { remainingAttempts: MAX_ATTEMPTS - 1, locked: false };
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    return { remainingAttempts: 0, locked: true };
  }

  return { remainingAttempts: MAX_ATTEMPTS - record.count, locked: false };
}

export function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
