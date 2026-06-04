import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@blocknest.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update role ke ADMIN kalau sudah ada
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log(`User ${email} sudah ada, role diupdate ke ADMIN`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "Admin BlockNest",
      role: "ADMIN",
    },
  });

  console.log("Admin berhasil dibuat:");
  console.log(`  Email   : ${admin.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role    : ${admin.role}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
