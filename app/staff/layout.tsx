import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff — Bookings",
  description: "Staff-only massage bookings dashboard.",
  // Internal tool — keep it out of search results.
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
