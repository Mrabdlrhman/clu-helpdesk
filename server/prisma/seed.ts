import "dotenv/config";
import { auth } from "../src/lib/auth.js";
import { prisma } from "../src/lib/db.js";
import { Role } from "../src/generated/prisma/client.js";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the environment.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN },
      });
      console.log(`Promoted existing user ${email} to ADMIN.`);
    } else {
      console.log(`Admin user ${email} already exists. Skipping.`);
    }
    return;
  }

  await auth.api.signUpEmail({
    body: { email, password, name: "Admin" },
  });

  await prisma.user.update({
    where: { email },
    data: { role: Role.ADMIN, emailVerified: true },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
