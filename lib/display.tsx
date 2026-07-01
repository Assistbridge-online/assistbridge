import {
  Microscope, Stethoscope, Briefcase, Code2, PenLine, Award, Sparkles,
  Users, Calculator, Globe, Wrench, HelpCircle,
  FlaskConical, Cpu, Shield, Rocket, Brain, Pill, Heart, Leaf, Diamond, Atom,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Microscope, Stethoscope, Briefcase, Code2, PenLine, Award, Sparkles,
  Users, Calculator, Globe, Wrench,
  FlaskConical, Cpu, Shield, Rocket, Brain, Pill, Heart, Leaf, Diamond, Atom,
};

export function DisciplineIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  if (!name) return <HelpCircle className={className} />;
  const Cmp = ICONS[name] ?? HelpCircle;
  return <Cmp className={className} />;
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Microscope, PenLine, Calculator, Wrench, Code2, Briefcase, Sparkles, Users, Globe, Award,
};

export function ServiceIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  if (!name) return <Sparkles className={className} />;
  const Cmp = SERVICE_ICONS[name] ?? Sparkles;
  return <Cmp className={className} />;
}

export function splitPipes(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split("|").map((s) => s.trim()).filter(Boolean);
}

export function disciplineSlug(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}
