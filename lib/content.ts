import { prisma } from "@/lib/db";

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getActiveDisciplines() {
  return safeQuery(
    () =>
      prisma.discipline.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    []
  );
}

export async function getDisciplineBySlug(slug: string) {
  return safeQuery(
    () => prisma.discipline.findUnique({ where: { slug } }),
    null
  );
}

export async function getActiveServices() {
  return safeQuery(
    () =>
      prisma.service.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
        include: { discipline: true },
      }),
    []
  );
}

export async function getFeaturedServices() {
  return safeQuery(
    () =>
      prisma.service.findMany({
        where: { active: true, featured: true },
        orderBy: { order: "asc" },
        include: { discipline: true },
      }),
    []
  );
}

export async function getServiceBySlug(slug: string) {
  return safeQuery(
    () =>
      prisma.service.findUnique({
        where: { slug },
        include: { discipline: true },
      }),
    null
  );
}

export async function getActivePricingTiers() {
  return safeQuery(
    () =>
      prisma.pricingTier.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    []
  );
}

export async function getActiveAcademicLevels() {
  return safeQuery(
    () =>
      prisma.academicLevel.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    []
  );
}

export async function getAcademicLevelBySlug(slug: string) {
  return safeQuery(
    () => prisma.academicLevel.findUnique({ where: { slug } }),
    null
  );
}

export async function getServicePricesForLevel(serviceId: string, academicLevelId: string) {
  return safeQuery(
    () =>
      prisma.serviceAcademicPrice.findUnique({
        where: { serviceId_academicLevelId: { serviceId, academicLevelId } },
      }),
    null
  );
}

export async function getServicePrices(serviceId: string) {
  return safeQuery(
    () =>
      prisma.serviceAcademicPrice.findMany({
        where: { serviceId, active: true },
        include: { academicLevel: true },
        orderBy: { academicLevel: { order: "asc" } },
      }),
    []
  );
}

export async function getAllServicePrices() {
  return safeQuery(
    () =>
      prisma.serviceAcademicPrice.findMany({
        where: { active: true },
        include: { academicLevel: true, service: true },
      }),
    []
  );
}

export async function getActiveTestimonials() {
  return safeQuery(
    () =>
      prisma.testimonial.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    []
  );
}

export async function getActiveTeamMembers() {
  return safeQuery(
    () =>
      prisma.teamMember.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    []
  );
}

export async function getActiveFaqs() {
  return safeQuery(
    () =>
      prisma.faq.findMany({
        where: { active: true },
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
    []
  );
}

export async function getPublishedPosts() {
  return safeQuery(
    () =>
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
      }),
    []
  );
}

export async function getPostBySlug(slug: string) {
  return safeQuery(
    () => prisma.blogPost.findUnique({ where: { slug } }),
    null
  );
}

export async function getSiteStats() {
  return safeQuery(
    () => prisma.siteStat.findMany({ orderBy: { order: "asc" } }),
    []
  );
}

export async function getPricingConfig() {
  return safeQuery(
    () =>
      prisma.pricingConfig.upsert({
        where: { singleton: "singleton" },
        update: {},
        create: { singleton: "singleton" },
      }),
    null
  );
}

export async function getActiveSubjects() {
  return safeQuery(
    () =>
      prisma.subject.findMany({
        where: { active: true },
        orderBy: [{ levelSlug: "asc" }, { order: "asc" }],
      }),
    []
  );
}

export async function getSubjectsByLevelSlug(levelSlug: string) {
  return safeQuery(
    () =>
      prisma.subject.findMany({
        where: { active: true, levelSlug },
        orderBy: { order: "asc" },
      }),
    []
  );
}

export async function searchSubjects(query: string, levelSlug?: string) {
  const q = query.trim();
  return safeQuery(
    () =>
      prisma.subject.findMany({
        where: {
          active: true,
          ...(levelSlug ? { levelSlug } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q } },
                  { department: { contains: q } },
                  { courseCode: { contains: q } },
                ],
              }
            : {}),
        },
        orderBy: [{ levelSlug: "asc" }, { order: "asc" }],
        take: 50,
      }),
    []
  );
}
