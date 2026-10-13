import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

const siteUrl = "https://travel.watchmydigital.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Watch My Trip Package | Your Journey, Our Responsibility | Holiday & Tour Packages",
    template: "%s | Watch My Trip Package",
  },
  description:
    "Trusted travel agency Watch My Trip Package founded by Masrur Ahmed and led by Director Masum Ahmed (formerly Ranjan Services) with 3+ years experience and 1,000+ happy travelers. Domestic & International flights, Goa packages, Kashmir, Himachal, train bookings & customized holidays.",
  keywords: [
    "Watch My Trip Package",
    "WATCH MY TRIP PACKAGE",
    "Watch My Trip",
    "travel.watchmydigital.com",
    "Masrur Ahmed",
    "Masum Ahmed",
    "Small Daddy Plus",
    "Hotel Small Daddy Plus Calangute",
    "Ranjan Services Mehsana",
    "Travel Agency Mehsana",
    "Goa Tour Packages",
    "Goa Holiday Packages",
    "Goa 4N 5D Package",
    "Goa Dinner Cruise",
    "Goa Catamaran Boat Party",
    "Goa Scuba Diving",
    "Flight Booking Mehsana",
    "Railway Reservation Mehsana",
    "Domestic Tour Packages Gujarat",
    "International Holidays",
    "Kashmir Tour Packages",
    "Himachal Holiday Packages",
    "Kerala Honeymoon Packages",
  ],
  authors: [{ name: "Masrur Ahmed" }, { name: "Masum Ahmed" }],
  creator: "Masum Ahmed",
  publisher: "Watch My Trip Package",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Watch My Trip Package | Holiday & Tour Packages | Your Journey, Our Responsibility",
    description:
      "Book Goa holiday packages, domestic & international trips, flights & train reservations with Watch My Trip Package. 1,000+ happy travelers and 3+ years of trusted service.",
    url: siteUrl,
    siteName: "Watch My Trip Package",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Watch My Trip Package - Your Journey, Our Responsibility",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch My Trip Package | Holiday & Tour Packages",
    description:
      "Book Goa holiday packages, domestic & international trips, flights & train reservations with Watch My Trip Package.",
    images: ["/logo.png"],
    creator: "@watchmytrippackage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.png?v=4", type: "image/png" }],
    shortcut: "/favicon.png?v=4",
    apple: "/apple-icon.png?v=4",
  },
  category: "travel",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const travelAgencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Watch My Trip Package",
    "alternateName": "Watch My Trip",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "image": `${siteUrl}/logo.png`,
    "description":
      "Trusted travel agency offering domestic and international tour packages, Goa vacation packages, flights, and train bookings.",
    "telephone": "+919588667027",
    "email": "support-package@watchmydigital.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Golden Beach Road, Calangute Beach",
      "addressLocality": "Calangute",
      "addressRegion": "Goa",
      "postalCode": "403516",
      "addressCountry": "IN",
    },
    "founder": {
      "@type": "Person",
      "name": "Masrur Ahmed",
    },
    "employee": [
      {
        "@type": "Person",
        "name": "Masum Ahmed",
        "jobTitle": "Director",
      },
    ],
    "sameAs": ["https://www.instagram.com/watchmytrippackage"],
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Credit Card, Debit Card, UPI, Net Banking, Razorpay",
    "areaServed": ["Goa", "Gujarat", "India", "Worldwide"],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Watch My Trip Package",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/#curated`,
      "query-input": "required name=search_term_string",
    },
  };

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencySchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="antialiased selection:bg-[#FF5A3C] selection:text-white">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
