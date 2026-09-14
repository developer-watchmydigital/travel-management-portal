import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watch My Trip Package Goa | Your Journey, Our Responsibility | Goa Tour Packages",
  description:
    "Trusted travel agency Watch My Trip Package Goa founded by Masrur Ahmed and led by Director Masum Ahmed (formerly Ranjan Services) with 15+ years experience and 25,000+ happy travelers. Domestic & International flights, Goa packages, Kashmir, Himachal, train bookings & customized holidays.",
  keywords: [
    "Watch My Trip Package Goa",
    "WATCH MY TRIP PACKAGE GOA",
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
      { url: "/favicon.png", type: "image/png" },
      { url: "/ChatGPT_Image_Sep_14__2026__05_29_04_PM-removebg-preview.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
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
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
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
