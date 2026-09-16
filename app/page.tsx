import { Navbar } from "@/components/Navbar";
import { HeroGoaCarousel } from "@/components/HeroGoaCarousel";
import { AboutBentoSection } from "@/components/AboutBentoSection";
import { ServicesBentoSection } from "@/components/ServicesBentoSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { CuratedExperiencesSection } from "@/components/CuratedExperiencesSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { InquirySection } from "@/components/InquirySection";
import { Footer } from "@/components/Footer";
import { MessageCircle, Phone } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#070B18]">
      {/* Navigation */}
      <Navbar />

      {/* 1. Hero Section with 3D Goa Carousel & Plan Journey CTA */}
      <HeroGoaCarousel />

      {/* 2. Curated Experiences - State Itinerary Packages */}
      <CuratedExperiencesSection />

      {/* 3. About Us - Magic Bento Grid (3+ Years Trust & Legacy) */}
      <AboutBentoSection />

      {/* 4. Services & Packages - 3D Hover Magic Bento Cards */}
      <ServicesBentoSection />

      {/* 5. Top Destinations - Explore India / Out of India */}
      <DestinationsSection />

      {/* 6. Why Choose Us & Traveler Reviews */}
      <WhyChooseUs />

      {/* 7. Interactive Booking & Inquiry Hub + WhatsApp Integration */}
      <InquirySection />

      {/* Footer */}
      <Footer />

      {/* Floating Action WhatsApp & Phone Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a
          href="https://wa.me/919588667027?text=Hello%20Watch%20My%20Trip%20Package!%20I%20am%20interested%20in%20planning%20a%20journey."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2 p-3.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] text-white font-bold shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all"
          title="Chat with Watch My Trip Package on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="hidden sm:inline text-xs">WhatsApp Us</span>
        </a>
      </div>
    </main>
  );
}
