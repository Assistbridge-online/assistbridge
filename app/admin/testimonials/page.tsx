import { prisma } from "@/lib/db";
import { TestimonialManager } from "@/components/admin/testimonial-manager";


export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Testimonials" };

export default async function AdminTestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Testimonials</h1>
      <p className="mt-1 text-slate-600">Client quotes shown on the home page and about page.</p>
      <div className="mt-8">
        <TestimonialManager items={items as any} />
      </div>
    </>
  );
}
