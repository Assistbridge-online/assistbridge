import { BecomeAnExpertPageClient } from "./become-expert-client";

export const metadata = {
  title: "Become an Expert",
  description: "Join AssistBridge's network of vetted experts. Set your own rates, choose projects, and work on your terms.",
};

export default function BecomeAnExpertPage() {
  return <BecomeAnExpertPageClient />;
}
