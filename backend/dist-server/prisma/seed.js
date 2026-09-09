import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
    const email = process.env.MASTER_EMAIL ?? "master@neuroflux.local";
    const password = process.env.MASTER_PASSWORD ?? "TroqueEstaSenha123";
    await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name: "Administrador Master", email, role: Role.MASTER, passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Conta master disponível em ${email}`);
}
main().finally(() => prisma.$disconnect());
