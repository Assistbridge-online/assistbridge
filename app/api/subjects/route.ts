import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ACADEMIC_SUBJECTS,
  searchAcademicSubjects,
  getSubjectsByLevel,
  type AcademicSubject,
  type AcademicLevelSlug,
} from "@/lib/academic-catalog";
import { LEVEL_MULTIPLIERS } from "@/lib/subjects";

export const dynamic = "force-dynamic";

interface AcademicSubjectWithServices extends AcademicSubject {
  suggestedServices: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    pricePerPage: number;
    minPages: number;
    pageUnit: string;
  }>;
  basePriceMultiplier: number;
}

// GET /api/subjects
// Query params:
//   - q: search query (matches subject name, department, course code, description)
//   - level: filter by academic level slug
//   - department: filter by department name
//   - institution: filter by institution name
// Returns subjects grouped by level, with institution context and related services.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const levelFilter = searchParams.get("level")?.trim() ?? "";
    const departmentFilter = searchParams.get("department")?.trim().toLowerCase() ?? "";
    const institutionFilter = searchParams.get("institution")?.trim().toLowerCase() ?? "";

    const levels = await prisma.academicLevel.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    const services = await prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        pricePerPage: true,
        minPages: true,
        pageUnit: true,
      },
      orderBy: { name: "asc" },
    });

    // Filter the academic catalog
    let subjects: AcademicSubject[];
    if (q || levelFilter) {
      subjects = searchAcademicSubjects(q, levelFilter || undefined);
    } else {
      const grouped = getSubjectsByLevel();
      const firstKey = Object.keys(grouped)[0] as AcademicLevelSlug;
      subjects = grouped[firstKey] ?? [];
    }
    if (departmentFilter) {
      subjects = subjects.filter((s) => s.department.toLowerCase().includes(departmentFilter));
    }
    if (institutionFilter) {
      subjects = subjects.filter((s) =>
        s.institutions.some((i) => i.name.toLowerCase().includes(institutionFilter))
      );
    }

    // Group by level
    const grouped: Record<string, { level: { slug: string; name: string; order: number }; subjects: AcademicSubjectWithServices[] }> = {};
    for (const s of subjects) {
      const lvl = levels.find((l) => l.slug === s.level);
      if (!lvl) continue;
      if (!grouped[s.level]) {
        grouped[s.level] = {
          level: { slug: lvl.slug, name: lvl.name, order: lvl.order },
          subjects: [],
        };
      }
      const subjectWord = s.name.toLowerCase().split(/[\s/(),]+/)[0];
      grouped[s.level].subjects.push({
        ...s,
        suggestedServices: services
          .filter((svc) => subjectWord && svc.name.toLowerCase().includes(subjectWord))
          .slice(0, 5),
        basePriceMultiplier: LEVEL_MULTIPLIERS[s.level] ?? 1.0,
      });
    }

    const result = Object.values(grouped).sort((a, b) => a.level.order - b.level.order);

    return NextResponse.json({
      total: subjects.length,
      query: q,
      level: levelFilter,
      department: departmentFilter,
      institution: institutionFilter,
      totalAvailable: ACADEMIC_SUBJECTS.length,
      levels: result,
    });
  } catch (error) {
    console.error("[api/subjects]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
