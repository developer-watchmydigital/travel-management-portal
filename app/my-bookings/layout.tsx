import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings & Trip Tickets | Watch My Trip Package",
  description: "View and manage your confirmed travel bookings, itinerary details, and trip tickets with Watch My Trip Package.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function MyBookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
