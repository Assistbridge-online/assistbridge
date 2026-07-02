// Smoke test: verify the freshly-provisioned admin can be authenticated
// by the same path that /api/auth uses (Prisma lookup + bcrypt compare).
// Run with `npx tsx scripts/verify-admin.ts <email> <password>`.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , emailArg, passwordArg] = process.argv;
  const email = (emailArg ?? "admin@assistbridge.online").toLowerCase();
  const password = passwordArg ?? process.env.ADMIN_PASSWORD ?? "";

  if (!password) {
    console.error("Usage: tsx scripts/verify-admin.ts <email> <password>");
    process.exit(2);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`✗ No user with email ${email}`);
    process.exit(1);
  }
  console.log(`✓ User exists: id=${user.id} role=${user.role} name=${user.name}`);

  if (!user.hashedPassword) {
    console.error("✗ User has no hashedPassword set — credentials login will fail.");
    process.exit(1);
  }

  const ok = await bcrypt.compare(password, user.hashedPassword);
  if (!ok) {
    console.error("✗ Password mismatch");
    process.exit(1);
  }
  console.log("✓ Password matches hash — credentials login will succeed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });