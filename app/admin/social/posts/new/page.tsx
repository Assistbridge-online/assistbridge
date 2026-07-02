import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Composer } from "@/components/social/composer";
import type { SocialPlatform } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Social · New post" };

export default async function NewSocialPostPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; sourceId?: string; title?: string; body?: string; link?: string; imageUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/social/posts/new");

  const accounts = await prisma.socialAccount.findMany({
    orderBy: [{ platform: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      platform: true,
      externalName: true,
      accountLabel: true,
    },
  });

  const params = await searchParams;
  return (
    <Composer
      accounts={accounts.map((a) => ({
        id: a.id,
        platform: a.platform as SocialPlatform,
        label: a.externalName || a.accountLabel,
      }))}
      prefill={{
        sourceType: params.source ?? "CUSTOM",
        sourceId: params.sourceId,
        title: params.title ?? "",
        body: params.body ?? "",
        link: params.link ?? "",
        imageUrl: params.imageUrl ?? "",
      }}
    />
  );
}