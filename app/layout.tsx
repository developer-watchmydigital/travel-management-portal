import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "R Travel World | Your Journey, Our Responsibility | Mehsana, Gujarat",
  description:
    "Trusted travel agency founded by Priykant Gupta (formerly Ranjan Services) with 15+ years experience and 25,000+ happy travelers. Domestic & International flights, Goa packages, Kashmir, Himachal, train bookings & customized holidays.",
  keywords: [
    "R Travel World",
    "Priykant Gupta",
    "Ranjan Services Mehsana",
    "Travel Agency Mehsana",
    "Goa Tour Packages",
    "Flight Booking Mehsana",
    "Railway Reservation Mehsana",
    "Domestic Tour Packages Gujarat",
    "International Holidays",
  ],
  authors: [{ name: "Priykant Gupta" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#FF5A3C] selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
