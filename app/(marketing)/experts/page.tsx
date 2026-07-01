import { ExpertsPageClient } from "./experts-client";

export const metadata = {
  title: "Browse Experts",
  description: "Browse 250+ vetted experts across every discipline. Compare profiles, ratings, and pricing.",
};

export default function ExpertsPage() {
  return <ExpertsPageClient />;
}
