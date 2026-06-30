import { prisma } from "@/lib/db";

export async function getActiveDisciplines() {
  return prisma.discipline.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getDisciplineBySlug(slug: string) {
  return prisma.discipline.findUnique({ where: { slug } });
}

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { discipline: true },
  });
}

export async function getFeaturedServices() {
  return prisma.service.findMany({
    where: { active: true, featured: true },
    orderBy: { order: "asc" },
    include: { discipline: true },
  });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: { discipline: true },
  });
}

export async function getActivePricingTiers() {
  return prisma.pricingTier.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getActiveAcademicLevels() {
  return prisma.academicLevel.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getAcademicLevelBySlug(slug: string) {
  return prisma.academicLevel.findUnique({ where: { slug } });
}

export async function getServicePricesForLevel(serviceId: string, academicLevelId: string) {
  return prisma.serviceAcademicPrice.findUnique({
    where: { serviceId_academicLevelId: { serviceId, academicLevelId } },
  });
}

export async function getServicePrices(serviceId: string) {
  return prisma.serviceAcademicPrice.findMany({
    where: { serviceId, active: true },
    include: { academicLevel: true },
    orderBy: { academicLevel: { order: "asc" } },
  });
}

export async function getAllServicePrices() {
  return prisma.serviceAcademicPrice.findMany({
    where: { active: true },
    include: { academicLevel: true, service: true },
  });
}

export async function getActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getActiveTeamMembers() {
  return prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getActiveFaqs() {
  return prisma.faq.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
}

export async function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getSiteStats() {
  const rows = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  return rows;
}

export async function getPricingConfig() {
  return prisma.pricingConfig.upsert({
    where: { singleton: "singleton" },
    update: {},
    create: { singleton: "singleton" },
  });
}

// Subjects from the database (drives the price calculator)
export async function getActiveSubjects() {
  return prisma.subject.findMany({
    where: { active: true },
    orderBy: [{ levelSlug: "asc" }, { order: "asc" }],
  });
}

export async function getSubjectsByLevelSlug(levelSlug: string) {
  return prisma.subject.findMany({
    where: { active: true, levelSlug },
    orderBy: { order: "asc" },
  });
}

export async function searchSubjects(query: string, levelSlug?: string) {
  const q = query.trim();
  return prisma.subject.findMany({
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
  });
}
