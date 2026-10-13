import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tour & Holiday Packages | Watch My Trip Package",
  description: "Browse our complete range of holiday tour packages in Goa and across India.",
  alternates: {
    canonical: "https://travel.watchmydigital.com/#curated",
  },
};

export default function PackagesPage() {
  redirect("/#curated");
}
