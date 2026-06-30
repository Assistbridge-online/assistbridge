// Helpers for profile photos. Uses randomuser.me adult portrait API
// (deterministic by seed) so the same user always shows the same face.

export function photoFromSeed(seed: number, gender?: "men" | "women"): string {
  const safeGender = gender ?? (seed % 2 === 0 ? "men" : "women");
  return `https://randomuser.me/api/portraits/${safeGender}/${(seed * 17) % 90}.jpg`;
}

export function getClientPhoto(opts: {
  photoUrl?: string | null;
  photoSeed?: number | null;
  name?: string | null;
}): string | null {
  if (opts.photoUrl) return opts.photoUrl;
  if (opts.photoSeed != null) return photoFromSeed(opts.photoSeed);
  return null;
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
