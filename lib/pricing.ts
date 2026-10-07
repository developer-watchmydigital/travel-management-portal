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

export function parseDurationNights(duration: string): number {
  if (!duration) return 1;
  const nightMatch = duration.match(/(\d+)\s*(?:nights?|n)\b/i);
  if (nightMatch && nightMatch[1]) {
    const n = parseInt(nightMatch[1], 10);
    if (n > 0) return n;
  }
  const dayMatch = duration.match(/(\d+)\s*(?:days?|d)\b/i);
  if (dayMatch && dayMatch[1]) {
    const days = parseInt(dayMatch[1], 10);
    return Math.max(1, days - 1);
  }
  return 1;
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

export interface ChildDetails {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
}

export interface DetailedPricingResult {
  adultCount: number;
  adultUnitPrice: number;
  adultTotal: number;
  childrenUnder6Count: number;
  childrenUnder6Total: number;
  children7To17Count: number;
  childUnitPrice: number;
  childDeductionPerChild: number;
  children7To17Total: number;
  totalOccupants: number;
  nightsCount: number;
  dailyRoomRent: number;
  totalPackageCost: number;
}

/**
 * Calculates comprehensive tour pricing including Adult fares and Child policy rules:
 * - Age <= 6: Free of cost (₹0)
 * - Age 7-17: Room rent waived (only activity fee charged). Room rent portion per occupant = (dailyRoomRent / totalOccupants) * nights
 * - Age > 17: Handled as Adult (alert shown in UI)
 */
export function calculateDetailedTourPrice(
  discountedPrice: string,
  duration: string,
  adultCount: number,
  children: ChildDetails[],
  dailyRoomRentRate: number = 2000
): DetailedPricingResult {
  const adultUnitPrice = parseInt((discountedPrice || "0").replace(/[^0-9]/g, ""), 10) || 0;
  const nightsCount = parseDurationNights(duration);

  let childrenUnder6Count = 0;
  let children7To17Count = 0;

  children.forEach((c) => {
    if (c.age <= 6) {
      childrenUnder6Count++;
    } else if (c.age >= 7 && c.age <= 17) {
      children7To17Count++;
    }
  });

  const totalOccupants = adultCount + childrenUnder6Count + children7To17Count;
  const adultTotal = adultCount * adultUnitPrice;
  const childrenUnder6Total = 0;

  // Formula: Room rent portion per person per day = dailyRoomRent / totalOccupants
  // Room rent portion per person for total duration = (dailyRoomRent / totalOccupants) * nightsCount
  const roomRentPerPersonTotal = totalOccupants > 0
    ? Math.round((dailyRoomRentRate / totalOccupants) * nightsCount)
    : 0;

  const childDeductionPerChild = roomRentPerPersonTotal;
  const childUnitPrice = Math.max(0, adultUnitPrice - childDeductionPerChild);
  const children7To17Total = children7To17Count * childUnitPrice;

  const totalPackageCost = adultTotal + childrenUnder6Total + children7To17Total;

  return {
    adultCount,
    adultUnitPrice,
    adultTotal,
    childrenUnder6Count,
    childrenUnder6Total,
    children7To17Count,
    childUnitPrice,
    childDeductionPerChild,
    children7To17Total,
    totalOccupants,
    nightsCount,
    dailyRoomRent: dailyRoomRentRate,
    totalPackageCost,
  };
}

