import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const p = new PrismaClient();
  const email = "admin@assistbridge.online";
  const password = "gEwvwX5kWMGxJpTu";

  try {
    const user = await p.user.findUnique({ where: { email } });
    console.log(
      "found user:",
      user
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
            hasHash: !!user.hashedPassword,
            len: user.hashedPassword?.length,
            hashStart: user.hashedPassword?.slice(0, 7),
          }
        : null,
    );
    if (user?.hashedPassword) {
      const ok = await bcrypt.compare(password, user.hashedPassword);
      console.log("bcrypt.compare(correct):", ok);
      const bad = await bcrypt.compare("wrong-password", user.hashedPassword);
      console.log("bcrypt.compare(wrong):", bad);
    }
  } catch (e) {
    console.error("DB error:", (e as Error).message);
    console.error((e as Error).stack);
  } finally {
    await p.$disconnect();
  }
}

main();