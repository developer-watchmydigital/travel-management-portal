/**
 * Utility functions for Tour Package Durations and Per-Day / Group Pricing Calculations
 */

/**
 * Extracts number of days from duration string like "4 Days & 3 Nights", "5 Days / 4 Nights", "3D/2N"
 */
export function parseDurationDays(duration: string): number {
  if (!duration) return 1;
  const match = duration.match(/(\d+)\s*(?:days?|d)/i);
  if (match) {
    const days = parseInt(match[1], 10);
    return days > 0 ? days : 1;
  }
  return 1;
}

/**
 * Calculates per-person per-day price from package total discounted price
 * Example: ("9,996", "4 Days & 3 Nights") -> "2,499"
 */
export function getPerDayPrice(discountedPrice: string, duration: string): string {
  const numericPrice = parseInt((discountedPrice || "0").replace(/[^0-9]/g, ""), 10);
  if (!numericPrice || isNaN(numericPrice)) return "0";
  const days = parseDurationDays(duration);
  const perDay = Math.round(numericPrice / days);
  return perDay.toLocaleString("en-IN");
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
