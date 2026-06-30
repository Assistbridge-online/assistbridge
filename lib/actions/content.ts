"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function upsertService(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const data = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: String(formData.get("description") || ""),
    shortDescription: String(formData.get("shortDescription") || "") || null,
    category: String(formData.get("category") || ""),
    icon: String(formData.get("icon") || "Sparkles"),
    pricePerPage: parseFloat(String(formData.get("pricePerPage") || "0")),
    minPages: parseInt(String(formData.get("minPages") || "1"), 10),
    maxPages: formData.get("maxPages") ? parseInt(String(formData.get("maxPages")), 10) : null,
    pageUnit: String(formData.get("pageUnit") || "page"),
    wordsPerPage: parseInt(String(formData.get("wordsPerPage") || "250"), 10),
    turnaroundDays: parseInt(String(formData.get("turnaroundDays") || "7"), 10),
    deliverables: String(formData.get("deliverables") || "") || null,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    order: parseInt(String(formData.get("order") || "0"), 10),
    disciplineId: (formData.get("disciplineId") as string) || null,
  };
  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data: data as any });
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function upsertPricingTier(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const data = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    blurb: String(formData.get("blurb") || ""),
    pricePerPage: formData.get("pricePerPage") ? parseFloat(String(formData.get("pricePerPage"))) : null,
    minPages: parseInt(String(formData.get("minPages") || "1"), 10),
    includedPages: formData.get("includedPages") ? parseInt(String(formData.get("includedPages")), 10) : null,
    flatPrice: formData.get("flatPrice") ? parseFloat(String(formData.get("flatPrice"))) : null,
    features: String(formData.get("features") || ""),
    ctaLabel: String(formData.get("ctaLabel") || "Get started"),
    ctaHref: String(formData.get("ctaHref") || "/dashboard/new"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    order: parseInt(String(formData.get("order") || "0"), 10),
  };
  if (id) {
    await prisma.pricingTier.update({ where: { id }, data: data as any });
  } else {
    await prisma.pricingTier.create({ data: data as any });
  }
  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}

export async function deletePricingTier(id: string) {
  await prisma.pricingTier.delete({ where: { id } });
  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}

export async function upsertTestimonial(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const data = {
    name: String(formData.get("name") || ""),
    role: String(formData.get("role") || ""),
    country: String(formData.get("country") || "") || null,
    quote: String(formData.get("quote") || ""),
    rating: parseInt(String(formData.get("rating") || "5"), 10),
    avatarSeed: formData.get("avatarSeed") ? parseInt(String(formData.get("avatarSeed")), 10) : null,
    order: parseInt(String(formData.get("order") || "0"), 10),
    active: formData.get("active") === "on",
  };
  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
  } else {
    await prisma.testimonial.create({ data });
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function upsertTeamMember(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const data = {
    name: String(formData.get("name") || ""),
    role: String(formData.get("role") || ""),
    bio: String(formData.get("bio") || ""),
    avatarSeed: formData.get("avatarSeed") ? parseInt(String(formData.get("avatarSeed")), 10) : null,
    order: parseInt(String(formData.get("order") || "0"), 10),
    active: formData.get("active") === "on",
  };
  if (id) {
    await prisma.teamMember.update({ where: { id }, data });
  } else {
    await prisma.teamMember.create({ data });
  }
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

export async function upsertFaq(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const data = {
    question: String(formData.get("question") || ""),
    answer: String(formData.get("answer") || ""),
    category: String(formData.get("category") || "General"),
    order: parseInt(String(formData.get("order") || "0"), 10),
    active: formData.get("active") === "on",
  };
  if (id) {
    await prisma.faq.update({ where: { id }, data });
  } else {
    await prisma.faq.create({ data });
  }
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function deleteFaq(id: string) {
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function upsertBlogPost(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const published = formData.get("published") === "on";
  const data = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || ""),
    body: String(formData.get("body") || ""),
    category: String(formData.get("category") || "General"),
    image: String(formData.get("image") || "") || null,
    readTime: String(formData.get("readTime") || "5 min"),
    published,
    publishedAt: published ? new Date() : null,
  };
  if (id) {
    await prisma.blogPost.update({ where: { id }, data });
  } else {
    await prisma.blogPost.create({ data });
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function upsertDiscipline(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const name = String(formData.get("name") || "");
  const slug = String(formData.get("slug") || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const data = {
    name,
    slug,
    description: String(formData.get("description") || ""),
    longDescription: String(formData.get("longDescription") || "") || null,
    icon: String(formData.get("icon") || "Microscope") || null,
    tools: String(formData.get("tools") || "") || null,
    servicesList: String(formData.get("servicesList") || "") || null,
    order: parseInt(String(formData.get("order") || "0"), 10),
    active: formData.get("active") === "on",
  };
  if (id) {
    await prisma.discipline.update({ where: { id }, data });
  } else {
    await prisma.discipline.create({ data });
  }
  revalidatePath("/admin/disciplines");
  revalidatePath("/disciplines");
  revalidatePath("/");
}

export async function deleteDiscipline(id: string) {
  await prisma.discipline.delete({ where: { id } });
  revalidatePath("/admin/disciplines");
  revalidatePath("/disciplines");
  revalidatePath("/");
}

export async function updateSiteStat(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const data = {
    label: String(formData.get("label") || "").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    value: String(formData.get("value") || ""),
    order: parseInt(String(formData.get("order") || "0"), 10),
  };
  if (id) {
    await prisma.siteStat.update({ where: { id }, data });
  } else {
    await prisma.siteStat.create({ data });
  }
  revalidatePath("/admin/stats");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function deleteSiteStat(id: string) {
  await prisma.siteStat.delete({ where: { id } });
  revalidatePath("/admin/stats");
  revalidatePath("/");
  revalidatePath("/about");
}

export async function updatePricingConfig(formData: FormData) {
  const data = {
    pageUnitLabel: String(formData.get("pageUnitLabel") || "page"),
    wordsPerPage: parseInt(String(formData.get("wordsPerPage") || "250"), 10),
    platformFeePercent: parseFloat(String(formData.get("platformFeePercent") || "15")),
    rushDeliveryDays: parseInt(String(formData.get("rushDeliveryDays") || "3"), 10),
    rushMultiplier: parseFloat(String(formData.get("rushMultiplier") || "1.5")),
    studentDiscountPercent: parseFloat(String(formData.get("studentDiscountPercent") || "10")),
    nonProfitDiscountPercent: parseFloat(String(formData.get("nonProfitDiscountPercent") || "10")),
  };
  await prisma.pricingConfig.upsert({
    where: { singleton: "singleton" },
    update: data,
    create: { ...data, singleton: "singleton" },
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}
