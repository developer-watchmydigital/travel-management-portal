import type { Metadata } from "next";
import { initialCuratedPackages } from "@/lib/initialData";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

const baseUrl = "https://travel.watchmydigital.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = initialCuratedPackages.find((p) => p.id === params.id);

  if (!pkg) {
    return {
      title: "Holiday Tour Package Details | Watch My Trip Package",
      description: "Explore curated travel and holiday tour packages with Watch My Trip Package.",
      alternates: {
        canonical: `${baseUrl}/#curated`,
      },
    };
  }

  const title = `${pkg.title} | Watch My Trip Package`;
  const description = `${pkg.subtitle || pkg.title} - ${pkg.duration} holiday in ${pkg.state}. Starting from ₹${pkg.discountedPrice || pkg.originalPrice}. Includes luxury hotel stay, transfers, and sightseeing.`;
  const packageUrl = `${baseUrl}/packages/${pkg.id}`;
  const ogImage = pkg.image || pkg.galleryImages?.[0] || `${baseUrl}/logo.png`;

  return {
    title,
    description,
    alternates: {
      canonical: packageUrl,
    },
    openGraph: {
      title,
      description,
      url: packageUrl,
      siteName: "Watch My Trip Package",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pkg.title,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function PackageLayout({ params, children }: Props) {
  const pkg = initialCuratedPackages.find((p) => p.id === params.id);

  const packageJsonLd = pkg
    ? {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": pkg.title,
        "description": pkg.subtitle || pkg.title,
        "touristType": "Holiday Traveler",
        "offers": {
          "@type": "Offer",
          "price": (pkg.discountedPrice || pkg.originalPrice || "0").replace(/,/g, ""),
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "url": `${baseUrl}/packages/${pkg.id}`,
        },
        "provider": {
          "@type": "TravelAgency",
          "name": "Watch My Trip Package",
          "url": baseUrl,
          "telephone": "+919588667027",
        },
        "itinerary": pkg.itinerary?.map((item) => ({
          "@type": "Day",
          "dayNumber": item.day,
          "name": item.title,
          "description": item.description,
        })),
      }
    : null;

  return (
    <>
      {packageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(packageJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
