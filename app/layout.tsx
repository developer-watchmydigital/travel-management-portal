import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watch My Trip Package | Your Journey, Our Responsibility | Holiday & Tour Packages",
  description:
    "Trusted travel agency Watch My Trip Package founded by Masrur Ahmed and led by Director Masum Ahmed (formerly Ranjan Services) with 3+ years experience and 25,000+ happy travelers. Domestic & International flights, Goa packages, Kashmir, Himachal, train bookings & customized holidays.",
  keywords: [
    "Watch My Trip Package",
    "WATCH MY TRIP PACKAGE",
    "Watch My Trip",
    "Masrur Ahmed",
    "Masum Ahmed",
    "Small Daddy Plus",
    "Ranjan Services Mehsana",
    "Travel Agency Mehsana",
    "Goa Tour Packages",
    "Flight Booking Mehsana",
    "Railway Reservation Mehsana",
    "Domestic Tour Packages Gujarat",
    "International Holidays",
  ],
  authors: [{ name: "Masrur Ahmed" }, { name: "Masum Ahmed" }],
  icons: {
    icon: [
      { url: "/favicon.png?v=4", type: "image/png" },
    ],
    shortcut: "/favicon.png?v=4",
    apple: "/apple-icon.png?v=4",
  },
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
        <link rel="icon" href="/favicon.png?v=4" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=4" />
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
