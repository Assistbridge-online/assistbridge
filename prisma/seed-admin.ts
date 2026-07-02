import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Production-safe admin provisioning.
 *
 * Idempotent. Creates (or updates the password of) an admin account so
 * the operator can log in to /admin and see live activity.
 *
 *   npm run admin:provision
 *
 * Credentials can be overridden via env vars so they're easy to rotate
 * without editing the source:
 *
 *   ADMIN_EMAIL   defaults to admin@assistbridge.online
 *   ADMIN_PASSWORD defaults to a fresh random 16-char string, printed
 *                   once at the end. Prefer overriding in CI.
 *   ADMIN_NAME    defaults to "AssistBridge Admin"
 *
 * No destructive operations: this script does NOT touch any other rows
 * and does NOT reset the database. Safe to re-run.
 */

const prisma = new PrismaClient();

function randomPassword(): string {
  const alphabet =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
  let out = "";
  for (let i = 0; i < 16; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@assistbridge.online").toLowerCase();
  const name = process.env.ADMIN_NAME ?? "AssistBridge Admin";
  // Always overwrite the password when run interactively — that's the
  // whole point of the script (rotate the operator's password). The
  // caller can pin ADMIN_PASSWORD to a known value if they want to
  // keep the same one across runs.
  const password = process.env.ADMIN_PASSWORD ?? randomPassword();

  console.log(`Provisioning admin: ${email}`);
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        hashedPassword: hashed,
        role: "ADMIN",
        name,
        emailVerified: new Date(),
      },
    });
    console.log(`✓ Updated existing user (id=${existing.id}) → role=ADMIN, password rotated.`);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        name,
        role: "ADMIN",
        hashedPassword: hashed,
        emailVerified: new Date(),
      },
    });
    console.log(`✓ Created new admin user (id=${created.id}).`);
  }

  console.log("\n============================================");
  console.log(`  Admin email:    ${email}`);
  console.log(`  Admin password: ${password}`);
  console.log("============================================\n");
  console.log("Log in at /login with the credentials above.");
  console.log("Rotate the password by re-running with ADMIN_PASSWORD=...\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });