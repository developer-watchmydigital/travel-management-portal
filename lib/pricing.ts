/**
 * Utility functions for Tour Package Durations and Per-Day / Group Pricing Calculations
 */

/**
 * Extracts number of billing stay units (nights count if available, or days count)
 * Matches flyer calculation where "5 Days & 4 Nights" @ 11,396 is 11,396 / 4 = ₹2,849 / Day
 */
export function parseDurationDays(duration: string): number {
  if (!duration) return 1;
  const nightMatch = duration.match(/(\d+)\s*(?:nights?|n)\b/i);
  if (nightMatch && nightMatch[1]) {
    const n = parseInt(nightMatch[1], 10);
    if (n > 0) return n;
  }
  const match = duration.match(/(\d+)\s*(?:days?|d)\b/i);
  if (match && match[1]) {
    const days = parseInt(match[1], 10);
    return days > 0 ? days : 1;
  }
  return 1;
}

/**
 * Calculates per-person per-day price from package total discounted price
 * Example: ("11,396", "5 Days & 4 Nights") -> "2,849"
 */
export function getPerDayPrice(discountedPrice: string, duration: string): string {
  const numericPrice = parseInt((discountedPrice || "0").replace(/[^0-9]/g, ""), 10);
  if (!numericPrice || isNaN(numericPrice)) return "0";
  const days = parseDurationDays(duration);
  const perDay = Math.round(numericPrice / days);
  return perDay.toLocaleString("en-IN");
}

export function getPerDayPriceNumber(discountedPrice: string, duration: string): number {
  const numericPrice = parseInt((discountedPrice || "0").replace(/[^0-9]/g, ""), 10);
  if (!numericPrice || isNaN(numericPrice)) return 0;
  const days = parseDurationDays(duration);
  return Math.round(numericPrice / days);
}

/**
 * Calculates total package price for a given number of travelers
 * Example: ("9,996", 2) -> "19,992"
 */
export function calculateTravelersTotal(discountedPrice: string, travelersCount: number): string {
  const numericPrice = parseInt((discountedPrice || "0").replace(/[^0-9]/g, ""), 10);
  if (!numericPrice || isNaN(numericPrice)) return "0";
  const count = Math.max(1, travelersCount || 1);
  return (numericPrice * count).toLocaleString("en-IN");
}
